import { z } from "zod";

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Enter your company name."),
  industry: z.string().trim().min(1, "Choose an industry."),
  state: z.string().trim().min(1, "Choose your state."),
  udyamNo: z.string().trim().max(50, "Udyam number is too long."),
  turnoverCr: z.coerce
    .number({ message: "Enter turnover in rupees crore." })
    .finite("Enter a valid turnover.")
    .nonnegative("Turnover cannot be negative."),
  keywords: z.string().trim().min(2, "Add at least one capability."),
  certificates: z.string(),
});

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
