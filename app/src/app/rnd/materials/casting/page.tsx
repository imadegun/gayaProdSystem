"use client";

import DataTable from "@/components/rnd/DataTable";

const columns = [
  { key: "castingCode", label: "Code", required: true },
  { key: "castingDescription", label: "Description", required: true },
  { key: "castingDate", label: "Date", type: "date" as const, readonly: true },
  { key: "unitCost", label: "Unit Cost", type: "number" as const },
  { key: "costUnit", label: "Cost Unit" },
  { key: "castingNotes", label: "Notes" },
];

export default function CastingManagement() {
  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Casting Management</h1>
        <p className="text-sm text-muted-foreground">
          Manage casting materials for R&D projects
        </p>
      </div>

      <DataTable
        title="Casting Materials"
        description="Create and manage casting materials used in ceramic production"
        apiEndpoint="/api/rnd/materials/casting"
        columns={columns}
        searchPlaceholder="Search casting materials..."
        addButtonText="Add Casting Material"
        idField="id"
      />
    </div>
  );
}