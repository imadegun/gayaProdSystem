"use client";

import DataTable from "@/components/rnd/DataTable";

const columns = [
  { key: "engobeCode", label: "Code", required: true },
  { key: "engobeDescription", label: "Description", required: true },
  { key: "engobeDate", label: "Date", type: "date" as const, readonly: true },
  { key: "unitCost", label: "Unit Cost", type: "number" as const },
  { key: "costUnit", label: "Cost Unit" },
  { key: "engobeNotes", label: "Notes" },
];

export default function EngobeManagement() {
  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Engobe Management</h1>
        <p className="text-sm text-muted-foreground">
          Manage engobe materials for R&D projects
        </p>
      </div>

      <DataTable
        title="Engobe Materials"
        description="Create and manage engobe materials used in ceramic production"
        apiEndpoint="/api/rnd/materials/engobe"
        columns={columns}
        searchPlaceholder="Search engobe materials..."
        addButtonText="Add Engobe Material"
        idField="id"
      />
    </div>
  );
}