
"use server";

import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/prisma";
import { signupSchema } from "@/lib/auth-validation";
import { hashPassword } from "@/lib/password";
import { signIn } from "@/lib/auth";

export async function signup(previousState, formData) {
  const values = {
    name: String(formData.get("name") || ""),
    email: String(formData.get("email") || ""),
    password: String(formData.get("password") || ""),
  };

  const result = signupSchema.safeParse(values);

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;

    return {
      values: {
        name: values.name,
        email: values.email,
      },
      errors: {
        name: errors.name?.[0],
        email: errors.email?.[0],
        password: errors.password?.[0],
      },
      message: "",
    };
  }

  try {
    const passwordHash = await hashPassword(result.data.password);

    await prisma.user.create({
      data: {
        name: result.data.name,
        email: result.data.email,
        passwordHash,
        company: {
          create: {
            name: "",
            industry: "",
            state: "",
            turnoverCr: 0,
            certificates: "",
            keywords: "",
          },
        },
      },
    });
  } catch (error) {
    if (error?.code === "P2002") {
      return {
        values: {
          name: values.name,
          email: values.email,
        },
        errors: {},
        message: "We could not create the account. Check your details and try again.",
      };
    }

    return {
      values: {
        name: values.name,
        email: values.email,
      },
      errors: {},
      message: "We could not create your account. Please try again.",
    };
  }

  try {
    await signIn("credentials", {
      email: result.data.email,
      password: result.data.password,
      redirectTo: "/profile",
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        values: {
          name: values.name,
          email: values.email,
        },
        errors: {},
        message: "Account created. Please log in.",
      };
    }

    throw error;
  }

  redirect("/profile");
}
