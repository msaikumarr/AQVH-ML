// Fetch last update time for predictions.csv
export async function fetchPredictionsLastUpdate() {
  const res = await fetch("http://localhost:8000/api/predictions-last-update");
  if (!res.ok) throw new Error("Failed to fetch predictions last update time");
  return res.json();
}
// List of company CSVs in backend data folder (hardcoded for now, could be fetched from backend in future)
export const companyList = [
  "Airtel_Africa",
  "AstraZeneca",
  "BAE_Systems",
  "HSBC_Holdings",
  "Lloyds_Banking_Group",
  "National_Grid",
  "Tesco",
  "Unilever",
  "Vodafone_Group"
];

// Fetch forecast for a specific company
export async function fetchCompanyForecast(company: string) {
  const res = await fetch(`http://localhost:8000/api/company-predictions?company=${company}`);
  if (!res.ok) throw new Error("Failed to fetch company forecast");
  return res.json();
}
export async function fetchMarketData(): Promise<MarketData[]> {
  const res = await fetch("http://localhost:8000/api/ftse100");
  if (!res.ok) throw new Error("Failed to fetch FTSE 100 data");
  return res.json();
}
export interface QuantumMetrics {
  circuit_depth: number;
  qubits: number;
  reps: number;
  entanglement: string;
  depth: number;
  [key: string]: number | string;
}

export async function fetchQuantumMetrics(): Promise<QuantumMetrics> {
  const res = await fetch("http://localhost:8000/api/quantum-metrics");
  if (!res.ok) throw new Error("Failed to fetch quantum metrics");
  return res.json();
}

// Types (adjust as needed)
export interface MarketData {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  prediction?: 'BUY' | 'SELL' | 'HOLD';
  confidence?: number;
}

export interface ModelAccuracy {
  model: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
}

// Fetch live FTSE 100 metrics
export async function fetchLiveMetrics() {
  const res = await fetch("http://localhost:8000/api/live-metrics");
  if (!res.ok) throw new Error("Failed to fetch live metrics");
  return res.json();
}

// Fetch model accuracies
export async function fetchModelAccuracies(): Promise<ModelAccuracy[]> {
  const res = await fetch("http://localhost:8000/api/model-accuracies");
  if (!res.ok) throw new Error("Failed to fetch model accuracies");
  return res.json();
}

// Fetch full FTSE 100 dataset
export async function fetchFTSE100Data(): Promise<MarketData[]> {
  const res = await fetch("http://localhost:8000/api/ftse100");
  if (!res.ok) throw new Error("Failed to fetch FTSE 100 data");
  return res.json();
}
export async function fetchPredictions() {
  const res = await fetch("http://localhost:8000/api/predictions");
  if (!res.ok) throw new Error("Failed to fetch predictions");
  return res.json();
}