/*
  Warnings:

  - You are about to drop the column `ESTAFF` on the `marks` table. All the data in the column will be lost.
  - You are about to drop the column `ESTATUS` on the `marks` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `marks` DROP COLUMN `ESTAFF`,
    DROP COLUMN `ESTATUS`,
    ADD COLUMN `ESESTAFF` VARCHAR(191) NULL,
    ADD COLUMN `ESESTATUS` VARCHAR(191) NULL;
