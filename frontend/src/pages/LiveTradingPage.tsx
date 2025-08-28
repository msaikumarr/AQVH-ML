import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { TrendingUp, TrendingDown, Activity, BarChart3 } from "lucide-react";
import ForecastChart from "../components/ForecastChart";
import CompanyMetrics from "../components/CompanyMetrics";
import { companyList, fetchCompanyForecast } from "../services/api";

const LiveTradingPage = () => {
  const [selectedCompany, setSelectedCompany] = useState(companyList[0]);
  const [companyData, setCompanyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchCompanyForecast(selectedCompany);
        setCompanyData(data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch company data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedCompany]);

  // Find the last two valid historical rows (with actual prices, not forecast)
  const historicalRows = companyData && Array.isArray(companyData)
    ? [...companyData].filter(row => row.actual !== null && row.actual !== undefined)
    : [];
  const lastRow = historicalRows.length > 0 ? historicalRows[historicalRows.length - 1] : null;
  const previousRow = historicalRows.length > 1 ? historicalRows[historicalRows.length - 2] : null;
  const currentPrice = lastRow?.actual ?? 0;
  const previousClose = previousRow?.actual ?? 0;
  const priceChange = currentPrice - previousClose;
  const changePercent = previousClose !== 0 ? (priceChange / previousClose) * 100 : 0;

  // For Trading Insights, use the latest forecast row if available
  const latestForecast = companyData && Array.isArray(companyData)
    ? [...companyData].reverse().find(row => row.vqc_prediction !== null && row.vqc_prediction !== undefined)
    : null;
  const tradingSignal = latestForecast?.vqc_prediction !== undefined && latestForecast?.vqc_prediction !== null
    ? (latestForecast.vqc_prediction > currentPrice ? 'Buy' : 'Sell')
    : 'Hold';
  const tradingConfidence = latestForecast?.vqc_prediction !== undefined && latestForecast?.vqc_prediction !== null
    ? (90 + Math.abs(currentPrice - latestForecast.vqc_prediction)).toFixed(0)
    : 'N/A';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Activity className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Quantum Live Trading
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                Real-Time Quantum Trading
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Company Selection */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Live Trading Dashboard</h2>
              <p className="text-muted-foreground">Select a company to view and trade in real time</p>
            </div>
            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
              <SelectTrigger className="w-64 border border-accent/40 bg-gradient-to-br from-card/80 to-accent/10 backdrop-blur-md shadow-lg rounded-xl focus:ring-2 focus:ring-accent/60">
                <SelectValue placeholder="Select a company" />
              </SelectTrigger>
              <SelectContent className="border border-accent/40 bg-gradient-to-br from-card/90 to-accent/10 backdrop-blur-md shadow-xl rounded-xl">
                {companyList.map((company) => (
                  <SelectItem key={company} value={company} className="rounded-lg px-4 py-2 hover:bg-accent/20 cursor-pointer transition-all">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium">{company}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading && <div className="text-center text-lg">Loading...</div>}
        {error && <div className="text-center text-destructive">{error}</div>}

        {lastRow && (
          <>
            {/* Company Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <Card className="lg:col-span-2 bg-gradient-to-br from-card to-card/80 border-border/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl font-bold text-foreground">
                        {selectedCompany.replace(/_/g, ' ')}
                      </CardTitle>
                      <p className="text-muted-foreground">{selectedCompany}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-foreground">
                        ₹{currentPrice.toFixed(2)}
                      </div>
                      <div className={`flex items-center space-x-1 ${
                        priceChange >= 0 ? 'text-success' : 'text-destructive'
                      }`}>
                        {priceChange >= 0 ? 
                          <TrendingUp className="h-4 w-4" /> : 
                          <TrendingDown className="h-4 w-4" />
                        }
                        <span className="font-medium">
                          {priceChange >= 0 ? '+' : ''}₹{priceChange.toFixed(2)} ({changePercent.toFixed(2)}%)
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              <CompanyMetrics company={{
                symbol: selectedCompany,
                name: selectedCompany.replace(/_/g, ' '),
                currentPrice: currentPrice,
                previousClose: previousClose,
                volume: lastRow?.Volume ?? 'N/A',
                open: lastRow?.Open ?? null,
                high: lastRow?.High ?? null,
                low: lastRow?.Low ?? null
              }} />
            </div>

            {/* Forecast Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 bg-gradient-to-br from-card to-card/80 border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    <span>Live Quantum Trading Chart</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ForecastChart 
                    data={companyData.map(row => ({
                      date: row.date || row.Date || '',
                      historical: row.actual ?? row.Close ?? null,
                      predicted: row.vqc_prediction ?? null,
                      confidenceUpper: row.vqc_prediction ? (row.vqc_prediction * 1.05) : null,
                      confidenceLower: row.vqc_prediction ? (row.vqc_prediction * 0.95) : null
                    }))}
                    companyName={selectedCompany.replace(/_/g, ' ')}
                  />
                </CardContent>
              </Card>

              {/* Trading Insights */}
              <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Trading Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      <span className="font-medium text-sm">Live Signal</span>
                    </div>
                    <div className="text-2xl font-bold text-success">
                      {tradingSignal}
                    </div>
                    <p className="text-xs text-muted-foreground">Quantum trading recommendation</p>
                  </div>

                  <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-accent"></div>
                      <span className="font-medium text-sm">Confidence Level</span>
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                      {tradingConfidence}%
                    </div>
                    <p className="text-xs text-muted-foreground">Quantum certainty</p>
                  </div>

                  <div className="p-4 rounded-lg bg-warning/5 border border-warning/20">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-warning"></div>
                      <span className="font-medium text-sm">Risk Factor</span>
                    </div>
                    <div className="text-2xl font-bold text-warning">
                      {Math.abs(priceChange) > 2 ? 'High' : Math.abs(priceChange) > 1 ? 'Medium' : 'Low'}
                    </div>
                    <p className="text-xs text-muted-foreground">Market volatility</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LiveTradingPage;
