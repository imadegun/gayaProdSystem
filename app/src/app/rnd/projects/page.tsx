"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Package, Users, FileText, Calculator, DollarSign, Search, Filter, ArrowUpDown, Eye, Edit, Trash2, ChevronLeft, ChevronRight, FolderPlus } from "lucide-react";
import { useRouter } from "next/navigation";

interface RnDProject {
  id: number;
  projectName: string;
  description?: string;
  status: string;
  workflowStep?: string;
  createdAt: string;
  updatedAt: string;
  client: {
    clientCode: string;
    clientDescription: string;
    region?: string;
    department?: string;
  };
  creator: {
    username: string;
    email?: string;
  };
  directoryLists: object[];
  estimates: object[];
  quotations: object[];
  samples: object[];
  proformas: object[];
}

interface Client {
  clientCode: string;
  clientDescription: string;
  region?: string;
  department?: string;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function RNDProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<RnDProject[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationData | null>(null);

  // CRUD states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isAddDirectoryDialogOpen, setIsAddDirectoryDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<RnDProject | null>(null);
  const [viewingProject, setViewingProject] = useState<RnDProject | null>(null);
  const [selectedProjectForDirectory, setSelectedProjectForDirectory] = useState<RnDProject | null>(null);
  const [saving, setSaving] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    clientId: "",
    projectName: "",
    description: "",
    status: "draft_directory",
  });

  // Directory form states
  const [directoryFormData, setDirectoryFormData] = useState({
    itemName: "",
    collectCode: "",
    quantity: 1,
    colorName: "",
    notes: "",
  });

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [clientFilter, setClientFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    fetchClients();
    fetchProjects();
  }, [searchTerm, statusFilter, clientFilter, sortBy, sortOrder, currentPage, pageSize]);

  const fetchProjects = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        search: searchTerm,
        status: statusFilter,
        clientId: clientFilter,
        sortBy,
        sortOrder,
      });

      const response = await fetch(`/api/rnd/projects?${params}`);
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await fetch("/api/rnd/clients");
      if (response.ok) {
        const data = await response.json();
        setClients(data.clients);
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  const handleCreate = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/rnd/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsCreateDialogOpen(false);
        resetForm();
        fetchProjects();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error creating project:", error);
      alert("An error occurred while creating the project");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingProject) return;

    setSaving(true);
    try {
      const response = await fetch("/api/rnd/projects", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editingProject.id,
          ...formData,
        }),
      });

      if (response.ok) {
        setIsEditDialogOpen(false);
        setEditingProject(null);
        resetForm();
        fetchProjects();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error updating project:", error);
      alert("An error occurred while updating the project");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (projectId: number) => {
    // Show confirmation alert
    const isConfirmed = window.confirm(`Are you sure you want to delete this project? This action cannot be undone.`);

    if (!isConfirmed) return;

    try {
      const response = await fetch(`/api/rnd/projects?id=${projectId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Show success message
        alert("Project deleted successfully!");
        fetchProjects();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      alert("An error occurred while deleting the project");
    }
  };

  const resetForm = () => {
    setFormData({
      clientId: "",
      projectName: "",
      description: "",
      status: "draft_directory",
    });
  };

  const openEditDialog = (project: RnDProject) => {
    setEditingProject(project);
    setFormData({
      clientId: project.client.clientCode,
      projectName: project.projectName,
      description: project.description || "",
      status: project.status,
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (project: RnDProject) => {
    setViewingProject(project);
    setIsViewDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft_directory": return "secondary";
      case "estimate_created": return "blue";
      case "quotation_sent": return "yellow";
      case "quotation_approved": return "green";
      case "sample_development": return "purple";
      case "sample_completed": return "green";
      case "proforma_created": return "blue";
      case "client_approved": return "green";
      case "client_revised": return "orange";
      case "cancelled": return "red";
      default: return "gray";
    }
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const openAddDirectoryDialog = (project: RnDProject) => {
    setSelectedProjectForDirectory(project);
    setDirectoryFormData({
      itemName: "",
      collectCode: "",
      quantity: 1,
      colorName: "",
      notes: "",
    });
    setIsAddDirectoryDialogOpen(true);
  };

  const handleCreateDirectory = async () => {
    if (!selectedProjectForDirectory) return;

    setSaving(true);
    try {
      const response = await fetch("/api/rnd/directory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId: selectedProjectForDirectory.id,
          ...directoryFormData,
        }),
      });

      if (response.ok) {
        setIsAddDirectoryDialogOpen(false);
        setSelectedProjectForDirectory(null);
        // Optionally navigate to directory page or refresh
        alert("Directory item created successfully!");
        fetchProjects(); // Refresh to update counts
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error creating directory item:", error);
      alert("An error occurred while creating the directory item");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading R&D Projects...</div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">R&D Projects</h1>
          <p className="text-sm text-muted-foreground">
            Manage your research and development projects
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader className="pb-2">
              <DialogTitle className="text-lg">Create New Project</DialogTitle>
              <DialogDescription className="text-sm">
                Add a new R&D project to start developing products for your client.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label htmlFor="clientId" className="text-xs">Client *</Label>
                <Select value={formData.clientId} onValueChange={(value) => setFormData({ ...formData, clientId: value })}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.clientCode} value={client.clientCode} className="text-sm">
                        {client.clientDescription}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="projectName" className="text-xs">Project Name *</Label>
                <Input
                  id="projectName"
                  value={formData.projectName}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                  placeholder="Enter project name"
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="description" className="text-xs">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter project description"
                  className="text-sm"
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="status" className="text-xs">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft_directory" className="text-sm">Draft Directory</SelectItem>
                    <SelectItem value="estimate_created" className="text-sm">Estimate Created</SelectItem>
                    <SelectItem value="quotation_sent" className="text-sm">Quotation Sent</SelectItem>
                    <SelectItem value="sample_development" className="text-sm">Sample Development</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleCreate} disabled={saving}>
                {saving ? "Creating..." : "Create Project"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      {/* <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagination?.total || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {projects.filter(p => p.status !== 'cancelled' && p.status !== 'client_revised').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {projects.filter(p => p.status === 'client_approved').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {projects.filter(p => ['sample_development', 'quotation_sent', 'proforma_created'].includes(p.status)).length}
            </div>
          </CardContent>
        </Card>
      </div> */}

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-3">
          <div className="flex flex-col md:flex-row gap-2">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 h-8 text-sm"
                />
              </div>
            </div>
            <Select value={statusFilter || "all"} onValueChange={(value) => setStatusFilter(value === "all" ? "" : value)}>
              <SelectTrigger className="w-full md:w-40 h-8 text-sm">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-sm">All Statuses</SelectItem>
                <SelectItem value="draft_directory" className="text-sm">Draft Directory</SelectItem>
                <SelectItem value="estimate_created" className="text-sm">Estimate Created</SelectItem>
                <SelectItem value="quotation_sent" className="text-sm">Quotation Sent</SelectItem>
                <SelectItem value="sample_development" className="text-sm">Sample Development</SelectItem>
              </SelectContent>
            </Select>
            <Select value={clientFilter || "all"} onValueChange={(value) => setClientFilter(value === "all" ? "" : value)}>
              <SelectTrigger className="w-full md:w-40 h-8 text-sm">
                <SelectValue placeholder="Filter by client" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-sm">All Clients</SelectItem>
                {clients.map((client) => (
                  <SelectItem key={client.clientCode} value={client.clientCode} className="text-sm">
                    {client.clientDescription}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Projects Table */}
      <Card>
        <CardContent className="p-0">
          <Table className="text-sm">
            <TableHeader>
              <TableRow className="h-9">
                <TableHead className="py-2 px-3">Client</TableHead>
                <TableHead className="py-2 px-3">
                  <Button variant="ghost" onClick={() => handleSort("projectName")} className="h-auto p-0 font-semibold text-xs">
                    Project Name
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className="py-2 px-3">
                  <Button variant="ghost" onClick={() => handleSort("status")} className="h-auto p-0 font-semibold text-xs">
                    Status
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className="py-2 px-3 w-[140px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id} className="h-10">
                  <TableCell className="font-medium py-1 px-3 text-sm">{project.client.clientDescription}</TableCell>
                  <TableCell className="py-1 px-3">
                    <div className="max-w-xs truncate text-sm" title={project.projectName}>
                      {project.projectName}
                    </div>
                  </TableCell>
                  <TableCell className="py-1 px-3">
                    <Badge variant={getStatusColor(project.status) as "default" | "secondary" | "destructive" | "outline"} className="text-xs py-0 px-1.5">
                      {project.workflowStep || project.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-1 px-3">
                    <div className="flex gap-0.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => openViewDialog(project)}
                        title="View Details"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => openEditDialog(project)}
                        title="Edit Project"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-blue-600 hover:text-blue-700"
                        onClick={() => openAddDirectoryDialog(project)}
                        title="Add Directory Item"
                      >
                        <FolderPlus className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(project.id)}
                        title="Delete Project"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {projects.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-muted-foreground text-sm">
                    No projects found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} projects
          </div>
          <div className="flex items-center space-x-2">
            <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(parseInt(value))}>
              <SelectTrigger className="w-16 h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5" className="text-xs">5</SelectItem>
                <SelectItem value="10" className="text-xs">10</SelectItem>
                <SelectItem value="20" className="text-xs">20</SelectItem>
                <SelectItem value="50" className="text-xs">50</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <span className="text-xs">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
              disabled={currentPage === pagination.totalPages}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-lg">Edit Project</DialogTitle>
            <DialogDescription className="text-sm">
              Update the project details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="edit-clientId" className="text-xs">Client *</Label>
              <Select value={formData.clientId} onValueChange={(value) => setFormData({ ...formData, clientId: value })}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.clientCode} value={client.clientCode} className="text-sm">
                      {client.clientDescription} ({client.clientCode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-projectName" className="text-xs">Project Name *</Label>
              <Input
                id="edit-projectName"
                value={formData.projectName}
                onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                placeholder="Enter project name"
                className="h-8 text-sm"
              />
            </div>
            <div>
              <Label htmlFor="edit-description" className="text-xs">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter project description"
                className="text-sm"
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="edit-status" className="text-xs">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft_directory" className="text-sm">Draft Directory</SelectItem>
                  <SelectItem value="estimate_created" className="text-sm">Estimate Created</SelectItem>
                  <SelectItem value="quotation_sent" className="text-sm">Quotation Sent</SelectItem>
                  <SelectItem value="sample_development" className="text-sm">Sample Development</SelectItem>
                  <SelectItem value="client_approved" className="text-sm">Completed</SelectItem>
                  <SelectItem value="cancelled" className="text-sm">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleUpdate} disabled={saving}>
              {saving ? "Updating..." : "Update Project"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Directory Item Dialog */}
      <Dialog open={isAddDirectoryDialogOpen} onOpenChange={setIsAddDirectoryDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-lg">Add Directory Item</DialogTitle>
            <DialogDescription className="text-sm">
              Add a new directory item to project: <span className="font-medium">{selectedProjectForDirectory?.projectName}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="dir-itemName" className="text-xs">Category (Item Name) *</Label>
              <Input
                id="dir-itemName"
                value={directoryFormData.itemName}
                onChange={(e) => setDirectoryFormData({ ...directoryFormData, itemName: e.target.value })}
                placeholder="Enter item name"
                className="h-8 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="dir-collectCode" className="text-xs">Code</Label>
                <Input
                  id="dir-collectCode"
                  value={directoryFormData.collectCode}
                  onChange={(e) => setDirectoryFormData({ ...directoryFormData, collectCode: e.target.value })}
                  placeholder="e.g., AA-001"
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="dir-quantity" className="text-xs">Quantity *</Label>
                <Input
                  id="dir-quantity"
                  type="number"
                  value={directoryFormData.quantity}
                  onChange={(e) => setDirectoryFormData({ ...directoryFormData, quantity: parseInt(e.target.value) || 1 })}
                  min="1"
                  className="h-8 text-sm"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="dir-colorName" className="text-xs">Color</Label>
              <Input
                id="dir-colorName"
                value={directoryFormData.colorName}
                onChange={(e) => setDirectoryFormData({ ...directoryFormData, colorName: e.target.value })}
                placeholder="Enter color"
                className="h-8 text-sm"
              />
            </div>
            <div>
              <Label htmlFor="dir-notes" className="text-xs">Notes</Label>
              <Textarea
                id="dir-notes"
                value={directoryFormData.notes}
                onChange={(e) => setDirectoryFormData({ ...directoryFormData, notes: e.target.value })}
                placeholder="Enter notes"
                className="text-sm"
                rows={2}
              />
            </div>
          </div>
          <div className="flex justify-between items-center pt-2">
            <Button
              variant="link"
              size="sm"
              className="text-xs p-0 h-auto"
              onClick={() => {
                setIsAddDirectoryDialogOpen(false);
                router.push('/rnd/directory');
              }}
            >
              Go to full Directory page →
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsAddDirectoryDialogOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleCreateDirectory} disabled={saving || !directoryFormData.itemName}>
                {saving ? "Creating..." : "Create Item"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-lg">Project Details</DialogTitle>
            <DialogDescription className="text-sm">
              Complete information about this R&D project
            </DialogDescription>
          </DialogHeader>
          {viewingProject && (
            <div className="space-y-4">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded p-2">
                  <Label className="text-xs font-medium text-muted-foreground">Project Name</Label>
                  <p className="text-sm font-semibold">{viewingProject.projectName}</p>
                </div>
                <div className="bg-gray-50 rounded p-2">
                  <Label className="text-xs font-medium text-muted-foreground">Client</Label>
                  <p className="text-sm">{viewingProject.client.clientDescription}</p>
                  <p className="text-xs text-muted-foreground">{viewingProject.client.clientCode}</p>
                </div>
              </div>

              {/* Status and Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded p-2">
                  <Label className="text-xs font-medium text-muted-foreground">Status</Label>
                  <div className="mt-1">
                    <Badge variant={getStatusColor(viewingProject.status) as "default" | "secondary" | "destructive" | "outline"} className="text-xs">
                      {viewingProject.workflowStep || viewingProject.status}
                    </Badge>
                  </div>
                </div>
                <div className="bg-gray-50 rounded p-2">
                  <Label className="text-xs font-medium text-muted-foreground">Created</Label>
                  <p className="text-sm">{new Date(viewingProject.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Description */}
              {viewingProject.description && (
                <div className="bg-gray-50 rounded p-2">
                  <Label className="text-xs font-medium text-muted-foreground">Description</Label>
                  <p className="text-sm mt-1">{viewingProject.description}</p>
                </div>
              )}

              {/* Project Statistics */}
              <div>
                <Label className="text-xs font-medium text-muted-foreground mb-2 block">Project Progress</Label>
                <div className="grid grid-cols-4 gap-2">
                  <Card>
                    <CardContent className="p-2 text-center">
                      <div className="text-lg font-bold text-blue-600">{viewingProject.directoryLists?.length || 0}</div>
                      <div className="text-xs text-muted-foreground">Directory</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-2 text-center">
                      <div className="text-lg font-bold text-green-600">{viewingProject.estimates?.length || 0}</div>
                      <div className="text-xs text-muted-foreground">Estimates</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-2 text-center">
                      <div className="text-lg font-bold text-purple-600">{viewingProject.quotations?.length || 0}</div>
                      <div className="text-xs text-muted-foreground">Quotations</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-2 text-center">
                      <div className="text-lg font-bold text-orange-600">{viewingProject.samples?.length || 0}</div>
                      <div className="text-xs text-muted-foreground">Samples</div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Creator Information */}
              <div className="border-t pt-3">
                <Label className="text-xs font-medium text-muted-foreground">Created By</Label>
                <p className="text-sm">{viewingProject.creator.username}</p>
                {viewingProject.creator.email && (
                  <p className="text-xs text-muted-foreground">{viewingProject.creator.email}</p>
                )}
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            {viewingProject && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    openAddDirectoryDialog(viewingProject);
                  }}
                >
                  <FolderPlus className="h-3.5 w-3.5 mr-1" />
                  Add Directory
                </Button>
                <Button size="sm" onClick={() => {
                  setIsViewDialogOpen(false);
                  openEditDialog(viewingProject);
                }}>
                  Edit Project
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}