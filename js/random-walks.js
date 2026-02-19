/* ============================================
   RANDOM WALKS — Paths converge to discipline
   Multiple chaotic paths that gradually align
   ============================================ */
(function () {
  'use strict';

  var canvas = document.getElementById('walks-canvas');
  if (!canvas) return;

  var ctx = canvas.getContext('2d');
  var dpr = window.devicePixelRatio || 1;
  var w, h, animId;
  var NUM_WALKS = 18;
  var STEPS = 200;
  var walks = [];
  var progress = 0;
  var speed = 0.003;

  function resize() {
    var rect = canvas.parentElement.getBoundingClientRect();
    w = rect.width;
    h = Math.max(200, Math.min(350, w * 0.3));
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    generateWalks();
  }

  function generateWalks() {
    walks = [];
    for (var i = 0; i < NUM_WALKS; i++) {
      var points = [];
      var y = h * 0.3 + Math.random() * h * 0.4;
      var targetY = h / 2;
      for (var s = 0; s < STEPS; s++) {
        var t = s / (STEPS - 1);
        /* Convergence: noise decreases, paths pull toward center */
        var noise = (1 - t * t) * (h * 0.35);
        var drift = (Math.random() - 0.5) * noise * 0.15;
        y += drift;
        /* Pull toward target increases with t */
        y += (targetY - y) * t * 0.08;
        points.push({ x: (s / (STEPS - 1)) * w, y: y });
      }
      walks.push({
        points: points,
        alpha: 0.06 + Math.random() * 0.12,
        width: 0.5 + Math.random() * 1
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    progress += speed;
    if (progress > 1) progress = 1;

    var visibleSteps = Math.floor(progress * STEPS);

    for (var i = 0; i < NUM_WALKS; i++) {
      var walk = walks[i];
      if (visibleSteps < 2) continue;

      ctx.beginPath();
      ctx.moveTo(walk.points[0].x, walk.points[0].y);
      for (var s = 1; s < visibleSteps; s++) {
        ctx.lineTo(walk.points[s].x, walk.points[s].y);
      }
      ctx.strokeStyle = 'rgba(17, 17, 17, ' + walk.alpha + ')';
      ctx.lineWidth = walk.width;
      ctx.stroke();
    }

    /* Draw convergence point glow when paths meet */
    if (progress > 0.85) {
      var glowAlpha = (progress - 0.85) / 0.15 * 0.15;
      var gx = w * 0.99;
      var gy = h / 2;
      var grad = ctx.createRadialGradient(gx, gy, 0, gx, gy, 30);
      grad.addColorStop(0, 'rgba(17, 17, 17, ' + glowAlpha + ')');
      grad.addColorStop(1, 'rgba(17, 17, 17, 0)');
      ctx.beginPath();
      ctx.arc(gx, gy, 30, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    }

    if (progress < 1) {
      animId = requestAnimationFrame(draw);
    } else {
      /* Hold, then restart */
      setTimeout(function () {
        progress = 0;
        generateWalks();
        animId = requestAnimationFrame(draw);
      }, 2500);
    }
  }

  var visible = false;
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting && !visible) {
        visible = true;
        progress = 0;
        generateWalks();
        draw();
      } else if (!e.isIntersecting && visible) {
        visible = false;
        cancelAnimationFrame(animId);
      }
    });
  }, { threshold: 0.1 });

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
