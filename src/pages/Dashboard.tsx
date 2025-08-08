import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { RefreshCcw, Calendar, Filter, Eye } from "lucide-react";
import { KpiCards } from "@/components/KpiCards";
import { SurvivalChart } from "@/components/SurvivalChart";
import { demClient, type SurvivalData } from "@/lib/dem-client";
import { useToast } from "@/hooks/use-toast";

interface DashboardData {
  kpis: {
    medianLife: number;
    p10Life: number;
    p90Life: number;
    mtbf: number;
    censored: number;
    cohortSize: number;
  };
  survivalData: SurvivalData;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("90d");
  const [bucket, setBucket] = useState("hours");
  const [modelType, setModelType] = useState("km");
  const { toast } = useToast();

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Simulate project ID - in real app this would come from context/config
      const projectId = "demo-project";
      
      const response = await demClient.aggregateData(
        projectId,
        { timeRange, bucket }, // cohort
        ["survival", "hazard", "percentiles", "counts"],
        [10, 50, 100, 150]
      );

      if (response.data) {
        const survivalData = response.data;
        setData({
          kpis: {
            medianLife: survivalData.percentiles.p50,
            p10Life: survivalData.percentiles.p10,
            p90Life: survivalData.percentiles.p90,
            mtbf: survivalData.percentiles.p50 * 1.2, // Approximation
            censored: survivalData.censored,
            cohortSize: survivalData.n
          },
          survivalData
        });
      } else if (response.error) {
        toast({
          title: "Data Load Error",
          description: response.error,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Dashboard load error:", error);
      toast({
        title: "Connection Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [timeRange, bucket, modelType]);

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-industrial">Oil Bit Survival Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time survival analysis powered by NeXTMatrix federated analytics
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30d">Last 30d</SelectItem>
              <SelectItem value="90d">Last 90d</SelectItem>
              <SelectItem value="180d">Last 180d</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>

          <Select value={bucket} onValueChange={setBucket}>
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hours">Hours</SelectItem>
              <SelectItem value="footage">Footage</SelectItem>
            </SelectContent>
          </Select>

          <Select value={modelType} onValueChange={setModelType}>
            <SelectTrigger className="w-32">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="km">Kaplan-Meier</SelectItem>
              <SelectItem value="weibull">Weibull</SelectItem>
              <SelectItem value="cox">Cox Hazard</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={loadDashboardData} disabled={loading} size="sm">
            <RefreshCcw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Status badges */}
      <div className="flex items-center space-x-3">
        <Badge variant="outline" className="status-operational">
          <Eye className="mr-1 h-3 w-3" />
          DEM Connected
        </Badge>
        <Badge variant="outline">
          {data ? data.kpis.cohortSize : 0} runs in cohort
        </Badge>
        <Badge variant="outline">
          Privacy: k-anonymity ≥ 10
        </Badge>
      </div>

      {/* KPI Cards */}
      <KpiCards data={data?.kpis} loading={loading} />

      {/* Main Charts */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <SurvivalChart
          data={data ? [data.survivalData] : undefined}
          loading={loading}
          type="survival"
          cohortNames={["Current Cohort"]}
        />
        
        <SurvivalChart
          data={data ? [data.survivalData] : undefined}
          loading={loading}
          type="hazard"
          cohortNames={["Current Cohort"]}
        />
      </div>

      {/* Cohort Summary */}
      <Card className="card-industrial">
        <CardHeader>
          <CardTitle className="text-industrial">Current Cohort</CardTitle>
          <p className="text-sm text-muted-foreground">
            Active filtering criteria and data summary
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <p className="text-label">Time Range</p>
              <p className="text-sm font-medium">{timeRange === "90d" ? "Last 90 days" : timeRange}</p>
            </div>
            <div className="space-y-2">
              <p className="text-label">Bucket Type</p>
              <p className="text-sm font-medium capitalize">{bucket}</p>
            </div>
            <div className="space-y-2">
              <p className="text-label">Model</p>
              <p className="text-sm font-medium">{modelType.toUpperCase()}</p>
            </div>
            <div className="space-y-2">
              <p className="text-label">Status</p>
              <p className="text-sm font-medium text-success">Active</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}