"use client";

import DataTable from "@/components/rnd/DataTable";

const columns = [
  { key: "toolsCode", label: "Code", required: true },
  { key: "toolsDescription", label: "Description", required: true },
  { key: "toolsDate", label: "Date", type: "date" as const, readonly: true },
  { key: "unitCost", label: "Unit Cost", type: "number" as const },
  { key: "costUnit", label: "Cost Unit" },
  { key: "toolsNotes", label: "Notes" },
];

export default function ToolsManagement() {
  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tools Management</h1>
        <p className="text-sm text-muted-foreground">
          Manage tools for R&D projects
        </p>
      </div>

      <DataTable
        title="Tools"
        description="Create and manage tools used in ceramic production"
        apiEndpoint="/api/rnd/materials/tools"
        columns={columns}
        searchPlaceholder="Search tools..."
        addButtonText="Add Tool"
        idField="id"
      />
    </div>
  );
}