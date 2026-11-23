import { describe, expect, it, vi } from "vitest";
import { isCronAuthorized } from "./cron";

describe("cron authorization", () => {
  it("accepts the exact configured bearer secret", () => {
    vi.stubEnv("CRON_SECRET", "correct-secret");
    const request = new Request("http://localhost/api/cron/collect", {
      headers: { authorization: "Bearer correct-secret" },
    });
    expect(isCronAuthorized(request)).toBe(true);
  });

  it("rejects missing or mismatched secrets", () => {
    vi.stubEnv("CRON_SECRET", "correct-secret");
    expect(isCronAuthorized(new Request("http://localhost/api/cron/collect"))).toBe(false);
    expect(isCronAuthorized(new Request("http://localhost/api/cron/collect", {
      headers: { authorization: "Bearer wrong-secret" },
    }))).toBe(false);
  });

  it("rejects authorization when CRON_SECRET is unset", () => {
    vi.stubEnv("CRON_SECRET", "");
    expect(isCronAuthorized(new Request("http://localhost/api/cron/collect", {
      headers: { authorization: "Bearer correct-secret" },
    }))).toBe(false);
  });
});
