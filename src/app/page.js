
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const tenders = await prisma.tender.findMany({
    orderBy: {
      deadline: "asc",
    },
  });

  return (
    <main className="min-h-screen bg-slate-50">
      <nav className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <h1 className="text-2xl font-bold text-blue-700">
            TenderMatch
          </h1>

          <span className="text-sm text-slate-500">
            Government Tender Portal
          </span>
        </div>
      </nav>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-10">
          <p className="mb-2 font-medium text-blue-600">
            DISCOVER OPPORTUNITIES
          </p>

          <h2 className="text-4xl font-bold text-slate-900">
            Government Tenders
          </h2>

          <p className="mt-3 text-slate-600">
            Find government contracts that match your business.
          </p>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-slate-800">
            Available Tenders
          </h3>

          <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
            {tenders.length} Tenders
          </span>
        </div>

        {tenders.length === 0 ? (
          <div className="rounded-xl border bg-white p-10 text-center">
            <p className="text-slate-600">
              No tenders available right now.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {tenders.map((tender) => (
              <article
                key={tender.id}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                    {tender.category}
                  </span>

                  <span className="text-sm text-slate-500">
                    {tender.state}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900">
                  {tender.title}
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  {tender.department}
                </p>

                <div className="my-6 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-500">
                      Tender Value
                    </p>
                    <p className="mt-1 font-semibold text-slate-900">
                      ₹{tender.valueCr.toFixed(2)} Cr
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">
                      Minimum Turnover
                    </p>
                    <p className="mt-1 font-semibold text-slate-900">
                      ₹{tender.minTurnoverCr.toFixed(2)} Cr
                    </p>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <p className="text-sm text-slate-500">
                    Application Deadline
                  </p>

                  <p className="mt-1 font-semibold text-red-600">
                    {tender.deadline.toLocaleDateString("en-IN")}
                  </p>
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <span className={
                    tender.emdExempt
                      ? "text-sm font-medium text-green-700"
                      : "text-sm font-medium text-slate-500"
                  }>
                    {tender.emdExempt
                      ? "EMD Exemption Available"
                      : "EMD Exemption Not Listed"}
                  </span>

                  <a
                    href={tender.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-blue-700 hover:underline"
                  >
                    View Source ↗
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
