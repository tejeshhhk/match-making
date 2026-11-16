-- Align the company profile fields with the TenderMatch MVP.
ALTER TABLE "Company" RENAME COLUMN "udyamNumber" TO "udyamNo";
ALTER INDEX "Company_udyamNumber_key" RENAME TO "Company_udyamNo_key";
ALTER TABLE "Company" RENAME COLUMN "category" TO "industry";
ALTER TABLE "Company" RENAME COLUMN "certifications" TO "certificates";
ALTER TABLE "Company" ADD COLUMN "keywords" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Company" ALTER COLUMN "udyamNo" DROP NOT NULL;
ALTER TABLE "Tender" ALTER COLUMN "minTurnoverCr" DROP NOT NULL;
