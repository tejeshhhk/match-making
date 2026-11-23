CREATE TABLE "LoginAttempt" (
    "id" TEXT NOT NULL,
    "scope" TEXT NOT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "windowStartedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "blockedUntil" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LoginAttempt_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LoginAttempt_scope_key" ON "LoginAttempt"("scope");
CREATE INDEX "LoginAttempt_blockedUntil_idx" ON "LoginAttempt"("blockedUntil");

ALTER TABLE "LoginAttempt"
ADD CONSTRAINT "LoginAttempt_attempts_nonnegative"
CHECK ("attempts" >= 0);

CREATE INDEX "LoginAttempt_cleanup_idx"
ON "LoginAttempt" ("windowStartedAt", "updatedAt", "blockedUntil");
