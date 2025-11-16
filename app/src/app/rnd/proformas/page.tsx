"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Download, Eye } from "lucide-react";

interface Proforma {
  id: number;
  proformaNumber: string;
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
  creator: {
    username: string;
    email?: string;
  };
}

export default function RNDProformasPage() {
  const [proformas, setProformas] = useState<Proforma[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProformas();
  }, []);

  const fetchProformas = async () => {
    try {
      const response = await fetch("/api/rnd/proformas");
      if (response.ok) {
        const data = await response.json();
        setProformas(data.proformas);
      }
    } catch (error) {
      console.error("Error fetching proformas:", error);
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
      default: return "gray";
    }
  };

  const handleExport = async (proformaId: number, format: 'pdf' | 'excel') => {
    try {
      const response = await fetch("/api/rnd/exports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentType: 'proforma',
          documentId: proformaId,
          exportFormat: format,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Proforma_${proformaId}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Error exporting proforma:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading Proformas...</div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Proformas</h1>
          <p className="text-muted-foreground">
            Manage proforma invoices for approved projects
          </p>
        </div>
        <Button>
          <FileText className="h-4 w-4 mr-2" />
          Create Proforma
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Proforma #</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sent Date</TableHead>
                <TableHead>Response</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {proformas.map((proforma) => (
                <TableRow key={proforma.id}>
                  <TableCell className="font-medium">{proforma.proformaNumber}</TableCell>
                  <TableCell>{proforma.title}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{proforma.project.projectName}</div>
                      <div className="text-sm text-muted-foreground">
                        {proforma.project.client.clientDescription}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {proforma.totalAmount ? (
                      <span>${proforma.totalAmount.toLocaleString()}</span>
                    ) : (
                      <span className="text-muted-foreground">TBD</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(proforma.status) as "default" | "secondary" | "destructive" | "outline"}>
                      {proforma.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {proforma.sentDate ? new Date(proforma.sentDate).toLocaleDateString() : "-"}
                  </TableCell>
                  <TableCell>
                    {proforma.clientResponse || "Pending"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleExport(proforma.id, 'pdf')}
                      >
                        <Download className="h-4 w-4" />
                        PDF
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleExport(proforma.id, 'excel')}
                      >
                        <Download className="h-4 w-4" />
                        Excel
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {proformas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No proformas created yet
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