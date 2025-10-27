-- CreateEnum
CREATE TYPE "public"."TipoNotificacion" AS ENUM ('CITA_PENDIENTE', 'CITA_ACEPTADA', 'CITA_CANCELADA', 'MENSAJE');

-- CreateTable
CREATE TABLE "public"."Notificacion" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "citaId" INTEGER,
    "tipo" "public"."TipoNotificacion" NOT NULL,
    "titulo" TEXT NOT NULL,
    "cuerpo" TEXT,
    "data" JSONB,
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notificacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notificacion_userId_leida_idx" ON "public"."Notificacion"("userId", "leida");

-- CreateIndex
CREATE INDEX "Notificacion_createdAt_idx" ON "public"."Notificacion"("createdAt");

-- AddForeignKey
ALTER TABLE "public"."Notificacion" ADD CONSTRAINT "Notificacion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notificacion" ADD CONSTRAINT "Notificacion_citaId_fkey" FOREIGN KEY ("citaId") REFERENCES "public"."Cita"("id") ON DELETE SET NULL ON UPDATE CASCADE;
