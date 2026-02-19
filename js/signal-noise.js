/* ============================================
   SIGNAL vs NOISE — Animated Canvas
   Chaotic noise lines + one clean signal curve
   ============================================ */
(function () {
  'use strict';

  var canvas = document.getElementById('signal-noise-canvas');
  if (!canvas) return;

  var ctx = canvas.getContext('2d');
  var dpr = window.devicePixelRatio || 1;
  var w, h, time = 0, animId;
  var noiseLines = [];
  var NUM_NOISE = 14;

  function resize() {
    var rect = canvas.parentElement.getBoundingClientRect();
    w = rect.width;
    h = Math.min(220, w * 0.28);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seedNoise();
  }

  /* Each noise line has its own phase offsets and amplitude */
  function seedNoise() {
    noiseLines = [];
    for (var i = 0; i < NUM_NOISE; i++) {
      noiseLines.push({
        phase: Math.random() * Math.PI * 2,
        speed: 0.3 + Math.random() * 0.6,
        amp: 0.08 + Math.random() * 0.25,
        freq: 0.003 + Math.random() * 0.006,
        yOffset: 0.35 + Math.random() * 0.3,
        opacity: 0.04 + Math.random() * 0.08
      });
    }
  }

  function drawNoiseLine(n) {
    ctx.beginPath();
    for (var x = 0; x <= w; x += 2) {
      var base = h * n.yOffset;
      var y = base
        + Math.sin(x * n.freq + time * n.speed + n.phase) * h * n.amp
        + Math.sin(x * n.freq * 1.7 + time * n.speed * 0.6 + n.phase * 2) * h * n.amp * 0.4
        + Math.sin(x * n.freq * 3.1 + time * n.speed * 1.3) * h * n.amp * 0.15;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = 'rgba(0, 0, 0, ' + n.opacity + ')';
    ctx.lineWidth = 0.6;
    ctx.stroke();
  }

  function drawSignal() {
    ctx.beginPath();
    for (var x = 0; x <= w; x += 2) {
      /* Smooth, slow-moving signal — a gentle trend line */
      var y = h * 0.5
        + Math.sin(x * 0.0015 + time * 0.08) * h * 0.12
        + Math.sin(x * 0.004 + time * 0.12) * h * 0.04;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = 'rgba(17, 17, 17, 0.55)';
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }

  /* Subtle label text */
  function drawLabels() {
    ctx.font = '600 8px "JetBrains Mono", monospace';
    ctx.letterSpacing = '1.5px';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.fillText('NOISE', 16, h - 10);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillText('SIGNAL', w - 60, h - 10);
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    time += 0.012;

    /* Noise */
    for (var i = 0; i < noiseLines.length; i++) {
      drawNoiseLine(noiseLines[i]);
    }

    /* Signal */
    drawSignal();

    /* Labels */
    drawLabels();

    animId = requestAnimationFrame(draw);
  }

  /* Only animate when visible */
  var isVisible = false;
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting && !isVisible) {
        isVisible = true;
        draw();
      } else if (!entry.isIntersecting && isVisible) {
        isVisible = false;
        cancelAnimationFrame(animId);
      }
    });
  }, { threshold: 0.1 });

  function init() {
    resize();
    observer.observe(canvas);
    window.addEventListener('resize', resize);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
