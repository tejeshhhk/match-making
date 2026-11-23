import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  checkLoginRateLimit,
  clearSuccessfulLoginAttempts,
  getTrustedClientIp,
  normalizeLoginEmail,
  recordLoginFailure,
} from "@/lib/login-rate-limit";

export async function authorizeCredentialLogin({
  credentials,
  request,
  findUser,
  verifyPassword,
  store,
  now,
}) {
  const email = normalizeLoginEmail(credentials?.email);
  const password = String(credentials?.password || "");
  if (!email || !password) return null;

  const ip = getTrustedClientIp(request?.headers);
  try {
    const rateLimit = await checkLoginRateLimit({ email, ip, store, now });
    if (rateLimit.blocked) return null;
  } catch {
    return null;
  }

  let user;
  try {
    user = findUser
      ? await findUser(email)
      : await prisma.user.findUnique({
          where: { email },
          select: { id: true, email: true, name: true, passwordHash: true },
        });
  } catch {
    return null;
  }

  if (!user?.passwordHash) return null;

  let passwordMatches = false;
  try {
    passwordMatches = verifyPassword
      ? await verifyPassword(password, user.passwordHash)
      : await bcrypt.compare(password, user.passwordHash);
  } catch {
    return null;
  }

  if (!passwordMatches) {
    try {
      await recordLoginFailure({ email, ip, store, now });
    } catch {
      return null;
    }
    return null;
  }

  try {
    await clearSuccessfulLoginAttempts({
      email,
      ip,
      store,
    });
  } catch {
    // Successful authentication must not be revoked by limiter cleanup failure.
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
  };
}
