/*
  Warnings:

  - The `estado` column on the `Cita` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `fecha` to the `Cita` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `estudianteId` on the `Cita` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `modalidad` on the `Cita` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `coordinadorId` on the `Cita` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."ModalidadCita" AS ENUM ('presencial', 'virtual', 'hibrida');

-- CreateEnum
CREATE TYPE "public"."EstadoCita" AS ENUM ('pendiente', 'confirmada', 'cancelada', 'realizada', 'reagendada');

-- DropForeignKey
ALTER TABLE "public"."Cita" DROP CONSTRAINT "Cita_coordinadorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Cita" DROP CONSTRAINT "Cita_estudianteId_fkey";

-- AlterTable
ALTER TABLE "public"."Cita" ADD COLUMN     "fecha" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "observacion" TEXT,
DROP COLUMN "estudianteId",
ADD COLUMN     "estudianteId" INTEGER NOT NULL,
DROP COLUMN "modalidad",
ADD COLUMN     "modalidad" "public"."ModalidadCita" NOT NULL,
DROP COLUMN "estado",
ADD COLUMN     "estado" "public"."EstadoCita" NOT NULL DEFAULT 'pendiente',
DROP COLUMN "coordinadorId",
ADD COLUMN     "coordinadorId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Cita" ADD CONSTRAINT "Cita_estudianteId_fkey" FOREIGN KEY ("estudianteId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Cita" ADD CONSTRAINT "Cita_coordinadorId_fkey" FOREIGN KEY ("coordinadorId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
