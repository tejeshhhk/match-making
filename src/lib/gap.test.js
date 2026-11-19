import { describe, expect, it } from "vitest";
import { gapAnalysis } from "./gap";

describe("gapAnalysis", () => {
  it("returns the certificate that unlocks the most tenders", () => {
    const company = {
      industry: "IT Hardware",
      state: "Punjab",
      turnoverCr: 2,
      certificates: "",
      keywords: "",
    };
    const tenders = [
      {
        title: "GST tender one",
        category: "IT Hardware",
        state: "Punjab",
        minTurnoverCr: 1,
        requiredCerts: "GST",
        emdExempt: false,
      },
      {
        title: "GST tender two",
        category: "IT Hardware",
        state: "Punjab",
        minTurnoverCr: 1,
        requiredCerts: "GST",
        emdExempt: false,
      },
      {
        title: "BIS tender",
        category: "IT Hardware",
        state: "Punjab",
        minTurnoverCr: 1,
        requiredCerts: "BIS",
        emdExempt: false,
      },
    ];

    expect(gapAnalysis(company, tenders)).toEqual({
      certificate: "GST",
      unlocks: 2,
    });
  });
});
