"use client";

import EnhancedDataTable from "@/components/rnd/EnhancedDataTable";

const columns = [
  { key: "toolsCode", label: "Code", required: true },
  { key: "toolsDescription", label: "Description", required: true },
  { key: "toolsDate", label: "Date", type: "date" as const, readonly: true, hidden: true },
  { key: "unitCost", label: "Unit Cost", type: "number" as const, hidden: true },
  { key: "costUnit", label: "Cost Unit", hidden: true },
  { key: "toolsNotes", label: "Notes", hidden: true },
  { key: "isActive", label: "Status", type: "status" as const, required: true },
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

      <EnhancedDataTable
        title="Tools"
        description="Create and manage tools used in ceramic production"
        apiEndpoint="/api/rnd/materials/tools"
        columns={columns}
        searchPlaceholder="Search tools..."
        addButtonText="Add Tool"
        idField="id"
        showStatusFilter={true}
        viewPopupFields={["toolsCode", "toolsDescription", "toolsNotes"]}
      />
    </div>
  );
}