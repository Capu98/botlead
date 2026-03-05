/* ============================================================
   effects-premium.js — BotLead premium visual layer
   7 effetti unici — zero dipendenze esterne

   1. Custom cursor dot/ring + effetto magnetico sui CTA
   2. Tilt 3D sulle card al mousemove
   3. Floating lead badges nei corridoi laterali dell'hero
   4. Live activity ticker tra hero e sezioni
   5. Waitlist counter dinamico nel banner hero
   6. Scroll word reveal sui titoli di sezione
   7. Nav active section highlight
   ============================================================ */

(function () {
  'use strict';

  var IS_TOUCH   = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
  var IS_REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ──────────────────────────────────────────────────────────
     1. CUSTOM CURSOR + MAGNETIC EFFECT
     Dot che segue il mouse istantaneamente.
     Ring morbido con lag — si espande vicino agli elementi.
     I CTA "attraggono" il cursore con un micro-spostamento.
  ────────────────────────────────────────────────────────── */
  function initCursor() {
    if (IS_TOUCH) return;

    var s = document.createElement('style');
    s.textContent = [
      'body,a,button,.pain-card,.roi-card,.bot-card,.step,.coming-soon-banner{cursor:none!important}',

      '.bl-dot{',
        'position:fixed;width:6px;height:6px;',
        'background:#6366f1;border-radius:50%;',
        'pointer-events:none;z-index:9999;',
        'transform:translate(-50%,-50%);',
        'transition:width .18s,height .18s,background .25s;',
        'mix-blend-mode:screen;',
      '}',

      '.bl-ring{',
        'position:fixed;width:30px;height:30px;',
        'border:1.5px solid rgba(99,102,241,.52);border-radius:50%;',
        'pointer-events:none;z-index:9998;',
        'transform:translate(-50%,-50%);',
        'transition:width .28s cubic-bezier(.215,.61,.355,1),',
          'height .28s cubic-bezier(.215,.61,.355,1),',
          'border-color .28s,border-width .28s;',
      '}',
      '.bl-ring.on{width:46px;height:46px;border-color:rgba(6,182,212,.72);border-width:2px}',

      '@keyframes blDotPop{0%{transform:translate(-50%,-50%) scale(1)}',
        '50%{transform:translate(-50%,-50%) scale(1.7)}',
        '100%{transform:translate(-50%,-50%) scale(1)}}',
    ].join('');
    document.head.appendChild(s);

    var dot  = document.createElement('div'); dot.className  = 'bl-dot';  document.body.appendChild(dot);
    var ring = document.createElement('div'); ring.className = 'bl-ring'; document.body.appendChild(ring);

    var mx = -200, my = -200, rx = -200, ry = -200;

    document.addEventListener('mousemove', function (e) {
      mx = e.clientX;
      my = e.clientY;
      dot.style.left = mx + 'px';
      dot.style.top  = my + 'px';
    });

    // Ring insegue con inerzia
    (function anim() {
      rx += (mx - rx) * 0.13;
      ry += (my - ry) * 0.13;
      ring.style.left = rx + 'px';
      ring.style.top  = ry + 'px';
      requestAnimationFrame(anim);
    })();

    // Ring si espande su tutti gli elementi interattivi
    document.querySelectorAll('a, button, .pain-card, .roi-card, .bot-card, .step, .coming-soon-banner, .nav-badge').forEach(function (el) {
      el.addEventListener('mouseenter', function () { ring.classList.add('on'); });
      el.addEventListener('mouseleave', function () { ring.classList.remove('on'); });
    });

    // Dot pop su click
    document.addEventListener('mousedown', function () {
      dot.style.animation = 'none';
      void dot.offsetWidth;
      dot.style.animation = 'blDotPop .25s ease both';
    });

    // Effetto magnetico: i CTA si spostano verso il cursore
    document.querySelectorAll('.nav-cta, .cta-btn').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r  = el.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width  / 2);
        var dy = e.clientY - (r.top  + r.height / 2);
        el.style.transform = 'translate(' + (dx * 0.28) + 'px,' + (dy * 0.28) + 'px)';
      });
      el.addEventListener('mouseleave', function () {
        el.style.transition = 'transform .55s cubic-bezier(.175,.885,.32,1.275)';
        el.style.transform  = '';
        setTimeout(function () { el.style.transition = ''; }, 580);
      });
    });
  }


  /* ──────────────────────────────────────────────────────────
     2. 3D TILT CARDS
     Le card ruotano leggermente verso la posizione del mouse
     dando profondità. Ritorno elastico al mouseleave.
  ────────────────────────────────────────────────────────── */
  function initTilt() {
    if (IS_TOUCH || IS_REDUCED) return;

    document.querySelectorAll('.pain-card, .roi-card, .bot-card').forEach(function (card) {
      card.style.willChange = 'transform';

      card.addEventListener('mousemove', function (e) {
        var r  = card.getBoundingClientRect();
        var x  = (e.clientX - r.left)  / r.width;
        var y  = (e.clientY - r.top)   / r.height;
        var rX = (y - 0.5) * -13;
        var rY = (x - 0.5) *  13;
        card.style.transition = 'transform .08s ease';
        card.style.transform  = 'perspective(640px) rotateX(' + rX + 'deg) rotateY(' + rY + 'deg) translateZ(8px)';
      });

      card.addEventListener('mouseleave', function () {
        card.style.transition = 'transform .6s cubic-bezier(.215,.61,.355,1)';
        card.style.transform  = 'perspective(640px) rotateX(0) rotateY(0) translateZ(0)';
      });
    });
  }


  /* ──────────────────────────────────────────────────────────
     3. FLOATING LEAD BADGES
     Piccoli badge che appaiono nei corridoi laterali dell'hero,
     simulano l'attività live del bot mentre l'utente legge.
     Confinati a sinistra (<18%) e destra (>76%) per non
     oscurare il copy centrale.
  ────────────────────────────────────────────────────────── */
  function initFloatingBadges() {
    if (IS_REDUCED) return;
    var hero = document.querySelector('.hero');
    if (!hero) return;

    var s = document.createElement('style');
    s.textContent = [
      '@keyframes blFloat{',
        '0%{opacity:0;transform:translateY(16px) scale(.86)}',
        '14%{opacity:1;transform:translateY(0) scale(1)}',
        '78%{opacity:.9;transform:translateY(-12px) scale(1)}',
        '100%{opacity:0;transform:translateY(-24px) scale(.9)}}',
      '.bl-badge{',
        'position:absolute;',
        'background:rgba(8,12,24,.85);',
        'border:1px solid rgba(99,102,241,.22);',
        'border-radius:999px;',
        'padding:5px 12px 5px 8px;',
        'font-size:11px;color:#64748b;',
        'white-space:nowrap;',
        'max-width:220px;overflow:hidden;text-overflow:ellipsis;',
        'backdrop-filter:blur(8px);',
        '-webkit-backdrop-filter:blur(8px);',
        'pointer-events:none;',
        'animation:blFloat var(--d,5s) ease both;',
      '}',
    ].join('');
    document.head.appendChild(s);

    var pool = [
      '🍕 Pizzeria Roma · 3 problemi trovati',
      '⚖️ Studio Legale Milano · email inviata',
      '💇 Salone Torino · risposta ricevuta!',
      '🏪 Ferramenta Napoli · sito scansionato',
      '🔧 Idraulico Bologna · HTTP non sicuro',
      '🍽️ Trattoria Firenze · copyright 2009',
      '💊 Farmacia Venezia · lead qualificato',
      '🛒 Negozio Palermo · numero non cliccabile',
      '🏋️ Palestra Milano · mobile non ottimizzato',
      '🚗 Autofficina Roma · CTA mancante',
    ];

    var wrap = document.createElement('div');
    wrap.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:0;';
    hero.insertBefore(wrap, hero.firstChild);

    var pi = 0;
    function spawn() {
      var txt = pool[pi % pool.length]; pi++;
      var el  = document.createElement('div');
      el.className = 'bl-badge';
      var dur = 5 + Math.random() * 2.5;
      el.style.setProperty('--d', dur + 's');
      // Corridoi laterali: sinistra 1–14%, destra via 'right' 1–14%
      var isLeft = Math.random() < 0.5;
      if (isLeft) {
        el.style.left = (1 + Math.random() * 13) + '%';
      } else {
        el.style.right = (1 + Math.random() * 13) + '%';
        el.style.left = 'auto';
      }
      el.style.top  = (10 + Math.random() * 70) + '%';
      el.textContent = txt;
      wrap.appendChild(el);
      setTimeout(function () { if (el.parentNode) el.remove(); }, (dur + 0.3) * 1000);
    }

    // Prima badge subito, poi ogni 2.4s
    spawn();
    setInterval(spawn, 2400);
  }


  /* ──────────────────────────────────────────────────────────
     4. LIVE ACTIVITY TICKER
     Barra sottile che compare TRA hero e sezioni.
     Mostra messaggi di attività live simulata che cambiano
     ogni 3.8s con fade cross. Dà la sensazione di un
     prodotto già in funzione.
  ────────────────────────────────────────────────────────── */
  function initActivityTicker() {
    var section = document.getElementById('come-funziona');
    if (!section) return;

    var messages = [
      '🔍 23 ristoranti trovati a Roma · 38 secondi fa',
      '✉️ Email inviata · "Pizzeria Da Vinci" · problema copyright citato',
      '💬 Risposta ricevuta · "Studio Legale Ferri" · tasso risposta 12%',
      '🔒 HTTP non sicuro rilevato su 8 siti su 12 analizzati',
      '📱 14 numeri di telefono non cliccabili da mobile trovati',
      '⏰ 31 siti con copyright precedente al 2016 identificati',
      '🤖 50 siti scansionati in 4 min 12 sec · sessione attiva',
      '📊 Tasso di risposta sessione: 11.4% · media di settore: 1.8%',
    ];

    var ticker = document.createElement('div');
    ticker.style.cssText = [
      'display:flex', 'align-items:center', 'gap:10px',
      'padding:9px 24px',
      'background:rgba(6,9,20,.78)',
      'border-top:1px solid rgba(99,102,241,.09)',
      'border-bottom:1px solid rgba(99,102,241,.09)',
      'font-size:11.5px', 'color:#64748b',
      'backdrop-filter:blur(8px)',
      '-webkit-backdrop-filter:blur(8px)',
    ].join(';');

    // Dot verde pulsante
    var s2 = document.createElement('style');
    s2.textContent = '@keyframes blLivePulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.8)}}';
    document.head.appendChild(s2);

    var dot = document.createElement('span');
    dot.style.cssText = 'width:7px;height:7px;background:#22c55e;border-radius:50%;flex-shrink:0;box-shadow:0 0 7px #22c55e;animation:blLivePulse 1.3s ease-in-out infinite;';
    ticker.appendChild(dot);

    var lbl = document.createElement('span');
    lbl.style.cssText = 'color:#334155;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;flex-shrink:0;';
    lbl.textContent = 'Live';
    ticker.appendChild(lbl);

    var sep = document.createElement('span');
    sep.style.cssText = 'width:1px;height:14px;background:rgba(255,255,255,.08);flex-shrink:0;';
    ticker.appendChild(sep);

    var txt = document.createElement('span');
    txt.style.cssText = 'color:#94a3b8;transition:opacity .35s ease;flex:1;';
    ticker.appendChild(txt);

    section.parentNode.insertBefore(ticker, section);

    var mi = 0;
    function tick() {
      txt.style.opacity = '0';
      setTimeout(function () {
        txt.textContent = messages[mi % messages.length]; mi++;
        txt.style.opacity = '1';
      }, 370);
    }
    tick();
    setInterval(tick, 3800);
  }


  /* ──────────────────────────────────────────────────────────
     5. WAITLIST COUNTER DINAMICO
     Aggiunge al coming-soon-banner un contatore simulato
     di persone in lista, con incremento lento e casuale
     per sembrare live.
  ────────────────────────────────────────────────────────── */
  function initWaitlistCounter() {
    var banner = document.getElementById('waitlist');
    if (!banner) return;

    var counter = document.createElement('p');
    counter.style.cssText = [
      'margin-top:14px',
      'font-size:.82rem',
      'font-weight:700',
      'color:#a5b4fc',
      'letter-spacing:.02em',
    ].join(';');

    // Numero di partenza randomizzato tra sessioni
    var n = 127 + Math.floor(Math.random() * 38);

    function render() {
      counter.innerHTML = '\uD83D\uDD25 <span style="color:#f1f5f9;font-size:.96rem;">' + n + '</span> persone gi\xE0 in lista';
    }
    render();
    banner.appendChild(counter);

    // Sale lentamente, non troppo spesso — sembra live ma non grottesco
    setInterval(function () {
      if (Math.random() < 0.28) { n++; render(); }
    }, 5200);
  }


  /* ──────────────────────────────────────────────────────────
     6. SCROLL WORD REVEAL
     I titoli .section-h2 e .cta-h2 entrano parola per parola
     quando scrollano nel viewport. Avvolge solo i TextNode
     diretti (preserva <br> e <span> interni come .text-indigo).
  ────────────────────────────────────────────────────────── */
  function initWordReveal() {
    if (IS_REDUCED) return;

    var s = document.createElement('style');
    s.textContent = [
      '.bl-w{display:inline-block;opacity:0;transform:translateY(20px);',
        'transition:opacity .5s ease,transform .5s ease}',
      '.bl-w.vis{opacity:1;transform:none}',
    ].join('');
    document.head.appendChild(s);

    // Avvolge i TextNode diretti dell'heading in <span class="bl-w">
    function wrapNode(node) {
      if (node.nodeType !== 3) return; // solo testo
      var words = node.textContent.split(/(\s+)/);
      var frag  = document.createDocumentFragment();
      words.forEach(function (w) {
        if (!w.trim()) {
          frag.appendChild(document.createTextNode(w));
        } else {
          var span = document.createElement('span');
          span.className   = 'bl-w';
          span.textContent = w;
          frag.appendChild(span);
        }
      });
      node.parentNode.replaceChild(frag, node);
    }

    var headings = document.querySelectorAll('.section-h2, .cta-h2');
    headings.forEach(function (h) {
      // Snapshot prima di modificare (replaceChild invalida la live list)
      Array.from(h.childNodes).forEach(wrapNode);
    });

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var words = entry.target.querySelectorAll('.bl-w');
        words.forEach(function (w, i) {
          setTimeout(function () { w.classList.add('vis'); }, i * 72);
        });
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.3 });

    headings.forEach(function (h) { obs.observe(h); });
  }


  /* ──────────────────────────────────────────────────────────
     7. NAV ACTIVE SECTION HIGHLIGHT
     Il link della sezione visibile nel viewport si illumina
     di indigo chiaro per orientamento contestuale.
  ────────────────────────────────────────────────────────── */
  function initNavActive() {
    var s = document.createElement('style');
    s.textContent = '.nav-links a.bl-active{color:#a5b4fc!important;transition:color .3s}';
    document.head.appendChild(s);

    var links = document.querySelectorAll('.nav-links a:not(.nav-cta)');

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id;
        links.forEach(function (l) {
          l.classList.toggle('bl-active', l.getAttribute('href') === '#' + id);
        });
      });
    }, { threshold: 0.42 });

    document.querySelectorAll('section[id]').forEach(function (sec) {
      obs.observe(sec);
    });
  }


  /* ──────────────────────────────────────────────────────────
     BOOT
  ────────────────────────────────────────────────────────── */
  function init() {
    initCursor();
    initTilt();
    initFloatingBadges();
    initActivityTicker();
    initWaitlistCounter();
    initWordReveal();
    initNavActive();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
