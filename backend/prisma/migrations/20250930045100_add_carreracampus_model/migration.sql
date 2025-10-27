-- CreateTable
CREATE TABLE "public"."CarreraCampus" (
    "id" SERIAL NOT NULL,
    "carreraId" INTEGER NOT NULL,
    "campusId" INTEGER NOT NULL,

    CONSTRAINT "CarreraCampus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CarreraCampus_carreraId_campusId_key" ON "public"."CarreraCampus"("carreraId", "campusId");

-- AddForeignKey
ALTER TABLE "public"."CarreraCampus" ADD CONSTRAINT "CarreraCampus_carreraId_fkey" FOREIGN KEY ("carreraId") REFERENCES "public"."Carrera"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CarreraCampus" ADD CONSTRAINT "CarreraCampus_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "public"."Campus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
