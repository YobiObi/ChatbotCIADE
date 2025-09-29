/*
  Warnings:

  - Added the required column `campus` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "campus" TEXT NOT NULL;
