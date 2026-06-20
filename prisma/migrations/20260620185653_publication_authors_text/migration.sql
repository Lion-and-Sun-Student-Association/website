/*
  Warnings:

  - You are about to drop the `_PublicationAuthor` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Publication" DROP CONSTRAINT "Publication_posterId_fkey";

-- DropForeignKey
ALTER TABLE "_PublicationAuthor" DROP CONSTRAINT "_PublicationAuthor_A_fkey";

-- DropForeignKey
ALTER TABLE "_PublicationAuthor" DROP CONSTRAINT "_PublicationAuthor_B_fkey";

-- AlterTable
ALTER TABLE "Publication" ADD COLUMN     "authors" TEXT[],
ALTER COLUMN "posterId" DROP NOT NULL;

-- DropTable
DROP TABLE "_PublicationAuthor";

-- AddForeignKey
ALTER TABLE "Publication" ADD CONSTRAINT "Publication_posterId_fkey" FOREIGN KEY ("posterId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
