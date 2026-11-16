function listValues(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

export function matchTender(company, tender) {
  const passed = [];
  const missing = [];
  const hardFailures = [];
  const companyCertificates = listValues(
    company.certificates ?? company.certifications,
  ).map(normalize);
  const requiredCertificates = listValues(tender.requiredCerts);

  const locationMatches =
    normalize(tender.state) === "all india" ||
    normalize(tender.state) === normalize(company.state);
  if (locationMatches) {
    passed.push("Location requirement met");
  } else {
    hardFailures.push("location");
    missing.push(`Restricted to ${tender.state}`);
  }

  const turnoverMatches =
    tender.minTurnoverCr == null ||
    Number(company.turnoverCr || 0) >= Number(tender.minTurnoverCr);
  if (turnoverMatches) {
    passed.push("Turnover requirement met");
  } else {
    hardFailures.push("turnover");
    missing.push(`Missing: turnover of Rs ${tender.minTurnoverCr} Cr`);
  }

  const missingCertificates = requiredCertificates.filter(
    (certificate) => !companyCertificates.includes(normalize(certificate)),
  );
  if (missingCertificates.length === 0) {
    passed.push("Certification requirements met");
  } else {
    hardFailures.push("certificates");
    missing.push(...missingCertificates.map((certificate) => `Missing: ${certificate}`));
  }

  let score = 40;
  const industry = company.industry ?? company.category;
  if (normalize(industry) === normalize(tender.category)) {
    score += 30;
    passed.push("Industry matches tender category");
  } else {
    missing.push(`Industry match: ${tender.category}`);
  }

  const companyKeywords = listValues(company.keywords).map(normalize);
  const tenderText = normalize(`${tender.title} ${tender.category}`);
  const matchingKeywords = companyKeywords.filter((keyword) =>
    tenderText.includes(keyword),
  );
  if (matchingKeywords.length > 0) {
    score += Math.min(matchingKeywords.length * 10, 20);
    passed.push(`Keywords matched: ${matchingKeywords.join(", ")}`);
  }

  if (tender.emdExempt && (company.udyamNo ?? company.udyamNumber)) {
    score += 10;
    passed.push("Udyam EMD exemption benefit applies");
  }

  if (hardFailures.length > 0) {
    score = Math.max(0, Math.min(50, score) - hardFailures.length * 10);
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    status:
      hardFailures.length === 0
        ? "eligible"
        : hardFailures.length === 1
          ? "partial"
          : "not_eligible",
    passed,
    missing,
  };
}

export function calculateMatch(company, tender) {
  const result = matchTender(company, tender);
  return {
    score: result.score,
    reasons: result.passed,
    gaps: result.missing,
    status:
      result.status === "eligible"
        ? "Strong Match"
        : result.status === "partial"
          ? "Moderate Match"
          : "Low Match",
  };
}
