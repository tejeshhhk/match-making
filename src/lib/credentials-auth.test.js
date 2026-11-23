import { beforeEach, describe, expect, it, vi } from "vitest";
import { authorizeCredentialLogin } from "./credentials-auth";

class MemoryStore {
  constructor() {
    this.states = new Map();
  }

  async read(scope) {
    return this.states.get(scope) || null;
  }

  async reserveFailure(scope, now) {
    const previous = this.states.get(scope);
    const attempts = (previous?.attempts || 0) + 1;
    const state = {
      scope,
      attempts,
      windowStartedAt: previous?.windowStartedAt || now,
      blockedUntil: attempts >= 5
        ? new Date(now.getTime() + 60 * 1000)
        : null,
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
      const inactive = !state.blockedUntil ||
        new Date(state.blockedUntil) <= now;
      if (inactive && new Date(state.windowStartedAt) < cutoff) {
        this.states.delete(scope);
        deleted += 1;
      }
    }
    return deleted;
  }
}

describe("credentials authorize rate limiting", () => {
  beforeEach(() => {
    vi.stubEnv("VERCEL", "1");
  });

  it("does not trust spoofed forwarding headers without a Vercel marker", async () => {
    vi.stubEnv("VERCEL", "0");
    const store = new MemoryStore();
    const now = new Date("2026-11-19T12:00:00Z");

    await authorizeCredentialLogin({
      credentials: { email: "user@example.com", password: "wrong" },
      request: { headers: new Headers({
        "x-forwarded-for": "203.0.113.200",
        "cf-connecting-ip": "198.51.100.200",
      }) },
      findUser: async () => ({
        id: "user-1",
        email: "user@example.com",
        name: "Test",
        passwordHash: "$2b$12$hash",
      }),
      verifyPassword: async () => false,
      store,
      now,
    });

    expect(store.states.has("ip:unknown")).toBe(false);
    expect(store.states.has("ip:203.0.113.200")).toBe(false);
    expect(store.states.has("ip:198.51.100.200")).toBe(false);
  });

  it("records malformed and missing IP values under the unknown scope", async () => {
    const store = new MemoryStore();
    const now = new Date("2026-11-19T12:00:00Z");

    await authorizeCredentialLogin({
      credentials: { email: "user@example.com", password: "wrong" },
      request: { headers: new Headers({
        "x-vercel-forwarded-for": "not-an-ip",
      }) },
      findUser: async () => ({
        id: "user-1",
        email: "user@example.com",
        name: "Test",
        passwordHash: "$2b$12$hash",
      }),
      verifyPassword: async () => false,
      store,
      now,
    });

    expect(store.states.has("ip:unknown")).toBe(false);
  });
  it("blocks before user lookup or bcrypt for an active cooldown", async () => {
    const store = new MemoryStore();
    const now = new Date("2026-11-19T12:00:00Z");
    store.states.set("email:user@example.com", {
      scope: "email:user@example.com",
      attempts: 5,
      windowStartedAt: now,
      blockedUntil: new Date(now.getTime() + 60 * 1000),
    });
    let lookedUp = false;
    let verified = false;

    const result = await authorizeCredentialLogin({
      credentials: { email: "USER@example.com", password: "password123" },
      request: { headers: new Headers({
        "x-vercel-id": "test",
        "x-vercel-forwarded-for": "203.0.113.10",
      }) },
      findUser: async () => {
        lookedUp = true;
        return null;
      },
      verifyPassword: async () => {
        verified = true;
        return true;
      },
      store,
      now,
    });

    expect(result).toBeNull();
    expect(lookedUp).toBe(false);
    expect(verified).toBe(false);
  });

  it("records email, IP and pair scopes on a wrong password", async () => {
    const store = new MemoryStore();
    const now = new Date("2026-11-19T12:00:00Z");

    const result = await authorizeCredentialLogin({
      credentials: { email: "user@example.com", password: "wrong-password" },
      request: { headers: new Headers({
        "x-vercel-id": "test",
        "x-vercel-forwarded-for": "203.0.113.10",
      }) },
      findUser: async () => ({
        id: "user-1",
        email: "user@example.com",
        name: "Test User",
        passwordHash: "$2b$12$hash",
      }),
      verifyPassword: async () => false,
      store,
      now,
    });

    expect(result).toBeNull();
    expect(store.states.has("email:user@example.com")).toBe(true);
    expect(store.states.has("ip:203.0.113.10")).toBe(true);
    expect(store.states.has("pair:203.0.113.10|user@example.com")).toBe(true);
  });

  it("clears email and pair scopes but preserves IP attack evidence on success", async () => {
    const store = new MemoryStore();
    const now = new Date("2026-11-19T12:00:00Z");
    store.states.set("email:user@example.com", {
      scope: "email:user@example.com",
      attempts: 3,
      windowStartedAt: now,
      blockedUntil: null,
    });
    store.states.set("ip:203.0.113.10", {
      scope: "ip:203.0.113.10",
      attempts: 8,
      windowStartedAt: now,
      blockedUntil: null,
    });
    store.states.set("pair:203.0.113.10|user@example.com", {
      scope: "pair:203.0.113.10|user@example.com",
      attempts: 3,
      windowStartedAt: now,
      blockedUntil: null,
    });

    const result = await authorizeCredentialLogin({
      credentials: { email: "user@example.com", password: "correct-password" },
      request: { headers: new Headers({
        "x-vercel-id": "test",
        "x-vercel-forwarded-for": "203.0.113.10",
      }) },
      findUser: async () => ({
        id: "user-1",
        email: "user@example.com",
        name: "Test User",
        passwordHash: "$2b$12$hash",
      }),
      verifyPassword: async () => true,
      store,
      now,
    });

    expect(result.id).toBe("user-1");
    expect(store.states.has("email:user@example.com")).toBe(false);
    expect(store.states.has("pair:203.0.113.10|user@example.com")).toBe(false);
    expect(store.states.has("ip:203.0.113.10")).toBe(true);
  });

  it("fails closed on database/store or verification errors", async () => {
    const store = new MemoryStore();
    store.read = async () => {
      throw new Error("database unavailable");
    };

    const result = await authorizeCredentialLogin({
      credentials: { email: "user@example.com", password: "password123" },
      request: { headers: new Headers() },
      findUser: async () => null,
      verifyPassword: async () => true,
      store,
      now: new Date("2026-11-19T12:00:00Z"),
    });

    expect(result).toBeNull();
  });

  it("keeps IP evidence during concurrent wrong-password and success races", async () => {
    const store = new MemoryStore();
    const now = new Date("2026-11-19T12:00:00Z");
    const request = { headers: new Headers({
      "x-vercel-id": "test",
      "x-vercel-forwarded-for": "203.0.113.10",
    }) };
    const user = {
      id: "user-1",
      email: "user@example.com",
      name: "Test User",
      passwordHash: "$2b$12$hash",
    };

    await Promise.all([
      authorizeCredentialLogin({
        credentials: { email: "user@example.com", password: "wrong" },
        request,
        findUser: async () => user,
        verifyPassword: async () => false,
        store,
        now,
      }),
      authorizeCredentialLogin({
        credentials: { email: "user@example.com", password: "correct" },
        request,
        findUser: async () => user,
        verifyPassword: async () => true,
        store,
        now,
      }),
    ]);

    expect(store.states.has("ip:203.0.113.10")).toBe(true);
  });
});
