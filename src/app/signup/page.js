import Link from "next/link";
import SignupForm from "@/components/SignupForm";

export default function SignupPage() {
  return (
    <main className="page-shell">
      <div className="mx-auto max-w-md py-8 sm:py-12">
        <section className="card">
          <p className="eyebrow">GET STARTED</p>
          <h1 className="page-title mt-2">Create your account</h1>
          <SignupForm />
          <p className="mt-5 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-[#2B39B8]">Log in</Link>
          </p>
        </section>
      </div>
    </main>
  );
}
