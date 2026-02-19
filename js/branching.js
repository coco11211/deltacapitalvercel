/* ============================================
   BRANCHING — Decision tree / knowledge graph
   Nodes grow outward from a root, branching and
   connecting like exploring questions
   ============================================ */
(function () {
  'use strict';

  var canvas = document.getElementById('branching-canvas');
  if (!canvas) return;

  var ctx = canvas.getContext('2d');
  var dpr = window.devicePixelRatio || 1;
  var w, h, animId;
  var nodes = [];
  var edges = [];
  var growQueue = [];
  var MAX_NODES = 80;
  var growing = false;

  function resize() {
    var rect = canvas.parentElement.getBoundingClientRect();
    w = rect.width;
    h = Math.max(250, Math.min(380, w * 0.32));
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function reset() {
    nodes = [];
    edges = [];
    growQueue = [];
    /* Start with root node at left-center */
    var root = {
      x: w * 0.08,
      y: h * 0.5,
      r: 3,
      alpha: 0,
      targetAlpha: 0.35,
      depth: 0,
      children: 0
    };
    nodes.push(root);
    growQueue.push(0);
  }

  function tryBranch(parentIdx) {
    if (nodes.length >= MAX_NODES) return;
    var parent = nodes[parentIdx];
    if (parent.children >= 3) return;

    var angle = -0.6 + Math.random() * 1.2;
    if (parent.depth > 0) {
      /* Bias rightward */
      angle = -0.5 + Math.random() * 1.0;
    }

    var dist = 30 + Math.random() * 50;
    /* Bias rightward progression */
    var nx = parent.x + Math.cos(angle) * dist + 15;
    var ny = parent.y + Math.sin(angle) * dist;

    /* Keep in bounds */
    if (nx < 20 || nx > w - 20 || ny < 20 || ny > h - 20) return;

    /* Check not too close to existing nodes */
    for (var i = 0; i < nodes.length; i++) {
      var dx = nodes[i].x - nx;
      var dy = nodes[i].y - ny;
      if (dx * dx + dy * dy < 500) return;
    }

    var child = {
      x: nx,
      y: ny,
      r: 2 + Math.random() * 1.5,
      alpha: 0,
      targetAlpha: 0.12 + Math.random() * 0.2,
      depth: parent.depth + 1,
      children: 0
    };
    var childIdx = nodes.length;
    nodes.push(child);
    edges.push({ a: parentIdx, b: childIdx, alpha: 0, targetAlpha: 0.08 + Math.random() * 0.08 });
    parent.children++;

    if (child.depth < 6 && Math.random() < 0.7) {
      growQueue.push(childIdx);
    }
  }

  var frameCount = 0;

  function draw() {
    ctx.clearRect(0, 0, w, h);
    frameCount++;

    /* Grow slowly */
    if (growQueue.length > 0 && frameCount % 8 === 0) {
      var idx = growQueue.shift();
      var branches = 1 + Math.floor(Math.random() * 2);
      for (var b = 0; b < branches; b++) {
        tryBranch(idx);
      }
    }

    /* Restart when done growing and fully faded in */
    if (growQueue.length === 0 && nodes.length > 1) {
      var allVisible = true;
      for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].alpha < nodes[i].targetAlpha * 0.95) { allVisible = false; break; }
      }
      if (allVisible) {
        /* Hold, then restart */
        if (!growing) {
          growing = true;
          setTimeout(function () {
            reset();
            growing = false;
          }, 3000);
        }
      }
    }

    /* Draw edges */
    for (var e = 0; e < edges.length; e++) {
      var edge = edges[e];
      edge.alpha += (edge.targetAlpha - edge.alpha) * 0.03;
      var a = nodes[edge.a];
      var b = nodes[edge.b];

      ctx.strokeStyle = 'rgba(17, 17, 17, ' + edge.alpha + ')';
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      /* Slight curve */
      var mx = (a.x + b.x) / 2 + (Math.random() - 0.5) * 0.5;
      var my = (a.y + b.y) / 2 - 5;
      ctx.moveTo(a.x, a.y);
      ctx.quadraticCurveTo(mx, my, b.x, b.y);
      ctx.stroke();
    }

    /* Draw nodes */
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      n.alpha += (n.targetAlpha - n.alpha) * 0.04;

      /* Glow */
      if (n.alpha > 0.05) {
        var grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r + 6);
        grad.addColorStop(0, 'rgba(17, 17, 17, ' + (n.alpha * 0.3) + ')');
        grad.addColorStop(1, 'rgba(17, 17, 17, 0)');
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + 6, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(17, 17, 17, ' + n.alpha + ')';
      ctx.fill();
    }

    animId = requestAnimationFrame(draw);
  }

  var visible = false;
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting && !visible) {
        visible = true;
        frameCount = 0;
        reset();
        draw();
      } else if (!e.isIntersecting && visible) {
        visible = false;
        cancelAnimationFrame(animId);
      }
    });
  }, { threshold: 0.05 });

  function init() {
    resize();
    reset();
    obs.observe(canvas);
    window.addEventListener('resize', function () { resize(); reset(); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
