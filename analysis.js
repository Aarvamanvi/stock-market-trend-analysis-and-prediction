// analysis.js
// Indicators + Online model + stateful processing
(function(global){
  // --------- Math helpers ----------
  function ema(series, period){
    if(series.length === 0) return [];
    const k = 2/(period+1);
    const out = [];
    let prev = series[0];
    out.push(prev);
    for(let i=1;i<series.length;i++){
      const v = series[i]*k + prev*(1-k);
      out.push(v);
      prev = v;
    }
    return out;
  }

  function rsi(series, period=14){
    const out = [];
    let gains = 0, losses = 0;
    for(let i=1;i<series.length;i++){
      const ch = series[i] - series[i-1];
      gains += Math.max(ch, 0);
      losses += Math.max(-ch, 0);
      if(i >= period){
        const oldCh = series[i-period+1] - series[i-period];
        gains -= Math.max(oldCh, 0);
        losses -= Math.max(-oldCh, 0);
      }
      if(i >= period){
        const rs = (losses === 0) ? 100 : (gains / (losses || 1e-9));
        out.push(100 - 100/(1+rs));
      } else {
        out.push(50);
      }
    }
    out.unshift(50);
    return out;
  }

  function macd(series, fast=12, slow=26, signal=9){
    const emaFast = ema(series, fast);
    const emaSlow = ema(series, slow);
    const macdLine = series.map((_, i) => (emaFast[i] ?? series[i]) - (emaSlow[i] ?? series[i]));
    const signalLine = ema(macdLine, signal);
    const hist = macdLine.map((v,i)=> v - (signalLine[i] ?? v));
    return {macdLine, signalLine, hist};
  }

  function normalizeFeatures(ema20, rsi14, macdVal, priceWindow){
    const minP = Math.min(...priceWindow);
    const maxP = Math.max(...priceWindow);
    const pRange = Math.max(maxP - minP, 1e-6);
    const nEMA = (ema20 - minP)/pRange; // 0..1
    const nRSI = (rsi14 - 50)/50;       // -1..1
    const nMACD = macdVal / pRange;     // ~ -1..1
    return [1, nEMA, nRSI, nMACD];      // include bias
  }

  // --------- Online linear model ----------
  const Model = {
    create(lr=0.01, lambda=0.0005){
      return {
        w: [0,0,0,0],
        lr, lambda,
        updateHyperparams(lr, lambda){ this.lr = lr; this.lambda = lambda; },
        predict(feat){ return this.w.reduce((s,v,i)=> s + v*feat[i], 0); },
        step(feat, target){
          const yhat = this.predict(feat);
          const err = target - yhat;
          for(let i=0;i<this.w.length;i++){
            const grad = -2*err*feat[i] + 2*this.lambda*this.w[i];
            this.w[i] -= this.lr * grad;
          }
          return {yhat, err};
        }
      };
    }
  };

  // --------- Stateful series container ----------
  function createState(maxPoints=300){
    return {
      times: [],
      prices: [],
      preds: [],
      maxPoints,
      clip(){
        if(this.prices.length > this.maxPoints){
          const cut = this.prices.length - this.maxPoints;
          this.times.splice(0, cut);
          this.prices.splice(0, cut);
          this.preds.splice(0, cut);
        }
      }
    };
  }

  function processPoint(state, model, settings, point){
    // push new point
    state.times.push(point.t);
    state.prices.push(point.c);
    state.clip();

    // indicators
    const ema20All = ema(state.prices, 20);
    const rsi14All = rsi(state.prices, 14);
    const {macdLine} = macd(state.prices, 12, 26, 9);

    const n = state.prices.length;
    const curEMA = ema20All[n-1];
    const curRSI = rsi14All[n-1];
    const curMACD = macdLine[n-1];

    // train + predict
    let lastPred = null;
    if(n >= 30){
      model.updateHyperparams(settings.lr, settings.lambda);
      const feat = normalizeFeatures(curEMA, curRSI, curMACD, state.prices);
      const target = state.prices[n-1];
      const {yhat} = model.step(feat, target);
      lastPred = model.predict(feat);
      state.preds.push(lastPred);
    } else {
      state.preds.push(null);
    }

    return {
      lastPrice: state.prices[n-1],
      pred: lastPred,
      ema20: curEMA,
      rsi14: curRSI,
      macd: curMACD,
      weights: model.w
    };
  }

  // Expose
  global.Analysis = {
    ema, rsi, macd,
    Model, createState, processPoint
  };
})(window);
