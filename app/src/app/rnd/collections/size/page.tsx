"use client";

import DataTable from "@/components/rnd/DataTable";

const columns = [
  { key: "sizeCode", label: "Code", required: true },
  { key: "sizeName", label: "Name", required: true },
];

export default function SizeManagement() {
  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Size Management</h1>
        <p className="text-sm text-muted-foreground">
          Manage product sizes for R&D projects
        </p>
      </div>

      <DataTable
        title="Product Sizes"
        description="Create and manage product sizes used in collections"
        apiEndpoint="/api/rnd/collections/size"
        columns={columns}
        searchPlaceholder="Search sizes..."
        addButtonText="Add Size"
        idField="sizeCode"
      />
    </div>
  );
}