import Link from "next/link";
import SaveTenderButton from "@/components/SaveTenderButton";
import { getCurrentCompany } from "@/lib/session";
import { matchTender } from "@/lib/matching";
import { prisma } from "@/lib/prisma";

export const instant = false;

export default async function SavedPage() {
  const company = await getCurrentCompany();
  const savedTenders = await prisma.savedTender.findMany({
    where: { companyId: company.id },
    include: { tender: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="page-shell">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="eyebrow">YOUR SHORTLIST</p>
          <h1 className="page-title">Saved tenders</h1>
          <p className="mt-2 text-slate-600">
            Keep the opportunities you want to review later in one place.
          </p>
        </div>

        {savedTenders.length === 0 ? (
          <section className="card py-14 text-center">
            <h2 className="text-xl font-bold text-slate-900">No saved tenders yet</h2>
            <p className="mt-2 text-slate-600">
              Save a tender from your matched tender list to see it here.
            </p>
            <Link href="/tenders" className="primary-button mt-6 inline-flex">
              Browse matched tenders
            </Link>
          </section>
        ) : (
          <div className="grid gap-5">
            {savedTenders.map(({ tender }) => {
              const match = matchTender(company, tender);

              return (
                <article key={tender.id} className="card">
                  <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className={`status-badge ${match.status}`}>
                          {getStatusLabel(match.status)}
                        </span>
                        <span className="subtle-badge">{tender.category}</span>
                      </div>
                      <h2 className="text-xl font-bold text-slate-900">{tender.title}</h2>
                      <p className="mt-1 text-sm text-slate-600">
                        {tender.department} · {tender.state}
                      </p>
                    </div>
                    <div className="score-ring" style={{ background: `conic-gradient(#2B39B8 ${match.score}%, #E5E7EB ${match.score}% 100%)` }}>
                      <span>{match.score}</span>
                    </div>
                  </div>

                  <dl className="mt-6 grid gap-4 border-t border-slate-100 pt-5 text-sm sm:grid-cols-3">
                    <div>
                      <dt className="text-slate-500">Tender value</dt>
                      <dd className="font-semibold text-slate-900">Rs {tender.valueCr.toFixed(2)} Cr</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Deadline</dt>
                      <dd className="font-semibold text-slate-900">
                        {new Date(tender.deadline).toLocaleDateString("en-IN")}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Match details</dt>
                      <dd className="font-semibold text-slate-900">
                        {match.passed.length} passed, {match.missing.length} gap{match.missing.length === 1 ? "" : "s"}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {match.passed.map((reason) => (
                      <span key={reason} className="reason-chip passed">✓ {reason}</span>
                    ))}
                    {match.missing.map((reason) => (
                      <span key={reason} className="reason-chip missing">× {reason}</span>
                    ))}
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3 border-t border-slate-100 pt-4">
                    <Link href={`/tenders/${tender.id}`} className="secondary-button">
                      View details
                    </Link>
                    <SaveTenderButton tenderId={tender.id} initiallySaved />
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

function getStatusLabel(status) {
  return {
    eligible: "Eligible",
    partial: "One gap away",
    not_eligible: "Not eligible",
  }[status];
}
