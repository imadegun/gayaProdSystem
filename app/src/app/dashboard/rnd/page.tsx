"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Users, FolderOpen } from "lucide-react";
import ClientOnboardingForm from "@/components/rnd/ClientOnboardingForm";
import ProjectList from "@/components/rnd/ProjectList";
import SampleDevelopmentWorkflow from "@/components/rnd/SampleDevelopmentWorkflow";

interface Client {
  id: number;
  clientCode: string;
  clientDescription: string;
  region?: string;
  department?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
}

interface RnDProject {
  id: number;
  clientId: number;
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
  directoryLists: any[];
  quotations: any[];
  samples: any[];
  proformas: any[];
}

export default function RnDDashboard() {
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<RnDProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("projects");
  const [selectedProject, setSelectedProject] = useState<RnDProject | null>(null);

  useEffect(() => {
    fetchProjects();
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
    } finally {
      setLoading(false);
    }
  };

  const handleProjectCreated = () => {
    fetchProjects();
  };

  const stats = {
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.status !== 'cancelled' && p.status !== 'client_revised').length,
    completedSamples: projects.reduce((sum, p) => sum + p.samples.filter(s => s.status === 'completed').length, 0),
    pendingQuotations: projects.reduce((sum, p) => sum + p.quotations.filter(q => q.status === 'draft').length, 0),
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
            Manage client onboarding and R&D projects
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
            <CardTitle className="text-sm font-medium">Completed Samples</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedSamples}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Quotations</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingQuotations}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="workflow">Sample Development</TabsTrigger>
          <TabsTrigger value="clients">Client Onboarding</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-4">
          <ProjectList
            projects={projects}
            onProjectUpdate={fetchProjects}
            onProjectSelect={(project) => {
              setSelectedProject(project);
              setActiveTab("workflow");
            }}
          />
        </TabsContent>

        <TabsContent value="workflow" className="space-y-4">
          {selectedProject ? (
            <SampleDevelopmentWorkflow
              project={selectedProject}
              onProjectUpdate={() => {
                fetchProjects();
                // Refresh selected project data
                const updatedProject = projects.find(p => p.id === selectedProject.id);
                if (updatedProject) {
                  setSelectedProject(updatedProject);
                }
              }}
            />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Select a project from the Projects tab to view the sample development workflow
            </div>
          )}
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <ClientOnboardingForm onClientCreated={fetchProjects} />
        </TabsContent>
      </Tabs>
    </div>
  );
}