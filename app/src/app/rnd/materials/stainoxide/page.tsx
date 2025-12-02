"use client";

import DataTable from "@/components/rnd/DataTable";

const columns = [
  { key: "stainOxideCode", label: "Code", required: true },
  { key: "stainOxideDescription", label: "Description", required: true },
  { key: "stainOxideDate", label: "Date", type: "date" as const, readonly: true },
  { key: "unitCost", label: "Unit Cost", type: "number" as const },
  { key: "costUnit", label: "Cost Unit" },
  { key: "stainOxideNotes", label: "Notes" },
];

export default function StainOxideManagement() {
  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Stain Oxide Management</h1>
        <p className="text-sm text-muted-foreground">
          Manage stain oxide materials for R&D projects
        </p>
      </div>

      <DataTable
        title="Stain Oxide Materials"
        description="Create and manage stain oxide materials used in ceramic production"
        apiEndpoint="/api/rnd/materials/stainoxide"
        columns={columns}
        searchPlaceholder="Search stain oxide materials..."
        addButtonText="Add Stain Oxide Material"
        idField="id"
      />
    </div>
  );
}