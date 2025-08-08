import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { TrendingUp, TrendingDown, ArrowUpDown, RefreshCcw } from "lucide-react";
import { demClient, type ComplementStats, type TDigestData } from "@/lib/dem-client";
import { Skeleton } from "@/components/ui/skeleton";

export default function Drivers() {
  const [complementStats, setComplementStats] = useState<ComplementStats[]>([]);
  const [tdigestData, setTDigestData] = useState<TDigestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFeature, setSelectedFeature] = useState<string>("RPM");

  const loadDriversData = async () => {
    setLoading(true);
    try {
      const projectId = "demo-project";
      
      // Load complement stats for feature influence
      const statsResponse = await demClient.getComplementStats(
        projectId,
        { timeRange: "90d" },
        "failed==1",
        ["RPM", "WOB", "ROP", "TEMP", "BIT_TYPE", "FORMATION"]
      );

      if (statsResponse.data) {
        setComplementStats(statsResponse.data);
      }

      // Load T-Digest data for selected feature
      const tdigestResponse = await demClient.getConditionalTDigest(
        projectId,
        selectedFeature,
        "failed",
        60
      );

      if (tdigestResponse.data) {
        setTDigestData(tdigestResponse.data);
      }
    } catch (error) {
      console.error("Drivers load error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDriversData();
  }, [selectedFeature]);

  const getInfluenceDirection = (delta: number) => {
    if (Math.abs(delta) < 0.1) return "neutral";
    return delta > 0 ? "increases" : "decreases";
  };

  const getInfluenceColor = (delta: number) => {
    const direction = getInfluenceDirection(delta);
    if (direction === "increases") return "text-destructive";
    if (direction === "decreases") return "text-success";
    return "text-muted-foreground";
  };

  const getInfluenceIcon = (delta: number) => {
    const direction = getInfluenceDirection(delta);
    if (direction === "increases") return TrendingUp;
    if (direction === "decreases") return TrendingDown;
    return ArrowUpDown;
  };

  // Transform T-Digest data for chart
  const chartData = tdigestData ? 
    tdigestData.failed.bins.map((bin, index) => ({
      bin,
      failed: tdigestData.failed.counts[index] || 0,
      survived: tdigestData.survived.counts[index] || 0,
    })) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-industrial">Drivers & Diagnostics</h1>
          <p className="text-muted-foreground">
            Feature influence analysis and failure pattern diagnostics
          </p>
        </div>
        
        <Button onClick={loadDriversData} disabled={loading} size="sm">
          <RefreshCcw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Analysis
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Feature Influence */}
        <div className="lg:col-span-1">
          <Card className="card-industrial">
            <CardHeader>
              <CardTitle className="text-industrial">Feature Influence</CardTitle>
              <p className="text-sm text-muted-foreground">
                Δ Mean (Failed vs Survived)
              </p>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1,2,3,4,5,6].map((i) => (
                    <div key={i} className="flex items-center justify-between">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-6 w-12" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {complementStats
                    .sort((a, b) => Math.abs(b.delta_mean) - Math.abs(a.delta_mean))
                    .map((stat) => {
                      const Icon = getInfluenceIcon(stat.delta_mean);
                      return (
                        <div
                          key={stat.feature}
                          className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors ${
                            selectedFeature === stat.feature ? 'bg-muted border-primary' : ''
                          }`}
                          onClick={() => setSelectedFeature(stat.feature)}
                        >
                          <div className="flex items-center gap-2">
                            <Icon className={`h-4 w-4 ${getInfluenceColor(stat.delta_mean)}`} />
                            <span className="font-medium">{stat.feature}</span>
                          </div>
                          <Badge variant="outline" className={getInfluenceColor(stat.delta_mean)}>
                            {stat.delta_mean > 0 ? '+' : ''}{stat.delta_mean.toFixed(1)}
                          </Badge>
                        </div>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Model Parameters */}
          <Card className="card-industrial mt-6">
            <CardHeader>
              <CardTitle className="text-industrial">Model Parameters</CardTitle>
              <p className="text-sm text-muted-foreground">
                Current Weibull fit parameters
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Shape (k)</span>
                <span className="font-mono text-sm">2.34</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Scale (λ)</span>
                <span className="font-mono text-sm">89.7</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">C-Index</span>
                <Badge variant="outline" className="status-operational">0.742</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Distribution Analysis */}
        <div className="lg:col-span-2">
          <Card className="card-industrial">
            <CardHeader>
              <CardTitle className="text-industrial">
                Distribution Analysis: {selectedFeature}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Conditional distributions for failed vs survived bits
              </p>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="skeleton-chart" />
              ) : (
                <div className="chart-container-lg">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} barGap={0}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-grid))" />
                      <XAxis 
                        dataKey="bin"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                        label={{ 
                          value: `${selectedFeature} ${selectedFeature === 'RPM' ? '(rpm)' : selectedFeature === 'TEMP' ? '(°C)' : selectedFeature === 'WOB' ? '(klbs)' : selectedFeature === 'ROP' ? '(ft/hr)' : ''}`, 
                          position: "insideBottom", 
                          offset: -5,
                          style: { textAnchor: "middle", fill: "hsl(var(--muted-foreground))" }
                        }}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                        label={{ 
                          value: "Count", 
                          angle: -90, 
                          position: "insideLeft",
                          style: { textAnchor: "middle", fill: "hsl(var(--muted-foreground))" }
                        }}
                      />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const failed = payload.find(p => p.dataKey === 'failed');
                            const survived = payload.find(p => p.dataKey === 'survived');
                            return (
                              <div className="bg-card border border-border rounded-lg p-3 shadow-md">
                                <p className="text-sm text-industrial">
                                  {selectedFeature}: <span className="font-medium">{label}</span>
                                </p>
                                <p className="text-sm text-destructive">
                                  Failed: <span className="font-medium">{failed?.value}</span>
                                </p>
                                <p className="text-sm text-success">
                                  Survived: <span className="font-medium">{survived?.value}</span>
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      
                      <Bar 
                        dataKey="survived" 
                        fill="hsl(var(--chart-tertiary))"
                        fillOpacity={0.7}
                        name="Survived"
                        radius={[2, 2, 0, 0]}
                      />
                      <Bar 
                        dataKey="failed" 
                        fill="hsl(var(--destructive))"
                        fillOpacity={0.7}
                        name="Failed"
                        radius={[2, 2, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Key Insights */}
          <Card className="card-industrial mt-6">
            <CardHeader>
              <CardTitle className="text-industrial">Key Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <h4 className="font-medium text-industrial">Risk Factors</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-destructive" />
                      <span>High RPM (&gt;180) increases failure risk by 15.3 units</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-destructive" />
                      <span>Elevated WOB (&gt;25) correlates with early failures</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-destructive" />
                      <span>High ROP may indicate aggressive drilling</span>
                    </li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium text-industrial">Optimal Ranges</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-success" />
                      <span>RPM: 140-180 rpm optimal range</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-success" />
                      <span>WOB: 18-24 klbs recommended</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-success" />
                      <span>Temperature: &lt;200°C for longevity</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}