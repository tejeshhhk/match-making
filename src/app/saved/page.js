import Link from "next/link";
import SaveButton from "@/components/SaveButton";
import { matchTender } from "@/lib/matching";
import { prisma } from "@/lib/prisma";
import { getCurrentCompany } from "@/lib/session";

export const instant = false;

export default async function SavedPage() {
  const company = await getCurrentCompany();
  const savedTenders = await prisma.savedTender.findMany({
    where: { companyId: company.id },
    include: { tender: true },
    orderBy: { tender: { deadline: "asc" } },
  });

  return (
    <main className="page-shell">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="eyebrow">YOUR SHORTLIST</p>
          <h1 className="page-title">Saved tenders</h1>
          <p className="mt-2 text-slate-600">Review your saved opportunities before they close.</p>
        </div>

        {savedTenders.length === 0 ? (
          <section className="card py-14 text-center">
            <h2 className="text-xl font-bold text-slate-900">No saved tenders yet</h2>
            <p className="mt-2 text-slate-600">
              Save a matched tender to keep it on your shortlist.
            </p>
            <Link href="/tenders" className="primary-button mt-6 inline-flex">
              Browse matches
            </Link>
          </section>
        ) : (
          <div className="grid gap-3">
            {savedTenders.map(({ tender }) => {
              const match = matchTender(company, tender);
              const daysLeft = getDaysLeft(tender.deadline);

              return (
                <article key={tender.id} className="card flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className={`status-badge ${match.status}`}>
                        {getStatusLabel(match.status)} · {match.score}
                      </span>
                      <span className={daysLeft <= 7 ? "deadline-chip urgent" : "deadline-chip"}>
                        {daysLeft < 0 ? "Closed" : `${daysLeft} days left`}
                      </span>
                    </div>
                    <h2 className="truncate text-lg font-bold text-slate-900">{tender.title}</h2>
                    <p className="mt-1 text-sm text-slate-600">
                      {tender.department} · Closes {new Date(tender.deadline).toLocaleDateString("en-IN")}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3 sm:flex-shrink-0">
                    <Link href={`/tenders/${tender.id}`} className="secondary-button">
                      View details
                    </Link>
                    <SaveButton tenderId={tender.id} initialSaved savedLabel="Remove" />
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

function getDaysLeft(deadline) {
  return Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
}

function getStatusLabel(status) {
  return {
    eligible: "Eligible",
    partial: "One gap away",
    not_eligible: "Not eligible",
  }[status];
}
