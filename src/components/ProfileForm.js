"use client";

import { useActionState } from "react";
import CertificateChips from "@/components/CertificateChips";
import { saveProfile } from "@/app/profile/actions";
import { INDIAN_STATES, INDUSTRIES } from "@/lib/constants";

const initialState = { errors: {}, values: {} };

export default function ProfileForm({ company }) {
  const [state, formAction, isPending] = useActionState(saveProfile, initialState);
  const values = state.values || {};
  const value = (field) => values[field] ?? company[field] ?? "";
  const error = (field) => state.errors?.[field];

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Company name" name="name" defaultValue={value("name")} error={error("name")} />
        <label className="block text-sm font-semibold text-slate-700">
          Industry
          <select name="industry" defaultValue={value("industry")} className="field mt-2">
            <option value="">Select industry</option>
            {INDUSTRIES.map((industry) => <option key={industry}>{industry}</option>)}
          </select>
          <ErrorMessage message={error("industry")} />
        </label>
        <label className="block text-sm font-semibold text-slate-700">
          State
          <select name="state" defaultValue={value("state")} className="field mt-2">
            <option value="">Select state</option>
            {INDIAN_STATES.map((stateName) => <option key={stateName}>{stateName}</option>)}
          </select>
          <ErrorMessage message={error("state")} />
        </label>
        <Field label="Udyam number" name="udyamNo" defaultValue={value("udyamNo")} error={error("udyamNo")} />
        <Field
          label="Annual turnover (Rs crore)"
          name="turnoverCr"
          type="number"
          min="0"
          step="0.01"
          defaultValue={value("turnoverCr")}
          error={error("turnoverCr")}
        />
      </div>

      <label className="block text-sm font-semibold text-slate-700">
        Capabilities
        <input
          name="keywords"
          defaultValue={value("keywords")}
          placeholder="office, desks, steel"
          className="field mt-2"
        />
        <span className="mt-1 block text-xs font-normal text-slate-500">Separate capabilities with commas.</span>
        <ErrorMessage message={error("keywords")} />
      </label>

      <div>
        <p className="mb-2 text-sm font-semibold text-slate-700">Certificates</p>
        <CertificateChips initialValue={value("certificates")} />
        <ErrorMessage message={error("certificates")} />
      </div>

      <button type="submit" disabled={isPending} className="primary-button">
        {isPending ? "Saving..." : "Save profile"}
      </button>
    </form>
  );
}

function Field({ label, name, error, ...props }) {
  return (
    <label className="block text-sm font-semibold text-slate-700">
      {label}
      <input name={name} className="field mt-2" {...props} />
      <ErrorMessage message={error} />
    </label>
  );
}

function ErrorMessage({ message }) {
  return message ? <span className="mt-1 block text-sm font-medium text-red-700">{message}</span> : null;
}
