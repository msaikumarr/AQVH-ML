import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { TrendingUp, DollarSign, BarChart3, Users } from "lucide-react";


interface Company {
  symbol: string;
  name: string;
  currentPrice: number | null;
  previousClose: number | null;
  volume: number | string;
  open?: number | null;
  high?: number | null;
  low?: number | null;
}

interface CompanyMetricsProps {
  company: Company;
}

const CompanyMetrics = ({ company }: CompanyMetricsProps) => {
  const metrics = [
    {
      title: "Volume",
      value: company.volume,
      icon: BarChart3,
      change: "+15.7%",
      positive: true
    },
    {
      title: "Open",
      value: company.open !== undefined && company.open !== null ? company.open : 'N/A',
      icon: DollarSign,
      change: "",
      positive: true
    },
    {
      title: "High",
      value: company.high !== undefined && company.high !== null ? company.high : 'N/A',
      icon: TrendingUp,
      change: "",
      positive: true
    },
    {
      title: "Low",
      value: company.low !== undefined && company.low !== null ? company.low : 'N/A',
      icon: Users,
      change: "",
      positive: true
    }
  ];

  return (
    <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
      <CardHeader>
        <CardTitle className="text-lg">Key Metrics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {metrics.map((metric, index) => (
          <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/30">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <metric.icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{metric.title}</p>
                <p className="text-lg font-bold text-foreground">{metric.value}</p>
              </div>
            </div>
            <div className={`text-sm font-medium ${
              metric.positive ? 'text-success' : 'text-destructive'
            }`}>
              {metric.change}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default CompanyMetrics;