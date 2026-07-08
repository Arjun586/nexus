-- AlterTable
ALTER TABLE "RefreshToken" ADD COLUMN "revokedAt" TIMESTAMP(3);

-- Migrate revoked tokens
UPDATE "RefreshToken" SET "revokedAt" = NOW() WHERE "isRevoked" = true;

ALTER TABLE "RefreshToken" DROP COLUMN "isRevoked";

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash");
