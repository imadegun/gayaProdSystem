"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WorkPlanCalendar from "@/components/WorkPlanCalendar";
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
  assignments?: WorkPlanAssignment[];
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

interface WorkPlanAssignment {
  id: number;
  employeeId: number;
  productionStageId: number;
  collectCode: string;
  plannedQuantity: number;
  targetQuantity?: number;
  processName?: string;
  dayOfWeek: number;
  isOvertime: boolean;
  notes?: string;
  employee: {
    firstName: string;
    lastName: string;
    employeeCode: string;
  };
  productionStage: {
    name: string;
    code: string;
  };
  product: {
    collectCode: string;
    nameCode: string;
    categoryCode: string;
  };
}

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  employeeCode: string;
  department?: string;
}

export default function ProductionPage() {
  const { data: session } = useSession();
  const [stages, setStages] = useState<ProductionStage[]>([]);
  const [workPlans, setWorkPlans] = useState<WorkPlan[]>([]);
  const [assignments, setAssignments] = useState<WorkPlanAssignment[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [recaps, setRecaps] = useState<ProductionRecap[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRecapForm, setShowRecapForm] = useState(false);
  const [showWorkPlanForm, setShowWorkPlanForm] = useState(false);
  const [selectedWorkPlan, setSelectedWorkPlan] = useState<WorkPlan | null>(null);
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
      const [stagesRes, workPlansRes, recapsRes, employeesRes] = await Promise.all([
        fetch("/api/production/stages"),
        fetch("/api/production/work-plans"),
        fetch("/api/production/recaps"),
        fetch("/api/employees") // Assuming we have an employees API
      ]);

      if (stagesRes.ok) {
        const stagesData = await stagesRes.json();
        setStages(stagesData.stages || []);
      }

      if (workPlansRes.ok) {
        const workPlansData = await workPlansRes.json();
        setWorkPlans(workPlansData.workPlans || []);
        // Set the first work plan as selected by default
        if (workPlansData.workPlans && workPlansData.workPlans.length > 0) {
          setSelectedWorkPlan(workPlansData.workPlans[0]);
          fetchAssignmentsForWorkPlan(workPlansData.workPlans[0].id);
        }
      }

      if (recapsRes.ok) {
        const recapsData = await recapsRes.json();
        setRecaps(recapsData.recaps || []);
      }

      if (employeesRes.ok) {
        const employeesData = await employeesRes.json();
        setEmployees(employeesData.employees || []);
      }
    } catch (error) {
      console.error("Error fetching production data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignmentsForWorkPlan = async (workPlanId: number) => {
    try {
      const response = await fetch(`/api/production/work-plans/${workPlanId}/assignments`);
      if (response.ok) {
        const data = await response.json();
        setAssignments(data.assignments || []);
      }
    } catch (error) {
      console.error("Error fetching assignments:", error);
    }
  };

  const handleAssignmentUpdate = async (assignmentId: number, updates: Partial<WorkPlanAssignment>) => {
    try {
      const response = await fetch(`/api/production/work-plans/assignments/${assignmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        // Update local state
        setAssignments(prev =>
          prev.map(assignment =>
            assignment.id === assignmentId
              ? { ...assignment, ...updates }
              : assignment
          )
        );
      } else {
        const error = await response.json();
        alert(`Error updating assignment: ${error.error}`);
      }
    } catch (error) {
      console.error('Error updating assignment:', error);
      alert('Error updating assignment');
    }
  };

  const handleAssignmentCreate = async (assignment: Omit<WorkPlanAssignment, 'id'>) => {
    if (!selectedWorkPlan) return;

    try {
      const response = await fetch(`/api/production/work-plans/${selectedWorkPlan.id}/assignments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assignment),
      });

      if (response.ok) {
        const data = await response.json();
        setAssignments(prev => [...prev, data.assignment]);
      } else {
        const error = await response.json();
        alert(`Error creating assignment: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
      alert('Error creating assignment');
    }
  };

  const handleAssignmentDelete = async (assignmentId: number) => {
    try {
      const response = await fetch(`/api/production/work-plans/assignments/${assignmentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setAssignments(prev => prev.filter(assignment => assignment.id !== assignmentId));
      } else {
        const error = await response.json();
        alert(`Error deleting assignment: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting assignment:', error);
      alert('Error deleting assignment');
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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
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
                    <Button onClick={() => setShowWorkPlanForm(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Work Plan
                    </Button>
                  </div>
                </div>
              ) : (
                <Tabs defaultValue="list" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="list">List View</TabsTrigger>
                    <TabsTrigger value="calendar">Calendar View</TabsTrigger>
                  </TabsList>

                  <TabsContent value="list" className="space-y-4">
                    {workPlans.map((plan) => (
                      <div key={plan.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">
                            Week of {new Date(plan.weekStart).toLocaleDateString()}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {plan.assignments?.length || 0} assignments • Created by {plan.creator.username}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={plan.planType === "production" ? "default" : "secondary"}>
                            {plan.planType}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedWorkPlan(plan);
                              fetchAssignmentsForWorkPlan(plan.id);
                            }}
                          >
                            View Calendar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="calendar" className="space-y-4">
                    {selectedWorkPlan ? (
                      <WorkPlanCalendar
                        workPlanId={selectedWorkPlan.id}
                        weekStart={new Date(selectedWorkPlan.weekStart)}
                        weekEnd={new Date(selectedWorkPlan.weekEnd)}
                        assignments={assignments}
                        employees={employees}
                        onAssignmentUpdate={handleAssignmentUpdate}
                        onAssignmentCreate={handleAssignmentCreate}
                        onAssignmentDelete={handleAssignmentDelete}
                      />
                    ) : (
                      <div className="text-center py-8">
                        <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Select a work plan</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Choose a work plan from the list view to see the calendar.
                        </p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
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