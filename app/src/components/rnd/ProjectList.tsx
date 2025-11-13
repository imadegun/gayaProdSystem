"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FolderOpen, Calendar, Play, Plus } from "lucide-react";
import { format } from "date-fns";

interface Client {
  id: number;
  clientCode: string;
  clientDescription: string;
  region?: string;
  department?: string;
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
}

interface ProjectListProps {
  projects: RnDProject[];
  onProjectUpdate: () => void;
  onProjectSelect?: (project: RnDProject) => void;
}

export default function ProjectList({ projects, onProjectUpdate, onProjectSelect }: ProjectListProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [projectForm, setProjectForm] = useState({
    clientId: "",
    projectName: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await fetch("/api/rnd/clients");
      if (response.ok) {
        const data = await response.json();
        setClients(data.clients);
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/rnd/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientId: parseInt(projectForm.clientId),
          projectName: projectForm.projectName,
          description: projectForm.description,
        }),
      });

      if (response.ok) {
        setIsCreateDialogOpen(false);
        setProjectForm({ clientId: "", projectName: "", description: "" });
        onProjectUpdate();
      } else {
        const error = await response.json();
        alert(`Error creating project: ${error.error}`);
      }
    } catch (error) {
      console.error("Error creating project:", error);
      alert("Error creating project");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "draft": return "secondary";
      case "development": return "default";
      case "review": return "outline";
      case "approved": return "default";
      case "rejected": return "destructive";
      default: return "secondary";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">R&D Projects</h2>
          <p className="text-muted-foreground">
            Manage R&D projects and sample development workflow
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New R&D Project</DialogTitle>
              <DialogDescription>
                Create a new R&D project for sample development
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <Label htmlFor="clientId">Client</Label>
                <Select value={projectForm.clientId} onValueChange={(value: string) => setProjectForm({...projectForm, clientId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id.toString()}>
                        {client.clientDescription} ({client.clientCode})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="projectName">Project Name</Label>
                <Input
                  id="projectName"
                  value={projectForm.projectName}
                  onChange={(e) => setProjectForm({...projectForm, projectName: e.target.value})}
                  placeholder="Enter project name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({...projectForm, description: e.target.value})}
                  placeholder="Enter project description"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Project"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Projects ({projects.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No R&D projects found. Create your first project to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">
                      {project.projectName}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{project.client.clientDescription}</div>
                        <div className="text-sm text-muted-foreground">{project.client.clientCode}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(project.status)}>
                        {project.workflowStep || project.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(project.createdAt), "MMM dd, yyyy")}
                      </div>
                    </TableCell>
                    <TableCell>
                      {onProjectSelect && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onProjectSelect(project)}
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Manage
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}