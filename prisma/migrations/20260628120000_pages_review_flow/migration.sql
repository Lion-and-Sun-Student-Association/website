-- AlterTable
ALTER TABLE "Page" DROP COLUMN "published",
ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approvedById" TEXT,
ADD COLUMN     "reviewNote" TEXT,
ADD COLUMN     "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "submittedAt" TIMESTAMP(3),
ADD COLUMN     "submittedById" TEXT;

-- CreateIndex
CREATE INDEX "Page_status_idx" ON "Page"("status");

-- AddForeignKey
ALTER TABLE "Page" ADD CONSTRAINT "Page_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Page" ADD CONSTRAINT "Page_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

