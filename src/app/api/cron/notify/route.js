import { NextResponse } from "next/server";
import { isCronAuthorized } from "@/lib/cron";
import { prisma } from "@/lib/prisma";

const KOLKATA_TIME_ZONE = "Asia/Kolkata";

function getKolkataCalendarDay(date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: KOLKATA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));

  // Convert both dates to UTC day numbers after formatting them in Kolkata.
  // This compares calendar dates, not rolling 24-hour timestamp windows.
  return Date.UTC(Number(values.year), Number(values.month) - 1, Number(values.day)) / 86400000;
}

export function getCalendarDaysRemaining(today, deadline) {
  return getKolkataCalendarDay(new Date(deadline)) - getKolkataCalendarDay(new Date(today));
}

export async function GET(request) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const today = new Date();
    const companies = await prisma.company.findMany({
      where: {
        alertSetting: {
          deadlineReminders: true,
        },
      },
      include: {
        alertSetting: true,
        savedTenders: {
          include: { tender: true },
        },
      },
    });

    let savedTendersChecked = 0;
    let remindersLogged = 0;
    for (const company of companies) {
      for (const savedTender of company.savedTenders) {
        savedTendersChecked += 1;
        const daysRemaining = getCalendarDaysRemaining(today, savedTender.tender.deadline);
        if (daysRemaining > 0 && (daysRemaining === 7 || daysRemaining === 2)) {
          console.log(`would email ${company.alertSetting.email}: ${savedTender.tender.title}`);
          remindersLogged += 1;
        }
      }
    }

    return NextResponse.json({
      totalCompaniesChecked: companies.length,
      savedTendersChecked,
      remindersLogged,
    });
  } catch (error) {
    console.error("Alert notification job failed.", error);
    return NextResponse.json({ error: "Alert notification job failed." }, { status: 500 });
  }
}
