/*
  Warnings:

  - Added the required column `year` to the `department` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `department` ADD COLUMN `year` INTEGER NOT NULL;
