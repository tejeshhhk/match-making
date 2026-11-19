import { Suspense } from "react";
import Link from "next/link";
import LoginForm from "@/components/LoginForm";

export default function LoginPage({ searchParams }) {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginContent searchParams={searchParams} />
    </Suspense>
  );
}

async function LoginContent({ searchParams }) {
  const params = await searchParams;
  const callbackUrl =
    typeof params?.callbackUrl === "string" ? params.callbackUrl : "/tenders";

  return (
    <main className="page-shell">
      <div className="mx-auto max-w-md py-8 sm:py-12">
        <section className="card">
          <p className="eyebrow">WELCOME BACK</p>
          <h1 className="page-title mt-2">Log in</h1>
          <LoginForm callbackUrl={callbackUrl} />
          <p className="mt-5 text-center text-sm text-slate-600">
            New to TenderMatch?{" "}
            <Link href="/signup" className="font-bold text-[#2B39B8]">
              Create an account
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}

function LoginFallback() {
  return (
    <main className="page-shell">
      <div className="mx-auto max-w-md py-8 sm:py-12">
        <section className="card">
          <p className="eyebrow">WELCOME BACK</p>
          <h1 className="page-title mt-2">Log in</h1>
          <div className="mt-6 h-64 animate-pulse rounded-lg bg-slate-100" aria-hidden="true" />
        </section>
      </div>
    </main>
  );
}
