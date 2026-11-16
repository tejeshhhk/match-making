import { prisma } from "@/lib/prisma";

export async function getCurrentCompany() {
  const company = await prisma.company.findFirst({
    orderBy: { createdAt: "asc" },
  });

  if (company) {
    return company;
  }

  return prisma.company.create({
    data: {
      name: "",
      industry: "",
      state: "",
      turnoverCr: 0,
      certificates: "",
      keywords: "",
    },
  });
}
