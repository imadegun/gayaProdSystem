"use client";

import EnhancedDataTable from "@/components/rnd/EnhancedDataTable";

const columns = [
  { key: "lustreCode", label: "Code", required: true },
  { key: "lustreDescription", label: "Description", required: true },
  { key: "lustreDate", label: "Date", type: "date" as const, readonly: true, hidden: true },
  { key: "unitCost", label: "Unit Cost", type: "number" as const, hidden: true },
  { key: "costUnit", label: "Cost Unit", hidden: true },
  { key: "lustreNotes", label: "Notes", hidden: true },
  { key: "isActive", label: "Status", type: "status" as const, required: true },
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

      <EnhancedDataTable
        title="Lustre Materials"
        description="Create and manage lustre materials used in ceramic production"
        apiEndpoint="/api/rnd/materials/luster"
        columns={columns}
        searchPlaceholder="Search lustre materials..."
        addButtonText="Add Lustre Material"
        idField="id"
        showStatusFilter={true}
        viewPopupFields={["lustreCode", "lustreDescription", "lustreNotes"]}
      />
    </div>
  );
}