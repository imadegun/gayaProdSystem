"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LogOut,
  User,
  Home,
  Package,
  FileText,
  Calculator,
  DollarSign,
  Download,
  Users,
  Settings,
  Wifi,
  WifiOff
} from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSocket } from "@/hooks/useSocket";
import { useState } from "react";

const navigation = [
  { name: "Dashboard", href: "/rnd", icon: Home, roles: ["R&D", "Admin"] },
  { name: "Projects", href: "/rnd/projects", icon: Package, roles: ["R&D", "Admin"] },
  { name: "Directory Lists", href: "/rnd/directory", icon: FileText, roles: ["R&D", "Admin"] },
  { name: "Estimates", href: "/rnd/estimates", icon: Calculator, roles: ["R&D", "Admin"] },
  { name: "Quotations", href: "/rnd/quotations", icon: DollarSign, roles: ["R&D", "Admin"] },
  { name: "Proformas", href: "/rnd/proformas", icon: FileText, roles: ["R&D", "Admin"] },
  { name: "Samples", href: "/rnd/samples", icon: Package, roles: ["R&D", "Admin"] },
  { name: "Clients", href: "/rnd/clients", icon: Users, roles: ["R&D", "Admin"] },
  { name: "Settings", href: "/rnd/settings", icon: Settings, roles: ["R&D", "Admin"] },
];

export default function RNDLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isConnected, setIsConnected] = useState(false);

  // Mock real-time connection status (would be replaced with actual socket status)
  useEffect(() => {
    setIsConnected(true);
  }, []);

  useEffect(() => {
    if (status === "loading") return; // Still loading
    if (!session) router.push("/auth/signin");
    if (session && session.user.role !== "R&D" && session.user.role !== "Admin") {
      router.push("/auth/signin");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!session || (session.user.role !== "R&D" && session.user.role !== "Admin")) {
    return null;
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: "/auth/signin" });
  };

  const filteredNavigation = navigation.filter(item =>
    item.roles.includes("all") || item.roles.includes(session.user.role)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-blue-600 shadow-lg">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 border-b border-blue-500">
            <h1 className="text-xl font-bold text-white">R&D Portal</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {filteredNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? "bg-blue-700 text-white border-r-2 border-white"
                      : "text-blue-100 hover:bg-blue-700 hover:text-white"
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User info */}
          <div className="p-4 border-t border-blue-500">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {session.user.username}
                </p>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="text-xs bg-blue-500 text-white">
                    {session.user.role}
                  </Badge>
                  <div className="flex items-center space-x-1">
                    {isConnected ? (
                      <Wifi className="h-3 w-3 text-green-300" />
                    ) : (
                      <WifiOff className="h-3 w-3 text-red-300" />
                    )}
                    <span className="text-xs text-blue-200">
                      {isConnected ? "Live" : "Offline"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="w-full mt-3 justify-start text-white hover:bg-blue-700"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}