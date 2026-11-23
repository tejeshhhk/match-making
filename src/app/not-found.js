import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page-shell">
      <section className="card mx-auto max-w-lg text-center">
        <p className="eyebrow">404</p>
        <h1 className="page-title mt-2">Page not found</h1>
        <p className="mt-3 text-slate-600">
          The page you requested does not exist.
        </p>
        <Link href="/" className="primary-button mt-5 inline-flex">
          Return home
        </Link>
      </section>
    </main>
  );
}
