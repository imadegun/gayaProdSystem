"use client";

import EnhancedDataTable from "@/components/rnd/EnhancedDataTable";

const columns = [
  { key: "castingImage", label: "Photo", type: "image" as const },
  { key: "castingCode", label: "Code", required: true },
  { key: "castingDescription", label: "Description", required: true },
  { key: "castingDate", label: "Date", type: "date" as const, readonly: true, hidden: true },
  { key: "unitCost", label: "Unit Cost", type: "number" as const, hidden: true },
  { key: "costUnit", label: "Cost Unit", hidden: true },
  { key: "castingNotes", label: "Notes", hidden: true },
  { key: "isActive", label: "Status", type: "status" as const, required: true },
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

      <EnhancedDataTable
        title="Casting Materials"
        description="Create and manage casting materials used in ceramic production"
        apiEndpoint="/api/rnd/materials/casting"
        columns={columns}
        searchPlaceholder="Search casting materials..."
        addButtonText="Add Casting Material"
        idField="id"
        showStatusFilter={true}
        viewPopupFields={["castingImage", "castingCode", "castingDescription", "castingNotes"]}
      />
    </div>
  );
}