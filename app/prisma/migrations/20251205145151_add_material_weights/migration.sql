/*
  Warnings:

  - You are about to drop the column `clay_ids` on the `directory_lists` table. All the data in the column will be lost.
  - You are about to drop the column `engobe_ids` on the `directory_lists` table. All the data in the column will be lost.
  - You are about to drop the column `glaze_ids` on the `directory_lists` table. All the data in the column will be lost.
  - You are about to drop the column `luster_ids` on the `directory_lists` table. All the data in the column will be lost.

*/

-- Step 1: Add new columns
ALTER TABLE "directory_lists" 
ADD COLUMN "clay_materials" JSONB,
ADD COLUMN "engobe_materials" JSONB,
ADD COLUMN "glaze_materials" JSONB,
ADD COLUMN "luster_materials" JSONB;

-- Step 2: Migrate data from old format [1,2,3] to new format [{id:1,weight:null},{id:2,weight:null}]
-- Transform clay_ids
UPDATE "directory_lists" 
SET "clay_materials" = (
  SELECT jsonb_agg(jsonb_build_object('id', value::int, 'weight', null))
  FROM jsonb_array_elements_text(COALESCE("clay_ids"::jsonb, '[]'::jsonb))
)
WHERE "clay_ids" IS NOT NULL AND "clay_ids"::text != '[]';

-- Transform glaze_ids
UPDATE "directory_lists" 
SET "glaze_materials" = (
  SELECT jsonb_agg(jsonb_build_object('id', value::int, 'weight', null))
  FROM jsonb_array_elements_text(COALESCE("glaze_ids"::jsonb, '[]'::jsonb))
)
WHERE "glaze_ids" IS NOT NULL AND "glaze_ids"::text != '[]';

-- Transform engobe_ids
UPDATE "directory_lists" 
SET "engobe_materials" = (
  SELECT jsonb_agg(jsonb_build_object('id', value::int, 'weight', null))
  FROM jsonb_array_elements_text(COALESCE("engobe_ids"::jsonb, '[]'::jsonb))
)
WHERE "engobe_ids" IS NOT NULL AND "engobe_ids"::text != '[]';

-- Transform luster_ids
UPDATE "directory_lists" 
SET "luster_materials" = (
  SELECT jsonb_agg(jsonb_build_object('id', value::int, 'weight', null))
  FROM jsonb_array_elements_text(COALESCE("luster_ids"::jsonb, '[]'::jsonb))
)
WHERE "luster_ids" IS NOT NULL AND "luster_ids"::text != '[]';

-- Step 3: Drop old columns
ALTER TABLE "directory_lists" 
DROP COLUMN "clay_ids",
DROP COLUMN "engobe_ids",
DROP COLUMN "glaze_ids",
DROP COLUMN "luster_ids";
