// ui.js
// DOM bindings + Chart.js rendering + small helpers
(function(global){
  const els = {
    symbol: document.getElementById('symbolInput'),
    mode: document.getElementById('modeSelect'),
    apiKey: document.getElementById('apiKeyInput'),
    apiKeyLabel: document.getElementById('apiKeyLabel'),
    interval: document.getElementById('intervalSelect'),
    start: document.getElementById('startBtn'),
    stop: document.getElementById('stopBtn'),
    status: document.getElementById('status'),
    lastPrice: document.getElementById('lastPrice'),
    predictedPrice: document.getElementById('predictedPrice'),
    ema20: document.getElementById('ema20'),
    rsi14: document.getElementById('rsi14'),
    macd: document.getElementById('macd'),
    weightsDump: document.getElementById('weightsDump'),
    windowInput: document.getElementById('windowInput'),
    lrInput: document.getElementById('lrInput'),
    lambdaInput: document.getElementById('lambdaInput'),
    logs: document.getElementById('logs'),
    chartCanvas: document.getElementById('priceChart'),
  };

  function log(msg){
    const ts = new Date().toLocaleTimeString();
    els.logs.innerText = `[${ts}] ${msg}\n` + els.logs.innerText;
  }

  function setStatus(s){ els.status.innerText = s; }

  function syncKeyVisibility(){
    if(els.mode.value === 'live'){
      els.apiKeyLabel.style.display = 'flex';
    } else {
      els.apiKeyLabel.style.display = 'none';
    }
  }
  syncKeyVisibility();
  els.mode.addEventListener('change', syncKeyVisibility);

  // Chart
  let chart = null;
  function initChart(){
    if(chart) chart.destroy();
    chart = new Chart(els.chartCanvas.getContext('2d'), {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          { label: 'Price', data: [], pointRadius: 0, borderWidth: 2, tension: 0.2 },
          { label: 'Prediction (next)', data: [], pointRadius: 0, borderDash:[4,4], borderWidth: 2, tension: 0.2 }
        ]
      },
      options: {
        animation: false,
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { ticks: { autoSkip: true, maxTicksLimit: 8 } },
          y: { beginAtZero: false }
        },
        plugins: { legend: { display: true } }
      }
    });
  }

  function updateChart(times, prices, preds){
    if(!chart) return;
    chart.data.labels = times.map(t=> t.toLocaleTimeString());
    chart.data.datasets[0].data = prices;
    chart.data.datasets[1].data = preds;
    chart.update();
  }

  function updatePanels(info){
    if(info.lastPrice != null) els.lastPrice.innerText = info.lastPrice.toFixed(4);
    if(info.pred != null) els.predictedPrice.innerText = info.pred.toFixed(4);
    if(info.ema20 != null) els.ema20.innerText = info.ema20.toFixed(4);
    if(info.rsi14 != null) els.rsi14.innerText = info.rsi14.toFixed(2);
    if(info.macd != null) els.macd.innerText = info.macd.toFixed(6);
    if(info.weights) els.weightsDump.innerText = JSON.stringify(info.weights.map(v=> +v.toFixed(6)));
  }

  // Expose
  global.UI = {
    els,
    log, setStatus,
    initChart, updateChart, updatePanels
  };
})(window);
