"use client";

import { useState } from "react";
import { CERTIFICATES } from "@/lib/constants";

export default function CertificateChips({ initialValue }) {
  const [selected, setSelected] = useState(
    initialValue
      .split(",")
      .map((certificate) => certificate.trim())
      .filter(Boolean),
  );

  function toggle(certificate) {
    setSelected((current) =>
      current.includes(certificate)
        ? current.filter((item) => item !== certificate)
        : [...current, certificate],
    );
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {CERTIFICATES.map((certificate) => {
          const isSelected = selected.includes(certificate);
          return (
            <button
              key={certificate}
              type="button"
              onClick={() => toggle(certificate)}
              className={`min-h-11 rounded-lg border px-3 py-2 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2B39B8] ${
                isSelected
                  ? "border-green-300 bg-green-100 text-green-900"
                  : "border-dashed border-slate-400 bg-white text-slate-600"
              }`}
              aria-pressed={isSelected}
            >
              <span aria-hidden="true" className="mr-1.5">
                {isSelected ? "✓" : "+"}
              </span>
              {certificate}
            </button>
          );
        })}
      </div>
      <input type="hidden" name="certificates" value={selected.join(",")} />
    </div>
  );
}
