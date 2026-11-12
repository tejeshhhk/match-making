
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.tender.createMany({
    data: [
      {
        title: "Supply of Desktop Computers to Government Schools",
        department: "Department of Education",
        category: "IT Hardware",
        state: "Punjab",
        valueCr: 0.25,
        minTurnoverCr: 0.5,
        requiredCerts: "ISO 9001",
        emdExempt: true,
        deadline: new Date("2027-03-31"),
        sourceUrl: "https://example.com/tender-001",
      },
      {
        title: "Installation of Solar Panels on Government Buildings",
        department: "Department of Renewable Energy",
        category: "Electrical",
        state: "Haryana",
        valueCr: 0.80,
        minTurnoverCr: 1.0,
        requiredCerts: "ISO 14001",
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
