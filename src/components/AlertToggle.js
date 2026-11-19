"use client";

import { useState } from "react";

export default function AlertToggle({ name, label, description, defaultChecked, disabled = false }) {
  const [checked, setChecked] = useState(defaultChecked);

  return (
    <div className={`flex items-center justify-between gap-4 border-b border-slate-100 py-4 last:border-b-0 ${disabled ? "opacity-55" : ""}`}>
      <div>
        <p className="font-semibold text-slate-800">{label}</p>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => setChecked((value) => !value)}
        className={`relative h-7 w-12 flex-shrink-0 rounded-full p-1 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2B39B8] ${checked ? "bg-[#2B39B8]" : "bg-slate-300"} ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
      >
        <span className={`block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`} />
      </button>
      {!disabled && <input type="hidden" name={name} value={String(checked)} />}
    </div>
  );
}
