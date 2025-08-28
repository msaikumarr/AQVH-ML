import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

interface ForecastChartProps {
  data: Array<{
    date: string;
    historical: number | null;
    predicted: number | null;
    confidenceUpper: number | null;
    confidenceLower: number | null;
  }>;
  companyName: string;
}

const ForecastChart = ({ data }: ForecastChartProps) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-4 shadow-lg">
          <p className="text-sm font-medium text-foreground mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center space-x-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              ></div>
              <span className="text-foreground">
                {entry.name}: ₹{entry.value?.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-96 bg-gradient-to-br from-[#181c2f] to-[#232946] rounded-2xl border border-accent shadow-2xl p-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 30, right: 40, left: 10, bottom: 20 }}>
          <defs>
            <linearGradient id="historicalGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--chart-primary))" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(var(--chart-primary))" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="predictedGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--chart-secondary))" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(var(--chart-secondary))" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--chart-tertiary))" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="hsl(var(--chart-tertiary))" stopOpacity={0}/>
            </linearGradient>
          </defs>
          
          <CartesianGrid 
            strokeDasharray="6 6" 
            stroke="#3a3f5a" 
            opacity={0.6}
          />
          
          <XAxis 
            dataKey="date" 
            stroke="#bfc9ff"
            fontSize={15}
            tickLine={false}
            axisLine={false}
            tick={{ fontWeight: 600 }}
          />
          
          <YAxis 
            stroke="#bfc9ff"
            fontSize={15}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `₹${value}`}
            tick={{ fontWeight: 600 }}
          />
          
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#7f9cf5', strokeWidth: 2, opacity: 0.2 }} />
          
          {/* Confidence interval */}
          <Area
            type="monotone"
            dataKey="confidenceUpper"
            stroke="none"
            fill="url(#confidenceGradient)"
            fillOpacity={0.18}
            isAnimationActive={true}
          />
          <Area
            type="monotone"
            dataKey="confidenceLower"
            stroke="none"
            fill="url(#confidenceGradient)"
            fillOpacity={0.18}
            isAnimationActive={true}
          />
          
          {/* Historical data */}
          <Area
            type="monotone"
            dataKey="historical"
            stroke="#7f9cf5"
            strokeWidth={3}
            fill="url(#historicalGradient)"
            connectNulls={false}
            name="Historical Price"
            dot={{ stroke: '#7f9cf5', strokeWidth: 2, r: 2 }}
            isAnimationActive={true}
          />
          {/* Predicted data */}
          <Area
            type="monotone"
            dataKey="predicted"
            stroke="#fbbf24"
            strokeWidth={3}
            strokeDasharray="6 6"
            fill="url(#predictedGradient)"
            connectNulls={false}
            name="Quantum Prediction"
            dot={{ stroke: '#fbbf24', strokeWidth: 2, r: 2 }}
            isAnimationActive={true}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ForecastChart;