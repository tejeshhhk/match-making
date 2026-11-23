import { describe, expect, it } from "vitest";
import { assertCompanyOwnership, canReadCompanyRecord } from "./ownership";

describe("company ownership", () => {
  it("allows only the signed-in company to own a record", () => {
    expect(assertCompanyOwnership("company-a", "company-a")).toBe(true);
    expect(() => assertCompanyOwnership("company-a", "company-b")).toThrow("Forbidden");
  });

  it("rejects missing company identifiers", () => {
    expect(() => assertCompanyOwnership(undefined, "company-b")).toThrow("Forbidden");
  });

  it("cannot read or toggle a different company's saved record", () => {
    expect(canReadCompanyRecord("company-a", "company-b")).toBe(false);
  });
});
