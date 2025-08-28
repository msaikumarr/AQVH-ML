import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { MetricCard } from "../components/ui/metric-card";
import { 
  TrendingUp, 
  Activity, 
  Brain,
  BarChart3,
  Zap
} from "lucide-react";
import { fetchLiveMetrics, fetchModelAccuracies, fetchQuantumMetrics, type QuantumMetrics, fetchFTSE100Data } from "../services/api";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const DashboardPage = () => {
  // Removed unused liveMetrics state
  const [modelAccuracies, setModelAccuracies] = useState<any[]>([]);
  const [quantumMetrics, setQuantumMetrics] = useState<QuantumMetrics | null>(null);
  const [lastDayData, setLastDayData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [metrics, accuracies, qmetrics, ftseData] = await Promise.all([
          fetchLiveMetrics(),
          fetchModelAccuracies(),
          fetchQuantumMetrics(),
          fetchFTSE100Data()
        ]);
        setModelAccuracies(accuracies);
        setQuantumMetrics(qmetrics);
        // Use backend data as-is for lastDayData to avoid TS errors
        if (Array.isArray(ftseData) && ftseData.length > 0) {
          setLastDayData(ftseData[ftseData.length - 1]);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-muted rounded w-1/2"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const accuracyData = {
    labels: modelAccuracies.map(m => m.model),
    datasets: [
      {
        label: 'Accuracy (%)',
        data: modelAccuracies.map(m => m.accuracy),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)', // Blue for VQC
          'rgba(16, 185, 129, 0.8)', // Green for SVM
          'rgba(139, 92, 246, 0.8)', // Purple for IBM
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(139, 92, 246, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: 'hsl(210 100% 95%)'
        }
      },
      title: {
        display: true,
        text: 'Model Performance Comparison',
        color: 'hsl(210 100% 95%)'
      },
    },
    scales: {
      y: {
        ticks: {
          color: 'hsl(210 20% 65%)'
        },
        grid: {
          color: 'hsl(225 15% 20%)'
        }
      },
      x: {
        ticks: {
          color: 'hsl(210 20% 65%)'
        },
        grid: {
          color: 'hsl(225 15% 20%)'
        }
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold gradient-quantum bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Real-time quantum ML market analysis
          </p>
        </div>
        <Badge className="animate-quantum-pulse">
          <div className="w-2 h-2 bg-accent rounded-full mr-2"></div>
          Live Trading
        </Badge>
      </div>

      {/* Live Metrics Grid (now using last day of dataset) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="FTSE 100 Price"
          value={`₹${lastDayData?.Close && !isNaN(Number(lastDayData.Close)) ? (Number(lastDayData.Close) * 105.0).toFixed(2) : 'N/A'}`}
          change={lastDayData?.Close && lastDayData?.Open && !isNaN(Number(lastDayData.Close)) && !isNaN(Number(lastDayData.Open)) ? ((Number(lastDayData.Close) - Number(lastDayData.Open)) * 105.0).toFixed(2) : 'N/A'}
          icon={<TrendingUp />}
        />
        <MetricCard
          title="Daily Volume"
          value={lastDayData?.Volume && !isNaN(Number(lastDayData.Volume)) ? Number(lastDayData.Volume).toLocaleString() : 'N/A'}
          icon={<Activity />}
        />
        <MetricCard
          title="Volatility"
          value={lastDayData?.rsi && !isNaN(Number(lastDayData.rsi)) ? `${Number(lastDayData.rsi).toFixed(2)}%` : 'N/A'}
          icon={<BarChart3 />}
        />
        <MetricCard
          title="VQC Prediction"
          value={lastDayData?.target === 1 ? 'BUY' : lastDayData?.target === 0 ? 'SELL' : 'HOLD'}
          change={lastDayData?.macd && !isNaN(Number(lastDayData.macd)) ? Number(lastDayData.macd).toFixed(2) : 'N/A'}
          icon={<Brain />}
          className="quantum-glow"
        />
      </div>

      {/* Show last row of dataset as JSON for debugging
      {lastDayData && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">Last Row of FTSE 100 Dataset</h2>
          <pre className="bg-muted text-xs p-2 rounded overflow-x-auto">{JSON.stringify(lastDayData, null, 2)}</pre>
        </div>
      )} */}

      {/* Last Day of Dataset */}
      {lastDayData && (
        <Card className="bg-card/50 border-border/50 mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Last Day FTSE 100 Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex flex-wrap gap-6">
              <div>
                <span className="text-sm text-muted-foreground">Date</span><br />
                <span className="font-semibold">{lastDayData.Date || lastDayData.Price || 'N/A'}</span>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Close</span><br />
                <span className="font-semibold">{lastDayData.Close || 'N/A'}</span>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Open</span><br />
                <span className="font-semibold">{lastDayData.Open || 'N/A'}</span>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">High</span><br />
                <span className="font-semibold">{lastDayData.High || 'N/A'}</span>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Low</span><br />
                <span className="font-semibold">{lastDayData.Low || 'N/A'}</span>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Volume</span><br />
                <span className="font-semibold">{lastDayData.Volume && !isNaN(Number(lastDayData.Volume)) ? Number(lastDayData.Volume).toLocaleString() : 'N/A'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Model Performance Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Model Accuracies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Bar data={accuracyData} options={chartOptions} />
          </CardContent>
        </Card>

      </div>

      {/* Model Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {modelAccuracies.map((model, index) => (
          <Card key={index} className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {model.model.includes('Quantum') && <Zap className="h-5 w-5 text-primary" />}
                {model.model.includes('SVM') && <BarChart3 className="h-5 w-5 text-accent" />}
                {model.model.includes('IBM') && <Brain className="h-5 w-5 text-secondary" />}
                {model.model}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Accuracy</span>
                <span className="font-semibold text-primary">{model.accuracy}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Precision</span>
                <span className="font-semibold">{model.precision}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Recall</span>
                <span className="font-semibold">{model.recall}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">F1 Score</span>
                <span className="font-semibold">{model.f1Score}%</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;