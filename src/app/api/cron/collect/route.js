import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { z } from "zod";
import { isCronAuthorized } from "@/lib/cron";
import { prisma } from "@/lib/prisma";
import { cleanupExpiredLoginAttempts } from "@/lib/login-rate-limit";

const tenderSchema = z.object({
  title: z.string().min(1),
  department: z.string().min(1),
  category: z.string().min(1),
  state: z.string().min(1),
  valueCr: z.coerce.number().nonnegative(),
  minTurnoverCr: z.coerce.number().nonnegative().nullable(),
  requiredCerts: z.string(),
  emdExempt: z.boolean(),
  deadline: z.coerce.date(),
  sourceUrl: z.string().url(),
});

export async function GET(request) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await cleanupExpiredLoginAttempts({ limit: 500 });
  } catch (error) {
    console.error("Login attempt cleanup failed.", error?.code || "unknown");
  }

  try {
    // Real portal collection must only use sources whose terms permit it.
    const file = await readFile(path.join(process.cwd(), "data", "tenders.json"), "utf8");
    const parsed = JSON.parse(file);
    const result = z.array(tenderSchema).safeParse(parsed);

    if (!result.success) {
      console.error("Tender collector data is invalid.", result.error.flatten());
      return NextResponse.json({ error: "Collector data is invalid." }, { status: 500 });
    }

    let created = 0;
    let updated = 0;

    for (const tender of result.data) {
      const existing = await prisma.tender.findUnique({
        where: { sourceUrl: tender.sourceUrl },
        select: { id: true },
      });

      await prisma.tender.upsert({
        where: { sourceUrl: tender.sourceUrl },
        update: tender,
        create: tender,
      });

      if (existing) updated += 1;
      else created += 1;
    }

    return NextResponse.json({ created, updated });
  } catch (error) {
    console.error("Tender collection failed.", error);
    return NextResponse.json({ error: "Tender collection failed." }, { status: 500 });
  }
}
