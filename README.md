# AQVH-ML: Quantum & Classical ML FTSE 100 Dashboard

This project is a full-stack application for real-time market analysis and trading signal prediction using both quantum and classical machine learning models. It features a FastAPI backend and a modern React (Vite + TypeScript + Tailwind) frontend.

## Features
- **Live Trading Dashboard**: Real-time FTSE 100 price, volume, volatility (RSI), and quantum/classical model predictions.
- **Market Data**: View historical and current FTSE 100/company data, all prices in INR.
- **Predictions**: See latest model-driven trading signals (BUY/SELL/HOLD) with confidence levels.
- **Model Comparison**: Visualize and compare model accuracies (VQC, SVM, IBM, etc.).
- **Backend-Driven**: All data is fetched from FastAPI endpoints, no mock data.
- **Robust Error Handling**: Handles missing, NaN, or invalid data gracefully.

## Tech Stack
- **Backend**: Python, FastAPI, Pandas, Numpy, yfinance
- **Frontend**: React, Vite, TypeScript, Tailwind CSS, Chart.js, Recharts

## Project Structure
```
AQVH-ML/
  backend/
    main.py                # FastAPI backend
    data/                  # CSVs for FTSE 100 and companies
    models/                # Model weights, scalers, metrics
    src/                   # ML/quantum model code
    requirements.txt
  frontend/
    src/
      pages/              # Dashboard, MarketData, Predictions, etc.
      components/         # UI components
      services/           # API calls
    public/
    package.json
    tailwind.config.js
```

## Getting Started
### Backend
1. Install dependencies:
   ```sh
   pip install -r requirements.txt
   ```
2. Run the backend:
   ```sh
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend
1. Install dependencies:
   ```sh
   npm install
   ```
2. Run the frontend:
   ```sh
   npm run dev
   ```

## API Endpoints
- `/api/ftse100` - FTSE 100 historical data
- `/api/company-predictions?company=NAME` - Company forecast & historical
- `/api/model-accuracies` - Model accuracy metrics
- `/api/predictions` - Latest predictions
- `/api/quantum-metrics` - Quantum circuit metrics
- `/api/live-metrics` - Live FTSE 100 metrics

## Notes
- All prices are shown in INR (conversion rate: 1 GBP = 105 INR).
- Update CSVs in `backend/data/` to change displayed data.
- Dashboard auto-refreshes every 30 seconds.

## License
MIT
