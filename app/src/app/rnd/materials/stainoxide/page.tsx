"use client";

import EnhancedDataTable from "@/components/rnd/EnhancedDataTable";

const columns = [
  { key: "stainOxideCode", label: "Code", required: true },
  { key: "stainOxideDescription", label: "Description", required: true },
  { key: "stainOxideDate", label: "Date", type: "date" as const, readonly: true, hidden: true },
  { key: "unitCost", label: "Unit Cost", type: "number" as const, hidden: true },
  { key: "costUnit", label: "Cost Unit", hidden: true },
  { key: "stainOxideNotes", label: "Notes", hidden: true },
  { key: "isActive", label: "Status", type: "status" as const, required: true },
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

      <EnhancedDataTable
        title="Stain Oxide Materials"
        description="Create and manage stain oxide materials used in ceramic production"
        apiEndpoint="/api/rnd/materials/stainoxide"
        columns={columns}
        searchPlaceholder="Search stain oxide materials..."
        addButtonText="Add Stain Oxide Material"
        idField="id"
        showStatusFilter={true}
        viewPopupFields={["stainOxideCode", "stainOxideDescription", "stainOxideNotes"]}
      />
    </div>
  );
}