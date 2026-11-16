import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const instant = false;

export default async function TenderDetailsPage({ params }) {
  const { id } = await params;
  const tender = await prisma.tender.findUnique({ where: { id } });
  if (!tender) notFound();

  return (
    <main className="page-shell">
      <div className="mx-auto max-w-3xl">
        <Link href="/tenders" className="back-link">← Back to matched tenders</Link>
        <section className="card mt-5">
          <span className="subtle-badge">{tender.category} · {tender.state}</span>
          <h1 className="mt-4 text-3xl font-bold text-slate-900">{tender.title}</h1>
          <p className="mt-2 text-slate-600">{tender.department}</p>
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
