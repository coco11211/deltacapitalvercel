/* ============================================
   DELTA CAPITAL — MARKET DATA ENGINE
   Live ticker, screener, and sentiment
   ============================================ */
(function () {
  'use strict';

  // --- Stock Universe ---
  var STOCKS = [
    { symbol: 'SPY', name: 'S&P 500 ETF', price: 521.35, sector: 'Index', cap: '—', vol: 0.012 },
    { symbol: 'QQQ', name: 'Nasdaq 100 ETF', price: 462.80, sector: 'Index', cap: '—', vol: 0.014 },
    { symbol: 'DIA', name: 'Dow Jones ETF', price: 412.15, sector: 'Index', cap: '—', vol: 0.010 },
    { symbol: 'IWM', name: 'Russell 2000 ETF', price: 218.40, sector: 'Index', cap: '—', vol: 0.016 },
    { symbol: 'AAPL', name: 'Apple Inc', price: 194.68, sector: 'Technology', cap: '3.01T', vol: 0.015 },
    { symbol: 'MSFT', name: 'Microsoft Corp', price: 428.50, sector: 'Technology', cap: '3.19T', vol: 0.014 },
    { symbol: 'GOOGL', name: 'Alphabet Inc', price: 174.20, sector: 'Technology', cap: '2.14T', vol: 0.016 },
    { symbol: 'AMZN', name: 'Amazon.com Inc', price: 198.45, sector: 'Technology', cap: '2.06T', vol: 0.017 },
    { symbol: 'NVDA', name: 'NVIDIA Corp', price: 848.30, sector: 'Technology', cap: '2.09T', vol: 0.025 },
    { symbol: 'META', name: 'Meta Platforms', price: 548.70, sector: 'Technology', cap: '1.39T', vol: 0.020 },
    { symbol: 'TSLA', name: 'Tesla Inc', price: 278.90, sector: 'Technology', cap: '889B', vol: 0.030 },
    { symbol: 'JPM', name: 'JPMorgan Chase', price: 208.40, sector: 'Financials', cap: '601B', vol: 0.013 },
    { symbol: 'V', name: 'Visa Inc', price: 288.60, sector: 'Financials', cap: '592B', vol: 0.012 },
    { symbol: 'GS', name: 'Goldman Sachs', price: 428.75, sector: 'Financials', cap: '151B', vol: 0.016 },
    { symbol: 'MA', name: 'Mastercard Inc', price: 468.30, sector: 'Financials', cap: '436B', vol: 0.012 },
    { symbol: 'BAC', name: 'Bank of America', price: 37.60, sector: 'Financials', cap: '299B', vol: 0.015 },
    { symbol: 'BRK.B', name: 'Berkshire Hathaway', price: 418.60, sector: 'Financials', cap: '868B', vol: 0.010 },
    { symbol: 'UNH', name: 'UnitedHealth Group', price: 548.20, sector: 'Healthcare', cap: '506B', vol: 0.013 },
    { symbol: 'JNJ', name: 'Johnson & Johnson', price: 158.40, sector: 'Healthcare', cap: '383B', vol: 0.010 },
    { symbol: 'PFE', name: 'Pfizer Inc', price: 27.85, sector: 'Healthcare', cap: '158B', vol: 0.014 },
    { symbol: 'ABBV', name: 'AbbVie Inc', price: 178.60, sector: 'Healthcare', cap: '316B', vol: 0.013 },
    { symbol: 'XOM', name: 'Exxon Mobil Corp', price: 108.90, sector: 'Energy', cap: '461B', vol: 0.014 },
    { symbol: 'CVX', name: 'Chevron Corp', price: 154.80, sector: 'Energy', cap: '291B', vol: 0.013 },
    { symbol: 'WMT', name: 'Walmart Inc', price: 174.50, sector: 'Consumer', cap: '472B', vol: 0.011 },
    { symbol: 'KO', name: 'Coca-Cola Co', price: 61.85, sector: 'Consumer', cap: '268B', vol: 0.009 },
    { symbol: 'PG', name: 'Procter & Gamble', price: 164.20, sector: 'Consumer', cap: '389B', vol: 0.009 },
    { symbol: 'DIS', name: 'Walt Disney Co', price: 104.50, sector: 'Consumer', cap: '192B', vol: 0.018 },
    { symbol: 'NFLX', name: 'Netflix Inc', price: 698.20, sector: 'Technology', cap: '303B', vol: 0.022 },
    { symbol: 'AMD', name: 'Advanced Micro Devices', price: 168.35, sector: 'Technology', cap: '273B', vol: 0.024 },
    { symbol: 'CRM', name: 'Salesforce Inc', price: 278.40, sector: 'Technology', cap: '271B', vol: 0.018 }
  ];

  // Initialize with real data from provider
  function initializeFromProvider() {
    var symbols = STOCKS.map(function (s) { return s.symbol; });
    MarketDataProvider.fetchQuotes(symbols, function (data) {
      if (data) {
        Object.keys(data).forEach(function (sym) {
          var quote = data[sym];
          var stock = STOCKS.find(function (s) { return s.symbol === sym; });
          if (stock && quote.price) {
            stock.currentPrice = quote.price;
            stock.change = quote.change || 0;
            stock.changePct = quote.changePct || 0;
            stock.high = quote.high || quote.price;
            stock.low = quote.low || quote.price;
            stock.volume = quote.volume || 0;
            stock.prevClose = quote.prevClose || quote.price;
          }
        });
      }
    });
  }

  // --- Seeded RNG ---
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

  // Day seed — prices are consistent within the same day
  var now = new Date();
  var daySeed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
  var dayRng = seededRandom(daySeed);
  var tickRng = seededRandom(Date.now());

  // --- Initialize daily changes ---
  STOCKS.forEach(function (stock) {
    var dailyReturn = normalRandom(dayRng) * stock.vol * 100;
    dailyReturn = Math.max(-6, Math.min(6, dailyReturn));
    stock.change = stock.price * dailyReturn / 100;
    stock.changePct = dailyReturn;
    stock.currentPrice = stock.price + stock.change;
    stock.prevClose = stock.price;
    stock.volume = Math.floor((5 + dayRng() * 50) * 1000000);
    stock.high = stock.currentPrice * (1 + dayRng() * 0.012);
    stock.low = stock.currentPrice * (1 - dayRng() * 0.012);
  });

  // --- Micro tick simulation with real data ---
  function tickPrices() {
    STOCKS.forEach(function (stock) {
      var cached = MarketDataProvider.getCached(stock.symbol);
      if (cached && cached.price) {
        // Use real API data
        stock.currentPrice = cached.price;
        stock.change = cached.change;
        stock.changePct = cached.changePct;
        stock.high = Math.max(stock.high || cached.price, cached.high || cached.price);
        stock.low = Math.min(stock.low || cached.price, cached.low || cached.price);
        stock.volume = cached.volume || stock.volume;
      } else {
        // Fallback: micro-tick simulation
        var micro = normalRandom(tickRng) * stock.currentPrice * 0.0002;
        stock.currentPrice = Math.max(0.01, stock.currentPrice + micro);
        stock.change = stock.currentPrice - stock.prevClose;
        stock.changePct = (stock.change / stock.prevClose) * 100;
        if (stock.currentPrice > stock.high) stock.high = stock.currentPrice;
        if (stock.currentPrice < stock.low) stock.low = stock.currentPrice;
      }
    });
  }

  // ==========================================
  //  TICKER TAPE
  // ==========================================
  function createTicker() {
    var tape = document.createElement('div');
    tape.className = 'ticker-tape';

    var track = document.createElement('div');
    track.className = 'ticker-track';
    tape.appendChild(track);

    document.body.insertBefore(tape, document.body.firstChild);
    document.body.classList.add('has-ticker');

    function buildItems() {
      var html = '';
      STOCKS.forEach(function (s) {
        var up = s.change >= 0;
        var cls = up ? 'tk-up' : 'tk-down';
        var arrow = up ? '&#9650;' : '&#9660;';
        var sign = up ? '+' : '';
        html += '<span class="tk-item">'
          + '<span class="tk-sym">' + s.symbol + '</span>'
          + '<span class="tk-price">' + s.currentPrice.toFixed(2) + '</span>'
          + '<span class="' + cls + '">' + arrow + ' ' + sign + s.changePct.toFixed(2) + '%</span>'
          + '</span>';
      });
      return html;
    }

    var content = buildItems();
    track.innerHTML = content + content; // duplicate for seamless loop

    // Update prices
    setInterval(function () {
      tickPrices();
      var items = track.querySelectorAll('.tk-item');
      var half = items.length / 2;
      for (var i = 0; i < half; i++) {
        var s = STOCKS[i];
        var up = s.change >= 0;
        var arrow = up ? '\u25B2' : '\u25BC';
        var sign = up ? '+' : '';
        var cls = up ? 'tk-up' : 'tk-down';

        [items[i], items[i + half]].forEach(function (item) {
          item.querySelector('.tk-price').textContent = s.currentPrice.toFixed(2);
          var chEl = item.querySelector('.tk-up, .tk-down');
          chEl.className = cls;
          chEl.textContent = arrow + ' ' + sign + s.changePct.toFixed(2) + '%';
        });
      }
    }, 3000);
  }


  // ==========================================
  //  STOCK SCREENER
  // ==========================================
  function initScreener() {
    var table = document.getElementById('screener-table');
    if (!table) return;

    var tbody = table.querySelector('tbody');
    var searchInput = document.getElementById('screener-search');
    var filterBtns = document.querySelectorAll('.sector-filter');
    var sortCol = 'symbol';
    var sortDir = 1;
    var activeSector = 'ALL';

    function formatVol(v) {
      if (v >= 1e9) return (v / 1e9).toFixed(1) + 'B';
      if (v >= 1e6) return (v / 1e6).toFixed(1) + 'M';
      if (v >= 1e3) return (v / 1e3).toFixed(0) + 'K';
      return v.toString();
    }

    function renderTable() {
      var query = searchInput ? searchInput.value.toLowerCase() : '';
      var filtered = STOCKS.filter(function (s) {
        var matchQuery = !query || s.symbol.toLowerCase().includes(query)
          || s.name.toLowerCase().includes(query)
          || s.sector.toLowerCase().includes(query);
        var matchSector = activeSector === 'ALL' || s.sector === activeSector;
        return matchQuery && matchSector;
      });

      filtered.sort(function (a, b) {
        var av, bv;
        switch (sortCol) {
          case 'symbol': av = a.symbol; bv = b.symbol; break;
          case 'name': av = a.name; bv = b.name; break;
          case 'price': av = a.currentPrice; bv = b.currentPrice; break;
          case 'change': av = a.change; bv = b.change; break;
          case 'changePct': av = a.changePct; bv = b.changePct; break;
          case 'volume': av = a.volume; bv = b.volume; break;
          case 'sector': av = a.sector; bv = b.sector; break;
          default: av = a.symbol; bv = b.symbol;
        }
        if (typeof av === 'string') return av.localeCompare(bv) * sortDir;
        return (av - bv) * sortDir;
      });

      tbody.innerHTML = '';
      filtered.forEach(function (s) {
        var up = s.change >= 0;
        var cls = up ? 'screener-up' : 'screener-down';
        var sign = up ? '+' : '';
        var arrow = up ? '\u25B2' : '\u25BC';
        var tr = document.createElement('tr');
        tr.innerHTML =
          '<td class="sc-sym">' + s.symbol + '</td>'
          + '<td class="sc-name">' + s.name + '</td>'
          + '<td>' + s.currentPrice.toFixed(2) + '</td>'
          + '<td class="' + cls + '">' + sign + s.change.toFixed(2) + '</td>'
          + '<td class="' + cls + '">' + arrow + ' ' + sign + s.changePct.toFixed(2) + '%</td>'
          + '<td>' + formatVol(s.volume) + '</td>'
          + '<td>' + s.cap + '</td>'
          + '<td class="sc-sector">' + s.sector + '</td>';
        tbody.appendChild(tr);
      });

      // Update count
      var countEl = document.getElementById('screener-count');
      if (countEl) countEl.textContent = filtered.length + ' / ' + STOCKS.length;
    }

    // Sortable headers
    table.querySelectorAll('th[data-sort]').forEach(function (th) {
      th.addEventListener('click', function () {
        var col = th.getAttribute('data-sort');
        if (sortCol === col) sortDir *= -1;
        else { sortCol = col; sortDir = 1; }
        table.querySelectorAll('th').forEach(function (h) {
          h.classList.remove('sort-asc', 'sort-desc');
        });
        th.classList.add(sortDir === 1 ? 'sort-asc' : 'sort-desc');
        renderTable();
      });
    });

    // Sector filters
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        activeSector = btn.getAttribute('data-sector');
        filterBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        renderTable();
      });
    });

    if (searchInput) {
      searchInput.addEventListener('input', function () { renderTable(); });
    }

    renderTable();
    setInterval(renderTable, 3000);
  }


  // ==========================================
  //  MARKET SENTIMENT
  // ==========================================
  function initSentiment() {
    var container = document.getElementById('sentiment-gauge');
    if (!container) return;

    var realSentiment = null;

    function compute() {
      var upCount = 0, totalPct = 0;
      STOCKS.forEach(function (s) {
        if (s.change >= 0) upCount++;
        totalPct += s.changePct;
      });

      var breadth = (upCount / STOCKS.length) * 100;
      var avgChange = totalPct / STOCKS.length;
      var vix = 14 + tickRng() * 18;
      var putCall = 0.65 + tickRng() * 0.85;

      // Blend real sentiment data if available
      if (realSentiment) {
        var bullishBias = realSentiment.bullishPct > 60 ? 1 : realSentiment.bullishPct < 40 ? -1 : 0;
        avgChange = avgChange * 0.6 + (bullishBias * 2) * 0.4;
      }

      // Composite score 0–100
      var score = Math.round(
        breadth * 0.35
        + Math.min(100, Math.max(0, 50 + avgChange * 18)) * 0.35
        + Math.min(100, Math.max(0, (40 - vix) / 40 * 100)) * 0.15
        + Math.min(100, Math.max(0, (1.5 - putCall) / 1.5 * 100)) * 0.15
      );
      score = Math.min(100, Math.max(0, score));

      var label, cls;
      if (score <= 20) { label = 'EXTREME FEAR'; cls = 'sent-xfear'; }
      else if (score <= 40) { label = 'FEAR'; cls = 'sent-fear'; }
      else if (score <= 60) { label = 'NEUTRAL'; cls = 'sent-neutral'; }
      else if (score <= 80) { label = 'GREED'; cls = 'sent-greed'; }
      else { label = 'EXTREME GREED'; cls = 'sent-xgreed'; }

      return {
        score: score, label: label, cls: cls,
        breadth: breadth, avgChange: avgChange, vix: vix, putCall: putCall,
        upCount: upCount, downCount: STOCKS.length - upCount
      };
    }

    function render() {
      var d = compute();
      container.innerHTML =
        '<div class="sent-header">'
          + '<div class="sent-score-wrap">'
            + '<div class="sent-score ' + d.cls + '">' + d.score + '</div>'
            + '<div class="sent-label">' + d.label + '</div>'
          + '</div>'
        + '</div>'
        + '<div class="sent-bar-wrap">'
          + '<div class="sent-bar"><div class="sent-fill" style="width:' + d.score + '%"></div></div>'
          + '<div class="sent-scale">'
            + '<span>0</span><span>20</span><span>40</span><span>60</span><span>80</span><span>100</span>'
          + '</div>'
        + '</div>'
        + '<div class="sent-indicators">'
          + '<div class="sent-ind">'
            + '<span class="sent-ind-label">BREADTH</span>'
            + '<span class="sent-ind-val">' + d.upCount + ' / ' + STOCKS.length + ' advancing</span>'
          + '</div>'
          + '<div class="sent-ind">'
            + '<span class="sent-ind-label">AVG CHANGE</span>'
            + '<span class="sent-ind-val ' + (d.avgChange >= 0 ? 'screener-up' : 'screener-down') + '">'
              + (d.avgChange >= 0 ? '+' : '') + d.avgChange.toFixed(2) + '%</span>'
          + '</div>'
          + '<div class="sent-ind">'
            + '<span class="sent-ind-label">VIX (IMPLIED)</span>'
            + '<span class="sent-ind-val">' + d.vix.toFixed(1) + '</span>'
          + '</div>'
          + '<div class="sent-ind">'
            + '<span class="sent-ind-label">PUT / CALL</span>'
            + '<span class="sent-ind-val">' + d.putCall.toFixed(2) + '</span>'
          + '</div>'
        + '</div>';
    }

    render();

    // Fetch real sentiment data and re-render
    MarketDataProvider.fetchSentiment(function (sentiment) {
      if (sentiment) {
        realSentiment = sentiment;
        render();
      }
    });

    // Update sentiment every 5 minutes
    setInterval(function () {
      MarketDataProvider.fetchSentiment(function (sentiment) {
        if (sentiment) {
          realSentiment = sentiment;
          render();
        }
      });
    }, 300000);
  }


  // ==========================================
  //  INIT
  // ==========================================
  function init() {
    // Initialize data provider first
    if (typeof MarketDataProvider !== 'undefined') {
      MarketDataProvider.init().then(function () {
        initializeFromProvider();
        createTicker();
        initScreener();
        initSentiment();
      }).catch(function (err) {
        console.error('MarketDataProvider init failed, using simulation mode:', err);
        createTicker();
        initScreener();
        initSentiment();
      });
    } else {
      // MarketDataProvider not loaded, use simulation
      createTicker();
      initScreener();
      initSentiment();
    }
  }

  // Handle both direct include and dynamic loading (after DOMContentLoaded)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.DeltaMarket = { stocks: STOCKS, tick: tickPrices };
})();
