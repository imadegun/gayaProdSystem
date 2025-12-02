"use client";

import DataTable from "@/components/rnd/DataTable";

const columns = [
  { key: "materialCode", label: "Code", required: true },
  { key: "materialName", label: "Name", required: true },
];

export default function MaterialManagement() {
  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Material Management</h1>
        <p className="text-sm text-muted-foreground">
          Manage product materials for R&D projects
        </p>
      </div>

      <DataTable
        title="Product Materials"
        description="Create and manage product materials used in collections"
        apiEndpoint="/api/rnd/collections/material"
        columns={columns}
        searchPlaceholder="Search materials..."
        addButtonText="Add Material"
        idField="materialCode"
      />
    </div>
  );
}