-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('MONTHLY', 'ANNUAL', 'REGISTRATION', 'OTHER');

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "type" "PaymentType" NOT NULL DEFAULT 'MONTHLY';
