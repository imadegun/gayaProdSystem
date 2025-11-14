-- AlterTable
ALTER TABLE "ProductionStage" ADD COLUMN     "labor_cost_per_hour" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "proformas" ADD COLUMN     "pricing_details" JSONB;

-- AlterTable
ALTER TABLE "tblcasting" ADD COLUMN     "cost_unit" TEXT DEFAULT 'USE',
ADD COLUMN     "unit_cost" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "tblclay" ADD COLUMN     "cost_unit" TEXT DEFAULT 'KG',
ADD COLUMN     "unit_cost" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "tblengobe" ADD COLUMN     "cost_unit" TEXT DEFAULT 'KG',
ADD COLUMN     "unit_cost" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "tblestruder" ADD COLUMN     "cost_unit" TEXT DEFAULT 'USE',
ADD COLUMN     "unit_cost" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "tblglaze" ADD COLUMN     "cost_unit" TEXT DEFAULT 'KG',
ADD COLUMN     "unit_cost" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "tbllustre" ADD COLUMN     "cost_unit" TEXT DEFAULT 'KG',
ADD COLUMN     "unit_cost" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "tblstainoxide" ADD COLUMN     "cost_unit" TEXT DEFAULT 'KG',
ADD COLUMN     "unit_cost" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "tbltexture" ADD COLUMN     "cost_unit" TEXT DEFAULT 'KG',
ADD COLUMN     "unit_cost" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "tbltools" ADD COLUMN     "cost_unit" TEXT DEFAULT 'USE',
ADD COLUMN     "unit_cost" DOUBLE PRECISION;
