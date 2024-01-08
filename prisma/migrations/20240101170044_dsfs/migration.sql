/*
  Warnings:

  - You are about to drop the column `EHOT` on the `marks` table. All the data in the column will be lost.
  - You are about to drop the column `ELOT` on the `marks` table. All the data in the column will be lost.
  - You are about to drop the column `EMOT` on the `marks` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `marks` DROP COLUMN `EHOT`,
    DROP COLUMN `ELOT`,
    DROP COLUMN `EMOT`,
    ADD COLUMN `ESEHOT` DOUBLE NULL,
    ADD COLUMN `ESELOT` DOUBLE NULL,
    ADD COLUMN `ESEMOT` DOUBLE NULL;
