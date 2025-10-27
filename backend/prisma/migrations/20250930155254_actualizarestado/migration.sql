/*
  Warnings:

  - The values [confirmada,cancelada,realizada,reagendada] on the enum `EstadoCita` will be removed. If these variants are still used in the database, this will fail.
  - The values [hibrida] on the enum `ModalidadCita` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."EstadoCita_new" AS ENUM ('pendiente', 'aceptada', 'rechazada');
ALTER TABLE "public"."Cita" ALTER COLUMN "estado" DROP DEFAULT;
ALTER TABLE "public"."Cita" ALTER COLUMN "estado" TYPE "public"."EstadoCita_new" USING ("estado"::text::"public"."EstadoCita_new");
ALTER TYPE "public"."EstadoCita" RENAME TO "EstadoCita_old";
ALTER TYPE "public"."EstadoCita_new" RENAME TO "EstadoCita";
DROP TYPE "public"."EstadoCita_old";
ALTER TABLE "public"."Cita" ALTER COLUMN "estado" SET DEFAULT 'pendiente';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."ModalidadCita_new" AS ENUM ('presencial', 'virtual');
ALTER TABLE "public"."Cita" ALTER COLUMN "modalidad" TYPE "public"."ModalidadCita_new" USING ("modalidad"::text::"public"."ModalidadCita_new");
ALTER TYPE "public"."ModalidadCita" RENAME TO "ModalidadCita_old";
ALTER TYPE "public"."ModalidadCita_new" RENAME TO "ModalidadCita";
DROP TYPE "public"."ModalidadCita_old";
COMMIT;
