/*
  Warnings:

  - You are about to drop the `Client` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PurchaseOrder" DROP CONSTRAINT "PurchaseOrder_client_id_fkey";

-- AlterTable
ALTER TABLE "PurchaseOrder" ALTER COLUMN "client_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "tblcollect_design" ADD COLUMN     "address" TEXT,
ADD COLUMN     "contactPerson" TEXT,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "department" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "region" TEXT;

-- DropTable
DROP TABLE "Client";

-- CreateTable
CREATE TABLE "RnDProject" (
    "id" SERIAL NOT NULL,
    "client_id" TEXT NOT NULL,
    "project_name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft_directory',
    "workflow_step" TEXT,
    "created_by" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RnDProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "directory_lists" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "item_name" TEXT NOT NULL,
    "description" TEXT,
    "collect_code" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "clay" TEXT,
    "glaze" TEXT,
    "texture" TEXT,
    "engobe" TEXT,
    "firing_type" TEXT,
    "luster" TEXT,
    "dimensions" JSONB,
    "weight" DOUBLE PRECISION,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "directory_lists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotations" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "quotation_number" TEXT NOT NULL,
    "directory_list_id" INTEGER,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "total_amount" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "sent_date" TIMESTAMP(3),
    "response_date" TIMESTAMP(3),
    "client_response" TEXT,
    "notes" TEXT,
    "attachments" JSONB,
    "created_by" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quotations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "samples" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "directory_list_id" INTEGER NOT NULL,
    "sample_code" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "start_date" TIMESTAMP(3),
    "completion_date" TIMESTAMP(3),
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "samples_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proformas" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "proforma_number" TEXT NOT NULL,
    "directory_list_id" INTEGER,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "total_amount" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "sent_date" TIMESTAMP(3),
    "response_date" TIMESTAMP(3),
    "client_response" TEXT,
    "selected_items" JSONB,
    "notes" TEXT,
    "attachments" JSONB,
    "created_by" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proformas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "quotations_quotation_number_key" ON "quotations"("quotation_number");

-- CreateIndex
CREATE UNIQUE INDEX "samples_sample_code_key" ON "samples"("sample_code");

-- CreateIndex
CREATE UNIQUE INDEX "proformas_proforma_number_key" ON "proformas"("proforma_number");

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "tblcollect_design"("design_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RnDProject" ADD CONSTRAINT "RnDProject_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "tblcollect_design"("design_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RnDProject" ADD CONSTRAINT "RnDProject_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "directory_lists" ADD CONSTRAINT "directory_lists_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "RnDProject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "RnDProject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_directory_list_id_fkey" FOREIGN KEY ("directory_list_id") REFERENCES "directory_lists"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "samples" ADD CONSTRAINT "samples_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "RnDProject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "samples" ADD CONSTRAINT "samples_directory_list_id_fkey" FOREIGN KEY ("directory_list_id") REFERENCES "directory_lists"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proformas" ADD CONSTRAINT "proformas_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "RnDProject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proformas" ADD CONSTRAINT "proformas_directory_list_id_fkey" FOREIGN KEY ("directory_list_id") REFERENCES "directory_lists"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proformas" ADD CONSTRAINT "proformas_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
