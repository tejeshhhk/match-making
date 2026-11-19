"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleSaveTender } from "@/app/tenders/actions";

export default function SaveButton({ tenderId, initialSaved = false, savedLabel = "Saved" }) {
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [message, setMessage] = useState("");
  const [hasError, setHasError] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    setMessage("");
    setHasError(false);
    startTransition(async () => {
      const result = await toggleSaveTender(tenderId);

      if (result.ok) {
        setSaved(result.saved);
        setMessage(result.message);
        router.refresh();
      } else {
        setHasError(true);
        setMessage(result.message);
      }
    });
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        aria-pressed={saved}
        className={`secondary-button ${isPending ? "cursor-wait opacity-60" : ""}`}
      >
        {isPending ? "Updating..." : saved ? `✓ ${savedLabel}` : "Save"}
      </button>
      {message && (
        <p
          aria-live="polite"
          className={`text-xs font-medium ${hasError ? "text-red-700" : "text-slate-500"}`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
