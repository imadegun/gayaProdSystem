/*
  Warnings:

  - The `status` column on the `PurchaseOrder` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "PurchaseOrderStatus" AS ENUM ('pending_deposit', 'deposit_received', 'in_production', 'qc_completed', 'packaging', 'shipped', 'delivered', 'cancelled');

-- AlterTable
ALTER TABLE "PurchaseOrder" ADD COLUMN     "delivery_date" TIMESTAMP(3),
ADD COLUMN     "shipping_date" TIMESTAMP(3),
ADD COLUMN     "tracking_number" TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" "PurchaseOrderStatus" NOT NULL DEFAULT 'pending_deposit';

-- AlterTable
ALTER TABLE "directory_lists" ADD COLUMN     "color_name" TEXT,
ADD COLUMN     "components" JSONB,
ADD COLUMN     "is_set" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "item_code" TEXT,
ADD COLUMN     "material_name" TEXT,
ADD COLUMN     "parent_id" INTEGER,
ADD COLUMN     "photos" JSONB,
ADD COLUMN     "revision_number" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "size_info" TEXT,
ADD COLUMN     "texture_name" TEXT;

-- AlterTable
ALTER TABLE "proformas" ADD COLUMN     "currency_id" INTEGER;

-- AlterTable
ALTER TABLE "quotations" ADD COLUMN     "currency_id" INTEGER;

-- CreateTable
CREATE TABLE "currencies" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "exchange_rate" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "is_base" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "currencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing_formulas" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "formula_type" TEXT NOT NULL,
    "parameters" JSONB NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pricing_formulas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estimates" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "estimate_number" TEXT NOT NULL,
    "directory_list_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "total_amount" DOUBLE PRECISION,
    "currency_id" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "sent_date" TIMESTAMP(3),
    "response_date" TIMESTAMP(3),
    "client_response" TEXT,
    "notes" TEXT,
    "attachments" JSONB,
    "created_by" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "estimates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_order_status_history" (
    "id" SERIAL NOT NULL,
    "purchase_order_id" INTEGER NOT NULL,
    "old_status" "PurchaseOrderStatus",
    "new_status" "PurchaseOrderStatus" NOT NULL,
    "changed_by" INTEGER NOT NULL,
    "change_reason" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchase_order_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "currencies_code_key" ON "currencies"("code");

-- CreateIndex
CREATE UNIQUE INDEX "estimates_estimate_number_key" ON "estimates"("estimate_number");

-- AddForeignKey
ALTER TABLE "estimates" ADD CONSTRAINT "estimates_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "RnDProject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estimates" ADD CONSTRAINT "estimates_directory_list_id_fkey" FOREIGN KEY ("directory_list_id") REFERENCES "directory_lists"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estimates" ADD CONSTRAINT "estimates_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "currencies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estimates" ADD CONSTRAINT "estimates_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "directory_lists" ADD CONSTRAINT "directory_lists_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "directory_lists"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "currencies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proformas" ADD CONSTRAINT "proformas_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "currencies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order_status_history" ADD CONSTRAINT "purchase_order_status_history_purchase_order_id_fkey" FOREIGN KEY ("purchase_order_id") REFERENCES "PurchaseOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order_status_history" ADD CONSTRAINT "purchase_order_status_history_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
