-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "udyamNumber" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "turnoverCr" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "experienceYears" INTEGER NOT NULL DEFAULT 0,
    "certifications" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tender" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "valueCr" DOUBLE PRECISION NOT NULL,
    "minTurnoverCr" DOUBLE PRECISION NOT NULL,
    "requiredCerts" TEXT NOT NULL DEFAULT '',
    "emdExempt" BOOLEAN NOT NULL DEFAULT false,
    "deadline" TIMESTAMP(3) NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tender_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedTender" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "tenderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedTender_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Company_udyamNumber_key" ON "Company"("udyamNumber");

-- CreateIndex
CREATE UNIQUE INDEX "SavedTender_companyId_tenderId_key" ON "SavedTender"("companyId", "tenderId");

-- AddForeignKey
ALTER TABLE "SavedTender" ADD CONSTRAINT "SavedTender_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedTender" ADD CONSTRAINT "SavedTender_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "Tender"("id") ON DELETE CASCADE ON UPDATE CASCADE;
