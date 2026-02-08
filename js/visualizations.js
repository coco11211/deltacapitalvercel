/* ============================================
   DELTA CAPITAL — SCIENTIFIC VISUALIZATIONS
   Academic-grade Canvas rendering
   Style: SciencePlots + PlotNeuralNet inspired
   ============================================ */
(function () {
  'use strict';

  // --- Shared Plot Utilities ---
  var COLORS = {
    primary: '#111111',
    secondary: '#555555',
    tertiary: '#999999',
    faint: '#cccccc',
    veryFaint: '#e8e8e8',
    accent1: '#2b5ea7',   // muted blue
    accent2: '#c44e52',   // muted red
    accent3: '#4c8c2b',   // muted green
    accent4: '#e8a838',   // muted amber
    accent5: '#8172b2',   // muted purple
    accent6: '#64b5cd',   // muted teal
    bg: '#fafafa'
  };

  var DPR = window.devicePixelRatio || 1;

  function setupCanvas(canvas, w, h) {
    canvas.width = w * DPR;
    canvas.height = h * DPR;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    var ctx = canvas.getContext('2d');
    ctx.scale(DPR, DPR);
    return ctx;
  }

  // --- Plot Frame (axes, grid, labels) ---
  function drawPlotFrame(ctx, opts) {
    var m = opts.margin || { top: 30, right: 20, bottom: 40, left: 50 };
    var w = opts.width;
    var h = opts.height;
    var plotW = w - m.left - m.right;
    var plotH = h - m.top - m.bottom;

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(m.left, m.top, plotW, plotH);

    // Grid lines
    ctx.strokeStyle = COLORS.veryFaint;
    ctx.lineWidth = 0.5;
    var gridY = opts.gridY || 5;
    var gridX = opts.gridX || 5;
    for (var i = 0; i <= gridY; i++) {
      var y = m.top + (plotH / gridY) * i;
      ctx.beginPath();
      ctx.moveTo(m.left, y);
      ctx.lineTo(m.left + plotW, y);
      ctx.stroke();
    }
    for (var j = 0; j <= gridX; j++) {
      var x = m.left + (plotW / gridX) * j;
      ctx.beginPath();
      ctx.moveTo(x, m.top);
      ctx.lineTo(x, m.top + plotH);
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = COLORS.primary;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(m.left, m.top);
    ctx.lineTo(m.left, m.top + plotH);
    ctx.lineTo(m.left + plotW, m.top + plotH);
    ctx.stroke();

    // Tick marks and labels
    ctx.fillStyle = COLORS.tertiary;
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';

    if (opts.xLabels) {
      for (var k = 0; k < opts.xLabels.length; k++) {
        var xp = m.left + (plotW / (opts.xLabels.length - 1)) * k;
        ctx.beginPath();
        ctx.moveTo(xp, m.top + plotH);
        ctx.lineTo(xp, m.top + plotH + 4);
        ctx.strokeStyle = COLORS.primary;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillText(opts.xLabels[k], xp, m.top + plotH + 16);
      }
    }

    ctx.textAlign = 'right';
    if (opts.yLabels) {
      for (var l = 0; l < opts.yLabels.length; l++) {
        var yp = m.top + plotH - (plotH / (opts.yLabels.length - 1)) * l;
        ctx.beginPath();
        ctx.moveTo(m.left, yp);
        ctx.lineTo(m.left - 4, yp);
        ctx.strokeStyle = COLORS.primary;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillText(opts.yLabels[l], m.left - 8, yp + 3);
      }
    }

    // Axis titles
    ctx.fillStyle = COLORS.secondary;
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    if (opts.xTitle) {
      ctx.fillText(opts.xTitle, m.left + plotW / 2, m.top + plotH + 34);
    }
    if (opts.yTitle) {
      ctx.save();
      ctx.translate(12, m.top + plotH / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText(opts.yTitle, 0, 0);
      ctx.restore();
    }

    // Title
    if (opts.title) {
      ctx.fillStyle = COLORS.primary;
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(opts.title, m.left, m.top - 12);
    }

    return { x: m.left, y: m.top, w: plotW, h: plotH };
  }

  // --- Seeded Random ---
  function seededRandom(seed) {
    var s = seed;
    return function () {
      s = (s * 16807 + 0) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }

  // --- Normal distribution random (Box-Muller) ---
  function normalRandom(rng) {
    var u1 = rng();
    var u2 = rng();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  }


  /* ==========================================
     1. MONTE CARLO SIMULATION
     ========================================== */
  function drawMonteCarlo(canvasId) {
    var canvas = document.getElementById(canvasId);
    if (!canvas) return;

    var w = canvas.parentElement.offsetWidth;
    var h = 380;
    var ctx = setupCanvas(canvas, w, h);
    var margin = { top: 35, right: 25, bottom: 45, left: 60 };

    var plot = drawPlotFrame(ctx, {
      width: w, height: h, margin: margin,
      title: 'MONTE CARLO SIMULATION  —  1,000 PATHS',
      xTitle: 'TIME STEPS',
      yTitle: 'PORTFOLIO VALUE',
      xLabels: ['0', '50', '100', '150', '200', '250'],
      yLabels: ['0.8', '0.9', '1.0', '1.1', '1.2', '1.3', '1.4'],
      gridX: 5, gridY: 6
    });

    var nPaths = 200;
    var nSteps = 250;
    var mu = 0.0003;
    var sigma = 0.015;
    var rng = seededRandom(42);

    var paths = [];
    for (var p = 0; p < nPaths; p++) {
      var path = [1.0];
      for (var t = 1; t <= nSteps; t++) {
        var r = mu + sigma * normalRandom(rng);
        path.push(path[t - 1] * (1 + r));
      }
      paths.push(path);
    }

    // Compute mean and std bands
    var mean = [], upper2 = [], lower2 = [];
    for (var s = 0; s <= nSteps; s++) {
      var vals = paths.map(function (p) { return p[s]; });
      var avg = vals.reduce(function (a, b) { return a + b; }, 0) / vals.length;
      var variance = vals.reduce(function (a, b) { return a + (b - avg) * (b - avg); }, 0) / vals.length;
      var std = Math.sqrt(variance);
      mean.push(avg);
      upper2.push(avg + 2 * std);
      lower2.push(avg - 2 * std);
    }

    function mapX(i) { return plot.x + (i / nSteps) * plot.w; }
    function mapY(v) { return plot.y + plot.h - ((v - 0.8) / 0.6) * plot.h; }

    // Confidence band
    ctx.beginPath();
    for (var b = 0; b <= nSteps; b++) {
      var bx = mapX(b);
      if (b === 0) ctx.moveTo(bx, mapY(upper2[b]));
      else ctx.lineTo(bx, mapY(upper2[b]));
    }
    for (var b2 = nSteps; b2 >= 0; b2--) {
      ctx.lineTo(mapX(b2), mapY(lower2[b2]));
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(43, 94, 167, 0.08)';
    ctx.fill();

    // Individual paths
    for (var pi = 0; pi < nPaths; pi++) {
      ctx.beginPath();
      for (var ti = 0; ti <= nSteps; ti++) {
        var px = mapX(ti);
        var py = mapY(paths[pi][ti]);
        if (ti === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = 'rgba(43, 94, 167, 0.06)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    // +/- 2 sigma lines
    ctx.setLineDash([4, 3]);
    ctx.lineWidth = 1;
    ctx.strokeStyle = COLORS.accent2;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    for (var u = 0; u <= nSteps; u++) {
      if (u === 0) ctx.moveTo(mapX(u), mapY(upper2[u]));
      else ctx.lineTo(mapX(u), mapY(upper2[u]));
    }
    ctx.stroke();
    ctx.beginPath();
    for (var lo = 0; lo <= nSteps; lo++) {
      if (lo === 0) ctx.moveTo(mapX(lo), mapY(lower2[lo]));
      else ctx.lineTo(mapX(lo), mapY(lower2[lo]));
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.setLineDash([]);

    // Mean line
    ctx.beginPath();
    for (var mi = 0; mi <= nSteps; mi++) {
      if (mi === 0) ctx.moveTo(mapX(mi), mapY(mean[mi]));
      else ctx.lineTo(mapX(mi), mapY(mean[mi]));
    }
    ctx.strokeStyle = COLORS.primary;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Legend
    var lx = plot.x + plot.w - 140;
    var ly = plot.y + 15;
    ctx.font = '8px "JetBrains Mono", monospace';
    ctx.fillStyle = COLORS.tertiary;

    ctx.strokeStyle = COLORS.primary;
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx + 18, ly); ctx.stroke();
    ctx.fillText('MEAN', lx + 24, ly + 3);

    ctx.strokeStyle = COLORS.accent2;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 3]);
    ctx.beginPath(); ctx.moveTo(lx, ly + 14); ctx.lineTo(lx + 18, ly + 14); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillText('+/- 2\u03C3', lx + 24, ly + 17);

    ctx.fillStyle = 'rgba(43, 94, 167, 0.3)';
    ctx.fillRect(lx, ly + 25, 18, 8);
    ctx.fillStyle = COLORS.tertiary;
    ctx.fillText('PATHS', lx + 24, ly + 32);
  }


  /* ==========================================
     2. EFFICIENT FRONTIER
     ========================================== */
  function drawEfficientFrontier(canvasId) {
    var canvas = document.getElementById(canvasId);
    if (!canvas) return;

    var w = canvas.parentElement.offsetWidth;
    var h = 380;
    var ctx = setupCanvas(canvas, w, h);
    var margin = { top: 35, right: 25, bottom: 45, left: 60 };

    var plot = drawPlotFrame(ctx, {
      width: w, height: h, margin: margin,
      title: 'EFFICIENT FRONTIER  —  MEAN-VARIANCE OPTIMIZATION',
      xTitle: 'RISK (\u03C3)',
      yTitle: 'EXPECTED RETURN',
      xLabels: ['0%', '5%', '10%', '15%', '20%', '25%'],
      yLabels: ['0%', '5%', '10%', '15%', '20%'],
      gridX: 5, gridY: 4
    });

    function mapX(v) { return plot.x + (v / 25) * plot.w; }
    function mapY(v) { return plot.y + plot.h - (v / 20) * plot.h; }

    // Random portfolios (scatter)
    var rng = seededRandom(123);
    for (var i = 0; i < 300; i++) {
      var risk = 3 + rng() * 22;
      var maxReturn = -0.5 * risk * risk / 25 + 2.2 * risk - 3;
      var ret = maxReturn - rng() * (risk * 0.6);
      if (ret < 0) ret = rng() * 2;
      ctx.beginPath();
      ctx.arc(mapX(risk), mapY(ret), 2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(43, 94, 167, 0.15)';
      ctx.fill();
    }

    // Efficient frontier curve
    ctx.beginPath();
    ctx.strokeStyle = COLORS.primary;
    ctx.lineWidth = 2;
    for (var r = 4; r <= 24; r += 0.5) {
      var er = -0.5 * r * r / 25 + 2.2 * r - 3;
      if (r === 4) ctx.moveTo(mapX(r), mapY(er));
      else ctx.lineTo(mapX(r), mapY(er));
    }
    ctx.stroke();

    // Minimum variance point
    var mvR = 5.5, mvE = 4.5;
    ctx.beginPath();
    ctx.arc(mapX(mvR), mapY(mvE), 5, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.accent3;
    ctx.fill();
    ctx.font = '8px "JetBrains Mono", monospace';
    ctx.fillStyle = COLORS.accent3;
    ctx.textAlign = 'left';
    ctx.fillText('MIN VARIANCE', mapX(mvR) + 8, mapY(mvE) + 3);

    // Tangency / Max Sharpe
    var msR = 12, msE = 14.5;
    ctx.beginPath();
    ctx.arc(mapX(msR), mapY(msE), 5, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.accent2;
    ctx.fill();
    ctx.fillStyle = COLORS.accent2;
    ctx.fillText('MAX SHARPE', mapX(msR) + 8, mapY(msE) + 3);

    // Capital Market Line
    ctx.beginPath();
    ctx.strokeStyle = COLORS.accent4;
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 4]);
    var rf = 2;
    ctx.moveTo(mapX(0), mapY(rf));
    ctx.lineTo(mapX(24), mapY(rf + (msE - rf) / msR * 24));
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.font = '8px "JetBrains Mono", monospace';
    ctx.fillStyle = COLORS.accent4;
    ctx.fillText('CML', mapX(22), mapY(rf + (msE - rf) / msR * 22) - 6);

    // Risk-free rate label
    ctx.fillStyle = COLORS.tertiary;
    ctx.textAlign = 'left';
    ctx.fillText('Rf = 2%', mapX(0.5), mapY(rf) - 6);
  }


  /* ==========================================
     3. VaR DISTRIBUTION
     ========================================== */
  function drawVaRDistribution(canvasId) {
    var canvas = document.getElementById(canvasId);
    if (!canvas) return;

    var w = canvas.parentElement.offsetWidth;
    var h = 340;
    var ctx = setupCanvas(canvas, w, h);
    var margin = { top: 35, right: 25, bottom: 45, left: 50 };

    var plot = drawPlotFrame(ctx, {
      width: w, height: h, margin: margin,
      title: 'PORTFOLIO RETURN DISTRIBUTION  —  VALUE AT RISK',
      xTitle: 'DAILY RETURN',
      yTitle: 'DENSITY',
      xLabels: ['-4\u03C3', '-3\u03C3', '-2\u03C3', '-1\u03C3', '0', '+1\u03C3', '+2\u03C3', '+3\u03C3', '+4\u03C3'],
      yLabels: ['0.0', '0.1', '0.2', '0.3', '0.4'],
      gridX: 8, gridY: 4
    });

    function mapX(v) { return plot.x + ((v + 4) / 8) * plot.w; }
    function mapY(v) { return plot.y + plot.h - (v / 0.4) * plot.h; }
    function normalPDF(x, mu, sig) {
      return Math.exp(-0.5 * Math.pow((x - mu) / sig, 2)) / (sig * Math.sqrt(2 * Math.PI));
    }

    // Fat-tailed distribution (mixture)
    function fatTailPDF(x) {
      return 0.85 * normalPDF(x, 0, 1) + 0.15 * normalPDF(x, -0.3, 2.2);
    }

    // VaR threshold (95th percentile ~ -1.65)
    var varThreshold = -1.65;

    // Fill tail region (loss zone)
    ctx.beginPath();
    ctx.moveTo(mapX(-4), mapY(0));
    for (var x = -4; x <= varThreshold; x += 0.05) {
      ctx.lineTo(mapX(x), mapY(fatTailPDF(x)));
    }
    ctx.lineTo(mapX(varThreshold), mapY(0));
    ctx.closePath();
    ctx.fillStyle = 'rgba(196, 78, 82, 0.2)';
    ctx.fill();

    // CVaR region (darker)
    ctx.beginPath();
    ctx.moveTo(mapX(-4), mapY(0));
    for (var xc = -4; xc <= -2.33; xc += 0.05) {
      ctx.lineTo(mapX(xc), mapY(fatTailPDF(xc)));
    }
    ctx.lineTo(mapX(-2.33), mapY(0));
    ctx.closePath();
    ctx.fillStyle = 'rgba(196, 78, 82, 0.35)';
    ctx.fill();

    // Main distribution curve
    ctx.beginPath();
    for (var xd = -4; xd <= 4; xd += 0.05) {
      var yv = fatTailPDF(xd);
      if (xd === -4) ctx.moveTo(mapX(xd), mapY(yv));
      else ctx.lineTo(mapX(xd), mapY(yv));
    }
    ctx.strokeStyle = COLORS.primary;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Normal distribution overlay (thin, dashed)
    ctx.beginPath();
    for (var xn = -4; xn <= 4; xn += 0.05) {
      var yn = normalPDF(xn, 0, 1);
      if (xn === -4) ctx.moveTo(mapX(xn), mapY(yn));
      else ctx.lineTo(mapX(xn), mapY(yn));
    }
    ctx.strokeStyle = COLORS.accent1;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 3]);
    ctx.stroke();
    ctx.setLineDash([]);

    // VaR line
    ctx.beginPath();
    ctx.moveTo(mapX(varThreshold), mapY(0));
    ctx.lineTo(mapX(varThreshold), mapY(fatTailPDF(varThreshold)));
    ctx.strokeStyle = COLORS.accent2;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Labels
    ctx.font = '8px "JetBrains Mono", monospace';
    ctx.fillStyle = COLORS.accent2;
    ctx.textAlign = 'center';
    ctx.fillText('95% VaR', mapX(varThreshold), mapY(fatTailPDF(varThreshold)) - 8);

    ctx.fillStyle = 'rgba(196, 78, 82, 0.7)';
    ctx.fillText('CVaR', mapX(-3.1), mapY(0.02) - 4);

    // Legend
    var lx = plot.x + plot.w - 150;
    var ly = plot.y + 15;
    ctx.font = '8px "JetBrains Mono", monospace';
    ctx.fillStyle = COLORS.tertiary;

    ctx.strokeStyle = COLORS.primary;
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx + 18, ly); ctx.stroke();
    ctx.fillText('EMPIRICAL', lx + 24, ly + 3);

    ctx.strokeStyle = COLORS.accent1;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 3]);
    ctx.beginPath(); ctx.moveTo(lx, ly + 14); ctx.lineTo(lx + 18, ly + 14); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillText('NORMAL', lx + 24, ly + 17);
  }


  /* ==========================================
     4. NEURAL NETWORK ARCHITECTURE
     ========================================== */
  function drawNeuralNetwork(canvasId) {
    var canvas = document.getElementById(canvasId);
    if (!canvas) return;

    var w = canvas.parentElement.offsetWidth;
    var h = 360;
    var ctx = setupCanvas(canvas, w, h);

    // Title
    ctx.fillStyle = COLORS.primary;
    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('ENSEMBLE MODEL ARCHITECTURE', 20, 25);

    var layers = [
      { name: 'INPUT', nodes: 8, color: COLORS.accent1, w: 28, label: 'Features\n(n=127)' },
      { name: 'DENSE', nodes: 6, color: COLORS.accent5, w: 32, label: 'Dense\n(256)' },
      { name: 'DENSE', nodes: 6, color: COLORS.accent5, w: 32, label: 'Dense\n(128)' },
      { name: 'DROPOUT', nodes: 5, color: COLORS.accent4, w: 28, label: 'Dropout\n(p=0.3)' },
      { name: 'DENSE', nodes: 4, color: COLORS.accent5, w: 32, label: 'Dense\n(64)' },
      { name: 'BATCH', nodes: 4, color: COLORS.accent6, w: 28, label: 'BatchNorm' },
      { name: 'OUTPUT', nodes: 3, color: COLORS.accent3, w: 28, label: 'Output\n(signals)' }
    ];

    var startX = 60;
    var gapX = (w - 120) / (layers.length - 1);
    var centerY = h / 2 + 10;
    var nodeSpacing = 30;

    // Store node positions
    var positions = [];
    layers.forEach(function (layer, li) {
      var layerPos = [];
      var x = startX + li * gapX;
      var totalH = (layer.nodes - 1) * nodeSpacing;
      for (var ni = 0; ni < layer.nodes; ni++) {
        var y = centerY - totalH / 2 + ni * nodeSpacing;
        layerPos.push({ x: x, y: y });
      }
      positions.push(layerPos);
    });

    // Draw connections
    for (var li = 0; li < positions.length - 1; li++) {
      for (var fi = 0; fi < positions[li].length; fi++) {
        for (var ti = 0; ti < positions[li + 1].length; ti++) {
          ctx.beginPath();
          ctx.moveTo(positions[li][fi].x + 10, positions[li][fi].y);
          ctx.lineTo(positions[li + 1][ti].x - 10, positions[li + 1][ti].y);
          ctx.strokeStyle = 'rgba(0,0,0,0.04)';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    // Draw nodes
    layers.forEach(function (layer, li) {
      positions[li].forEach(function (pos) {
        // Outer glow
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 10, 0, Math.PI * 2);
        ctx.fillStyle = layer.color + '15';
        ctx.fill();

        // Node
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = layer.color + '30';
        ctx.fill();
        ctx.strokeStyle = layer.color;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Inner dot
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = layer.color;
        ctx.fill();
      });

      // Layer label
      var topY = positions[li][0].y;
      ctx.font = '7px "JetBrains Mono", monospace';
      ctx.fillStyle = COLORS.tertiary;
      ctx.textAlign = 'center';
      var labelLines = layer.label.split('\n');
      labelLines.forEach(function (line, idx) {
        ctx.fillText(line, positions[li][0].x, topY - 22 + idx * 10);
      });
    });

    // Parallel model branches label
    ctx.font = '8px "JetBrains Mono", monospace';
    ctx.fillStyle = COLORS.tertiary;
    ctx.textAlign = 'center';
    ctx.fillText('XGBOOST', w / 2, h - 40);
    ctx.fillText('LIGHTGBM', w / 2 - 80, h - 40);
    ctx.fillText('NEURAL NET', w / 2 + 80, h - 40);

    // Brackets
    ctx.strokeStyle = COLORS.faint;
    ctx.lineWidth = 0.8;
    [w / 2 - 80, w / 2, w / 2 + 80].forEach(function (bx) {
      ctx.beginPath();
      ctx.moveTo(bx - 25, h - 32);
      ctx.lineTo(bx - 25, h - 28);
      ctx.lineTo(bx + 25, h - 28);
      ctx.lineTo(bx + 25, h - 32);
      ctx.stroke();
    });

    // Ensemble arrow
    ctx.beginPath();
    ctx.moveTo(w / 2 - 100, h - 22);
    ctx.lineTo(w / 2 + 100, h - 22);
    ctx.strokeStyle = COLORS.faint;
    ctx.lineWidth = 0.8;
    ctx.stroke();
    ctx.fillStyle = COLORS.tertiary;
    ctx.font = '7px "JetBrains Mono", monospace';
    ctx.fillText('WEIGHTED ENSEMBLE AGGREGATION', w / 2, h - 12);
  }


  /* ==========================================
     5. WALK-FORWARD ANALYSIS
     ========================================== */
  function drawWalkForward(canvasId) {
    var canvas = document.getElementById(canvasId);
    if (!canvas) return;

    var w = canvas.parentElement.offsetWidth;
    var h = 260;
    var ctx = setupCanvas(canvas, w, h);

    ctx.fillStyle = COLORS.primary;
    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('WALK-FORWARD VALIDATION PROTOCOL', 20, 25);

    var nWindows = 6;
    var barH = 24;
    var gap = 8;
    var startX = 80;
    var maxW = w - 120;
    var startY = 55;

    for (var i = 0; i < nWindows; i++) {
      var y = startY + i * (barH + gap);
      var trainStart = (i * maxW) / (nWindows + 2);
      var trainW = maxW * 0.45;
      var testW = maxW * 0.12;

      // Window label
      ctx.font = '8px "JetBrains Mono", monospace';
      ctx.fillStyle = COLORS.tertiary;
      ctx.textAlign = 'right';
      ctx.fillText('W' + (i + 1), startX - 10, y + barH / 2 + 3);

      // Timeline background
      ctx.fillStyle = COLORS.veryFaint;
      ctx.fillRect(startX, y, maxW, barH);

      // Train block
      ctx.fillStyle = COLORS.accent1 + '30';
      ctx.fillRect(startX + trainStart, y, trainW, barH);
      ctx.strokeStyle = COLORS.accent1;
      ctx.lineWidth = 1;
      ctx.strokeRect(startX + trainStart, y, trainW, barH);

      // Test block
      ctx.fillStyle = COLORS.accent3 + '30';
      ctx.fillRect(startX + trainStart + trainW, y, testW, barH);
      ctx.strokeStyle = COLORS.accent3;
      ctx.lineWidth = 1;
      ctx.strokeRect(startX + trainStart + trainW, y, testW, barH);
    }

    // Legend
    var ly = startY + nWindows * (barH + gap) + 15;
    ctx.font = '8px "JetBrains Mono", monospace';

    ctx.fillStyle = COLORS.accent1 + '30';
    ctx.fillRect(startX, ly, 14, 10);
    ctx.strokeStyle = COLORS.accent1;
    ctx.strokeRect(startX, ly, 14, 10);
    ctx.fillStyle = COLORS.tertiary;
    ctx.textAlign = 'left';
    ctx.fillText('TRAINING', startX + 20, ly + 8);

    ctx.fillStyle = COLORS.accent3 + '30';
    ctx.fillRect(startX + 90, ly, 14, 10);
    ctx.strokeStyle = COLORS.accent3;
    ctx.strokeRect(startX + 90, ly, 14, 10);
    ctx.fillStyle = COLORS.tertiary;
    ctx.fillText('TESTING (OUT-OF-SAMPLE)', startX + 110, ly + 8);

    // Time arrow
    ctx.beginPath();
    ctx.moveTo(startX, ly + 28);
    ctx.lineTo(startX + maxW, ly + 28);
    ctx.lineTo(startX + maxW - 6, ly + 24);
    ctx.moveTo(startX + maxW, ly + 28);
    ctx.lineTo(startX + maxW - 6, ly + 32);
    ctx.strokeStyle = COLORS.tertiary;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = COLORS.tertiary;
    ctx.font = '8px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('TIME \u2192', startX + maxW / 2, ly + 44);
  }


  /* ==========================================
     6. CORRELATION HEATMAP
     ========================================== */
  function drawCorrelationMatrix(canvasId) {
    var canvas = document.getElementById(canvasId);
    if (!canvas) return;

    var w = Math.min(canvas.parentElement.offsetWidth, 420);
    var h = 400;
    var ctx = setupCanvas(canvas, w, h);

    ctx.fillStyle = COLORS.primary;
    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('FACTOR CORRELATION MATRIX', 20, 25);

    var labels = ['MOM', 'REV', 'VOL', 'VAL', 'SIZE', 'QUAL', 'BETA', 'LIQ'];
    var n = labels.length;
    var rng = seededRandom(777);

    // Generate symmetric correlation matrix
    var matrix = [];
    for (var i = 0; i < n; i++) {
      matrix[i] = [];
      for (var j = 0; j < n; j++) {
        if (i === j) matrix[i][j] = 1.0;
        else if (j < i) matrix[i][j] = matrix[j][i];
        else {
          var base = rng() * 1.4 - 0.7;
          matrix[i][j] = Math.max(-1, Math.min(1, base));
        }
      }
    }

    var cellSize = Math.min(36, (w - 100) / n);
    var startX = 65;
    var startY = 50;

    function getColor(val) {
      if (val >= 0) {
        var intensity = Math.floor(val * 180);
        return 'rgb(' + (43 + (255 - 43) * (1 - val)) + ',' + (94 + (255 - 94) * (1 - val)) + ',' + (167) + ')';
      } else {
        var absVal = Math.abs(val);
        return 'rgb(' + (196) + ',' + (78 + (255 - 78) * (1 - absVal)) + ',' + (82 + (255 - 82) * (1 - absVal)) + ')';
      }
    }

    // Draw cells
    for (var ci = 0; ci < n; ci++) {
      for (var cj = 0; cj < n; cj++) {
        var cx = startX + cj * cellSize;
        var cy = startY + ci * cellSize;
        var val = matrix[ci][cj];

        ctx.fillStyle = getColor(val);
        ctx.globalAlpha = Math.abs(val) * 0.6 + 0.1;
        ctx.fillRect(cx, cy, cellSize - 1, cellSize - 1);
        ctx.globalAlpha = 1;

        // Value text
        if (cellSize >= 28) {
          ctx.font = '7px "JetBrains Mono", monospace';
          ctx.fillStyle = Math.abs(val) > 0.5 ? '#fff' : COLORS.secondary;
          ctx.textAlign = 'center';
          ctx.fillText(val.toFixed(2), cx + cellSize / 2 - 0.5, cy + cellSize / 2 + 2);
        }
      }
    }

    // Row/Column labels
    ctx.font = '8px "JetBrains Mono", monospace';
    ctx.fillStyle = COLORS.tertiary;
    for (var li = 0; li < n; li++) {
      ctx.textAlign = 'right';
      ctx.fillText(labels[li], startX - 6, startY + li * cellSize + cellSize / 2 + 3);
      ctx.textAlign = 'center';
      ctx.save();
      ctx.translate(startX + li * cellSize + cellSize / 2, startY - 6);
      ctx.rotate(-Math.PI / 4);
      ctx.fillText(labels[li], 0, 0);
      ctx.restore();
    }

    // Color scale
    var scaleX = startX + n * cellSize + 15;
    var scaleH = n * cellSize;
    var scaleW = 12;
    for (var si = 0; si < scaleH; si++) {
      var sv = 1 - (si / scaleH) * 2;
      ctx.fillStyle = getColor(sv);
      ctx.globalAlpha = Math.abs(sv) * 0.6 + 0.1;
      ctx.fillRect(scaleX, startY + si, scaleW, 1);
    }
    ctx.globalAlpha = 1;
    ctx.strokeStyle = COLORS.faint;
    ctx.lineWidth = 0.5;
    ctx.strokeRect(scaleX, startY, scaleW, scaleH);

    ctx.font = '7px "JetBrains Mono", monospace';
    ctx.fillStyle = COLORS.tertiary;
    ctx.textAlign = 'left';
    ctx.fillText('+1.0', scaleX + scaleW + 4, startY + 6);
    ctx.fillText(' 0.0', scaleX + scaleW + 4, startY + scaleH / 2 + 3);
    ctx.fillText('-1.0', scaleX + scaleW + 4, startY + scaleH);
  }


  /* ==========================================
     7. DRAWDOWN CHART
     ========================================== */
  function drawDrawdown(canvasId) {
    var canvas = document.getElementById(canvasId);
    if (!canvas) return;

    var w = canvas.parentElement.offsetWidth;
    var h = 300;
    var ctx = setupCanvas(canvas, w, h);
    var margin = { top: 35, right: 25, bottom: 45, left: 55 };

    var plot = drawPlotFrame(ctx, {
      width: w, height: h, margin: margin,
      title: 'MAXIMUM DRAWDOWN ANALYSIS',
      xTitle: 'TIME',
      yTitle: 'DRAWDOWN',
      xLabels: ['0', '', '60', '', '120', '', '180', '', '240'],
      yLabels: ['0%', '-5%', '-10%', '-15%', '-20%'],
      gridX: 8, gridY: 4
    });

    var nSteps = 240;
    var rng = seededRandom(314);

    // Generate equity curve then compute drawdown
    var equity = [100];
    for (var t = 1; t <= nSteps; t++) {
      var r = 0.0004 + 0.012 * normalRandom(rng);
      equity.push(equity[t - 1] * (1 + r));
    }

    var peak = equity[0];
    var drawdowns = [0];
    for (var d = 1; d <= nSteps; d++) {
      if (equity[d] > peak) peak = equity[d];
      drawdowns.push(((equity[d] - peak) / peak) * 100);
    }

    function mapX(i) { return plot.x + (i / nSteps) * plot.w; }
    function mapY(v) { return plot.y + (Math.abs(v) / 20) * plot.h; }

    // Fill drawdown area
    ctx.beginPath();
    ctx.moveTo(mapX(0), plot.y);
    for (var di = 0; di <= nSteps; di++) {
      ctx.lineTo(mapX(di), mapY(drawdowns[di]));
    }
    ctx.lineTo(mapX(nSteps), plot.y);
    ctx.closePath();
    ctx.fillStyle = 'rgba(196, 78, 82, 0.12)';
    ctx.fill();

    // Drawdown line
    ctx.beginPath();
    for (var dl = 0; dl <= nSteps; dl++) {
      if (dl === 0) ctx.moveTo(mapX(dl), mapY(drawdowns[dl]));
      else ctx.lineTo(mapX(dl), mapY(drawdowns[dl]));
    }
    ctx.strokeStyle = COLORS.accent2;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Find max drawdown
    var maxDD = 0, maxDDIdx = 0;
    drawdowns.forEach(function (dd, idx) {
      if (dd < maxDD) { maxDD = dd; maxDDIdx = idx; }
    });

    // Mark max drawdown
    ctx.beginPath();
    ctx.arc(mapX(maxDDIdx), mapY(drawdowns[maxDDIdx]), 4, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.accent2;
    ctx.fill();
    ctx.font = '8px "JetBrains Mono", monospace';
    ctx.fillStyle = COLORS.accent2;
    ctx.textAlign = 'left';
    ctx.fillText('MAX DD: ' + maxDD.toFixed(1) + '%', mapX(maxDDIdx) + 8, mapY(drawdowns[maxDDIdx]) + 3);
  }


  /* ==========================================
     8. RISK PARITY ALLOCATION
     ========================================== */
  function drawRiskParity(canvasId) {
    var canvas = document.getElementById(canvasId);
    if (!canvas) return;

    var w = Math.min(canvas.parentElement.offsetWidth, 500);
    var h = 340;
    var ctx = setupCanvas(canvas, w, h);

    ctx.fillStyle = COLORS.primary;
    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('RISK PARITY DECOMPOSITION', 20, 25);

    var assets = [
      { name: 'EQUITIES', weight: 0.22, riskContrib: 0.20, color: COLORS.accent1 },
      { name: 'FIXED INC', weight: 0.35, riskContrib: 0.20, color: COLORS.accent5 },
      { name: 'COMMODITIES', weight: 0.18, riskContrib: 0.20, color: COLORS.accent4 },
      { name: 'FX', weight: 0.15, riskContrib: 0.20, color: COLORS.accent3 },
      { name: 'ALT', weight: 0.10, riskContrib: 0.20, color: COLORS.accent2 }
    ];

    var barW = (w - 160) / 2;
    var barH = 22;
    var gap = 12;
    var startY = 60;
    var leftX = 90;
    var rightX = leftX + barW + 50;

    // Column headers
    ctx.font = '8px "JetBrains Mono", monospace';
    ctx.fillStyle = COLORS.tertiary;
    ctx.textAlign = 'center';
    ctx.fillText('CAPITAL WEIGHT', leftX + barW / 2, startY - 8);
    ctx.fillText('RISK CONTRIBUTION', rightX + barW / 2, startY - 8);

    assets.forEach(function (asset, i) {
      var y = startY + i * (barH + gap);

      // Label
      ctx.font = '8px "JetBrains Mono", monospace';
      ctx.fillStyle = COLORS.secondary;
      ctx.textAlign = 'right';
      ctx.fillText(asset.name, leftX - 10, y + barH / 2 + 3);

      // Capital weight bar
      ctx.fillStyle = asset.color + '25';
      ctx.fillRect(leftX, y, barW * asset.weight / 0.4, barH);
      ctx.strokeStyle = asset.color;
      ctx.lineWidth = 1;
      ctx.strokeRect(leftX, y, barW * asset.weight / 0.4, barH);
      ctx.fillStyle = COLORS.secondary;
      ctx.textAlign = 'left';
      ctx.font = '7px "JetBrains Mono", monospace';
      ctx.fillText((asset.weight * 100).toFixed(0) + '%', leftX + barW * asset.weight / 0.4 + 5, y + barH / 2 + 3);

      // Risk contribution bar (all equal in risk parity)
      ctx.fillStyle = asset.color + '25';
      ctx.fillRect(rightX, y, barW * asset.riskContrib / 0.4, barH);
      ctx.strokeStyle = asset.color;
      ctx.strokeRect(rightX, y, barW * asset.riskContrib / 0.4, barH);
      ctx.fillStyle = COLORS.secondary;
      ctx.fillText((asset.riskContrib * 100).toFixed(0) + '%', rightX + barW * asset.riskContrib / 0.4 + 5, y + barH / 2 + 3);
    });

    // Annotation
    ctx.font = '8px "JetBrains Mono", monospace';
    ctx.fillStyle = COLORS.tertiary;
    ctx.textAlign = 'center';
    var annY = startY + assets.length * (barH + gap) + 20;
    ctx.fillText('UNEQUAL WEIGHTS \u2192 EQUAL RISK', w / 2, annY);
  }


  /* ==========================================
     9. SIGNAL DECAY CURVES
     ========================================== */
  function drawSignalDecay(canvasId) {
    var canvas = document.getElementById(canvasId);
    if (!canvas) return;

    var w = canvas.parentElement.offsetWidth;
    var h = 300;
    var ctx = setupCanvas(canvas, w, h);
    var margin = { top: 35, right: 25, bottom: 45, left: 55 };

    var plot = drawPlotFrame(ctx, {
      width: w, height: h, margin: margin,
      title: 'SIGNAL DECAY  —  ALPHA HALF-LIFE ANALYSIS',
      xTitle: 'HOLDING PERIOD (DAYS)',
      yTitle: 'INFORMATION COEFFICIENT',
      xLabels: ['0', '5', '10', '15', '20', '25', '30'],
      yLabels: ['0.00', '0.02', '0.04', '0.06', '0.08', '0.10'],
      gridX: 6, gridY: 5
    });

    function mapX(v) { return plot.x + (v / 30) * plot.w; }
    function mapY(v) { return plot.y + plot.h - (v / 0.10) * plot.h; }

    var signals = [
      { name: 'MOMENTUM', halfLife: 8, ic0: 0.09, color: COLORS.accent1 },
      { name: 'MEAN-REV', halfLife: 3, ic0: 0.07, color: COLORS.accent2 },
      { name: 'SENTIMENT', halfLife: 1.5, ic0: 0.05, color: COLORS.accent4 },
      { name: 'COMPOSITE', halfLife: 6, ic0: 0.085, color: COLORS.accent3 }
    ];

    signals.forEach(function (sig) {
      ctx.beginPath();
      for (var t = 0; t <= 30; t += 0.5) {
        var ic = sig.ic0 * Math.exp(-0.693 * t / sig.halfLife);
        if (t === 0) ctx.moveTo(mapX(t), mapY(ic));
        else ctx.lineTo(mapX(t), mapY(ic));
      }
      ctx.strokeStyle = sig.color;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Half-life marker
      var hlY = sig.ic0 / 2;
      ctx.setLineDash([2, 3]);
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(mapX(sig.halfLife), mapY(0));
      ctx.lineTo(mapX(sig.halfLife), mapY(hlY));
      ctx.lineTo(mapX(0), mapY(hlY));
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // Legend
    var lx = plot.x + plot.w - 130;
    var ly = plot.y + 12;
    signals.forEach(function (sig, i) {
      var lyy = ly + i * 14;
      ctx.strokeStyle = sig.color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(lx, lyy);
      ctx.lineTo(lx + 16, lyy);
      ctx.stroke();
      ctx.font = '7px "JetBrains Mono", monospace';
      ctx.fillStyle = COLORS.tertiary;
      ctx.textAlign = 'left';
      ctx.fillText(sig.name + ' (t\u00BD=' + sig.halfLife + 'd)', lx + 22, lyy + 3);
    });
  }


  /* ==========================================
     10. SHARPE RATIO COMPARISON
     ========================================== */
  function drawSharpeComparison(canvasId) {
    var canvas = document.getElementById(canvasId);
    if (!canvas) return;

    var w = canvas.parentElement.offsetWidth;
    var h = 300;
    var ctx = setupCanvas(canvas, w, h);
    var margin = { top: 35, right: 25, bottom: 55, left: 55 };

    var strategies = [
      { name: 'MOMENTUM', sharpe: 1.42, sortino: 2.1, color: COLORS.accent1 },
      { name: 'MEAN-REV', sharpe: 0.95, sortino: 1.4, color: COLORS.accent2 },
      { name: 'PAIRS', sharpe: 1.18, sortino: 1.7, color: COLORS.accent4 },
      { name: 'STAT-ARB', sharpe: 1.65, sortino: 2.4, color: COLORS.accent3 },
      { name: 'ENSEMBLE', sharpe: 1.89, sortino: 2.8, color: COLORS.accent5 }
    ];

    var plot = drawPlotFrame(ctx, {
      width: w, height: h, margin: margin,
      title: 'RISK-ADJUSTED PERFORMANCE  —  STRATEGY COMPARISON',
      xLabels: strategies.map(function (s) { return s.name; }),
      yTitle: 'RATIO',
      yLabels: ['0.0', '0.5', '1.0', '1.5', '2.0', '2.5', '3.0'],
      gridX: strategies.length - 1, gridY: 6
    });

    function mapY(v) { return plot.y + plot.h - (v / 3.0) * plot.h; }

    var groupW = plot.w / strategies.length;
    var barW = groupW * 0.3;

    strategies.forEach(function (strat, i) {
      var cx = plot.x + groupW * i + groupW / 2;

      // Sharpe bar
      var sx = cx - barW - 2;
      var sh = (strat.sharpe / 3.0) * plot.h;
      ctx.fillStyle = strat.color + '35';
      ctx.fillRect(sx, plot.y + plot.h - sh, barW, sh);
      ctx.strokeStyle = strat.color;
      ctx.lineWidth = 1;
      ctx.strokeRect(sx, plot.y + plot.h - sh, barW, sh);

      // Sortino bar
      var sox = cx + 2;
      var soh = (strat.sortino / 3.0) * plot.h;
      ctx.fillStyle = strat.color + '15';
      ctx.fillRect(sox, plot.y + plot.h - soh, barW, soh);
      ctx.strokeStyle = strat.color;
      ctx.setLineDash([3, 2]);
      ctx.strokeRect(sox, plot.y + plot.h - soh, barW, soh);
      ctx.setLineDash([]);

      // Values
      ctx.font = '7px "JetBrains Mono", monospace';
      ctx.fillStyle = COLORS.secondary;
      ctx.textAlign = 'center';
      ctx.fillText(strat.sharpe.toFixed(2), sx + barW / 2, plot.y + plot.h - sh - 5);
      ctx.fillText(strat.sortino.toFixed(1), sox + barW / 2, plot.y + plot.h - soh - 5);
    });

    // Legend
    ctx.font = '8px "JetBrains Mono", monospace';
    ctx.fillStyle = COLORS.tertiary;
    ctx.textAlign = 'left';

    ctx.fillStyle = COLORS.accent5 + '35';
    ctx.fillRect(plot.x, plot.y + plot.h + 30, 12, 8);
    ctx.strokeStyle = COLORS.accent5;
    ctx.lineWidth = 1;
    ctx.strokeRect(plot.x, plot.y + plot.h + 30, 12, 8);
    ctx.fillStyle = COLORS.tertiary;
    ctx.fillText('SHARPE', plot.x + 18, plot.y + plot.h + 37);

    ctx.fillStyle = COLORS.accent5 + '15';
    ctx.fillRect(plot.x + 80, plot.y + plot.h + 30, 12, 8);
    ctx.setLineDash([3, 2]);
    ctx.strokeRect(plot.x + 80, plot.y + plot.h + 30, 12, 8);
    ctx.setLineDash([]);
    ctx.fillStyle = COLORS.tertiary;
    ctx.fillText('SORTINO', plot.x + 98, plot.y + plot.h + 37);
  }


  /* ==========================================
     INIT — Attach to scroll reveals
     ========================================== */
  var drawn = {};

  function initVisualization(canvasId, drawFn) {
    var canvas = document.getElementById(canvasId);
    if (!canvas) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !drawn[canvasId]) {
          drawn[canvasId] = true;
          drawFn(canvasId);
        }
      });
    }, { threshold: 0.2 });

    observer.observe(canvas);

    // Redraw on resize
    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        if (drawn[canvasId]) drawFn(canvasId);
      }, 200);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initVisualization('viz-montecarlo', drawMonteCarlo);
    initVisualization('viz-frontier', drawEfficientFrontier);
    initVisualization('viz-var', drawVaRDistribution);
    initVisualization('viz-neural', drawNeuralNetwork);
    initVisualization('viz-walkforward', drawWalkForward);
    initVisualization('viz-correlation', drawCorrelationMatrix);
    initVisualization('viz-drawdown', drawDrawdown);
    initVisualization('viz-riskparity', drawRiskParity);
    initVisualization('viz-signaldecay', drawSignalDecay);
    initVisualization('viz-sharpe', drawSharpeComparison);
  });

})();
