/* ============================================
   DELTA CAPITAL — D3FC FINANCIAL CHARTS
   Candlestick & streaming price visualizations
   ============================================ */
(function () {
  'use strict';

  /* Wait for D3 + d3fc to load from CDN */
  function whenReady(cb) {
    var tries = 0;
    (function poll() {
      if (typeof d3 !== 'undefined' && typeof fc !== 'undefined') return cb();
      if (++tries > 200) return; // bail after ~10 s
      setTimeout(poll, 50);
    })();
  }

  function init() {
    var candleEl = document.getElementById('d3fc-candlestick');
    if (candleEl) candlestickChart(candleEl);

    var streamEl = document.getElementById('d3fc-stream');
    if (streamEl) streamChart(streamEl);
  }

  /* ------------------------------------------------
     Candlestick Chart — 90 days simulated price data
     ------------------------------------------------ */
  function candlestickChart(el) {
    var gen = fc.randomFinancial()
      .startDate(new Date(2025, 0, 2))
      .startPrice(100);

    var data = gen(90);

    var xExtent = fc.extentDate()
      .accessors([function (d) { return d.date; }]);

    var yExtent = fc.extentLinear()
      .accessors([
        function (d) { return d.high; },
        function (d) { return d.low; }
      ])
      .pad([0.1, 0.1]);

    var candlestick = fc.autoBandwidth(
      fc.seriesSvgCandlestick()
        .crossValue(function (d) { return d.date; })
        .openValue(function (d) { return d.open; })
        .highValue(function (d) { return d.high; })
        .lowValue(function (d) { return d.low; })
        .closeValue(function (d) { return d.close; })
    );

    var chart = fc.chartCartesian(d3.scaleTime(), d3.scaleLinear())
      .xDomain(xExtent(data))
      .yDomain(yExtent(data))
      .yOrient('right')
      .yTicks(5)
      .xTicks(6)
      .svgPlotArea(candlestick);

    d3.select(el)
      .datum(data)
      .call(chart);
  }

  /* ------------------------------------------------
     Streaming Line Chart — real-time price simulation
     ------------------------------------------------ */
  function streamChart(el) {
    var N = 120;
    var price = 100;
    var now = Date.now();
    var data = [];

    // Seed initial data
    for (var i = N; i > 0; i--) {
      price *= 1 + (Math.random() - 0.498) * 0.006;
      data.push({ date: new Date(now - i * 1000), value: price });
    }

    var line = fc.seriesSvgLine()
      .crossValue(function (d) { return d.date; })
      .mainValue(function (d) { return d.value; });

    var chart = fc.chartCartesian(d3.scaleTime(), d3.scaleLinear())
      .yOrient('right')
      .yTicks(4)
      .xTicks(0)
      .svgPlotArea(line);

    function render() {
      var xD = fc.extentDate()
        .accessors([function (d) { return d.date; }])(data);
      var yD = fc.extentLinear()
        .accessors([function (d) { return d.value; }])
        .pad([0.3, 0.3])(data);

      chart.xDomain(xD).yDomain(yD);
      d3.select(el).datum(data).call(chart);
    }

    render();

    setInterval(function () {
      price *= 1 + (Math.random() - 0.498) * 0.004;
      data.push({ date: new Date(), value: price });
      if (data.length > N) data.shift();
      render();
    }, 1000);
  }

  /* Bootstrap */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { whenReady(init); });
  } else {
    whenReady(init);
  }
})();
