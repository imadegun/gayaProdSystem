"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Save, Copy, Check, Star, Settings2 } from "lucide-react";

// Types
interface PricingSettings {
  id: number;
  name: string;
  description?: string;
  laborRatePerMinute: number;
  clayCostPerKg: number;
  glazeCostPerKg: number;
  engobeCostPerKg?: number;
  lusterCostPerKg?: number;
  bisqueFiringCostPerLoad: number;
  glazeFiringCostPerLoad: number;
  rakuFiringCostPerLoad?: number;
  lusterFiringCostPerLoad?: number;
  kilnCapacityPieces: number;
  overheadRate: number;
  profitMargin: number;
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
  isDefault: boolean;
}

interface ProductionTimeEntry {
  id?: number;
  productionMethod: string;
  shapeCategory: string;
  minWeightKg: number;
  maxWeightKg: number;
  formingMinutes: number;
  finishingStandard: number;
  finishingMedium: number;
  finishingComplex: number;
  glazingStandard: number;
  glazingMedium: number;
  glazingComplex: number;
  movementMinutes: number;
  packagingMinutes: number;
  firingStandardBisque: number;
  firingStandardGlaze: number;
  firingRakuBisque: number;
  firingRakuGlaze: number;
  firingLusterBisque: number;
  firingLusterGlaze: number;
  firingLusterLuster: number;
  isActive: boolean;
}

interface ClayPrepEntry {
  id?: number;
  minWeightKg: number;
  maxWeightKg: number;
  preparationMinutes: number;
  isActive: boolean;
}

interface ConfigEntry {
  id?: number;
  name: string;
  displayName: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  // Complexity specific
  finishingMultiplier?: number;
  glazingMultiplier?: number;
  // Firing specific
  bisqueFirings?: number;
  glazeFirings?: number;
  lusterFirings?: number;
  costMultiplier?: number;
  // Shape/Method specific
  timeMultiplier?: number;
}

export default function PricingSettingsPage() {
  const [activeTab, setActiveTab] = useState("profiles");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Data states
  const [pricingSettings, setPricingSettings] = useState<PricingSettings[]>([]);
  const [productionTimes, setProductionTimes] = useState<ProductionTimeEntry[]>([]);
  const [clayPrepTimes, setClayPrepTimes] = useState<ClayPrepEntry[]>([]);
  const [configs, setConfigs] = useState<{
    complexityFactors: ConfigEntry[];
    firingTypes: ConfigEntry[];
    shapeCategories: ConfigEntry[];
    productionMethods: ConfigEntry[];
  }>({
    complexityFactors: [],
    firingTypes: [],
    shapeCategories: [],
    productionMethods: [],
  });

  // Modal states
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<PricingSettings | null>(null);
  const [productionTimeModalOpen, setProductionTimeModalOpen] = useState(false);
  const [editingProductionTime, setEditingProductionTime] = useState<ProductionTimeEntry | null>(null);
  const [clayPrepModalOpen, setClayPrepModalOpen] = useState(false);
  const [editingClayPrep, setEditingClayPrep] = useState<ClayPrepEntry | null>(null);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<{ type: string; entry: ConfigEntry | null }>({ type: "", entry: null });

  // Fetch all data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [settingsRes, timesRes, clayRes, configsRes] = await Promise.all([
        fetch("/api/rnd/pricing-settings"),
        fetch("/api/rnd/pricing-settings/production-times"),
        fetch("/api/rnd/pricing-settings/clay-prep"),
        fetch("/api/rnd/pricing-settings/configs"),
      ]);

      if (settingsRes.ok) {
        const data = await settingsRes.json();
        setPricingSettings(data.settings || []);
      }
      if (timesRes.ok) {
        const data = await timesRes.json();
        setProductionTimes(data.entries || []);
      }
      if (clayRes.ok) {
        const data = await clayRes.json();
        setClayPrepTimes(data.entries || []);
      }
      if (configsRes.ok) {
        const data = await configsRes.json();
        setConfigs({
          complexityFactors: data.complexityFactors || [],
          firingTypes: data.firingTypes || [],
          shapeCategories: data.shapeCategories || [],
          productionMethods: data.productionMethods || [],
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Profile CRUD
  const handleSaveProfile = async (data: Partial<PricingSettings>) => {
    setSaving(true);
    try {
      const method = editingProfile?.id ? "PUT" : "POST";
      const body = editingProfile?.id ? { id: editingProfile.id, ...data } : data;

      const response = await fetch("/api/rnd/pricing-settings", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        await fetchData();
        setProfileModalOpen(false);
        setEditingProfile(null);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to save profile");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProfile = async (id: number) => {
    if (!confirm("Are you sure you want to delete this pricing profile?")) return;

    try {
      const response = await fetch(`/api/rnd/pricing-settings?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchData();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to delete profile");
      }
    } catch (error) {
      console.error("Error deleting profile:", error);
      alert("Failed to delete profile");
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      const response = await fetch("/api/rnd/pricing-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isDefault: true }),
      });

      if (response.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error("Error setting default:", error);
    }
  };

  const handleDuplicateProfile = async (profile: PricingSettings) => {
    const newProfile = {
      ...profile,
      name: `${profile.name} (Copy)`,
      isDefault: false,
      effectiveFrom: new Date().toISOString(),
    };
    delete (newProfile as Partial<PricingSettings> & { id?: number }).id;

    await handleSaveProfile(newProfile);
  };

  // Production Time CRUD
  const handleSaveProductionTime = async (data: Partial<ProductionTimeEntry>) => {
    setSaving(true);
    try {
      const method = editingProductionTime?.id ? "PUT" : "POST";
      const body = editingProductionTime?.id ? { id: editingProductionTime.id, ...data } : data;

      const response = await fetch("/api/rnd/pricing-settings/production-times", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        await fetchData();
        setProductionTimeModalOpen(false);
        setEditingProductionTime(null);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to save production time");
      }
    } catch (error) {
      console.error("Error saving production time:", error);
      alert("Failed to save production time");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProductionTime = async (id: number) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;

    try {
      const response = await fetch(`/api/rnd/pricing-settings/production-times?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error("Error deleting production time:", error);
    }
  };

  // Clay Prep CRUD
  const handleSaveClayPrep = async (data: Partial<ClayPrepEntry>) => {
    setSaving(true);
    try {
      const method = editingClayPrep?.id ? "PUT" : "POST";
      const body = editingClayPrep?.id ? { id: editingClayPrep.id, ...data } : data;

      const response = await fetch("/api/rnd/pricing-settings/clay-prep", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        await fetchData();
        setClayPrepModalOpen(false);
        setEditingClayPrep(null);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to save clay prep time");
      }
    } catch (error) {
      console.error("Error saving clay prep time:", error);
      alert("Failed to save clay prep time");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClayPrep = async (id: number) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;

    try {
      const response = await fetch(`/api/rnd/pricing-settings/clay-prep?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error("Error deleting clay prep time:", error);
    }
  };

  // Config CRUD
  const handleSaveConfig = async (type: string, data: Partial<ConfigEntry>) => {
    setSaving(true);
    try {
      const method = editingConfig.entry?.id ? "PUT" : "POST";
      const body = editingConfig.entry?.id
        ? { type, id: editingConfig.entry.id, ...data }
        : { type, ...data };

      const response = await fetch("/api/rnd/pricing-settings/configs", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        await fetchData();
        setConfigModalOpen(false);
        setEditingConfig({ type: "", entry: null });
      } else {
        const error = await response.json();
        alert(error.error || "Failed to save configuration");
      }
    } catch (error) {
      console.error("Error saving config:", error);
      alert("Failed to save configuration");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfig = async (type: string, id: number) => {
    if (!confirm("Are you sure you want to delete this configuration?")) return;

    try {
      const response = await fetch(`/api/rnd/pricing-settings/configs?type=${type}&id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error("Error deleting config:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading Pricing Settings...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pricing Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage pricing profiles, production times, and configuration parameters
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profiles">Cost Profiles</TabsTrigger>
          <TabsTrigger value="production">Production Times</TabsTrigger>
          <TabsTrigger value="clay">Clay Prep</TabsTrigger>
          <TabsTrigger value="configs">Configurations</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>

        {/* Cost Profiles Tab */}
        <TabsContent value="profiles" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Pricing Profiles</h2>
            <Button size="sm" onClick={() => { setEditingProfile(null); setProfileModalOpen(true); }}>
              <Plus className="h-4 w-4 mr-1" />
              New Profile
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pricingSettings.map((profile) => (
              <Card key={profile.id} className={profile.isDefault ? "border-blue-500 border-2" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      {profile.name}
                      {profile.isDefault && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                    </CardTitle>
                    <div className="flex gap-1">
                      {!profile.isDefault && (
                        <Button variant="ghost" size="sm" onClick={() => handleSetDefault(profile.id)} title="Set as Default">
                          <Star className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => handleDuplicateProfile(profile)} title="Duplicate">
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => { setEditingProfile(profile); setProfileModalOpen(true); }} title="Edit">
                        <Edit className="h-4 w-4" />
                      </Button>
                      {!profile.isDefault && (
                        <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDeleteProfile(profile.id)} title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <CardDescription className="text-xs">
                    {profile.description || "No description"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-xs space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-muted-foreground">Labor/min:</span>
                      <span className="ml-1 font-medium">Rp {profile.laborRatePerMinute.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Clay/kg:</span>
                      <span className="ml-1 font-medium">Rp {profile.clayCostPerKg.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Glaze/kg:</span>
                      <span className="ml-1 font-medium">Rp {profile.glazeCostPerKg.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Bisque Fire:</span>
                      <span className="ml-1 font-medium">Rp {profile.bisqueFiringCostPerLoad.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Overhead:</span>
                      <span className="ml-1 font-medium">{(profile.overheadRate * 100).toFixed(0)}%</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Profit:</span>
                      <span className="ml-1 font-medium">{(profile.profitMargin * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Badge variant={profile.isActive ? "default" : "secondary"}>
                      {profile.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <span className="text-muted-foreground">
                      From: {new Date(profile.effectiveFrom).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
            {pricingSettings.length === 0 && (
              <Card className="col-span-full">
                <CardContent className="py-8 text-center text-muted-foreground">
                  No pricing profiles created yet. Click &quot;New Profile&quot; to create one.
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Production Times Tab */}
        <TabsContent value="production" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Production Time Tables</h2>
            <Button size="sm" onClick={() => { setEditingProductionTime(null); setProductionTimeModalOpen(true); }}>
              <Plus className="h-4 w-4 mr-1" />
              Add Entry
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-24">Method</TableHead>
                      <TableHead className="w-24">Shape</TableHead>
                      <TableHead className="w-24">Weight (KG)</TableHead>
                      <TableHead className="w-20">Forming</TableHead>
                      <TableHead className="w-32">Finishing (S/M/C)</TableHead>
                      <TableHead className="w-32">Glazing (S/M/C)</TableHead>
                      <TableHead className="w-20">Movement</TableHead>
                      <TableHead className="w-20">Packaging</TableHead>
                      <TableHead className="w-20">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productionTimes.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium capitalize">{entry.productionMethod}</TableCell>
                        <TableCell className="capitalize">{entry.shapeCategory}</TableCell>
                        <TableCell>{entry.minWeightKg}-{entry.maxWeightKg}</TableCell>
                        <TableCell>{entry.formingMinutes}</TableCell>
                        <TableCell>{entry.finishingStandard}/{entry.finishingMedium}/{entry.finishingComplex}</TableCell>
                        <TableCell>{entry.glazingStandard}/{entry.glazingMedium}/{entry.glazingComplex}</TableCell>
                        <TableCell>{entry.movementMinutes}</TableCell>
                        <TableCell>{entry.packagingMinutes}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => { setEditingProductionTime(entry); setProductionTimeModalOpen(true); }}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600" onClick={() => entry.id && handleDeleteProductionTime(entry.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {productionTimes.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                          No production time entries. Click &quot;Add Entry&quot; to create one.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Clay Prep Tab */}
        <TabsContent value="clay" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Clay Preparation Times</h2>
            <Button size="sm" onClick={() => { setEditingClayPrep(null); setClayPrepModalOpen(true); }}>
              <Plus className="h-4 w-4 mr-1" />
              Add Entry
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Weight Range (KG)</TableHead>
                    <TableHead>Preparation Time (min)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clayPrepTimes.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{entry.minWeightKg} - {entry.maxWeightKg} KG</TableCell>
                      <TableCell>{entry.preparationMinutes} minutes</TableCell>
                      <TableCell>
                        <Badge variant={entry.isActive ? "default" : "secondary"}>
                          {entry.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => { setEditingClayPrep(entry); setClayPrepModalOpen(true); }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600" onClick={() => entry.id && handleDeleteClayPrep(entry.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {clayPrepTimes.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No clay preparation entries. Click &quot;Add Entry&quot; to create one.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurations Tab */}
        <TabsContent value="configs" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Complexity Factors */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Complexity Levels</CardTitle>
                  <Button size="sm" variant="outline" onClick={() => { setEditingConfig({ type: "complexity", entry: null }); setConfigModalOpen(true); }}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Finishing</TableHead>
                      <TableHead>Glazing</TableHead>
                      <TableHead className="w-16"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {configs.complexityFactors.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium">{entry.displayName}</TableCell>
                        <TableCell>{entry.finishingMultiplier}x</TableCell>
                        <TableCell>{entry.glazingMultiplier}x</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => { setEditingConfig({ type: "complexity", entry }); setConfigModalOpen(true); }}>
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600" onClick={() => entry.id && handleDeleteConfig("complexity", entry.id)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Firing Types */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Firing Types</CardTitle>
                  <Button size="sm" variant="outline" onClick={() => { setEditingConfig({ type: "firing", entry: null }); setConfigModalOpen(true); }}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Bisque</TableHead>
                      <TableHead>Glaze</TableHead>
                      <TableHead>Luster</TableHead>
                      <TableHead className="w-16"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {configs.firingTypes.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium">{entry.displayName}</TableCell>
                        <TableCell>{entry.bisqueFirings}x</TableCell>
                        <TableCell>{entry.glazeFirings}x</TableCell>
                        <TableCell>{entry.lusterFirings}x</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => { setEditingConfig({ type: "firing", entry }); setConfigModalOpen(true); }}>
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600" onClick={() => entry.id && handleDeleteConfig("firing", entry.id)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Shape Categories */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Shape Categories</CardTitle>
                  <Button size="sm" variant="outline" onClick={() => { setEditingConfig({ type: "shape", entry: null }); setConfigModalOpen(true); }}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Time Multiplier</TableHead>
                      <TableHead className="w-16"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {configs.shapeCategories.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium">{entry.displayName}</TableCell>
                        <TableCell>{entry.timeMultiplier}x</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => { setEditingConfig({ type: "shape", entry }); setConfigModalOpen(true); }}>
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600" onClick={() => entry.id && handleDeleteConfig("shape", entry.id)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Production Methods */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Production Methods</CardTitle>
                  <Button size="sm" variant="outline" onClick={() => { setEditingConfig({ type: "method", entry: null }); setConfigModalOpen(true); }}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Time Multiplier</TableHead>
                      <TableHead className="w-16"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {configs.productionMethods.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium">{entry.displayName}</TableCell>
                        <TableCell>{entry.timeMultiplier}x</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => { setEditingConfig({ type: "method", entry }); setConfigModalOpen(true); }}>
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600" onClick={() => entry.id && handleDeleteConfig("method", entry.id)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pricing Profiles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pricingSettings.length}</div>
                <p className="text-xs text-muted-foreground">
                  {pricingSettings.filter(p => p.isActive).length} active
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Production Time Entries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{productionTimes.length}</div>
                <p className="text-xs text-muted-foreground">
                  {new Set(productionTimes.map(p => p.productionMethod)).size} methods
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Clay Prep Entries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{clayPrepTimes.length}</div>
                <p className="text-xs text-muted-foreground">weight ranges</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Configurations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {configs.complexityFactors.length + configs.firingTypes.length + configs.shapeCategories.length + configs.productionMethods.length}
                </div>
                <p className="text-xs text-muted-foreground">total entries</p>
              </CardContent>
            </Card>
          </div>

          {/* Default Profile Summary */}
          {pricingSettings.find(p => p.isDefault) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Settings2 className="h-5 w-5" />
                  Default Pricing Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const defaultProfile = pricingSettings.find(p => p.isDefault);
                  if (!defaultProfile) return null;
                  return (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Profile Name</div>
                        <div className="font-medium">{defaultProfile.name}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Labor Rate</div>
                        <div className="font-medium">Rp {defaultProfile.laborRatePerMinute.toLocaleString()}/min</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Overhead Rate</div>
                        <div className="font-medium">{(defaultProfile.overheadRate * 100).toFixed(0)}%</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Profit Margin</div>
                        <div className="font-medium">{(defaultProfile.profitMargin * 100).toFixed(0)}%</div>
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Profile Modal */}
      <ProfileModal
        open={profileModalOpen}
        onOpenChange={setProfileModalOpen}
        profile={editingProfile}
        onSave={handleSaveProfile}
        saving={saving}
      />

      {/* Production Time Modal */}
      <ProductionTimeModal
        open={productionTimeModalOpen}
        onOpenChange={setProductionTimeModalOpen}
        entry={editingProductionTime}
        onSave={handleSaveProductionTime}
        saving={saving}
        configs={configs}
      />

      {/* Clay Prep Modal */}
      <ClayPrepModal
        open={clayPrepModalOpen}
        onOpenChange={setClayPrepModalOpen}
        entry={editingClayPrep}
        onSave={handleSaveClayPrep}
        saving={saving}
      />

      {/* Config Modal */}
      <ConfigModal
        open={configModalOpen}
        onOpenChange={setConfigModalOpen}
        type={editingConfig.type}
        entry={editingConfig.entry}
        onSave={handleSaveConfig}
        saving={saving}
      />
    </div>
  );
}

// Profile Modal Component
function ProfileModal({
  open,
  onOpenChange,
  profile,
  onSave,
  saving,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: PricingSettings | null;
  onSave: (data: Partial<PricingSettings>) => void;
  saving: boolean;
}) {
  const initialFormData = useMemo(() => {
    if (profile) {
      return {
        ...profile,
        effectiveFrom: profile.effectiveFrom ? new Date(profile.effectiveFrom).toISOString().split("T")[0] : "",
        effectiveTo: profile.effectiveTo ? new Date(profile.effectiveTo).toISOString().split("T")[0] : "",
      };
    }
    return {
      name: "",
      description: "",
      laborRatePerMinute: 500,
      clayCostPerKg: 15000,
      glazeCostPerKg: 25000,
      engobeCostPerKg: 20000,
      lusterCostPerKg: 50000,
      bisqueFiringCostPerLoad: 500000,
      glazeFiringCostPerLoad: 750000,
      rakuFiringCostPerLoad: 600000,
      lusterFiringCostPerLoad: 400000,
      kilnCapacityPieces: 100,
      overheadRate: 0.15,
      profitMargin: 0.20,
      effectiveFrom: new Date().toISOString().split("T")[0],
      isActive: true,
      isDefault: false,
    };
  }, [profile]);

  const [formData, setFormData] = useState<Partial<PricingSettings>>(initialFormData);

  // Reset form when modal opens/closes or profile changes
  useEffect(() => {
    setFormData(initialFormData);
  }, [initialFormData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{profile ? "Edit Pricing Profile" : "Create Pricing Profile"}</DialogTitle>
          <DialogDescription>
            Configure cost rates, margins, and validity period
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Profile Name *</Label>
              <Input
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., 2024 Standard Pricing"
                required
              />
            </div>
            <div className="col-span-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description"
                rows={2}
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Labor & Material Costs</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">Labor Rate (Rp/min) *</Label>
                <Input
                  type="number"
                  value={formData.laborRatePerMinute || ""}
                  onChange={(e) => setFormData({ ...formData, laborRatePerMinute: parseFloat(e.target.value) })}
                  required
                />
              </div>
              <div>
                <Label className="text-xs">Clay Cost (Rp/kg) *</Label>
                <Input
                  type="number"
                  value={formData.clayCostPerKg || ""}
                  onChange={(e) => setFormData({ ...formData, clayCostPerKg: parseFloat(e.target.value) })}
                  required
                />
              </div>
              <div>
                <Label className="text-xs">Glaze Cost (Rp/kg) *</Label>
                <Input
                  type="number"
                  value={formData.glazeCostPerKg || ""}
                  onChange={(e) => setFormData({ ...formData, glazeCostPerKg: parseFloat(e.target.value) })}
                  required
                />
              </div>
              <div>
                <Label className="text-xs">Engobe Cost (Rp/kg)</Label>
                <Input
                  type="number"
                  value={formData.engobeCostPerKg || ""}
                  onChange={(e) => setFormData({ ...formData, engobeCostPerKg: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <Label className="text-xs">Luster Cost (Rp/kg)</Label>
                <Input
                  type="number"
                  value={formData.lusterCostPerKg || ""}
                  onChange={(e) => setFormData({ ...formData, lusterCostPerKg: parseFloat(e.target.value) })}
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Firing Costs</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <Label className="text-xs">Bisque Fire (Rp/load) *</Label>
                <Input
                  type="number"
                  value={formData.bisqueFiringCostPerLoad || ""}
                  onChange={(e) => setFormData({ ...formData, bisqueFiringCostPerLoad: parseFloat(e.target.value) })}
                  required
                />
              </div>
              <div>
                <Label className="text-xs">Glaze Fire (Rp/load) *</Label>
                <Input
                  type="number"
                  value={formData.glazeFiringCostPerLoad || ""}
                  onChange={(e) => setFormData({ ...formData, glazeFiringCostPerLoad: parseFloat(e.target.value) })}
                  required
                />
              </div>
              <div>
                <Label className="text-xs">Raku Fire (Rp/load)</Label>
                <Input
                  type="number"
                  value={formData.rakuFiringCostPerLoad || ""}
                  onChange={(e) => setFormData({ ...formData, rakuFiringCostPerLoad: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <Label className="text-xs">Luster Fire (Rp/load)</Label>
                <Input
                  type="number"
                  value={formData.lusterFiringCostPerLoad || ""}
                  onChange={(e) => setFormData({ ...formData, lusterFiringCostPerLoad: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <Label className="text-xs">Kiln Capacity (pcs)</Label>
                <Input
                  type="number"
                  value={formData.kilnCapacityPieces || ""}
                  onChange={(e) => setFormData({ ...formData, kilnCapacityPieces: parseInt(e.target.value) })}
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Margins & Validity</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <Label className="text-xs">Overhead Rate (%) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.overheadRate ? (formData.overheadRate * 100).toFixed(0) : ""}
                  onChange={(e) => setFormData({ ...formData, overheadRate: parseFloat(e.target.value) / 100 })}
                  required
                />
              </div>
              <div>
                <Label className="text-xs">Profit Margin (%) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.profitMargin ? (formData.profitMargin * 100).toFixed(0) : ""}
                  onChange={(e) => setFormData({ ...formData, profitMargin: parseFloat(e.target.value) / 100 })}
                  required
                />
              </div>
              <div>
                <Label className="text-xs">Effective From *</Label>
                <Input
                  type="date"
                  value={formData.effectiveFrom || ""}
                  onChange={(e) => setFormData({ ...formData, effectiveFrom: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label className="text-xs">Effective To</Label>
                <Input
                  type="date"
                  value={formData.effectiveTo || ""}
                  onChange={(e) => setFormData({ ...formData, effectiveTo: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 border-t pt-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isActive !== false}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
              <span className="text-sm">Active</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isDefault === true}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
              />
              <span className="text-sm">Set as Default</span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : <><Save className="h-4 w-4 mr-1" /> Save</>}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Production Time Modal Component
function ProductionTimeModal({
  open,
  onOpenChange,
  entry,
  onSave,
  saving,
  configs,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: ProductionTimeEntry | null;
  onSave: (data: Partial<ProductionTimeEntry>) => void;
  saving: boolean;
  configs: {
    productionMethods: ConfigEntry[];
    shapeCategories: ConfigEntry[];
  };
}) {
  const initialFormData = useMemo(() => {
    if (entry) {
      return entry;
    }
    return {
      productionMethod: "wheel",
      shapeCategory: "round",
      minWeightKg: 0,
      maxWeightKg: 0.5,
      formingMinutes: 10,
      finishingStandard: 5,
      finishingMedium: 8,
      finishingComplex: 12,
      glazingStandard: 3,
      glazingMedium: 5,
      glazingComplex: 8,
      movementMinutes: 2,
      packagingMinutes: 3,
      firingStandardBisque: 1,
      firingStandardGlaze: 1,
      firingRakuBisque: 1,
      firingRakuGlaze: 2,
      firingLusterBisque: 1,
      firingLusterGlaze: 1,
      firingLusterLuster: 1,
      isActive: true,
    };
  }, [entry]);

  const [formData, setFormData] = useState<Partial<ProductionTimeEntry>>(initialFormData);

  useEffect(() => {
    setFormData(initialFormData);
  }, [initialFormData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{entry ? "Edit Production Time" : "Add Production Time"}</DialogTitle>
          <DialogDescription>
            Configure production times for specific method, shape, and weight range
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <Label className="text-xs">Production Method *</Label>
              <Select
                value={formData.productionMethod || ""}
                onValueChange={(value) => setFormData({ ...formData, productionMethod: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  {configs.productionMethods.length > 0 ? (
                    configs.productionMethods.map((m) => (
                      <SelectItem key={m.name} value={m.name}>{m.displayName}</SelectItem>
                    ))
                  ) : (
                    <>
                      <SelectItem value="wheel">Wheel</SelectItem>
                      <SelectItem value="casting">Casting</SelectItem>
                      <SelectItem value="slabbing">Slabbing</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Shape Category *</Label>
              <Select
                value={formData.shapeCategory || ""}
                onValueChange={(value) => setFormData({ ...formData, shapeCategory: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select shape" />
                </SelectTrigger>
                <SelectContent>
                  {configs.shapeCategories.length > 0 ? (
                    configs.shapeCategories.map((s) => (
                      <SelectItem key={s.name} value={s.name}>{s.displayName}</SelectItem>
                    ))
                  ) : (
                    <>
                      <SelectItem value="round">Round</SelectItem>
                      <SelectItem value="oval">Oval</SelectItem>
                      <SelectItem value="square">Square</SelectItem>
                      <SelectItem value="irregular">Irregular</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Min Weight (KG) *</Label>
              <Input
                type="number"
                step="0.1"
                value={formData.minWeightKg || ""}
                onChange={(e) => setFormData({ ...formData, minWeightKg: parseFloat(e.target.value) })}
                required
              />
            </div>
            <div>
              <Label className="text-xs">Max Weight (KG) *</Label>
              <Input
                type="number"
                step="0.1"
                value={formData.maxWeightKg || ""}
                onChange={(e) => setFormData({ ...formData, maxWeightKg: parseFloat(e.target.value) })}
                required
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium mb-3 text-sm">Time Values (minutes)</h4>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
              <div>
                <Label className="text-xs">Forming *</Label>
                <Input
                  type="number"
                  value={formData.formingMinutes || ""}
                  onChange={(e) => setFormData({ ...formData, formingMinutes: parseFloat(e.target.value) })}
                  required
                />
              </div>
              <div>
                <Label className="text-xs">Finish (Std) *</Label>
                <Input
                  type="number"
                  value={formData.finishingStandard || ""}
                  onChange={(e) => setFormData({ ...formData, finishingStandard: parseFloat(e.target.value) })}
                  required
                />
              </div>
              <div>
                <Label className="text-xs">Finish (Med) *</Label>
                <Input
                  type="number"
                  value={formData.finishingMedium || ""}
                  onChange={(e) => setFormData({ ...formData, finishingMedium: parseFloat(e.target.value) })}
                  required
                />
              </div>
              <div>
                <Label className="text-xs">Finish (Cplx) *</Label>
                <Input
                  type="number"
                  value={formData.finishingComplex || ""}
                  onChange={(e) => setFormData({ ...formData, finishingComplex: parseFloat(e.target.value) })}
                  required
                />
              </div>
              <div>
                <Label className="text-xs">Movement *</Label>
                <Input
                  type="number"
                  value={formData.movementMinutes || ""}
                  onChange={(e) => setFormData({ ...formData, movementMinutes: parseFloat(e.target.value) })}
                  required
                />
              </div>
              <div>
                <Label className="text-xs">Glaze (Std) *</Label>
                <Input
                  type="number"
                  value={formData.glazingStandard || ""}
                  onChange={(e) => setFormData({ ...formData, glazingStandard: parseFloat(e.target.value) })}
                  required
                />
              </div>
              <div>
                <Label className="text-xs">Glaze (Med) *</Label>
                <Input
                  type="number"
                  value={formData.glazingMedium || ""}
                  onChange={(e) => setFormData({ ...formData, glazingMedium: parseFloat(e.target.value) })}
                  required
                />
              </div>
              <div>
                <Label className="text-xs">Glaze (Cplx) *</Label>
                <Input
                  type="number"
                  value={formData.glazingComplex || ""}
                  onChange={(e) => setFormData({ ...formData, glazingComplex: parseFloat(e.target.value) })}
                  required
                />
              </div>
              <div>
                <Label className="text-xs">Packaging *</Label>
                <Input
                  type="number"
                  value={formData.packagingMinutes || ""}
                  onChange={(e) => setFormData({ ...formData, packagingMinutes: parseFloat(e.target.value) })}
                  required
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium mb-3 text-sm">Firing Counts</h4>
            <div className="grid grid-cols-3 md:grid-cols-7 gap-3">
              <div>
                <Label className="text-xs">Std Bisque</Label>
                <Input
                  type="number"
                  value={formData.firingStandardBisque || ""}
                  onChange={(e) => setFormData({ ...formData, firingStandardBisque: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label className="text-xs">Std Glaze</Label>
                <Input
                  type="number"
                  value={formData.firingStandardGlaze || ""}
                  onChange={(e) => setFormData({ ...formData, firingStandardGlaze: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label className="text-xs">Raku Bisque</Label>
                <Input
                  type="number"
                  value={formData.firingRakuBisque || ""}
                  onChange={(e) => setFormData({ ...formData, firingRakuBisque: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label className="text-xs">Raku Glaze</Label>
                <Input
                  type="number"
                  value={formData.firingRakuGlaze || ""}
                  onChange={(e) => setFormData({ ...formData, firingRakuGlaze: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label className="text-xs">Luster Bisque</Label>
                <Input
                  type="number"
                  value={formData.firingLusterBisque || ""}
                  onChange={(e) => setFormData({ ...formData, firingLusterBisque: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label className="text-xs">Luster Glaze</Label>
                <Input
                  type="number"
                  value={formData.firingLusterGlaze || ""}
                  onChange={(e) => setFormData({ ...formData, firingLusterGlaze: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label className="text-xs">Luster Fire</Label>
                <Input
                  type="number"
                  value={formData.firingLusterLuster || ""}
                  onChange={(e) => setFormData({ ...formData, firingLusterLuster: parseInt(e.target.value) })}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : <><Save className="h-4 w-4 mr-1" /> Save</>}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Clay Prep Modal Component
function ClayPrepModal({
  open,
  onOpenChange,
  entry,
  onSave,
  saving,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: ClayPrepEntry | null;
  onSave: (data: Partial<ClayPrepEntry>) => void;
  saving: boolean;
}) {
  const initialFormData = useMemo(() => {
    if (entry) {
      return entry;
    }
    return {
      minWeightKg: 0,
      maxWeightKg: 0.5,
      preparationMinutes: 5,
      isActive: true,
    };
  }, [entry]);

  const [formData, setFormData] = useState<Partial<ClayPrepEntry>>(initialFormData);

  useEffect(() => {
    setFormData(initialFormData);
  }, [initialFormData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{entry ? "Edit Clay Prep Time" : "Add Clay Prep Time"}</DialogTitle>
          <DialogDescription>
            Configure clay preparation time for a weight range
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Min Weight (KG) *</Label>
              <Input
                type="number"
                step="0.1"
                value={formData.minWeightKg || ""}
                onChange={(e) => setFormData({ ...formData, minWeightKg: parseFloat(e.target.value) })}
                required
              />
            </div>
            <div>
              <Label>Max Weight (KG) *</Label>
              <Input
                type="number"
                step="0.1"
                value={formData.maxWeightKg || ""}
                onChange={(e) => setFormData({ ...formData, maxWeightKg: parseFloat(e.target.value) })}
                required
              />
            </div>
            <div className="col-span-2">
              <Label>Preparation Time (minutes) *</Label>
              <Input
                type="number"
                value={formData.preparationMinutes || ""}
                onChange={(e) => setFormData({ ...formData, preparationMinutes: parseFloat(e.target.value) })}
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isActive !== false}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            />
            <span className="text-sm">Active</span>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : <><Save className="h-4 w-4 mr-1" /> Save</>}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Config Modal Component
function ConfigModal({
  open,
  onOpenChange,
  type,
  entry,
  onSave,
  saving,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: string;
  entry: ConfigEntry | null;
  onSave: (type: string, data: Partial<ConfigEntry>) => void;
  saving: boolean;
}) {
  const initialFormData = useMemo(() => {
    if (entry) {
      return entry;
    }
    return {
      name: "",
      displayName: "",
      description: "",
      sortOrder: 0,
      isActive: true,
      finishingMultiplier: 1.0,
      glazingMultiplier: 1.0,
      bisqueFirings: 1,
      glazeFirings: 1,
      lusterFirings: 0,
      costMultiplier: 1.0,
      timeMultiplier: 1.0,
    };
  }, [entry]);

  const [formData, setFormData] = useState<Partial<ConfigEntry>>(initialFormData);

  useEffect(() => {
    setFormData(initialFormData);
  }, [initialFormData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(type, formData);
  };

  const getTitle = () => {
    switch (type) {
      case "complexity": return entry ? "Edit Complexity Level" : "Add Complexity Level";
      case "firing": return entry ? "Edit Firing Type" : "Add Firing Type";
      case "shape": return entry ? "Edit Shape Category" : "Add Shape Category";
      case "method": return entry ? "Edit Production Method" : "Add Production Method";
      default: return "Configuration";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Name (key) *</Label>
              <Input
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value.toLowerCase().replace(/\s+/g, "_") })}
                placeholder="e.g., standard"
                required
              />
            </div>
            <div>
              <Label>Display Name *</Label>
              <Input
                value={formData.displayName || ""}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                placeholder="e.g., Standard"
                required
              />
            </div>
            <div className="col-span-2">
              <Label>Description</Label>
              <Input
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description"
              />
            </div>
            <div>
              <Label>Sort Order</Label>
              <Input
                type="number"
                value={formData.sortOrder || 0}
                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
              />
            </div>
          </div>

          {/* Type-specific fields */}
          {type === "complexity" && (
            <div className="grid grid-cols-2 gap-4 border-t pt-4">
              <div>
                <Label>Finishing Multiplier</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.finishingMultiplier || 1.0}
                  onChange={(e) => setFormData({ ...formData, finishingMultiplier: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <Label>Glazing Multiplier</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.glazingMultiplier || 1.0}
                  onChange={(e) => setFormData({ ...formData, glazingMultiplier: parseFloat(e.target.value) })}
                />
              </div>
            </div>
          )}

          {type === "firing" && (
            <div className="grid grid-cols-2 gap-4 border-t pt-4">
              <div>
                <Label>Bisque Firings</Label>
                <Input
                  type="number"
                  value={formData.bisqueFirings || 1}
                  onChange={(e) => setFormData({ ...formData, bisqueFirings: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label>Glaze Firings</Label>
                <Input
                  type="number"
                  value={formData.glazeFirings || 1}
                  onChange={(e) => setFormData({ ...formData, glazeFirings: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label>Luster Firings</Label>
                <Input
                  type="number"
                  value={formData.lusterFirings || 0}
                  onChange={(e) => setFormData({ ...formData, lusterFirings: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label>Cost Multiplier</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.costMultiplier || 1.0}
                  onChange={(e) => setFormData({ ...formData, costMultiplier: parseFloat(e.target.value) })}
                />
              </div>
            </div>
          )}

          {(type === "shape" || type === "method") && (
            <div className="border-t pt-4">
              <Label>Time Multiplier</Label>
              <Input
                type="number"
                step="0.1"
                value={formData.timeMultiplier || 1.0}
                onChange={(e) => setFormData({ ...formData, timeMultiplier: parseFloat(e.target.value) })}
              />
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isActive !== false}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            />
            <span className="text-sm">Active</span>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : <><Check className="h-4 w-4 mr-1" /> Save</>}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}