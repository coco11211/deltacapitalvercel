/* ============================================
   RIPPLE — Signal transmission / reaching out
   Concentric rings pulse outward from random points,
   representing communication and connection
   ============================================ */
(function () {
  'use strict';

  var canvas = document.getElementById('ripple-canvas');
  if (!canvas) return;

  var ctx = canvas.getContext('2d');
  var dpr = window.devicePixelRatio || 1;
  var w, h, animId, time = 0;
  var ripples = [];
  var dots = [];
  var NUM_DOTS = 60;

  function resize() {
    var rect = canvas.parentElement.getBoundingClientRect();
    w = rect.width;
    h = Math.max(200, Math.min(320, w * 0.28));
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seedDots();
  }

  function seedDots() {
    dots = [];
    for (var i = 0; i < NUM_DOTS; i++) {
      dots.push({
        x: Math.random() * w,
        y: Math.random() * h,
        baseR: 1.2 + Math.random() * 0.8,
        r: 1.2,
        glow: 0,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2
      });
    }
  }

  function spawnRipple() {
    /* Pick a random dot as origin */
    var origin = dots[Math.floor(Math.random() * dots.length)];
    ripples.push({
      x: origin.x,
      y: origin.y,
      radius: 0,
      maxRadius: 80 + Math.random() * 120,
      speed: 0.8 + Math.random() * 0.6,
      alpha: 0.15 + Math.random() * 0.1,
      life: 1
    });
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    time += 0.016;

    /* Spawn ripples */
    if (Math.random() < 0.025) spawnRipple();

    /* Update ripples */
    for (var r = ripples.length - 1; r >= 0; r--) {
      var rip = ripples[r];
      rip.radius += rip.speed;
      rip.life = 1 - (rip.radius / rip.maxRadius);

      if (rip.life <= 0) {
        ripples.splice(r, 1);
        continue;
      }

      /* Draw ripple ring */
      ctx.beginPath();
      ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(17, 17, 17, ' + (rip.alpha * rip.life) + ')';
      ctx.lineWidth = 0.8 + rip.life;
      ctx.stroke();

      /* Light up dots the ripple passes through */
      for (var d = 0; d < dots.length; d++) {
        var dot = dots[d];
        var dx = dot.x - rip.x;
        var dy = dot.y - rip.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (Math.abs(dist - rip.radius) < 8) {
          dot.glow = Math.max(dot.glow, rip.life * 0.8);
        }
      }
    }

    /* Update and draw dots */
    for (var i = 0; i < dots.length; i++) {
      var d = dots[i];

      /* Gentle drift */
      d.x += d.vx;
      d.y += d.vy;
      if (d.x < 0 || d.x > w) d.vx *= -1;
      if (d.y < 0 || d.y > h) d.vy *= -1;

      d.glow *= 0.96;
      d.r = d.baseR + d.glow * 3;

      /* Glow ring */
      if (d.glow > 0.05) {
        var grad = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.r + 10);
        grad.addColorStop(0, 'rgba(17, 17, 17, ' + (d.glow * 0.25) + ')');
        grad.addColorStop(1, 'rgba(17, 17, 17, 0)');
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r + 10, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(17, 17, 17, ' + (0.08 + d.glow * 0.4) + ')';
      ctx.fill();
    }

    /* Draw faint connections between nearby lit dots */
    ctx.lineWidth = 0.3;
    for (var i = 0; i < dots.length; i++) {
      if (dots[i].glow < 0.1) continue;
      for (var j = i + 1; j < dots.length; j++) {
        if (dots[j].glow < 0.1) continue;
        var dx = dots[i].x - dots[j].x;
        var dy = dots[i].y - dots[j].y;
        var d2 = dx * dx + dy * dy;
        if (d2 < 4000) {
          var a = Math.min(dots[i].glow, dots[j].glow) * 0.15;
          ctx.strokeStyle = 'rgba(17, 17, 17, ' + a + ')';
          ctx.beginPath();
          ctx.moveTo(dots[i].x, dots[i].y);
          ctx.lineTo(dots[j].x, dots[j].y);
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
    obs.observe(canvas);
    window.addEventListener('resize', resize);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
