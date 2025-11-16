"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, Eye } from "lucide-react";

interface Sample {
  id: number;
  sampleCode: string;
  status: string;
  startDate?: string;
  completionDate?: string;
  quantity: number;
  createdAt: string;
  project: {
    projectName: string;
    client: {
      clientCode: string;
      clientDescription: string;
    };
  };
  directoryList: {
    itemName: string;
    itemCode?: string;
  };
}

export default function RNDSamplesPage() {
  const [samples, setSamples] = useState<Sample[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSamples();
  }, []);

  const fetchSamples = async () => {
    try {
      const response = await fetch("/api/rnd/samples");
      if (response.ok) {
        const data = await response.json();
        setSamples(data.samples);
      }
    } catch (error) {
      console.error("Error fetching samples:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "secondary";
      case "in_progress": return "blue";
      case "completed": return "green";
      case "rejected": return "red";
      default: return "gray";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading Samples...</div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Samples</h1>
          <p className="text-muted-foreground">
            Track sample development and production status
          </p>
        </div>
        <Button>
          <Package className="h-4 w-4 mr-2" />
          Start Sample Production
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sample Code</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Completion Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {samples.map((sample) => (
                <TableRow key={sample.id}>
                  <TableCell className="font-medium">{sample.sampleCode}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{sample.directoryList.itemName}</div>
                      <div className="text-sm text-muted-foreground">
                        {sample.directoryList.itemCode}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{sample.project.projectName}</div>
                      <div className="text-sm text-muted-foreground">
                        {sample.project.client.clientDescription}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{sample.quantity}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(sample.status) as "default" | "secondary" | "destructive" | "outline"}>
                      {sample.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {sample.startDate ? new Date(sample.startDate).toLocaleDateString() : "-"}
                  </TableCell>
                  <TableCell>
                    {sample.completionDate ? new Date(sample.completionDate).toLocaleDateString() : "-"}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {samples.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
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
}