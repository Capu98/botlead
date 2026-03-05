/* ============================================================
   effects-unique.js — BotLead visual effects
   Three effects:
     1. Pipeline Demo Live  (hero #pipeline-demo)
     2. Comparison Slider   (.comparison-slider)
     3. Aurora Background   (.hero canvas)
   Pure JS + CSS — no external libraries
   ============================================================ */
(function () {
  'use strict';

  /* ──────────────────────────────────────────────────────────
     GLOBAL STYLE INJECTION
  ────────────────────────────────────────────────────────── */
  var globalStyle = document.createElement('style');
  globalStyle.textContent = [
    '@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}',
    '@keyframes slideInRight{from{opacity:0;transform:translateX(8px)}to{opacity:1;transform:translateX(0)}}',
    '@keyframes fadeInUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}',
    '@keyframes checkPop{0%{transform:scale(0)}70%{transform:scale(1.2)}100%{transform:scale(1)}}',
  ].join('');
  document.head.appendChild(globalStyle);


  /* ──────────────────────────────────────────────────────────
     EFFECT 3 — AURORA BACKGROUND HERO
     Canvas behind hero text, blobs animated with sin/cos
  ────────────────────────────────────────────────────────── */
  function initAurora() {
    var hero = document.querySelector('.hero');
    if (!hero) return;

    var canvas = document.createElement('canvas');
    canvas.style.cssText = [
      'position:absolute',
      'top:0',
      'left:0',
      'width:100%',
      'height:100%',
      'z-index:0',
      'pointer-events:none',
    ].join(';');

    // Hero already has position:relative + overflow:hidden from CSS
    hero.insertBefore(canvas, hero.firstChild);

    // Make sure all hero children above z-index 0
    Array.from(hero.children).forEach(function (child) {
      if (child !== canvas) {
        child.style.position = child.style.position || 'relative';
        child.style.zIndex = child.style.zIndex || '1';
      }
    });

    var ctx = canvas.getContext('2d');
    var W = 0, H = 0;

    function resize() {
      W = canvas.width = hero.offsetWidth;
      H = canvas.height = hero.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    var blobs = [
      { x: 0.18, y: 0.30, r: 0.40, ox: 0.0, oy: 0.0, speed: 0.00045, color: '99,102,241'  }, // indigo
      { x: 0.72, y: 0.62, r: 0.32, ox: 1.4, oy: 2.1, speed: 0.00030, color: '6,182,212'   }, // cyan
      { x: 0.50, y: 0.18, r: 0.28, ox: 3.2, oy: 0.8, speed: 0.00055, color: '124,58,237'  }, // violet
      { x: 0.82, y: 0.08, r: 0.22, ox: 2.0, oy: 3.5, speed: 0.00038, color: '6,182,212'   }, // cyan2
    ];

    var t = 0;
    function draw() {
      t++;
      ctx.clearRect(0, 0, W, H);
      blobs.forEach(function (b) {
        var cx = (b.x + Math.sin(t * b.speed + b.ox) * 0.14) * W;
        var cy = (b.y + Math.cos(t * b.speed + b.oy) * 0.11) * H;
        var radius = b.r * Math.min(W, H);
        var grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        grad.addColorStop(0, 'rgba(' + b.color + ',0.13)');
        grad.addColorStop(0.5, 'rgba(' + b.color + ',0.05)');
        grad.addColorStop(1, 'rgba(' + b.color + ',0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
      });
      requestAnimationFrame(draw);
    }
    draw();
  }


  /* ──────────────────────────────────────────────────────────
     EFFECT 1 — PIPELINE DEMO LIVE
     Terminal → Laser scan → Email typewriter → loop
  ────────────────────────────────────────────────────────── */
  function initPipelineDemo() {
    var container = document.getElementById('pipeline-demo');
    if (!container) return;

    container.style.cssText = [
      'background:#0a0f1e',
      'border:1px solid rgba(99,102,241,0.4)',
      'border-radius:14px',
      'overflow:hidden',
      'height:320px',
      'position:relative',
      'width:100%',
      'max-width:680px',
      'margin-top:40px',
    ].join(';');

    /* ── PHASE 0 : TERMINAL ── */
    function showTerminal() {
      container.innerHTML = '';
      container.style.opacity = '1';

      var term = mk('div', {
        style: 'padding:20px 22px;height:100%;box-sizing:border-box;font-family:monospace;display:flex;flex-direction:column;',
      });

      // top bar dots
      var bar = mk('div', { style: 'display:flex;gap:6px;margin-bottom:14px;' });
      ['#ef4444', '#f59e0b', '#22c55e'].forEach(function (c) {
        bar.appendChild(mk('span', { style: 'width:10px;height:10px;border-radius:50%;background:' + c + ';' }));
      });
      term.appendChild(bar);

      // prompt line
      var promptLine = mk('div', { style: 'color:#64748b;font-size:12px;display:flex;align-items:center;' });
      promptLine.appendChild(mk('span', { textContent: '$ ', style: 'color:#6366f1;margin-right:4px;font-weight:700;' }));
      var cmdEl = mk('span', { style: 'color:#a5b4fc;' });
      promptLine.appendChild(cmdEl);
      var cursor = mk('span', { style: 'display:inline-block;width:7px;height:13px;background:#6366f1;vertical-align:middle;margin-left:2px;animation:blink 1s step-end infinite;' });
      promptLine.appendChild(cursor);
      term.appendChild(promptLine);

      var output = mk('div', { style: 'margin-top:14px;flex:1;overflow:hidden;' });
      term.appendChild(output);
      container.appendChild(term);

      var text = 'botlead --sector ristoranti --city Milano';
      var i = 0;
      function typeChar() {
        if (i < text.length) {
          cmdEl.textContent += text[i++];
          setTimeout(typeChar, 45 + Math.random() * 25);
        } else {
          setTimeout(showOutput, 300);
        }
      }

      function showOutput() {
        cursor.style.display = 'none';
        var lines = [
          { t: '[✓] Google Search API: connessa',          c: '#4ade80' },
          { t: '[✓] Query: "ristoranti Milano sito web"',  c: '#4ade80' },
          { t: '[→] Trovati 847 risultati — filtro in corso...', c: '#a5b4fc' },
          { t: '[→] Siti con contatti verificati: 312',    c: '#a5b4fc' },
          { t: '[✓] 50 aziende pronte per la scansione',    c: '#4ade80' },
        ];
        var li = 0;
        function showLine() {
          if (li < lines.length) {
            var d = mk('div', {
              textContent: lines[li].t,
              style: 'color:' + lines[li].c + ';font-size:12px;margin-bottom:5px;opacity:0;animation:fadeInUp 0.3s ease both;',
            });
            output.appendChild(d);
            li++;
            setTimeout(showLine, 220);
          } else {
            setTimeout(showScan, 900);
          }
        }
        showLine();
      }

      typeChar();
    }

    /* ── PHASE 1 : LASER SCAN ── */
    function showScan() {
      container.innerHTML = '';

      // Fake browser window
      var card = mk('div', {
        style: 'position:absolute;top:18px;left:18px;right:18px;bottom:18px;background:#f8fafc;border-radius:8px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.4);',
      });

      // Browser chrome
      var chrome = mk('div', {
        style: 'background:#e2e8f0;padding:7px 10px;display:flex;align-items:center;gap:5px;border-bottom:1px solid #cbd5e1;',
      });
      chrome.innerHTML = [
        '<span style="width:9px;height:9px;border-radius:50%;background:#ef4444;"></span>',
        '<span style="width:9px;height:9px;border-radius:50%;background:#f59e0b;"></span>',
        '<span style="width:9px;height:9px;border-radius:50%;background:#22c55e;"></span>',
        '<span style="flex:1;background:#fff;border-radius:4px;padding:2px 9px;font-size:10px;color:#94a3b8;font-family:monospace;">http://ristorantedavinci.it</span>',
      ].join('');
      card.appendChild(chrome);

      // Fake site content
      var content = mk('div', { style: 'padding:14px 16px;font-family:sans-serif;' });
      content.innerHTML = [
        '<div style="font-size:14px;font-weight:700;color:#1e293b;margin-bottom:8px;">Ristorante Da Vinci — Milano</div>',
        '<div id="el-copyright" style="font-size:10px;color:#64748b;margin-bottom:10px;">© Copyright 2013 — Tutti i diritti riservati</div>',
        '<div style="font-size:11px;color:#475569;line-height:1.45;margin-bottom:10px;">Cucina tradizionale italiana dal 1987. Specialità: pasta fresca, risotti e secondi di pesce.</div>',
        '<div id="el-phone" style="font-size:10px;color:#475569;margin-bottom:6px;">Tel: 02 4567890</div>',
        '<div id="el-http" style="font-size:10px;color:#3b82f6;margin-bottom:6px;">http://ristorantedavinci.it/prenota</div>',
      ].join('');
      card.appendChild(content);
      container.appendChild(card);

      // Laser
      var laser = mk('div', {
        style: 'position:absolute;left:18px;right:18px;height:2px;background:linear-gradient(90deg,transparent,#6366f1,#06b6d4,#6366f1,transparent);box-shadow:0 0 10px #6366f1,0 0 22px #6366f1,0 0 4px #06b6d4;z-index:20;top:18px;',
      });
      container.appendChild(laser);

      var scanStart = 18 + 30; // below chrome bar ~30px
      var scanEnd = container.offsetHeight - 18;
      var duration = 2400;
      var startTs = null;

      var probes = [
        { id: 'el-copyright', tip: 'Sito obsoleto — copyright 2013', at: 0.22 },
        { id: 'el-phone',     tip: 'Numero non cliccabile da mobile', at: 0.52 },
        { id: 'el-http',      tip: 'HTTP non sicuro — Google penalizza', at: 0.68 },
      ];
      var triggered = new Set();

      function frame(ts) {
        if (!startTs) startTs = ts;
        var p = Math.min((ts - startTs) / duration, 1);
        laser.style.top = (scanStart + p * (scanEnd - scanStart)) + 'px';

        probes.forEach(function (probe) {
          if (p >= probe.at && !triggered.has(probe.id)) {
            triggered.add(probe.id);
            var el = document.getElementById(probe.id);
            if (!el) return;
            el.style.background = 'rgba(239,68,68,0.18)';
            el.style.borderRadius = '3px';
            el.style.padding = '2px 5px';
            el.style.position = 'relative';
            var tip = mk('span', {
              textContent: probe.tip,
              style: [
                'position:absolute',
                'left:calc(100% + 6px)',
                'top:50%',
                'transform:translateY(-50%)',
                'background:#ef4444',
                'color:#fff',
                'font-size:9px',
                'padding:3px 8px',
                'border-radius:4px',
                'white-space:nowrap',
                'z-index:30',
                'animation:slideInRight 0.3s ease both',
                'font-family:sans-serif',
                'font-weight:600',
              ].join(';'),
            });
            el.appendChild(tip);
          }
        });

        if (p < 1) {
          requestAnimationFrame(frame);
        } else {
          showResult();
        }
      }
      requestAnimationFrame(frame);

      function showResult() {
        var banner = mk('div', {
          style: [
            'position:absolute',
            'bottom:18px',
            'left:18px',
            'right:18px',
            'background:linear-gradient(135deg,#052e16,#14532d)',
            'border:1px solid #4ade80',
            'border-radius:8px',
            'padding:10px 16px',
            'display:flex',
            'align-items:center',
            'gap:10px',
            'z-index:25',
            'animation:fadeInUp 0.4s ease both',
            'font-family:sans-serif',
          ].join(';'),
        });
        banner.innerHTML = [
          '<span style="color:#4ade80;font-size:18px;animation:checkPop 0.4s ease both;">✓</span>',
          '<div style="flex:1;">',
          '  <div style="color:#4ade80;font-size:11px;font-weight:700;">Analisi completata — 3 problemi trovati</div>',
          '  <div style="color:#86efac;font-size:10px;margin-top:2px;">Email generata in 4s</div>',
          '</div>',
        ].join('');
        container.appendChild(banner);
        setTimeout(showEmail, 1200);
      }
    }

    /* ── PHASE 2 : EMAIL TYPEWRITER ── */
    function showEmail() {
      container.innerHTML = '';

      var wrap = mk('div', {
        style: 'padding:18px 22px;height:100%;box-sizing:border-box;overflow:hidden;display:flex;flex-direction:column;',
      });

      // Header
      var hdr = mk('div', {
        style: 'font-size:11px;color:#64748b;font-family:monospace;margin-bottom:12px;border-bottom:1px solid #1e293b;padding-bottom:8px;',
      });
      hdr.innerHTML = '<span style="color:#4ade80;">●</span> Email in uscita — pizzerianapoli@example.com';
      wrap.appendChild(hdr);

      // Subject
      var subj = mk('div', {
        style: 'font-size:11px;color:#94a3b8;font-family:monospace;margin-bottom:12px;',
        textContent: 'Oggetto: Ho notato 3 cose sul vostro sito',
      });
      wrap.appendChild(subj);

      var body = mk('div', {
        style: 'font-size:12px;color:#cbd5e1;line-height:1.7;font-family:sans-serif;flex:1;overflow:hidden;',
      });
      wrap.appendChild(body);
      container.appendChild(wrap);

      var segments = [
        { t: 'Buongiorno,\n\nho visitato ', h: false },
        { t: 'ristorantedavinci.it', h: true },
        { t: ' e ho notato che riporta ancora il ', h: false },
        { t: 'copyright del 2013', h: true },
        { t: ' — un segnale che spesso trasmette abbandono ai potenziali clienti.\n\nInoltre il ', h: false },
        { t: 'numero di telefono non è cliccabile da smartphone', h: true },
        { t: ': chi vi trova da mobile rinuncia a chiamare.\n\nMi occupo di risolvere esattamente questi problemi per ristoranti nella sua area. Potremmo parlarne 10 minuti?\n\nCordiali saluti', h: false },
      ];

      var fullText = segments.map(function (s) { return s.t; }).join('');
      var charIndex = 0;

      function buildDisplay() {
        body.innerHTML = '';
        var remaining = charIndex;
        segments.forEach(function (seg) {
          if (remaining <= 0) return;
          var visible = seg.t.substring(0, Math.min(remaining, seg.t.length));
          remaining -= seg.t.length;
          var parts = visible.split('\n');
          parts.forEach(function (part, i) {
            if (seg.h) {
              var mark = mk('mark', {
                textContent: part,
                style: 'background:rgba(251,191,36,0.2);color:#fbbf24;border-radius:2px;padding:0 2px;',
              });
              body.appendChild(mark);
            } else {
              body.appendChild(document.createTextNode(part));
            }
            if (i < parts.length - 1) body.appendChild(document.createElement('br'));
          });
        });
      }

      function typeEmail() {
        if (charIndex < fullText.length) {
          charIndex++;
          buildDisplay();
          setTimeout(typeEmail, 16);
        } else {
          // fade out and restart loop
          setTimeout(function () {
            container.style.transition = 'opacity 0.7s';
            container.style.opacity = '0';
            setTimeout(function () {
              container.style.opacity = '1';
              container.style.transition = '';
              showTerminal();
            }, 750);
          }, 2200);
        }
      }
      typeEmail();
    }

    showTerminal();
  }


  /* ──────────────────────────────────────────────────────────
     EFFECT 2 — COMPARISON SLIDER
     Drag to reveal: generic email vs BotLead email
  ────────────────────────────────────────────────────────── */
  function initComparisonSlider() {
    var container = document.querySelector('.comparison-slider');
    if (!container) return;

    // Side-by-side layout — no drag bar
    container.style.cssText = [
      'display:grid',
      'grid-template-columns:1fr 1fr',
      'gap:16px',
      'height:auto',
      'border:none',
      'background:transparent',
      'margin-bottom:56px',
      'box-shadow:none',
      'color:inherit',
      'font-size:inherit',
      'align-items:start',
      'letter-spacing:normal',
    ].join(';');

    container.innerHTML = '';

    /* LEFT — generic email */
    var left = mk('div', {
      style: 'background:#1e293b;border-radius:14px;border:1px solid rgba(239,68,68,0.25);overflow:hidden;',
    });
    left.innerHTML = [
      '<div style="padding:24px 24px 20px;">',
      '  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:8px;">',
      '    <span style="background:#ef4444;color:#fff;font-size:10px;font-weight:700;padding:3px 10px;border-radius:4px;letter-spacing:0.5px;">EMAIL GENERICA</span>',
      '    <span style="background:rgba(239,68,68,0.12);color:#ef4444;font-size:11px;font-weight:600;padding:4px 12px;border-radius:20px;">Risposta: 1–2%</span>',
      '  </div>',
      '  <div style="font-size:10px;color:#64748b;font-family:monospace;margin-bottom:14px;border-bottom:1px solid #334155;padding-bottom:8px;">Da: agenzia@example.com<br>A: info@ristorante.it</div>',
      '  <div style="font-size:13px;color:#94a3b8;line-height:1.75;">',
      '    <div style="font-weight:700;color:#cbd5e1;margin-bottom:10px;">Oggetto: Servizi di web design</div>',
      '    Gentile titolare,<br><br>',
      '    offriamo servizi di web design competitivi e soluzioni di marketing digitale per aziende di ogni settore.<br><br>',
      '    I nostri clienti ottengono ottimi risultati. Contattateci per un preventivo senza impegno.<br><br>',
      '    Cordiali saluti,<br>Team Marketing',
      '  </div>',
      '</div>',
    ].join('');
    container.appendChild(left);

    /* RIGHT — BotLead email */
    var right = mk('div', {
      style: 'background:#130d2e;border-radius:14px;border:1px solid rgba(99,102,241,0.4);overflow:hidden;box-shadow:0 0 32px rgba(99,102,241,0.1);',
    });
    right.innerHTML = [
      '<div style="padding:24px 24px 20px;">',
      '  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:8px;">',
      '    <span style="background:#4ade80;color:#052e16;font-size:10px;font-weight:700;padding:3px 10px;border-radius:4px;letter-spacing:0.5px;">EMAIL BOTLEAD</span>',
      '    <span style="background:rgba(74,222,128,0.12);color:#4ade80;font-size:11px;font-weight:600;padding:4px 12px;border-radius:20px;">Risposta: 8–15%</span>',
      '  </div>',
      '  <div style="font-size:10px;color:#64748b;font-family:monospace;margin-bottom:14px;border-bottom:1px solid #312e81;padding-bottom:8px;">Da: agenzia@example.com<br>A: info@ristorante.it</div>',
      '  <div style="font-size:13px;color:#c7d2fe;line-height:1.75;">',
      '    <div style="font-weight:700;color:#e0e7ff;margin-bottom:10px;">Oggetto: Ho notato 3 cose sul vostro sito</div>',
      '    Buongiorno,<br><br>',
      '    ho visitato <mark style="background:rgba(251,191,36,0.22);color:#fbbf24;padding:0 3px;border-radius:2px;">ristorantedavinci.it</mark> e ho notato che riporta il <mark style="background:rgba(251,191,36,0.22);color:#fbbf24;padding:0 3px;border-radius:2px;">copyright del 2013</mark> — un segnale che può trasmettere abbandono.<br><br>',
      '    Inoltre <mark style="background:rgba(251,191,36,0.22);color:#fbbf24;padding:0 3px;border-radius:2px;">il numero di telefono non è cliccabile da smartphone</mark>: chi vi trova da mobile rinuncia a chiamare.<br><br>',
      '    Possiamo parlarne 10 minuti?<br><br>Cordiali saluti',
      '  </div>',
      '</div>',
    ].join('');
    container.appendChild(right);
  }


  /* ──────────────────────────────────────────────────────────
     UTIL — element factory
  ────────────────────────────────────────────────────────── */
  function mk(tag, opts) {
    var el = document.createElement(tag);
    if (!opts) return el;
    Object.keys(opts).forEach(function (k) {
      if (k === 'style') {
        el.style.cssText = opts[k];
      } else if (k === 'textContent') {
        el.textContent = opts[k];
      } else if (k === 'innerHTML') {
        el.innerHTML = opts[k];
      } else {
        el.setAttribute(k, opts[k]);
      }
    });
    return el;
  }


  /* ──────────────────────────────────────────────────────────
     BOOT
  ────────────────────────────────────────────────────────── */
  function init() {
    initAurora();
    initPipelineDemo();
    initComparisonSlider();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
