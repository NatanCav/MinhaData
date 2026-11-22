/*
  Warnings:

  - Made the column `organizationId` on table `Espaco` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Espaco" DROP CONSTRAINT "Espaco_organizationId_fkey";

-- AlterTable
ALTER TABLE "Espaco" ALTER COLUMN "organizationId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Espaco" ADD CONSTRAINT "Espaco_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
