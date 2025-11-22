"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, FileText, Edit, Trash2, Image, Eye } from "lucide-react";

interface DirectoryList {
  id: number;
  projectId: number;
  itemName: string;
  collectCode?: string;
  quantity: number;
  status: string;
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
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<DirectoryList | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DirectoryList | null>(null);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading Directory Lists...</div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Directory Lists</h1>
          <p className="text-muted-foreground">
            Manage your product directory items and specifications
          </p>
        </div>
        <Button onClick={() => {
          setEditingItem(null);
          setFormModalOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Directory Item
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[100px]">Photo</TableHead>
                  <TableHead className="min-w-[120px]">Code</TableHead>
                  <TableHead className="min-w-[200px]">Category</TableHead>
                  <TableHead className="min-w-[120px]">Size Info</TableHead>
                  <TableHead className="min-w-[100px]">Materials</TableHead>
                  <TableHead className="min-w-[100px]">Color</TableHead>
                  <TableHead className="min-w-[100px]">Texture</TableHead>
                  <TableHead className="min-w-[120px]">Final Size</TableHead>
                  <TableHead className="min-w-[80px]">Qty</TableHead>
                  <TableHead className="min-w-[150px]">Notes</TableHead>
                  <TableHead className="min-w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {directoryLists.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      {item.photos && item.photos.length > 0 ? (
                        <div className="flex gap-1">
                          {item.photos.slice(0, 1).map((photo: string, index: number) => (
                            <img
                              key={index}
                              src={photo}
                              alt={`Photo ${index + 1}`}
                              className="w-12 h-12 object-cover rounded border"
                            />
                          ))}
                          {item.photos.length > 1 && (
                            <span className="text-xs text-muted-foreground">+{item.photos.length - 1}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>{item.collectCode || "-"}</TableCell>
                    <TableCell className="font-medium">{item.itemName}</TableCell>
                    <TableCell>{item.sizeInfo || "-"}</TableCell>
                    <TableCell>{item.materialName || "-"}</TableCell>
                    <TableCell>{item.colorName || "-"}</TableCell>
                    <TableCell>{item.textureName || "-"}</TableCell>
                    <TableCell>{item.dimensions ? JSON.stringify(item.dimensions) : "-"}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{item.notes || "-"}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedItem(item);
                            setDetailModalOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingItem(item);
                            setFormModalOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {directoryLists.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                      No directory items created yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Technical Sheet Detail Modal */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Technical Sheet - {selectedItem?.itemName}</DialogTitle>
            <DialogDescription>
              Complete technical specifications and properties
            </DialogDescription>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Basic Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Item Name:</strong> {selectedItem.itemName}</div>
                    <div><strong>Collect Code:</strong> {selectedItem.collectCode || "N/A"}</div>
                    <div><strong>Quantity:</strong> {selectedItem.quantity}</div>
                    <div><strong>Status:</strong> <Badge variant={selectedItem.status === "approved" ? "default" : "secondary"}>{selectedItem.status}</Badge></div>
                    <div><strong>Is Decorative:</strong> {selectedItem.isDecor ? "Yes" : "No"}</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Project Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Project:</strong> {selectedItem.project.projectName}</div>
                    <div><strong>Client:</strong> {selectedItem.project.client.clientDescription}</div>
                    <div><strong>Client Code:</strong> {selectedItem.project.client.clientCode}</div>
                  </div>
                </div>
              </div>

              {/* Enhanced Properties */}
              <div>
                <h4 className="font-semibold mb-2">Enhanced Properties</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div><strong>Texture:</strong> {selectedItem.textureName || "N/A"}</div>
                  <div><strong>Color:</strong> {selectedItem.colorName || "N/A"}</div>
                  <div><strong>Material:</strong> {selectedItem.materialName || "N/A"}</div>
                  <div><strong>Size:</strong> {selectedItem.sizeInfo || "N/A"}</div>
                </div>
              </div>

              {/* Technical Specifications */}
              <div>
                <h4 className="font-semibold mb-2">Technical Specifications</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div><strong>Clay:</strong> {selectedItem.clayIds && selectedItem.clayIds.length > 0 ? `${selectedItem.clayIds.length} selected` : "N/A"}</div>
                  <div><strong>KG:</strong> {selectedItem.weight ? `${selectedItem.weight}g` : "N/A"}</div>
                  <div><strong>Is Decor:</strong> {selectedItem.isDecor ? "Yes" : "No"}</div>
                  <div><strong>Engobe:</strong> {selectedItem.engobeIds && selectedItem.engobeIds.length > 0 ? `${selectedItem.engobeIds.length} selected` : "N/A"}</div>
                  <div><strong>Glaze:</strong> {selectedItem.glazeIds && selectedItem.glazeIds.length > 0 ? `${selectedItem.glazeIds.length} selected` : "N/A"}</div>
                  <div><strong>Stain Oxide:</strong> {selectedItem.stainOxide ? `${selectedItem.stainOxide.stainOxideCode} - ${selectedItem.stainOxide.stainOxideDescription}` : "N/A"}</div>
                  <div><strong>Firing:</strong> {selectedItem.firingType || "N/A"}</div>
                  <div><strong>Luster:</strong> {selectedItem.lusterIds && selectedItem.lusterIds.length > 0 ? `${selectedItem.lusterIds.length} selected` : "N/A"}</div>
                  <div className="col-span-2 md:col-span-3"><strong>Technical Notes:</strong> {selectedItem.technotes || "N/A"}</div>
                </div>
              </div>

              {/* Photos */}
              {selectedItem.photos && selectedItem.photos.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Photos</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {selectedItem.photos.map((photo: string, index: number) => (
                      <img
                        key={index}
                        src={photo}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-32 object-cover rounded border"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Information */}
              <div>
                <h4 className="font-semibold mb-2">Additional Information</h4>
                <div className="text-sm">
                  <div><strong>Notes:</strong> {selectedItem.notes || "N/A"}</div>
                  {selectedItem.isSet && (
                    <div><strong>Set/Breakdown:</strong> Yes - {selectedItem.components ? JSON.stringify(selectedItem.components) : "Components not specified"}</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create/Edit Form Modal */}
      <Dialog open={formModalOpen} onOpenChange={setFormModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Directory Item" : "Add Directory Item"}
            </DialogTitle>
            <DialogDescription>
              {editingItem ? "Update the directory item details" : "Create a new directory item"}
            </DialogDescription>
          </DialogHeader>

          <DirectoryForm
            projects={projects}
            editingItem={editingItem}
            onSubmit={editingItem ? (data) => handleUpdate(editingItem.id, data) : handleCreate}
            onCancel={() => setFormModalOpen(false)}
            submitting={submitting}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Directory Form Component
function DirectoryForm({
  projects,
  editingItem,
  onSubmit,
  onCancel,
  submitting
}: {
  projects: Project[];
  editingItem: DirectoryList | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  submitting: boolean;
}) {
  const [formData, setFormData] = useState({
    projectId: editingItem?.projectId?.toString() || "",
    itemName: editingItem?.itemName || "",
    collectCode: editingItem?.collectCode || "",
    quantity: editingItem?.quantity || 1,
    textureName: editingItem?.textureName || "",
    colorName: editingItem?.colorName || "",
    materialName: editingItem?.materialName || "",
    sizeInfo: editingItem?.sizeInfo || "",
    clayIds: (editingItem?.clayIds || []).map(id => id.toString()),
    glazeIds: (editingItem?.glazeIds || []).map(id => id.toString()),
    engobeIds: (editingItem?.engobeIds || []).map(id => id.toString()),
    firingType: editingItem?.firingType || "",
    lusterIds: (editingItem?.lusterIds || []).map(id => id.toString()),
    stainOxideId: editingItem?.stainOxideId?.toString() || "",
    weight: editingItem?.weight?.toString() || "",
    technotes: editingItem?.technotes || "",
    isDecor: editingItem?.isDecor || false,
    notes: editingItem?.notes || "",
  });

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

  const generateCollectCode = async () => {
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

      // Find the highest existing code
      let highestCode = "";
      let highestFirst = -1;
      let highestSecond = -1;
      let highestNum = 0;

      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

      for (const code of existingCodes) {
        if (code && code.includes('-')) {
          const [letterPart, numPart] = code.split('-');
          if (letterPart.length === 2 && numPart.length === 3) {
            const first = letters.indexOf(letterPart[0]);
            const second = letters.indexOf(letterPart[1]);
            const num = parseInt(numPart);

            if (first >= 0 && second >= 0 && num >= 1 && num <= 999) {
              // Compare codes: first by letters, then by number
              const currentValue = (first * 26 * 1000) + (second * 1000) + num;
              const highestValue = (highestFirst * 26 * 1000) + (highestSecond * 1000) + highestNum;

              if (currentValue > highestValue) {
                highestCode = code;
                highestFirst = first;
                highestSecond = second;
                highestNum = num;
              }
            }
          }
        }
      }

      // If no valid codes exist, start from AA-001
      if (highestFirst === -1) {
        return "AA-001";
      }

      // Generate the next code after the highest one
      let nextFirst = highestFirst;
      let nextSecond = highestSecond;
      let nextNum = highestNum + 1;

      // Handle number overflow
      if (nextNum > 999) {
        nextNum = 1;
        nextSecond++;

        // Handle second letter overflow
        if (nextSecond > 25) {
          nextSecond = 0;
          nextFirst++;

          // Handle first letter overflow (wrap around or stop)
          if (nextFirst > 25) {
            // All combinations exhausted - this is extremely unlikely
            return "";
          }
        }
      }

      const nextCode = `${letters[nextFirst]}${letters[nextSecond]}-${String(nextNum).padStart(3, '0')}`;
      return nextCode;

    } catch (error) {
      console.error("Error generating code:", error);
      return "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      projectId: parseInt(formData.projectId),
      quantity: parseInt(formData.quantity.toString()),
      clayIds: formData.clayIds.map(id => parseInt(id)),
      glazeIds: formData.glazeIds.map(id => parseInt(id)),
      engobeIds: formData.engobeIds.map(id => parseInt(id)),
      lusterIds: formData.lusterIds.map(id => parseInt(id)),
      stainOxideId: formData.stainOxideId ? parseInt(formData.stainOxideId) : undefined,
      weight: formData.weight ? parseFloat(formData.weight.toString()) : undefined,
    });
  };

  const handleChange = (field: string, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="technical">Technical</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
               <label className="text-sm font-medium">Project</label>
               <select
                 value={formData.projectId}
                 onChange={(e) => handleChange("projectId", e.target.value)}
                 className="w-full p-2 border rounded"
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
               <label className="text-sm font-medium">Category (Item Name)</label>
               <input
                 type="text"
                 value={formData.itemName}
                 onChange={(e) => handleChange("itemName", e.target.value)}
                 className="w-full p-2 border rounded"
                 required
               />
             </div>

             <div className="md:col-span-2">
               <label className="text-sm font-medium">Code</label>
               <div className="flex gap-2">
                 <input
                   type="text"
                   value={formData.collectCode}
                   onChange={(e) => handleChange("collectCode", e.target.value)}
                   className="flex-1 p-2 border rounded"
                   placeholder="Auto-generated or manual entry"
                 />
                 <Button
                   type="button"
                   variant="outline"
                   size="sm"
                   className="whitespace-nowrap"
                   onClick={async () => {
                     const code = await generateCollectCode();
                     if (code) {
                       handleChange("collectCode", code);
                     }
                   }}
                 >
                   Generate
                 </Button>
               </div>
             </div>

             <div>
               <label className="text-sm font-medium">Size Info</label>
               <input
                 type="text"
                 value={formData.sizeInfo}
                 onChange={(e) => handleChange("sizeInfo", e.target.value)}
                 className="w-full p-2 border rounded"
               />
             </div>

             <div>
               <label className="text-sm font-medium">Materials</label>
               <input
                 type="text"
                 value={formData.materialName}
                 onChange={(e) => handleChange("materialName", e.target.value)}
                 className="w-full p-2 border rounded"
               />
             </div>

             <div>
               <label className="text-sm font-medium">Color</label>
               <input
                 type="text"
                 value={formData.colorName}
                 onChange={(e) => handleChange("colorName", e.target.value)}
                 className="w-full p-2 border rounded"
               />
             </div>

             <div>
               <label className="text-sm font-medium">Texture</label>
               <input
                 type="text"
                 value={formData.textureName}
                 onChange={(e) => handleChange("textureName", e.target.value)}
                 className="w-full p-2 border rounded"
               />
             </div>

             <div>
               <label className="text-sm font-medium">Qty</label>
               <input
                 type="number"
                 value={formData.quantity}
                 onChange={(e) => handleChange("quantity", e.target.value)}
                 className="w-full p-2 border rounded"
                 min="1"
                 required
               />
             </div>
           </div>

          <div>
            <label className="text-sm font-medium">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              className="w-full p-2 border rounded"
              rows={3}
            />
          </div>
        </TabsContent>

        <TabsContent value="technical" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Clay</label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Select
                    value=""
                    onValueChange={(value) => {
                      if (value && !formData.clayIds.includes(value)) {
                        handleChange("clayIds", [...formData.clayIds, value]);
                      }
                    }}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select clay material" />
                    </SelectTrigger>
                    <SelectContent>
                      {materials.clays
                        .filter((clay: any) => !formData.clayIds.includes(clay.id.toString()))
                        .map((clay: any) => (
                          <SelectItem key={clay.id} value={clay.id.toString()}>
                            {clay.clayCode} - {clay.clayDescription}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddMaterial(prev => ({ ...prev, clay: !prev.clay }))}
                  >
                    +
                  </Button>
                </div>
                {formData.clayIds.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {formData.clayIds.map((id) => {
                      const clay = materials.clays.find((c: any) => c.id.toString() === id);
                      return (
                        <Badge key={id} variant="secondary" className="text-xs">
                          {clay ? `${clay.clayCode} - ${clay.clayDescription}` : id}
                          <button
                            type="button"
                            onClick={() => handleChange("clayIds", formData.clayIds.filter(cid => cid !== id))}
                            className="ml-1 text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        </Badge>
                      );
                    })}
                  </div>
                )}
                {showAddMaterial.clay && (
                  <div className="mt-2 p-2 border rounded bg-gray-50">
                    <input
                      type="text"
                      placeholder="Code"
                      value={newMaterial.clay.code}
                      onChange={(e) => setNewMaterial(prev => ({
                        ...prev,
                        clay: { ...prev.clay, code: e.target.value }
                      }))}
                      className="w-full p-1 mb-1 border rounded text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Description"
                      value={newMaterial.clay.description}
                      onChange={(e) => setNewMaterial(prev => ({
                        ...prev,
                        clay: { ...prev.clay, description: e.target.value }
                      }))}
                      className="w-full p-1 mb-1 border rounded text-sm"
                    />
                    <Button
                      type="button"
                      size="sm"
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
                            // Auto-select the newly created material
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
                      Add Clay
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">KG (Weight)</label>
              <input
                type="number"
                value={formData.weight}
                onChange={(e) => handleChange("weight", e.target.value)}
                className="w-full p-2 border rounded"
                step="0.01"
              />
            </div>

            <div className="flex items-center">
              <label className="text-sm font-medium mr-2">Is Decor:</label>
              <input
                type="checkbox"
                checked={formData.isDecor}
                onChange={(e) => handleChange("isDecor", e.target.checked)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Engobe</label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Select
                    value=""
                    onValueChange={(value) => {
                      if (value && !formData.engobeIds.includes(value)) {
                        handleChange("engobeIds", [...formData.engobeIds, value]);
                      }
                    }}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select engobe material" />
                    </SelectTrigger>
                    <SelectContent>
                      {materials.engobes
                        .filter((engobe: any) => !formData.engobeIds.includes(engobe.id.toString()))
                        .map((engobe: any) => (
                          <SelectItem key={engobe.id} value={engobe.id.toString()}>
                            {engobe.engobeCode} - {engobe.engobeDescription}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddMaterial(prev => ({ ...prev, engobe: !prev.engobe }))}
                  >
                    +
                  </Button>
                </div>
                {formData.engobeIds.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {formData.engobeIds.map((id) => {
                      const engobe = materials.engobes.find((e: any) => e.id.toString() === id);
                      return (
                        <Badge key={id} variant="secondary" className="text-xs">
                          {engobe ? `${engobe.engobeCode} - ${engobe.engobeDescription}` : id}
                          <button
                            type="button"
                            onClick={() => handleChange("engobeIds", formData.engobeIds.filter(eid => eid !== id))}
                            className="ml-1 text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        </Badge>
                      );
                    })}
                  </div>
                )}
                {showAddMaterial.engobe && (
                  <div className="mt-2 p-2 border rounded bg-gray-50">
                    <input
                      type="text"
                      placeholder="Code"
                      value={newMaterial.engobe.code}
                      onChange={(e) => setNewMaterial(prev => ({
                        ...prev,
                        engobe: { ...prev.engobe, code: e.target.value }
                      }))}
                      className="w-full p-1 mb-1 border rounded text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Description"
                      value={newMaterial.engobe.description}
                      onChange={(e) => setNewMaterial(prev => ({
                        ...prev,
                        engobe: { ...prev.engobe, description: e.target.value }
                      }))}
                      className="w-full p-1 mb-1 border rounded text-sm"
                    />
                    <Button
                      type="button"
                      size="sm"
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
                      Add Engobe
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Glaze</label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Select
                    value=""
                    onValueChange={(value) => {
                      if (value && !formData.glazeIds.includes(value)) {
                        handleChange("glazeIds", [...formData.glazeIds, value]);
                      }
                    }}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select glaze material" />
                    </SelectTrigger>
                    <SelectContent>
                      {materials.glazes
                        .filter((glaze: any) => !formData.glazeIds.includes(glaze.id.toString()))
                        .map((glaze: any) => (
                          <SelectItem key={glaze.id} value={glaze.id.toString()}>
                            {glaze.glazeCode} - {glaze.glazeDescription}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddMaterial(prev => ({ ...prev, glaze: !prev.glaze }))}
                  >
                    +
                  </Button>
                </div>
                {formData.glazeIds.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {formData.glazeIds.map((id) => {
                      const glaze = materials.glazes.find((g: any) => g.id.toString() === id);
                      return (
                        <Badge key={id} variant="secondary" className="text-xs">
                          {glaze ? `${glaze.glazeCode} - ${glaze.glazeDescription}` : id}
                          <button
                            type="button"
                            onClick={() => handleChange("glazeIds", formData.glazeIds.filter(gid => gid !== id))}
                            className="ml-1 text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        </Badge>
                      );
                    })}
                  </div>
                )}
                {showAddMaterial.glaze && (
                  <div className="mt-2 p-2 border rounded bg-gray-50">
                    <input
                      type="text"
                      placeholder="Code"
                      value={newMaterial.glaze.code}
                      onChange={(e) => setNewMaterial(prev => ({
                        ...prev,
                        glaze: { ...prev.glaze, code: e.target.value }
                      }))}
                      className="w-full p-1 mb-1 border rounded text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Description"
                      value={newMaterial.glaze.description}
                      onChange={(e) => setNewMaterial(prev => ({
                        ...prev,
                        glaze: { ...prev.glaze, description: e.target.value }
                      }))}
                      className="w-full p-1 mb-1 border rounded text-sm"
                    />
                    <Button
                      type="button"
                      size="sm"
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
                      Add Glaze
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Stain Oxide</label>
              <Select
                value={formData.stainOxideId}
                onValueChange={(value) => handleChange("stainOxideId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select stain oxide" />
                </SelectTrigger>
                <SelectContent>
                  {materials.stainOxides.map((stainOxide: any) => (
                    <SelectItem key={stainOxide.id} value={stainOxide.id.toString()}>
                      {stainOxide.stainOxideCode} - {stainOxide.stainOxideDescription}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Firing</label>
              <input
                type="text"
                value={formData.firingType}
                onChange={(e) => handleChange("firingType", e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Luster</label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Select
                    value=""
                    onValueChange={(value) => {
                      if (value && !formData.lusterIds.includes(value)) {
                        handleChange("lusterIds", [...formData.lusterIds, value]);
                      }
                    }}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select luster material" />
                    </SelectTrigger>
                    <SelectContent>
                      {materials.lusters
                        .filter((luster: any) => !formData.lusterIds.includes(luster.id.toString()))
                        .map((luster: any) => (
                          <SelectItem key={luster.id} value={luster.id.toString()}>
                            {luster.lustreCode} - {luster.lustreDescription}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddMaterial(prev => ({ ...prev, luster: !prev.luster }))}
                  >
                    +
                  </Button>
                </div>
                {formData.lusterIds.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {formData.lusterIds.map((id) => {
                      const luster = materials.lusters.find((l: any) => l.id.toString() === id);
                      return (
                        <Badge key={id} variant="secondary" className="text-xs">
                          {luster ? `${luster.lustreCode} - ${luster.lustreDescription}` : id}
                          <button
                            type="button"
                            onClick={() => handleChange("lusterIds", formData.lusterIds.filter(lid => lid !== id))}
                            className="ml-1 text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        </Badge>
                      );
                    })}
                  </div>
                )}
                {showAddMaterial.luster && (
                  <div className="mt-2 p-2 border rounded bg-gray-50">
                    <input
                      type="text"
                      placeholder="Code"
                      value={newMaterial.luster.code}
                      onChange={(e) => setNewMaterial(prev => ({
                        ...prev,
                        luster: { ...prev.luster, code: e.target.value }
                      }))}
                      className="w-full p-1 mb-1 border rounded text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Description"
                      value={newMaterial.luster.description}
                      onChange={(e) => setNewMaterial(prev => ({
                        ...prev,
                        luster: { ...prev.luster, description: e.target.value }
                      }))}
                      className="w-full p-1 mb-1 border rounded text-sm"
                    />
                    <Button
                      type="button"
                      size="sm"
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
                      Add Luster
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Technical Notes</label>
            <textarea
              value={formData.technotes}
              onChange={(e) => handleChange("technotes", e.target.value)}
              className="w-full p-2 border rounded"
              rows={3}
            />
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : (editingItem ? "Update" : "Create")}
        </Button>
      </div>
    </form>
  );
}