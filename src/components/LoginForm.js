"use client";

import { useActionState } from "react";
import { login } from "@/app/login/actions";
import AuthField from "@/components/AuthField";

const initialState = { values: {}, errors: {}, message: "" };

export default function LoginForm({ callbackUrl = "/tenders" }) {
  const [state, formAction, isPending] = useActionState(login, initialState);
  const value = (field) => state.values?.[field] || "";

  return (
    <form action={formAction} className="mt-6 space-y-5">
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      {state.message && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {state.message}
        </p>
      )}
      <AuthField label="Email" name="email" type="email" value={value("email")} error={state.errors?.email} />
      <AuthField label="Password" name="password" type="password" value={value("password")} error={state.errors?.password} />
      <button type="submit" className="primary-button w-full" disabled={isPending}>
        {isPending ? "Logging in..." : "Log in"}
      </button>
    </form>
  );
}
