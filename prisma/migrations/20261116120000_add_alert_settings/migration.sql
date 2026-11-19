-- CreateTable
CREATE TABLE "AlertSetting" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "newMatches" BOOLEAN NOT NULL DEFAULT true,
    "deadlineReminders" BOOLEAN NOT NULL DEFAULT true,
    "weeklySummary" BOOLEAN NOT NULL DEFAULT false,
    "email" TEXT NOT NULL,

    CONSTRAINT "AlertSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AlertSetting_companyId_key" ON "AlertSetting"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Tender_sourceUrl_key" ON "Tender"("sourceUrl");

-- AddForeignKey
ALTER TABLE "AlertSetting" ADD CONSTRAINT "AlertSetting_companyId_fkey"
FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
