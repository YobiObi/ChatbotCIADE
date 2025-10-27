-- CreateTable
CREATE TABLE "public"."Coordinacion" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "campusId" INTEGER NOT NULL,
    "carreraId" INTEGER NOT NULL,

    CONSTRAINT "Coordinacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Coordinacion_userId_campusId_carreraId_key" ON "public"."Coordinacion"("userId", "campusId", "carreraId");

-- AddForeignKey
ALTER TABLE "public"."Coordinacion" ADD CONSTRAINT "Coordinacion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Coordinacion" ADD CONSTRAINT "Coordinacion_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "public"."Campus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Coordinacion" ADD CONSTRAINT "Coordinacion_carreraId_fkey" FOREIGN KEY ("carreraId") REFERENCES "public"."Carrera"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
