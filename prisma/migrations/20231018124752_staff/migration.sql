/*
  Warnings:

  - A unique constraint covering the columns `[uname]` on the table `staff` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `uname` to the `staff` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `staff` ADD COLUMN `uname` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `staff_uname_key` ON `staff`(`uname`);
