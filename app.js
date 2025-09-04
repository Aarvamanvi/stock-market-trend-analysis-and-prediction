// app.js
// Orchestration: wires API + Analysis + UI
(function({API, Analysis, UI}){
  let stopHandle = null;
  const state = Analysis.createState(parseInt(UI.els.windowInput.value || '300', 10));
  let model = Analysis.Model.create(
    parseFloat(UI.els.lrInput.value || '0.01'),
    parseFloat(UI.els.lambdaInput.value || '0.0005')
  );

  function getSettings(){
    return {
      window: parseInt(UI.els.windowInput.value || '300', 10),
      lr: parseFloat(UI.els.lrInput.value || '0.01'),
      lambda: parseFloat(UI.els.lambdaInput.value || '0.0005'),
    };
  }

  function reset(){
    // reset series & model
    state.times.length = 0;
    state.prices.length = 0;
    state.preds.length = 0;
    const s = getSettings();
    state.maxPoints = s.window;
    model = Analysis.Model.create(s.lr, s.lambda);
    UI.initChart();
  }

  function process(point){
    const s = getSettings();
    const info = Analysis.processPoint(state, model, s, point);
    UI.updatePanels(info);
    UI.updateChart(state.times, state.prices, state.preds);
  }

  function getLastTs(){
    const t = state.times[state.times.length-1];
    return t ? t.getTime() : 0;
  }

  async function start(){
    stop(); // ensure clean
    reset();

    const mode = UI.els.mode.value;
    const symbol = UI.els.symbol.value.trim().toUpperCase();
    const interval = UI.els.interval.value;

    if(mode === 'live'){
      const key = UI.els.apiKey.value.trim();
      if(!key){ alert('Please paste your Alpha Vantage API key or switch to Demo mode.'); return; }
      try{
        UI.setStatus('Fetching initial live data…');
        UI.log(`Live mode started for ${symbol} @ ${interval}.`);
        const seed = await API.fetchAlphaVantage(symbol, interval, key);
        const maxPts = getSettings().window;
        seed.slice(-maxPts).forEach(process);
        UI.setStatus(`Live streaming (polling every ${(interval==='1min'?65:70)}s)`);
      }catch(err){
        UI.log(`Error: ${err.message}`);
        UI.setStatus('Error fetching initial data. See Logs.');
        return;
      }

      stopHandle = API.startLivePolling({
        symbol, interval, apiKey:key,
        getLastTs,
        onData: process,
        onStatus: UI.setStatus,
        onError: (e)=> UI.log(`Poll error: ${e.message}`)
      });

    } else {
      // Demo mode
      UI.log('Demo mode started (synthetic stream @ 1s).');
      UI.setStatus('Demo streaming (1s)…');
      // Seed with some history
      API.initialDemoHistory(60).forEach(process);
      stopHandle = API.startDemo({
        onData: process,
        onStatus: UI.setStatus
      });
    }
  }

  function stop(){
    if(stopHandle){ stopHandle(); stopHandle = null; }
    UI.setStatus('Stopped');
    UI.log('Streaming stopped.');
  }

  // Hook up buttons
  UI.els.start.addEventListener('click', start);
  UI.els.stop.addEventListener('click', stop);

  // Initialize once
  UI.initChart();
})(window);
