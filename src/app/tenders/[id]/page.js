import Link from "next/link";
import { notFound } from "next/navigation";
import SaveButton from "@/components/SaveButton";
import { matchTender } from "@/lib/matching";
import { prisma } from "@/lib/prisma";
import { getCurrentCompany } from "@/lib/session";

export const instant = false;

export default async function TenderDetailsPage({ params }) {
  const { id } = await params;
  const [company, tender] = await Promise.all([
    getCurrentCompany(),
    prisma.tender.findUnique({ where: { id } }),
  ]);
  if (!tender) notFound();

  const [savedTender, match] = await Promise.all([
    prisma.savedTender.findUnique({
      where: {
        companyId_tenderId: {
          companyId: company.id,
          tenderId: tender.id,
        },
      },
      select: { id: true },
    }),
    Promise.resolve(matchTender(company, tender)),
  ]);

  return (
    <main className="page-shell">
      <div className="mx-auto max-w-3xl">
        <Link href="/tenders" className="back-link">← Back to matched tenders</Link>
        <section className="card mt-5">
          <span className="subtle-badge">{tender.category} · {tender.state}</span>
          <h1 className="mt-4 text-3xl font-bold text-slate-900">{tender.title}</h1>
          <p className="mt-2 text-slate-600">{tender.department}</p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className={`status-badge ${match.status}`}>
              {getStatusLabel(match.status)} · Score {match.score}
            </span>
            <SaveButton tenderId={tender.id} initialSaved={Boolean(savedTender)} />
          </div>
          <dl className="mt-8 grid gap-5 sm:grid-cols-2">
            <div><dt className="text-sm text-slate-500">Tender value</dt><dd className="font-semibold">Rs {tender.valueCr.toFixed(2)} Cr</dd></div>
            <div><dt className="text-sm text-slate-500">Minimum turnover</dt><dd className="font-semibold">{tender.minTurnoverCr == null ? "Not specified" : `Rs ${tender.minTurnoverCr.toFixed(2)} Cr`}</dd></div>
            <div><dt className="text-sm text-slate-500">Required certificates</dt><dd className="font-semibold">{tender.requiredCerts || "None listed"}</dd></div>
            <div><dt className="text-sm text-slate-500">Deadline</dt><dd className="font-semibold">{new Date(tender.deadline).toLocaleDateString("en-IN")}</dd></div>
          </dl>
          <a href={tender.sourceUrl} target="_blank" rel="noopener noreferrer" className="primary-button mt-8 inline-flex">View official source</a>
        </section>
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
