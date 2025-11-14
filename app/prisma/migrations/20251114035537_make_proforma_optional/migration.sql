-- DropForeignKey
ALTER TABLE "PurchaseOrder" DROP CONSTRAINT "PurchaseOrder_proforma_id_fkey";

-- AlterTable
ALTER TABLE "PurchaseOrder" ALTER COLUMN "proforma_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_proforma_id_fkey" FOREIGN KEY ("proforma_id") REFERENCES "proformas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
