"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  Users,
  Package,
  CheckCircle,
  AlertCircle,
  PlayCircle,
  PauseCircle,
  Clipboard
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

export default function ProductionPage() {
  const { data: session } = useSession();
  const [stages, setStages] = useState<ProductionStage[]>([]);
  const [workPlans, setWorkPlans] = useState<WorkPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProductionData();
  }, []);

  const fetchProductionData = async () => {
    try {
      const [stagesRes, workPlansRes] = await Promise.all([
        fetch("/api/production/stages"),
        fetch("/api/production/work-plans")
      ]);

      if (stagesRes.ok) {
        const stagesData = await stagesRes.json();
        setStages(stagesData.stages || []);
      }

      if (workPlansRes.ok) {
        const workPlansData = await workPlansRes.json();
        setWorkPlans(workPlansData.workPlans || []);
      }
    } catch (error) {
      console.error("Error fetching production data:", error);
    } finally {
      setLoading(false);
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
              <div className="text-center py-8">
                <Clipboard className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No production recaps yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Production recaps will appear here once work begins.
                </p>
                {(session.user.role === "Forming" || session.user.role === "Admin") && (
                  <div className="mt-6">
                    <Button>Add Daily Recap</Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}