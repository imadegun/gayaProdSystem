"use client";

import DataTable from "@/components/rnd/DataTable";

const columns = [
  { key: "categoryCode", label: "Code", required: true },
  { key: "categoryName", label: "Name", required: true },
];

export default function CategoryManagement() {
  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Category Management</h1>
        <p className="text-sm text-muted-foreground">
          Manage product categories for R&D projects
        </p>
      </div>

      <DataTable
        title="Product Categories"
        description="Create and manage product categories used in collections"
        apiEndpoint="/api/rnd/collections/category"
        columns={columns}
        searchPlaceholder="Search categories..."
        addButtonText="Add Category"
        idField="categoryCode"
      />
    </div>
  );
}