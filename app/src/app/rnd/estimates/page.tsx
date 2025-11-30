"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Calculator, FileText, Download, Eye, Plus, Send, DollarSign,
  CheckCircle, XCircle, Clock, Edit, Trash2, Mail, Image,
  Search, Filter, ChevronLeft, ChevronRight, FileSpreadsheet, FileDown
} from "lucide-react";

interface DirectoryListItem {
  id: number;
  itemName: string;
  collectCode?: string;
  photos?: string[];
  textureName?: string;
  colorName?: string;
  materialName?: string;
  sizeInfo?: string;
  quantity: number;
  unit?: string;
  price?: number;
  total?: number;
  isSet?: boolean;
}

interface EstimateItem {
  id: number;
  directoryListId: number;
  quantity: number;
  unitPrice?: number;
  totalPrice?: number;
  notes?: string;
  isSelected: boolean;
  directoryList: DirectoryListItem;
}

interface Estimate {
  id: number;
  estimateNumber: string;
  title: string;
  description?: string;
  totalAmount?: number;
  status: string;
  pricedAt?: string;
  sentDate?: string;
  sentToEmail?: string;
  responseDate?: string;
  clientResponse?: string;
  notes?: string;
  createdAt: string;
  project: {
    id: number;
    projectName: string;
    status: string;
    client: {
      clientCode: string;
      clientDescription: string;
      email?: string;
      contactPerson?: string;
    };
  };
  items: EstimateItem[];
  currency?: {
    id: number;
    code: string;
    symbol: string;
  };
  creator: {
    id: number;
    username: string;
  };
  pricer?: {
    id: number;
    username: string;
  };
  sender?: {
    id: number;
    username: string;
  };
}

interface Project {
  id: number;
  projectName: string;
  status: string;
  client: {
    clientCode: string;
    clientDescription: string;
    email?: string;
  };
  directoryLists: DirectoryListItem[];
}

interface Currency {
  id: number;
  code: string;
  name: string;
  symbol: string;
}

export default function RNDEstimatesPage() {
  const { data: session } = useSession();
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedEstimate, setSelectedEstimate] = useState<Estimate | null>(null);

  // Form states
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    currencyId: "",
    notes: "",
  });
  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    currencyId: "",
    notes: "",
  });
  const [pricingItems, setPricingItems] = useState<{ id: number; unitPrice: string; quantity: number }[]>([]);
  const [sendEmail, setSendEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Search, Filter, Pagination states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterProjectId, setFilterProjectId] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize] = useState(10);
  const [exporting, setExporting] = useState(false);

  const userRole = session?.user?.role || "";
  const canCreateEstimate = ["R&D", "Sales", "Admin"].includes(userRole);
  const canSetPrices = ["Admin"].includes(userRole);
  const canSendEstimate = ["Sales", "Admin"].includes(userRole);
  const canEditEstimate = ["R&D", "Sales", "Admin"].includes(userRole);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchEstimates();
  }, [activeTab, debouncedSearch, filterProjectId, currentPage]);

  useEffect(() => {
    fetchProjects();
    fetchCurrencies();
  }, []);

  const fetchEstimates = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", currentPage.toString());
      params.append("limit", pageSize.toString());
      
      if (activeTab !== "all") {
        params.append("status", activeTab);
      }
      if (debouncedSearch) {
        params.append("search", debouncedSearch);
      }
      if (filterProjectId) {
        params.append("projectId", filterProjectId);
      }

      const response = await fetch(`/api/rnd/estimates?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setEstimates(data.estimates);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalCount(data.pagination?.total || 0);
      }
    } catch (error) {
      console.error("Error fetching estimates:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, activeTab, debouncedSearch, filterProjectId]);

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/rnd/projects?limit=100");
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const fetchCurrencies = async () => {
    try {
      const response = await fetch("/api/rnd/currencies");
      if (response.ok) {
        const data = await response.json();
        setCurrencies(data.currencies || []);
      }
    } catch (error) {
      console.error("Error fetching currencies:", error);
    }
  };

  const fetchProjectDirectoryLists = async (projectId: string) => {
    try {
      const response = await fetch(`/api/rnd/directory?projectId=${projectId}`);
      if (response.ok) {
        const data = await response.json();
        return data.directoryLists || [];
      }
    } catch (error) {
      console.error("Error fetching directory lists:", error);
    }
    return [];
  };

  const handleCreateEstimate = async () => {
    if (!selectedProjectId || selectedItems.length === 0 || !formData.title) {
      alert("Please select a project, items, and provide a title");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/rnd/estimates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: selectedProjectId,
          directoryListIds: selectedItems,
          ...formData,
        }),
      });

      if (response.ok) {
        await fetchEstimates();
        setCreateModalOpen(false);
        resetForm();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to create estimate");
      }
    } catch (error) {
      console.error("Error creating estimate:", error);
      alert("Failed to create estimate");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetPrices = async () => {
    if (!selectedEstimate) return;

    setSubmitting(true);
    try {
      const response = await fetch("/api/rnd/estimates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedEstimate.id,
          action: "set_prices",
          items: pricingItems.map(item => ({
            id: item.id,
            unitPrice: parseFloat(item.unitPrice) || 0,
            quantity: item.quantity,
          })),
        }),
      });

      if (response.ok) {
        await fetchEstimates();
        setPriceModalOpen(false);
        setSelectedEstimate(null);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to set prices");
      }
    } catch (error) {
      console.error("Error setting prices:", error);
      alert("Failed to set prices");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendEstimate = async () => {
    if (!selectedEstimate || !sendEmail) {
      alert("Please provide client email");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/rnd/estimates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedEstimate.id,
          action: "send",
          sentToEmail: sendEmail,
        }),
      });

      if (response.ok) {
        await fetchEstimates();
        setSendModalOpen(false);
        setSelectedEstimate(null);
        alert("Estimate sent successfully!");
      } else {
        const error = await response.json();
        alert(error.error || "Failed to send estimate");
      }
    } catch (error) {
      console.error("Error sending estimate:", error);
      alert("Failed to send estimate");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEstimate = async (id: number) => {
    if (!confirm("Are you sure you want to delete this estimate?")) return;

    try {
      const response = await fetch(`/api/rnd/estimates?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchEstimates();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to delete estimate");
      }
    } catch (error) {
      console.error("Error deleting estimate:", error);
      alert("Failed to delete estimate");
    }
  };

  const handleEditEstimate = async () => {
    if (!selectedEstimate) return;

    setSubmitting(true);
    try {
      const response = await fetch("/api/rnd/estimates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedEstimate.id,
          action: "update",
          ...editFormData,
        }),
      });

      if (response.ok) {
        await fetchEstimates();
        setEditModalOpen(false);
        setSelectedEstimate(null);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to update estimate");
      }
    } catch (error) {
      console.error("Error updating estimate:", error);
      alert("Failed to update estimate");
    } finally {
      setSubmitting(false);
    }
  };

  const handleExport = async (format: "xlsx" | "pdf") => {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      params.append("format", format);
      
      if (activeTab !== "all") {
        params.append("status", activeTab);
      }
      if (debouncedSearch) {
        params.append("search", debouncedSearch);
      }
      if (filterProjectId) {
        params.append("projectId", filterProjectId);
      }

      const response = await fetch(`/api/rnd/exports?type=estimates&${params.toString()}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `estimates-${new Date().toISOString().split("T")[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const error = await response.json();
        alert(error.error || `Failed to export as ${format.toUpperCase()}`);
      }
    } catch (error) {
      console.error(`Error exporting as ${format}:`, error);
      alert(`Failed to export as ${format.toUpperCase()}`);
    } finally {
      setExporting(false);
    }
  };

  const resetForm = () => {
    setSelectedProjectId("");
    setSelectedItems([]);
    setFormData({ title: "", description: "", currencyId: "", notes: "" });
  };

  const openEditModal = (estimate: Estimate) => {
    setSelectedEstimate(estimate);
    setEditFormData({
      title: estimate.title,
      description: estimate.description || "",
      currencyId: estimate.currency?.id?.toString() || "",
      notes: estimate.notes || "",
    });
    setEditModalOpen(true);
  };

  const openPriceModal = (estimate: Estimate) => {
    setSelectedEstimate(estimate);
    setPricingItems(estimate.items.map(item => ({
      id: item.id,
      unitPrice: item.unitPrice?.toString() || "",
      quantity: item.quantity,
    })));
    setPriceModalOpen(true);
  };

  const openSendModal = (estimate: Estimate) => {
    setSelectedEstimate(estimate);
    setSendEmail(estimate.project.client.email || "");
    setSendModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft": return "secondary";
      case "priced": return "blue";
      case "sent": return "yellow";
      case "approved": return "green";
      case "rejected": return "red";
      case "revised": return "orange";
      default: return "secondary";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "draft": return <Clock className="h-3 w-3" />;
      case "priced": return <DollarSign className="h-3 w-3" />;
      case "sent": return <Send className="h-3 w-3" />;
      case "approved": return <CheckCircle className="h-3 w-3" />;
      case "rejected": return <XCircle className="h-3 w-3" />;
      default: return null;
    }
  };

  const formatCurrency = (amount: number | undefined, symbol: string = "$") => {
    if (amount === undefined || amount === null) return "-";
    return `${symbol}${amount.toLocaleString()}`;
  };

  // Client-side filtering is no longer needed as we filter on the server
  const filteredEstimates = estimates;

  const selectedProject = projects.find(p => p.id.toString() === selectedProjectId);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading Estimates...</div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Estimates</h1>
          <p className="text-sm text-muted-foreground">
            Create and manage cost estimates for R&D projects
          </p>
        </div>
        <div className="flex gap-2">
          {/* Export Buttons */}
          <Button
            variant="outline"
            onClick={() => handleExport("xlsx")}
            disabled={exporting}
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export XLSX
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExport("pdf")}
            disabled={exporting}
          >
            <FileDown className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          {canCreateEstimate && (
            <Button onClick={() => setCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Estimate
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by estimate number, title, or client..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-64">
              <Select
                value={filterProjectId}
                onValueChange={(value) => {
                  setFilterProjectId(value === "all" ? "" : value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id.toString()}>
                      {project.projectName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => {
        setActiveTab(value);
        setCurrentPage(1);
      }}>
        <TabsList>
          <TabsTrigger value="all">All ({totalCount})</TabsTrigger>
          <TabsTrigger value="draft">Draft</TabsTrigger>
          <TabsTrigger value="priced">Priced</TabsTrigger>
          <TabsTrigger value="sent">Sent</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Estimates Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Estimate #</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Project / Client</TableHead>
                <TableHead className="text-center">Items</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[150px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEstimates.map((estimate) => (
                <TableRow key={estimate.id}>
                  <TableCell className="font-mono text-sm">{estimate.estimateNumber}</TableCell>
                  <TableCell className="font-medium">{estimate.title}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-sm">{estimate.project.projectName}</div>
                      <div className="text-xs text-muted-foreground">
                        {estimate.project.client.clientDescription}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{estimate.items.length}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(estimate.totalAmount, estimate.currency?.symbol)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge 
                      variant={getStatusColor(estimate.status) as "default" | "secondary" | "destructive" | "outline"}
                      className="gap-1"
                    >
                      {getStatusIcon(estimate.status)}
                      {estimate.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(estimate.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedEstimate(estimate);
                          setViewModalOpen(true);
                        }}
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      {/* Price button - only for Admin/CEO on draft estimates */}
                      {canSetPrices && estimate.status === "draft" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openPriceModal(estimate)}
                          title="Set Prices"
                        >
                          <DollarSign className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {/* Send button - only for Sales/Admin on priced estimates */}
                      {canSendEstimate && estimate.status === "priced" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openSendModal(estimate)}
                          title="Send to Client"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {/* Edit button - for draft and priced estimates */}
                      {canEditEstimate && ["draft", "priced"].includes(estimate.status) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(estimate)}
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {/* Delete button - only for draft estimates */}
                      {estimate.status === "draft" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteEstimate(estimate.id)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredEstimates.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    {loading ? "Loading..." : "No estimates found"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} estimates
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-8"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Create Estimate Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Estimate</DialogTitle>
            <DialogDescription>
              Select a project and directory items to create an estimate
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Project Selection */}
            <div>
              <Label>Project *</Label>
              <Select
                value={selectedProjectId}
                onValueChange={async (value) => {
                  setSelectedProjectId(value);
                  setSelectedItems([]);
                  // Fetch directory lists for this project
                  const lists = await fetchProjectDirectoryLists(value);
                  const project = projects.find(p => p.id.toString() === value);
                  if (project) {
                    project.directoryLists = lists;
                    setProjects([...projects]);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id.toString()}>
                      {project.projectName} - {project.client.clientDescription}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Directory Items Selection */}
            {selectedProject && selectedProject.directoryLists && (
              <div>
                <Label>Select Items *</Label>
                <div className="border rounded-lg max-h-60 overflow-y-auto mt-2">
                  {selectedProject.directoryLists.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      No directory items found for this project
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-10"></TableHead>
                          <TableHead>Item</TableHead>
                          <TableHead>Code</TableHead>
                          <TableHead className="text-right">Qty</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedProject.directoryLists.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <Checkbox
                                checked={selectedItems.includes(item.id)}
                                onCheckedChange={(checked: boolean | "indeterminate") => {
                                  if (checked === true) {
                                    setSelectedItems([...selectedItems, item.id]);
                                  } else {
                                    setSelectedItems(selectedItems.filter(id => id !== item.id));
                                  }
                                }}
                              />
                            </TableCell>
                            <TableCell className="font-medium">{item.itemName}</TableCell>
                            <TableCell className="font-mono text-sm">{item.collectCode || "-"}</TableCell>
                            <TableCell className="text-right">{item.quantity}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {selectedItems.length} item(s) selected
                </div>
              </div>
            )}

            {/* Estimate Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Estimate title"
                />
              </div>
              <div className="col-span-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
                  rows={2}
                />
              </div>
              <div>
                <Label>Currency</Label>
                <Select
                  value={formData.currencyId}
                  onValueChange={(value) => setFormData({ ...formData, currencyId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.id} value={currency.id.toString()}>
                        {currency.code} - {currency.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Notes</Label>
                <Input
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Internal notes"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateEstimate} disabled={submitting}>
                {submitting ? "Creating..." : "Create Estimate"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Estimate Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Estimate Details - {selectedEstimate?.estimateNumber}</DialogTitle>
            <DialogDescription>
              {selectedEstimate?.title}
            </DialogDescription>
          </DialogHeader>

          {selectedEstimate && (
            <div className="space-y-4">
              {/* Status and Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <Badge variant={getStatusColor(selectedEstimate.status) as "default" | "secondary"} className="mt-1">
                    {selectedEstimate.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Project</Label>
                  <p className="text-sm font-medium">{selectedEstimate.project.projectName}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Client</Label>
                  <p className="text-sm font-medium">{selectedEstimate.project.client.clientDescription}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Total Amount</Label>
                  <p className="text-lg font-bold">
                    {formatCurrency(selectedEstimate.totalAmount, selectedEstimate.currency?.symbol)}
                  </p>
                </div>
              </div>

              {/* Workflow Info */}
              <div className="grid grid-cols-3 gap-4 p-3 bg-gray-50 rounded-lg">
                <div>
                  <Label className="text-xs text-muted-foreground">Created By</Label>
                  <p className="text-sm">{selectedEstimate.creator.username}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(selectedEstimate.createdAt).toLocaleString()}
                  </p>
                </div>
                {selectedEstimate.pricer && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Priced By</Label>
                    <p className="text-sm">{selectedEstimate.pricer.username}</p>
                    {selectedEstimate.pricedAt && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(selectedEstimate.pricedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}
                {selectedEstimate.sender && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Sent By</Label>
                    <p className="text-sm">{selectedEstimate.sender.username}</p>
                    {selectedEstimate.sentDate && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(selectedEstimate.sentDate).toLocaleString()}
                      </p>
                    )}
                    {selectedEstimate.sentToEmail && (
                      <p className="text-xs text-blue-600">{selectedEstimate.sentToEmail}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Items Table */}
              <div>
                <Label className="text-sm font-medium">Estimate Items</Label>
                <Table className="mt-2">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Photo</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedEstimate.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          {item.directoryList.photos && (item.directoryList.photos as string[]).length > 0 ? (
                            <img
                              src={(item.directoryList.photos as string[])[0]}
                              alt={item.directoryList.itemName}
                              className="w-12 h-12 object-cover rounded"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                              <Image className="h-4 w-4 text-gray-400" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{item.directoryList.itemName}</TableCell>
                        <TableCell className="font-mono text-sm">{item.directoryList.collectCode || "-"}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.unitPrice, selectedEstimate.currency?.symbol)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(item.totalPrice, selectedEstimate.currency?.symbol)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Notes */}
              {selectedEstimate.notes && (
                <div>
                  <Label className="text-xs text-muted-foreground">Notes</Label>
                  <p className="text-sm mt-1 whitespace-pre-wrap">{selectedEstimate.notes}</p>
                </div>
              )}

              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setViewModalOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Set Prices Modal (CEO) */}
      <Dialog open={priceModalOpen} onOpenChange={setPriceModalOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Set Prices - {selectedEstimate?.estimateNumber}</DialogTitle>
            <DialogDescription>
              Enter unit prices for each item in the estimate
            </DialogDescription>
          </DialogHeader>

          {selectedEstimate && (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right w-32">Unit Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pricingItems.map((item, index) => {
                    const estimateItem = selectedEstimate.items.find(i => i.id === item.id);
                    const total = (parseFloat(item.unitPrice) || 0) * item.quantity;
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {estimateItem?.directoryList.itemName}
                        </TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => {
                              const newItems = [...pricingItems];
                              newItems[index].unitPrice = e.target.value;
                              setPricingItems(newItems);
                            }}
                            className="w-28 text-right"
                            placeholder="0.00"
                          />
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(total, selectedEstimate.currency?.symbol)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Total Amount:</span>
                <span className="text-xl font-bold">
                  {formatCurrency(
                    pricingItems.reduce((sum, item) => sum + (parseFloat(item.unitPrice) || 0) * item.quantity, 0),
                    selectedEstimate.currency?.symbol
                  )}
                </span>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setPriceModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSetPrices} disabled={submitting}>
                  {submitting ? "Saving..." : "Save Prices"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Send Estimate Modal */}
      <Dialog open={sendModalOpen} onOpenChange={setSendModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Estimate to Client</DialogTitle>
            <DialogDescription>
              Send {selectedEstimate?.estimateNumber} to the client via email
            </DialogDescription>
          </DialogHeader>

          {selectedEstimate && (
            <div className="space-y-4">
              <div>
                <Label>Client Email *</Label>
                <Input
                  type="email"
                  value={sendEmail}
                  onChange={(e) => setSendEmail(e.target.value)}
                  placeholder="client@example.com"
                />
              </div>

              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 text-blue-700">
                  <Mail className="h-4 w-4" />
                  <span className="font-medium">Email Preview</span>
                </div>
                <div className="mt-2 text-sm text-blue-600">
                  <p>To: {sendEmail}</p>
                  <p>Subject: Estimate {selectedEstimate.estimateNumber} - {selectedEstimate.title}</p>
                  <p className="mt-2">
                    Total Amount: {formatCurrency(selectedEstimate.totalAmount, selectedEstimate.currency?.symbol)}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSendModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSendEstimate} disabled={submitting}>
                  {submitting ? "Sending..." : "Send Estimate"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Estimate Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Estimate - {selectedEstimate?.estimateNumber}</DialogTitle>
            <DialogDescription>
              Update estimate details
            </DialogDescription>
          </DialogHeader>

          {selectedEstimate && (
            <div className="space-y-4">
              <div>
                <Label>Title *</Label>
                <Input
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  placeholder="Estimate title"
                />
              </div>
              
              <div>
                <Label>Description</Label>
                <Textarea
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  placeholder="Optional description"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Currency</Label>
                  <Select
                    value={editFormData.currencyId}
                    onValueChange={(value) => setEditFormData({ ...editFormData, currencyId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.id} value={currency.id.toString()}>
                          {currency.code} - {currency.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Notes</Label>
                  <Input
                    value={editFormData.notes}
                    onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                    placeholder="Internal notes"
                  />
                </div>
              </div>

              {/* Show current items (read-only) */}
              <div>
                <Label className="text-sm font-medium">Estimate Items</Label>
                <div className="border rounded-lg max-h-40 overflow-y-auto mt-2">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Unit Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedEstimate.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.directoryList.itemName}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.unitPrice, selectedEstimate.currency?.symbol)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.totalPrice, selectedEstimate.currency?.symbol)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleEditEstimate} disabled={submitting}>
                  {submitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}