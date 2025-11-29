/*
  Warnings:

  - You are about to drop the column `directory_list_id` on the `estimates` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "estimates" DROP CONSTRAINT "estimates_directory_list_id_fkey";

-- AlterTable
ALTER TABLE "estimates" DROP COLUMN "directory_list_id",
ADD COLUMN     "priced_at" TIMESTAMP(3),
ADD COLUMN     "priced_by" INTEGER,
ADD COLUMN     "sent_by" INTEGER,
ADD COLUMN     "sent_to_email" TEXT;

-- CreateTable
CREATE TABLE "estimate_items" (
    "id" SERIAL NOT NULL,
    "estimate_id" INTEGER NOT NULL,
    "directory_list_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unit_price" DOUBLE PRECISION,
    "total_price" DOUBLE PRECISION,
    "notes" TEXT,
    "is_selected" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "estimate_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "estimate_items_estimate_id_directory_list_id_key" ON "estimate_items"("estimate_id", "directory_list_id");

-- AddForeignKey
ALTER TABLE "estimates" ADD CONSTRAINT "estimates_priced_by_fkey" FOREIGN KEY ("priced_by") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estimates" ADD CONSTRAINT "estimates_sent_by_fkey" FOREIGN KEY ("sent_by") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estimate_items" ADD CONSTRAINT "estimate_items_estimate_id_fkey" FOREIGN KEY ("estimate_id") REFERENCES "estimates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estimate_items" ADD CONSTRAINT "estimate_items_directory_list_id_fkey" FOREIGN KEY ("directory_list_id") REFERENCES "directory_lists"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
