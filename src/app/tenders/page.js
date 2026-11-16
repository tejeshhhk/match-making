import Link from "next/link";
import TenderCard from "@/components/TenderCard";
import { getCurrentCompany } from "@/lib/session";
import { matchTender } from "@/lib/matching";
import { gapAnalysis } from "@/lib/gap";
import { getProfileStrength } from "@/lib/profile";
import { prisma } from "@/lib/prisma";

export const instant = false;

export default async function TendersPage({ searchParams }) {
  const params = await searchParams;
  const filter = typeof params?.filter === "string" ? params.filter : "all";
  const query = typeof params?.q === "string" ? params.q.trim().toLowerCase() : "";
  const company = await getCurrentCompany();
  const [tenders, savedTenders] = await Promise.all([
    prisma.tender.findMany({ orderBy: { deadline: "asc" } }),
    prisma.savedTender.findMany({
      where: { companyId: company.id },
      select: { tenderId: true },
    }),
  ]);
  const savedTenderIds = new Set(savedTenders.map(({ tenderId }) => tenderId));
  const scoredTenders = tenders
    .map((tender) => ({ tender, match: matchTender(company, tender) }))
    .sort((a, b) => b.match.score - a.match.score);
  const now = new Date().getTime();
  const closingSoon = (tender) =>
    new Date(tender.deadline).getTime() >= now &&
    new Date(tender.deadline).getTime() <= now + 7 * 86400000;
  const filtered = scoredTenders.filter(({ tender, match }) => {
    const matchesFilter =
      filter === "eligible" ? match.status === "eligible" :
      filter === "partial" ? match.status === "partial" :
      filter === "emd" ? tender.emdExempt :
      filter === "closing" ? closingSoon(tender) : true;
    return matchesFilter && (!query || `${tender.title} ${tender.department} ${tender.category}`.toLowerCase().includes(query));
  });
  const eligibleCount = scoredTenders.filter(({ match }) => match.status === "eligible").length;
  const partialCount = scoredTenders.filter(({ match }) => match.status === "partial").length;
  const closingCount = scoredTenders.filter(({ tender }) => closingSoon(tender)).length;
  const gap = gapAnalysis(company, tenders);
  const profileIncomplete = getProfileStrength(company) < 100;

  return (
    <main className="page-shell">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow">TENDER DISCOVERY</p>
            <h1 className="page-title">Good morning, {company.name || "business owner"}</h1>
            <p className="mt-2 text-slate-600">{eligibleCount} eligible matches from {tenders.length} tenders.</p>
          </div>
          <Link href="/profile" className="secondary-button">Edit company profile</Link>
        </div>

        {profileIncomplete && (
          <div className="mb-6 flex flex-col justify-between gap-3 rounded-[14px] border border-[#C7CCFF] bg-[#EEF0FF] p-4 text-sm text-[#202B89] sm:flex-row sm:items-center">
            <span><strong>Complete your profile</strong> to get more accurate matches.</span>
            <Link href="/profile" className="font-bold underline">Complete now</Link>
          </div>
        )}

        {gap && (
          <div className="mb-6 flex flex-col justify-between gap-3 rounded-[14px] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 sm:flex-row sm:items-center">
            <span>Unlock {gap.unlocks} more tenders. Adding <strong>{gap.certificate}</strong> makes you eligible for them.</span>
            <Link href="/profile" className="font-bold underline">See how</Link>
          </div>
        )}

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <StatCard label="Eligible now" value={eligibleCount} tone="green" />
          <StatCard label="One gap away" value={partialCount} tone="amber" />
          <StatCard label="Closing this week" value={closingCount} tone="red" />
        </div>

        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {[
              ["all", "All"],
              ["eligible", "Eligible"],
              ["partial", "Partial"],
              ["emd", "EMD exempt"],
              ["closing", "Closing soon"],
            ].map(([value, label]) => (
              <Link key={value} href={makeFilterUrl(value, query)} className={`filter-pill ${filter === value ? "active" : ""}`}>{label}</Link>
            ))}
          </div>
          <form action="/tenders" className="flex gap-2">
            <label htmlFor="tender-search" className="sr-only">Search tenders</label>
            <input id="tender-search" name="q" defaultValue={query} placeholder="Search tenders" className="field min-h-11 w-full lg:w-64" />
            <button type="submit" className="secondary-button">Search</button>
          </form>
        </div>

        {filtered.length ? (
          <div className="grid gap-5 lg:grid-cols-2">
            {filtered.map(({ tender, match }) => (
              <TenderCard
                key={tender.id}
                tender={tender}
                match={match}
                closingSoon={closingSoon(tender)}
                initiallySaved={savedTenderIds.has(tender.id)}
              />
            ))}
          </div>
        ) : (
          <div className="card py-14 text-center text-slate-600">No tenders match these filters.</div>
        )}
      </div>
    </main>
  );
}

function StatCard({ label, value, tone }) {
  return <div className={`stat-card ${tone}`}><span>{label}</span><strong>{value}</strong></div>;
}

function makeFilterUrl(filter, query) {
  const params = new URLSearchParams();
  if (filter !== "all") params.set("filter", filter);
  if (query) params.set("q", query);
  const search = params.toString();
  return `/tenders${search ? `?${search}` : ""}`;
}
