/*
  Warnings:

  - Added the required column `proforma_id` to the `PurchaseOrder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PurchaseOrder" ADD COLUMN     "proforma_id" INTEGER NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'pending_production';

-- CreateTable
CREATE TABLE "purchase_order_items" (
    "id" SERIAL NOT NULL,
    "purchase_order_id" INTEGER NOT NULL,
    "directory_list_id" INTEGER NOT NULL,
    "collect_code" TEXT,
    "quantity" INTEGER NOT NULL,
    "unit_price" DOUBLE PRECISION,
    "total_price" DOUBLE PRECISION,
    "delivery_date" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchase_order_items_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_proforma_id_fkey" FOREIGN KEY ("proforma_id") REFERENCES "proformas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_purchase_order_id_fkey" FOREIGN KEY ("purchase_order_id") REFERENCES "PurchaseOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_directory_list_id_fkey" FOREIGN KEY ("directory_list_id") REFERENCES "directory_lists"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
