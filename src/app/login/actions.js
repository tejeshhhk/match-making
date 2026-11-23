"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";
import { loginSchema } from "@/lib/auth-validation";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  checkLoginRateLimit,
  getTrustedClientIp,
  normalizeLoginEmail,
} from "@/lib/login-rate-limit";

function getClientIp(requestHeaders) {
  return getTrustedClientIp(requestHeaders);
}

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
    let decoded = callbackUrl;
    for (let index = 0; index < 3; index += 1) {
      const nextDecoded = decodeURIComponent(decoded);
      if (nextDecoded === decoded) break;
      decoded = nextDecoded;
    }
    if (
      decoded.startsWith("//") ||
      decoded.includes("\\") ||
      /[\u0000-\u0020\u007f]/.test(decoded)
    ) {
      return "/tenders";
    }
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

  const email = normalizeLoginEmail(result.data.email);
  const requestHeaders = await headers();
  const ip = getClientIp(requestHeaders);
  let rateLimit;
  try {
    rateLimit = await checkLoginRateLimit({ email, ip });
  } catch {
    return {
      values,
      errors: {},
      message: "Unable to sign in right now. Please try again.",
    };
  }
  if (rateLimit.blocked) {
    return {
      values,
      errors: {},
      message: "Too many login attempts. Please wait and try again.",
    };
  }

  try {
    await signIn("credentials", {
      email,
      password: result.data.password,
      redirectTo: callbackUrl,
      redirect: false,
    });
    redirect(callbackUrl);
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        values,
        errors: {},
        message: "Invalid email or password.",
      };
    }
    throw error;
  }
}
