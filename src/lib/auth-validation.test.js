import { describe, expect, it, vi } from "vitest";
import { loginSchema, signupSchema } from "./auth-validation";

vi.mock("next-auth", () => ({
  AuthError: class AuthError extends Error {},
}));

vi.mock("@/lib/auth", () => ({
  signIn: vi.fn(),
}));

import { validateCallbackUrl } from "@/app/login/actions";

describe("authentication validation", () => {
  it("accepts a valid login", () => {
    const result = loginSchema.safeParse({
      email: " USER@Example.com ",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid login email and short password", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "short",
    });
    expect(result.success).toBe(false);
  });

  it("accepts a valid signup", () => {
    const result = signupSchema.safeParse({
      name: "Asha Sharma",
      email: "asha@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid signup fields", () => {
    const result = signupSchema.safeParse({
      name: "",
      email: "invalid",
      password: "123",
    });
    expect(result.success).toBe(false);
  });
});

describe("login callback URL validation", () => {
  it("accepts /saved", async () => {
    await expect(validateCallbackUrl("/saved")).resolves.toBe("/saved");
  });

  it("accepts /alerts?type=new", async () => {
    await expect(validateCallbackUrl("/alerts?type=new")).resolves.toBe(
      "/alerts?type=new",
    );
  });

  it("rejects an external URL", async () => {
    await expect(validateCallbackUrl("https://evil.com")).resolves.toBe("/tenders");
  });

  it("rejects a protocol-relative URL", async () => {
    await expect(validateCallbackUrl("//evil.com")).resolves.toBe("/tenders");
  });

  it("rejects the encoded dot normalization escape", async () => {
    await expect(validateCallbackUrl("/%2e%2e//evil.com")).resolves.toBe("/tenders");
  });

  it("rejects backslash-based URLs", async () => {
    await expect(validateCallbackUrl("/\\evil.com")).resolves.toBe("/tenders");
    await expect(validateCallbackUrl("/safe\\evil.com")).resolves.toBe("/tenders");
  });
});
