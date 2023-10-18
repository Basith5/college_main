/*
  Warnings:

  - You are about to drop the column `staffInitialName` on the `staff` table. All the data in the column will be lost.
  - Added the required column `staffInitial` to the `staff` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `staff` DROP COLUMN `staffInitialName`,
    ADD COLUMN `staffInitial` VARCHAR(191) NOT NULL;
