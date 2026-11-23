"use client";

export default function ErrorPage({ reset }) {
  return (
    <main className="page-shell">
      <section className="card mx-auto max-w-lg text-center" role="alert">
        <p className="eyebrow">TENDERMATCH</p>
        <h1 className="page-title mt-2">Something went wrong</h1>
        <p className="mt-3 text-slate-600">
          We could not load this page. Please try again.
        </p>
        <button type="button" className="primary-button mt-5" onClick={() => reset()}>
          Try again
        </button>
      </section>
    </main>
  );
}
