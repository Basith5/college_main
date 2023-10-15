/*
  Warnings:

  - You are about to drop the column `uname` on the `department` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `department` DROP COLUMN `uname`;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `uname` VARCHAR(191) NOT NULL DEFAULT 'Staffid';
