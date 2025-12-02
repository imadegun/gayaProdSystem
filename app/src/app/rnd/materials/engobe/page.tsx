"use client";

import EnhancedDataTable from "@/components/rnd/EnhancedDataTable";

const columns = [
  { key: "engobeCode", label: "Code", required: true },
  { key: "engobeDescription", label: "Description", required: true },
  { key: "engobeDate", label: "Date", type: "date" as const, readonly: true, hidden: true },
  { key: "unitCost", label: "Unit Cost", type: "number" as const, hidden: true },
  { key: "costUnit", label: "Cost Unit", hidden: true },
  { key: "engobeNotes", label: "Notes", hidden: true },
  { key: "isActive", label: "Status", type: "status" as const, required: true },
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

      <EnhancedDataTable
        title="Engobe Materials"
        description="Create and manage engobe materials used in ceramic production"
        apiEndpoint="/api/rnd/materials/engobe"
        columns={columns}
        searchPlaceholder="Search engobe materials..."
        addButtonText="Add Engobe Material"
        idField="id"
        showStatusFilter={true}
        viewPopupFields={["engobeCode", "engobeDescription", "engobeNotes"]}
      />
    </div>
  );
}