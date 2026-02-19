/* ============================================
   DATA FLOW — Horizontal streaming particles
   Simulates a flowing data pipeline
   ============================================ */
(function () {
  'use strict';

  var canvas = document.getElementById('flow-canvas');
  if (!canvas) return;

  var ctx = canvas.getContext('2d');
  var dpr = window.devicePixelRatio || 1;
  var w, h, animId;
  var particles = [];
  var TOTAL = 120;
  var LANES = 5;

  function resize() {
    var rect = canvas.parentElement.getBoundingClientRect();
    w = rect.width;
    h = Math.max(120, Math.min(200, w * 0.18));
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function seed() {
    particles = [];
    var laneH = h / (LANES + 1);
    for (var i = 0; i < TOTAL; i++) {
      var lane = Math.floor(Math.random() * LANES);
      particles.push({
        x: Math.random() * (w + 200) - 100,
        y: laneH * (lane + 1) + (Math.random() - 0.5) * laneH * 0.4,
        lane: lane,
        speed: 0.3 + Math.random() * 0.8,
        sz: 1 + Math.random() * 1.8,
        alpha: 0.08 + Math.random() * 0.2,
        pulse: Math.random() * Math.PI * 2
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);

    /* Draw lane guides */
    var laneH = h / (LANES + 1);
    ctx.strokeStyle = 'rgba(17, 17, 17, 0.03)';
    ctx.lineWidth = 0.5;
    for (var l = 1; l <= LANES; l++) {
      ctx.beginPath();
      ctx.moveTo(0, laneH * l);
      ctx.lineTo(w, laneH * l);
      ctx.stroke();
    }

    /* Update and draw particles */
    for (var i = 0; i < TOTAL; i++) {
      var p = particles[i];
      p.x += p.speed;
      p.pulse += 0.02;

      /* Wrap */
      if (p.x > w + 20) {
        p.x = -20;
        p.y = laneH * (p.lane + 1) + (Math.random() - 0.5) * laneH * 0.4;
      }

      var pulseAlpha = p.alpha * (0.7 + 0.3 * Math.sin(p.pulse));

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.sz, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(17, 17, 17, ' + pulseAlpha + ')';
      ctx.fill();
    }

    /* Draw connections between close particles in same lane */
    ctx.lineWidth = 0.3;
    for (var i = 0; i < TOTAL; i++) {
      for (var j = i + 1; j < TOTAL; j++) {
        if (particles[i].lane !== particles[j].lane) continue;
        var dx = particles[i].x - particles[j].x;
        var dy = particles[i].y - particles[j].y;
        var d2 = dx * dx + dy * dy;
        if (d2 < 1600) {
          var a = (1 - Math.sqrt(d2) / 40) * 0.06;
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
