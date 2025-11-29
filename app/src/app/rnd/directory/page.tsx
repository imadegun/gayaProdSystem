"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, FileText, Edit, Trash2, Image, Eye, Upload, X } from "lucide-react";

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
                  <TableHead className="py-2 px-2">Category</TableHead>
                  <TableHead className="py-2 px-2">Info Size</TableHead>
                  <TableHead className="py-2 px-2">Material</TableHead>
                  <TableHead className="w-[100px] py-2 px-2">Color</TableHead>
                  <TableHead className="py-2 px-2">Texture</TableHead>
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
                    <TableCell className="font-medium py-1 px-2">{item.itemName}</TableCell>
                    <TableCell className="font-medium py-1 px-2">{item.sizeInfo}</TableCell>
                    <TableCell className="font-medium py-1 px-2">{item.materialName}</TableCell>
                    <TableCell className="font-medium py-1 px-2">{item.colorName}</TableCell>
                    {/* <TableCell className="py-1 px-2">
                      {item.colorName ? (
                        <Badge variant="outline" className="text-xs py-0 px-1">{item.colorName}</Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">-</span>
                      )}
                    </TableCell> */}
                    <TableCell className="font-medium py-1 px-2">{item.textureName}</TableCell>
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
                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground text-sm">
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
              {editingItem ? "Edit Directory Item" : "Add Directory Item"}
            </DialogTitle>
            <DialogDescription className="text-sm">
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

  // Fetch materials when modal opens
  useEffect(() => {
    if (open && selectedItem) {
      fetchMaterialsForDetail();
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
              {/* <div className="bg-gray-50 rounded p-2">
                <div className="text-muted-foreground text-xs uppercase mb-1">Is Set</div>
                <div className="font-medium text-sm">{selectedItem.isSet ? "Yes" : "No"}</div>
              </div> */}
            </div>

            {/* Notes */}
            {selectedItem.notes && (
              <div className="bg-gray-50 rounded p-2">
                <div className="text-muted-foreground text-xs uppercase mb-1">Notes</div>
                <p className="text-sm">{selectedItem.notes}</p>
              </div>
            )}

            {/* Set Components */}
            {selectedItem.isSet && selectedItem.components && (
              <div className="bg-gray-50 rounded p-2">
                <div className="text-muted-foreground text-xs uppercase mb-1">Set Components</div>
                <pre className="text-xs bg-white p-2 rounded border overflow-x-auto">{JSON.stringify(selectedItem.components, null, 2)}</pre>
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
    photos: editingItem?.photos || [],
  });

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
                     const code = await generateCollectCode();
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
                 onChange={(e) => handleChange("quantity", e.target.value)}
                 className="w-full p-1.5 text-sm border rounded"
                 min="1"
                 required
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