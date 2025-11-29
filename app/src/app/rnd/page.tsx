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
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">R&D Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Manage client onboarding, projects, and sample development
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
            <CardTitle className="text-xs font-medium">Total Projects</CardTitle>
            <FolderOpen className="h-3.5 w-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-3 px-4">
            <div className="text-xl font-bold">{stats.totalProjects}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
            <CardTitle className="text-xs font-medium">Active Projects</CardTitle>
            <FolderOpen className="h-3.5 w-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-3 px-4">
            <div className="text-xl font-bold">{stats.activeProjects}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
            <CardTitle className="text-xs font-medium">Active Clients</CardTitle>
            <Users className="h-3.5 w-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-3 px-4">
            <div className="text-xl font-bold">{stats.activeClients}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
            <CardTitle className="text-xs font-medium">Completed Samples</CardTitle>
            <Package className="h-3.5 w-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-3 px-4">
            <div className="text-xl font-bold">{stats.completedSamples}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3">
        <TabsList className="h-9">
          <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
          <TabsTrigger value="projects" className="text-xs">Recent Projects</TabsTrigger>
          <TabsTrigger value="clients" className="text-xs">Recent Clients</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-3 mt-3">
          <div className="grid gap-3 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-2 pt-3 px-4">
                <CardTitle className="text-sm">Quick Actions</CardTitle>
                <CardDescription className="text-xs">Common R&D tasks</CardDescription>
              </CardHeader>
              <CardContent className="px-4 pb-3">
                <div className="grid grid-cols-2 gap-2">
                  <button className="p-2 text-left border rounded-lg hover:bg-gray-50 transition-colors">
                    <Plus className="h-4 w-4 mb-0.5" />
                    <div className="text-xs font-medium">New Project</div>
                  </button>
                  <button className="p-2 text-left border rounded-lg hover:bg-gray-50 transition-colors">
                    <Users className="h-4 w-4 mb-0.5" />
                    <div className="text-xs font-medium">Add Client</div>
                  </button>
                  <button className="p-2 text-left border rounded-lg hover:bg-gray-50 transition-colors">
                    <FileText className="h-4 w-4 mb-0.5" />
                    <div className="text-xs font-medium">Directory List</div>
                  </button>
                  <button className="p-2 text-left border rounded-lg hover:bg-gray-50 transition-colors">
                    <Calculator className="h-4 w-4 mb-0.5" />
                    <div className="text-xs font-medium">Create Estimate</div>
                  </button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2 pt-3 px-4">
                <CardTitle className="text-sm">Workflow Status</CardTitle>
                <CardDescription className="text-xs">Current project statuses</CardDescription>
              </CardHeader>
              <CardContent className="px-4 pb-3">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs">Draft Projects</span>
                    <Badge variant="secondary" className="text-xs py-0 px-1.5">
                      {projects.filter(p => p.status === 'draft').length}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs">In Development</span>
                    <Badge variant="secondary" className="text-xs py-0 px-1.5">
                      {projects.filter(p => p.status === 'sample_development').length}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs">Awaiting Approval</span>
                    <Badge variant="secondary" className="text-xs py-0 px-1.5">
                      {projects.filter(p => p.status === 'quotation_sent').length}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs">Completed</span>
                    <Badge variant="secondary" className="text-xs py-0 px-1.5">
                      {projects.filter(p => p.status === 'completed').length}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-3 mt-3">
          <Card>
            <CardHeader className="pb-2 pt-3 px-4">
              <CardTitle className="text-sm">Recent Projects</CardTitle>
              <CardDescription className="text-xs">Your latest R&D projects</CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <div className="space-y-2">
                {projects.slice(0, 5).map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-2 border rounded-lg">
                    <div>
                      <h4 className="text-sm font-medium">{project.projectName}</h4>
                      <p className="text-xs text-muted-foreground">
                        {project.client.clientDescription} • {project.creator.username}
                      </p>
                    </div>
                    <Badge variant={project.status === "completed" ? "default" : "secondary"} className="text-xs py-0 px-1.5">
                      {project.status}
                    </Badge>
                  </div>
                ))}
                {projects.length === 0 && (
                  <p className="text-center text-muted-foreground text-sm py-6">No projects yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="space-y-3 mt-3">
          <Card>
            <CardHeader className="pb-2 pt-3 px-4">
              <CardTitle className="text-sm">Recent Clients</CardTitle>
              <CardDescription className="text-xs">Your client relationships</CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <div className="space-y-2">
                {clients.slice(0, 5).map((client) => (
                  <div key={client.id} className="flex items-center justify-between p-2 border rounded-lg">
                    <div>
                      <h4 className="text-sm font-medium">{client.clientDescription}</h4>
                      <p className="text-xs text-muted-foreground">
                        {client.clientCode} • {client.region || 'No region'}
                      </p>
                    </div>
                    <Badge variant={client.isActive ? "default" : "secondary"} className="text-xs py-0 px-1.5">
                      {client.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                ))}
                {clients.length === 0 && (
                  <p className="text-center text-muted-foreground text-sm py-6">No clients yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}