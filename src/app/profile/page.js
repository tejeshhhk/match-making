import Link from "next/link";
import ProfileForm from "@/components/ProfileForm";
import { getCurrentCompany } from "@/lib/session";
import { getProfileStrength } from "@/lib/profile";

export const instant = false;

export default async function ProfilePage({ searchParams }) {
  const params = await searchParams;
  if (params?.company === "missing") {
    return (
      <main className="page-shell">
        <div className="mx-auto max-w-3xl">
          <section className="card" role="alert">
            <p className="eyebrow">ACCOUNT SETUP</p>
            <h1 className="page-title mt-2">Company profile unavailable</h1>
            <p className="mt-3 text-slate-600">
              Your account is not linked to a company. Log out and sign up again,
              or contact support if this account previously existed.
            </p>
            <Link href="/login" className="primary-button mt-5 inline-flex">Return to login</Link>
          </section>
        </div>
      </main>
    );
  }

  const company = await getCurrentCompany();
  const strength = getProfileStrength(company);

  return (
    <main className="page-shell">
      <div className="mx-auto max-w-3xl">
        <Link href="/tenders" className="back-link">← Back to matched tenders</Link>
        <div className="mb-6 mt-5 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">YOUR BUSINESS</p>
            <h1 className="page-title">Company profile</h1>
            <p className="mt-2 text-slate-600">Tell us about your business to improve tender matches.</p>
          </div>
          <span className="text-right text-sm font-semibold text-slate-600">{strength}% complete</span>
        </div>
        <div className="mb-8 h-2 overflow-hidden rounded-full bg-slate-200" aria-label={`Profile ${strength}% complete`}>
          <div className="h-full rounded-full bg-[#2B39B8]" style={{ width: `${strength}%` }} />
        </div>
        <section className="card">
          <ProfileForm company={company} />
        </section>
      </div>
    </main>
  );
}
