"use client";

import EnhancedDataTable from "@/components/rnd/EnhancedDataTable";

const columns = [
  { key: "glazeCode", label: "Code", required: true },
  { key: "glazeDescription", label: "Description", required: true },
  { key: "glazeDate", label: "Date", type: "date" as const, readonly: true, hidden: true },
  { key: "unitCost", label: "Unit Cost", type: "number" as const, hidden: true },
  { key: "costUnit", label: "Cost Unit", hidden: true },
  { key: "glazeNotes", label: "Notes", hidden: true },
  { key: "isActive", label: "Status", type: "status" as const, required: true },
];

export default function GlazeManagement() {
  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Glaze Management</h1>
        <p className="text-sm text-muted-foreground">
          Manage glaze materials for R&D projects
        </p>
      </div>

      <EnhancedDataTable
        title="Glaze Materials"
        description="Create and manage glaze materials used in ceramic production"
        apiEndpoint="/api/rnd/materials/glaze"
        columns={columns}
        searchPlaceholder="Search glaze materials..."
        addButtonText="Add Glaze Material"
        idField="id"
        showStatusFilter={true}
        viewPopupFields={["glazeCode", "glazeDescription", "glazeNotes"]}
      />
    </div>
  );
}