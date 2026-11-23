import { randomUUID } from "node:crypto";
import { isIP } from "node:net";
import { prisma } from "@/lib/prisma";

const WINDOW_MS = 24 * 60 * 60 * 1000;

export function normalizeLoginEmail(email) {
  return String(email || "").trim().toLowerCase();
}

export function normalizeClientIp(ip) {
  let normalized = String(ip || "").trim().toLowerCase();
  if (!normalized) return "unknown";
  if (normalized.includes(",")) normalized = normalized.split(",")[0].trim();
  if (normalized.startsWith("[") && normalized.endsWith("]")) {
    normalized = normalized.slice(1, -1);
  }
  normalized = normalized.replace(/%.*/, "");
  if (isIP(normalized) === 0) return "unknown";
  return normalized.slice(0, 128);
}

export function getTrustedClientIp(headers) {
  if (process.env.VERCEL !== "1" || !headers) return "unknown";
  const hasVercelContext = Boolean(headers.get("x-vercel-id"));
  if (!hasVercelContext) return "unknown";

  const vercelForwardedFor = headers.get("x-vercel-forwarded-for");
  if (vercelForwardedFor) {
    const ip = normalizeClientIp(vercelForwardedFor);
    if (ip !== "unknown") return ip;
  }

  // Vercel sanitizes this header under the standard deployment context.
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    const ip = normalizeClientIp(forwardedFor);
    if (ip !== "unknown") return ip;
  }

  return "unknown";
}

export function getProgressiveCooldown(attempts) {
  if (attempts >= 20) return 60 * 60 * 1000;
  if (attempts >= 15) return 15 * 60 * 1000;
  if (attempts >= 10) return 5 * 60 * 1000;
  if (attempts >= 5) return 60 * 1000;
  return 0;
}

export function getLoginScopes(email, ip) {
  const normalizedEmail = normalizeLoginEmail(email);
  const normalizedIp = normalizeClientIp(ip);
  const scopes = [`email:${normalizedEmail}`];
  if (normalizedIp !== "unknown") {
    scopes.push(
      `ip:${normalizedIp}`,
      `pair:${normalizedIp}|${normalizedEmail}`,
    );
  }
  return scopes;
}

export function getBlockedResult(states, now = new Date()) {
  const blocked = states
    .filter((state) => state?.blockedUntil)
    .map((state) => ({
      state,
      retryAt: new Date(state.blockedUntil),
    }))
    .filter(({ retryAt }) => retryAt > now)
    .sort((a, b) => b.retryAt - a.retryAt)[0];

  return blocked
    ? { blocked: true, retryAfterSeconds: Math.max(1, Math.ceil((blocked.retryAt - now) / 1000)) }
    : { blocked: false, retryAfterSeconds: 0 };
}

export class PrismaLoginAttemptStore {
  async read(scope) {
    const rows = await prisma.$queryRaw`
      SELECT "scope", "attempts", "windowStartedAt", "blockedUntil"
      FROM "LoginAttempt"
      WHERE "scope" = ${scope}
      LIMIT 1
    `;
    return rows[0] || null;
  }

  async reserveFailure(scope, now = new Date()) {
    return prisma.$transaction(async (tx) => {
      await tx.$executeRaw`
        INSERT INTO "LoginAttempt"
          ("id", "scope", "attempts", "windowStartedAt", "blockedUntil", "updatedAt")
        VALUES (${randomUUID()}, ${scope}, 0, ${now}, NULL, ${now})
        ON CONFLICT ("scope") DO NOTHING
      `;

      let rows = await tx.$queryRaw`
        SELECT "scope", "attempts", "windowStartedAt", "blockedUntil"
        FROM "LoginAttempt"
        WHERE "scope" = ${scope}
        FOR UPDATE
      `;
      let state = rows[0];
      if (!state) {
        await tx.$executeRaw`
          INSERT INTO "LoginAttempt"
            ("id", "scope", "attempts", "windowStartedAt", "blockedUntil", "updatedAt")
          VALUES (${randomUUID()}, ${scope}, 0, ${now}, NULL, ${now})
          ON CONFLICT ("scope") DO NOTHING
        `;
        rows = await tx.$queryRaw`
          SELECT "scope", "attempts", "windowStartedAt", "blockedUntil"
          FROM "LoginAttempt"
          WHERE "scope" = ${scope}
          FOR UPDATE
        `;
        state = rows[0];
      }
      if (!state) return null;

      if (state.blockedUntil && new Date(state.blockedUntil) > now) {
        return state;
      }

      let attempts = Number(state.attempts) || 0;
      if (!state.windowStartedAt ||
          now.getTime() - new Date(state.windowStartedAt).getTime() >= WINDOW_MS) {
        attempts = 0;
        state.windowStartedAt = now;
      }

      attempts += 1;
      const cooldown = getProgressiveCooldown(attempts);
      const blockedUntil = cooldown
        ? new Date(now.getTime() + cooldown)
        : null;

      await tx.$executeRaw`
        UPDATE "LoginAttempt"
        SET "attempts" = ${attempts},
            "windowStartedAt" = ${state.windowStartedAt},
            "blockedUntil" = ${blockedUntil},
            "updatedAt" = ${now}
        WHERE "scope" = ${scope}
      `;

      return {
        scope,
        attempts,
        windowStartedAt: state.windowStartedAt,
        blockedUntil,
      };
    }, { isolationLevel: "Serializable" });
  }

  async clear(scopes) {
    if (!scopes.length) return;
    await prisma.loginAttempt.deleteMany({
      where: { scope: { in: scopes } },
    });
  }

  async clearSuccessful(scopes, resetAt) {
    const scopesToClear = scopes.filter(Boolean);
    if (!scopesToClear.length) return;
    await prisma.$transaction(async (tx) => {
      for (const scope of scopesToClear) {
        await tx.$executeRaw`
          DELETE FROM "LoginAttempt"
          WHERE "scope" = ${scope}
            AND "updatedAt" < ${resetAt}
        `;
      }
    }, { isolationLevel: "Serializable" });
  }

  async cleanupExpired(now = new Date(), limit = 500) {
    const cutoff = new Date(now.getTime() - WINDOW_MS);
    return prisma.$transaction(async (tx) => {
      const rows = await tx.$queryRaw`
        SELECT "id"
        FROM "LoginAttempt"
        WHERE "windowStartedAt" < ${cutoff}
          AND "updatedAt" < ${cutoff}
          AND ("blockedUntil" IS NULL OR "blockedUntil" <= ${now})
        ORDER BY "updatedAt" ASC
        FOR UPDATE SKIP LOCKED
        LIMIT ${limit}
      `;
      if (!rows.length) return 0;
      let deleted = 0;
      for (const row of rows) {
        deleted += await tx.$executeRaw`
          DELETE FROM "LoginAttempt"
          WHERE "id" = ${row.id}
            AND "windowStartedAt" < ${cutoff}
            AND "updatedAt" < ${cutoff}
            AND ("blockedUntil" IS NULL OR "blockedUntil" <= ${now})
        `;
      }
      return deleted;
    }, { isolationLevel: "Serializable" });
  }
}

const defaultStore = new PrismaLoginAttemptStore();

export async function checkLoginRateLimit({ email, ip, store = defaultStore, now = new Date() }) {
  const scopes = getLoginScopes(email, ip);
  const states = await Promise.all(scopes.map((scope) => store.read(scope)));
  return getBlockedResult(states, now);
}

export async function recordLoginFailure({ email, ip, store = defaultStore, now = new Date() }) {
  const scopes = getLoginScopes(email, ip);
  const states = await Promise.all(scopes.map((scope) => store.reserveFailure(scope, now)));
  return getBlockedResult(states, now);
}

export async function clearLoginAttempts({ email, ip, store = defaultStore }) {
  await store.clear(getLoginScopes(email, ip));
}

export async function clearSuccessfulLoginAttempts({ email, ip, store = defaultStore }) {
  const scopes = getLoginScopes(email, ip);
  const resetAt = new Date();
  if (typeof store.clearSuccessful === "function") {
    await store.clearSuccessful([scopes[0], scopes[2]].filter(Boolean), resetAt);
  } else {
    await store.clear([scopes[0], scopes[2]].filter(Boolean));
  }
}

export async function cleanupExpiredLoginAttempts({ store = defaultStore, now = new Date(), limit = 500 } = {}) {
  return store.cleanupExpired(now, limit);
}
