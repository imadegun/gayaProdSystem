"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Package,
  TrendingUp,
  BarChart3
} from "lucide-react";

interface QcResult {
  id: number;
  productionRecapsId: number;
  poNumber: string | null;
  collectCode: string;
  qcStage: string;
  goodQuantity: number;
  reFireQuantity: number;
  rejectQuantity: number;
  secondQualityQuantity: number;
  qcNotes: string | null;
  inspectedAt: string;
  productionRecap: {
    workPlanAssignment: {
      employee: {
        firstName: string;
        lastName: string;
        employeeCode: string;
      };
      productionStage: {
        name: string;
      };
      product: {
        collectCode: string;
        nameCode: string;
        categoryCode: string;
      };
    };
  };
  inspector: {
    username: string;
    role: string;
  };
  stockItems: any[];
}

interface StockTotals {
  totalItems: number;
  totalQuantity: number;
  byGrade: {
    "1st": number;
    "2nd": number;
    "re-fire": number;
    "reject": number;
  };
  byStatus: {
    available: number;
    reserved: number;
    sold: number;
  };
}

export default function QcPage() {
  const { data: session } = useSession();
  const [qcResults, setQcResults] = useState<QcResult[]>([]);
  const [stockTotals, setStockTotals] = useState<StockTotals | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQcForm, setShowQcForm] = useState(false);
  const [qcForm, setQcForm] = useState({
    productionRecapsId: '',
    poNumber: '',
    collectCode: '',
    qcStage: 'loading_firing_high',
    goodQuantity: '',
    reFireQuantity: '',
    rejectQuantity: '',
    secondQualityQuantity: '',
    qcNotes: ''
  });

  useEffect(() => {
    fetchQcData();
  }, []);

  const fetchQcData = async () => {
    try {
      const [qcRes, stockRes] = await Promise.all([
        fetch("/api/qc/results"),
        fetch("/api/stock/items")
      ]);

      if (qcRes.ok) {
        const qcData = await qcRes.json();
        setQcResults(qcData.qcResults || []);
      }

      if (stockRes.ok) {
        const stockData = await stockRes.json();
        setStockTotals(stockData.totals);
      }
    } catch (error) {
      console.error("Error fetching QC data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleQcSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/qc/results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productionRecapsId: parseInt(qcForm.productionRecapsId),
          poNumber: qcForm.poNumber || undefined,
          collectCode: qcForm.collectCode,
          qcStage: qcForm.qcStage,
          goodQuantity: parseInt(qcForm.goodQuantity) || 0,
          reFireQuantity: parseInt(qcForm.reFireQuantity) || 0,
          rejectQuantity: parseInt(qcForm.rejectQuantity) || 0,
          secondQualityQuantity: parseInt(qcForm.secondQualityQuantity) || 0,
          qcNotes: qcForm.qcNotes || undefined,
        }),
      });

      if (response.ok) {
        setShowQcForm(false);
        setQcForm({
          productionRecapsId: '',
          poNumber: '',
          collectCode: '',
          qcStage: 'loading_firing_high',
          goodQuantity: '',
          reFireQuantity: '',
          rejectQuantity: '',
          secondQualityQuantity: '',
          qcNotes: ''
        });
        fetchQcData(); // Refresh data
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error submitting QC result:', error);
      alert('Error submitting QC result');
    }
  };

  if (!session) {
    return <div>Loading...</div>;
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">
          Quality Control
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Inspect and grade finished products, manage stock categorization
        </p>
      </div>

      {/* QC Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inspections</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{qcResults.length}</div>
            <p className="text-xs text-muted-foreground">
              QC results recorded
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">1st Quality Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stockTotals?.byGrade["1st"] || 0}</div>
            <p className="text-xs text-muted-foreground">
              Ready for sale
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Re-fire Items</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stockTotals?.byGrade["re-fire"] || 0}</div>
            <p className="text-xs text-muted-foreground">
              Pending re-processing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quality Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stockTotals?.totalQuantity ?
                Math.round((stockTotals.byGrade["1st"] / stockTotals.totalQuantity) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              1st quality ratio
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        {/* QC Results Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>QC Inspection Results</CardTitle>
              <CardDescription>
                Quality control inspections and grading results
              </CardDescription>
            </CardHeader>
            <CardContent>
              {qcResults.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No QC results yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    QC results will appear here once inspections are completed.
                  </p>
                  {(session.user.role === "Glaze" || session.user.role === "QC" || session.user.role === "Admin") && (
                    <div className="mt-6">
                      <Button onClick={() => setShowQcForm(true)}>
                        Record QC Inspection
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {qcResults.slice(0, 10).map((result) => (
                    <div key={result.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {result.collectCode} - {result.qcStage}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {result.productionRecap.workPlanAssignment.product.categoryCode} •
                          Inspected by {result.inspector.username} •
                          {new Date(result.inspectedAt).toLocaleDateString()}
                        </p>
                        <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center">
                            <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
                            Good: {result.goodQuantity}
                          </span>
                          {result.secondQualityQuantity > 0 && (
                            <span className="flex items-center">
                              <AlertTriangle className="w-3 h-3 mr-1 text-yellow-500" />
                              2nd: {result.secondQualityQuantity}
                            </span>
                          )}
                          {result.reFireQuantity > 0 && (
                            <span className="flex items-center">
                              <RefreshCw className="w-3 h-3 mr-1 text-blue-500" />
                              Re-fire: {result.reFireQuantity}
                            </span>
                          )}
                          {result.rejectQuantity > 0 && (
                            <span className="flex items-center">
                              <XCircle className="w-3 h-3 mr-1 text-red-500" />
                              Reject: {result.rejectQuantity}
                            </span>
                          )}
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {result.qcStage}
                      </Badge>
                    </div>
                  ))}
                  {(session.user.role === "Glaze" || session.user.role === "QC" || session.user.role === "Admin") && (
                    <div className="pt-4">
                      <Button onClick={() => setShowQcForm(true)}>
                        Record QC Inspection
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Stock Summary Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Stock Summary by Grade</CardTitle>
              <CardDescription>
                Automatic inventory categorization based on QC results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{stockTotals?.byGrade["1st"] || 0}</div>
                  <div className="text-sm text-gray-500">1st Quality</div>
                  <Badge variant="default" className="mt-1">Available</Badge>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{stockTotals?.byGrade["2nd"] || 0}</div>
                  <div className="text-sm text-gray-500">2nd Quality</div>
                  <Badge variant="secondary" className="mt-1">Discount</Badge>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{stockTotals?.byGrade["re-fire"] || 0}</div>
                  <div className="text-sm text-gray-500">Re-fire</div>
                  <Badge variant="outline" className="mt-1">Pending</Badge>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{stockTotals?.byGrade["reject"] || 0}</div>
                  <div className="text-sm text-gray-500">Rejected</div>
                  <Badge variant="destructive" className="mt-1">Unusable</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* QC Form Modal */}
        {showQcForm && (
          <Card>
            <CardHeader>
              <CardTitle>Record QC Inspection</CardTitle>
              <CardDescription>
                Grade finished products and categorize for inventory
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleQcSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="productionRecapsId">Production Recap ID</Label>
                    <Input
                      id="productionRecapsId"
                      type="number"
                      placeholder="Enter recap ID"
                      value={qcForm.productionRecapsId}
                      onChange={(e) => setQcForm({...qcForm, productionRecapsId: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="collectCode">Product Code</Label>
                    <Input
                      id="collectCode"
                      placeholder="e.g., PLT-WHT-MOD-PRC-DIN-M-GLS-001"
                      value={qcForm.collectCode}
                      onChange={(e) => setQcForm({...qcForm, collectCode: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="poNumber">PO Number (Optional)</Label>
                    <Input
                      id="poNumber"
                      placeholder="Purchase order number"
                      value={qcForm.poNumber}
                      onChange={(e) => setQcForm({...qcForm, poNumber: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="qcStage">QC Stage</Label>
                    <select
                      id="qcStage"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={qcForm.qcStage}
                      onChange={(e) => setQcForm({...qcForm, qcStage: e.target.value})}
                    >
                      <option value="loading_firing_high">Loading Firing High</option>
                      <option value="loading_firing_luster">Loading Firing Luster</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="goodQuantity">Good Quantity</Label>
                    <Input
                      id="goodQuantity"
                      type="number"
                      placeholder="1st quality items"
                      value={qcForm.goodQuantity}
                      onChange={(e) => setQcForm({...qcForm, goodQuantity: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="secondQualityQuantity">2nd Quality</Label>
                    <Input
                      id="secondQualityQuantity"
                      type="number"
                      placeholder="Discount items"
                      value={qcForm.secondQualityQuantity}
                      onChange={(e) => setQcForm({...qcForm, secondQualityQuantity: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="reFireQuantity">Re-fire Quantity</Label>
                    <Input
                      id="reFireQuantity"
                      type="number"
                      placeholder="Needs re-firing"
                      value={qcForm.reFireQuantity}
                      onChange={(e) => setQcForm({...qcForm, reFireQuantity: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="rejectQuantity">Reject Quantity</Label>
                    <Input
                      id="rejectQuantity"
                      type="number"
                      placeholder="Unusable items"
                      value={qcForm.rejectQuantity}
                      onChange={(e) => setQcForm({...qcForm, rejectQuantity: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="qcNotes">QC Notes</Label>
                  <textarea
                    id="qcNotes"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Quality inspection notes..."
                    value={qcForm.qcNotes}
                    onChange={(e) => setQcForm({...qcForm, qcNotes: e.target.value})}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowQcForm(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Save QC Result
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}