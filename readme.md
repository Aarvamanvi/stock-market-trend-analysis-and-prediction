# 📈 Stock Analysis – Trend & Prediction

A pure **HTML/CSS/JavaScript** app that streams stock prices and performs **real-time (online) prediction** using a lightweight learner on top of rolling technical indicators (EMA, RSI, MACD). Works entirely in your **browser** — no servers, no build tools.

- **Live Mode (real data):** Alpha Vantage intraday API (1 or 5 minute intervals).
- **Demo Mode:** Synthetic tick stream that updates every second (no API key required).
- **Model:** Online linear regression trained via **SGD with L2**; features are EMA-20, RSI-14, MACD(12,26,9) with normalization.
- **Charting:** Chart.js live line chart — actual price vs predicted next value.

---

## 🗂 Project Structure

stock-analysis/
├── index.html
├── css/
│ └── styles.css
├── js/
│ ├── app.js # orchestrates everything
│ ├── api.js # Alpha Vantage + demo stream
│ ├── analysis.js # indicators, model, processing pipeline
│ └── ui.js # DOM bindings, Chart.js, logs/status
└── README.md



---

## 🚀 Running Locally

> The app is static; just open `index.html`. Some browsers enforce stricter file:// policies, so a tiny static server is recommended.

### Option A: Double-click `index.html`
- Works in most browsers.

### Option B: Serve locally
- **Python 3:**  
  ```bash
  python -m http.server 8000



---

## 🚀 Running Locally

> The app is static; just open `index.html`. Some browsers enforce stricter file:// policies, so a tiny static server is recommended.

### Option A: Double-click `index.html`
- Works in most browsers.

### Option B: Serve locally
- **Python 3:**  
  ```bash
  python -m http.server 8000


🔌 Live Data Setup (Free)

Get a free API key from Alpha Vantage.

In the app:

Set Mode to Live (Alpha Vantage).

Paste your API Key.

Enter Symbol (e.g., AAPL, MSFT, TSLA).

For Indian stocks, try RELIANCE.BSE, SBIN.BSE, TCS.NSE etc.

Choose Interval (1 min recommended).

Click Start.

Free tier limits: ~5 requests/minute, ~500/day.
This app polls every ~65s for 1-minute data to respect the limit.

If you hit “API limit reached”, wait a minute or switch to Demo mode to continue testing.

🧠 Model & Features

Features per tick

EMA(20), RSI(14), MACD(12,26,9)

Normalization: EMA by rolling range; RSI centered at 50; MACD by rolling range.

Learner

Online linear model w ∈ ℝ⁴ (bias + 3 features).

SGD with weight decay (L2 λ).

Updates on each new tick.

Prediction

One-step-ahead point forecast (displayed as dashed line).

UI Hyperparameters

Window (points): rolling data size for features & training.

Learning Rate: SGD step size.

L2 (λ): regularization to mitigate overfitting.

🧪 Quick Demo (No API Key)

Switch Mode to Demo (no API key).

Click Start.
You’ll see a 1-second synthetic price stream with live predictions.

🛠 Troubleshooting

“API limit reached”: Free tier is strict; wait and retry, use 5-minute interval, or Demo mode.

“Invalid symbol”: Check ticker format. For some exchanges, use suffixes like .BSE, .NSE, .LON, etc.

No updates: Intraday endpoints update at interval boundaries during market hours.


⚠️ Disclaimer

This project is for education and experimentation only. It is not financial advice. Real markets are noisy; adjust features, add ensembling, or move heavy computation to Web Workers for production-grade use.

📦 Ideas to Extend

Confidence bands from rolling residual variance.

Ensemble predictors (EMA momentum + linear + naive).

Persistence of settings via localStorage.

Multiple symbols & tabs.

Web Workers for smoother UI under load.



---

If you want, I can bundle these into a downloadable ZIP or help you deploy on GitHub Pages.
