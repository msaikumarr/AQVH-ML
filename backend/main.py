from fastapi import Query, FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import pandas as pd
import numpy as np
import yfinance as yf

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# New endpoint: forecast for any company in data folder
@app.get("/api/company-predictions")
def get_company_predictions(company: str = Query(..., description="Company CSV name without .csv extension")):
    # Compose file path
    data_dir = "data"
    filename = f"{company}.csv"
    file_path = os.path.join(data_dir, filename)
    if not os.path.exists(file_path):
        return {"error": f"Company data file not found: {filename}"}
    try:
        df = pd.read_csv(file_path)
        df = df.replace([np.inf, -np.inf], np.nan)
        df = df.astype(object).where(pd.notnull(df), None)
        gbp_to_inr = 105.0
        # Convert price columns to INR for historical rows
        def convert_row_to_inr(row):
            for col in ["Open", "High", "Low", "Close"]:
                if col in row and row[col] is not None:
                    try:
                        row[col] = round(float(row[col]) * gbp_to_inr, 2)
                    except Exception:
                        pass
            if "actual" in row and row["actual"] is not None:
                try:
                    row["actual"] = round(float(row["actual"]) * gbp_to_inr, 2)
                except Exception:
                    pass
            return row
        last_rows = df.tail(30)
        historical = [
            convert_row_to_inr(dict(row, **{"vqc_prediction": None, "svm_prediction": None, "actual": row.get("Close", None), "date": row.get("Date", None)}))
            for row in last_rows.to_dict(orient="records")
        ]
        # Dummy forecast: next 10 days, use last close as base (already in INR)
        import datetime
        last_date = pd.to_datetime(historical[-1]["date"]) if historical and historical[-1]["date"] else pd.Timestamp.today()
        last_close = float(historical[-1]["actual"]) if historical and historical[-1]["actual"] else 100.0
        forecast = []
        for i in range(1, 11):
            next_date = last_date + pd.Timedelta(days=i)
            pred = last_close * (1 + 0.01 * np.random.randn())
            forecast_row = dict(last_rows.iloc[-1]) if not last_rows.empty else {}
            # Set all price columns to None for forecast, except vqc_prediction/svm_prediction
            for col in ["Open", "High", "Low", "Close"]:
                forecast_row[col] = None
            forecast_row.update({
                "date": next_date.strftime("%Y-%m-%d"),
                "actual": None,
                "vqc_prediction": round(pred, 2),
                "svm_prediction": round(pred * (1 + 0.005 * np.random.randn()), 2)
            })
            # Convert predictions to INR if not already
            forecast_row["vqc_prediction"] = round(forecast_row["vqc_prediction"], 2)
            forecast_row["svm_prediction"] = round(forecast_row["svm_prediction"], 2)
            forecast.append(forecast_row)
        return historical + forecast
    except Exception as e:
        return {"error": str(e)}


@app.get("/api/quantum-metrics")
def get_quantum_metrics():
    import json
    try:
        with open("models/quantum_metrics.json", "r") as f:
            data = json.load(f)
        return data
    except Exception as e:
        return {"error": str(e)}


@app.get("/api/live-metrics")
def get_live_metrics():
    import logging
    ticker = yf.Ticker("^FTSE")
    data = ticker.history(period="1d", interval="1m")
    if data.empty:
        # Try a more reliable interval if 1m is empty
        data = ticker.history(period="5d", interval="5m")
        if data.empty:
            logging.warning("No FTSE 100 data available for 1m or 5m interval.")
            return {"error": "No FTSE 100 data available (1m/5m)"}
        else:
            logging.info(f"Using 5m interval data: {data.tail(2)}")
    else:
        logging.info(f"Using 1m interval data: {data.tail(2)}")
    latest = data.iloc[-1]
    prev_close = ticker.history(period="2d").iloc[0]["Close"] if len(ticker.history(period="2d")) > 1 else latest["Close"]
    current_price = latest["Close"]
    daily_change = current_price - prev_close
    volume = int(latest["Volume"]) if not pd.isna(latest["Volume"]) and latest["Volume"] > 0 else None
    returns = data["Close"].pct_change().dropna()
    volatility = float(returns[-60:].std()) if len(returns) >= 60 else float(returns.std())
    if pd.isna(volatility) or volatility == 0:
        volatility = None
    next_prediction = "BUY" if daily_change > 0 else "SELL"
    confidence = min(abs(daily_change) / (current_price if current_price else 1), 1.0)
    logging.info(f"currentPrice: {current_price}, dailyChange: {daily_change}, volume: {volume}, volatility: {volatility}, nextPrediction: {next_prediction}, confidence: {confidence}")
    # Convert GBP to INR (approximate conversion, update as needed)
    gbp_to_inr = 105.0  # Example rate, update to current rate if needed
    inr_price = float(current_price) * gbp_to_inr
    inr_change = float(daily_change) * gbp_to_inr
    return {
        "currentPrice": round(inr_price, 2),
        "dailyChange": round(inr_change, 2),
        "volume": volume if volume is not None else "N/A",
        "volatility": f"{volatility*100:.1f}%" if volatility is not None else "N/A",
        "nextPrediction": next_prediction,
        "confidence": round(confidence, 2),
        "currencySymbol": "₹"
    }


@app.get("/api/model-accuracies")
def get_model_accuracies():
    import json
    try:
        with open("models/model_accuracies.json", "r") as f:
            data = json.load(f)
        return data
    except Exception as e:
        return {"error": str(e)}


@app.get("/api/ftse100")
def get_ftse100_data():
    import logging
    try:
        # Skip the metadata rows and use the first row as header
        df = pd.read_csv("data/dataset.csv", header=0, skiprows=[1,2])
        import logging
        logging.warning(f"DF Columns: {df.columns.tolist()}")
        logging.warning(f"DF Head: {df.head(5).to_dict(orient='records')}")
        # Do not filter rows; just return all rows as objects
        df = df.replace([np.inf, -np.inf], np.nan)
        df = df.astype(object).where(pd.notnull(df), None)
        logging.warning(f"DF After No Filter: {df.tail(5).to_dict(orient='records')}")
        return df.to_dict(orient="records")
    except Exception as e:
        import logging
        logging.exception("Error in /api/ftse100 endpoint: %s", e)
        return {"error": str(e)}


@app.get("/api/predictions")
def get_predictions():
    # Adjust the file path as needed
    try:
        df = pd.read_csv("data/predictions.csv")
        df = df.replace([np.inf, -np.inf], np.nan)
        df = df.astype(object).where(pd.notnull(df), None)
        return df.to_dict(orient="records")
    except Exception as e:
        return {"error": str(e)}