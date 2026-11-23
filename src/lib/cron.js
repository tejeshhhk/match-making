import { timingSafeEqual } from "node:crypto";

export function isCronAuthorized(request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const authorization = request.headers.get("authorization");
  const expected = `Bearer ${secret}`;
  if (!authorization || authorization.length !== expected.length) return false;

  const authorizationBuffer = Buffer.from(authorization);
  const expectedBuffer = Buffer.from(expected);
  return timingSafeEqual(authorizationBuffer, expectedBuffer);
}
