/* ============================================
   DELTA CAPITAL — MARKET DATA PROVIDER
   Real-time data with Finnhub API + caching
   ============================================ */
(function () {
  'use strict';

  var MarketDataProvider = {
    config: {
      apiKey: 'd64clj9r01qkcggr32j0d64clj9r01qkcggr32jg',
      apiProvider: 'finnhub',
      cacheTTL: 45,
      sentimentTTL: 300,
      maxCallsPerMinute: 50,
      updateInterval: 3000,
      logLevel: 'warn',
      simulationMode: false
    },

    cache: {},
    callsThisMinute: 0,
    lastMinuteReset: Date.now(),
    requestQueue: [],
    isProcessingQueue: false,
    sentimentCache: { data: null, timestamp: 0 },
    lastRealPrices: {},
    stats: { apiCalls: 0, cacheHits: 0, fallbacks: 0 }
  };

  function log(level, msg, data) {
    var levels = { error: 0, warn: 1, info: 2, debug: 3 };
    if (levels[level] <= levels[MarketDataProvider.config.logLevel]) {
      var prefix = '[MarketData] ' + msg;
      if (data) console.log(prefix, data);
      else console.log(prefix);
    }
  }

  function checkRateLimit() {
    var now = Date.now();
    if (now - MarketDataProvider.lastMinuteReset > 60000) {
      MarketDataProvider.callsThisMinute = 0;
      MarketDataProvider.lastMinuteReset = now;
    }
    return MarketDataProvider.callsThisMinute < MarketDataProvider.config.maxCallsPerMinute;
  }

  function queueRequest(fn, priority) {
    priority = priority || 0;
    MarketDataProvider.requestQueue.push({ fn: fn, priority: priority });
    MarketDataProvider.requestQueue.sort(function (a, b) { return b.priority - a.priority; });
    processQueue();
  }

  function processQueue() {
    if (MarketDataProvider.isProcessingQueue || MarketDataProvider.requestQueue.length === 0) {
      return;
    }

    if (!checkRateLimit()) {
      log('warn', 'Rate limit approaching (' + MarketDataProvider.callsThisMinute + '/50), queuing request');
      setTimeout(processQueue, 1000);
      return;
    }

    MarketDataProvider.isProcessingQueue = true;
    var req = MarketDataProvider.requestQueue.shift();

    req.fn().finally(function () {
      MarketDataProvider.isProcessingQueue = false;
      setTimeout(processQueue, 500);
    });
  }

  function getCached(symbol) {
    var entry = MarketDataProvider.cache[symbol];
    if (!entry) return null;

    var age = (Date.now() - entry.timestamp) / 1000;
    if (age > MarketDataProvider.config.cacheTTL) {
      delete MarketDataProvider.cache[symbol];
      return null;
    }

    MarketDataProvider.stats.cacheHits++;
    return entry.data;
  }

  function setCached(symbol, data) {
    MarketDataProvider.cache[symbol] = {
      data: data,
      timestamp: Date.now()
    };
  }

  function fetchFromFinnhub(symbols, callback) {
    if (!MarketDataProvider.config.apiKey) {
      log('error', 'Finnhub API key not configured');
      callback(null);
      return;
    }

    var baseUrl = 'https://finnhub.io/api/v1/quote';
    var results = {};
    var pending = symbols.length;

    symbols.forEach(function (symbol) {
      var cached = getCached(symbol);
      if (cached) {
        results[symbol] = cached;
        pending--;
        if (pending === 0) callback(results);
        return;
      }

      queueRequest(function () {
        return fetch(baseUrl + '?symbol=' + symbol + '&token=' + MarketDataProvider.config.apiKey)
          .then(function (res) {
            MarketDataProvider.callsThisMinute++;
            MarketDataProvider.stats.apiCalls++;
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return res.json();
          })
          .then(function (data) {
            if (!data || data.error) {
              log('warn', 'Invalid data for ' + symbol, data);
              pending--;
              if (pending === 0) callback(results);
              return;
            }

            var processed = {
              symbol: symbol,
              price: data.c || 0,
              change: (data.c || 0) - (data.pc || 0),
              changePct: data.dp || 0,
              high: data.h || 0,
              low: data.l || 0,
              volume: data.v || 0,
              prevClose: data.pc || 0,
              timestamp: Date.now(),
              source: 'finnhub'
            };

            results[symbol] = processed;
            setCached(symbol, processed);
            MarketDataProvider.lastRealPrices[symbol] = processed;

            pending--;
            if (pending === 0) callback(results);
          })
          .catch(function (err) {
            log('warn', 'Finnhub error for ' + symbol, err.message);
            pending--;
            if (pending === 0) callback(results);
          });
      });
    });
  }

  function fetchMarketSentiment(callback) {
    var cached = MarketDataProvider.sentimentCache;
    var age = (Date.now() - cached.timestamp) / 1000;

    if (cached.data && age < MarketDataProvider.config.sentimentTTL) {
      log('debug', 'Using cached sentiment');
      callback(cached.data);
      return;
    }

    if (!MarketDataProvider.config.apiKey) {
      log('error', 'Finnhub API key not configured');
      callback(null);
      return;
    }

    queueRequest(function () {
      var url = 'https://finnhub.io/api/v1/news-sentiment?category=general&token=' +
                MarketDataProvider.config.apiKey;

      return fetch(url)
        .then(function (res) {
          MarketDataProvider.callsThisMinute++;
          MarketDataProvider.stats.apiCalls++;
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return res.json();
        })
        .then(function (data) {
          if (!data || !data.data) {
            log('warn', 'Invalid sentiment data');
            callback(null);
            return;
          }

          var articles = data.data.slice(0, 50);
          var bullishCount = 0, bearishCount = 0;

          articles.forEach(function (article) {
            if (article.sentiment === 'positive') bullishCount++;
            else if (article.sentiment === 'negative') bearishCount++;
          });

          var sentiment = {
            bullishPct: articles.length > 0 ? (bullishCount / articles.length) * 100 : 50,
            bearishPct: articles.length > 0 ? (bearishCount / articles.length) * 100 : 50,
            newsCount: articles.length,
            timestamp: Date.now(),
            source: 'finnhub'
          };

          MarketDataProvider.sentimentCache = {
            data: sentiment,
            timestamp: Date.now()
          };

          callback(sentiment);
        })
        .catch(function (err) {
          log('warn', 'Market sentiment fetch error', err.message);
          callback(null);
        });
    });
  }

  function seededRandom(seed) {
    var s = seed;
    return function () {
      s = (s * 16807 + 0) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }

  function normalRandom(rng) {
    var u1 = rng(), u2 = rng();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  }

  var simRng = seededRandom(Date.now());
  var dayRng = seededRandom(new Date().getFullYear() * 10000 + (new Date().getMonth() + 1) * 100 + new Date().getDate());

  function simulatePriceData(stock) {
    var targetPrice = MarketDataProvider.lastRealPrices[stock.symbol]
      ? MarketDataProvider.lastRealPrices[stock.symbol].price
      : stock.price;

    var micro = normalRandom(simRng) * targetPrice * 0.0005;
    var newPrice = Math.max(0.01, (stock.currentPrice || targetPrice) + micro);

    return {
      symbol: stock.symbol,
      price: newPrice,
      change: newPrice - (stock.prevClose || stock.price),
      changePct: ((newPrice - (stock.prevClose || stock.price)) / (stock.prevClose || stock.price)) * 100,
      high: stock.high || newPrice,
      low: stock.low || newPrice,
      volume: stock.volume || Math.floor((5 + dayRng() * 50) * 1000000),
      prevClose: stock.prevClose || stock.price,
      timestamp: Date.now(),
      source: 'simulated'
    };
  }

  MarketDataProvider.init = function (apiKey, options) {
    return new Promise(function (resolve) {
      if (apiKey) {
        MarketDataProvider.config.apiKey = apiKey;
      }

      if (options) {
        Object.keys(options).forEach(function (key) {
          MarketDataProvider.config[key] = options[key];
        });
      }

      log('info', 'MarketDataProvider initialized', {
        apiProvider: MarketDataProvider.config.apiProvider,
        cacheTTL: MarketDataProvider.config.cacheTTL,
        maxCallsPerMinute: MarketDataProvider.config.maxCallsPerMinute
      });

      resolve();
    });
  };

  MarketDataProvider.fetchQuotes = function (symbols, callback) {
    if (MarketDataProvider.config.simulationMode) {
      var results = {};
      symbols.forEach(function (sym) {
        results[sym] = { symbol: sym, source: 'simulated' };
      });
      callback(results);
      return;
    }

    fetchFromFinnhub(symbols, callback);
  };

  MarketDataProvider.fetchSentiment = function (callback) {
    if (MarketDataProvider.config.simulationMode) {
      callback(null);
      return;
    }

    fetchMarketSentiment(callback);
  };

  MarketDataProvider.getCached = getCached;

  MarketDataProvider.getSimulated = function (stock) {
    return simulatePriceData(stock);
  };

  MarketDataProvider.useSimulation = function () {
    MarketDataProvider.config.simulationMode = true;
    log('info', 'Switched to simulation mode');
  };

  MarketDataProvider.getStats = function () {
    return {
      apiCalls: MarketDataProvider.stats.apiCalls,
      cacheHits: MarketDataProvider.stats.cacheHits,
      callsThisMinute: MarketDataProvider.callsThisMinute,
      queueLength: MarketDataProvider.requestQueue.length
    };
  };

  window.MarketDataProvider = MarketDataProvider;
})();
