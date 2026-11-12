
export function calculateMatch(company, tender) {
  let score = 0;
  const reasons = [];
  const gaps = [];

  // 1. Business category — 40 points
  if (
    company.category?.toLowerCase() ===
    tender.category?.toLowerCase()
  ) {
    score += 40;
    reasons.push("Business category matches");
  } else {
    gaps.push("Business category does not match");
  }

  // 2. Annual turnover — 35 points
  if (company.turnoverCr >= tender.minTurnoverCr) {
    score += 35;
    reasons.push("Turnover requirement is satisfied");
  } else {
    gaps.push(
      `Required turnover: ₹${tender.minTurnoverCr} Cr`
    );
  }

  // 3. Required certifications — 25 points
  const required = tender.requiredCerts
    .split(",")
    .map((cert) => cert.trim().toLowerCase())
    .filter(Boolean);

  const available = (company.certifications || "")
    .split(",")
    .map((cert) => cert.trim().toLowerCase());

  const missing = required.filter(
    (cert) => !available.includes(cert)
  );

  if (missing.length === 0) {
    score += 25;
    reasons.push("Required certifications are available");
  } else {
    gaps.push(`Missing certifications: ${missing.join(", ")}`);
  }

  // MSME benefit information
  if (tender.emdExempt) {
    reasons.push("Tender lists an EMD exemption benefit");
  }

  return {
    score,
    reasons,
    gaps,
    status:
      score >= 75
        ? "Strong Match"
        : score >= 50
        ? "Moderate Match"
        : "Low Match",
  };
}
