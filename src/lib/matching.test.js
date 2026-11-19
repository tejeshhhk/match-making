import { describe, expect, it } from "vitest";
import { matchTender } from "./matching";

const company = {
  industry: "IT Hardware",
  state: "Punjab",
  turnoverCr: 2,
  certificates: "GST, BIS",
  keywords: "desktop, computers",
  udyamNo: "UDYAM-PB-12-0001234",
};

const tender = {
  title: "Supply of Desktop Computers",
  category: "IT Hardware",
  state: "Punjab",
  minTurnoverCr: 1,
  requiredCerts: "GST",
  emdExempt: true,
};

describe("matchTender", () => {
  it("returns eligible for a tender that passes all hard checks", () => {
    expect(matchTender(company, tender).status).toBe("eligible");
  });

  it("returns partial for exactly one missing certificate", () => {
    const result = matchTender(company, { ...tender, requiredCerts: "ISO 9001" });
    expect(result.status).toBe("partial");
    expect(result.missing).toContain("Missing: ISO 9001");
  });

  it("detects a location mismatch", () => {
    expect(matchTender(company, { ...tender, state: "Maharashtra" }).status).toBe("partial");
  });

  it("detects a turnover failure", () => {
    expect(matchTender(company, { ...tender, minTurnoverCr: 3 }).status).toBe("partial");
  });

  it("matches certificates case-insensitively", () => {
    const result = matchTender(
      { ...company, certificates: "gst, bis" },
      { ...tender, requiredCerts: "GST" },
    );
    expect(result.status).toBe("eligible");
  });

  it("adds the EMD exemption benefit when Udyam is present", () => {
    expect(matchTender(company, tender).passed).toContain(
      "Udyam EMD exemption benefit applies",
    );
  });
});
