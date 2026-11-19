"use client";

import { useActionState } from "react";
import AlertToggle from "@/components/AlertToggle";
import { saveAlertSettings } from "@/app/alerts/actions";

const initialState = {
  status: "",
  message: "",
  errors: {},
  values: {},
};

export default function AlertSettingsForm({ settings }) {
  const [state, formAction, isPending] = useActionState(saveAlertSettings, initialState);
  const values = state.values || {};
  const email = values.email ?? settings.email ?? "";

  return (
    <form action={formAction} className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Notification preferences</h2>
        <AlertToggle
          name="newMatches"
          label="New eligible tenders"
          description="Get notified when a new tender matches your company."
          defaultChecked={values.newMatches ?? settings.newMatches}
        />
        <AlertToggle
          name="deadlineReminders"
          label="Deadline reminders"
          description="Receive reminders 7 and 2 days before a saved tender closes."
          defaultChecked={values.deadlineReminders ?? settings.deadlineReminders}
        />
        <AlertToggle
          name="weeklySummary"
          label="Weekly summary"
          description="Receive a weekly overview of matched tender activity."
          defaultChecked={values.weeklySummary ?? settings.weeklySummary}
        />
        <AlertToggle
          label="WhatsApp alerts"
          description="WhatsApp notifications are coming soon."
          defaultChecked={false}
          disabled
        />
      </div>

      <label className="block text-sm font-semibold text-slate-700">
        Alert email
        <input
          type="email"
          name="email"
          defaultValue={email}
          placeholder="you@company.com"
          className="field mt-2"
          aria-describedby={state.errors?.email ? "alert-email-error" : undefined}
        />
        {state.errors?.email && <span id="alert-email-error" className="mt-1 block text-sm font-medium text-red-700">{state.errors.email}</span>}
      </label>

      {state.message && (
        <p aria-live="polite" className={`text-sm font-semibold ${state.status === "success" ? "text-green-700" : "text-red-700"}`}>
          {state.message}
        </p>
      )}

      <button type="submit" disabled={isPending} className="primary-button">
        {isPending ? "Saving..." : "Save settings"}
      </button>
    </form>
  );
}
