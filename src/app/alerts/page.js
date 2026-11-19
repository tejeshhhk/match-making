import AlertSettingsForm from "@/components/AlertSettingsForm";
import { prisma } from "@/lib/prisma";
import { getCurrentCompany } from "@/lib/session";

export const instant = false;

export default async function AlertsPage() {
  const company = await getCurrentCompany();
  const settings = await prisma.alertSetting.findUnique({
    where: { companyId: company.id },
  });

  return (
    <main className="page-shell">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <p className="eyebrow">STAY INFORMED</p>
          <h1 className="page-title">Alerts</h1>
          <p className="mt-2 text-slate-600">Choose how TenderMatch keeps you up to date.</p>
        </div>
        <section className="card">
          <AlertSettingsForm
            settings={settings || {
              email: "",
              newMatches: true,
              deadlineReminders: true,
              weeklySummary: false,
            }}
          />
        </section>
      </div>
    </main>
  );
}
