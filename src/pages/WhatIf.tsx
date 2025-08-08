import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SurvivalChart } from "@/components/SurvivalChart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { Calculator, RotateCcw, TrendingUp, TrendingDown } from "lucide-react";
import { demClient, type PredictionData, type SurvivalData } from "@/lib/dem-client";
import { useToast } from "@/hooks/use-toast";

interface Scenario {
  name: string;
  parameters: {
    RPM: number;
    WOB: number;
    ROP: number;
    TEMP: number;
    BIT_TYPE: string;
    BIT_SIZE: string;
    FORMATION: string;
  };
}

const defaultScenario: Scenario = {
  name: "Baseline",
  parameters: {
    RPM: 160,
    WOB: 22,
    ROP: 40,
    TEMP: 180,
    BIT_TYPE: "PDC",
    BIT_SIZE: "8.5",
    FORMATION: "Shale"
  }
};

export default function WhatIf() {
  const [currentScenario, setCurrentScenario] = useState<Scenario>(defaultScenario);
  const [baselineData, setBaselineData] = useState<SurvivalData | null>(null);
  const [predictionData, setPredictionData] = useState<PredictionData | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadBaseline = async () => {
    try {
      const projectId = "demo-project";
      const response = await demClient.aggregateData(
        projectId,
        { timeRange: "90d" },
        ["survival", "hazard"],
        [10, 50, 100, 150]
      );
      
      if (response.data) {
        setBaselineData(response.data);
      }
    } catch (error) {
      console.error("Baseline load error:", error);
    }
  };

  const runPrediction = async () => {
    setLoading(true);
    try {
      const projectId = "demo-project";
      
      // In a real implementation, this would use a trained model ID
      const mockModelId = "weibull-model-001";
      
      const response = await demClient.predictSurvival(
        projectId,
        mockModelId,
        currentScenario.parameters,
        [10, 50, 100, 150]
      );

      if (response.data) {
        setPredictionData(response.data);
        toast({
          title: "Prediction Updated",
          description: "Survival curve updated for new parameters",
        });
      } else if (response.error) {
        toast({
          title: "Prediction Error",
          description: response.error,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Prediction error:", error);
      toast({
        title: "Prediction Failed",
        description: "Unable to generate prediction",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBaseline();
  }, []);

  useEffect(() => {
    // Debounced prediction update
    const timer = setTimeout(() => {
      runPrediction();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [currentScenario.parameters]);

  const updateParameter = (param: string, value: any) => {
    setCurrentScenario(prev => ({
      ...prev,
      parameters: { ...prev.parameters, [param]: value }
    }));
  };

  const resetToDefaults = () => {
    setCurrentScenario(defaultScenario);
  };

  // Calculate survival at horizons and differences
  const horizonData = [
    { horizon: "10h", baseline: baselineData?.percentiles.p10 ? 0.98 : 0, predicted: predictionData?.atHorizons["10"] || 0 },
    { horizon: "50h", baseline: baselineData?.percentiles.p50 ? 0.88 : 0, predicted: predictionData?.atHorizons["50"] || 0 },
    { horizon: "100h", baseline: baselineData?.percentiles.p90 ? 0.73 : 0, predicted: predictionData?.atHorizons["100"] || 0 },
    { horizon: "150h", baseline: 0.62, predicted: predictionData?.atHorizons["150"] || 0 }
  ].map(item => ({
    ...item,
    delta: item.predicted - item.baseline,
    deltaPercent: ((item.predicted - item.baseline) / item.baseline * 100)
  }));

  // Prepare chart data
  const survivalChartData = [];
  if (baselineData) {
    survivalChartData.push({
      km: baselineData.km,
      hazard: baselineData.hazard
    });
  }
  if (predictionData) {
    survivalChartData.push({
      km: { t: predictionData.t, s: predictionData.s },
      hazard: { t: [], h: [] } // Mock hazard for predicted
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-industrial">What-If Simulator</h1>
          <p className="text-muted-foreground">
            Predict bit survival under different operating conditions
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button onClick={resetToDefaults} variant="outline" size="sm">
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Badge variant="outline" className={loading ? "status-warning" : "status-operational"}>
            {loading ? "Computing..." : "Ready"}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Parameter Controls */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="card-industrial">
            <CardHeader>
              <CardTitle className="text-industrial flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Operating Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* RPM */}
              <div className="space-y-3">
                <Label>RPM: {currentScenario.parameters.RPM} rpm</Label>
                <Slider
                  value={[currentScenario.parameters.RPM]}
                  onValueChange={([value]) => updateParameter('RPM', value)}
                  min={80}
                  max={250}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>80</span>
                  <span>250</span>
                </div>
              </div>

              {/* WOB */}
              <div className="space-y-3">
                <Label>WOB: {currentScenario.parameters.WOB} klbs</Label>
                <Slider
                  value={[currentScenario.parameters.WOB]}
                  onValueChange={([value]) => updateParameter('WOB', value)}
                  min={10}
                  max={40}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>10</span>
                  <span>40</span>
                </div>
              </div>

              {/* ROP */}
              <div className="space-y-3">
                <Label>ROP: {currentScenario.parameters.ROP} ft/hr</Label>
                <Slider
                  value={[currentScenario.parameters.ROP]}
                  onValueChange={([value]) => updateParameter('ROP', value)}
                  min={15}
                  max={80}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>15</span>
                  <span>80</span>
                </div>
              </div>

              {/* Temperature */}
              <div className="space-y-3">
                <Label>Temperature: {currentScenario.parameters.TEMP}°C</Label>
                <Slider
                  value={[currentScenario.parameters.TEMP]}
                  onValueChange={([value]) => updateParameter('TEMP', value)}
                  min={120}
                  max={300}
                  step={10}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>120</span>
                  <span>300</span>
                </div>
              </div>

              {/* Bit Type */}
              <div className="space-y-2">
                <Label>Bit Type</Label>
                <Select 
                  value={currentScenario.parameters.BIT_TYPE}
                  onValueChange={(value) => updateParameter('BIT_TYPE', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PDC">PDC</SelectItem>
                    <SelectItem value="Roller">Roller</SelectItem>
                    <SelectItem value="Diamond">Diamond</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Formation */}
              <div className="space-y-2">
                <Label>Formation</Label>
                <Select 
                  value={currentScenario.parameters.FORMATION}
                  onValueChange={(value) => updateParameter('FORMATION', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sandstone">Sandstone</SelectItem>
                    <SelectItem value="Shale">Shale</SelectItem>
                    <SelectItem value="Limestone">Limestone</SelectItem>
                    <SelectItem value="Granite">Granite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Predictions */}
        <div className="lg:col-span-3 space-y-6">
          {/* Survival Comparison Chart */}
          <SurvivalChart
            data={survivalChartData}
            loading={loading}
            type="survival"
            cohortNames={["Baseline", "Predicted"]}
          />

          {/* Horizon Predictions */}
          <Card className="card-industrial">
            <CardHeader>
              <CardTitle className="text-industrial">Survival at Key Horizons</CardTitle>
              <p className="text-sm text-muted-foreground">
                Predicted vs baseline survival probabilities
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {horizonData.map((item) => (
                  <div key={item.horizon} className="card-metric">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-label">{item.horizon}</span>
                      {item.delta !== 0 && (
                        <Badge variant="outline" className={item.delta > 0 ? "text-success" : "text-destructive"}>
                          {item.delta > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                          {item.delta > 0 ? '+' : ''}{item.deltaPercent.toFixed(1)}%
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Baseline:</span>
                        <span className="font-medium">{(item.baseline * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Predicted:</span>
                        <span className="font-medium">{(item.predicted * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Scenario Summary */}
          <Card className="card-industrial">
            <CardHeader>
              <CardTitle className="text-industrial">Scenario Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                {Object.entries(currentScenario.parameters).map(([key, value]) => (
                  <div key={key} className="space-y-1">
                    <p className="text-label">{key.replace('_', ' ')}</p>
                    <p className="font-medium">
                      {value}
                      {key === 'RPM' && ' rpm'}
                      {key === 'WOB' && ' klbs'}  
                      {key === 'ROP' && ' ft/hr'}
                      {key === 'TEMP' && '°C'}
                      {key === 'BIT_SIZE' && '"'}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}