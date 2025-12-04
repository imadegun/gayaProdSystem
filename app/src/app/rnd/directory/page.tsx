"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, FileText, Edit, Trash2, Image, Eye, Upload, X, Copy } from "lucide-react";

interface DirectoryList {
  id: number;
  projectId: number;
  itemName: string;
  collectCode?: string;
  quantity: number;
  unit?: string;
  price?: number;
  total?: number;
  status: string;
  batchLabel?: string;
  // Enhanced item properties
  photos?: string[];
  textureName?: string;
  colorName?: string;
  materialName?: string;
  sizeInfo?: string;
  // Technical specifications (JSON arrays for multiple materials)
  clayIds?: number[];
  glazeIds?: number[];
  engobeIds?: number[];
  lusterIds?: number[];
  firingType?: string;
  stainOxideId?: number;
  dimensions?: any;
  weight?: number;
  technotes?: string;
  isDecor?: boolean;
  notes?: string;
  // Set/Breakdown model support
  isSet?: boolean;
  components?: any;
  // Relations
  stainOxide?: { id: number; stainOxideCode: string; stainOxideDescription: string };
  project: {
    projectName: string;
    client: {
      clientCode: string;
      clientDescription: string;
    };
  };
}

interface Project {
  id: number;
  projectName: string;
  client: {
    clientCode: string;
    clientDescription: string;
  };
}

interface Material {
  id: number;
  [key: string]: any; // Allow dynamic property access for different material types
}


export default function RNDDirectoryPage() {
  const [directoryLists, setDirectoryLists] = useState<DirectoryList[]>([]);
  const [availableDirectoryItems, setAvailableDirectoryItems] = useState<DirectoryList[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<DirectoryList | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DirectoryList | null>(null);
  const [duplicatingItem, setDuplicatingItem] = useState<DirectoryList | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDirectoryLists();
    fetchProjects();
  }, []);

  const fetchDirectoryLists = async () => {
    try {
      const response = await fetch("/api/rnd/directory");
      if (response.ok) {
        const data = await response.json();
        setDirectoryLists(data.directoryLists);
        setAvailableDirectoryItems(data.directoryLists);
      }
    } catch (error) {
      console.error("Error fetching directory lists:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/rnd/projects?page=1&limit=100");
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const handleCreate = async (formData: any) => {
    setSubmitting(true);
    try {
      const response = await fetch("/api/rnd/directory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        await fetchDirectoryLists();
        setFormModalOpen(false);
      } else {
        console.error("Error creating directory item");
      }
    } catch (error) {
      console.error("Error creating directory item:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (id: number, formData: any) => {
    setSubmitting(true);
    try {
      const response = await fetch(`/api/rnd/directory-list/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        await fetchDirectoryLists();
        setFormModalOpen(false);
        setEditingItem(null);
      } else {
        console.error("Error updating directory item");
      }
    } catch (error) {
      console.error("Error updating directory item:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this directory item?")) {
      try {
        const response = await fetch(`/api/rnd/directory-list/${id}`, {
          method: "DELETE",
        });
        if (response.ok) {
          await fetchDirectoryLists();
        } else {
          console.error("Error deleting directory item");
        }
      } catch (error) {
        console.error("Error deleting directory item:", error);
      }
    }
  };

  const handleDuplicate = (item: DirectoryList) => {
    setDuplicatingItem(item);
    setEditingItem(null);
    setFormModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading Directory Lists...</div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Directory Lists</h1>
          <p className="text-sm text-muted-foreground">
            Manage your product directory items and specifications
          </p>
        </div>
        <Button size="sm" onClick={() => {
          setEditingItem(null);
          setFormModalOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-1" />
          Add Item
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="text-sm">
              <TableHeader>
                <TableRow className="h-9">
                  <TableHead className="w-[60px] py-2 px-2">Photo</TableHead>
                  <TableHead className="w-[100px] py-2 px-2">Code</TableHead>
                  <TableHead className="py-2 px-2">Batch</TableHead>
                  <TableHead className="py-2 px-2">Category</TableHead>
                  <TableHead className="py-2 px-2">Info Size</TableHead>
                  <TableHead className="py-2 px-2">Material</TableHead>
                  <TableHead className="w-[60px] py-2 px-2">Qty</TableHead>
                  <TableHead className="w-[60px] py-2 px-2">Unit</TableHead>
                  <TableHead className="w-[80px] py-2 px-2">Price</TableHead>
                  <TableHead className="w-[80px] py-2 px-2">Total</TableHead>
                  <TableHead className="w-[100px] py-2 px-2">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {directoryLists.map((item) => (
                  <TableRow key={item.id} className="h-12">
                    <TableCell className="py-1 px-2">
                      {item.photos && item.photos.length > 0 ? (
                        <div className="flex items-center gap-1">
                          <img
                            src={item.photos[0]}
                            alt={item.itemName}
                            className="w-10 h-10 object-cover rounded border cursor-pointer hover:opacity-80"
                            onClick={() => {
                              setSelectedItem(item);
                              setDetailModalOpen(true);
                            }}
                          />
                          {item.photos.length > 1 && (
                            <span className="text-xs text-muted-foreground bg-gray-100 px-1 rounded">+{item.photos.length - 1}</span>
                          )}
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded border flex items-center justify-center">
                          <Image className="h-4 w-4 text-gray-400" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs py-1 px-2">{item.collectCode || "-"}</TableCell>
                    <TableCell className="text-xs py-1 px-2">
                      {item.batchLabel ? (
                        <Badge variant="outline" className="text-[10px] px-1">{item.batchLabel}</Badge>
                      ) : "-"}
                    </TableCell>
                    <TableCell className="font-medium py-1 px-2">{item.itemName}</TableCell>
                    <TableCell className="font-medium py-1 px-2">{item.sizeInfo || "-"}</TableCell>
                    <TableCell className="font-medium py-1 px-2">{item.materialName || "-"}</TableCell>
                    <TableCell className="text-center py-1 px-2">{item.quantity}</TableCell>
                    <TableCell className="py-1 px-2">{item.unit || "-"}</TableCell>
                    <TableCell className="text-right py-1 px-2">{item.price ? item.price.toLocaleString() : "-"}</TableCell>
                    <TableCell className="text-right font-medium py-1 px-2">{item.total ? item.total.toLocaleString() : "-"}</TableCell>
                    <TableCell className="py-1 px-2">
                      <div className="flex gap-0.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => {
                            setSelectedItem(item);
                            setDetailModalOpen(true);
                          }}
                          title="View Details"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => {
                            setEditingItem(item);
                            setFormModalOpen(true);
                          }}
                          title="Edit"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => handleDuplicate(item)}
                          title="Duplicate"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(item.id)}
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {directoryLists.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-6 text-muted-foreground text-sm">
                      No directory items created yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Technical Sheet Detail Modal with Tabs */}
      <DetailModal
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        selectedItem={selectedItem}
        materials={null}
      />

      {/* Create/Edit Form Modal */}
      <Dialog open={formModalOpen} onOpenChange={setFormModalOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-lg">
              {editingItem ? "Edit Directory Item" : duplicatingItem ? "Duplicate Directory Item" : "Add Directory Item"}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {editingItem ? "Update the directory item details" : "Create a new directory item"}
            </DialogDescription>
          </DialogHeader>

          <DirectoryForm
            projects={projects}
            availableDirectoryItems={availableDirectoryItems}
            editingItem={editingItem}
            duplicatingItem={duplicatingItem}
            onSubmit={editingItem ? (data) => handleUpdate(editingItem.id, data) : handleCreate}
            onCancel={() => {
              setFormModalOpen(false);
              setDuplicatingItem(null);
            }}
            submitting={submitting}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Detail Modal Component with Tabs
function DetailModal({
  open,
  onOpenChange,
  selectedItem,
  materials
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedItem: DirectoryList | null;
  materials: any;
}) {
  const [activeTab, setActiveTab] = useState("basic");
  const [loadedMaterials, setLoadedMaterials] = useState<{
    clays: any[];
    glazes: any[];
    engobes: any[];
    lusters: any[];
    stainOxides: any[];
  }>({
    clays: [],
    glazes: [],
    engobes: [],
    lusters: [],
    stainOxides: [],
  });
  const [resolvedComponents, setResolvedComponents] = useState<any[]>([]);

  // Fetch materials and resolve components when modal opens
  useEffect(() => {
    if (open && selectedItem) {
      fetchMaterialsForDetail();
      resolveComponentDetails();
    }
  }, [open, selectedItem]);

  const fetchMaterialsForDetail = async () => {
    try {
      const [clayRes, glazeRes, engobeRes, lusterRes, stainOxideRes] = await Promise.all([
        fetch("/api/rnd/materials/clay"),
        fetch("/api/rnd/materials/glaze"),
        fetch("/api/rnd/materials/engobe"),
        fetch("/api/rnd/materials/luster"),
        fetch("/api/rnd/materials/stainoxide"),
      ]);

      const [clayData, glazeData, engobeData, lusterData, stainOxideData] = await Promise.all([
        clayRes.json(),
        glazeRes.json(),
        engobeRes.json(),
        lusterRes.json(),
        stainOxideRes.json(),
      ]);

      setLoadedMaterials({
        clays: clayData.clays || [],
        glazes: glazeData.glazes || [],
        engobes: engobeData.engobes || [],
        lusters: lusterData.lusters || [],
        stainOxides: stainOxideData.stainOxides || [],
      });
    } catch (error) {
      console.error("Error fetching materials:", error);
    }
  };

  const resolveComponentDetails = async () => {
    if (!selectedItem?.components || !Array.isArray(selectedItem.components)) {
      setResolvedComponents([]);
      return;
    }

    try {
      // Get all directory items to resolve component references
      const response = await fetch("/api/rnd/directory");
      if (!response.ok) {
        setResolvedComponents(selectedItem.components);
        return;
      }

      const data = await response.json();
      const allDirectoryItems = data.directoryLists || [];

      // Resolve each component
      const resolved = selectedItem.components.map((component: any) => {
        if (component.componentId) {
          // Find the referenced directory item
          const referencedItem = allDirectoryItems.find((item: DirectoryList) => item.id === component.componentId);
          if (referencedItem) {
            return {
              ...component,
              componentName: referencedItem.itemName,
              collectCode: referencedItem.collectCode,
              resolvedItem: referencedItem
            };
          }
        }
        return component;
      });

      setResolvedComponents(resolved);
    } catch (error) {
      console.error("Error resolving component details:", error);
      setResolvedComponents(selectedItem.components);
    }
  };

  // Helper function to get material names by IDs
  const getMaterialNames = (ids: number[] | undefined, materials: any[], codeField: string, descField: string) => {
    if (!ids || ids.length === 0) return "N/A";
    const names = ids.map(id => {
      const material = materials.find((m: any) => m.id === id);
      return material ? `${material[codeField]} - ${material[descField]}` : `ID: ${id}`;
    });
    return names.join(", ");
  };

  if (!selectedItem) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto p-4">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-lg">Technical Sheet - {selectedItem.itemName}</DialogTitle>
          <DialogDescription className="text-sm">
            Complete technical specifications and properties
          </DialogDescription>
        </DialogHeader>

        {/* Main Layout: Image on left, Project info on right */}
        <div className="flex gap-4 mb-4">
          {/* Left side - Image thumbnail */}
          <div className="flex-shrink-0 w-32">
            {selectedItem.photos && selectedItem.photos.length > 0 ? (
              <div className="space-y-2">
                <img
                  src={selectedItem.photos[0]}
                  alt={selectedItem.itemName}
                  className="w-32 h-32 object-cover rounded-lg border shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => window.open(selectedItem.photos![0], '_blank')}
                />
                {selectedItem.photos.length > 1 && (
                  <div className="flex gap-1 flex-wrap">
                    {selectedItem.photos.slice(1, 4).map((photo: string, index: number) => (
                      <img
                        key={index}
                        src={photo}
                        alt={`Photo ${index + 2}`}
                        className="w-9 h-9 object-cover rounded border cursor-pointer hover:opacity-80"
                        onClick={() => window.open(photo, '_blank')}
                      />
                    ))}
                    {selectedItem.photos.length > 4 && (
                      <div className="w-9 h-9 bg-gray-100 rounded border flex items-center justify-center text-xs text-muted-foreground">
                        +{selectedItem.photos.length - 4}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="w-32 h-32 bg-gray-100 rounded-lg border flex items-center justify-center">
                <Image className="h-8 w-8 text-gray-400" />
              </div>
            )}
          </div>

          {/* Right side - Project Information */}
          <div className="flex-1 min-w-0">
            <div className="bg-gray-50 rounded-lg p-3 h-full">
              <h4 className="font-semibold text-sm mb-2">Project Information</h4>
              <div className="grid grid-cols-1 gap-x-4 gap-y-1 text-sm">
                <div className="flex justify-left">
                  <span className="text-muted-foreground text-xs">Title:</span>
                  <span className="font-medium text-xs truncate ml-2">{selectedItem.project.projectName}</span>
                </div>
                <div className="flex justify-left">
                  <span className="text-muted-foreground text-xs">Client:</span>
                  <span className="text-xs truncate ml-2">{selectedItem.project.client.clientDescription}</span>
                </div>
             
                <div className="flex justify-left">
                  <span className="text-muted-foreground text-xs">Status:</span>
                  <Badge variant={selectedItem.status === "approved" ? "default" : "secondary"} className="text-xs py-0 px-1 h-5">{selectedItem.status}</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs for detailed information */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-9">
            <TabsTrigger value="basic" className="text-xs">Basic Information</TabsTrigger>
            <TabsTrigger value="properties" className="text-xs">Properties</TabsTrigger>
            <TabsTrigger value="technical" className="text-xs">Technical Spec</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="mt-3 space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="bg-gray-50 rounded p-2">
                <div className="text-muted-foreground text-xs uppercase mb-1">Category</div>
                <div className="font-medium text-sm">{selectedItem.itemName}</div>
              </div>
              <div className="bg-gray-50 rounded p-2">
                <div className="text-muted-foreground text-xs uppercase mb-1">Code</div>
                <div className="font-mono text-sm">{selectedItem.collectCode || "N/A"}</div>
              </div>
              <div className="bg-gray-50 rounded p-2">
                <div className="text-muted-foreground text-xs uppercase mb-1">Quantity</div>
                <div className="font-medium text-sm">{selectedItem.quantity}</div>
              </div>
              <div className="bg-gray-50 rounded p-2">
                <div className="text-muted-foreground text-xs uppercase mb-1">Unit</div>
                <div className="font-medium text-sm">{selectedItem.unit || "N/A"}</div>
              </div>
              <div className="bg-gray-50 rounded p-2">
                <div className="text-muted-foreground text-xs uppercase mb-1">Price</div>
                <div className="font-medium text-sm">{selectedItem.price ? selectedItem.price.toLocaleString() : "N/A"}</div>
              </div>
              <div className="bg-gray-50 rounded p-2">
                <div className="text-muted-foreground text-xs uppercase mb-1">Total</div>
                <div className="font-medium text-sm">{selectedItem.total ? selectedItem.total.toLocaleString() : "N/A"}</div>
              </div>
            </div>

            {/* Notes */}
            {selectedItem.notes && (
              <div className="bg-gray-50 rounded p-2">
                <div className="text-muted-foreground text-xs uppercase mb-1">Notes</div>
                <p className="text-sm">{selectedItem.notes}</p>
              </div>
            )}

            {/* Set Components */}
            {selectedItem.isSet && resolvedComponents.length > 0 && (
              <div className="bg-gray-50 rounded p-2">
                <div className="text-muted-foreground text-xs uppercase mb-2">Set Components ({resolvedComponents.length})</div>
                <div className="space-y-2">
                  {resolvedComponents.map((component: any, index: number) => (
                    <div key={index} className="bg-white p-2 rounded border text-xs">
                      <div className="flex gap-2 items-center">
                        {/* Photo thumbnail for directory items */}
                        {component.componentId && component.resolvedItem?.photos && component.resolvedItem.photos.length > 0 && (
                          <div className="flex-shrink-0">
                            <img
                              src={component.resolvedItem.photos[0]}
                              alt={component.componentName}
                              className="w-10 h-10 object-cover rounded border cursor-pointer hover:opacity-80"
                              onClick={() => window.open(component.resolvedItem.photos[0], '_blank')}
                            />
                          </div>
                        )}
                        {/* Photo for external components */}
                        {component.photos && component.photos.length > 0 && !component.componentId && (
                          <div className="flex-shrink-0">
                            <img
                              src={component.photos[0]}
                              alt={component.componentName}
                              className="w-10 h-10 object-cover rounded border cursor-pointer hover:opacity-80"
                              onClick={() => window.open(component.photos[0], '_blank')}
                            />
                          </div>
                        )}
                        {/* Placeholder for items without photos */}
                        {((component.componentId && (!component.resolvedItem?.photos || component.resolvedItem.photos.length === 0)) ||
                          (!component.componentId && (!component.photos || component.photos.length === 0))) && (
                          <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded border flex items-center justify-center">
                            <Image className="h-4 w-4 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="grid grid-cols-2 gap-2 mb-1">
                            <div>
                              <span className="font-medium">
                                {component.collectCode && `${component.collectCode} - `}
                                {component.componentName || component.description || `Item ${component.componentId}`}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Qty:</span>
                              <span className="font-medium ml-1">{component.quantity}</span>
                            </div>
                          </div>
                          {(component.notes || component.description) && (
                            <div className="pt-1 border-t">
                              <span className="text-muted-foreground">Details:</span>
                              <span className="ml-1">{component.notes || component.description}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="properties" className="mt-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="bg-gray-50 rounded p-2">
                <div className="text-muted-foreground text-xs uppercase mb-1">Color</div>
                <div className="font-medium text-sm">{selectedItem.colorName || "N/A"}</div>
              </div>
              <div className="bg-gray-50 rounded p-2">
                <div className="text-muted-foreground text-xs uppercase mb-1">Texture</div>
                <div className="font-medium text-sm">{selectedItem.textureName || "N/A"}</div>
              </div>
              <div className="bg-gray-50 rounded p-2">
                <div className="text-muted-foreground text-xs uppercase mb-1">Material</div>
                <div className="font-medium text-sm">{selectedItem.materialName || "N/A"}</div>
              </div>
              <div className="bg-gray-50 rounded p-2">
                <div className="text-muted-foreground text-xs uppercase mb-1">Size Info</div>
                <div className="font-medium text-sm">{selectedItem.sizeInfo || "N/A"}</div>
              </div>
              <div className="bg-gray-50 rounded p-2">
                <div className="text-muted-foreground text-xs uppercase mb-1">Final Size</div>
                <div className="font-medium text-sm">{selectedItem.dimensions ? JSON.stringify(selectedItem.dimensions) : "N/A"}</div>
              </div>
              <div className="bg-gray-50 rounded p-2">
                <div className="text-muted-foreground text-xs uppercase mb-1">Weight (KG)</div>
                <div className="font-medium text-sm">{selectedItem.weight ? `${selectedItem.weight}` : "N/A"}</div>
              </div>
              <div className="bg-gray-50 rounded p-2">
                <div className="text-muted-foreground text-xs uppercase mb-1">Is Decor</div>
                <div className="font-medium text-sm">{selectedItem.isDecor ? "Yes" : "No"}</div>
              </div>
              <div className="bg-gray-50 rounded p-2">
                <div className="text-muted-foreground text-xs uppercase mb-1">Is Set</div>
                <div className="font-medium text-sm">{selectedItem.isSet ? "Yes" : "No"}</div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="technical" className="mt-3 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-50 rounded p-2">
                <div className="text-muted-foreground text-xs uppercase mb-1">Clay</div>
                <div className="font-medium text-sm">
                  {getMaterialNames(selectedItem.clayIds, loadedMaterials.clays, 'clayCode', 'clayDescription')}
                </div>
              </div>
              <div className="bg-gray-50 rounded p-2">
                <div className="text-muted-foreground text-xs uppercase mb-1">Engobe</div>
                <div className="font-medium text-sm">
                  {getMaterialNames(selectedItem.engobeIds, loadedMaterials.engobes, 'engobeCode', 'engobeDescription')}
                </div>
              </div>
              <div className="bg-gray-50 rounded p-2">
                <div className="text-muted-foreground text-xs uppercase mb-1">Glaze</div>
                <div className="font-medium text-sm">
                  {getMaterialNames(selectedItem.glazeIds, loadedMaterials.glazes, 'glazeCode', 'glazeDescription')}
                </div>
              </div>
              <div className="bg-gray-50 rounded p-2">
                <div className="text-muted-foreground text-xs uppercase mb-1">Stain Oxide</div>
                <div className="font-medium text-sm">
                  {selectedItem.stainOxide ? `${selectedItem.stainOxide.stainOxideCode} - ${selectedItem.stainOxide.stainOxideDescription}` : "N/A"}
                </div>
              </div>
              <div className="bg-gray-50 rounded p-2">
                <div className="text-muted-foreground text-xs uppercase mb-1">Luster</div>
                <div className="font-medium text-sm">
                  {getMaterialNames(selectedItem.lusterIds, loadedMaterials.lusters, 'lustreCode', 'lustreDescription')}
                </div>
              </div>
              <div className="bg-gray-50 rounded p-2">
                <div className="text-muted-foreground text-xs uppercase mb-1">Firing</div>
                <div className="font-medium text-sm">{selectedItem.firingType || "N/A"}</div>
              </div>
            </div>

            {/* Technical Notes */}
            {selectedItem.technotes && (
              <div className="bg-gray-50 rounded p-2">
                <div className="text-muted-foreground text-xs uppercase mb-1">Technical Notes</div>
                <p className="text-sm">{selectedItem.technotes}</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

// Directory Form Component
function DirectoryForm({
  projects,
  availableDirectoryItems,
  editingItem,
  duplicatingItem,
  onSubmit,
  onCancel,
  submitting
}: {
  projects: Project[];
  availableDirectoryItems: DirectoryList[];
  editingItem: DirectoryList | null;
  duplicatingItem: DirectoryList | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  submitting: boolean;
}) {
  const [formData, setFormData] = useState({
    projectId: "",
    batchLabel: "",
    itemName: "",
    collectCode: "",
    quantity: 1,
    unit: "",
    price: "",
    total: "",
    textureName: "",
    colorName: "",
    materialName: "",
    sizeInfo: "",
    clayIds: [] as string[],
    glazeIds: [] as string[],
    engobeIds: [] as string[],
    firingType: "",
    lusterIds: [] as string[],
    stainOxideId: "",
    weight: "",
    technotes: "",
    isDecor: false,
    isSet: false,
    components: [] as any[],
    notes: "",
    photos: [] as string[],
  });

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingComponentPhoto, setUploadingComponentPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const componentFileInputRef = useRef<HTMLInputElement>(null);

  const [materials, setMaterials] = useState<{
    clays: Material[];
    glazes: Material[];
    engobes: Material[];
    lusters: Material[];
    stainOxides: Material[];
  }>({
    clays: [],
    glazes: [],
    engobes: [],
    lusters: [],
    stainOxides: [],
  });

  const [showAddMaterial, setShowAddMaterial] = useState({
    clay: false,
    glaze: false,
    engobe: false,
    luster: false,
  });

  const [newMaterial, setNewMaterial] = useState({
    clay: { code: "", description: "", notes: "" },
    glaze: { code: "", description: "", notes: "" },
    engobe: { code: "", description: "", notes: "" },
    luster: { code: "", description: "", notes: "" },
  });

  // Fetch materials on component mount
  useEffect(() => {
    fetchMaterials();
  }, []);

  // Update form data when editingItem or duplicatingItem changes
  useEffect(() => {
    const item = editingItem || duplicatingItem;
    if (item) {
      if (duplicatingItem) {
        // For duplication, copy all data but modify the name and clear the code
        setFormData({
          projectId: item.projectId?.toString() || "",
          itemName: `${item.itemName || ""} (Copy)`,
          collectCode: "", // Will be auto-generated
          quantity: item.quantity || 1,
          unit: item.unit || "",
          price: item.price?.toString() || "",
          total: item.total?.toString() || "",
          textureName: item.textureName || "",
          colorName: item.colorName || "",
          materialName: item.materialName || "",
          sizeInfo: item.sizeInfo || "",
          clayIds: (item.clayIds || []).map(id => id.toString()),
          glazeIds: (item.glazeIds || []).map(id => id.toString()),
          engobeIds: (item.engobeIds || []).map(id => id.toString()),
          firingType: item.firingType || "",
          lusterIds: (item.lusterIds || []).map(id => id.toString()),
          stainOxideId: item.stainOxideId?.toString() || "",
          weight: item.weight?.toString() || "",
          technotes: item.technotes || "",
          isDecor: item.isDecor || false,
          isSet: item.isSet || false,
          components: item.components || [],
          notes: item.notes || "",
          photos: item.photos || [], // Copy photos for duplication
        });
      } else {
        // For editing existing items, load the current saved data
        setFormData({
          projectId: item.projectId?.toString() || "",
          itemName: item.itemName || "",
          collectCode: item.collectCode || "",
          quantity: item.quantity || 1,
          unit: item.unit || "",
          price: item.price?.toString() || "",
          total: item.total?.toString() || "",
          textureName: item.textureName || "",
          colorName: item.colorName || "",
          materialName: item.materialName || "",
          sizeInfo: item.sizeInfo || "",
          clayIds: (item.clayIds || []).map(id => id.toString()),
          glazeIds: (item.glazeIds || []).map(id => id.toString()),
          engobeIds: (item.engobeIds || []).map(id => id.toString()),
          firingType: item.firingType || "",
          lusterIds: (item.lusterIds || []).map(id => id.toString()),
          stainOxideId: item.stainOxideId?.toString() || "",
          weight: item.weight?.toString() || "",
          technotes: item.technotes || "",
          isDecor: item.isDecor || false,
          isSet: item.isSet || false,
          components: item.components || [],
          notes: item.notes || "",
          photos: item.photos || [],
        });
      }
    }
  }, [editingItem, duplicatingItem]);

  const fetchMaterials = async () => {
    try {
      const [clayRes, glazeRes, engobeRes, lusterRes, stainOxideRes] = await Promise.all([
        fetch("/api/rnd/materials/clay"),
        fetch("/api/rnd/materials/glaze"),
        fetch("/api/rnd/materials/engobe"),
        fetch("/api/rnd/materials/luster"),
        fetch("/api/rnd/materials/stainoxide"),
      ]);

      const [clayData, glazeData, engobeData, lusterData, stainOxideData] = await Promise.all([
        clayRes.json(),
        glazeRes.json(),
        engobeRes.json(),
        lusterRes.json(),
        stainOxideRes.json(),
      ]);

      setMaterials({
        clays: clayData.clays || [],
        glazes: glazeData.glazes || [],
        engobes: engobeData.engobes || [],
        lusters: lusterData.lusters || [],
        stainOxides: stainOxideData.stainOxides || [],
      });
    } catch (error) {
      console.error("Error fetching materials:", error);
    }
  };

  const generateCollectCode = async (isSet: boolean = false) => {
    try {
      // Get all existing codes from directory and collections
      const [dirResponse, collectResponse] = await Promise.all([
        fetch("/api/rnd/directory").then(r => r.json()),
        fetch("/api/rnd/collections").then(r => r.json()).catch(() => ({ collections: [] }))
      ]);

      const existingCodes = [
        ...(dirResponse.directoryLists || []).map((item: any) => item.collectCode).filter(Boolean),
        ...(collectResponse.collections || []).map((item: any) => item.collectCode).filter(Boolean)
      ];

      // Determine prefix based on item type
      // GX prefix for sets/assemblies, AA prefix for individual items
      const targetPrefix = isSet ? 'GX' : 'AA';
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

      // Filter codes by the target prefix
      const prefixCodes = existingCodes.filter((code: string) =>
        code && code.startsWith(targetPrefix + '-') && code.length === 6
      );

      // Find the highest number for this prefix
      let highestNum = 0;

      for (const code of prefixCodes) {
        const [prefix, numPart] = code.split('-');
        if (prefix === targetPrefix) {
          const num = parseInt(numPart);
          if (num >= 1 && num <= 999) {
            highestNum = Math.max(highestNum, num);
          }
        }
      }

      // Generate the next code
      const nextNum = highestNum + 1;

      // Handle number overflow (reset to 001 if exceeds 999)
      if (nextNum > 999) {
        // For now, we'll wrap around. In production, you might want to increment the prefix
        return `${targetPrefix}-001`;
      }

      const nextCode = `${targetPrefix}-${String(nextNum).padStart(3, '0')}`;
      return nextCode;

    } catch (error) {
      console.error("Error generating code:", error);
      return "";
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingPhoto(true);
    try {
      const newPhotos: string[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // Convert to base64 for simple storage (in production, use proper file upload)
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        newPhotos.push(base64);
      }
      
      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos, ...newPhotos]
      }));
    } catch (error) {
      console.error("Error uploading photos:", error);
      alert("Error uploading photos. Please try again.");
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const handleComponentPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingComponentPhoto(true);
    try {
      const newPhotos: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // Convert to base64 for simple storage (in production, use proper file upload)
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        newPhotos.push(base64);
      }

      // For now, we'll store component photos in a temporary state
      // In a real implementation, you'd upload to a server and get URLs back
      return newPhotos;
    } catch (error) {
      console.error("Error uploading component photos:", error);
      alert("Error uploading component photos. Please try again.");
      return [];
    } finally {
      setUploadingComponentPhoto(false);
      if (componentFileInputRef.current) {
        componentFileInputRef.current.value = "";
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate set components if isSet is true
    if (formData.isSet) {
      if (!formData.components || !Array.isArray(formData.components)) {
        alert("Set components must be a valid JSON array");
        return;
      }

      // Validate each component has required fields
      for (const component of formData.components) {
        if (typeof component !== 'object' || component === null) {
          alert("Each component must be an object");
          return;
        }
        // Components can be either:
        // 1. References to other directory items (componentId required)
        // 2. External components (componentName/description required)
        const hasDirectoryReference = component.componentId !== undefined && component.componentId !== null;
        const hasExternalDescription = component.componentName || component.description;

        if (!hasDirectoryReference && !hasExternalDescription) {
          alert("Each component must have either componentId (for directory items) or componentName/description (for external components)");
          return;
        }
        if (!component.quantity) {
          alert("Each component must have quantity");
          return;
        }
        if (typeof component.quantity !== 'number' || component.quantity <= 0) {
          alert("Component quantity must be a positive number");
          return;
        }
      }

      // TODO: Future enhancement - Calculate total price based on component prices
      // This would require fetching component details and summing (component.price * component.quantity)
    }

    const qty = parseInt(formData.quantity.toString());
    const unitPrice = formData.price ? parseFloat(formData.price.toString()) : undefined;
    const calculatedTotal = unitPrice && qty ? unitPrice * qty : (formData.total ? parseFloat(formData.total.toString()) : undefined);

    onSubmit({
      ...formData,
      projectId: parseInt(formData.projectId),
      quantity: qty,
      unit: formData.unit || undefined,
      price: unitPrice,
      total: calculatedTotal,
      clayIds: formData.clayIds.map(id => parseInt(id)),
      glazeIds: formData.glazeIds.map(id => parseInt(id)),
      engobeIds: formData.engobeIds.map(id => parseInt(id)),
      lusterIds: formData.lusterIds.map(id => parseInt(id)),
      stainOxideId: formData.stainOxideId ? parseInt(formData.stainOxideId) : undefined,
      weight: formData.weight ? parseFloat(formData.weight.toString()) : undefined,
      isSet: formData.isSet,
      components: formData.components,
      photos: formData.photos,
    });
  };

  const handleChange = (field: string, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-9">
          <TabsTrigger value="general" className="text-xs">General</TabsTrigger>
          <TabsTrigger value="photos" className="text-xs">Photos</TabsTrigger>
          <TabsTrigger value="technical" className="text-xs">Technical Sheet</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-3 mt-3">
           <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
             <div>
               <label className="text-xs font-medium">Project</label>
               <select
                 value={formData.projectId}
                 onChange={(e) => handleChange("projectId", e.target.value)}
                 className="w-full p-1.5 text-sm border rounded"
                 required
               >
                 <option value="">Select Project</option>
                 {projects.map(project => (
                   <option key={project.id} value={project.id.toString()}>
                     {project.projectName}
                   </option>
                 ))}
               </select>
             </div>

             <div>
               <label className="text-xs font-medium">Category (Item Name)</label>
               <input
                 type="text"
                 value={formData.itemName}
                 onChange={(e) => handleChange("itemName", e.target.value)}
                 className="w-full p-1.5 text-sm border rounded"
                 required
               />
             </div>

             <div>
               <label className="text-xs font-medium">Code</label>
               <div className="flex gap-1">
                 <input
                   type="text"
                   value={formData.collectCode}
                   onChange={(e) => handleChange("collectCode", e.target.value)}
                   className="flex-1 p-1.5 text-sm border rounded"
                   placeholder="Auto or manual"
                 />
                 <Button
                   type="button"
                   variant="outline"
                   size="sm"
                   className="text-xs h-8 px-2"
                   onClick={async () => {
                     const code = await generateCollectCode(formData.isSet);
                     if (code) {
                       handleChange("collectCode", code);
                     }
                   }}
                 >
                   Gen
                 </Button>
               </div>
             </div>

             <div>
               <label className="text-xs font-medium">Size Info</label>
               <input
                 type="text"
                 value={formData.sizeInfo}
                 onChange={(e) => handleChange("sizeInfo", e.target.value)}
                 className="w-full p-1.5 text-sm border rounded"
               />
             </div>

             <div>
               <label className="text-xs font-medium">Materials</label>
               <input
                 type="text"
                 value={formData.materialName}
                 onChange={(e) => handleChange("materialName", e.target.value)}
                 className="w-full p-1.5 text-sm border rounded"
               />
             </div>

             <div>
               <label className="text-xs font-medium">Color</label>
               <input
                 type="text"
                 value={formData.colorName}
                 onChange={(e) => handleChange("colorName", e.target.value)}
                 className="w-full p-1.5 text-sm border rounded"
               />
             </div>

             <div>
               <label className="text-xs font-medium">Texture</label>
               <input
                 type="text"
                 value={formData.textureName}
                 onChange={(e) => handleChange("textureName", e.target.value)}
                 className="w-full p-1.5 text-sm border rounded"
               />
             </div>

             <div>
               <label className="text-xs font-medium">Qty</label>
               <input
                 type="number"
                 value={formData.quantity}
                 onChange={(e) => {
                   handleChange("quantity", e.target.value);
                   // Auto-calculate total when quantity changes
                   if (formData.price) {
                     const newTotal = parseFloat(formData.price) * parseInt(e.target.value || "0");
                     handleChange("total", newTotal.toString());
                   }
                 }}
                 className="w-full p-1.5 text-sm border rounded"
                 min="1"
                 required
               />
             </div>

             <div>
               <label className="text-xs font-medium">Unit</label>
               <select
                 value={formData.unit}
                 onChange={(e) => handleChange("unit", e.target.value)}
                 className="w-full p-1.5 text-sm border rounded"
               >
                 <option value="">Select Unit</option>
                 <option value="pcs">pcs</option>
                 <option value="set">set</option>
                 <option value="pair">pair</option>
                 <option value="dozen">dozen</option>
                 <option value="box">box</option>
               </select>
             </div>

             <div className="flex items-center gap-2">
               <label className="text-xs font-medium">Is Set/Assembly:</label>
               <input
                 type="checkbox"
                 checked={formData.isSet}
                 onChange={(e) => handleChange("isSet", e.target.checked)}
                 className="h-4 w-4"
               />
             </div>

             <div>
               <label className="text-xs font-medium">Price</label>
               <input
                 type="number"
                 value={formData.price}
                 onChange={(e) => {
                   handleChange("price", e.target.value);
                   // Auto-calculate total when price changes
                   if (formData.quantity) {
                     const newTotal = parseFloat(e.target.value || "0") * parseInt(formData.quantity.toString());
                     handleChange("total", newTotal.toString());
                   }
                 }}
                 className="w-full p-1.5 text-sm border rounded"
                 step="0.01"
                 min="0"
               />
             </div>

             <div>
               <label className="text-xs font-medium">Total</label>
               <input
                 type="number"
                 value={formData.total}
                 onChange={(e) => handleChange("total", e.target.value)}
                 className="w-full p-1.5 text-sm border rounded bg-gray-50"
                 step="0.01"
                 min="0"
                 readOnly
               />
             </div>
           </div>

          <div>
            <label className="text-xs font-medium">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              className="w-full p-1.5 text-sm border rounded"
              rows={2}
            />
          </div>
        </TabsContent>

        <TabsContent value="photos" className="space-y-3 mt-3">
          <div>
            <label className="text-xs font-medium mb-1 block">Product Photos</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="hidden"
                id="photo-upload"
              />
              <label htmlFor="photo-upload" className="cursor-pointer">
                <Upload className="h-6 w-6 mx-auto text-gray-400 mb-1" />
                <p className="text-xs text-gray-600">
                  {uploadingPhoto ? "Uploading..." : "Click to upload photos"}
                </p>
                <p className="text-xs text-gray-400">PNG, JPG, GIF up to 10MB</p>
              </label>
            </div>
          </div>

          {formData.photos.length > 0 && (
            <div>
              <label className="text-xs font-medium mb-1 block">Uploaded Photos ({formData.photos.length})</label>
              <div className="grid grid-cols-4 gap-2">
                {formData.photos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={photo}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-16 object-cover rounded border"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="technical" className="space-y-3 mt-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-medium">Clay</label>
              <div className="space-y-1">
                <div className="flex gap-1">
                  <Select
                    value=""
                    onValueChange={(value) => {
                      if (value && !formData.clayIds.includes(value)) {
                        handleChange("clayIds", [...formData.clayIds, value]);
                      }
                    }}
                  >
                    <SelectTrigger className="flex-1 h-8 text-xs">
                      <SelectValue placeholder="Select clay" />
                    </SelectTrigger>
                    <SelectContent>
                      {materials.clays
                        .filter((clay: any) => !formData.clayIds.includes(clay.id.toString()))
                        .map((clay: any) => (
                          <SelectItem key={clay.id} value={clay.id.toString()} className="text-xs">
                            {clay.clayCode} - {clay.clayDescription}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setShowAddMaterial(prev => ({ ...prev, clay: !prev.clay }))}
                  >
                    +
                  </Button>
                </div>
                {formData.clayIds.length > 0 && (
                  <div className="flex flex-wrap gap-0.5">
                    {formData.clayIds.map((id) => {
                      const clay = materials.clays.find((c: any) => c.id.toString() === id);
                      return (
                        <Badge key={id} variant="secondary" className="text-xs py-0 px-1">
                          {clay ? `${clay.clayCode}` : id}
                          <button
                            type="button"
                            onClick={() => handleChange("clayIds", formData.clayIds.filter(cid => cid !== id))}
                            className="ml-0.5 text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        </Badge>
                      );
                    })}
                  </div>
                )}
                {showAddMaterial.clay && (
                  <div className="p-1.5 border rounded bg-gray-50 space-y-1">
                    <input
                      type="text"
                      placeholder="Code"
                      value={newMaterial.clay.code}
                      onChange={(e) => setNewMaterial(prev => ({
                        ...prev,
                        clay: { ...prev.clay, code: e.target.value }
                      }))}
                      className="w-full p-1 text-xs border rounded"
                    />
                    <input
                      type="text"
                      placeholder="Description"
                      value={newMaterial.clay.description}
                      onChange={(e) => setNewMaterial(prev => ({
                        ...prev,
                        clay: { ...prev.clay, description: e.target.value }
                      }))}
                      className="w-full p-1 text-xs border rounded"
                    />
                    <Button
                      type="button"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={async () => {
                        try {
                          const response = await fetch("/api/rnd/materials/clay", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              clayCode: newMaterial.clay.code,
                              clayDescription: newMaterial.clay.description,
                              clayNotes: newMaterial.clay.notes,
                            }),
                          });
                          if (response.ok) {
                            const newClayData = await response.json();
                            await fetchMaterials();
                            if (newClayData.clay && !formData.clayIds.includes(newClayData.clay.id.toString())) {
                              handleChange("clayIds", [...formData.clayIds, newClayData.clay.id.toString()]);
                            }
                            setNewMaterial(prev => ({ ...prev, clay: { code: "", description: "", notes: "" } }));
                            setShowAddMaterial(prev => ({ ...prev, clay: false }));
                          }
                        } catch (error) {
                          console.error("Error adding clay:", error);
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium">KG (Weight)</label>
              <input
                type="number"
                value={formData.weight}
                onChange={(e) => handleChange("weight", e.target.value)}
                className="w-full p-1.5 text-sm border rounded"
                step="0.01"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-medium">Is Decor:</label>
              <input
                type="checkbox"
                checked={formData.isDecor}
                onChange={(e) => handleChange("isDecor", e.target.checked)}
                className="h-4 w-4"
              />
            </div>

            <div>
              <label className="text-xs font-medium">Engobe</label>
              <div className="space-y-1">
                <div className="flex gap-1">
                  <Select
                    value=""
                    onValueChange={(value) => {
                      if (value && !formData.engobeIds.includes(value)) {
                        handleChange("engobeIds", [...formData.engobeIds, value]);
                      }
                    }}
                  >
                    <SelectTrigger className="flex-1 h-8 text-xs">
                      <SelectValue placeholder="Select engobe" />
                    </SelectTrigger>
                    <SelectContent>
                      {materials.engobes
                        .filter((engobe: any) => !formData.engobeIds.includes(engobe.id.toString()))
                        .map((engobe: any) => (
                          <SelectItem key={engobe.id} value={engobe.id.toString()} className="text-xs">
                            {engobe.engobeCode} - {engobe.engobeDescription}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setShowAddMaterial(prev => ({ ...prev, engobe: !prev.engobe }))}
                  >
                    +
                  </Button>
                </div>
                {formData.engobeIds.length > 0 && (
                  <div className="flex flex-wrap gap-0.5">
                    {formData.engobeIds.map((id) => {
                      const engobe = materials.engobes.find((e: any) => e.id.toString() === id);
                      return (
                        <Badge key={id} variant="secondary" className="text-xs py-0 px-1">
                          {engobe ? `${engobe.engobeCode}` : id}
                          <button
                            type="button"
                            onClick={() => handleChange("engobeIds", formData.engobeIds.filter(eid => eid !== id))}
                            className="ml-0.5 text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        </Badge>
                      );
                    })}
                  </div>
                )}
                {showAddMaterial.engobe && (
                  <div className="p-1.5 border rounded bg-gray-50 space-y-1">
                    <input
                      type="text"
                      placeholder="Code"
                      value={newMaterial.engobe.code}
                      onChange={(e) => setNewMaterial(prev => ({
                        ...prev,
                        engobe: { ...prev.engobe, code: e.target.value }
                      }))}
                      className="w-full p-1 text-xs border rounded"
                    />
                    <input
                      type="text"
                      placeholder="Description"
                      value={newMaterial.engobe.description}
                      onChange={(e) => setNewMaterial(prev => ({
                        ...prev,
                        engobe: { ...prev.engobe, description: e.target.value }
                      }))}
                      className="w-full p-1 text-xs border rounded"
                    />
                    <Button
                      type="button"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={async () => {
                        try {
                          const response = await fetch("/api/rnd/materials/engobe", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              engobeCode: newMaterial.engobe.code,
                              engobeDescription: newMaterial.engobe.description,
                              engobeNotes: newMaterial.engobe.notes,
                            }),
                          });
                          if (response.ok) {
                            await fetchMaterials();
                            setNewMaterial(prev => ({ ...prev, engobe: { code: "", description: "", notes: "" } }));
                            setShowAddMaterial(prev => ({ ...prev, engobe: false }));
                          }
                        } catch (error) {
                          console.error("Error adding engobe:", error);
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium">Glaze</label>
              <div className="space-y-1">
                <div className="flex gap-1">
                  <Select
                    value=""
                    onValueChange={(value) => {
                      if (value && !formData.glazeIds.includes(value)) {
                        handleChange("glazeIds", [...formData.glazeIds, value]);
                      }
                    }}
                  >
                    <SelectTrigger className="flex-1 h-8 text-xs">
                      <SelectValue placeholder="Select glaze" />
                    </SelectTrigger>
                    <SelectContent>
                      {materials.glazes
                        .filter((glaze: any) => !formData.glazeIds.includes(glaze.id.toString()))
                        .map((glaze: any) => (
                          <SelectItem key={glaze.id} value={glaze.id.toString()} className="text-xs">
                            {glaze.glazeCode} - {glaze.glazeDescription}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setShowAddMaterial(prev => ({ ...prev, glaze: !prev.glaze }))}
                  >
                    +
                  </Button>
                </div>
                {formData.glazeIds.length > 0 && (
                  <div className="flex flex-wrap gap-0.5">
                    {formData.glazeIds.map((id) => {
                      const glaze = materials.glazes.find((g: any) => g.id.toString() === id);
                      return (
                        <Badge key={id} variant="secondary" className="text-xs py-0 px-1">
                          {glaze ? `${glaze.glazeCode}` : id}
                          <button
                            type="button"
                            onClick={() => handleChange("glazeIds", formData.glazeIds.filter(gid => gid !== id))}
                            className="ml-0.5 text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        </Badge>
                      );
                    })}
                  </div>
                )}
                {showAddMaterial.glaze && (
                  <div className="p-1.5 border rounded bg-gray-50 space-y-1">
                    <input
                      type="text"
                      placeholder="Code"
                      value={newMaterial.glaze.code}
                      onChange={(e) => setNewMaterial(prev => ({
                        ...prev,
                        glaze: { ...prev.glaze, code: e.target.value }
                      }))}
                      className="w-full p-1 text-xs border rounded"
                    />
                    <input
                      type="text"
                      placeholder="Description"
                      value={newMaterial.glaze.description}
                      onChange={(e) => setNewMaterial(prev => ({
                        ...prev,
                        glaze: { ...prev.glaze, description: e.target.value }
                      }))}
                      className="w-full p-1 text-xs border rounded"
                    />
                    <Button
                      type="button"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={async () => {
                        try {
                          const response = await fetch("/api/rnd/materials/glaze", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              glazeCode: newMaterial.glaze.code,
                              glazeDescription: newMaterial.glaze.description,
                              glazeNotes: newMaterial.glaze.notes,
                            }),
                          });
                          if (response.ok) {
                            await fetchMaterials();
                            setNewMaterial(prev => ({ ...prev, glaze: { code: "", description: "", notes: "" } }));
                            setShowAddMaterial(prev => ({ ...prev, glaze: false }));
                          }
                        } catch (error) {
                          console.error("Error adding glaze:", error);
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium">Stain Oxide</label>
              <Select
                value={formData.stainOxideId}
                onValueChange={(value) => handleChange("stainOxideId", value)}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select stain oxide" />
                </SelectTrigger>
                <SelectContent>
                  {materials.stainOxides.map((stainOxide: any) => (
                    <SelectItem key={stainOxide.id} value={stainOxide.id.toString()} className="text-xs">
                      {stainOxide.stainOxideCode} - {stainOxide.stainOxideDescription}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium">Firing</label>
              <input
                type="text"
                value={formData.firingType}
                onChange={(e) => handleChange("firingType", e.target.value)}
                className="w-full p-1.5 text-sm border rounded"
              />
            </div>

            <div>
              <label className="text-xs font-medium">Luster</label>
              <div className="space-y-1">
                <div className="flex gap-1">
                  <Select
                    value=""
                    onValueChange={(value) => {
                      if (value && !formData.lusterIds.includes(value)) {
                        handleChange("lusterIds", [...formData.lusterIds, value]);
                      }
                    }}
                  >
                    <SelectTrigger className="flex-1 h-8 text-xs">
                      <SelectValue placeholder="Select luster" />
                    </SelectTrigger>
                    <SelectContent>
                      {materials.lusters
                        .filter((luster: any) => !formData.lusterIds.includes(luster.id.toString()))
                        .map((luster: any) => (
                          <SelectItem key={luster.id} value={luster.id.toString()} className="text-xs">
                            {luster.lustreCode} - {luster.lustreDescription}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setShowAddMaterial(prev => ({ ...prev, luster: !prev.luster }))}
                  >
                    +
                  </Button>
                </div>
                {formData.lusterIds.length > 0 && (
                  <div className="flex flex-wrap gap-0.5">
                    {formData.lusterIds.map((id) => {
                      const luster = materials.lusters.find((l: any) => l.id.toString() === id);
                      return (
                        <Badge key={id} variant="secondary" className="text-xs py-0 px-1">
                          {luster ? `${luster.lustreCode}` : id}
                          <button
                            type="button"
                            onClick={() => handleChange("lusterIds", formData.lusterIds.filter(lid => lid !== id))}
                            className="ml-0.5 text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        </Badge>
                      );
                    })}
                  </div>
                )}
                {showAddMaterial.luster && (
                  <div className="p-1.5 border rounded bg-gray-50 space-y-1">
                    <input
                      type="text"
                      placeholder="Code"
                      value={newMaterial.luster.code}
                      onChange={(e) => setNewMaterial(prev => ({
                        ...prev,
                        luster: { ...prev.luster, code: e.target.value }
                      }))}
                      className="w-full p-1 text-xs border rounded"
                    />
                    <input
                      type="text"
                      placeholder="Description"
                      value={newMaterial.luster.description}
                      onChange={(e) => setNewMaterial(prev => ({
                        ...prev,
                        luster: { ...prev.luster, description: e.target.value }
                      }))}
                      className="w-full p-1 text-xs border rounded"
                    />
                    <Button
                      type="button"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={async () => {
                        try {
                          const response = await fetch("/api/rnd/materials/luster", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              lustreCode: newMaterial.luster.code,
                              lustreDescription: newMaterial.luster.description,
                              lustreNotes: newMaterial.luster.notes,
                            }),
                          });
                          if (response.ok) {
                            await fetchMaterials();
                            setNewMaterial(prev => ({ ...prev, luster: { code: "", description: "", notes: "" } }));
                            setShowAddMaterial(prev => ({ ...prev, luster: false }));
                          }
                        } catch (error) {
                          console.error("Error adding luster:", error);
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium">Technical Notes</label>
            <textarea
              value={formData.technotes}
              onChange={(e) => handleChange("technotes", e.target.value)}
              className="w-full p-1.5 text-sm border rounded"
              rows={2}
            />
          </div>

          {/* Set Components Section */}
          {formData.isSet && (
            <div>
              <label className="text-xs font-medium mb-2 block">Set Components</label>
              <div className="border rounded p-3 bg-gray-50 space-y-3">
                <p className="text-xs text-gray-600">
                  Define the components that make up this assembly/set. For external components, you can upload photos using the "Photo" button.
                </p>

                {/* Add Component Form */}
                <div className="border rounded p-2 bg-white">
                  <div className="text-xs font-medium mb-2">Add Component</div>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex gap-2">
                      <select
                        value=""
                        onChange={(e) => {
                          if (e.target.value) {
                            const selectedItem = availableDirectoryItems.find(d => d.id.toString() === e.target.value);
                            if (selectedItem) {
                              // Add directory item component
                              const newComponent = {
                                componentId: selectedItem.id,
                                componentName: selectedItem.itemName,
                                quantity: 1,
                                notes: ""
                              };
                              handleChange("components", [...formData.components, newComponent]);
                            }
                          }
                        }}
                        className="flex-1 p-1.5 text-xs border rounded"
                      >
                        <option value="">Select Directory Item</option>
                        {availableDirectoryItems
                          .filter(item => !editingItem || item.id !== editingItem.id) // Don't allow self-reference
                          .map(item => (
                          <option key={item.id} value={item.id.toString()}>
                            {item.collectCode ? `${item.collectCode} - ` : ""}{item.itemName}
                          </option>
                        ))}
                      </select>
                      <div className="flex-1 flex gap-2">
                        <input
                          type="text"
                          placeholder="External component name"
                          className="flex-1 p-1.5 text-xs border rounded"
                          onKeyDown={async (e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const input = e.target as HTMLInputElement;
                              if (input.value.trim()) {
                                // Check if user uploaded photos for this component
                                let componentPhotos: string[] = [];
                                if (componentFileInputRef.current?.files?.length) {
                                  try {
                                    componentPhotos = await handleComponentPhotoUpload({
                                      target: componentFileInputRef.current
                                    } as any) || [];
                                  } catch (error) {
                                    console.error("Failed to upload component photos:", error);
                                  }
                                }

                                const newComponent = {
                                  componentName: input.value.trim(),
                                  quantity: 1,
                                  description: "",
                                  photos: componentPhotos
                                };
                                handleChange("components", [...formData.components, newComponent]);
                                input.value = "";
                                // Reset file input
                                if (componentFileInputRef.current) {
                                  componentFileInputRef.current.value = "";
                                }
                              }
                            }
                          }}
                        />
                        <div className="relative">
                          <input
                            ref={componentFileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            id="component-photo-upload"
                          />
                          <label
                            htmlFor="component-photo-upload"
                            className="inline-flex items-center px-2 py-1 text-xs border rounded cursor-pointer hover:bg-gray-50"
                          >
                            <Upload className="h-3 w-3 mr-1" />
                            Photo
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Components List */}
                {formData.components.length > 0 && (
                  <div className="border rounded p-2 bg-white">
                    <div className="text-xs font-medium mb-2">Selected Components</div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {formData.components.map((component: any, index: number) => (
                        <div key={index} className="flex items-start gap-2 p-2 bg-gray-50 rounded text-xs">
                          {/* Photo thumbnail for external components */}
                          {component.photos && component.photos.length > 0 && !component.componentId && (
                            <div className="flex-shrink-0">
                              <img
                                src={component.photos[0]}
                                alt={component.componentName}
                                className="w-8 h-8 object-cover rounded border"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">
                              {component.componentId ? (
                                <>{component.componentName || `Directory Item ${component.componentId}`}</>
                              ) : (
                                <>{component.componentName || component.description}</>
                              )}
                            </div>
                            {component.description && !component.componentId && (
                              <div className="text-gray-500 text-xs truncate">{component.description}</div>
                            )}
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <span className="text-gray-500">Qty:</span>
                            <input
                              type="number"
                              value={component.quantity}
                              onChange={(e) => {
                                const newComponents = [...formData.components];
                                newComponents[index].quantity = parseInt(e.target.value) || 1;
                                handleChange("components", newComponents);
                              }}
                              className="w-12 p-0.5 text-xs border rounded text-center"
                              min="1"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700 flex-shrink-0"
                            onClick={() => {
                              const newComponents = formData.components.filter((_, i) => i !== index);
                              handleChange("components", newComponents);
                            }}
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {formData.components.length === 0 && (
                  <div className="text-xs text-gray-500 text-center py-4">
                    No components added yet. Use the form above to add components.
                  </div>
                )}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={submitting}>
          {submitting ? "Saving..." : (editingItem ? "Update" : "Create")}
        </Button>
      </div>
    </form>
  );
}
