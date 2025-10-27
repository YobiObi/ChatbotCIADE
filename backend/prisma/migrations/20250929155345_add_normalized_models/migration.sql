/*
  Warnings:

  - You are about to drop the column `campus` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `carrera` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `facultad` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `sede` on the `User` table. All the data in the column will be lost.
  - Added the required column `campusId` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `carreraId` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roleId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "campus",
DROP COLUMN "carrera",
DROP COLUMN "facultad",
DROP COLUMN "role",
DROP COLUMN "sede",
ADD COLUMN     "campusId" INTEGER NOT NULL,
ADD COLUMN     "carreraId" INTEGER NOT NULL,
ADD COLUMN     "roleId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "public"."Role" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Facultad" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Facultad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Carrera" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "facultadId" INTEGER NOT NULL,

    CONSTRAINT "Carrera_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Campus" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "sedeId" INTEGER NOT NULL,

    CONSTRAINT "Campus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Sede" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Sede_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "public"."Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Facultad_nombre_key" ON "public"."Facultad"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Carrera_nombre_key" ON "public"."Carrera"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Campus_nombre_key" ON "public"."Campus"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Sede_nombre_key" ON "public"."Sede"("nombre");

-- AddForeignKey
ALTER TABLE "public"."Carrera" ADD CONSTRAINT "Carrera_facultadId_fkey" FOREIGN KEY ("facultadId") REFERENCES "public"."Facultad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Campus" ADD CONSTRAINT "Campus_sedeId_fkey" FOREIGN KEY ("sedeId") REFERENCES "public"."Sede"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "public"."Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_carreraId_fkey" FOREIGN KEY ("carreraId") REFERENCES "public"."Carrera"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "public"."Campus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
