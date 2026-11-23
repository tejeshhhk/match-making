import { describe, expect, it, vi } from "vitest";
import { loginSchema, signupSchema } from "./auth-validation";

vi.mock("next-auth", () => ({
  AuthError: class AuthError extends Error {},
}));

vi.mock("@/lib/auth", () => ({
  signIn: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(async () => new Headers({
    "x-forwarded-for": "203.0.113.10",
  })),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

vi.mock("@/lib/login-rate-limit", () => ({
  checkLoginRateLimit: vi.fn(async () => ({ blocked: false, retryAfterSeconds: 0 })),
  getTrustedClientIp: vi.fn((headers) => headers?.get("x-vercel-forwarded-for") || "unknown"),
  normalizeLoginEmail: vi.fn((email) => String(email || "").trim().toLowerCase()),
}));

import { login, validateCallbackUrl } from "@/app/login/actions";
import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";

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

describe("generic authentication errors", () => {
  it("returns the same generic error for a failed credentials login", async () => {
    signIn.mockRejectedValue(new AuthError());
    const formData = new FormData();
    formData.set("email", " USER@Example.com ");
    formData.set("password", "password123");
    formData.set("callbackUrl", "/tenders");

    const result = await login(null, formData);

    expect(result).toMatchObject({
      values: {
        email: " USER@Example.com ",
      },
      errors: {},
      message: "Invalid email or password.",
    });
  });
});
