"use client";

import EnhancedDataTable from "@/components/rnd/EnhancedDataTable";

const columns = [
  { key: "extruderImage", label: "Photo", type: "image" as const },
  { key: "estruderCode", label: "Code", required: true },
  { key: "estruderDescription", label: "Description", required: true },
  { key: "estruderDate", label: "Date", type: "date" as const, readonly: true, hidden: true },
  { key: "unitCost", label: "Unit Cost", type: "number" as const, hidden: true },
  { key: "costUnit", label: "Cost Unit", hidden: true },
  { key: "estruderNotes", label: "Notes", hidden: true },
  { key: "isActive", label: "Status", type: "status" as const, required: true },
];

export default function ExtruderManagement() {
  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Extruder Management</h1>
        <p className="text-sm text-muted-foreground">
          Manage extruder materials for R&D projects
        </p>
      </div>

      <EnhancedDataTable
        title="Extruder Materials"
        description="Create and manage extruder materials used in ceramic production"
        apiEndpoint="/api/rnd/materials/extruder"
        columns={columns}
        searchPlaceholder="Search extruder materials..."
        addButtonText="Add Extruder Material"
        idField="id"
        showStatusFilter={true}
        viewPopupFields={["extruderImage", "estruderCode", "estruderDescription", "estruderNotes"]}
      />
    </div>
  );
}