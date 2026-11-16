import Link from "next/link";
import ProfileForm from "@/components/ProfileForm";
import { getCurrentCompany } from "@/lib/session";
import { getProfileStrength } from "@/lib/profile";

export const instant = false;

export default async function ProfilePage() {
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
