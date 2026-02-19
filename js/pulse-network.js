/* ============================================
   PULSE NETWORK — Grid of nodes with signals
   Nodes pulse and propagate through connections
   ============================================ */
(function () {
  'use strict';

  var canvas = document.getElementById('network-canvas');
  if (!canvas) return;

  var ctx = canvas.getContext('2d');
  var dpr = window.devicePixelRatio || 1;
  var w, h, animId, time = 0;
  var nodes = [];
  var edges = [];
  var pulses = [];
  var COLS, ROWS;

  function resize() {
    var rect = canvas.parentElement.getBoundingClientRect();
    w = rect.width;
    h = Math.max(250, Math.min(400, w * 0.35));
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildGrid();
  }

  function buildGrid() {
    nodes = [];
    edges = [];
    var spacing = 50;
    COLS = Math.floor(w / spacing) + 1;
    ROWS = Math.floor(h / spacing) + 1;
    var offX = (w - (COLS - 1) * spacing) / 2;
    var offY = (h - (ROWS - 1) * spacing) / 2;

    for (var r = 0; r < ROWS; r++) {
      for (var c = 0; c < COLS; c++) {
        nodes.push({
          x: offX + c * spacing + (Math.random() - 0.5) * 12,
          y: offY + r * spacing + (Math.random() - 0.5) * 12,
          baseR: 1.5 + Math.random() * 1,
          r: 1.5,
          glow: 0,
          col: c,
          row: r
        });
      }
    }

    /* Build edges to neighbors */
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      for (var j = i + 1; j < nodes.length; j++) {
        var m = nodes[j];
        var dc = Math.abs(n.col - m.col);
        var dr = Math.abs(n.row - m.row);
        if (dc <= 1 && dr <= 1 && (dc + dr <= 2)) {
          edges.push({ a: i, b: j });
        }
      }
    }
  }

  function spawnPulse() {
    if (pulses.length > 8) return;
    var startIdx = Math.floor(Math.random() * nodes.length);
    pulses.push({
      node: startIdx,
      visited: [startIdx],
      life: 1,
      decay: 0.012 + Math.random() * 0.008
    });
    nodes[startIdx].glow = 1;
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    time += 0.016;

    /* Spawn pulses periodically */
    if (Math.random() < 0.04) spawnPulse();

    /* Update pulses — propagate to neighbors */
    for (var p = pulses.length - 1; p >= 0; p--) {
      var pulse = pulses[p];
      pulse.life -= pulse.decay;

      if (pulse.life <= 0) {
        pulses.splice(p, 1);
        continue;
      }

      /* Propagate */
      if (Math.random() < 0.08) {
        var currentNode = pulse.node;
        var neighbors = [];
        for (var e = 0; e < edges.length; e++) {
          if (edges[e].a === currentNode && pulse.visited.indexOf(edges[e].b) === -1) {
            neighbors.push(edges[e].b);
          } else if (edges[e].b === currentNode && pulse.visited.indexOf(edges[e].a) === -1) {
            neighbors.push(edges[e].a);
          }
        }
        if (neighbors.length > 0) {
          var next = neighbors[Math.floor(Math.random() * neighbors.length)];
          pulse.node = next;
          pulse.visited.push(next);
          nodes[next].glow = Math.max(nodes[next].glow, pulse.life);
        }
      }
    }

    /* Draw edges */
    for (var e = 0; e < edges.length; e++) {
      var a = nodes[edges[e].a];
      var b = nodes[edges[e].b];
      var edgeGlow = Math.max(a.glow, b.glow);
      var alpha = 0.03 + edgeGlow * 0.12;
      ctx.strokeStyle = 'rgba(17, 17, 17, ' + alpha + ')';
      ctx.lineWidth = 0.3 + edgeGlow * 0.7;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }

    /* Draw nodes */
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      n.glow *= 0.96;
      n.r = n.baseR + n.glow * 3;

      /* Glow ring */
      if (n.glow > 0.05) {
        var grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r + 8);
        grad.addColorStop(0, 'rgba(17, 17, 17, ' + (n.glow * 0.2) + ')');
        grad.addColorStop(1, 'rgba(17, 17, 17, 0)');
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + 8, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(17, 17, 17, ' + (0.1 + n.glow * 0.5) + ')';
      ctx.fill();
    }

    animId = requestAnimationFrame(draw);
  }

  var visible = false;
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting && !visible) { visible = true; draw(); }
      else if (!e.isIntersecting && visible) { visible = false; cancelAnimationFrame(animId); }
    });
  }, { threshold: 0.05 });

  function init() {
    resize();
    obs.observe(canvas);
    window.addEventListener('resize', resize);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
