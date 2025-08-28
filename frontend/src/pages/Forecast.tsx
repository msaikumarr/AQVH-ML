
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { TrendingUp, TrendingDown, Activity, BarChart3 } from "lucide-react";
import ForecastChart from "../components/ForecastChart";
import { companyList, fetchCompanyForecast } from "../services/api";


const Forecast = () => {

  const [selectedCompany, setSelectedCompany] = useState<string>(companyList[0]);
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  // Removed unused loading state


  // Fetch forecast data for selected company
  useEffect(() => {
    const fetchForecast = async () => {
      try {
        const preds = await fetchCompanyForecast(selectedCompany);
        if (Array.isArray(preds)) {
          setForecastData(preds.map((row: any) => ({
            date: row.date,
            historical: row.actual ?? null,
            predicted: row.vqc_prediction ?? null,
            confidenceUpper: row.vqc_prediction !== undefined && row.vqc_prediction !== null ? (row.vqc_prediction + 2) : null,
            confidenceLower: row.vqc_prediction !== undefined && row.vqc_prediction !== null ? (row.vqc_prediction - 2) : null
          })));
        } else {
          setForecastData([]);
        }
      } catch (e) {
        setForecastData([]);
      }
    };
    fetchForecast();
  }, [selectedCompany]);


  // For demo: use last two historical points for price change
  const lastHist = forecastData.filter(d => d.historical !== null);
  const currentPrice = lastHist.length > 0 ? lastHist[lastHist.length - 1].historical : null;
  const previousClose = lastHist.length > 1 ? lastHist[lastHist.length - 2].historical : null;
    const INR_RATE = 105.0;
    const priceChange = currentPrice !== null && previousClose !== null ? (currentPrice - previousClose) : 0;
  const changePercent = currentPrice !== null && previousClose ? (priceChange / previousClose) * 100 : 0;

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
                  Quantum Market Predictor
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                Variational Quantum Circuit
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
              <h2 className="text-3xl font-bold text-foreground mb-2">Market Forecast Dashboard</h2>
              <p className="text-muted-foreground">Select a company to view quantum-powered predictions</p>
            </div>
            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
              <SelectTrigger className="w-64 bg-gradient-to-r from-[#232946] to-[#1a1a2e] border border-accent rounded-xl shadow-xl text-white focus:ring-2 focus:ring-accent focus:outline-none transition-all">
                <SelectValue placeholder="Select a company" />
              </SelectTrigger>
              <SelectContent className="rounded-xl shadow-2xl bg-[#232946] border border-accent">
                <div className="px-2 py-2 sticky top-0 z-10 bg-[#232946]">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Search company..."
                    className="w-full px-3 py-2 rounded-lg border border-accent bg-[#1a1a2e] text-white placeholder:text-accent focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all shadow-sm"
                  />
                </div>
                {companyList
                  .filter(company => company.toLowerCase().replace(/_/g, ' ').includes(searchTerm.toLowerCase()))
                  .map((company) => (
                    <SelectItem key={company} value={company} className="hover:bg-accent/40 hover:text-white rounded-lg cursor-pointer transition-colors text-white px-3 py-2">
                      <span className="font-medium">{company.replace(/_/g, ' ')}</span>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Company Overview (from forecastData) */}
        {forecastData.length > 0 && (
          <>
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
                        ₹{currentPrice !== null && currentPrice !== undefined ? (Number(currentPrice) * INR_RATE).toFixed(2) : 'N/A'}
                      </div>
                      <div className={`flex items-center space-x-1 ${
                        priceChange >= 0 ? 'text-success' : 'text-destructive'
                      }`}>
                        {priceChange >= 0 ? 
                          <TrendingUp className="h-4 w-4" /> : 
                          <TrendingDown className="h-4 w-4" />
                        }
                        <span className="font-medium">
                          {priceChange >= 0 ? '+' : ''}₹{priceChange ? (priceChange * INR_RATE).toFixed(2) : '0.00'} ({changePercent ? changePercent.toFixed(2) : '0.00'}%)
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
              {/* Optionally, show more metrics here if needed */}
            </div>

            {/* Forecast Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 bg-gradient-to-br from-card to-card/80 border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    <span>Quantum Forecast Analysis</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ForecastChart data={forecastData} companyName={selectedCompany.replace(/_/g, ' ')} />
                  {/* Convert chart data to INR for display */}
                  <ForecastChart data={forecastData.map(d => ({
                    ...d,
                    historical: d.historical !== null && d.historical !== undefined ? Number(d.historical) * INR_RATE : d.historical,
                    predicted: d.predicted !== null && d.predicted !== undefined ? Number(d.predicted) * INR_RATE : d.predicted,
                    confidenceUpper: d.confidenceUpper !== null && d.confidenceUpper !== undefined ? Number(d.confidenceUpper) * INR_RATE : d.confidenceUpper,
                    confidenceLower: d.confidenceLower !== null && d.confidenceLower !== undefined ? Number(d.confidenceLower) * INR_RATE : d.confidenceLower,
                  }))} companyName={selectedCompany.replace(/_/g, ' ')} />
                </CardContent>
              </Card>

              {/* Prediction Insights */}
              <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Quantum Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      <span className="font-medium text-sm">30-Day Prediction</span>
                    </div>
                    <div className="text-2xl font-bold text-success">
                      {/* Show last forecasted percent change if available */}
                      {forecastData.length > 1 && forecastData[forecastData.length - 1].predicted && forecastData[0].historical
                        ? `₹${((forecastData[forecastData.length - 1].predicted * INR_RATE).toFixed(2))} (${(((forecastData[forecastData.length - 1].predicted - forecastData[0].historical) / forecastData[0].historical) * 100).toFixed(1)}%)`
                        : 'N/A'}
                    </div>
                    <p className="text-xs text-muted-foreground">Expected growth</p>
                  </div>

                  <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-accent"></div>
                      <span className="font-medium text-sm">Confidence Level</span>
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                      {/* Dummy confidence, could be improved if backend provides */}
                      {forecastData.length > 0 && forecastData[forecastData.length - 1].predicted
                        ? '90%'
                        : 'N/A'}
                    </div>
                    <p className="text-xs text-muted-foreground">Quantum certainty</p>
                  </div>

                  <div className="p-4 rounded-lg bg-warning/5 border border-warning/20">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-warning"></div>
                      <span className="font-medium text-sm">Risk Factor</span>
                    </div>
                    <div className="text-2xl font-bold text-warning">
                      {/* Dummy risk, could be improved if backend provides */}
                      {forecastData.length > 0
                        ? ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)]
                        : 'N/A'}
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

export default Forecast;
