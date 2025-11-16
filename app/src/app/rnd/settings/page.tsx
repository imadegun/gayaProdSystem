"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Settings, User, Mail, Save } from "lucide-react";

interface UserSettings {
  id: number;
  username: string;
  email?: string;
  role: string;
  subRole?: string;
  isActive: boolean;
  createdAt: string;
}

interface SystemSettings {
  currencies: Array<{
    id: number;
    code: string;
    name: string;
    symbol: string;
    exchangeRate: number;
    isBase: boolean;
    isActive: boolean;
  }>;
}

export default function RNDSettingsPage() {
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    subRole: "",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/rnd/settings");
      if (response.ok) {
        const data = await response.json();
        setUserSettings(data.user);
        setSystemSettings(data.system);
        setFormData({
          email: data.user.email || "",
          subRole: data.user.subRole || "",
        });
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/rnd/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setUserSettings(data.user);
        alert("Settings saved successfully!");
      } else {
        alert("Failed to save settings");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("An error occurred while saving");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading Settings...</div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center space-x-2">
        <Settings className="h-8 w-8" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">R&D Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and system preferences
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* User Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>User Settings</span>
            </CardTitle>
            <CardDescription>
              Update your personal information and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={userSettings?.username || ""}
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your.email@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subRole">Sub Role</Label>
              <Input
                id="subRole"
                value={formData.subRole}
                onChange={(e) => setFormData({ ...formData, subRole: e.target.value })}
                placeholder="e.g., Senior R&D Engineer"
              />
            </div>

            <div className="space-y-2">
              <Label>Role & Status</Label>
              <div className="flex items-center space-x-2">
                <Badge variant="default">{userSettings?.role}</Badge>
                <Badge variant={userSettings?.isActive ? "default" : "secondary"}>
                  {userSettings?.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card>
          <CardHeader>
            <CardTitle>System Settings</CardTitle>
            <CardDescription>
              View system configuration and available currencies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Available Currencies</Label>
                <div className="mt-2 space-y-2">
                  {systemSettings?.currencies.map((currency) => (
                    <div key={currency.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{currency.code}</span>
                        <span className="text-sm text-muted-foreground">({currency.symbol})</span>
                        <span className="text-sm">{currency.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {currency.isBase && <Badge variant="default">Base</Badge>}
                        <span className="text-sm text-muted-foreground">
                          {currency.exchangeRate}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}