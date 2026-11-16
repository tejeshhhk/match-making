import Link from "next/link";

export default function TenderCard({ tender, match, closingSoon }) {
  const statusLabel = {
    eligible: "Eligible",
    partial: "One gap away",
    not_eligible: "Not eligible",
  }[match.status];

  return (
    <article className="card flex flex-col gap-5">
      <div className="flex items-start gap-4">
        <div
          className="score-ring"
          style={{ background: `conic-gradient(#2B39B8 ${match.score}%, #E5E7EB ${match.score}% 100%)` }}
          aria-label={`Match score ${match.score} out of 100`}
        >
          <span>{match.score}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className={`status-badge ${match.status}`}>{statusLabel}</span>
            {tender.emdExempt && <span className="subtle-badge">EMD exempt</span>}
          </div>
          <h2 className="text-lg font-bold leading-snug text-slate-900">{tender.title}</h2>
          <p className="mt-1 text-sm text-slate-600">
            {tender.department} · Value Rs {tender.valueCr.toFixed(2)} Cr
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className={closingSoon ? "deadline-chip urgent" : "deadline-chip"}>
          Deadline: {new Date(tender.deadline).toLocaleDateString("en-IN")}
        </span>
        <span className="subtle-badge">{tender.state}</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {match.passed.map((reason) => (
          <span key={reason} className="reason-chip passed">✓ {reason}</span>
        ))}
        {match.missing.map((reason) => (
          <span key={reason} className="reason-chip missing">× {reason}</span>
        ))}
      </div>

      <div className="mt-auto flex flex-wrap gap-3 border-t border-slate-100 pt-4">
        <Link href={`/tenders/${tender.id}`} className="secondary-button">View details</Link>
        <button type="button" disabled className="secondary-button cursor-not-allowed opacity-50">Save</button>
      </div>
    </article>
  );
}
