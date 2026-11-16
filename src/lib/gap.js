import { matchTender } from "@/lib/matching";

function values(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function gapAnalysis(company, tenders) {
  const counts = new Map();
  const currentCertificates = values(company.certificates).map((certificate) =>
    certificate.toLowerCase(),
  );

  tenders.forEach((tender) => {
    const result = matchTender(company, tender);
    if (result.status !== "partial") {
      return;
    }

    values(tender.requiredCerts).forEach((certificate) => {
      if (currentCertificates.includes(certificate.toLowerCase())) {
        return;
      }

      const upgradedCompany = {
        ...company,
        certificates: [...values(company.certificates), certificate].join(","),
      };
      if (matchTender(upgradedCompany, tender).status === "eligible") {
        counts.set(certificate, (counts.get(certificate) || 0) + 1);
      }
    });
  });

  const best = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  return best ? { certificate: best[0], unlocks: best[1] } : null;
}
