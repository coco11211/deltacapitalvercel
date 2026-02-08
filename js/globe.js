/* ============================================
   DELTA CAPITAL — WIREFRAME GLOBE
   Rotating sphere with data source markers
   ============================================ */
(function () {
  'use strict';

  function initGlobe() {
    var canvas = document.getElementById('globe-canvas');
    if (!canvas) return;

    var ctx = canvas.getContext('2d');
    var w, h, cx, cy, radius;
    var rotation = 0;
    var tilt = 0.4;
    var animId;
    var DPR = window.devicePixelRatio || 1;

    // Data source locations (lat, lon in radians)
    var sources = [
      { name: 'NYSE', lat: 0.711, lon: -1.291 },      // New York
      { name: 'LSE', lat: 0.898, lon: -0.002 },        // London
      { name: 'TSE', lat: 0.622, lon: 2.440 },         // Tokyo
      { name: 'HKEX', lat: 0.389, lon: 1.993 },        // Hong Kong
      { name: 'SGX', lat: 0.024, lon: 1.812 },         // Singapore
      { name: 'ASX', lat: -0.588, lon: 2.636 },        // Sydney
      { name: 'FSE', lat: 0.873, lon: 0.152 },         // Frankfurt
      { name: 'TSX', lat: 0.762, lon: -1.385 },        // Toronto
      { name: 'BSE', lat: 0.331, lon: 1.275 },         // Mumbai
      { name: 'SSE', lat: 0.543, lon: 2.118 }          // Shanghai
    ];

    function resize() {
      var rect = canvas.parentElement.getBoundingClientRect();
      w = rect.width;
      h = Math.min(420, Math.max(200, w * 0.6));
      canvas.width = w * DPR;
      canvas.height = h * DPR;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.scale(DPR, DPR);
      cx = w / 2;
      cy = h / 2;
      radius = Math.min(w, h) * 0.35;
    }

    // Project 3D point to 2D
    function project(lat, lon) {
      var x = Math.cos(lat) * Math.sin(lon + rotation);
      var y = Math.sin(lat) * Math.cos(tilt) - Math.cos(lat) * Math.sin(tilt) * Math.cos(lon + rotation);
      var z = Math.sin(lat) * Math.sin(tilt) + Math.cos(lat) * Math.cos(tilt) * Math.cos(lon + rotation);
      return {
        x: cx + x * radius,
        y: cy - y * radius,
        z: z,
        visible: z > -0.1
      };
    }

    function drawWireframe() {
      // Longitude lines
      for (var lon = 0; lon < Math.PI * 2; lon += Math.PI / 8) {
        ctx.beginPath();
        var started = false;
        for (var lat = -Math.PI / 2; lat <= Math.PI / 2; lat += 0.05) {
          var p = project(lat, lon);
          if (p.visible) {
            if (!started) { ctx.moveTo(p.x, p.y); started = true; }
            else ctx.lineTo(p.x, p.y);
          } else {
            started = false;
          }
        }
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.06)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Latitude lines
      for (var lat2 = -Math.PI / 3; lat2 <= Math.PI / 3; lat2 += Math.PI / 6) {
        ctx.beginPath();
        var started2 = false;
        for (var lon2 = 0; lon2 <= Math.PI * 2; lon2 += 0.05) {
          var p2 = project(lat2, lon2);
          if (p2.visible) {
            if (!started2) { ctx.moveTo(p2.x, p2.y); started2 = true; }
            else ctx.lineTo(p2.x, p2.y);
          } else {
            started2 = false;
          }
        }
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.04)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Equator (slightly bolder)
      ctx.beginPath();
      var startedEq = false;
      for (var lonEq = 0; lonEq <= Math.PI * 2; lonEq += 0.03) {
        var pEq = project(0, lonEq);
        if (pEq.visible) {
          if (!startedEq) { ctx.moveTo(pEq.x, pEq.y); startedEq = true; }
          else ctx.lineTo(pEq.x, pEq.y);
        } else {
          startedEq = false;
        }
      }
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Outer circle
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    function drawSources() {
      // Sort by z for proper layering
      var projected = sources.map(function (src) {
        var p = project(src.lat, src.lon);
        p.name = src.name;
        return p;
      });

      // Draw connections between visible sources
      projected.forEach(function (a) {
        if (!a.visible) return;
        projected.forEach(function (b) {
          if (!b.visible || a.name >= b.name) return;
          var dist = Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
          if (dist < radius * 1.2) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = 'rgba(43, 94, 167, ' + (0.04 * Math.min(a.z, b.z) + 0.02) + ')';
            ctx.lineWidth = 0.4;
            ctx.stroke();
          }
        });
      });

      // Draw source dots
      projected.forEach(function (p) {
        if (!p.visible) return;
        var alpha = 0.15 + p.z * 0.5;

        // Pulse ring
        var pulseR = 8 + Math.sin(Date.now() * 0.002 + p.x) * 2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, pulseR, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(43, 94, 167, ' + (alpha * 0.08) + ')';
        ctx.fill();

        // Dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(43, 94, 167, ' + alpha + ')';
        ctx.fill();

        // Inner dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, ' + (alpha * 0.8) + ')';
        ctx.fill();

        // Label (hide on very small screens)
        if (w > 400) {
          var labelSize = w < 600 ? 6 : 7;
          ctx.font = labelSize + 'px "JetBrains Mono", monospace';
          ctx.fillStyle = 'rgba(85, 85, 85, ' + (alpha * 0.8) + ')';
          ctx.textAlign = 'left';
          ctx.fillText(p.name, p.x + 8, p.y + 3);
        }
      });
    }

    function draw() {
      ctx.save();
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.restore();

      // Title
      var titleSize = w < 500 ? 9 : 11;
      var subSize = w < 500 ? 7 : 8;
      ctx.font = titleSize + 'px "JetBrains Mono", monospace';
      ctx.fillStyle = '#111';
      ctx.textAlign = 'left';
      ctx.fillText('GLOBAL DATA SOURCES', 15, 22);

      ctx.font = subSize + 'px "JetBrains Mono", monospace';
      ctx.fillStyle = '#999';
      ctx.fillText(sources.length + ' EXCHANGE CONNECTIONS', 15, 36);

      drawWireframe();
      drawSources();

      rotation += 0.003;
      animId = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener('resize', function () {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      resize();
    });

    // Only start when visible
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          draw();
          observer.unobserve(canvas);
        }
      });
    }, { threshold: 0.1 });

    observer.observe(canvas);

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) cancelAnimationFrame(animId);
      else if (canvas.getBoundingClientRect().top < window.innerHeight) draw();
    });
  }

  document.addEventListener('DOMContentLoaded', initGlobe);
})();
