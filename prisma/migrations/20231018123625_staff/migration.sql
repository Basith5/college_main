-- CreateTable
CREATE TABLE `staff` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `staffName` VARCHAR(191) NOT NULL,
    `staffInitialName` VARCHAR(191) NOT NULL,
    `codeId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `staff` ADD CONSTRAINT `staff_codeId_fkey` FOREIGN KEY (`codeId`) REFERENCES `code`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
