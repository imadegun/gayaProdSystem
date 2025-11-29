"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calculator, Settings, Clock, DollarSign, Flame, Package, RefreshCw, Plus, Trash2 } from "lucide-react";

interface PricingConfig {
  productionMethods: { value: string; label: string }[];
  shapeCategories: Record<string, { value: string; label: string }[]>;
  complexityLevels: { value: string; label: string }[];
  firingTypes: { value: string; label: string }[];
  defaultRates: {
    laborRatePerMinute: number;
    firingCostPerLoad: number;
    materialCostPerKg: number;
    overheadRate: number;
    profitMargin: number;
  };
}

interface TimeBreakdown {
  clayPreparation: number;
  forming: number;
  finishing: number;
  glazing: number;
  movement: number;
  packaging: number;
  totalMinutes: number;
}

interface FiringBreakdown {
  bisquePcsPerLoad: number;
  glazePcsPerLoad: number;
  bisqueLoadsNeeded: number;
  glazeLoadsNeeded: number;
  totalFiringCost: number;
}

interface CostBreakdown {
  laborCost: number;
  materialCost: number;
  firingCost: number;
  overheadCost: number;
  profitAmount: number;
  totalCost: number;
  unitPrice: number;
  totalPrice: number;
}

interface PricingResultInput {
  productionMethod: string;
  shapeCategory: string;
  weightKg: number;
  complexityLevel: string;
  firingType: string;
  quantity: number;
}

interface PricingResult {
  input: PricingResultInput;
  timeBreakdown: TimeBreakdown;
  firingBreakdown: FiringBreakdown;
  costBreakdown: CostBreakdown;
  calculatedAt: string;
}

interface BatchResultItem {
  itemName?: string;
  itemCode?: string;
  input?: PricingResultInput;
  costBreakdown?: CostBreakdown;
  error?: string;
}

interface BatchResults {
  success: boolean;
  results: BatchResultItem[];
  summary: {
    totalItems: number;
    successfulCalculations: number;
    failedCalculations: number;
    totalQuantity: number;
    totalPrice: number;
  };
}

interface BatchItem {
  id: string;
  itemName: string;
  itemCode: string;
  productionMethod: string;
  shapeCategory: string;
  weightKg: string;
  complexityLevel: string;
  firingType: string;
  quantity: string;
}

export default function PricingCalculatorPage() {
  const [config, setConfig] = useState<PricingConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState<PricingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("single");

  // Single item form state
  const [formData, setFormData] = useState({
    productionMethod: "wheel",
    shapeCategory: "plate",
    weightKg: "1",
    complexityLevel: "standard",
    firingType: "standard",
    quantity: "100",
  });

  // Rate overrides
  const [showRateSettings, setShowRateSettings] = useState(false);
  const [rates, setRates] = useState({
    laborRatePerMinute: "",
    firingCostPerLoad: "",
    materialCostPerKg: "",
    overheadRate: "",
    profitMargin: "",
  });

  // Batch calculation state
  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
  const [batchResults, setBatchResults] = useState<BatchResults | null>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await fetch("/api/rnd/pricing-calculator");
      if (response.ok) {
        const data = await response.json();
        setConfig(data);
        // Set default rates
        setRates({
          laborRatePerMinute: data.defaultRates.laborRatePerMinute.toString(),
          firingCostPerLoad: data.defaultRates.firingCostPerLoad.toString(),
          materialCostPerKg: data.defaultRates.materialCostPerKg.toString(),
          overheadRate: (data.defaultRates.overheadRate * 100).toString(),
          profitMargin: (data.defaultRates.profitMargin * 100).toString(),
        });
      }
    } catch (err) {
      console.error("Error fetching config:", err);
      setError("Failed to load pricing calculator configuration");
    } finally {
      setLoading(false);
    }
  };

  const handleCalculate = async () => {
    setCalculating(true);
    setError(null);
    setResult(null);

    try {
      const payload: Record<string, string | number> = {
        ...formData,
      };

      // Add rate overrides if provided
      if (rates.laborRatePerMinute) payload.laborRatePerMinute = rates.laborRatePerMinute;
      if (rates.firingCostPerLoad) payload.firingCostPerLoad = rates.firingCostPerLoad;
      if (rates.materialCostPerKg) payload.materialCostPerKg = rates.materialCostPerKg;
      if (rates.overheadRate) payload.overheadRate = parseFloat(rates.overheadRate) / 100;
      if (rates.profitMargin) payload.profitMargin = parseFloat(rates.profitMargin) / 100;

      const response = await fetch("/api/rnd/pricing-calculator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResult(data.result);
      } else {
        setError(data.error || "Calculation failed");
      }
    } catch (err) {
      console.error("Error calculating:", err);
      setError("Failed to calculate pricing");
    } finally {
      setCalculating(false);
    }
  };

  const handleBatchCalculate = async () => {
    if (batchItems.length === 0) {
      setError("Please add at least one item to calculate");
      return;
    }

    setCalculating(true);
    setError(null);
    setBatchResults(null);

    try {
      const globalRates: Record<string, string | number> = {};
      if (rates.laborRatePerMinute) globalRates.laborRatePerMinute = rates.laborRatePerMinute;
      if (rates.firingCostPerLoad) globalRates.firingCostPerLoad = rates.firingCostPerLoad;
      if (rates.materialCostPerKg) globalRates.materialCostPerKg = rates.materialCostPerKg;
      if (rates.overheadRate) globalRates.overheadRate = parseFloat(rates.overheadRate) / 100;
      if (rates.profitMargin) globalRates.profitMargin = parseFloat(rates.profitMargin) / 100;

      const response = await fetch("/api/rnd/pricing-calculator", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: batchItems,
          globalRates,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setBatchResults(data);
      } else {
        setError(data.error || "Batch calculation failed");
      }
    } catch (err) {
      console.error("Error batch calculating:", err);
      setError("Failed to calculate batch pricing");
    } finally {
      setCalculating(false);
    }
  };

  const addBatchItem = () => {
    const newItem: BatchItem = {
      id: Date.now().toString(),
      itemName: "",
      itemCode: "",
      productionMethod: "wheel",
      shapeCategory: "plate",
      weightKg: "1",
      complexityLevel: "standard",
      firingType: "standard",
      quantity: "100",
    };
    setBatchItems([...batchItems, newItem]);
  };

  const updateBatchItem = (id: string, field: string, value: string) => {
    setBatchItems(
      batchItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const removeBatchItem = (id: string) => {
    setBatchItems(batchItems.filter((item) => item.id !== id));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading Pricing Calculator...</div>
      </div>
    );
  }

  const availableShapes = config?.shapeCategories[formData.productionMethod] || [];

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pricing Calculator</h1>
          <p className="text-sm text-muted-foreground">
            Calculate product pricing based on production parameters
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowRateSettings(!showRateSettings)}
        >
          <Settings className="h-4 w-4 mr-1" />
          Rate Settings
        </Button>
      </div>

      {/* Rate Settings Panel */}
      {showRateSettings && (
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm">Cost Rate Settings</CardTitle>
            <CardDescription className="text-xs">
              Customize labor, material, and overhead rates
            </CardDescription>
          </CardHeader>
          <CardContent className="py-2">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div>
                <Label className="text-xs">Labor Rate ($/min)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={rates.laborRatePerMinute}
                  onChange={(e) => setRates({ ...rates, laborRatePerMinute: e.target.value })}
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Firing Cost ($/load)</Label>
                <Input
                  type="number"
                  step="1"
                  value={rates.firingCostPerLoad}
                  onChange={(e) => setRates({ ...rates, firingCostPerLoad: e.target.value })}
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Material Cost ($/kg)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={rates.materialCostPerKg}
                  onChange={(e) => setRates({ ...rates, materialCostPerKg: e.target.value })}
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Overhead Rate (%)</Label>
                <Input
                  type="number"
                  step="1"
                  value={rates.overheadRate}
                  onChange={(e) => setRates({ ...rates, overheadRate: e.target.value })}
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Profit Margin (%)</Label>
                <Input
                  type="number"
                  step="1"
                  value={rates.profitMargin}
                  onChange={(e) => setRates({ ...rates, profitMargin: e.target.value })}
                  className="h-8 text-sm"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
          {error}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="single">Single Item</TabsTrigger>
          <TabsTrigger value="batch">Batch Calculation</TabsTrigger>
        </TabsList>

        {/* Single Item Calculator */}
        <TabsContent value="single" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Input Form */}
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calculator className="h-4 w-4" />
                  Product Parameters
                </CardTitle>
              </CardHeader>
              <CardContent className="py-2 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Production Method</Label>
                    <Select
                      value={formData.productionMethod}
                      onValueChange={(value) => {
                        setFormData({
                          ...formData,
                          productionMethod: value,
                          shapeCategory: config?.shapeCategories[value]?.[0]?.value || "all_shapes",
                        });
                      }}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {config?.productionMethods.map((method) => (
                          <SelectItem key={method.value} value={method.value}>
                            {method.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs">Shape Category</Label>
                    <Select
                      value={formData.shapeCategory}
                      onValueChange={(value) => setFormData({ ...formData, shapeCategory: value })}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableShapes.map((shape) => (
                          <SelectItem key={shape.value} value={shape.value}>
                            {shape.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs">Weight (kg)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={formData.weightKg}
                      onChange={(e) => setFormData({ ...formData, weightKg: e.target.value })}
                      className="h-8 text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Complexity Level</Label>
                    <Select
                      value={formData.complexityLevel}
                      onValueChange={(value) => setFormData({ ...formData, complexityLevel: value })}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {config?.complexityLevels.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs">Firing Type</Label>
                    <Select
                      value={formData.firingType}
                      onValueChange={(value) => setFormData({ ...formData, firingType: value })}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {config?.firingTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs">Quantity</Label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleCalculate}
                  disabled={calculating}
                  className="w-full h-9"
                >
                  {calculating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Calculating...
                    </>
                  ) : (
                    <>
                      <Calculator className="h-4 w-4 mr-2" />
                      Calculate Price
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Results */}
            {result && (
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Pricing Result
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-2 space-y-4">
                  {/* Summary */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 p-3 rounded">
                      <div className="text-xs text-blue-600 font-medium">Unit Price</div>
                      <div className="text-xl font-bold text-blue-700">
                        {formatCurrency(result.costBreakdown.unitPrice)}
                      </div>
                    </div>
                    <div className="bg-green-50 p-3 rounded">
                      <div className="text-xs text-green-600 font-medium">Total Price ({result.input.quantity} pcs)</div>
                      <div className="text-xl font-bold text-green-700">
                        {formatCurrency(result.costBreakdown.totalPrice)}
                      </div>
                    </div>
                  </div>

                  {/* Time Breakdown */}
                  <div>
                    <div className="flex items-center gap-1 mb-2">
                      <Clock className="h-3 w-3" />
                      <span className="text-xs font-medium">Time Breakdown (per piece)</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="bg-gray-50 p-2 rounded">
                        <div className="text-muted-foreground">Clay Prep</div>
                        <div className="font-medium">{result.timeBreakdown.clayPreparation}m</div>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <div className="text-muted-foreground">Forming</div>
                        <div className="font-medium">{result.timeBreakdown.forming}m</div>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <div className="text-muted-foreground">Finishing</div>
                        <div className="font-medium">{result.timeBreakdown.finishing}m</div>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <div className="text-muted-foreground">Glazing</div>
                        <div className="font-medium">{result.timeBreakdown.glazing}m</div>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <div className="text-muted-foreground">Movement</div>
                        <div className="font-medium">{result.timeBreakdown.movement}m</div>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <div className="text-muted-foreground">Packaging</div>
                        <div className="font-medium">{result.timeBreakdown.packaging}m</div>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-right">
                      <span className="text-muted-foreground">Total Time: </span>
                      <span className="font-medium">{formatTime(result.timeBreakdown.totalMinutes)}</span>
                    </div>
                  </div>

                  {/* Firing Breakdown */}
                  <div>
                    <div className="flex items-center gap-1 mb-2">
                      <Flame className="h-3 w-3" />
                      <span className="text-xs font-medium">Firing Details</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-orange-50 p-2 rounded">
                        <div className="text-muted-foreground">Bisque Loads</div>
                        <div className="font-medium">{result.firingBreakdown.bisqueLoadsNeeded} ({result.firingBreakdown.bisquePcsPerLoad} pcs/load)</div>
                      </div>
                      <div className="bg-orange-50 p-2 rounded">
                        <div className="text-muted-foreground">Glaze Loads</div>
                        <div className="font-medium">{result.firingBreakdown.glazeLoadsNeeded} ({result.firingBreakdown.glazePcsPerLoad} pcs/load)</div>
                      </div>
                    </div>
                  </div>

                  {/* Cost Breakdown */}
                  <div>
                    <div className="flex items-center gap-1 mb-2">
                      <Package className="h-3 w-3" />
                      <span className="text-xs font-medium">Cost Breakdown</span>
                    </div>
                    <Table>
                      <TableBody className="text-xs">
                        <TableRow>
                          <TableCell className="py-1">Labor Cost</TableCell>
                          <TableCell className="py-1 text-right">{formatCurrency(result.costBreakdown.laborCost)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="py-1">Material Cost</TableCell>
                          <TableCell className="py-1 text-right">{formatCurrency(result.costBreakdown.materialCost)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="py-1">Firing Cost</TableCell>
                          <TableCell className="py-1 text-right">{formatCurrency(result.costBreakdown.firingCost)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="py-1">Overhead</TableCell>
                          <TableCell className="py-1 text-right">{formatCurrency(result.costBreakdown.overheadCost)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="py-1">Profit</TableCell>
                          <TableCell className="py-1 text-right">{formatCurrency(result.costBreakdown.profitAmount)}</TableCell>
                        </TableRow>
                        <TableRow className="font-bold">
                          <TableCell className="py-1">Total</TableCell>
                          <TableCell className="py-1 text-right">{formatCurrency(result.costBreakdown.totalCost)}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Batch Calculator */}
        <TabsContent value="batch" className="space-y-4">
          <Card>
            <CardHeader className="py-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Batch Items</CardTitle>
                <Button size="sm" onClick={addBatchItem}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent className="py-2">
              {batchItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No items added. Click &quot;Add Item&quot; to start.
                </div>
              ) : (
                <div className="space-y-3">
                  {batchItems.map((item, index) => (
                    <div key={item.id} className="border rounded p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">Item {index + 1}</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 h-6 px-2"
                          onClick={() => removeBatchItem(item.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <div>
                          <Label className="text-xs">Item Name</Label>
                          <Input
                            value={item.itemName}
                            onChange={(e) => updateBatchItem(item.id, "itemName", e.target.value)}
                            className="h-7 text-xs"
                            placeholder="e.g., Dinner Plate"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Item Code</Label>
                          <Input
                            value={item.itemCode}
                            onChange={(e) => updateBatchItem(item.id, "itemCode", e.target.value)}
                            className="h-7 text-xs"
                            placeholder="e.g., DP-001"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Method</Label>
                          <Select
                            value={item.productionMethod}
                            onValueChange={(value) => updateBatchItem(item.id, "productionMethod", value)}
                          >
                            <SelectTrigger className="h-7 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {config?.productionMethods.map((method) => (
                                <SelectItem key={method.value} value={method.value}>
                                  {method.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs">Shape</Label>
                          <Select
                            value={item.shapeCategory}
                            onValueChange={(value) => updateBatchItem(item.id, "shapeCategory", value)}
                          >
                            <SelectTrigger className="h-7 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {(config?.shapeCategories[item.productionMethod] || []).map((shape) => (
                                <SelectItem key={shape.value} value={shape.value}>
                                  {shape.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs">Weight (kg)</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={item.weightKg}
                            onChange={(e) => updateBatchItem(item.id, "weightKg", e.target.value)}
                            className="h-7 text-xs"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Complexity</Label>
                          <Select
                            value={item.complexityLevel}
                            onValueChange={(value) => updateBatchItem(item.id, "complexityLevel", value)}
                          >
                            <SelectTrigger className="h-7 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {config?.complexityLevels.map((level) => (
                                <SelectItem key={level.value} value={level.value}>
                                  {level.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs">Firing</Label>
                          <Select
                            value={item.firingType}
                            onValueChange={(value) => updateBatchItem(item.id, "firingType", value)}
                          >
                            <SelectTrigger className="h-7 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {config?.firingTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs">Quantity</Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateBatchItem(item.id, "quantity", e.target.value)}
                            className="h-7 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {batchItems.length > 0 && (
                <Button
                  onClick={handleBatchCalculate}
                  disabled={calculating}
                  className="w-full mt-4"
                >
                  {calculating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Calculating...
                    </>
                  ) : (
                    <>
                      <Calculator className="h-4 w-4 mr-2" />
                      Calculate All ({batchItems.length} items)
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Batch Results */}
          {batchResults && (
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm">Batch Results</CardTitle>
                <CardDescription className="text-xs">
                  {batchResults.summary.successfulCalculations} of {batchResults.summary.totalItems} items calculated successfully
                </CardDescription>
              </CardHeader>
              <CardContent className="py-2">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <div className="bg-blue-50 p-3 rounded">
                    <div className="text-xs text-blue-600">Total Items</div>
                    <div className="text-lg font-bold text-blue-700">{batchResults.summary.totalItems}</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded">
                    <div className="text-xs text-green-600">Total Quantity</div>
                    <div className="text-lg font-bold text-green-700">{batchResults.summary.totalQuantity.toLocaleString()}</div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded col-span-2">
                    <div className="text-xs text-purple-600">Total Price</div>
                    <div className="text-xl font-bold text-purple-700">{formatCurrency(batchResults.summary.totalPrice)}</div>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Item</TableHead>
                      <TableHead className="text-xs">Code</TableHead>
                      <TableHead className="text-xs text-right">Qty</TableHead>
                      <TableHead className="text-xs text-right">Unit Price</TableHead>
                      <TableHead className="text-xs text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {batchResults.results.map((result: BatchResultItem, index: number) => (
                      <TableRow key={index}>
                        <TableCell className="text-xs">{result.itemName || `Item ${index + 1}`}</TableCell>
                        <TableCell className="text-xs font-mono">{result.itemCode || "-"}</TableCell>
                        {result.error ? (
                          <TableCell colSpan={3} className="text-xs text-red-600">{result.error}</TableCell>
                        ) : (
                          <>
                            <TableCell className="text-xs text-right">{result.input.quantity}</TableCell>
                            <TableCell className="text-xs text-right">{formatCurrency(result.costBreakdown.unitPrice)}</TableCell>
                            <TableCell className="text-xs text-right font-medium">{formatCurrency(result.costBreakdown.totalPrice)}</TableCell>
                          </>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}