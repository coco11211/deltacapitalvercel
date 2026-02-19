/* ============================================
   CONVERGENCE — Particle Delta Animation
   Particles converge from chaos into Δ shape
   ============================================ */
(function () {
  'use strict';

  var canvas = document.getElementById('convergence-canvas');
  if (!canvas) return;

  var ctx = canvas.getContext('2d');
  var dpr = window.devicePixelRatio || 1;
  var w, h, time = 0, animId;
  var particles = [];
  var TOTAL = 220;
  var DELTA_N = 160;
  var CONN_CLOSE = 35;
  var CONN_FAR = 60;

  function resize() {
    var rect = canvas.parentElement.getBoundingClientRect();
    w = rect.width;
    h = Math.max(300, Math.min(450, w * 0.42));
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    assignTargets();
  }

  function assignTargets() {
    var cx = w / 2;
    var cy = h / 2;
    var sz = Math.min(w * 0.32, h * 0.65);

    /* Triangle vertices */
    var A = { x: cx, y: cy - sz * 0.6 };
    var B = { x: cx - sz * 0.52, y: cy + sz * 0.38 };
    var C = { x: cx + sz * 0.52, y: cy + sz * 0.38 };

    for (var i = 0; i < TOTAL; i++) {
      var p = particles[i];
      if (!p) continue;

      if (i < DELTA_N) {
        /* Delta shape: 70 % edges, 30 % interior fill */
        if (i < DELTA_N * 0.7) {
          var edge = i % 3;
          var t = Math.random();
          if (edge === 0) { p.tx = A.x + (B.x - A.x) * t; p.ty = A.y + (B.y - A.y) * t; }
          else if (edge === 1) { p.tx = B.x + (C.x - B.x) * t; p.ty = B.y + (C.y - B.y) * t; }
          else { p.tx = C.x + (A.x - C.x) * t; p.ty = C.y + (A.y - C.y) * t; }
        } else {
          var r1 = Math.random(), r2 = Math.random();
          if (r1 + r2 > 1) { r1 = 1 - r1; r2 = 1 - r2; }
          p.tx = A.x + (B.x - A.x) * r1 + (C.x - A.x) * r2;
          p.ty = A.y + (B.y - A.y) * r1 + (C.y - A.y) * r2;
        }
        p.tx += (Math.random() - 0.5) * 6;
        p.ty += (Math.random() - 0.5) * 6;
      } else {
        /* Noise particles — drift randomly */
        p.tx = Math.random() * w;
        p.ty = Math.random() * h;
      }
    }
  }

  function seed() {
    particles = [];
    for (var i = 0; i < TOTAL; i++) {
      particles.push({
        x: Math.random() * (w || 800),
        y: Math.random() * (h || 400),
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        tx: 0, ty: 0,
        sz: 1 + Math.random() * 1.3,
        delta: i < DELTA_N
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    time += 0.006;

    /* Convergence oscillates:  0 = scattered  1 = formed */
    var conv = 0.5 + 0.45 * Math.sin(time * 0.25);

    /* --- Update positions --- */
    for (var i = 0; i < TOTAL; i++) {
      var p = particles[i];
      var dx = p.tx - p.x;
      var dy = p.ty - p.y;
      var pull = p.delta ? conv * 0.022 : 0.004;
      var jitter = p.delta ? (1 - conv) * 1.1 : 0.7;

      p.vx += dx * pull + (Math.random() - 0.5) * jitter;
      p.vy += dy * pull + (Math.random() - 0.5) * jitter;
      p.vx *= 0.93;
      p.vy *= 0.93;
      p.x += p.vx;
      p.y += p.vy;

      /* Wrap around */
      if (p.x < -30) p.x += w + 60;
      if (p.x > w + 30) p.x -= w + 60;
      if (p.y < -30) p.y += h + 60;
      if (p.y > h + 30) p.y -= h + 60;
    }

    /* --- Draw connections (batched for performance) --- */
    /* Close connections */
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.09)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    for (var i = 0; i < TOTAL; i++) {
      for (var j = i + 1; j < TOTAL; j++) {
        var dx = particles[i].x - particles[j].x;
        var dy = particles[i].y - particles[j].y;
        var d2 = dx * dx + dy * dy;
        if (d2 < CONN_CLOSE * CONN_CLOSE) {
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
        }
      }
    }
    ctx.stroke();

    /* Far connections */
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.03)';
    ctx.lineWidth = 0.3;
    ctx.beginPath();
    for (var i = 0; i < TOTAL; i++) {
      for (var j = i + 1; j < TOTAL; j++) {
        var dx = particles[i].x - particles[j].x;
        var dy = particles[i].y - particles[j].y;
        var d2 = dx * dx + dy * dy;
        if (d2 >= CONN_CLOSE * CONN_CLOSE && d2 < CONN_FAR * CONN_FAR) {
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
        }
      }
    }
    ctx.stroke();

    /* --- Draw particles --- */
    for (var i = 0; i < TOTAL; i++) {
      var p = particles[i];
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.sz, 0, Math.PI * 2);
      ctx.fillStyle = p.delta ? 'rgba(17,17,17,0.35)' : 'rgba(17,17,17,0.12)';
      ctx.fill();
    }

    animId = requestAnimationFrame(draw);
  }

  /* Only animate when in viewport */
  var visible = false;
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting && !visible) { visible = true; draw(); }
      else if (!e.isIntersecting && visible) { visible = false; cancelAnimationFrame(animId); }
    });
  }, { threshold: 0.05 });

  function init() {
    seed();
    resize();
    obs.observe(canvas);
    window.addEventListener('resize', function () { resize(); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
