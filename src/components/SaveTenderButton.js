"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { removeSavedTender, saveTender } from "@/app/saved/actions";

export default function SaveTenderButton({ tenderId, initiallySaved = false }) {
  const router = useRouter();
  const [saved, setSaved] = useState(initiallySaved);
  const [message, setMessage] = useState("");
  const [hasError, setHasError] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    setMessage("");
    setHasError(false);
    startTransition(async () => {
      const result = saved
        ? await removeSavedTender(tenderId)
        : await saveTender(tenderId);

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
        {isPending ? (saved ? "Removing..." : "Saving...") : saved ? "Saved" : "Save"}
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
