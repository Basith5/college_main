/*
  Warnings:

  - You are about to drop the column `class` on the `student` table. All the data in the column will be lost.
  - Added the required column `claass` to the `student` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `student` DROP COLUMN `class`,
    ADD COLUMN `claass` VARCHAR(191) NOT NULL;
