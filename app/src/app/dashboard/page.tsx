"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LogOut, User, Settings, Wifi, WifiOff } from "lucide-react";
import { useSocket } from "@/hooks/useSocket";

export default function Dashboard() {
  const { data: session } = useSession();
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  const {
    onProductionUpdate,
    onQcUpdate,
    onStockUpdate
  } = useSocket();

  useEffect(() => {
    // Set up real-time listeners
    onProductionUpdate((data) => {
      setLastUpdate(`Production update: ${data.message || 'Data changed'}`);
      setIsConnected(true);
    });

    onQcUpdate((data) => {
      setLastUpdate(`QC update: ${data.message || 'Quality check completed'}`);
      setIsConnected(true);
    });

    onStockUpdate((data) => {
      setLastUpdate(`Stock update: ${data.message || 'Inventory changed'}`);
      setIsConnected(true);
    });

    // Simulate connection status (in real app, check socket connection)
    setIsConnected(true);
  }, [onProductionUpdate, onQcUpdate, onStockUpdate]);

  if (!session) {
    return <div>Loading...</div>;
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: "/auth/signin" });
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">
          Dashboard
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Welcome back, {session.user.username}! Here's your production overview.
        </p>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Welcome to gayaProdSystem
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Ceramic Production Management Dashboard
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Productions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Currently in progress
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Today's Recap
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Completed today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Awaiting production
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Quality Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Active notifications
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Role-specific content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common tasks for your role
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {session.user.role === "Forming" && (
                  <>
                    <Button className="w-full justify-start" variant="outline">
                      Daily Production Recap
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      View Work Plans
                    </Button>
                  </>
                )}
                {session.user.role === "QC" && (
                  <>
                    <Button className="w-full justify-start" variant="outline">
                      QC Results Entry
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      Stock Management
                    </Button>
                  </>
                )}
                {session.user.role === "Sales" && (
                  <>
                    <Button className="w-full justify-start" variant="outline">
                      New Purchase Order
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      View Stock Availability
                    </Button>
                  </>
                )}
                {session.user.role === "R&D" && (
                  <>
                    <Button className="w-full justify-start" variant="outline">
                      Sample Development
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      Directory Management
                    </Button>
                  </>
                )}
                {(session.user.role === "Glaze" || session.user.role === "QC") && (
                  <>
                    <Button className="w-full justify-start" variant="outline" onClick={() => window.location.href = '/dashboard/qc'}>
                      Quality Control
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      Stock Management
                    </Button>
                  </>
                )}
                <Button className="w-full justify-start" variant="outline" onClick={() => window.location.href = '/dashboard/production'}>
                  View Production Tracking
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Real-Time Activity</CardTitle>
                <CardDescription>
                  Live system updates and notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {lastUpdate && (
                    <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <p className="text-sm text-blue-700">
                        {lastUpdate}
                      </p>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <p className="text-sm text-gray-600">
                      System initialized successfully
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <p className="text-sm text-gray-600">
                      User authentication configured
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <p className="text-sm text-gray-600">
                      Database migration pending
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <p className="text-sm text-gray-600">
                      Real-time infrastructure active
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}