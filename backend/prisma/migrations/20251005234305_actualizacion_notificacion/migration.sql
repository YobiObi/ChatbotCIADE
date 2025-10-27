-- AlterEnum
ALTER TYPE "public"."TipoNotificacion" ADD VALUE 'CITA_REAGENDADA';

-- AlterTable
ALTER TABLE "public"."Cita" ADD COLUMN     "reagendadaEn" TIMESTAMP(3);
