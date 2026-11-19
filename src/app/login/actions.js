"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";
import { loginSchema } from "@/lib/auth-validation";

export async function validateCallbackUrl(callbackUrl) {
  if (typeof callbackUrl !== "string" || callbackUrl.length === 0) {
    return "/tenders";
  }

  if (
    !callbackUrl.startsWith("/") ||
    callbackUrl.startsWith("//") ||
    callbackUrl.includes("\\") ||
    /[\u0000-\u0020\u007f]/.test(callbackUrl)
  ) {
    return "/tenders";
  }

  try {
    const origin = "http://tendermatch.local";
    const parsed = new URL(callbackUrl, origin);
    if (parsed.origin !== origin) {
      return "/tenders";
    }
    if (
      parsed.pathname.startsWith("//") ||
      parsed.pathname.includes("\\")
    ) {
      return "/tenders";
    }
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return "/tenders";
  }
}

export async function login(previousState, formData) {
  const values = {
    email: String(formData.get("email") || ""),
    password: String(formData.get("password") || ""),
  };
  const callbackUrl = await validateCallbackUrl(formData.get("callbackUrl"));
  const result = loginSchema.safeParse(values);

  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors;
    return {
      values,
      errors: {
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      },
      message: "",
    };
  }

  try {
    await signIn("credentials", {
      email: result.data.email,
      password: result.data.password,
      redirectTo: callbackUrl,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        values,
        errors: {},
        message: "Email or password is incorrect.",
      };
    }
    throw error;
  }
}
