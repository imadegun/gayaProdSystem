"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calculator, FileText, Download, Eye } from "lucide-react";

interface Estimate {
  id: number;
  estimateNumber: string;
  title: string;
  description?: string;
  totalAmount?: number;
  status: string;
  sentDate?: string;
  responseDate?: string;
  clientResponse?: string;
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
  currency?: {
    code: string;
    symbol: string;
  };
  creator: {
    username: string;
  };
}

export default function RNDEstimatesPage() {
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEstimates();
  }, []);

  const fetchEstimates = async () => {
    try {
      const response = await fetch("/api/rnd/estimates");
      if (response.ok) {
        const data = await response.json();
        setEstimates(data.estimates);
      }
    } catch (error) {
      console.error("Error fetching estimates:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft": return "secondary";
      case "sent": return "blue";
      case "approved": return "green";
      case "rejected": return "red";
      case "revised": return "orange";
      default: return "gray";
    }
  };

  const handleExport = async (estimateId: number, format: 'pdf' | 'excel') => {
    try {
      const response = await fetch("/api/rnd/exports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentType: 'estimate',
          documentId: estimateId,
          exportFormat: format,
        }),
      });

      if (response.ok) {
        // Trigger download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Estimate_${estimateId}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Error exporting estimate:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading Estimates...</div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Estimates</h1>
          <p className="text-muted-foreground">
            Manage cost estimates for your R&D projects
          </p>
        </div>
        <Button>
          <Calculator className="h-4 w-4 mr-2" />
          Create Estimate
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Estimate #</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {estimates.map((estimate) => (
                <TableRow key={estimate.id}>
                  <TableCell className="font-medium">{estimate.estimateNumber}</TableCell>
                  <TableCell>{estimate.title}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{estimate.project.projectName}</div>
                      <div className="text-sm text-muted-foreground">
                        {estimate.project.client.clientDescription}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{estimate.directoryList.itemName}</div>
                      <div className="text-sm text-muted-foreground">
                        {estimate.directoryList.itemCode}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {estimate.totalAmount ? (
                      <span>
                        {estimate.currency?.symbol || '$'}{estimate.totalAmount.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">TBD</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(estimate.status) as "default" | "secondary" | "destructive" | "outline"}>
                      {estimate.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(estimate.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleExport(estimate.id, 'pdf')}
                      >
                        <Download className="h-4 w-4" />
                        PDF
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleExport(estimate.id, 'excel')}
                      >
                        <Download className="h-4 w-4" />
                        Excel
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {estimates.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No estimates created yet
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