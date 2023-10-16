-- AlterTable
ALTER TABLE `code` ALTER COLUMN `uname` DROP DEFAULT;

-- AlterTable
ALTER TABLE `department` ADD COLUMN `catagory` VARCHAR(191) NOT NULL DEFAULT 'Arts';
