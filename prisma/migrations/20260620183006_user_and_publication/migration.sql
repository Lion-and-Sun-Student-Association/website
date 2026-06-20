/*
  Warnings:

  - You are about to drop the column `username` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Profile` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_userId_fkey";

-- DropIndex
DROP INDEX "User_username_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "username",
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "degree" TEXT,
ADD COLUMN     "firstName" TEXT NOT NULL DEFAULT 'user',
ADD COLUMN     "lastName" TEXT NOT NULL DEFAULT 'user',
ADD COLUMN     "program" TEXT,
ADD COLUMN     "showAbout" TEXT;

-- DropTable
DROP TABLE "Profile";

-- CreateTable
CREATE TABLE "Publication" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT NOT NULL,
    "date" TIMESTAMP(3),
    "posterId" TEXT NOT NULL,

    CONSTRAINT "Publication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PublicationAuthor" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PublicationAuthor_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_PublicationAuthor_B_index" ON "_PublicationAuthor"("B");

-- AddForeignKey
ALTER TABLE "Publication" ADD CONSTRAINT "Publication_posterId_fkey" FOREIGN KEY ("posterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PublicationAuthor" ADD CONSTRAINT "_PublicationAuthor_A_fkey" FOREIGN KEY ("A") REFERENCES "Publication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PublicationAuthor" ADD CONSTRAINT "_PublicationAuthor_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
