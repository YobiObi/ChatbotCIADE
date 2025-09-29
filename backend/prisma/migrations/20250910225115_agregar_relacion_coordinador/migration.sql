/*
  Warnings:

  - You are about to drop the column `coordinador` on the `Cita` table. All the data in the column will be lost.
  - Added the required column `coordinadorId` to the `Cita` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Cita" DROP COLUMN "coordinador",
ADD COLUMN     "coordinadorId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Cita" ADD CONSTRAINT "Cita_coordinadorId_fkey" FOREIGN KEY ("coordinadorId") REFERENCES "public"."User"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;
