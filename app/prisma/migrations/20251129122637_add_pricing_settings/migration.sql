/*
  Warnings:

  - You are about to drop the column `clay` on the `directory_lists` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `directory_lists` table. All the data in the column will be lost.
  - You are about to drop the column `engobe` on the `directory_lists` table. All the data in the column will be lost.
  - You are about to drop the column `glaze` on the `directory_lists` table. All the data in the column will be lost.
  - You are about to drop the column `item_code` on the `directory_lists` table. All the data in the column will be lost.
  - You are about to drop the column `luster` on the `directory_lists` table. All the data in the column will be lost.
  - You are about to drop the column `texture` on the `directory_lists` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "directory_lists" DROP COLUMN "clay",
DROP COLUMN "description",
DROP COLUMN "engobe",
DROP COLUMN "glaze",
DROP COLUMN "item_code",
DROP COLUMN "luster",
DROP COLUMN "texture",
ADD COLUMN     "clay_ids" JSONB,
ADD COLUMN     "engobe_ids" JSONB,
ADD COLUMN     "glaze_ids" JSONB,
ADD COLUMN     "is_decor" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "luster_ids" JSONB,
ADD COLUMN     "price" DOUBLE PRECISION,
ADD COLUMN     "stain_oxide_id" INTEGER,
ADD COLUMN     "technical_notes" TEXT,
ADD COLUMN     "total" DOUBLE PRECISION,
ADD COLUMN     "unit" TEXT;

-- CreateTable
CREATE TABLE "pricing_settings" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "labor_rate_per_minute" DOUBLE PRECISION NOT NULL,
    "clay_cost_per_kg" DOUBLE PRECISION NOT NULL,
    "glaze_cost_per_kg" DOUBLE PRECISION NOT NULL,
    "engobe_cost_per_kg" DOUBLE PRECISION,
    "luster_cost_per_kg" DOUBLE PRECISION,
    "bisque_firing_cost_per_load" DOUBLE PRECISION NOT NULL,
    "glaze_firing_cost_per_load" DOUBLE PRECISION NOT NULL,
    "raku_firing_cost_per_load" DOUBLE PRECISION,
    "luster_firing_cost_per_load" DOUBLE PRECISION,
    "kiln_capacity_pieces" INTEGER NOT NULL DEFAULT 100,
    "overhead_rate" DOUBLE PRECISION NOT NULL,
    "profit_margin" DOUBLE PRECISION NOT NULL,
    "effective_from" TIMESTAMP(3) NOT NULL,
    "effective_to" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pricing_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "production_time_tables" (
    "id" SERIAL NOT NULL,
    "production_method" TEXT NOT NULL,
    "shape_category" TEXT NOT NULL,
    "min_weight_kg" DOUBLE PRECISION NOT NULL,
    "max_weight_kg" DOUBLE PRECISION NOT NULL,
    "forming_minutes" DOUBLE PRECISION NOT NULL,
    "finishing_standard" DOUBLE PRECISION NOT NULL,
    "finishing_medium" DOUBLE PRECISION NOT NULL,
    "finishing_complex" DOUBLE PRECISION NOT NULL,
    "glazing_standard" DOUBLE PRECISION NOT NULL,
    "glazing_medium" DOUBLE PRECISION NOT NULL,
    "glazing_complex" DOUBLE PRECISION NOT NULL,
    "movement_minutes" DOUBLE PRECISION NOT NULL,
    "packaging_minutes" DOUBLE PRECISION NOT NULL,
    "firing_standard_bisque" INTEGER NOT NULL DEFAULT 1,
    "firing_standard_glaze" INTEGER NOT NULL DEFAULT 1,
    "firing_raku_bisque" INTEGER NOT NULL DEFAULT 1,
    "firing_raku_glaze" INTEGER NOT NULL DEFAULT 2,
    "firing_luster_bisque" INTEGER NOT NULL DEFAULT 1,
    "firing_luster_glaze" INTEGER NOT NULL DEFAULT 1,
    "firing_luster_luster" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "production_time_tables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clay_preparation_times" (
    "id" SERIAL NOT NULL,
    "min_weight_kg" DOUBLE PRECISION NOT NULL,
    "max_weight_kg" DOUBLE PRECISION NOT NULL,
    "preparation_minutes" DOUBLE PRECISION NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clay_preparation_times_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "complexity_factors" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "description" TEXT,
    "finishing_multiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "glazing_multiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "complexity_factors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "firing_type_configs" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "description" TEXT,
    "bisque_firings" INTEGER NOT NULL DEFAULT 1,
    "glaze_firings" INTEGER NOT NULL DEFAULT 1,
    "luster_firings" INTEGER NOT NULL DEFAULT 0,
    "cost_multiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "firing_type_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shape_category_configs" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "description" TEXT,
    "time_multiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shape_category_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "production_method_configs" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "description" TEXT,
    "time_multiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "production_method_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "production_time_tables_production_method_shape_category_min_key" ON "production_time_tables"("production_method", "shape_category", "min_weight_kg", "max_weight_kg");

-- CreateIndex
CREATE UNIQUE INDEX "clay_preparation_times_min_weight_kg_max_weight_kg_key" ON "clay_preparation_times"("min_weight_kg", "max_weight_kg");

-- CreateIndex
CREATE UNIQUE INDEX "complexity_factors_name_key" ON "complexity_factors"("name");

-- CreateIndex
CREATE UNIQUE INDEX "firing_type_configs_name_key" ON "firing_type_configs"("name");

-- CreateIndex
CREATE UNIQUE INDEX "shape_category_configs_name_key" ON "shape_category_configs"("name");

-- CreateIndex
CREATE UNIQUE INDEX "production_method_configs_name_key" ON "production_method_configs"("name");

-- AddForeignKey
ALTER TABLE "directory_lists" ADD CONSTRAINT "directory_lists_stain_oxide_id_fkey" FOREIGN KEY ("stain_oxide_id") REFERENCES "tblstainoxide"("id") ON DELETE SET NULL ON UPDATE CASCADE;
