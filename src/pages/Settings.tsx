import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings as SettingsIcon, Activity, Key, Monitor } from "lucide-react";
import MapboxUsageDashboard from "@/components/MapboxUsageDashboard";
import { useMapboxContext } from "@/components/SafeMapboxProvider";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("usage");
  const [tokenInput, setTokenInput] = useState("");
  const { token, setToken } = useMapboxContext();
  const { toast } = useToast();

  const handleTokenUpdate = () => {
    if (tokenInput.trim()) {
      setToken(tokenInput.trim());
      toast({
        title: "Token Updated",
        description: "Mapbox token has been updated successfully.",
      });
      setTokenInput("");
    }
  };

  const resetUsageData = () => {
    localStorage.removeItem('mapbox_usage');
    toast({
      title: "Usage Data Reset",
      description: "Mapbox usage data has been reset.",
    });
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-primary p-2 rounded-lg">
                <SettingsIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Settings</h1>
                <p className="text-sm text-muted-foreground">Platform Configuration</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-success/10 text-success">
                System Active
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Navigation Tabs */}
          <TabsList className="grid w-full grid-cols-3 lg:w-fit lg:grid-cols-3">
            <TabsTrigger value="usage" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Usage Monitor
            </TabsTrigger>
            <TabsTrigger value="mapbox" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Mapbox Config
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              System
            </TabsTrigger>
          </TabsList>

          {/* Usage Monitor Tab */}
          <TabsContent value="usage" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-foreground">Usage Monitor</h2>
                <p className="text-muted-foreground">
                  Track your Mapbox API usage and quotas
                </p>
              </div>
            </div>
            <MapboxUsageDashboard />
          </TabsContent>

          {/* Mapbox Configuration Tab */}
          <TabsContent value="mapbox" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-foreground">Mapbox Configuration</h2>
                <p className="text-muted-foreground">
                  Manage your Mapbox token and settings
                </p>
              </div>
            </div>
            
            <div className="grid gap-6">
              {/* Current Token Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Current Token Status</CardTitle>
                  <CardDescription>
                    Your current Mapbox access token configuration
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Token Status:</span>
                    <Badge variant={token ? "default" : "destructive"}>
                      {token ? "Active" : "Not Set"}
                    </Badge>
                  </div>
                  {token && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Token Preview:</span>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {token.substring(0, 20)}...{token.substring(token.length - 10)}
                      </code>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Token Input */}
              <Card>
                <CardHeader>
                  <CardTitle>Update Token</CardTitle>
                  <CardDescription>
                    Enter a new Mapbox public token to update your configuration
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="token">Mapbox Public Token</Label>
                    <Input
                      id="token"
                      type="password"
                      value={tokenInput}
                      onChange={(e) => setTokenInput(e.target.value)}
                      placeholder="pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjbGt..."
                    />
                  </div>
                  <Button onClick={handleTokenUpdate} disabled={!tokenInput.trim()}>
                    Update Token
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-foreground">System Settings</h2>
                <p className="text-muted-foreground">
                  System management and maintenance tools
                </p>
              </div>
            </div>
            
            <div className="grid gap-6">
              {/* Usage Management */}
              <Card>
                <CardHeader>
                  <CardTitle>Usage Management</CardTitle>
                  <CardDescription>
                    Reset and manage usage tracking data
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Reset Usage Data</h4>
                    <p className="text-sm text-muted-foreground">
                      This will clear all locally stored usage data and restart tracking from zero.
                    </p>
                    <Button variant="destructive" onClick={resetUsageData}>
                      Reset Usage Data
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* System Info */}
              <Card>
                <CardHeader>
                  <CardTitle>System Information</CardTitle>
                  <CardDescription>
                    Current system status and information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Platform Version:</span>
                    <span className="text-sm font-mono">1.0.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Last Updated:</span>
                    <span className="text-sm font-mono">{new Date().toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Environment:</span>
                    <span className="text-sm font-mono">Production</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Settings;