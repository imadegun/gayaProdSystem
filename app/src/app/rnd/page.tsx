"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Users, FolderOpen, FileText, Calculator, DollarSign, Package } from "lucide-react";

interface Client {
  id: number;
  clientCode: string;
  clientDescription: string;
  region?: string;
  department?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
}

interface RnDProject {
  id: number;
  clientId: string;
  projectName: string;
  description?: string;
  status: string;
  workflowStep?: string;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  client: {
    clientCode: string;
    clientDescription: string;
    region?: string;
    department?: string;
  };
  creator: {
    username: string;
    email?: string;
  };
  directoryLists?: any[];
  quotations?: any[];
  samples?: any[];
  proformas?: any[];
}

export default function RNDDashboard() {
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<RnDProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchProjects();
    fetchClients();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/rnd/projects");
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await fetch("/api/rnd/clients");
      if (response.ok) {
        const data = await response.json();
        setClients(data.clients);
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.status !== 'cancelled' && p.status !== 'client_revised').length,
    totalClients: clients.length,
    activeClients: clients.filter(c => c.isActive).length,
    completedSamples: projects.reduce((sum, p) => sum + (p.samples || []).filter(s => s.status === 'completed').length, 0),
    pendingQuotations: projects.reduce((sum, p) => sum + (p.quotations || []).filter(q => q.status === 'draft').length, 0),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading R&D Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">R&D Dashboard</h1>
          <p className="text-muted-foreground">
            Manage client onboarding, projects, and sample development
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeProjects}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeClients}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Samples</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedSamples}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">Recent Projects</TabsTrigger>
          <TabsTrigger value="clients">Recent Clients</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common R&D tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button className="p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors">
                    <Plus className="h-5 w-5 mb-1" />
                    <div className="text-sm font-medium">New Project</div>
                  </button>
                  <button className="p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors">
                    <Users className="h-5 w-5 mb-1" />
                    <div className="text-sm font-medium">Add Client</div>
                  </button>
                  <button className="p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors">
                    <FileText className="h-5 w-5 mb-1" />
                    <div className="text-sm font-medium">Directory List</div>
                  </button>
                  <button className="p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors">
                    <Calculator className="h-5 w-5 mb-1" />
                    <div className="text-sm font-medium">Create Estimate</div>
                  </button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Workflow Status</CardTitle>
                <CardDescription>Current project statuses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Draft Projects</span>
                    <Badge variant="secondary">
                      {projects.filter(p => p.status === 'draft').length}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">In Development</span>
                    <Badge variant="secondary">
                      {projects.filter(p => p.status === 'sample_development').length}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Awaiting Approval</span>
                    <Badge variant="secondary">
                      {projects.filter(p => p.status === 'quotation_sent').length}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Completed</span>
                    <Badge variant="secondary">
                      {projects.filter(p => p.status === 'completed').length}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Projects</CardTitle>
              <CardDescription>Your latest R&D projects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projects.slice(0, 5).map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{project.projectName}</h4>
                      <p className="text-sm text-muted-foreground">
                        {project.client.clientDescription} • {project.creator.username}
                      </p>
                    </div>
                    <Badge variant={project.status === "completed" ? "default" : "secondary"}>
                      {project.status}
                    </Badge>
                  </div>
                ))}
                {projects.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No projects yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Clients</CardTitle>
              <CardDescription>Your client relationships</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {clients.slice(0, 5).map((client) => (
                  <div key={client.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{client.clientDescription}</h4>
                      <p className="text-sm text-muted-foreground">
                        {client.clientCode} • {client.region || 'No region'}
                      </p>
                    </div>
                    <Badge variant={client.isActive ? "default" : "secondary"}>
                      {client.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                ))}
                {clients.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No clients yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}