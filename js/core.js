/* ============================================
   DELTA CAPITAL — CORE JAVASCRIPT
   ============================================ */
(function () {
  'use strict';

  // --- Page Loader ---
  window.addEventListener('load', function () {
    var loader = document.querySelector('.page-loader');
    if (loader) {
      setTimeout(function () {
        loader.classList.add('done');
        setTimeout(function () { loader.remove(); }, 400);
      }, 200);
    }
  });

  // --- Scroll Reveal ---
  function initScrollReveal() {
    var els = document.querySelectorAll('.reveal, .reveal-stagger, .letter-reveal, .arch-node, .arch-connector, .viz-container, #arch-canvas');
    if (!els.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          if (entry.target.classList.contains('letter-reveal')) {
            var letters = entry.target.querySelectorAll('.letter');
            letters.forEach(function (l, i) {
              l.style.transitionDelay = (i * 0.03) + 's';
            });
          }
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    els.forEach(function (el) { observer.observe(el); });
  }

  // --- Letter-by-letter setup ---
  function initLetterReveal() {
    document.querySelectorAll('.letter-reveal').forEach(function (el) {
      var text = el.textContent;
      el.textContent = '';
      text.split('').forEach(function (char) {
        var span = document.createElement('span');
        span.classList.add('letter');
        if (char === ' ') {
          span.classList.add('space');
          span.innerHTML = '&nbsp;';
        } else {
          span.textContent = char;
        }
        el.appendChild(span);
      });
    });
  }

  // --- Progressive Disclosure ---
  function initDisclosure() {
    document.querySelectorAll('.disclosure-block').forEach(function (block) {
      block.addEventListener('click', function (e) {
        var content = block.querySelector('.disclosure-content');
        if (content) {
          content.classList.toggle('open');
          var hint = block.querySelector('.disclosure-hint');
          if (hint) {
            hint.textContent = content.classList.contains('open') ? 'Collapse' : 'Read more';
          }
        }
      });
    });
  }

  // --- Command Palette ---
  function initCommandPalette() {
    var overlay = document.querySelector('.cmd-palette-overlay');
    var palette = document.querySelector('.cmd-palette');
    var input = palette ? palette.querySelector('input') : null;
    var results = palette ? palette.querySelector('.cmd-palette-results') : null;
    var trigger = document.querySelector('.nav-trigger');

    if (!palette || !overlay) return;

    var pages = [
      { name: 'Philosophy', path: '/', shortcut: '/' },
      { name: 'Research & Methodology', path: '/research.html', shortcut: 'R' },
      { name: 'Risk & Controls', path: '/risk.html', shortcut: 'K' },
      { name: 'System Architecture', path: '/architecture.html', shortcut: 'A' },
      { name: 'Insights', path: '/insights.html', shortcut: 'I' },
      { name: 'Principles', path: '/principles.html', shortcut: 'P' },
      { name: 'Screener', path: '/screener.html', shortcut: 'S' },
      { name: 'Disclosures', path: '/disclosures.html', shortcut: 'D' },
      { name: 'Common Questions', path: '/faq.html', shortcut: 'Q' },
      { name: 'Contact', path: '/contact.html', shortcut: 'C' }
    ];

    var selectedIndex = 0;

    function openPalette() {
      overlay.classList.add('active');
      palette.classList.add('active');
      if (input) { input.value = ''; input.focus(); }
      renderResults(pages);
      selectedIndex = 0;
      updateSelection();
    }

    function closePalette() {
      overlay.classList.remove('active');
      palette.classList.remove('active');
    }

    function renderResults(items) {
      if (!results) return;
      results.innerHTML = '';
      items.forEach(function (item, i) {
        var li = document.createElement('li');
        li.textContent = item.name;
        var shortcut = document.createElement('span');
        shortcut.className = 'shortcut';
        shortcut.textContent = item.shortcut;
        li.appendChild(shortcut);
        li.addEventListener('click', function () {
          window.location.href = item.path;
        });
        if (i === selectedIndex) li.classList.add('selected');
        results.appendChild(li);
      });
    }

    function updateSelection() {
      if (!results) return;
      var items = results.querySelectorAll('li');
      items.forEach(function (item, i) {
        item.classList.toggle('selected', i === selectedIndex);
      });
    }

    function filterResults(query) {
      var q = query.toLowerCase();
      var filtered = pages.filter(function (p) {
        return p.name.toLowerCase().includes(q);
      });
      selectedIndex = 0;
      renderResults(filtered);
      return filtered;
    }

    document.addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        palette.classList.contains('active') ? closePalette() : openPalette();
        return;
      }
      if (e.key === 'Escape' && palette.classList.contains('active')) {
        closePalette();
        return;
      }
      if (palette.classList.contains('active')) {
        var items = results ? results.querySelectorAll('li') : [];
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
          updateSelection();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          selectedIndex = Math.max(selectedIndex - 1, 0);
          updateSelection();
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (items[selectedIndex]) items[selectedIndex].click();
        }
      }
    });

    if (input) {
      input.addEventListener('input', function () { filterResults(input.value); });
    }

    overlay.addEventListener('click', closePalette);
    if (trigger) trigger.addEventListener('click', openPalette);
  }

  // --- Scroll Progress ---
  function initScrollProgress() {
    var bar = document.querySelector('.scroll-progress');
    if (!bar) return;
    window.addEventListener('scroll', function () {
      var scrollTop = window.scrollY;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        bar.style.transform = 'scaleX(' + (scrollTop / docHeight) + ')';
      }
    }, { passive: true });
  }

  // --- Ambient Canvas ---
  function initAmbientCanvas() {
    var canvas = document.getElementById('ambient-canvas');
    if (!canvas) return;

    var ctx = canvas.getContext('2d');
    var w, h, time = 0, animId;

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }

    function drawCurve(offsetY, amplitude, frequency, phase, speed) {
      ctx.beginPath();
      for (var x = 0; x <= w; x += 2) {
        var y = offsetY
          + Math.sin((x * frequency) + (time * speed) + phase) * amplitude
          + Math.sin((x * frequency * 0.5) + (time * speed * 0.7)) * (amplitude * 0.4);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    function drawDots() {
      var spacing = 80;
      for (var x = spacing; x < w; x += spacing) {
        for (var y = spacing; y < h; y += spacing) {
          var dx = Math.sin(time * 0.3 + x * 0.01) * 2;
          var dy = Math.cos(time * 0.2 + y * 0.01) * 2;
          ctx.beginPath();
          ctx.arc(x + dx, y + dy, 0.5, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
          ctx.fill();
        }
      }
    }

    function animate() {
      ctx.clearRect(0, 0, w, h);
      time += 0.008;
      drawCurve(h * 0.35, h * 0.08, 0.003, 0, 0.4);
      drawCurve(h * 0.5, h * 0.06, 0.004, 1.5, 0.3);
      drawCurve(h * 0.65, h * 0.07, 0.0025, 3, 0.35);
      drawDots();
      animId = requestAnimationFrame(animate);
    }

    resize();
    window.addEventListener('resize', resize);
    animate();

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) cancelAnimationFrame(animId);
      else animate();
    });
  }

  // --- Cursor Trail (Brownian Motion) ---
  function initCursorTrail() {
    // Skip on touch devices
    if ('ontouchstart' in window) return;

    var canvas = document.createElement('canvas');
    canvas.id = 'cursor-trail';
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9990;opacity:0.12;';
    document.body.appendChild(canvas);

    var ctx = canvas.getContext('2d');
    var w, h;
    var mouseX = -100, mouseY = -100;
    var trail = [];
    var maxLen = 24;
    var animId;

    function resize() {
      var dpr = window.devicePixelRatio || 1;
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.scale(dpr, dpr);
    }

    document.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function addPoint() {
      if (mouseX < 0) return;
      // Brownian offset from cursor
      var last = trail.length > 0 ? trail[trail.length - 1] : { x: mouseX, y: mouseY };
      var dx = (mouseX - last.x) * 0.3;
      var dy = (mouseY - last.y) * 0.3;
      // Small random walk perpendicular to motion
      var angle = Math.atan2(dy, dx) + Math.PI / 2;
      var jitter = (Math.random() - 0.5) * 8;
      trail.push({
        x: last.x + dx + Math.cos(angle) * jitter,
        y: last.y + dy + Math.sin(angle) * jitter
      });
      if (trail.length > maxLen) trail.shift();
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      addPoint();

      if (trail.length < 2) {
        animId = requestAnimationFrame(draw);
        return;
      }

      for (var i = 1; i < trail.length; i++) {
        var alpha = i / trail.length;
        ctx.beginPath();
        ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
        ctx.lineTo(trail[i].x, trail[i].y);
        ctx.strokeStyle = 'rgba(0, 0, 0, ' + (alpha * 0.6) + ')';
        ctx.lineWidth = alpha * 1.2;
        ctx.stroke();
      }

      // Tiny dot at head
      var head = trail[trail.length - 1];
      ctx.beginPath();
      ctx.arc(head.x, head.y, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fill();

      animId = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener('resize', resize);
    draw();

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) cancelAnimationFrame(animId);
      else draw();
    });
  }

  // --- Load Market Data (ticker on all pages) ---
  function loadMarket() {
    if (document.querySelector('script[src*="market.js"]')) return;
    var s = document.createElement('script');
    s.src = '/js/market.js';
    document.body.appendChild(s);
  }

  // --- Init ---
  document.addEventListener('DOMContentLoaded', function () {
    initLetterReveal();
    initScrollReveal();
    initDisclosure();
    initCommandPalette();
    initScrollProgress();
    initAmbientCanvas();
    initCursorTrail();
    loadMarket();
  });
})();
