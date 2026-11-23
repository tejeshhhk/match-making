import { describe, expect, it } from "vitest";
import { profileSchema } from "./profile";

describe("profileSchema", () => {
  const validProfile = {
    name: "Sharma Furniture Works",
    industry: "Furniture",
    state: "Punjab",
    udyamNo: "UDYAM-PB-12-0001234",
    turnoverCr: "1.2",
    keywords: "office, desks",
    certificates: "GST,BIS",
  };

  it("accepts a valid MSME profile and coerces turnover", () => {
    const result = profileSchema.safeParse(validProfile);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.turnoverCr).toBe(1.2);
    }
  });

  it("rejects missing required fields and negative turnover", () => {
    const result = profileSchema.safeParse({
      ...validProfile,
      name: "",
      industry: "",
      state: "",
      turnoverCr: "-1",
      keywords: "",
    });
    expect(result.success).toBe(false);
  });

  it("normalizes a blank Udyam number to null for the unique database field", () => {
    const result = profileSchema.safeParse({
      ...validProfile,
      udyamNo: "   ",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.udyamNo).toBeNull();
    }
  });
});
