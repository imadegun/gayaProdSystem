"use client";

import DataTable from "@/components/rnd/DataTable";

const columns = [
  { key: "textureCode", label: "Code", required: true },
  { key: "textureDescription", label: "Description", required: true },
  { key: "textureDate", label: "Date", type: "date" as const, readonly: true },
  { key: "unitCost", label: "Unit Cost", type: "number" as const },
  { key: "costUnit", label: "Cost Unit" },
  { key: "textureNotes", label: "Notes" },
];

export default function TextureManagement() {
  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Texture Management</h1>
        <p className="text-sm text-muted-foreground">
          Manage texture materials for R&D projects
        </p>
      </div>

      <DataTable
        title="Texture Materials"
        description="Create and manage texture materials used in ceramic production"
        apiEndpoint="/api/rnd/materials/texture"
        columns={columns}
        searchPlaceholder="Search texture materials..."
        addButtonText="Add Texture Material"
        idField="id"
      />
    </div>
  );
}