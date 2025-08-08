import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, TrendingUp, AlertTriangle, Users, Activity, Shield } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface KpiData {
  medianLife: number;
  p10Life: number;
  p90Life: number;
  mtbf: number;
  censored: number;
  cohortSize: number;
}

interface KpiCardsProps {
  data?: KpiData;
  loading?: boolean;
}

const KpiCard = ({ 
  title, 
  value, 
  unit, 
  icon: Icon, 
  trend, 
  loading 
}: {
  title: string;
  value: string | number;
  unit: string;
  icon: any;
  trend?: "up" | "down" | "neutral";
  loading?: boolean;
}) => (
  <Card className="card-metric">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-label">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="skeleton-metric" />
          <Skeleton className="h-3 w-16" />
        </div>
      ) : (
        <div>
          <div className="text-metric">
            {typeof value === 'number' ? value.toLocaleString() : value}
            <span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span>
          </div>
          {trend && (
            <p className={`text-xs flex items-center gap-1 ${
              trend === 'up' ? 'text-success' : 
              trend === 'down' ? 'text-destructive' : 
              'text-muted-foreground'
            }`}>
              <TrendingUp className={`h-3 w-3 ${trend === 'down' ? 'rotate-180' : ''}`} />
              {trend === 'up' ? 'Improving' : trend === 'down' ? 'Declining' : 'Stable'}
            </p>
          )}
        </div>
      )}
    </CardContent>
  </Card>
);

export function KpiCards({ data, loading }: KpiCardsProps) {
  const kpis = [
    {
      title: "Median Life (P50)",
      value: data?.medianLife || 0,
      unit: "hours",
      icon: Clock,
      trend: "neutral" as const
    },
    {
      title: "P10 Life",
      value: data?.p10Life || 0,
      unit: "hours", 
      icon: Shield,
      trend: "up" as const
    },
    {
      title: "P90 Life", 
      value: data?.p90Life || 0,
      unit: "hours",
      icon: TrendingUp,
      trend: "neutral" as const
    },
    {
      title: "MTBF",
      value: data?.mtbf || 0,
      unit: "hours",
      icon: Activity,
      trend: "up" as const
    },
    {
      title: "% Censored",
      value: data ? `${(data.censored * 100).toFixed(1)}%` : "0%",
      unit: "",
      icon: AlertTriangle,
      trend: "neutral" as const
    },
    {
      title: "Cohort Size",
      value: data?.cohortSize || 0,
      unit: "runs",
      icon: Users,
      trend: "neutral" as const
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {kpis.map((kpi) => (
        <KpiCard
          key={kpi.title}
          title={kpi.title}
          value={kpi.value}
          unit={kpi.unit}
          icon={kpi.icon}
          trend={kpi.trend}
          loading={loading}
        />
      ))}
    </div>
  );
}