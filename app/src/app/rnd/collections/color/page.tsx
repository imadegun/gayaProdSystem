"use client";

import DataTable from "@/components/rnd/DataTable";

const columns = [
  { key: "colorCode", label: "Code", required: true },
  { key: "colorName", label: "Name", required: true },
];

export default function ColorManagement() {
  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Color Management</h1>
        <p className="text-sm text-muted-foreground">
          Manage product colors for R&D projects
        </p>
      </div>

      <DataTable
        title="Product Colors"
        description="Create and manage product colors used in collections"
        apiEndpoint="/api/rnd/collections/color"
        columns={columns}
        searchPlaceholder="Search colors..."
        addButtonText="Add Color"
        idField="colorCode"
      />
    </div>
  );
}