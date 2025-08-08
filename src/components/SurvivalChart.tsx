import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

interface SurvivalData {
  km: { t: number[]; s: number[] };
  hazard: { t: number[]; h: number[] };
}

interface SurvivalChartProps {
  data?: SurvivalData[];
  loading?: boolean;
  type?: "survival" | "hazard";
  cohortNames?: string[];
}

const CustomTooltip = ({ active, payload, label, type }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-md">
        <p className="text-sm text-industrial">
          Time: <span className="font-medium">{label} hours</span>
        </p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: <span className="font-medium">
              {type === "survival" 
                ? `${(entry.value * 100).toFixed(1)}%`
                : entry.value.toFixed(4)
              }
            </span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function SurvivalChart({ data, loading, type = "survival", cohortNames }: SurvivalChartProps) {
  if (loading) {
    return (
      <Card className="card-industrial">
        <CardHeader>
          <CardTitle className="text-industrial">
            {type === "survival" ? "Kaplan-Meier Survival Curve" : "Hazard Rate"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="skeleton-chart" />
        </CardContent>
      </Card>
    );
  }

  // Transform data for recharts
  const chartData = data?.[0] ? 
    data[0][type === "survival" ? "km" : "hazard"].t.map((time, index) => {
      const point: any = { time };
      
      data.forEach((cohortData, cohortIndex) => {
        const values = cohortData[type === "survival" ? "km" : "hazard"];
        const cohortName = cohortNames?.[cohortIndex] || `Cohort ${cohortIndex + 1}`;
        point[cohortName] = values[type === "survival" ? "s" : "h"][index];
      });
      
      return point;
    }) : [];

  const colors = ["hsl(var(--chart-primary))", "hsl(var(--chart-secondary))", "hsl(var(--chart-tertiary))"];

  return (
    <Card className="card-industrial">
      <CardHeader>
        <CardTitle className="text-industrial">
          {type === "survival" ? "Kaplan-Meier Survival Curve" : "Hazard Rate"}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {type === "survival" 
            ? "Probability of bit survival over time" 
            : "Instantaneous failure rate over time"
          }
        </p>
      </CardHeader>
      <CardContent>
        <div className="chart-container-lg">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-grid))" />
              <XAxis 
                dataKey="time" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                label={{ value: "Time (hours)", position: "insideBottom", offset: -5, style: { textAnchor: "middle", fill: "hsl(var(--muted-foreground))" } }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                label={{ 
                  value: type === "survival" ? "Survival Probability" : "Hazard Rate", 
                  angle: -90, 
                  position: "insideLeft",
                  style: { textAnchor: "middle", fill: "hsl(var(--muted-foreground))" }
                }}
                domain={type === "survival" ? [0, 1] : [0, "dataMax"]}
              />
              <Tooltip content={<CustomTooltip type={type} />} />
              <Legend />
              
              {data?.map((_, index) => {
                const cohortName = cohortNames?.[index] || `Cohort ${index + 1}`;
                return (
                  <Line
                    key={cohortName}
                    type="monotone"
                    dataKey={cohortName}
                    stroke={colors[index % colors.length]}
                    strokeWidth={2}
                    dot={{ fill: colors[index % colors.length], strokeWidth: 2, r: 3 }}
                    activeDot={{ r: 5, fill: colors[index % colors.length] }}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}