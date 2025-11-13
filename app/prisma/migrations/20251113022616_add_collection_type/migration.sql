-- CreateTable
CREATE TABLE "tblcasting" (
    "id" SERIAL NOT NULL,
    "CastingCode" TEXT NOT NULL,
    "CastingDescription" TEXT NOT NULL,
    "CastingDate" TIMESTAMP(3) NOT NULL,
    "CastingTechDraw" TEXT,
    "CastingPhoto1" TEXT,
    "CastingPhoto2" TEXT,
    "CastingPhoto3" TEXT,
    "CastingPhoto4" TEXT,
    "CastingNotes" TEXT,

    CONSTRAINT "tblcasting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tblclay" (
    "id" SERIAL NOT NULL,
    "ClayCode" TEXT NOT NULL,
    "ClayDescription" TEXT NOT NULL,
    "ClayDate" TIMESTAMP(3) NOT NULL,
    "ClayTechDraw" TEXT,
    "ClayPhoto1" TEXT,
    "ClayPhoto2" TEXT,
    "ClayPhoto3" TEXT,
    "ClayPhoto4" TEXT,
    "ClayNotes" TEXT,

    CONSTRAINT "tblclay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tblengobe" (
    "id" SERIAL NOT NULL,
    "EngobeCode" TEXT NOT NULL,
    "EngobeDescription" TEXT NOT NULL,
    "EngobeDate" TIMESTAMP(3) NOT NULL,
    "EngobeTechDraw" TEXT,
    "EngobePhoto1" TEXT,
    "EngobePhoto2" TEXT,
    "EngobePhoto3" TEXT,
    "EngobePhoto4" TEXT,
    "EngobeNotes" TEXT,

    CONSTRAINT "tblengobe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tblestruder" (
    "id" SERIAL NOT NULL,
    "EstruderCode" TEXT NOT NULL,
    "EstruderDescription" TEXT NOT NULL,
    "EstruderDate" TIMESTAMP(3) NOT NULL,
    "EstruderTechDraw" TEXT,
    "EstruderPhoto1" TEXT,
    "EstruderPhoto2" TEXT,
    "EstruderPhoto3" TEXT,
    "EstruderPhoto4" TEXT,
    "EstruderNotes" TEXT,

    CONSTRAINT "tblestruder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tblglaze" (
    "id" SERIAL NOT NULL,
    "GlazeCode" TEXT NOT NULL,
    "GlazeDescription" TEXT NOT NULL,
    "GlazeDate" TIMESTAMP(3) NOT NULL,
    "GlazeTechDraw" TEXT,
    "GlazePhoto1" TEXT,
    "GlazePhoto2" TEXT,
    "GlazePhoto3" TEXT,
    "GlazePhoto4" TEXT,
    "GlazeNotes" TEXT,

    CONSTRAINT "tblglaze_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbllustre" (
    "id" SERIAL NOT NULL,
    "LustreCode" TEXT NOT NULL,
    "LustreDescription" TEXT NOT NULL,
    "LustreDate" TIMESTAMP(3) NOT NULL,
    "LustreTechDraw" TEXT,
    "LustrePhoto1" TEXT,
    "LustrePhoto2" TEXT,
    "LustrePhoto3" TEXT,
    "LustrePhoto4" TEXT,
    "LustreNotes" TEXT,

    CONSTRAINT "tbllustre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tblstainoxide" (
    "id" SERIAL NOT NULL,
    "StainOxideCode" TEXT NOT NULL,
    "StainOxideDescription" TEXT NOT NULL,
    "StainOxideDate" TIMESTAMP(3) NOT NULL,
    "StainOxideTechDraw" TEXT,
    "StainOxidePhoto1" TEXT,
    "StainOxidePhoto2" TEXT,
    "StainOxidePhoto3" TEXT,
    "StainOxidePhoto4" TEXT,
    "StainOxideNotes" TEXT,

    CONSTRAINT "tblstainoxide_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbltexture" (
    "id" SERIAL NOT NULL,
    "TextureCode" TEXT NOT NULL,
    "TextureDescription" TEXT NOT NULL,
    "TextureDate" TIMESTAMP(3) NOT NULL,
    "TextureTechDraw" TEXT,
    "TexturePhoto1" TEXT,
    "TexturePhoto2" TEXT,
    "TexturePhoto3" TEXT,
    "TexturePhoto4" TEXT,
    "TextureNotes" TEXT,

    CONSTRAINT "tbltexture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbltools" (
    "id" SERIAL NOT NULL,
    "ToolsCode" TEXT NOT NULL,
    "ToolsDescription" TEXT NOT NULL,
    "ToolsDate" TIMESTAMP(3) NOT NULL,
    "ToolsTechDraw" TEXT,
    "ToolsPhoto1" TEXT,
    "ToolsPhoto2" TEXT,
    "ToolsPhoto3" TEXT,
    "ToolsPhoto4" TEXT,
    "ToolsNotes" TEXT,

    CONSTRAINT "tbltools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_clays" (
    "id" SERIAL NOT NULL,
    "collect_code" TEXT NOT NULL,
    "clay_id" INTEGER NOT NULL,
    "sequence" INTEGER,
    "quantity" DOUBLE PRECISION,
    "clay_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_clays_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_castings" (
    "id" SERIAL NOT NULL,
    "collect_code" TEXT NOT NULL,
    "casting_id" INTEGER NOT NULL,
    "sequence" INTEGER,
    "casting_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_castings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_estruders" (
    "id" SERIAL NOT NULL,
    "collect_code" TEXT NOT NULL,
    "estruder_id" INTEGER NOT NULL,
    "sequence" INTEGER,
    "estruder_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_estruders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_textures" (
    "id" SERIAL NOT NULL,
    "collect_code" TEXT NOT NULL,
    "texture_id" INTEGER NOT NULL,
    "sequence" INTEGER,
    "texture_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_textures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_tools" (
    "id" SERIAL NOT NULL,
    "collect_code" TEXT NOT NULL,
    "tools_id" INTEGER NOT NULL,
    "sequence" INTEGER,
    "tools_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_tools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_engobes" (
    "id" SERIAL NOT NULL,
    "collect_code" TEXT NOT NULL,
    "engobe_id" INTEGER NOT NULL,
    "sequence" INTEGER,
    "engobe_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_engobes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_stain_oxides" (
    "id" SERIAL NOT NULL,
    "collect_code" TEXT NOT NULL,
    "stain_oxide_id" INTEGER NOT NULL,
    "sequence" INTEGER,
    "stain_oxide_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_stain_oxides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_lustres" (
    "id" SERIAL NOT NULL,
    "collect_code" TEXT NOT NULL,
    "lustre_id" INTEGER NOT NULL,
    "sequence" INTEGER,
    "lustre_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_lustres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_glazes" (
    "id" SERIAL NOT NULL,
    "collect_code" TEXT NOT NULL,
    "glaze_id" INTEGER NOT NULL,
    "sequence" INTEGER,
    "glaze_density" TEXT,
    "glaze_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_glazes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tblcollect_master" (
    "id" SERIAL NOT NULL,
    "collect_code" TEXT NOT NULL,
    "assembly_code" TEXT,
    "design_code" TEXT,
    "name_code" TEXT,
    "category_code" TEXT,
    "size_code" TEXT,
    "texture_code" TEXT,
    "color_code" TEXT,
    "material_code" TEXT,
    "client_code" TEXT,
    "client_description" TEXT,
    "collection_type" TEXT,
    "collect_date" TIMESTAMP(3),
    "tech_draw" TEXT,
    "photo1" TEXT,
    "photo2" TEXT,
    "photo3" TEXT,
    "photo4" TEXT,
    "is_assembly" BOOLEAN NOT NULL DEFAULT false,
    "assembly_components" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tblcollect_master_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tblcollect_category" (
    "category_code" TEXT NOT NULL,
    "category_name" TEXT NOT NULL,

    CONSTRAINT "tblcollect_category_pkey" PRIMARY KEY ("category_code")
);

-- CreateTable
CREATE TABLE "tblcollect_color" (
    "color_code" TEXT NOT NULL,
    "color_name" TEXT NOT NULL,

    CONSTRAINT "tblcollect_color_pkey" PRIMARY KEY ("color_code")
);

-- CreateTable
CREATE TABLE "tblcollect_design" (
    "design_code" TEXT NOT NULL,
    "design_name" TEXT NOT NULL,

    CONSTRAINT "tblcollect_design_pkey" PRIMARY KEY ("design_code")
);

-- CreateTable
CREATE TABLE "tblcollect_material" (
    "material_code" TEXT NOT NULL,
    "material_name" TEXT NOT NULL,

    CONSTRAINT "tblcollect_material_pkey" PRIMARY KEY ("material_code")
);

-- CreateTable
CREATE TABLE "tblcollect_name" (
    "name_code" TEXT NOT NULL,
    "name_value" TEXT NOT NULL,

    CONSTRAINT "tblcollect_name_pkey" PRIMARY KEY ("name_code")
);

-- CreateTable
CREATE TABLE "tblcollect_size" (
    "size_code" TEXT NOT NULL,
    "size_name" TEXT NOT NULL,

    CONSTRAINT "tblcollect_size_pkey" PRIMARY KEY ("size_code")
);

-- CreateTable
CREATE TABLE "tblcollect_texture" (
    "texture_code" TEXT NOT NULL,
    "texture_name" TEXT NOT NULL,

    CONSTRAINT "tblcollect_texture_pkey" PRIMARY KEY ("texture_code")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "email" TEXT,
    "role" TEXT NOT NULL,
    "sub_role" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "employee_code" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "photo_url" TEXT,
    "department" TEXT,
    "position" TEXT,
    "hire_date" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" SERIAL NOT NULL,
    "client_code" TEXT NOT NULL,
    "client_description" TEXT NOT NULL,
    "region" TEXT,
    "department" TEXT,
    "contact_person" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseOrder" (
    "id" SERIAL NOT NULL,
    "po_number" TEXT NOT NULL,
    "client_id" INTEGER NOT NULL,
    "order_date" TIMESTAMP(3) NOT NULL,
    "deposit_amount" DOUBLE PRECISION,
    "deposit_paid" BOOLEAN NOT NULL DEFAULT false,
    "deposit_paid_date" TIMESTAMP(3),
    "total_amount" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "notes" TEXT,
    "created_by" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PurchaseOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductionStage" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "sequence_order" INTEGER NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ProductionStage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkPlan" (
    "id" SERIAL NOT NULL,
    "week_start" TIMESTAMP(3) NOT NULL,
    "week_end" TIMESTAMP(3) NOT NULL,
    "plan_type" TEXT NOT NULL DEFAULT 'production',
    "printed" BOOLEAN NOT NULL DEFAULT false,
    "printed_date" TIMESTAMP(3),
    "created_by" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkPlanAssignment" (
    "id" SERIAL NOT NULL,
    "work_plan_id" INTEGER NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "production_stage_id" INTEGER NOT NULL,
    "collect_code" TEXT NOT NULL,
    "planned_quantity" INTEGER NOT NULL,
    "target_quantity" INTEGER,
    "process_name" TEXT,
    "day_of_week" INTEGER NOT NULL,
    "is_overtime" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkPlanAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductionRecap" (
    "id" SERIAL NOT NULL,
    "work_plan_assignment_id" INTEGER NOT NULL,
    "recap_date" TIMESTAMP(3) NOT NULL,
    "actual_quantity" INTEGER NOT NULL,
    "goodQuantity" INTEGER,
    "reject_quantity" INTEGER NOT NULL DEFAULT 0,
    "re_fire_quantity" INTEGER NOT NULL DEFAULT 0,
    "second_quality_quantity" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "recorded_by" INTEGER NOT NULL,
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductionRecap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QcResult" (
    "id" SERIAL NOT NULL,
    "production_recaps_id" INTEGER NOT NULL,
    "po_number" TEXT,
    "collect_code" TEXT NOT NULL,
    "qc_stage" TEXT NOT NULL,
    "good_quantity" INTEGER NOT NULL DEFAULT 0,
    "re_fire_quantity" INTEGER NOT NULL DEFAULT 0,
    "reject_quantity" INTEGER NOT NULL DEFAULT 0,
    "second_quality_quantity" INTEGER NOT NULL DEFAULT 0,
    "qc_notes" TEXT,
    "inspected_by" INTEGER NOT NULL,
    "inspected_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QcResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockItem" (
    "id" SERIAL NOT NULL,
    "qc_result_id" INTEGER NOT NULL,
    "collect_code" TEXT NOT NULL,
    "po_number" TEXT,
    "quantity" INTEGER NOT NULL,
    "grade" TEXT NOT NULL,
    "unit_cost" DOUBLE PRECISION,
    "selling_price" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'available',
    "location" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RevisionTicket" (
    "id" SERIAL NOT NULL,
    "ticket_number" TEXT NOT NULL,
    "po_number" TEXT,
    "collect_code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "purpose" TEXT,
    "explanation" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "attachments" JSONB,
    "submitted_by" INTEGER NOT NULL,
    "approved_by" INTEGER,
    "approved_at" TIMESTAMP(3),
    "implemented_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RevisionTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemLog" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "action" TEXT NOT NULL,
    "entity_type" TEXT,
    "entityId" INTEGER,
    "old_values" JSONB,
    "new_values" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SystemLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerformanceAssessment" (
    "id" SERIAL NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "assessment_date" TIMESTAMP(3) NOT NULL,
    "period_start" TIMESTAMP(3),
    "period_end" TIMESTAMP(3),
    "plus_points" INTEGER NOT NULL DEFAULT 0,
    "minus_points" INTEGER NOT NULL DEFAULT 0,
    "assessment_notes" TEXT,
    "assessed_by" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PerformanceAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendanceRecord" (
    "id" SERIAL NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "record_date" TIMESTAMP(3) NOT NULL,
    "check_in_time" TIMESTAMP(3),
    "check_out_time" TIMESTAMP(3),
    "hours_worked" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'present',
    "notes" TEXT,
    "recorded_by" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AttendanceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ProductionStageToPurchaseOrder" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ProductionStageToPurchaseOrder_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "tblcasting_CastingCode_key" ON "tblcasting"("CastingCode");

-- CreateIndex
CREATE UNIQUE INDEX "tblclay_ClayCode_key" ON "tblclay"("ClayCode");

-- CreateIndex
CREATE UNIQUE INDEX "tblengobe_EngobeCode_key" ON "tblengobe"("EngobeCode");

-- CreateIndex
CREATE UNIQUE INDEX "tblestruder_EstruderCode_key" ON "tblestruder"("EstruderCode");

-- CreateIndex
CREATE UNIQUE INDEX "tblglaze_GlazeCode_key" ON "tblglaze"("GlazeCode");

-- CreateIndex
CREATE UNIQUE INDEX "tbllustre_LustreCode_key" ON "tbllustre"("LustreCode");

-- CreateIndex
CREATE UNIQUE INDEX "tblstainoxide_StainOxideCode_key" ON "tblstainoxide"("StainOxideCode");

-- CreateIndex
CREATE UNIQUE INDEX "tbltexture_TextureCode_key" ON "tbltexture"("TextureCode");

-- CreateIndex
CREATE UNIQUE INDEX "tbltools_ToolsCode_key" ON "tbltools"("ToolsCode");

-- CreateIndex
CREATE UNIQUE INDEX "product_clays_collect_code_clay_id_key" ON "product_clays"("collect_code", "clay_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_castings_collect_code_casting_id_key" ON "product_castings"("collect_code", "casting_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_estruders_collect_code_estruder_id_key" ON "product_estruders"("collect_code", "estruder_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_textures_collect_code_texture_id_key" ON "product_textures"("collect_code", "texture_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_tools_collect_code_tools_id_key" ON "product_tools"("collect_code", "tools_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_engobes_collect_code_engobe_id_key" ON "product_engobes"("collect_code", "engobe_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_stain_oxides_collect_code_stain_oxide_id_key" ON "product_stain_oxides"("collect_code", "stain_oxide_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_lustres_collect_code_lustre_id_key" ON "product_lustres"("collect_code", "lustre_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_glazes_collect_code_glaze_id_key" ON "product_glazes"("collect_code", "glaze_id");

-- CreateIndex
CREATE UNIQUE INDEX "tblcollect_master_collect_code_key" ON "tblcollect_master"("collect_code");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_employee_code_key" ON "Employee"("employee_code");

-- CreateIndex
CREATE UNIQUE INDEX "Client_client_code_key" ON "Client"("client_code");

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseOrder_po_number_key" ON "PurchaseOrder"("po_number");

-- CreateIndex
CREATE UNIQUE INDEX "ProductionStage_code_key" ON "ProductionStage"("code");

-- CreateIndex
CREATE UNIQUE INDEX "RevisionTicket_ticket_number_key" ON "RevisionTicket"("ticket_number");

-- CreateIndex
CREATE INDEX "_ProductionStageToPurchaseOrder_B_index" ON "_ProductionStageToPurchaseOrder"("B");

-- AddForeignKey
ALTER TABLE "product_clays" ADD CONSTRAINT "product_clays_collect_code_fkey" FOREIGN KEY ("collect_code") REFERENCES "tblcollect_master"("collect_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_clays" ADD CONSTRAINT "product_clays_clay_id_fkey" FOREIGN KEY ("clay_id") REFERENCES "tblclay"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_castings" ADD CONSTRAINT "product_castings_collect_code_fkey" FOREIGN KEY ("collect_code") REFERENCES "tblcollect_master"("collect_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_castings" ADD CONSTRAINT "product_castings_casting_id_fkey" FOREIGN KEY ("casting_id") REFERENCES "tblcasting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_estruders" ADD CONSTRAINT "product_estruders_collect_code_fkey" FOREIGN KEY ("collect_code") REFERENCES "tblcollect_master"("collect_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_estruders" ADD CONSTRAINT "product_estruders_estruder_id_fkey" FOREIGN KEY ("estruder_id") REFERENCES "tblestruder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_textures" ADD CONSTRAINT "product_textures_collect_code_fkey" FOREIGN KEY ("collect_code") REFERENCES "tblcollect_master"("collect_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_textures" ADD CONSTRAINT "product_textures_texture_id_fkey" FOREIGN KEY ("texture_id") REFERENCES "tbltexture"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_tools" ADD CONSTRAINT "product_tools_collect_code_fkey" FOREIGN KEY ("collect_code") REFERENCES "tblcollect_master"("collect_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_tools" ADD CONSTRAINT "product_tools_tools_id_fkey" FOREIGN KEY ("tools_id") REFERENCES "tbltools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_engobes" ADD CONSTRAINT "product_engobes_collect_code_fkey" FOREIGN KEY ("collect_code") REFERENCES "tblcollect_master"("collect_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_engobes" ADD CONSTRAINT "product_engobes_engobe_id_fkey" FOREIGN KEY ("engobe_id") REFERENCES "tblengobe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_stain_oxides" ADD CONSTRAINT "product_stain_oxides_collect_code_fkey" FOREIGN KEY ("collect_code") REFERENCES "tblcollect_master"("collect_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_stain_oxides" ADD CONSTRAINT "product_stain_oxides_stain_oxide_id_fkey" FOREIGN KEY ("stain_oxide_id") REFERENCES "tblstainoxide"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_lustres" ADD CONSTRAINT "product_lustres_collect_code_fkey" FOREIGN KEY ("collect_code") REFERENCES "tblcollect_master"("collect_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_lustres" ADD CONSTRAINT "product_lustres_lustre_id_fkey" FOREIGN KEY ("lustre_id") REFERENCES "tbllustre"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_glazes" ADD CONSTRAINT "product_glazes_collect_code_fkey" FOREIGN KEY ("collect_code") REFERENCES "tblcollect_master"("collect_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_glazes" ADD CONSTRAINT "product_glazes_glaze_id_fkey" FOREIGN KEY ("glaze_id") REFERENCES "tblglaze"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tblcollect_master" ADD CONSTRAINT "tblcollect_master_category_code_fkey" FOREIGN KEY ("category_code") REFERENCES "tblcollect_category"("category_code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tblcollect_master" ADD CONSTRAINT "tblcollect_master_color_code_fkey" FOREIGN KEY ("color_code") REFERENCES "tblcollect_color"("color_code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tblcollect_master" ADD CONSTRAINT "tblcollect_master_design_code_fkey" FOREIGN KEY ("design_code") REFERENCES "tblcollect_design"("design_code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tblcollect_master" ADD CONSTRAINT "tblcollect_master_material_code_fkey" FOREIGN KEY ("material_code") REFERENCES "tblcollect_material"("material_code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tblcollect_master" ADD CONSTRAINT "tblcollect_master_name_code_fkey" FOREIGN KEY ("name_code") REFERENCES "tblcollect_name"("name_code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tblcollect_master" ADD CONSTRAINT "tblcollect_master_size_code_fkey" FOREIGN KEY ("size_code") REFERENCES "tblcollect_size"("size_code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tblcollect_master" ADD CONSTRAINT "tblcollect_master_texture_code_fkey" FOREIGN KEY ("texture_code") REFERENCES "tblcollect_texture"("texture_code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkPlan" ADD CONSTRAINT "WorkPlan_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkPlanAssignment" ADD CONSTRAINT "WorkPlanAssignment_work_plan_id_fkey" FOREIGN KEY ("work_plan_id") REFERENCES "WorkPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkPlanAssignment" ADD CONSTRAINT "WorkPlanAssignment_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkPlanAssignment" ADD CONSTRAINT "WorkPlanAssignment_production_stage_id_fkey" FOREIGN KEY ("production_stage_id") REFERENCES "ProductionStage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkPlanAssignment" ADD CONSTRAINT "WorkPlanAssignment_collect_code_fkey" FOREIGN KEY ("collect_code") REFERENCES "tblcollect_master"("collect_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionRecap" ADD CONSTRAINT "ProductionRecap_work_plan_assignment_id_fkey" FOREIGN KEY ("work_plan_assignment_id") REFERENCES "WorkPlanAssignment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionRecap" ADD CONSTRAINT "ProductionRecap_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QcResult" ADD CONSTRAINT "QcResult_production_recaps_id_fkey" FOREIGN KEY ("production_recaps_id") REFERENCES "ProductionRecap"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QcResult" ADD CONSTRAINT "QcResult_inspected_by_fkey" FOREIGN KEY ("inspected_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockItem" ADD CONSTRAINT "StockItem_qc_result_id_fkey" FOREIGN KEY ("qc_result_id") REFERENCES "QcResult"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RevisionTicket" ADD CONSTRAINT "RevisionTicket_submitted_by_fkey" FOREIGN KEY ("submitted_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RevisionTicket" ADD CONSTRAINT "RevisionTicket_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SystemLog" ADD CONSTRAINT "SystemLog_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformanceAssessment" ADD CONSTRAINT "PerformanceAssessment_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformanceAssessment" ADD CONSTRAINT "PerformanceAssessment_assessed_by_fkey" FOREIGN KEY ("assessed_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductionStageToPurchaseOrder" ADD CONSTRAINT "_ProductionStageToPurchaseOrder_A_fkey" FOREIGN KEY ("A") REFERENCES "ProductionStage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductionStageToPurchaseOrder" ADD CONSTRAINT "_ProductionStageToPurchaseOrder_B_fkey" FOREIGN KEY ("B") REFERENCES "PurchaseOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
