/*
  Warnings:

  - Added the required column `carrera` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `facultad` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sede` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "carrera" TEXT NOT NULL,
ADD COLUMN     "facultad" TEXT NOT NULL,
ADD COLUMN     "sede" TEXT NOT NULL;
