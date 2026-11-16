export function getProfileStrength(company) {
  const fields = [
    company.name,
    company.industry,
    company.state,
    company.udyamNo,
    Number(company.turnoverCr) > 0 ? company.turnoverCr : "",
    company.keywords,
    company.certificates,
  ];

  return Math.round(
    (fields.filter((field) => String(field || "").trim()).length / fields.length) * 100,
  );
}
