"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Filter, ChevronLeft, ChevronRight, Grid, List, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

interface Collection {
  id: number;
  collectCode: string;
  clientCode: string | null;
  clientDescription: string | null;
  collectionType: string | null;
  photo1: string | null;
  photo2: string | null;
  photo3: string | null;
  photo4: string | null;
  category?: { categoryName: string };
  name?: { nameValue: string };
  size?: { sizeName: string };
  color?: { colorName: string };
  material?: { materialName: string };
  design?: { designName: string };
  texture?: { textureName: string };
  productGlazes?: Array<{ glaze: { glazeDescription: string } }>;
}

interface Pagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface Filters {
  categories: Array<{ categoryCode: string; categoryName: string }>;
  clients: Array<{ clientCode: string; clientDescription: string }>;
  collectionTypes: string[];
}

interface ApiResponse {
  collections: Collection[];
  pagination: Pagination;
  filters: Filters;
}

export default function CollectionsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams?.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams?.get("category") || "");
  const [selectedClient, setSelectedClient] = useState(searchParams?.get("client") || "");
  const [selectedCollectionType, setSelectedCollectionType] = useState(searchParams?.get("collectionType") || "");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [sortBy, setSortBy] = useState(searchParams?.get("sortBy") || "collectCode");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(searchParams?.get("sortOrder") as "asc" | "desc" || "asc");

  const currentPage = parseInt(searchParams?.get("page") || "1");

  const fetchCollections = async (params: URLSearchParams) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/collections?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch collections");
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Error fetching collections:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (search) params.set("search", search);
    if (selectedCategory) params.set("category", selectedCategory);
    if (selectedClient) params.set("client", selectedClient);
    if (selectedCollectionType) params.set("collectionType", selectedCollectionType);
    if (sortBy) params.set("sortBy", sortBy);
    if (sortOrder) params.set("sortOrder", sortOrder);

    fetchCollections(params);
  }, [searchParams, selectedCategory, selectedClient, selectedCollectionType, sortBy, sortOrder]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (selectedCategory) params.set("category", selectedCategory);
    if (selectedClient) params.set("client", selectedClient);
    if (selectedCollectionType) params.set("collectionType", selectedCollectionType);
    if (sortBy) params.set("sortBy", sortBy);
    if (sortOrder) params.set("sortOrder", sortOrder);
    params.set("page", "1");

    router.push(`/collections?${params.toString()}`);
  };

  const handleSort = (field: string) => {
    const newSortOrder = sortBy === field && sortOrder === "asc" ? "desc" : "asc";
    setSortBy(field);
    setSortOrder(newSortOrder);

    const params = new URLSearchParams(searchParams?.toString() || "");
    params.set("sortBy", field);
    params.set("sortOrder", newSortOrder);
    params.set("page", "1");

    router.push(`/collections?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.set("page", page.toString());
    router.push(`/collections?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("");
    setSelectedClient("");
    setSelectedCollectionType("");
    router.push("/collections");
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading collections...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Collections</h1>
          <p className="text-gray-600">Browse our professional ceramic collections</p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Search & Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search collections..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select
                className="px-3 py-2 border border-gray-300 rounded-md"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {data?.filters.categories.map((cat) => (
                  <option key={cat.categoryCode} value={cat.categoryCode}>
                    {cat.categoryName}
                  </option>
                ))}
              </select>

              <select
                className="px-3 py-2 border border-gray-300 rounded-md"
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
              >
                <option value="">All Clients</option>
                {data?.filters.clients.map((client) => (
                  <option key={client.clientCode} value={client.clientCode}>
                    {client.clientDescription}
                  </option>
                ))}
              </select>

              <select
                className="px-3 py-2 border border-gray-300 rounded-md"
                value={selectedCollectionType}
                onChange={(e) => setSelectedCollectionType(e.target.value)}
              >
                <option value="">All Collection Types</option>
                {data?.filters.collectionTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-gray-600">
            Showing {data?.collections.length || 0} of {data?.pagination.totalCount || 0} collections
          </p>
          <div className="flex gap-2">
            <Button
              variant={viewMode === "table" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("table")}
            >
              <List className="h-4 w-4 mr-2" />
              Table
            </Button>
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4 mr-2" />
              Grid
            </Button>
          </div>
        </div>

        {/* Collections Display */}
        {viewMode === "table" ? (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("collectCode")}
                      className="h-auto p-0 font-medium"
                    >
                      Code
                      {sortBy === "collectCode" && (
                        sortOrder === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                      )}
                      {sortBy !== "collectCode" && <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("name.nameValue")}
                      className="h-auto p-0 font-medium"
                    >
                      Name
                      {sortBy === "name.nameValue" && (
                        sortOrder === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                      )}
                      {sortBy !== "name.nameValue" && <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("category.categoryName")}
                      className="h-auto p-0 font-medium"
                    >
                      Category
                      {sortBy === "category.categoryName" && (
                        sortOrder === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                      )}
                      {sortBy !== "category.categoryName" && <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("size.sizeName")}
                      className="h-auto p-0 font-medium"
                    >
                      Size
                      {sortBy === "size.sizeName" && (
                        sortOrder === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                      )}
                      {sortBy !== "size.sizeName" && <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("color.colorName")}
                      className="h-auto p-0 font-medium"
                    >
                      Color
                      {sortBy === "color.colorName" && (
                        sortOrder === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                      )}
                      {sortBy !== "color.colorName" && <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("material.materialName")}
                      className="h-auto p-0 font-medium"
                    >
                      Material
                      {sortBy === "material.materialName" && (
                        sortOrder === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                      )}
                      {sortBy !== "material.materialName" && <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />}
                    </Button>
                  </TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("collectionType")}
                      className="h-auto p-0 font-medium"
                    >
                      Type
                      {sortBy === "collectionType" && (
                        sortOrder === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                      )}
                      {sortBy !== "collectionType" && <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />}
                    </Button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.collections.map((collection) => (
                  <TableRow key={collection.id}>
                    <TableCell className="font-medium">{collection.collectCode}</TableCell>
                    <TableCell>{collection.name?.nameValue || "-"}</TableCell>
                    <TableCell>{collection.category?.categoryName || "-"}</TableCell>
                    <TableCell>{collection.size?.sizeName || "-"}</TableCell>
                    <TableCell>{collection.color?.colorName || "-"}</TableCell>
                    <TableCell>{collection.material?.materialName || "-"}</TableCell>
                    <TableCell>{collection.clientDescription || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={collection.collectionType === "Exclusive" ? "default" : "secondary"}>
                        {collection.collectionType || "General"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.collections.map((collection) => (
              <Card key={collection.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square bg-gray-100 relative">
                  {collection.photo1 ? (
                    <img
                      src={`/api/images/${collection.photo1}`}
                      alt={collection.collectCode}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge variant={collection.collectionType === "Exclusive" ? "default" : "secondary"}>
                      {collection.collectionType || "General"}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{collection.collectCode}</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    {collection.name && <p><strong>Name:</strong> {collection.name.nameValue}</p>}
                    {collection.category && <p><strong>Category:</strong> {collection.category.categoryName}</p>}
                    {collection.size && <p><strong>Size:</strong> {collection.size.sizeName}</p>}
                    {collection.color && <p><strong>Color:</strong> {collection.color.colorName}</p>}
                    {collection.material && <p><strong>Material:</strong> {collection.material.materialName}</p>}
                    {collection.clientDescription && (
                      <p><strong>Client:</strong> {collection.clientDescription}</p>
                    )}
                    {collection.productGlazes && collection.productGlazes.length > 0 && (
                      <p><strong>Glaze:</strong> {collection.productGlazes[0].glaze.glazeDescription}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {data?.pagination && data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!data.pagination.hasPrev}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <span className="text-sm text-gray-600">
              Page {data.pagination.page} of {data.pagination.totalPages}
            </span>

            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!data.pagination.hasNext}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}