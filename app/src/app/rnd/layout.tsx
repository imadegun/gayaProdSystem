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
  Settings2,
  Wifi,
  WifiOff,
  ChevronDown,
  ChevronRight,
  Palette,
  Layers,
  Wrench
} from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSocket } from "@/hooks/useSocket";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

const navigation = [
  { name: "Dashboard", href: "/rnd", icon: Home, roles: ["R&D", "Admin"] },
  // { name: "Settings", href: "/rnd/settings", icon: Settings, roles: ["R&D", "Admin"] },
];

const settingnav = [ 
  { name: "Settings", href: "/rnd/settings", icon: Settings, roles: ["R&D", "Admin"] },
];

const purchasingGroup = [
  { name: "Estimates", href: "/rnd/estimates", icon: Calculator, roles: ["R&D", "Admin"] },
  { name: "Quotations", href: "/rnd/quotations", icon: DollarSign, roles: ["R&D", "Admin"] },
  { name: "Proformas", href: "/rnd/proformas", icon: FileText, roles: ["R&D", "Admin"] },
];

const pricingGroup = [
  { name: "Calculator", href: "/rnd/pricing-calculator", icon: Calculator, roles: ["R&D", "Admin", "Sales"] },
  { name: "Pricing Settings", href: "/rnd/pricing-settings", icon: Settings2, roles: ["R&D", "Admin"] },
];

const rndGroup = [
  { name: "Projects", href: "/rnd/projects", icon: Package, roles: ["R&D", "Admin"] },
  { name: "DL", href: "/rnd/directory", icon: FileText, roles: ["R&D", "Admin"] },
  { name: "Samples", href: "/rnd/samples", icon: Package, roles: ["R&D", "Admin"] },
];

const manageMaterials = [
  { name: "Casting", href: "/rnd/materials/casting", icon: Package, roles: ["R&D", "Admin"] },
  { name: "Clay", href: "/rnd/materials/clay", icon: Package, roles: ["R&D", "Admin"] },
  { name: "Engobe", href: "/rnd/materials/engobe", icon: Package, roles: ["R&D", "Admin"] },
  { name: "Extruder", href: "/rnd/materials/extruder", icon: Package, roles: ["R&D", "Admin"] },
  { name: "Glaze", href: "/rnd/materials/glaze", icon: Package, roles: ["R&D", "Admin"] },
  { name: "Lustre", href: "/rnd/materials/lustre", icon: Package, roles: ["R&D", "Admin"] },
  { name: "Stain Oxide", href: "/rnd/materials/stainoxide", icon: Package, roles: ["R&D", "Admin"] },
  { name: "Texture", href: "/rnd/materials/texture", icon: Package, roles: ["R&D", "Admin"] },
  { name: "Tools", href: "/rnd/materials/tools", icon: Wrench, roles: ["R&D", "Admin"] },
];

const masterCollections = [
  { name: "Client", href: "/rnd/clients", icon: Users, roles: ["R&D", "Admin"] },
  { name: "Category", href: "/rnd/collections/category", icon: Layers, roles: ["R&D", "Admin"] },
  { name: "Color", href: "/rnd/collections/color", icon: Palette, roles: ["R&D", "Admin"] },
  { name: "Material", href: "/rnd/collections/material", icon: Package, roles: ["R&D", "Admin"] },
  { name: "Size", href: "/rnd/collections/size", icon: Package, roles: ["R&D", "Admin"] },
  { name: "Texture", href: "/rnd/collections/texture", icon: Package, roles: ["R&D", "Admin"] },
];



export default function RNDLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isConnected] = useState(true); // Mock connection status - would be replaced with actual socket status
  const [materialsExpanded, setMaterialsExpanded] = useState(false);
  const [collectionsExpanded, setCollectionsExpanded] = useState(false);
  const [purchasingExpanded, setPurchasingExpanded] = useState(false);
  const [pricingExpanded, setPricingExpanded] = useState(false);
  const [rndExpanded, setRndExpanded] = useState(false);

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

   const filteredSettingNavigation = settingnav.filter(item =>
    item.roles.includes("all") || item.roles.includes(session.user.role)
  );
 

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-blue-600 shadow-lg">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-blue-500 flex-shrink-0">
            <h1 className="text-xl font-bold text-white">R&D</h1>
            <ThemeToggle />
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-blue-700">
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

            {/* R&D Group */}
            <div className="pt-4">
              <button
                onClick={() => setRndExpanded(!rndExpanded)}
                className="flex items-center w-full px-4 py-2 text-sm font-medium text-blue-100 hover:bg-blue-700 hover:text-white rounded-md transition-colors"
              >
                {rndExpanded ? (
                  <ChevronDown className="mr-3 h-5 w-5" />
                ) : (
                  <ChevronRight className="mr-3 h-5 w-5" />
                )}
                R&D
              </button>
              {rndExpanded && (
                <div className="ml-4 mt-2 space-y-1">
                  {rndGroup
                    .filter(item => item.roles.includes("all") || item.roles.includes(session.user.role))
                    .map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                            isActive
                              ? "bg-blue-700 text-white border-r-2 border-white"
                              : "text-blue-200 hover:bg-blue-700 hover:text-white"
                          }`}
                        >
                          <item.icon className="mr-3 h-4 w-4" />
                          {item.name}
                        </Link>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Purchasing Group */}
            <div className="pt-4">
              <button
                onClick={() => setPurchasingExpanded(!purchasingExpanded)}
                className="flex items-center w-full px-4 py-2 text-sm font-medium text-blue-100 hover:bg-blue-700 hover:text-white rounded-md transition-colors"
              >
                {purchasingExpanded ? (
                  <ChevronDown className="mr-3 h-5 w-5" />
                ) : (
                  <ChevronRight className="mr-3 h-5 w-5" />
                )}
                Sales Administration
              </button>
              {purchasingExpanded && (
                <div className="ml-4 mt-2 space-y-1">
                  {purchasingGroup
                    .filter(item => item.roles.includes("all") || item.roles.includes(session.user.role))
                    .map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                            isActive
                              ? "bg-blue-700 text-white border-r-2 border-white"
                              : "text-blue-200 hover:bg-blue-700 hover:text-white"
                          }`}
                        >
                          <item.icon className="mr-3 h-4 w-4" />
                          {item.name}
                        </Link>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Pricing Group */}
            <div className="pt-4">
              <button
                onClick={() => setPricingExpanded(!pricingExpanded)}
                className="flex items-center w-full px-4 py-2 text-sm font-medium text-blue-100 hover:bg-blue-700 hover:text-white rounded-md transition-colors"
              >
                {pricingExpanded ? (
                  <ChevronDown className="mr-3 h-5 w-5" />
                ) : (
                  <ChevronRight className="mr-3 h-5 w-5" />
                )}
                Pricing Widget
              </button>
              {pricingExpanded && (
                <div className="ml-4 mt-2 space-y-1">
                  {pricingGroup
                    .filter(item => item.roles.includes("all") || item.roles.includes(session.user.role))
                    .map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                            isActive
                              ? "bg-blue-700 text-white border-r-2 border-white"
                              : "text-blue-200 hover:bg-blue-700 hover:text-white"
                          }`}
                        >
                          <item.icon className="mr-3 h-4 w-4" />
                          {item.name}
                        </Link>
                      );
                    })}
                </div>
              )}
            </div>



            {/* Manage Materials Group */}
            <div className="pt-4">
              <button
                onClick={() => setMaterialsExpanded(!materialsExpanded)}
                className="flex items-center w-full px-4 py-2 text-sm font-medium text-blue-100 hover:bg-blue-700 hover:text-white rounded-md transition-colors"
              >
                {materialsExpanded ? (
                  <ChevronDown className="mr-3 h-5 w-5" />
                ) : (
                  <ChevronRight className="mr-3 h-5 w-5" />
                )}
                Manage Materials
              </button>
              {materialsExpanded && (
                <div className="ml-4 mt-2 space-y-1">
                  {manageMaterials
                    .filter(item => item.roles.includes("all") || item.roles.includes(session.user.role))
                    .map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                            isActive
                              ? "bg-blue-700 text-white border-r-2 border-white"
                              : "text-blue-200 hover:bg-blue-700 hover:text-white"
                          }`}
                        >
                          <item.icon className="mr-3 h-4 w-4" />
                          {item.name}
                        </Link>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Master Collections Group */}
            <div className="pt-4">
              <button
                onClick={() => setCollectionsExpanded(!collectionsExpanded)}
                className="flex items-center w-full px-4 py-2 text-sm font-medium text-blue-100 hover:bg-blue-700 hover:text-white rounded-md transition-colors"
              >
                {collectionsExpanded ? (
                  <ChevronDown className="mr-3 h-5 w-5" />
                ) : (
                  <ChevronRight className="mr-3 h-5 w-5" />
                )}
                Master Collections
              </button>
              {collectionsExpanded && (
                <div className="ml-4 mt-2 space-y-1">
                  {masterCollections
                    .filter(item => item.roles.includes("all") || item.roles.includes(session.user.role))
                    .map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                            isActive
                              ? "bg-blue-700 text-white border-r-2 border-white"
                              : "text-blue-200 hover:bg-blue-700 hover:text-white"
                          }`}
                        >
                          <item.icon className="mr-3 h-4 w-4" />
                          {item.name}
                        </Link>
                      );
                    })}
                </div>
              )}
            </div>
            
            {/* Settings Navigation */}
             {filteredSettingNavigation.map((item) => {
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
          <div className="p-4 border-t border-blue-500 flex-shrink-0">
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
        <main className="min-h-screen bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}