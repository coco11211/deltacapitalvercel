/* ============================================
   DELTA CAPITAL — ARCHITECTURE PAGE
   Scroll-driven system assembly animation
   ============================================ */
(function () {
  'use strict';

  function initArchCanvas() {
    var canvas = document.getElementById('arch-canvas');
    if (!canvas) return;

    var ctx = canvas.getContext('2d');
    var w, h;
    var scrollProgress = 0;

    var nodes = [
      { label: 'DATA INGESTION', x: 0.15, y: 0.12 },
      { label: 'FEATURE ENGINEERING', x: 0.5, y: 0.12 },
      { label: 'MODEL ENSEMBLE', x: 0.85, y: 0.12 },
      { label: 'RISK ENGINE', x: 0.25, y: 0.5 },
      { label: 'PORTFOLIO OPTIMIZER', x: 0.5, y: 0.5 },
      { label: 'EXECUTION LAYER', x: 0.75, y: 0.5 },
      { label: 'MONITORING', x: 0.35, y: 0.88 },
      { label: 'COMPLIANCE', x: 0.65, y: 0.88 }
    ];

    var connections = [
      [0, 1], [1, 2],
      [0, 3], [1, 4], [2, 5],
      [3, 4], [4, 5],
      [3, 6], [4, 6], [4, 7], [5, 7]
    ];

    function resize() {
      var rect = canvas.parentElement.getBoundingClientRect();
      w = canvas.width = rect.width;
      h = canvas.height = 500;
    }

    function drawNode(node, alpha) {
      var nx = node.x * w;
      var ny = node.y * h;
      var radius = 4;

      ctx.save();
      ctx.globalAlpha = alpha;

      // Dot
      ctx.beginPath();
      ctx.arc(nx, ny, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#111';
      ctx.fill();

      // Outer ring
      ctx.beginPath();
      ctx.arc(nx, ny, radius + 8, 0, Math.PI * 2);
      ctx.strokeStyle = '#ccc';
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // Label
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = '#555';
      ctx.textAlign = 'center';
      ctx.fillText(node.label, nx, ny + 24);

      ctx.restore();
    }

    function drawConnection(from, to, alpha) {
      var x1 = from.x * w, y1 = from.y * h;
      var x2 = to.x * w, y2 = to.y * h;

      ctx.save();
      ctx.globalAlpha = alpha * 0.3;
      ctx.beginPath();
      ctx.moveTo(x1, y1);

      // Curved connection
      var mx = (x1 + x2) / 2;
      var my = (y1 + y2) / 2 - 20;
      ctx.quadraticCurveTo(mx, my, x2, y2);

      ctx.strokeStyle = '#999';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Data flow particle
      if (alpha > 0.5) {
        var t = (Date.now() % 3000) / 3000;
        var px = (1-t)*(1-t)*x1 + 2*(1-t)*t*mx + t*t*x2;
        var py = (1-t)*(1-t)*y1 + 2*(1-t)*t*my + t*t*y2;
        ctx.globalAlpha = alpha * 0.6;
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#111';
        ctx.fill();
      }

      ctx.restore();
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);

      // Draw connections first
      connections.forEach(function (conn, i) {
        var connProgress = Math.max(0, Math.min(1,
          (scrollProgress - (i * 0.05)) / 0.15
        ));
        if (connProgress > 0) {
          drawConnection(nodes[conn[0]], nodes[conn[1]], connProgress);
        }
      });

      // Draw nodes
      nodes.forEach(function (node, i) {
        var nodeProgress = Math.max(0, Math.min(1,
          (scrollProgress - (i * 0.06)) / 0.12
        ));
        if (nodeProgress > 0) {
          drawNode(node, nodeProgress);
        }
      });

      requestAnimationFrame(draw);
    }

    function updateScroll() {
      var rect = canvas.getBoundingClientRect();
      var viewH = window.innerHeight;
      var start = viewH * 0.8;
      var end = -rect.height * 0.3;
      scrollProgress = Math.max(0, Math.min(1,
        (start - rect.top) / (start - end)
      ));
    }

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('scroll', updateScroll, { passive: true });
    updateScroll();
    draw();
  }

  document.addEventListener('DOMContentLoaded', initArchCanvas);
})();
