/* ============================================
   CONSTRAINTS — Particles bounded by principles
   Particles orbit within defined geometric bounds,
   showing order emerging from constraints
   ============================================ */
(function () {
  'use strict';

  var canvas = document.getElementById('constraints-canvas');
  if (!canvas) return;

  var ctx = canvas.getContext('2d');
  var dpr = window.devicePixelRatio || 1;
  var w, h, animId, time = 0;
  var particles = [];
  var bounds = [];
  var TOTAL = 140;
  var NUM_BOUNDS = 7;

  function resize() {
    var rect = canvas.parentElement.getBoundingClientRect();
    w = rect.width;
    h = Math.max(280, Math.min(420, w * 0.38));
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildBounds();
  }

  function buildBounds() {
    bounds = [];
    var colW = w / NUM_BOUNDS;
    for (var i = 0; i < NUM_BOUNDS; i++) {
      var cx = colW * i + colW / 2;
      var cy = h / 2;
      /* Each bound is a vertical corridor with slight variation */
      var halfW = colW * 0.3 + Math.random() * colW * 0.1;
      var halfH = h * 0.25 + Math.random() * h * 0.15;
      bounds.push({
        cx: cx, cy: cy,
        hw: halfW, hh: halfH,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  function seed() {
    particles = [];
    for (var i = 0; i < TOTAL; i++) {
      var bIdx = Math.floor(Math.random() * NUM_BOUNDS);
      var b = bounds[bIdx] || { cx: w / 2, cy: h / 2, hw: 40, hh: 60 };
      particles.push({
        x: b.cx + (Math.random() - 0.5) * b.hw * 2,
        y: b.cy + (Math.random() - 0.5) * b.hh * 2,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        bound: bIdx,
        sz: 1 + Math.random() * 1.2,
        alpha: 0.1 + Math.random() * 0.2
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    time += 0.008;

    /* Draw bound corridors (faint) */
    for (var b = 0; b < NUM_BOUNDS; b++) {
      var bd = bounds[b];
      var breathe = 1 + 0.05 * Math.sin(time + bd.phase);
      var bw = bd.hw * breathe;
      var bh = bd.hh * breathe;

      ctx.strokeStyle = 'rgba(17, 17, 17, 0.04)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.rect(bd.cx - bw, bd.cy - bh, bw * 2, bh * 2);
      ctx.stroke();

      /* Faint center line */
      ctx.strokeStyle = 'rgba(17, 17, 17, 0.02)';
      ctx.beginPath();
      ctx.moveTo(bd.cx, bd.cy - bh);
      ctx.lineTo(bd.cx, bd.cy + bh);
      ctx.stroke();
    }

    /* Update particles */
    for (var i = 0; i < TOTAL; i++) {
      var p = particles[i];
      var bd = bounds[p.bound];
      if (!bd) continue;
      var breathe = 1 + 0.05 * Math.sin(time + bd.phase);
      var bw = bd.hw * breathe;
      var bh = bd.hh * breathe;

      /* Jitter */
      p.vx += (Math.random() - 0.5) * 0.3;
      p.vy += (Math.random() - 0.5) * 0.3;

      /* Soft pull toward center of bound */
      p.vx += (bd.cx - p.x) * 0.002;
      p.vy += (bd.cy - p.y) * 0.002;

      /* Bounce off bounds */
      if (p.x < bd.cx - bw) { p.vx = Math.abs(p.vx) * 0.6; p.x = bd.cx - bw; }
      if (p.x > bd.cx + bw) { p.vx = -Math.abs(p.vx) * 0.6; p.x = bd.cx + bw; }
      if (p.y < bd.cy - bh) { p.vy = Math.abs(p.vy) * 0.6; p.y = bd.cy - bh; }
      if (p.y > bd.cy + bh) { p.vy = -Math.abs(p.vy) * 0.6; p.y = bd.cy + bh; }

      p.vx *= 0.95;
      p.vy *= 0.95;
      p.x += p.vx;
      p.y += p.vy;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.sz, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(17, 17, 17, ' + p.alpha + ')';
      ctx.fill();
    }

    /* Draw connections within same bound */
    ctx.lineWidth = 0.3;
    for (var i = 0; i < TOTAL; i++) {
      for (var j = i + 1; j < TOTAL; j++) {
        if (particles[i].bound !== particles[j].bound) continue;
        var dx = particles[i].x - particles[j].x;
        var dy = particles[i].y - particles[j].y;
        var d2 = dx * dx + dy * dy;
        if (d2 < 900) {
          var a = (1 - Math.sqrt(d2) / 30) * 0.07;
          ctx.strokeStyle = 'rgba(17, 17, 17, ' + a + ')';
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
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
    seed();
    obs.observe(canvas);
    window.addEventListener('resize', function () { resize(); seed(); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
