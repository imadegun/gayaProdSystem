"use client";

import DataTable from "@/components/rnd/DataTable";

const columns = [
  { key: "clayCode", label: "Code", required: true },
  { key: "clayDescription", label: "Description", required: true },
  { key: "clayDate", label: "Date", type: "date" as const, readonly: true },
  { key: "unitCost", label: "Unit Cost", type: "number" as const },
  { key: "costUnit", label: "Cost Unit" },
  { key: "clayNotes", label: "Notes" },
];

export default function ClayManagement() {
  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Clay Management</h1>
        <p className="text-sm text-muted-foreground">
          Manage clay materials for R&D projects
        </p>
      </div>

      <DataTable
        title="Clay Materials"
        description="Create and manage clay materials used in ceramic production"
        apiEndpoint="/api/rnd/materials/clay"
        columns={columns}
        searchPlaceholder="Search clay materials..."
        addButtonText="Add Clay Material"
        idField="id"
      />
    </div>
  );
}