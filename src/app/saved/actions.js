"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentCompany } from "@/lib/session";

function validateTenderId(tenderId) {
  return typeof tenderId === "string" && tenderId.trim().length > 0 && tenderId.length <= 100
    ? tenderId.trim()
    : null;
}

function actionError(message) {
  return { ok: false, saved: false, error: true, message };
}

export async function saveTender(tenderId) {
  const validTenderId = validateTenderId(tenderId);
  if (!validTenderId) {
    return actionError("That tender could not be saved.");
  }

  try {
    const tender = await prisma.tender.findUnique({
      where: { id: validTenderId },
      select: { id: true },
    });

    if (!tender) {
      return actionError("That tender could not be found.");
    }

    const company = await getCurrentCompany();
    await prisma.savedTender.upsert({
      where: {
        companyId_tenderId: {
          companyId: company.id,
          tenderId: tender.id,
        },
      },
      create: {
        companyId: company.id,
        tenderId: tender.id,
      },
      update: {},
    });

    revalidatePath("/saved");
    revalidatePath("/tenders");
    return { ok: true, saved: true, error: false, message: "Tender saved." };
  } catch (error) {
    console.error("Unable to save tender.", error);
    return actionError("We could not save this tender. Please try again.");
  }
}

export async function removeSavedTender(tenderId) {
  const validTenderId = validateTenderId(tenderId);
  if (!validTenderId) {
    return actionError("That saved tender could not be removed.");
  }

  try {
    const company = await getCurrentCompany();
    await prisma.savedTender.deleteMany({
      where: {
        companyId: company.id,
        tenderId: validTenderId,
      },
    });

    revalidatePath("/saved");
    revalidatePath("/tenders");
    return { ok: true, saved: false, error: false, message: "Tender removed from saved tenders." };
  } catch (error) {
    console.error("Unable to remove saved tender.", error);
    return actionError("We could not remove this tender. Please try again.");
  }
}
