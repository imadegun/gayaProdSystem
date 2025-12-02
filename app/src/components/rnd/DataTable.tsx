"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Search, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

interface Column {
  key: string;
  label: string;
  type?: "text" | "number" | "date" | "select";
  options?: { value: string; label: string }[];
  required?: boolean;
  readonly?: boolean;
}

interface DataTableProps {
  title: string;
  description?: string;
  apiEndpoint: string;
  columns: Column[];
  searchPlaceholder?: string;
  addButtonText?: string;
  idField: string; // The field name for the ID (e.g., "id" or "code")
}

export default function DataTable({
  title,
  description,
  apiEndpoint,
  columns,
  searchPlaceholder = "Search...",
  addButtonText = "Add New",
  idField
}: DataTableProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const totalPages = Math.ceil(totalCount / limit);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        search,
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await fetch(`${apiEndpoint}?${params}`);
      if (response.ok) {
        const result = await response.json();
        setData(result[Object.keys(result)[0]] || []);
        setTotalCount(result.pagination?.totalCount || 0);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, page]);

  const resetForm = () => {
    const initialFormData: any = {};
    columns.forEach(col => {
      if (col.type === "number") {
        initialFormData[col.key] = 0;
      } else {
        initialFormData[col.key] = "";
      }
    });
    setFormData(initialFormData);
  };

  const handleAdd = async () => {
    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess("Item added successfully");
        setError("");
        setIsAddDialogOpen(false);
        resetForm();
        fetchData();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to add item");
        setSuccess("");
      }
    } catch (error) {
      console.error("Error adding item:", error);
      setError("Failed to add item");
      setSuccess("");
    }
  };

  const handleEdit = async () => {
    try {
      const response = await fetch(apiEndpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess("Item updated successfully");
        setError("");
        setIsEditDialogOpen(false);
        setEditingItem(null);
        resetForm();
        fetchData();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to update item");
        setSuccess("");
      }
    } catch (error) {
      console.error("Error updating item:", error);
      setError("Failed to update item");
      setSuccess("");
    }
  };

  const handleDelete = async (item: any) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      const params = new URLSearchParams();
      if (idField === "id") {
        params.set("id", item[idField].toString());
      } else {
        params.set(idField, item[idField]);
      }

      const response = await fetch(`${apiEndpoint}?${params}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setSuccess("Item deleted successfully");
        setError("");
        fetchData();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to delete item");
        setSuccess("");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      setError("Failed to delete item");
      setSuccess("");
    }
  };

  const openEditDialog = (item: any) => {
    setEditingItem(item);
    setFormData({ ...item });
    setError("");
    setSuccess("");
    setIsEditDialogOpen(true);
  };

  const renderFormField = (column: Column) => {
    const value = formData[column.key] || "";
    const fieldId = `field-${column.key}`;

    switch (column.type) {
      case "select":
        return (
          <Select value={value} onValueChange={(val) => setFormData({ ...formData, [column.key]: val })}>
            <SelectTrigger>
              <SelectValue placeholder={`Select ${column.label}`} />
            </SelectTrigger>
            <SelectContent>
              {column.options?.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case "number":
        return (
          <Input
            id={fieldId}
            type="number"
            value={value}
            onChange={(e) => setFormData({ ...formData, [column.key]: parseFloat(e.target.value) || 0 })}
            required={column.required}
          />
        );
      case "date":
        return (
          <Input
            id={fieldId}
            type="date"
            value={value ? new Date(value).toISOString().split('T')[0] : ""}
            onChange={(e) => setFormData({ ...formData, [column.key]: e.target.value })}
            required={column.required}
          />
        );
      default:
        if (column.key.includes("notes") || column.key.includes("description")) {
          return (
            <Textarea
              id={fieldId}
              value={value}
              onChange={(e) => setFormData({ ...formData, [column.key]: e.target.value })}
              required={column.required}
            />
          );
        }
        return (
          <Input
            id={fieldId}
            value={value}
            onChange={(e) => setFormData({ ...formData, [column.key]: e.target.value })}
            required={column.required}
          />
        );
    }
  };

  const renderCellValue = (item: any, column: Column) => {
    const value = item[column.key];
    if (!value) return "-";

    switch (column.type) {
      case "date":
        return new Date(value).toLocaleDateString();
      case "number":
        return typeof value === "number" ? value.toLocaleString() : value;
      case "select":
        const option = column.options?.find(opt => opt.value === value);
        return option ? option.label : value;
      default:
        return value;
    }
  };

  if (loading && data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-lg">Loading...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setError(""); setSuccess(""); setIsAddDialogOpen(true); }}>
                <Plus className="mr-2 h-4 w-4" />
                {addButtonText}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New {title.slice(0, -1)}</DialogTitle>
                <DialogDescription>
                  Create a new {title.toLowerCase().slice(0, -1)} entry.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {columns.filter(col => !col.readonly).map(column => (
                  <div key={column.key} className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor={`field-${column.key}`} className="text-right">
                      {column.label}
                      {column.required && <span className="text-red-500">*</span>}
                    </Label>
                    <div className="col-span-3">
                      {renderFormField(column)}
                    </div>
                  </div>
                ))}
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleAdd}>Add</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map(column => (
                  <TableHead key={column.key}>{column.label}</TableHead>
                ))}
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item[idField]}>
                  {columns.map(column => (
                    <TableCell key={column.key}>
                      {renderCellValue(item, column)}
                    </TableCell>
                  ))}
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(item)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {data.length === 0 && !loading && (
          <div className="text-center py-8 text-muted-foreground">
            No {title.toLowerCase()} found.
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, totalCount)} of {totalCount} entries
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Badge variant="secondary">
                Page {page} of {totalPages}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit {title.slice(0, -1)}</DialogTitle>
              <DialogDescription>
                Update the {title.toLowerCase().slice(0, -1)} information.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {columns.filter(col => !col.readonly).map(column => (
                <div key={column.key} className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor={`edit-field-${column.key}`} className="text-right">
                    {column.label}
                    {column.required && <span className="text-red-500">*</span>}
                  </Label>
                  <div className="col-span-3">
                    {renderFormField(column)}
                  </div>
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleEdit}>Update</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}