"use client";

import DataTable from "@/components/rnd/DataTable";

const columns = [
  { key: "textureCode", label: "Code", required: true },
  { key: "textureName", label: "Name", required: true },
];

export default function TextureManagement() {
  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Texture Management</h1>
        <p className="text-sm text-muted-foreground">
          Manage product textures for R&D projects
        </p>
      </div>

      <DataTable
        title="Product Textures"
        description="Create and manage product textures used in collections"
        apiEndpoint="/api/rnd/collections/texture"
        columns={columns}
        searchPlaceholder="Search textures..."
        addButtonText="Add Texture"
        idField="textureCode"
      />
    </div>
  );
}