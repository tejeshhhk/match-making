import Link from "next/link";

export const metadata = {
  title: "TenderMatch | Government tenders for Indian MSMEs",
  description:
    "Discover government tenders that match your company profile, certificates, turnover, and capabilities.",
};

export default function HomePage() {
  const steps = [
    {
      number: "1",
      title: "Add your profile",
      description:
        "Tell us about your state, industry, turnover, certifications, and capabilities.",
    },
    {
      number: "2",
      title: "We match tenders",
      description:
        "See relevant opportunities ranked by eligibility and readiness.",
    },
    {
      number: "3",
      title: "Bid with confidence",
      description:
        "Understand what you qualify for and where a small gap may be holding you back.",
    },
  ];

  return (
    <main className="page-shell">
      <div className="mx-auto max-w-7xl">
        <section className="landing-hero">
          <div className="landing-badge">Built for Indian MSMEs</div>
          <h1>Find government tenders you can actually win</h1>
          <p>
            Match your business profile against eligible opportunities and make
            every tender decision clearer.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/profile" className="primary-button">
              Create your profile
            </Link>
            <Link href="/tenders" className="secondary-button">
              See matched tenders
            </Link>
          </div>
        </section>

        <section className="landing-section" aria-labelledby="how-it-works">
          <p className="eyebrow">HOW IT WORKS</p>
          <h2 id="how-it-works" className="landing-heading">
            From profile to opportunity
          </h2>
          <div className="landing-grid landing-grid-three">
            {steps.map((step) => (
              <article className="card landing-step" key={step.number}>
                <span className="landing-step-number">{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-benefits" aria-label="TenderMatch benefits">
          <div>
            <strong>Clear reasons</strong>
            <span>Know exactly why you match</span>
          </div>
          <div>
            <strong>Gap analysis</strong>
            <span>Discover the requirement that matters</span>
          </div>
          <div>
            <strong>EMD exemption detection</strong>
            <span>Spot Udyam-based benefits</span>
          </div>
        </section>
      </div>
    </main>
  );
}
