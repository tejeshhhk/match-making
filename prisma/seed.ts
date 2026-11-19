
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const demoPassword = process.env.DEMO_PASSWORD;
  if (!demoPassword) {
    throw new Error("DEMO_PASSWORD is required to seed the demo account.");
  }

  await prisma.savedTender.deleteMany();
  await prisma.alertSetting.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tender.deleteMany();
  await prisma.company.deleteMany();

  const company = await prisma.company.create({
    data: {
      name: "Sharma Furniture Works",
      industry: "Furniture",
      state: "Punjab",
      udyamNo: "UDYAM-PB-12-0001234",
      turnoverCr: 1.2,
      certificates: "GST,BIS",
      keywords: "office,desks,steel",
    },
  });

  await prisma.user.create({
    data: {
      name: "Demo MSME",
      email: "demo@tendermatch.in",
      passwordHash: await bcrypt.hash(demoPassword, 12),
      companyId: company.id,
    },
  });

  await prisma.tender.createMany({
    data: [
      {
        title: "Supply of Desktop Computers to Government Schools",
        department: "Department of Education",
        category: "IT Hardware",
        state: "Punjab",
        valueCr: 0.25,
        minTurnoverCr: 0.5,
        requiredCerts: "GST",
        emdExempt: true,
        deadline: new Date("2027-03-31"),
        sourceUrl: "https://example.com/tender-001",
      },
      {
        title: "Installation of Solar Panels on Government Buildings",
        department: "Department of Renewable Energy",
        category: "Electrical",
        state: "All India",
        valueCr: 0.80,
        minTurnoverCr: 1.0,
        requiredCerts: "BIS,ISO 14001",
        emdExempt: false,
        deadline: new Date("2027-04-15"),
        sourceUrl: "https://example.com/tender-002",
      },
    ],
  });

  console.log("Two sample tenders inserted successfully!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
