"use client";

import DataTable from "@/components/rnd/DataTable";

const columns = [
  { key: "lustreCode", label: "Code", required: true },
  { key: "lustreDescription", label: "Description", required: true },
  { key: "lustreDate", label: "Date", type: "date" as const, readonly: true },
  { key: "unitCost", label: "Unit Cost", type: "number" as const },
  { key: "costUnit", label: "Cost Unit" },
  { key: "lustreNotes", label: "Notes" },
];

export default function LustreManagement() {
  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Lustre Management</h1>
        <p className="text-sm text-muted-foreground">
          Manage lustre materials for R&D projects
        </p>
      </div>

      <DataTable
        title="Lustre Materials"
        description="Create and manage lustre materials used in ceramic production"
        apiEndpoint="/api/rnd/materials/luster"
        columns={columns}
        searchPlaceholder="Search lustre materials..."
        addButtonText="Add Lustre Material"
        idField="id"
      />
    </div>
  );
}