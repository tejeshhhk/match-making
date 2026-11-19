"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentCompany } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { profileSchema } from "@/lib/profile";

export async function saveProfile(previousState, formData) {
  const values = {
    name: formData.get("name"),
    industry: formData.get("industry"),
    state: formData.get("state"),
    udyamNo: formData.get("udyamNo"),
    turnoverCr: formData.get("turnoverCr"),
    keywords: formData.get("keywords"),
    certificates: formData.get("certificates") || "",
  };
  const result = profileSchema.safeParse(values);

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    return {
      errors: Object.fromEntries(
        Object.entries(errors).map(([field, messages]) => [field, messages?.[0]]),
      ),
      values,
    };
  }

  const company = await getCurrentCompany();
  await prisma.company.update({
    where: { id: company.id },
    data: {
      ...result.data,
      certificates: result.data.certificates
        .split(",")
        .map((certificate) => certificate.trim())
        .filter(Boolean)
        .join(","),
      keywords: result.data.keywords
        .split(",")
        .map((keyword) => keyword.trim())
        .filter(Boolean)
        .join(","),
    },
  });

  revalidatePath("/tenders");
  revalidatePath("/profile");
  redirect("/tenders");
}
