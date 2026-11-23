import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  signIn: vi.fn(),
  redirect: vi.fn(),
  hashPassword: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      create: mocks.create,
    },
  },
}));

vi.mock("@/lib/auth", () => ({
  signIn: mocks.signIn,
}));

vi.mock("@/lib/password", () => ({
  hashPassword: mocks.hashPassword,
}));

vi.mock("next-auth", () => ({
  AuthError: class AuthError extends Error {},
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
}));

import { signup } from "@/app/signup/actions";

describe("signup security", () => {
  it("returns a neutral response for a duplicate email", async () => {
    mocks.create.mockRejectedValue({ code: "P2002" });
    mocks.hashPassword.mockResolvedValue("$2b$12$hashed");

    const formData = new FormData();
    formData.set("name", "Asha Sharma");
    formData.set("email", "duplicate@example.com");
    formData.set("password", "password123");

    const result = await signup(null, formData);

    expect(result).toMatchObject({
      errors: {},
      message: "We could not create the account. Check your details and try again.",
    });
    expect(JSON.stringify(result)).not.toContain("already exists");
    expect(mocks.signIn).not.toHaveBeenCalled();
  });
});
