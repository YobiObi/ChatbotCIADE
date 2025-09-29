-- CreateTable
CREATE TABLE "public"."Cita" (
    "id" SERIAL NOT NULL,
    "estudianteId" TEXT NOT NULL,
    "coordinador" TEXT NOT NULL,
    "modalidad" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cita_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Cita" ADD CONSTRAINT "Cita_estudianteId_fkey" FOREIGN KEY ("estudianteId") REFERENCES "public"."User"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;
