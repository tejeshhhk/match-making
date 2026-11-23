export default function Loading() {
  return (
    <main className="page-shell">
      <div className="mx-auto max-w-7xl animate-pulse">
        <div className="mb-8 h-24 rounded-xl bg-slate-200" />
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-28 rounded-[14px] bg-slate-200" />
          ))}
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          {[0, 1].map((item) => (
            <div key={item} className="h-64 rounded-[14px] bg-slate-200" />
          ))}
        </div>
      </div>
    </main>
  );
}
