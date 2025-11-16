"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, Download, Eye, Send } from "lucide-react";

interface Quotation {
  id: number;
  quotationNumber: string;
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

export default function RNDQuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuotations();
  }, []);

  const fetchQuotations = async () => {
    try {
      const response = await fetch("/api/rnd/quotations");
      if (response.ok) {
        const data = await response.json();
        setQuotations(data.quotations);
      }
    } catch (error) {
      console.error("Error fetching quotations:", error);
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

  const handleExport = async (quotationId: number, format: 'pdf' | 'excel') => {
    try {
      const response = await fetch("/api/rnd/exports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentType: 'quotation',
          documentId: quotationId,
          exportFormat: format,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Quotation_${quotationId}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Error exporting quotation:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading Quotations...</div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quotations</h1>
          <p className="text-muted-foreground">
            Manage quotations sent to clients
          </p>
        </div>
        <Button>
          <Send className="h-4 w-4 mr-2" />
          Create Quotation
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quotation #</TableHead>
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
              {quotations.map((quotation) => (
                <TableRow key={quotation.id}>
                  <TableCell className="font-medium">{quotation.quotationNumber}</TableCell>
                  <TableCell>{quotation.title}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{quotation.project.projectName}</div>
                      <div className="text-sm text-muted-foreground">
                        {quotation.project.client.clientDescription}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {quotation.totalAmount ? (
                      <span>${quotation.totalAmount.toLocaleString()}</span>
                    ) : (
                      <span className="text-muted-foreground">TBD</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(quotation.status) as "default" | "secondary" | "destructive" | "outline"}>
                      {quotation.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {quotation.sentDate ? new Date(quotation.sentDate).toLocaleDateString() : "-"}
                  </TableCell>
                  <TableCell>
                    {quotation.clientResponse || "Pending"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleExport(quotation.id, 'pdf')}
                      >
                        <Download className="h-4 w-4" />
                        PDF
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleExport(quotation.id, 'excel')}
                      >
                        <Download className="h-4 w-4" />
                        Excel
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {quotations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No quotations created yet
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