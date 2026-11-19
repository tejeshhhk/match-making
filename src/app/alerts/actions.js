"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentCompany } from "@/lib/session";

const alertSettingsSchema = z.object({
  email: z.string().trim().email("Enter a valid alert email address."),
  newMatches: z.boolean(),
  deadlineReminders: z.boolean(),
  weeklySummary: z.boolean(),
});

export async function saveAlertSettings(previousState, formData) {
  const values = {
    email: String(formData.get("email") || ""),
    newMatches: formData.get("newMatches") === "true",
    deadlineReminders: formData.get("deadlineReminders") === "true",
    weeklySummary: formData.get("weeklySummary") === "true",
  };
  const result = alertSettingsSchema.safeParse(values);

  if (!result.success) {
    return {
      status: "error",
      message: "",
      errors: { email: result.error.flatten().fieldErrors.email?.[0] },
      values,
    };
  }

  try {
    const company = await getCurrentCompany();
    await prisma.alertSetting.upsert({
      where: { companyId: company.id },
      update: result.data,
      create: {
        companyId: company.id,
        ...result.data,
      },
    });

    revalidatePath("/alerts");
    return {
      status: "success",
      message: "Alert settings saved.",
      errors: {},
      values: result.data,
    };
  } catch (error) {
    console.error("Unable to save alert settings.", error);
    return {
      status: "error",
      message: "We could not save your alert settings. Please try again.",
      errors: {},
      values,
    };
  }
}
