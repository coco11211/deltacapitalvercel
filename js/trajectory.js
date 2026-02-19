/* ============================================
   TRAJECTORY — Particles finding shared direction
   Scattered particles align into a unified flow,
   representing mission and shared purpose
   ============================================ */
(function () {
  'use strict';

  var canvas = document.getElementById('trajectory-canvas');
  if (!canvas) return;

  var ctx = canvas.getContext('2d');
  var dpr = window.devicePixelRatio || 1;
  var w, h, animId, time = 0;
  var particles = [];
  var TOTAL = 180;

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

  function seed() {
    particles = [];
    for (var i = 0; i < TOTAL; i++) {
      var angle = Math.random() * Math.PI * 2;
      var speed = 0.3 + Math.random() * 1.2;
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        angle: angle,
        sz: 1 + Math.random() * 1.3,
        alpha: 0.08 + Math.random() * 0.18,
        trail: []
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    time += 0.004;

    /* Target direction oscillates: right → up-right → right */
    var targetAngle = Math.sin(time * 0.3) * 0.4 - 0.15;
    var targetSpeed = 0.8;

    /* Alignment strength oscillates: chaotic → aligned → chaotic */
    var alignment = 0.5 + 0.45 * Math.sin(time * 0.2);

    for (var i = 0; i < TOTAL; i++) {
      var p = particles[i];

      /* Steer toward target direction */
      var targetVx = Math.cos(targetAngle) * targetSpeed;
      var targetVy = Math.sin(targetAngle) * targetSpeed;
      p.vx += (targetVx - p.vx) * alignment * 0.015;
      p.vy += (targetVy - p.vy) * alignment * 0.015;

      /* Individual jitter (decreases with alignment) */
      var jitter = (1 - alignment) * 0.4;
      p.vx += (Math.random() - 0.5) * jitter;
      p.vy += (Math.random() - 0.5) * jitter;

      /* Clamp speed */
      var spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (spd > 2) { p.vx = (p.vx / spd) * 2; p.vy = (p.vy / spd) * 2; }

      p.x += p.vx;
      p.y += p.vy;

      /* Wrap */
      if (p.x < -10) p.x += w + 20;
      if (p.x > w + 10) p.x -= w + 20;
      if (p.y < -10) p.y += h + 20;
      if (p.y > h + 10) p.y -= h + 20;

      /* Store trail */
      p.trail.push({ x: p.x, y: p.y });
      if (p.trail.length > 12) p.trail.shift();

      /* Draw trail */
      if (p.trail.length > 2) {
        ctx.beginPath();
        ctx.moveTo(p.trail[0].x, p.trail[0].y);
        for (var t = 1; t < p.trail.length; t++) {
          /* Avoid drawing across wraps */
          var dx = Math.abs(p.trail[t].x - p.trail[t - 1].x);
          var dy = Math.abs(p.trail[t].y - p.trail[t - 1].y);
          if (dx > w * 0.5 || dy > h * 0.5) {
            ctx.moveTo(p.trail[t].x, p.trail[t].y);
          } else {
            ctx.lineTo(p.trail[t].x, p.trail[t].y);
          }
        }
        ctx.strokeStyle = 'rgba(17, 17, 17, ' + (p.alpha * 0.4) + ')';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      /* Draw particle */
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.sz, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(17, 17, 17, ' + p.alpha + ')';
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
