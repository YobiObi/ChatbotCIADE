/*
  Warnings:

  - You are about to drop the `Notificacion` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Notificacion" DROP CONSTRAINT "Notificacion_citaId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Notificacion" DROP CONSTRAINT "Notificacion_userId_fkey";

-- DropTable
DROP TABLE "public"."Notificacion";

-- DropEnum
DROP TYPE "public"."TipoNotificacion";
