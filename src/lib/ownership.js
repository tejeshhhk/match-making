export function assertCompanyOwnership(companyId, recordCompanyId) {
  if (!companyId || !recordCompanyId || companyId !== recordCompanyId) {
    throw new Error("Forbidden");
  }
  return true;
}

export function canReadCompanyRecord(companyId, recordCompanyId) {
  return Boolean(
    companyId &&
    recordCompanyId &&
    companyId === recordCompanyId
  );
}
