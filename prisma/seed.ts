
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const demoPassword = process.env.DEMO_PASSWORD;
  const demoEmail = "demo@tendermatch.in";

  if (demoPassword) {
    const existingDemo = await prisma.user.findUnique({
      where: { email: demoEmail },
      include: { company: true },
    });

    if (existingDemo) {
      if (existingDemo.company) {
        await prisma.company.update({
          where: { id: existingDemo.company.id },
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
      } else {
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
        await prisma.user.update({
          where: { id: existingDemo.id },
          data: { companyId: company.id },
        });
      }
    } else {
      await prisma.user.create({
        data: {
          name: "Demo MSME",
          email: demoEmail,
          passwordHash: await bcrypt.hash(demoPassword, 12),
          company: {
            create: {
              name: "Sharma Furniture Works",
              industry: "Furniture",
              state: "Punjab",
              udyamNo: "UDYAM-PB-12-0001234",
              turnoverCr: 1.2,
              certificates: "GST,BIS",
              keywords: "office,desks,steel",
            },
          },
        },
      });
    }
  }

  const seedDate = new Date();
  const tenders = [
    ["Office Furniture Supply", "Furniture Corporation", "Furniture", "Punjab", 0.8, null, "BIS", true, 3],
    ["School Printing Work", "Education Department", "Printing", "All India", 0.2, null, "", false, 5],
    ["Desktop Computer Procurement", "Technical Education Directorate", "IT Hardware", "Punjab", 1.2, 0.8, "", true, 7],
    ["Government Building Construction", "Public Works Department", "Construction", "Haryana", 5.5, 2.5, "ISO 9001", false, 10],
    ["Police Uniforms and Accessories", "Home Department", "Uniforms", "Delhi", 1.8, 1.0, "ISO 9001", true, 12],
    ["Mid-Day Meal Supplies", "School Education Department", "Food Supplies", "All India", 2.2, 1.2, "", false, 15],
    ["Diagnostic Equipment Purchase", "Health Services", "Medical Equipment", "Rajasthan", 3.8, 2.0, "ISO 27001", true, 18],
    ["Office Stationery Package", "State Secretariat", "Stationery", "All India", 0.4, null, "", false, 20],
    ["Street Lighting Electrical Work", "Urban Local Bodies", "Electrical", "Gujarat", 4.2, 2.0, "BIS", true, 23],
    ["Government Office Cleaning", "Municipal Corporation", "Cleaning", "Punjab", 0.6, 0.4, "", false, 25],
    ["Classroom Furniture for Schools", "School Education Department", "Furniture", "All India", 1.5, 1.0, "BIS", true, 28],
    ["Survey Map Printing", "Revenue Department", "Printing", "Maharashtra", 0.9, null, "ISO 9001", false, 30],
    ["Servers and Network Devices", "IT Department", "IT Hardware", "All India", 6.0, 3.0, "ISO 27001", true, 32],
    ["Road Maintenance Contract", "National Highways Office", "Construction", "Karnataka", 8.0, 4.0, "ISO 9001", false, 35],
    ["Hospital Staff Uniforms", "Health Department", "Uniforms", "Tamil Nadu", 2.0, 1.2, "BIS", true, 38],
    ["Packaged Food for Hostels", "Social Welfare Department", "Food Supplies", "Uttar Pradesh", 1.6, 0.8, "ISO 14001", false, 40],
    ["X-Ray and Lab Equipment", "State Health Mission", "Medical Equipment", "All India", 7.2, 4.0, "ISO 27001", true, 4],
    ["Printed Examination Stationery", "Education Board", "Stationery", "Haryana", 0.7, null, "", false, 6],
    ["Solar Street Lighting", "Renewable Energy Department", "Electrical", "Rajasthan", 3.2, 1.8, "BIS", true, 9],
    ["Sanitation Services Contract", "Smart City Authority", "Cleaning", "Delhi", 1.4, 0.9, "ISO 14001", false, 11],
    ["Hostel Steel Furniture", "Housing Department", "Furniture", "All India", 2.8, 1.5, "BIS", false, 14],
    ["Security Printing Services", "Transport Department", "Printing", "Gujarat", 1.1, 0.6, "ISO 9001", true, 16],
    ["Laptop Replacement Tender", "Directorate of Administration", "IT Hardware", "Maharashtra", 4.8, 2.5, "ISO 27001", true, 19],
    ["Public Building Renovation", "Public Works Department", "Construction", "Uttar Pradesh", 7.5, 3.5, "ISO 9001", false, 22],
    ["School Uniform Fabric", "Textile Department", "Uniforms", "Karnataka", 2.4, 1.3, "BIS", false, 24],
    ["Essential Food Supply", "Disaster Management Authority", "Food Supplies", "All India", 3.0, 1.8, "ISO 14001", false, 27],
    ["Ambulance Medical Kits", "Emergency Services", "Medical Equipment", "Tamil Nadu", 1.9, 1.0, "ISO 9001", false, 29],
    ["Premium Printer Paper", "General Administration", "Stationery", "Punjab", 0.3, null, "", false, 31],
    ["Office Electrical Fit-out", "Public Works Department", "Electrical", "All India", 5.0, 2.8, "BIS", false, 34],
    ["Industrial Cleaning Equipment", "Industry Department", "Cleaning", "All India", 2.6, 1.5, "ISO 14001", false, 37],
  ];

  for (let index = 0; index < tenders.length; index += 1) {
    const [
      title,
      department,
      category,
      state,
      valueCr,
      minTurnoverCr,
      requiredCerts,
      emdExempt,
      days,
    ] = tenders[index];
    await prisma.tender.upsert({
      where: { sourceUrl: `https://example.com/tender/${index + 1}` },
      update: {
        title,
        department,
        category,
        state,
        valueCr,
        minTurnoverCr,
        requiredCerts,
        emdExempt,
        deadline: new Date(seedDate.getTime() + Number(days) * 86400000),
      },
      create: {
        title,
        department,
        category,
        state,
        valueCr,
        minTurnoverCr,
        requiredCerts,
        emdExempt,
        deadline: new Date(seedDate.getTime() + Number(days) * 86400000),
        sourceUrl: `https://example.com/tender/${index + 1}`,
      },
    });
  }

  console.log(demoPassword
    ? "Seed completed; demo account and 30 tenders are ready."
    : "Seed completed; 30 tenders are ready. Demo user skipped because DEMO_PASSWORD is not set.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
