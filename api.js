// api.js
// Live API (Alpha Vantage) + Demo stream
(function(global){
  async function fetchAlphaVantage(symbol, interval, apiKey){
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${encodeURIComponent(symbol)}&interval=${encodeURIComponent(interval)}&outputsize=compact&apikey=${encodeURIComponent(apiKey)}`;
    const res = await fetch(url);
    if(!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if(data.Note) throw new Error('API limit reached (Alpha Vantage free tier: 5 req/min, 500/day).');
    if(data['Error Message']) throw new Error('Invalid symbol or API error.');
    const key = Object.keys(data).find(k=>k.includes('Time Series'));
    if(!key) throw new Error('Unexpected API response.');
    const series = data[key];
    const points = Object.entries(series)
      .map(([ts, obj]) => ({ t: new Date(ts), c: parseFloat(obj['4. close']) }))
      .sort((a,b)=> a.t - b.t);
    return points;
  }

  // ---- Live polling loop ----
  function startLivePolling({symbol, interval, apiKey, getLastTs, onData, onStatus, onError}){
    const pollMs = (interval === '1min') ? 65000 : 70000;
    let timer = null;

    async function poll(){
      try{
        const points = await fetchAlphaVantage(symbol, interval, apiKey);
        const lastT = getLastTs() || 0;
        const fresh = points.filter(p => p.t.getTime() > lastT);
        if(fresh.length){
          fresh.forEach(onData);
          onStatus && onStatus(`Live update: +${fresh.length} tick(s)`);
        } else {
          onStatus && onStatus('No new tick yet…');
        }
      }catch(err){
        onError && onError(err);
        onStatus && onStatus('Polling error (will retry).');
      }
    }

    timer = setInterval(poll, pollMs);
    return () => { if(timer) clearInterval(timer); };
  }

  // ---- Demo stream ----
  function createDemoGenerator(start=150){
    let price = start;
    return function next(){
      const vol = 0.15;
      const noise = (Math.random() - 0.5) * vol;
      const drift = (Math.random() - 0.5) * 0.02;
      price = Math.max(1, price * (1 + noise + drift/100));
      return { t: new Date(), c: +price.toFixed(4) };
    };
  }

  function initialDemoHistory(n=60){
    const gen = createDemoGenerator();
    const now = Date.now();
    const out = [];
    for(let i=n; i>0; i--){
      const pt = gen();
      pt.t = new Date(now - i*1000);
      out.push(pt);
    }
    return out;
  }

  function startDemo({onData, onStatus}){
    const gen = createDemoGenerator();
    onStatus && onStatus('Demo streaming (1s)…');
    const timer = setInterval(()=>{
      onData(gen());
      onStatus && onStatus('Demo: tick');
    }, 1000);
    return () => clearInterval(timer);
  }

  global.API = {
    fetchAlphaVantage,
    startLivePolling,
    initialDemoHistory,
    startDemo
  };
})(window);
