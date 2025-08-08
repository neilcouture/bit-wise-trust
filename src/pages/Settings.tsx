import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Settings as SettingsIcon, Database, Shield, Bell, Zap, TestTube } from "lucide-react";
import { demClient } from "@/lib/dem-client";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const [demConfig, setDemConfig] = useState({
    baseUrl: "https://api.nextmatrix.demo",
    region: "us-west-2", 
    accessKey: "",
    secretKey: "",
    projectId: "demo-project"
  });
  const [testing, setTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "testing">("disconnected");
  const { toast } = useToast();

  const testConnection = async () => {
    setTesting(true);
    setConnectionStatus("testing");
    
    try {
      // Update client config
      demClient.updateConfig(demConfig);
      
      // Test connection with a simple API call
      const response = await demClient.getFederationPeers(demConfig.projectId);
      
      if (response.data || !response.error) {
        setConnectionStatus("connected");
        toast({
          title: "Connection Successful",
          description: "Successfully connected to NeXTMatrix DEM",
        });
      } else {
        setConnectionStatus("disconnected");
        toast({
          title: "Connection Failed", 
          description: response.error || "Unable to connect to DEM",
          variant: "destructive"
        });
      }
    } catch (error) {
      setConnectionStatus("disconnected");
      toast({
        title: "Connection Error",
        description: "Unable to test connection",
        variant: "destructive"
      });
    } finally {
      setTesting(false);
    }
  };

  const updateConfig = (key: string, value: string) => {
    setDemConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-industrial">Settings</h1>
        <p className="text-muted-foreground">
          Configure NeXTMatrix connection and application preferences
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* DEM Configuration */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="card-industrial">
            <CardHeader>
              <CardTitle className="text-industrial flex items-center gap-2">
                <Database className="h-5 w-5" />
                NeXTMatrix DEM Configuration
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge 
                  variant="outline" 
                  className={
                    connectionStatus === "connected" ? "status-operational" :
                    connectionStatus === "testing" ? "status-warning" : 
                    "status-warning"
                  }
                >
                  {connectionStatus === "connected" ? "Connected" :
                   connectionStatus === "testing" ? "Testing..." :
                   "Disconnected"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="base-url">Base URL</Label>
                  <Input
                    id="base-url"
                    placeholder="https://api.nextmatrix.com"
                    value={demConfig.baseUrl}
                    onChange={(e) => updateConfig('baseUrl', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region">AWS Region</Label>
                  <Select value={demConfig.region} onValueChange={(value) => updateConfig('region', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="us-east-1">us-east-1</SelectItem>
                      <SelectItem value="us-west-2">us-west-2</SelectItem>
                      <SelectItem value="eu-west-1">eu-west-1</SelectItem>
                      <SelectItem value="ap-southeast-1">ap-southeast-1</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="project-id">Project ID</Label>
                <Input
                  id="project-id"
                  placeholder="your-project-id"
                  value={demConfig.projectId}
                  onChange={(e) => updateConfig('projectId', e.target.value)}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="access-key">Access Key ID</Label>
                  <Input
                    id="access-key"
                    type="password"
                    placeholder="AKIA..."
                    value={demConfig.accessKey}
                    onChange={(e) => updateConfig('accessKey', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secret-key">Secret Access Key</Label>
                  <Input
                    id="secret-key"
                    type="password" 
                    placeholder="••••••••"
                    value={demConfig.secretKey}
                    onChange={(e) => updateConfig('secretKey', e.target.value)}
                  />
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Connection Status</p>
                  <p className="text-xs text-muted-foreground">
                    Test your DEM connection with current credentials
                  </p>
                </div>
                <Button 
                  onClick={testConnection}
                  disabled={testing || !demConfig.accessKey || !demConfig.secretKey}
                  size="sm"
                >
                  <TestTube className="w-4 h-4 mr-2" />
                  {testing ? "Testing..." : "Test Connection"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Security */}
          <Card className="card-industrial">
            <CardHeader>
              <CardTitle className="text-industrial flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">k-Anonymity Threshold</p>
                  <p className="text-xs text-muted-foreground">
                    Minimum group size for data privacy (recommended: ≥10)
                  </p>
                </div>
                <Select defaultValue="10">
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Federated Analysis</p>
                  <p className="text-xs text-muted-foreground">
                    Enable cross-peer data aggregation
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Auto Data Masking</p>
                  <p className="text-xs text-muted-foreground">
                    Automatically suppress low-count bins
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Analysis Preferences */}
          <Card className="card-industrial">
            <CardHeader>
              <CardTitle className="text-industrial flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Analysis Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Default Time Bucket</Label>
                  <Select defaultValue="hours">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hours">Hours</SelectItem>
                      <SelectItem value="footage">Footage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Default Model Type</Label>
                  <Select defaultValue="km">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="km">Kaplan-Meier</SelectItem>
                      <SelectItem value="weibull">Weibull</SelectItem>
                      <SelectItem value="cox">Cox Hazard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Auto-refresh Dashboard</p>
                  <p className="text-xs text-muted-foreground">
                    Automatically refresh data every 5 minutes
                  </p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Cache Predictions</p>
                  <p className="text-xs text-muted-foreground">
                    Cache what-if predictions for faster response
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Info & Notifications */}
        <div className="space-y-6">
          <Card className="card-industrial">
            <CardHeader>
              <CardTitle className="text-industrial">System Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Version:</span>
                <span className="font-medium">1.0.0</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Environment:</span>
                <Badge variant="outline">Production</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">API Status:</span>
                <Badge className="status-operational">Operational</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Last Updated:</span>
                <span className="font-medium">2 min ago</span>
              </div>
            </CardContent>
          </Card>

          <Card className="card-industrial">
            <CardHeader>
              <CardTitle className="text-industrial flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Analysis Complete</p>
                  <p className="text-xs text-muted-foreground">
                    Notify when analysis finishes
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Data Quality Alerts</p>
                  <p className="text-xs text-muted-foreground">
                    Alert on data quality issues
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Weekly Reports</p>
                  <p className="text-xs text-muted-foreground">
                    Automated weekly summaries
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          <Card className="card-industrial">
            <CardHeader>
              <CardTitle className="text-industrial">Support</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <SettingsIcon className="w-4 h-4 mr-2" />
                Documentation
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Database className="w-4 h-4 mr-2" />
                API Reference
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Shield className="w-4 h-4 mr-2" />
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}