"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentCompany } from "@/lib/session";

function validateTenderId(tenderId) {
  return typeof tenderId === "string" && tenderId.trim().length > 0 && tenderId.length <= 100
    ? tenderId.trim()
    : null;
}

export async function toggleSaveTender(tenderId) {
  const validTenderId = validateTenderId(tenderId);
  if (!validTenderId) {
    return { ok: false, saved: false, message: "That tender could not be saved." };
  }

  try {
    const [company, tender] = await Promise.all([
      getCurrentCompany(),
      prisma.tender.findUnique({
        where: { id: validTenderId },
        select: { id: true },
      }),
    ]);

    if (!tender) {
      return { ok: false, saved: false, message: "That tender could not be found." };
    }

    const savedTender = await prisma.savedTender.findUnique({
      where: {
        companyId_tenderId: {
          companyId: company.id,
          tenderId: tender.id,
        },
      },
      select: { id: true },
    });

    if (savedTender) {
      await prisma.savedTender.delete({ where: { id: savedTender.id } });
    } else {
      await prisma.savedTender.create({
        data: {
          companyId: company.id,
          tenderId: tender.id,
        },
      });
    }

    revalidatePath("/tenders");
    revalidatePath("/saved");
    revalidatePath(`/tenders/${tender.id}`);

    return {
      ok: true,
      saved: !savedTender,
      message: savedTender ? "Tender removed from saved tenders." : "Tender saved.",
    };
  } catch (error) {
    console.error("Unable to toggle saved tender.", error);
    return {
      ok: false,
      saved: false,
      message: "We could not update this tender. Please try again.",
    };
  }
}
