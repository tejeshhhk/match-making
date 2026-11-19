"use client";

import { useActionState } from "react";
import { signup } from "@/app/signup/actions";
import AuthField from "@/components/AuthField";

const initialState = { values: {}, errors: {}, message: "" };

export default function SignupForm() {
  const [state, formAction, isPending] = useActionState(signup, initialState);
  const value = (field) => state.values?.[field] || "";

  return (
    <form action={formAction} className="mt-6 space-y-5">
      {state.message && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {state.message}
        </p>
      )}
      <AuthField label="Full name" name="name" value={value("name")} error={state.errors?.name} />
      <AuthField label="Email" name="email" type="email" value={value("email")} error={state.errors?.email} />
      <AuthField label="Password" name="password" type="password" value={value("password")} error={state.errors?.password} />
      <button type="submit" className="primary-button w-full" disabled={isPending}>
        {isPending ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
}
