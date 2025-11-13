"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Send, CheckCircle, XCircle, Clock, FileText, Package, Eye } from "lucide-react";
import { format } from "date-fns";

interface RnDProject {
  id: number;
  projectName: string;
  description?: string;
  status: string;
  workflowStep?: string;
  client: {
    clientCode: string;
    clientDescription: string;
  };
  directoryLists: DirectoryList[];
  quotations: Quotation[];
  samples: Sample[];
  proformas: Proforma[];
}

interface DirectoryList {
  id: number;
  itemName: string;
  description?: string;
  collectCode?: string;
  quantity: number;
  status: string;
  clay?: string;
  glaze?: string;
  texture?: string;
  engobe?: string;
  firingType?: string;
  luster?: string;
  dimensions?: any;
  weight?: number;
  notes?: string;
}

interface Quotation {
  id: number;
  quotationNumber: string;
  title: string;
  status: string;
  sentDate?: string;
  responseDate?: string;
  clientResponse?: string;
  totalAmount?: number;
}

interface Sample {
  id: number;
  sampleCode: string;
  status: string;
  startDate?: string;
  completionDate?: string;
  quantity: number;
  directoryList: {
    itemName: string;
  };
}

interface Proforma {
  id: number;
  proformaNumber: string;
  title: string;
  status: string;
  totalAmount?: number;
  sentDate?: string;
  responseDate?: string;
  clientResponse?: string;
}

interface SampleDevelopmentWorkflowProps {
  project: RnDProject;
  onProjectUpdate: () => void;
}

export default function SampleDevelopmentWorkflow({ project, onProjectUpdate }: SampleDevelopmentWorkflowProps) {
  const [activeTab, setActiveTab] = useState("directory");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"directory" | "quotation" | "sample" | "proforma">("directory");
  const [formData, setFormData] = useState<any>({});

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft": return "secondary";
      case "draft_directory": return "secondary";
      case "quotation_sent": return "blue";
      case "quotation_approved": return "green";
      case "sample_development": return "yellow";
      case "sample_completed": return "green";
      case "proforma_created": return "blue";
      case "client_approved": return "green";
      case "client_revised": return "orange";
      case "cancelled": return "red";
      default: return "gray";
    }
  };

  const handleWorkflowAction = async (action: string, data?: any) => {
    try {
      const response = await fetch("/api/rnd/workflow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId: project.id,
          action,
          data,
        }),
      });

      if (response.ok) {
        onProjectUpdate();
        setIsCreateDialogOpen(false);
        setFormData({});
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error performing workflow action:", error);
      alert("An error occurred while performing the action");
    }
  };

  const renderDirectoryList = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Directory List</h3>
        <Dialog open={isCreateDialogOpen && dialogType === "directory"} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setDialogType("directory"); setIsCreateDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Directory Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Directory Item</DialogTitle>
              <DialogDescription>
                Create a new item for the sample directory list
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="itemName">Item Name</Label>
                  <Input
                    id="itemName"
                    value={formData.itemName || ""}
                    onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="collectCode">Collect Code</Label>
                  <Input
                    id="collectCode"
                    value={formData.collectCode || ""}
                    onChange={(e) => setFormData({ ...formData, collectCode: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={formData.quantity || 1}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="clay">Clay</Label>
                  <Input
                    id="clay"
                    value={formData.clay || ""}
                    onChange={(e) => setFormData({ ...formData, clay: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="glaze">Glaze</Label>
                  <Input
                    id="glaze"
                    value={formData.glaze || ""}
                    onChange={(e) => setFormData({ ...formData, glaze: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => handleWorkflowAction("create_directory", { items: [formData] })}>
                Create Item
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item Name</TableHead>
                <TableHead>Collect Code</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Clay</TableHead>
                <TableHead>Glaze</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {project.directoryLists.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.itemName}</TableCell>
                  <TableCell>{item.collectCode || "-"}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.clay || "-"}</TableCell>
                  <TableCell>{item.glaze || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={item.status === "approved" ? "default" : "secondary"}>
                      {item.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {project.directoryLists.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No directory items created yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderQuotations = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Quotations</h3>
        {project.directoryLists.length > 0 && (
          <Button onClick={() => handleWorkflowAction("send_quotation", {
            directoryListId: project.directoryLists[0]?.id,
            title: `Quotation for ${project.projectName}`,
          })}>
            <Send className="h-4 w-4 mr-2" />
            Send Quotation
          </Button>
        )}
      </div>

      <div className="grid gap-4">
        {project.quotations.map((quotation) => (
          <Card key={quotation.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base">{quotation.title}</CardTitle>
                  <CardDescription>{quotation.quotationNumber}</CardDescription>
                </div>
                <Badge variant={quotation.status === "approved" ? "default" : "secondary"}>
                  {quotation.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Sent:</span> {quotation.sentDate ? format(new Date(quotation.sentDate), "PPP") : "Not sent"}
                </div>
                <div>
                  <span className="font-medium">Response:</span> {quotation.responseDate ? format(new Date(quotation.responseDate), "PPP") : "Pending"}
                </div>
                <div>
                  <span className="font-medium">Client Response:</span> {quotation.clientResponse || "Pending"}
                </div>
                <div>
                  <span className="font-medium">Amount:</span> ${quotation.totalAmount?.toLocaleString() || "0"}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {project.quotations.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No quotations sent yet
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );

  const renderSamples = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Samples</h3>
        {project.status === "quotation_approved" && (
          <Button onClick={() => handleWorkflowAction("start_samples", {
            directoryListIds: project.directoryLists.map(d => d.id),
          })}>
            <Package className="h-4 w-4 mr-2" />
            Start Sample Creation
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sample Code</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Completion Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {project.samples.map((sample) => (
                <TableRow key={sample.id}>
                  <TableCell className="font-medium">{sample.sampleCode}</TableCell>
                  <TableCell>{sample.directoryList.itemName}</TableCell>
                  <TableCell>{sample.quantity}</TableCell>
                  <TableCell>
                    <Badge variant={sample.status === "completed" ? "default" : "secondary"}>
                      {sample.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {sample.startDate ? format(new Date(sample.startDate), "PPP") : "-"}
                  </TableCell>
                  <TableCell>
                    {sample.completionDate ? format(new Date(sample.completionDate), "PPP") : "-"}
                  </TableCell>
                </TableRow>
              ))}
              {project.samples.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No samples created yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderProformas = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Proformas</h3>
        {project.status === "sample_completed" && (
          <Button onClick={() => handleWorkflowAction("create_proforma")}>
            <FileText className="h-4 w-4 mr-2" />
            Create Proforma
          </Button>
        )}
      </div>

      <div className="grid gap-4">
        {project.proformas.map((proforma) => (
          <Card key={proforma.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base">{proforma.title}</CardTitle>
                  <CardDescription>{proforma.proformaNumber}</CardDescription>
                </div>
                <Badge variant={proforma.status === "approved" ? "default" : "secondary"}>
                  {proforma.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Sent:</span> {proforma.sentDate ? format(new Date(proforma.sentDate), "PPP") : "Not sent"}
                </div>
                <div>
                  <span className="font-medium">Response:</span> {proforma.responseDate ? format(new Date(proforma.responseDate), "PPP") : "Pending"}
                </div>
                <div>
                  <span className="font-medium">Client Response:</span> {proforma.clientResponse || "Pending"}
                </div>
                <div>
                  <span className="font-medium">Amount:</span> ${proforma.totalAmount?.toLocaleString() || "0"}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {project.proformas.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No proformas created yet
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Project Status Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{project.projectName}</CardTitle>
              <CardDescription>
                Client: {project.client.clientDescription} ({project.client.clientCode})
              </CardDescription>
            </div>
            <Badge variant={getStatusColor(project.status) as any}>
              {project.workflowStep || project.status}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Workflow Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="directory">Directory List</TabsTrigger>
          <TabsTrigger value="quotations">Quotations</TabsTrigger>
          <TabsTrigger value="samples">Samples</TabsTrigger>
          <TabsTrigger value="proformas">Proformas</TabsTrigger>
        </TabsList>

        <TabsContent value="directory" className="space-y-4">
          {renderDirectoryList()}
        </TabsContent>

        <TabsContent value="quotations" className="space-y-4">
          {renderQuotations()}
        </TabsContent>

        <TabsContent value="samples" className="space-y-4">
          {renderSamples()}
        </TabsContent>

        <TabsContent value="proformas" className="space-y-4">
          {renderProformas()}
        </TabsContent>
      </Tabs>
    </div>
  );
}