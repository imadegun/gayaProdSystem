"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, FileText, Edit, Trash2, Image } from "lucide-react";

interface DirectoryList {
  id: number;
  itemName: string;
  itemCode?: string;
  description?: string;
  collectCode?: string;
  quantity: number;
  status: string;
  photos?: string[];
  clay?: string;
  glaze?: string;
  project: {
    projectName: string;
    client: {
      clientCode: string;
      clientDescription: string;
    };
  };
}

export default function RNDDirectoryPage() {
  const [directoryLists, setDirectoryLists] = useState<DirectoryList[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDirectoryLists();
  }, []);

  const fetchDirectoryLists = async () => {
    try {
      const response = await fetch("/api/rnd/directory");
      if (response.ok) {
        const data = await response.json();
        setDirectoryLists(data.directoryLists);
      }
    } catch (error) {
      console.error("Error fetching directory lists:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading Directory Lists...</div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Directory Lists</h1>
          <p className="text-muted-foreground">
            Manage your product directory items and specifications
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Directory Item
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item Name</TableHead>
                <TableHead>CodeClient</TableHead>
                <TableHead>Collect Code</TableHead>
                <TableHead>Photos</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Clay</TableHead>
                <TableHead>Glaze</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {directoryLists.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.itemName}</TableCell>
                  <TableCell>{item.itemCode || "-"}</TableCell>
                  <TableCell>{item.collectCode || "-"}</TableCell>
                  <TableCell>
                    {item.photos && item.photos.length > 0 ? (
                      <div className="flex gap-1">
                        {item.photos.slice(0, 3).map((photo: string, index: number) => (
                          <img
                            key={index}
                            src={photo}
                            alt={`Photo ${index + 1}`}
                            className="w-8 h-8 object-cover rounded border"
                          />
                        ))}
                        {item.photos.length > 3 && (
                          <span className="text-xs text-muted-foreground">+{item.photos.length - 3}</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.clay || "-"}</TableCell>
                  <TableCell>{item.glaze || "-"}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{item.project.projectName}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.project.client.clientDescription}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.status === "approved" ? "default" : "secondary"}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {directoryLists.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
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
}