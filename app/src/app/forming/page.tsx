"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardList, Package, Clock, CheckCircle, AlertTriangle } from "lucide-react";

export default function FormingDashboard() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const stats = {
    todayProduction: 245,
    weeklyTarget: 1200,
    efficiency: 92.5,
    qualityRate: 98.2,
    pendingTasks: 8,
    activeWorkPlans: 3,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading Forming Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Forming Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor production progress and manage forming operations
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Production</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayProduction}</div>
            <p className="text-xs text-muted-foreground">pieces completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Target</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.weeklyTarget}</div>
            <p className="text-xs text-muted-foreground">pieces planned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efficiency Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.efficiency}%</div>
            <p className="text-xs text-muted-foreground">target achievement</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quality Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.qualityRate}%</div>
            <p className="text-xs text-muted-foreground">first pass yield</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="production">Production</TabsTrigger>
          <TabsTrigger value="quality">Quality</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Today's Tasks</CardTitle>
                <CardDescription>Current work assignments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Active Work Plans</span>
                    <Badge variant="secondary">{stats.activeWorkPlans}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Pending Tasks</span>
                    <Badge variant="secondary">{stats.pendingTasks}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Completed Today</span>
                    <Badge variant="default">{stats.todayProduction}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common forming tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button className="p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors">
                    <ClipboardList className="h-5 w-5 mb-1" />
                    <div className="text-sm font-medium">View Work Plans</div>
                  </button>
                  <button className="p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors">
                    <Clock className="h-5 w-5 mb-1" />
                    <div className="text-sm font-medium">Daily Recap</div>
                  </button>
                  <button className="p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors">
                    <Package className="h-5 w-5 mb-1" />
                    <div className="text-sm font-medium">Production Log</div>
                  </button>
                  <button className="p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors">
                    <AlertTriangle className="h-5 w-5 mb-1" />
                    <div className="text-sm font-medium">Report Issue</div>
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="production" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Production Tracking</CardTitle>
              <CardDescription>Monitor forming production progress</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">Production tracking interface coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quality Control</CardTitle>
              <CardDescription>Track forming quality metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">Quality control interface coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}