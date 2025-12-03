-- AlterTable
ALTER TABLE "tbltexture" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "tbltools" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "collections" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "designCode" TEXT,
    "nameCode" TEXT,
    "categoryCode" TEXT,
    "sizeCode" TEXT,
    "textureCode" TEXT,
    "colorCode" TEXT,
    "materialCode" TEXT,
    "clientCode" TEXT,
    "clientDescription" TEXT,
    "technicalDrawing" TEXT,
    "photos" JSONB,
    "isAssembly" BOOLEAN NOT NULL DEFAULT false,
    "assemblyComponents" JSONB,
    "collectionType" TEXT NOT NULL DEFAULT 'R&D',
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "isOrdered" BOOLEAN NOT NULL DEFAULT false,
    "approvalDate" TIMESTAMP(3),
    "orderDate" TIMESTAMP(3),
    "rndUserId" INTEGER,
    "clientId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collection_transitions" (
    "id" SERIAL NOT NULL,
    "rnd_collection_id" INTEGER NOT NULL,
    "client_collection_id" INTEGER,
    "transition_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transition_type" TEXT NOT NULL,
    "notes" TEXT,
    "created_by" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "collection_transitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CollectionClays" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CollectionClays_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CollectionCastings" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CollectionCastings_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CollectionEstruders" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CollectionEstruders_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CollectionTextures" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CollectionTextures_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CollectionTools" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CollectionTools_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CollectionEngobes" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CollectionEngobes_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CollectionStainOxides" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CollectionStainOxides_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CollectionLustres" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CollectionLustres_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CollectionGlazes" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CollectionGlazes_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CollectionWorkPlans" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CollectionWorkPlans_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "collections_code_key" ON "collections"("code");

-- CreateIndex
CREATE INDEX "_CollectionClays_B_index" ON "_CollectionClays"("B");

-- CreateIndex
CREATE INDEX "_CollectionCastings_B_index" ON "_CollectionCastings"("B");

-- CreateIndex
CREATE INDEX "_CollectionEstruders_B_index" ON "_CollectionEstruders"("B");

-- CreateIndex
CREATE INDEX "_CollectionTextures_B_index" ON "_CollectionTextures"("B");

-- CreateIndex
CREATE INDEX "_CollectionTools_B_index" ON "_CollectionTools"("B");

-- CreateIndex
CREATE INDEX "_CollectionEngobes_B_index" ON "_CollectionEngobes"("B");

-- CreateIndex
CREATE INDEX "_CollectionStainOxides_B_index" ON "_CollectionStainOxides"("B");

-- CreateIndex
CREATE INDEX "_CollectionLustres_B_index" ON "_CollectionLustres"("B");

-- CreateIndex
CREATE INDEX "_CollectionGlazes_B_index" ON "_CollectionGlazes"("B");

-- CreateIndex
CREATE INDEX "_CollectionWorkPlans_B_index" ON "_CollectionWorkPlans"("B");

-- AddForeignKey
ALTER TABLE "collections" ADD CONSTRAINT "collections_rndUserId_fkey" FOREIGN KEY ("rndUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collections" ADD CONSTRAINT "collections_clientCode_fkey" FOREIGN KEY ("clientCode") REFERENCES "tblcollect_design"("design_code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collections" ADD CONSTRAINT "collections_categoryCode_fkey" FOREIGN KEY ("categoryCode") REFERENCES "tblcollect_category"("category_code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collections" ADD CONSTRAINT "collections_colorCode_fkey" FOREIGN KEY ("colorCode") REFERENCES "tblcollect_color"("color_code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collections" ADD CONSTRAINT "collections_materialCode_fkey" FOREIGN KEY ("materialCode") REFERENCES "tblcollect_material"("material_code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collections" ADD CONSTRAINT "collections_nameCode_fkey" FOREIGN KEY ("nameCode") REFERENCES "tblcollect_name"("name_code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collections" ADD CONSTRAINT "collections_sizeCode_fkey" FOREIGN KEY ("sizeCode") REFERENCES "tblcollect_size"("size_code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collections" ADD CONSTRAINT "collections_textureCode_fkey" FOREIGN KEY ("textureCode") REFERENCES "tblcollect_texture"("texture_code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_transitions" ADD CONSTRAINT "collection_transitions_rnd_collection_id_fkey" FOREIGN KEY ("rnd_collection_id") REFERENCES "collections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_transitions" ADD CONSTRAINT "collection_transitions_client_collection_id_fkey" FOREIGN KEY ("client_collection_id") REFERENCES "collections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_transitions" ADD CONSTRAINT "collection_transitions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CollectionClays" ADD CONSTRAINT "_CollectionClays_A_fkey" FOREIGN KEY ("A") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CollectionClays" ADD CONSTRAINT "_CollectionClays_B_fkey" FOREIGN KEY ("B") REFERENCES "product_clays"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CollectionCastings" ADD CONSTRAINT "_CollectionCastings_A_fkey" FOREIGN KEY ("A") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CollectionCastings" ADD CONSTRAINT "_CollectionCastings_B_fkey" FOREIGN KEY ("B") REFERENCES "product_castings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CollectionEstruders" ADD CONSTRAINT "_CollectionEstruders_A_fkey" FOREIGN KEY ("A") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CollectionEstruders" ADD CONSTRAINT "_CollectionEstruders_B_fkey" FOREIGN KEY ("B") REFERENCES "product_estruders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CollectionTextures" ADD CONSTRAINT "_CollectionTextures_A_fkey" FOREIGN KEY ("A") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CollectionTextures" ADD CONSTRAINT "_CollectionTextures_B_fkey" FOREIGN KEY ("B") REFERENCES "product_textures"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CollectionTools" ADD CONSTRAINT "_CollectionTools_A_fkey" FOREIGN KEY ("A") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CollectionTools" ADD CONSTRAINT "_CollectionTools_B_fkey" FOREIGN KEY ("B") REFERENCES "product_tools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CollectionEngobes" ADD CONSTRAINT "_CollectionEngobes_A_fkey" FOREIGN KEY ("A") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CollectionEngobes" ADD CONSTRAINT "_CollectionEngobes_B_fkey" FOREIGN KEY ("B") REFERENCES "product_engobes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CollectionStainOxides" ADD CONSTRAINT "_CollectionStainOxides_A_fkey" FOREIGN KEY ("A") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CollectionStainOxides" ADD CONSTRAINT "_CollectionStainOxides_B_fkey" FOREIGN KEY ("B") REFERENCES "product_stain_oxides"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CollectionLustres" ADD CONSTRAINT "_CollectionLustres_A_fkey" FOREIGN KEY ("A") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CollectionLustres" ADD CONSTRAINT "_CollectionLustres_B_fkey" FOREIGN KEY ("B") REFERENCES "product_lustres"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CollectionGlazes" ADD CONSTRAINT "_CollectionGlazes_A_fkey" FOREIGN KEY ("A") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CollectionGlazes" ADD CONSTRAINT "_CollectionGlazes_B_fkey" FOREIGN KEY ("B") REFERENCES "product_glazes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CollectionWorkPlans" ADD CONSTRAINT "_CollectionWorkPlans_A_fkey" FOREIGN KEY ("A") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CollectionWorkPlans" ADD CONSTRAINT "_CollectionWorkPlans_B_fkey" FOREIGN KEY ("B") REFERENCES "WorkPlanAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
