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
  try {
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
  } catch (error) {
    if (error?.code === "P2002") {
      return {
        errors: { udyamNo: "This Udyam number is already linked to another account." },
        values,
      };
    }

    console.error("Unable to save company profile.", error);
    return {
      errors: {},
      values,
      message: "We could not save your profile. Please try again.",
    };
  }

  revalidatePath("/tenders");
  revalidatePath("/saved");
  revalidatePath("/profile");
  redirect("/tenders");
}
