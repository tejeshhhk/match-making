import { describe, expect, it, vi } from "vitest";
import {
  checkLoginRateLimit,
  clearLoginAttempts,
  clearSuccessfulLoginAttempts,
  cleanupExpiredLoginAttempts,
  getLoginScopes,
  getProgressiveCooldown,
  getTrustedClientIp,
  normalizeLoginEmail,
  normalizeClientIp,
  recordLoginFailure,
} from "./login-rate-limit";

class MemoryLoginAttemptStore {
  constructor() {
    this.states = new Map();
  }

  async read(scope) {
    return this.states.get(scope) || null;
  }

  async reserveFailure(scope, now) {
    const previous = this.states.get(scope);
    let attempts = previous?.attempts || 0;
    const expired = previous?.windowStartedAt &&
      now.getTime() - new Date(previous.windowStartedAt).getTime() >= 24 * 60 * 60 * 1000;
    if (expired) attempts = 0;
    attempts += 1;
    const cooldown = getProgressiveCooldown(attempts);
    const state = {
      scope,
      attempts,
      windowStartedAt: expired ? now : (previous?.windowStartedAt || now),
      blockedUntil: cooldown ? new Date(now.getTime() + cooldown) : null,
    };
    this.states.set(scope, state);
    return state;
  }

  async clear(scopes) {
    scopes.forEach((scope) => this.states.delete(scope));
  }

  async clearSuccessful(scopes, resetAt) {
    scopes.filter(Boolean).forEach((scope) => {
      const state = this.states.get(scope);
      if (state && new Date(state.updatedAt || state.windowStartedAt) < resetAt) {
        this.states.delete(scope);
      }
    });
  }

  async cleanupExpired(now, limit) {
    const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    let deleted = 0;
    for (const [scope, state] of this.states) {
      if (deleted >= limit) break;
      const activeCooldown = state.blockedUntil &&
        new Date(state.blockedUntil) > now;
      if (!activeCooldown &&
          new Date(state.windowStartedAt) < cutoff) {
        this.states.delete(scope);
        deleted += 1;
      }
    }
    return deleted;
  }
}

describe("login rate limiting", () => {
  it("normalizes email and client IP scopes", () => {
    expect(normalizeLoginEmail("  USER@Example.COM ")).toBe("user@example.com");
    expect(normalizeClientIp(" 203.0.113.10, 10.0.0.1")).toBe("203.0.113.10");
    expect(getLoginScopes(" User@Example.com ", "203.0.113.10")).toEqual([
      "email:user@example.com",
      "ip:203.0.113.10",
      "pair:203.0.113.10|user@example.com",
    ]);
  });

  it("does not create shared unknown-IP or unknown-pair scopes", () => {
    expect(getLoginScopes("one@example.com", "unknown")).toEqual([
      "email:one@example.com",
    ]);
    expect(getLoginScopes("two@example.com", "not-an-ip")).toEqual([
      "email:two@example.com",
    ]);
  });

  it("uses only Vercel-authoritative IP headers and rejects malformed or spoofed headers", () => {
    vi.stubEnv("VERCEL", "1");
    expect(getTrustedClientIp(new Headers({
      "x-vercel-id": "test",
      "x-vercel-forwarded-for": "203.0.113.10",
      "x-forwarded-for": "198.51.100.20",
    }))).toBe("203.0.113.10");

    expect(getTrustedClientIp(new Headers({
      "x-forwarded-for": "198.51.100.20",
      "cf-connecting-ip": "192.0.2.10",
    }))).toBe("unknown");

    expect(getTrustedClientIp(new Headers({
      "x-vercel-forwarded-for": "not-an-ip",
    }))).toBe("unknown");

    expect(getTrustedClientIp(new Headers({
      "x-vercel-id": "test",
      "x-forwarded-for": "203.0.113.11, 198.51.100.20",
    }))).toBe("203.0.113.11");
  });

  it("returns unknown IP outside Vercel even if forwarding headers are present", () => {
    vi.stubEnv("VERCEL", "0");
    expect(getTrustedClientIp(new Headers({
      "x-vercel-id": "test",
      "x-vercel-forwarded-for": "203.0.113.10",
      "x-forwarded-for": "198.51.100.20",
      "x-real-ip": "192.0.2.10",
      "cf-connecting-ip": "192.0.2.11",
    }))).toBe("unknown");
  });

  it("uses progressive cooldown thresholds", () => {
    expect(getProgressiveCooldown(4)).toBe(0);
    expect(getProgressiveCooldown(5)).toBe(60 * 1000);
    expect(getProgressiveCooldown(10)).toBe(5 * 60 * 1000);
    expect(getProgressiveCooldown(15)).toBe(15 * 60 * 1000);
    expect(getProgressiveCooldown(20)).toBe(60 * 60 * 1000);
  });

  it("blocks repeated incorrect attempts and expires the cooldown", async () => {
    const store = new MemoryLoginAttemptStore();
    const start = new Date("2026-11-19T10:00:00Z");

    for (let attempt = 0; attempt < 5; attempt += 1) {
      await recordLoginFailure({
        email: "user@example.com",
        ip: "203.0.113.10",
        store,
        now: start,
      });
    }

    expect(await checkLoginRateLimit({
      email: "USER@EXAMPLE.COM",
      ip: "203.0.113.10",
      store,
      now: new Date("2026-11-19T10:00:30Z"),
    })).toMatchObject({ blocked: true });

    expect(await checkLoginRateLimit({
      email: "USER@EXAMPLE.COM",
      ip: "203.0.113.10",
      store,
      now: new Date("2026-11-19T10:01:01Z"),
    })).toEqual({ blocked: false, retryAfterSeconds: 0 });
  });

  it("handles concurrent failures with an atomic in-store counter", async () => {
    const store = new MemoryLoginAttemptStore();
    const now = new Date("2026-11-19T11:00:00Z");

    await Promise.all(
      Array.from({ length: 8 }, () =>
        recordLoginFailure({
          email: "concurrent@example.com",
          ip: "198.51.100.20",
          store,
          now,
        }),
      ),
    );

    expect((await store.read("email:concurrent@example.com")).attempts).toBe(8);
  });

  it("separates different IP addresses while retaining email protection", async () => {
    const store = new MemoryLoginAttemptStore();
    const now = new Date("2026-11-19T12:00:00Z");

    await recordLoginFailure({
      email: "user@example.com",
      ip: "192.0.2.1",
      store,
      now,
    });
    await recordLoginFailure({
      email: "user@example.com",
      ip: "192.0.2.2",
      store,
      now,
    });

    expect(await store.read("ip:192.0.2.1")).toBeTruthy();
    expect(await store.read("ip:192.0.2.2")).toBeTruthy();
    expect((await store.read("email:user@example.com")).attempts).toBe(2);
  });

  it("clears failure counters after successful login", async () => {
    const store = new MemoryLoginAttemptStore();
    const now = new Date("2026-11-19T13:00:00Z");

    await recordLoginFailure({
      email: "success@example.com",
      ip: "203.0.113.50",
      store,
      now,
    });
    await clearLoginAttempts({
      email: "SUCCESS@example.com",
      ip: "203.0.113.50",
      store,
    });

    expect(await store.read("email:success@example.com")).toBeNull();
  });

  it("clears email and pair counters but preserves IP evidence after success", async () => {
    vi.stubEnv("VERCEL", "1");
    const store = new MemoryLoginAttemptStore();
    const now = new Date("2026-11-19T13:00:00Z");
    await recordLoginFailure({
      email: "victim@example.com",
      ip: "203.0.113.50",
      store,
      now,
    });
    await clearSuccessfulLoginAttempts({
      email: "victim@example.com",
      ip: "203.0.113.50",
      store,
    });

    expect(await store.read("email:victim@example.com")).toBeNull();
    expect(await store.read("pair:203.0.113.50|victim@example.com")).toBeNull();
    expect(await store.read("ip:203.0.113.50")).toBeTruthy();
  });

  it("cleans expired records in bounded batches and preserves active cooldowns", async () => {
    const store = new MemoryLoginAttemptStore();
    const now = new Date("2026-11-19T14:00:00Z");
    store.states.set("expired", {
      scope: "expired",
      attempts: 2,
      windowStartedAt: new Date("2026-11-17T00:00:00Z"),
      blockedUntil: null,
    });
    store.states.set("cooldown", {
      scope: "cooldown",
      attempts: 5,
      windowStartedAt: new Date("2026-11-17T00:00:00Z"),
      blockedUntil: new Date("2026-11-19T14:10:00Z"),
    });

    expect(await cleanupExpiredLoginAttempts({
      store,
      now,
      limit: 500,
    })).toBe(1);
    expect(await store.read("expired")).toBeNull();
    expect(await store.read("cooldown")).toBeTruthy();
  });

  it("preserves a row recreated after cleanup and does not reset concurrent failures", async () => {
    const store = new MemoryLoginAttemptStore();
    const now = new Date("2026-11-19T14:00:00Z");
    expect(await store.cleanupExpired(now, 500)).toBe(0);
    await store.reserveFailure("email:raced@example.com", now);
    expect((await store.read("email:raced@example.com")).attempts).toBe(1);
  });

  it("does not erase a failure updated after the successful-login reset boundary", async () => {
    const store = new MemoryLoginAttemptStore();
    const resetAt = new Date("2026-11-19T14:00:00Z");
    store.states.set("email:raced@example.com", {
      scope: "email:raced@example.com",
      attempts: 1,
      windowStartedAt: new Date("2026-11-19T14:00:30Z"),
      updatedAt: new Date("2026-11-19T14:00:30Z"),
      blockedUntil: null,
    });
    await store.clearSuccessful(
      ["email:raced@example.com", "pair:203.0.113.10|raced@example.com"],
      resetAt,
    );
    expect((await store.read("email:raced@example.com")).attempts).toBe(1);
  });

  it("allows login after a successful login following cooldown expiry", async () => {
    const store = new MemoryLoginAttemptStore();
    const now = new Date("2026-11-19T14:00:00Z");
    for (let attempt = 0; attempt < 5; attempt += 1) {
      await recordLoginFailure({
        email: "cooldown@example.com",
        ip: "203.0.113.60",
        store,
        now,
      });
    }
    await clearLoginAttempts({
      email: "cooldown@example.com",
      ip: "203.0.113.60",
      store,
    });
    expect(await checkLoginRateLimit({
      email: "cooldown@example.com",
      ip: "203.0.113.60",
      store,
      now: new Date("2026-11-19T14:01:01Z"),
    })).toEqual({ blocked: false, retryAfterSeconds: 0 });
  });
});
