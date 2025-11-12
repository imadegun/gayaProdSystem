"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Calendar,
  Clock,
  Users,
  Package,
  CheckCircle,
  AlertCircle,
  PlayCircle,
  PauseCircle,
  Clipboard,
  Plus
} from "lucide-react";

interface ProductionStage {
  id: number;
  name: string;
  code: string;
  sequenceOrder: number;
  description: string | null;
}

interface WorkPlan {
  id: number;
  weekStart: string;
  weekEnd: string;
  planType: string;
  printed: boolean;
  assignments: any[];
  creator: {
    username: string;
    role: string;
  };
}

interface ProductionRecap {
  id: number;
  recapDate: string;
  actualQuantity: number;
  goodQuantity: number | null;
  rejectQuantity: number;
  reFireQuantity: number;
  secondQualityQuantity: number;
  notes: string | null;
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
  recorder: {
    username: string;
    role: string;
  };
}

export default function ProductionPage() {
  const { data: session } = useSession();
  const [stages, setStages] = useState<ProductionStage[]>([]);
  const [workPlans, setWorkPlans] = useState<WorkPlan[]>([]);
  const [recaps, setRecaps] = useState<ProductionRecap[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRecapForm, setShowRecapForm] = useState(false);
  const [showWorkPlanForm, setShowWorkPlanForm] = useState(false);
  const [recapForm, setRecapForm] = useState({
    workPlanAssignmentId: '',
    recapDate: new Date().toISOString().split('T')[0],
    actualQuantity: '',
    goodQuantity: '',
    rejectQuantity: '',
    reFireQuantity: '',
    secondQualityQuantity: '',
    notes: ''
  });
  const [workPlanForm, setWorkPlanForm] = useState({
    weekStart: '',
    weekEnd: '',
    planType: 'production'
  });

  useEffect(() => {
    fetchProductionData();
  }, []);

  const fetchProductionData = async () => {
    try {
      const [stagesRes, workPlansRes, recapsRes] = await Promise.all([
        fetch("/api/production/stages"),
        fetch("/api/production/work-plans"),
        fetch("/api/production/recaps")
      ]);

      if (stagesRes.ok) {
        const stagesData = await stagesRes.json();
        setStages(stagesData.stages || []);
      }

      if (workPlansRes.ok) {
        const workPlansData = await workPlansRes.json();
        setWorkPlans(workPlansData.workPlans || []);
      }

      if (recapsRes.ok) {
        const recapsData = await recapsRes.json();
        setRecaps(recapsData.recaps || []);
      }
    } catch (error) {
      console.error("Error fetching production data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecapSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/production/recaps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workPlanAssignmentId: parseInt(recapForm.workPlanAssignmentId),
          recapDate: recapForm.recapDate,
          actualQuantity: parseInt(recapForm.actualQuantity),
          goodQuantity: recapForm.goodQuantity ? parseInt(recapForm.goodQuantity) : undefined,
          rejectQuantity: parseInt(recapForm.rejectQuantity) || 0,
          reFireQuantity: parseInt(recapForm.reFireQuantity) || 0,
          secondQualityQuantity: parseInt(recapForm.secondQualityQuantity) || 0,
          notes: recapForm.notes || undefined,
        }),
      });

      if (response.ok) {
        setShowRecapForm(false);
        setRecapForm({
          workPlanAssignmentId: '',
          recapDate: new Date().toISOString().split('T')[0],
          actualQuantity: '',
          goodQuantity: '',
          rejectQuantity: '',
          reFireQuantity: '',
          secondQualityQuantity: '',
          notes: ''
        });
        fetchProductionData(); // Refresh data
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error submitting recap:', error);
      alert('Error submitting production recap');
    }
  };

  const handleWorkPlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/production/work-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          weekStart: workPlanForm.weekStart,
          weekEnd: workPlanForm.weekEnd,
          planType: workPlanForm.planType,
        }),
      });

      if (response.ok) {
        setShowWorkPlanForm(false);
        setWorkPlanForm({
          weekStart: '',
          weekEnd: '',
          planType: 'production'
        });
        fetchProductionData(); // Refresh data
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating work plan:', error);
      alert('Error creating work plan');
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
          Production Management
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Monitor and manage the ceramic production workflow
        </p>
      </div>

      {/* Production Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Stages</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stages.length}</div>
            <p className="text-xs text-muted-foreground">
              Production workflow steps
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Work Plans</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workPlans.length}</div>
            <p className="text-xs text-muted-foreground">
              Active production schedules
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Production</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Units completed today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quality Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98%</div>
            <p className="text-xs text-muted-foreground">
              Average quality score
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Production Workflow */}
      <div className="space-y-6">
        {/* Production Stages Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Production Workflow Stages</CardTitle>
              <CardDescription>
                The complete ceramic production process from forming to packaging
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stages.map((stage, index) => (
                  <div key={stage.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {stage.sequenceOrder}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">
                        {stage.name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {stage.description || "No description available"}
                      </p>
                    </div>
                    <Badge variant="secondary">{stage.code}</Badge>
                    {index < stages.length - 1 && (
                      <div className="flex-shrink-0">
                        <PlayCircle className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Work Plans Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Work Plans</CardTitle>
              <CardDescription>
                Weekly production schedules and assignments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {workPlans.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No work plans</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by creating your first work plan.
                  </p>
                  <div className="mt-6">
                    <Button>Create Work Plan</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {workPlans.map((plan) => (
                    <div key={plan.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          Week of {new Date(plan.weekStart).toLocaleDateString()}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {plan.assignments.length} assignments • Created by {plan.creator.username}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={plan.planType === "production" ? "default" : "secondary"}>
                          {plan.planType}
                        </Badge>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Daily Recaps Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Daily Production Recaps</CardTitle>
              <CardDescription>
                Record and track daily production progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recaps.length === 0 ? (
                <div className="text-center py-8">
                  <Clipboard className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No production recaps yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Production recaps will appear here once work begins.
                  </p>
                  {(session.user.role === "Forming" || session.user.role === "Admin") && (
                    <div className="mt-6">
                      <Button onClick={() => setShowRecapForm(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Daily Recap
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {recaps.slice(0, 10).map((recap) => (
                    <div key={recap.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {recap.workPlanAssignment.product.collectCode}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {recap.workPlanAssignment.employee.firstName} {recap.workPlanAssignment.employee.lastName} •
                          {recap.workPlanAssignment.productionStage.name} •
                          {new Date(recap.recapDate).toLocaleDateString()}
                        </p>
                        <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                          <span>Actual: {recap.actualQuantity}</span>
                          {recap.goodQuantity && <span>Good: {recap.goodQuantity}</span>}
                          {recap.rejectQuantity > 0 && <span>Reject: {recap.rejectQuantity}</span>}
                          {recap.reFireQuantity > 0 && <span>Re-fire: {recap.reFireQuantity}</span>}
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {recap.recorder.username}
                      </Badge>
                    </div>
                  ))}
                  {(session.user.role === "Forming" || session.user.role === "Admin") && (
                    <div className="pt-4 flex space-x-2">
                      <Button onClick={() => setShowRecapForm(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Daily Recap
                      </Button>
                      <Button variant="outline" onClick={() => setShowWorkPlanForm(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Work Plan
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Daily Recap Form Modal */}
          {showRecapForm && (
            <Card>
              <CardHeader>
                <CardTitle>Add Daily Production Recap</CardTitle>
                <CardDescription>
                  Record today's production progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRecapSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="recapDate">Date</Label>
                      <Input
                        id="recapDate"
                        type="date"
                        value={recapForm.recapDate}
                        onChange={(e) => setRecapForm({...recapForm, recapDate: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="workPlanAssignmentId">Work Assignment ID</Label>
                      <Input
                        id="workPlanAssignmentId"
                        type="number"
                        placeholder="Enter assignment ID"
                        value={recapForm.workPlanAssignmentId}
                        onChange={(e) => setRecapForm({...recapForm, workPlanAssignmentId: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="actualQuantity">Actual Quantity</Label>
                      <Input
                        id="actualQuantity"
                        type="number"
                        placeholder="Units produced"
                        value={recapForm.actualQuantity}
                        onChange={(e) => setRecapForm({...recapForm, actualQuantity: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="goodQuantity">Good Quantity</Label>
                      <Input
                        id="goodQuantity"
                        type="number"
                        placeholder="Quality items"
                        value={recapForm.goodQuantity}
                        onChange={(e) => setRecapForm({...recapForm, goodQuantity: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="rejectQuantity">Reject</Label>
                      <Input
                        id="rejectQuantity"
                        type="number"
                        placeholder="0"
                        value={recapForm.rejectQuantity}
                        onChange={(e) => setRecapForm({...recapForm, rejectQuantity: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="reFireQuantity">Re-fire</Label>
                      <Input
                        id="reFireQuantity"
                        type="number"
                        placeholder="0"
                        value={recapForm.reFireQuantity}
                        onChange={(e) => setRecapForm({...recapForm, reFireQuantity: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="secondQualityQuantity">2nd Quality</Label>
                      <Input
                        id="secondQualityQuantity"
                        type="number"
                        placeholder="0"
                        value={recapForm.secondQualityQuantity}
                        onChange={(e) => setRecapForm({...recapForm, secondQualityQuantity: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <textarea
                      id="notes"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Any additional notes..."
                      value={recapForm.notes}
                      onChange={(e) => setRecapForm({...recapForm, notes: e.target.value})}
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setShowRecapForm(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      Save Recap
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Work Plan Form Modal */}
          {showWorkPlanForm && (
            <Card>
              <CardHeader>
                <CardTitle>Create Work Plan</CardTitle>
                <CardDescription>
                  Schedule production work for a specific week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleWorkPlanSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="weekStart">Week Start Date</Label>
                      <Input
                        id="weekStart"
                        type="date"
                        value={workPlanForm.weekStart}
                        onChange={(e) => setWorkPlanForm({...workPlanForm, weekStart: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="weekEnd">Week End Date</Label>
                      <Input
                        id="weekEnd"
                        type="date"
                        value={workPlanForm.weekEnd}
                        onChange={(e) => setWorkPlanForm({...workPlanForm, weekEnd: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="planType">Plan Type</Label>
                    <select
                      id="planType"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={workPlanForm.planType}
                      onChange={(e) => setWorkPlanForm({...workPlanForm, planType: e.target.value})}
                    >
                      <option value="production">Production</option>
                      <option value="overtime">Overtime</option>
                    </select>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setShowWorkPlanForm(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      Create Work Plan
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}