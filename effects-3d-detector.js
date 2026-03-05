/**
 * BotLead — effects-3d-detector.js
 * Website Problem Detector 3D
 *
 * Inietta dentro #problem-detector una simulazione animata:
 *  - Barra browser con URL digitato carattere per carattere
 *  - Sito finto (light theme) con 3 problemi reali
 *  - Linea laser indigo che scansiona il contenuto
 *  - Tooltip slide-in per ogni problema trovato
 *  - Banner verde di completamento con countdown
 *  - Contatori live (email generate / lead trovati / risposte)
 *  - Loop automatico ogni ~6s
 *
 * Nessuna dipendenza esterna. Solo DOM + CSS puro.
 */

(function () {
  'use strict';

  // ── STILI ────────────────────────────────────────────────────────────────────

  const CSS = `
    /* ── Contenitore principale ── */
    #problem-detector {
      background: #0a0f1e;
      border: 1.5px solid rgba(99,102,241,0.38);
      border-radius: 16px;
      overflow: hidden;
      position: relative;
      font-family: 'Inter', sans-serif;
      color: #e2ecf5;
      user-select: none;
      min-height: 400px;
      display: flex;
      flex-direction: column;
    }

    /* ── Barra stile browser ── */
    .pd-bar {
      background: #0f1628;
      border-bottom: 1px solid rgba(99,102,241,0.18);
      padding: 10px 14px;
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }
    .pd-dots { display: flex; gap: 6px; flex-shrink: 0; }
    .pd-dot  { width: 11px; height: 11px; border-radius: 50%; }
    .pd-dot.r { background: #f87171; }
    .pd-dot.y { background: #fbbf24; }
    .pd-dot.g { background: #4ade80; }
    .pd-urlbar {
      flex: 1;
      background: rgba(99,102,241,0.07);
      border: 1px solid rgba(99,102,241,0.16);
      border-radius: 7px;
      height: 27px;
      display: flex;
      align-items: center;
      padding: 0 11px;
      gap: 5px;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      color: rgba(255,255,255,0.50);
      overflow: hidden;
    }
    .pd-lock-icon { color: #f87171; font-size: 11px; flex-shrink: 0; }
    .pd-url-typed { letter-spacing: 0.01em; white-space: nowrap; }
    .pd-cursor {
      display: inline-block;
      width: 1px; height: 13px;
      background: #6366f1;
      animation: pdBlink 0.65s infinite;
      vertical-align: middle;
    }
    @keyframes pdBlink { 0%,100%{opacity:1} 50%{opacity:0} }

    /* ── Corpo: sito finto ── */
    .pd-viewport {
      position: relative;
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    .pd-site {
      background: #f8f9fb;
      flex: 1;
      padding: 18px 22px 14px;
      position: relative;
    }

    /* Elementi del sito finto */
    .pd-site-nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 12px;
      margin-bottom: 14px;
      border-bottom: 1px solid #e5e7eb;
    }
    .pd-site-logo {
      font-size: 14px;
      font-weight: 800;
      color: #1e1b4b;
    }
    .pd-http-badge {
      font-size: 10px;
      font-family: 'Courier New', monospace;
      color: #9ca3af;
      background: #f3f4f6;
      border: 1px solid #e5e7eb;
      border-radius: 4px;
      padding: 2px 7px;
    }
    .pd-site-hero {
      text-align: center;
      padding: 14px 0 10px;
      border-bottom: 1px solid #e5e7eb;
      margin-bottom: 12px;
    }
    .pd-site-h1 {
      font-size: 18px;
      font-weight: 800;
      color: #111827;
      margin-bottom: 5px;
    }
    .pd-site-sub {
      font-size: 11px;
      color: #6b7280;
      line-height: 1.5;
    }
    .pd-phone-row {
      text-align: center;
      margin-bottom: 14px;
    }
    .pd-phone-num {
      font-size: 18px;
      font-weight: 700;
      color: #374151;
      font-family: 'Courier New', monospace;
      /* Non è un <a tel:> — problema! */
    }
    .pd-site-footer {
      text-align: center;
      padding-top: 10px;
      border-top: 1px solid #e5e7eb;
    }
    .pd-copyright {
      font-size: 10px;
      color: #9ca3af;
      font-family: 'Courier New', monospace;
    }

    /* ── Problemi evidenziati ── */
    .pd-prob {
      position: relative;
      transition: background 0.25s, outline 0.25s;
      border-radius: 4px;
    }
    .pd-prob.flagged {
      outline: 2px solid rgba(239,68,68,0.65);
      outline-offset: 4px;
    }
    .pd-prob.flagged .pd-http-badge,
    .pd-prob.flagged .pd-phone-num,
    .pd-prob.flagged .pd-copyright {
      color: #ef4444;
      background: rgba(239,68,68,0.08);
      border-color: rgba(239,68,68,0.35);
      transition: color 0.25s, background 0.25s;
    }

    /* ── Layer tooltip (sovrapposto al sito) ── */
    .pd-tooltip-layer {
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 20;
    }
    .pd-tip {
      position: absolute;
      right: 10px;
      background: #7f1d1d;
      border: 1px solid rgba(239,68,68,0.45);
      border-radius: 8px;
      padding: 7px 11px;
      font-size: 11px;
      font-weight: 600;
      color: #fca5a5;
      white-space: nowrap;
      box-shadow: 0 4px 18px rgba(239,68,68,0.22);
      display: flex;
      align-items: center;
      gap: 6px;
      opacity: 0;
      transform: translateX(10px);
      transition: opacity 0.32s ease, transform 0.32s ease;
    }
    .pd-tip.show {
      opacity: 1;
      transform: translateX(0);
    }
    .pd-tip-icon { font-size: 13px; }

    /* ── Linea laser ── */
    .pd-laser {
      position: absolute;
      left: 0; right: 0;
      height: 2px;
      background: linear-gradient(
        90deg,
        transparent    0%,
        rgba(99,102,241,0) 4%,
        #6366f1        28%,
        #818cf8        50%,
        #8b5cf6        72%,
        rgba(99,102,241,0) 96%,
        transparent    100%
      );
      box-shadow: 0 0 10px #6366f1, 0 0 22px #6366f1, 0 0 44px rgba(99,102,241,0.35);
      top: 0;
      z-index: 15;
      pointer-events: none;
      opacity: 0;
    }
    /* Alone luminoso sotto la linea */
    .pd-laser::after {
      content: '';
      position: absolute;
      left: 0; right: 0;
      height: 56px;
      top: 0;
      background: linear-gradient(180deg, rgba(99,102,241,0.09) 0%, transparent 100%);
    }

    /* ── Banner risultato finale ── */
    .pd-banner {
      position: absolute;
      bottom: 0; left: 0; right: 0;
      background: linear-gradient(135deg, #064e3b 0%, #065f46 100%);
      border-top: 2px solid rgba(16,185,129,0.45);
      padding: 13px 18px;
      display: flex;
      align-items: center;
      gap: 13px;
      z-index: 25;
      opacity: 0;
      transform: translateY(100%);
      transition: opacity 0.4s ease, transform 0.4s ease;
    }
    .pd-banner.show {
      opacity: 1;
      transform: translateY(0);
    }
    .pd-check-ring {
      width: 34px; height: 34px;
      border-radius: 50%;
      background: rgba(16,185,129,0.18);
      border: 2px solid #10b981;
      display: flex; align-items: center; justify-content: center;
      font-size: 17px;
      flex-shrink: 0;
      animation: pdCheckPop 0.45s cubic-bezier(0.175,0.885,0.32,1.275) both;
    }
    @keyframes pdCheckPop {
      0%   { transform: scale(0) rotate(-45deg); opacity: 0; }
      100% { transform: scale(1) rotate(0);      opacity: 1; }
    }
    .pd-banner-text { flex: 1; }
    .pd-banner-main {
      font-size: 13px;
      font-weight: 700;
      color: #6ee7b7;
      margin-bottom: 2px;
    }
    .pd-banner-sub {
      font-size: 10px;
      color: rgba(110,231,183,0.58);
      font-family: 'Courier New', monospace;
    }
    .pd-gen-timer {
      font-size: 21px;
      font-weight: 900;
      color: #10b981;
      font-family: 'Courier New', monospace;
      min-width: 40px;
      text-align: right;
    }

    /* ── Footer contatori live ── */
    .pd-counters {
      background: #0b1120;
      border-top: 1px solid rgba(99,102,241,0.13);
      padding: 11px 20px;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      flex-shrink: 0;
    }
    .pd-cnt { text-align: center; }
    .pd-cnt-val {
      font-size: 17px;
      font-weight: 900;
      font-family: 'Courier New', monospace;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      line-height: 1.2;
    }
    .pd-cnt-lbl {
      font-size: 9px;
      color: rgba(255,255,255,0.32);
      text-transform: uppercase;
      letter-spacing: 0.07em;
      margin-top: 2px;
    }

    /* ── Fade-out tra cicli ── */
    .pd-viewport.fading {
      opacity: 0;
      transition: opacity 0.55s ease;
    }
    .pd-viewport.fading-in {
      opacity: 1;
      transition: opacity 0.4s ease;
    }
  `;

  function injectStyles() {
    if (document.getElementById('pd-styles')) return;
    const el = document.createElement('style');
    el.id = 'pd-styles';
    el.textContent = CSS;
    document.head.appendChild(el);
  }

  // ── BUILD HTML ──────────────────────────────────────────────────────────────

  // Siti da simulare (cambiano ad ogni ciclo)
  const SITES = [
    { url: 'https://pizzerianapoli.it',  name: '🍕 Pizzeria Napoli',     phone: '081 234 5678', copy: '© 2013 Pizzeria Napoli Srl' },
    { url: 'https://saloneluisa.it',     name: '💇 Salone Luisa',        phone: '02 8765 4321',  copy: '© 2011 Hair Studio Luisa'  },
    { url: 'https://studiolegal-rm.it',  name: '⚖️ Studio Legale Verdi', phone: '06 3456 7890',  copy: '© 2014 Avv. Verdi & Assoc.' },
  ];
  let siteIdx = 0;

  function buildHTML(container) {
    container.innerHTML = `
      <!-- Barra browser -->
      <div class="pd-bar">
        <div class="pd-dots">
          <div class="pd-dot r"></div>
          <div class="pd-dot y"></div>
          <div class="pd-dot g"></div>
        </div>
        <div class="pd-urlbar">
          <span class="pd-lock-icon">🔓</span>
          <span class="pd-url-typed" id="pdUrlTyped"></span>
          <span class="pd-cursor" id="pdCursor"></span>
        </div>
      </div>

      <!-- Viewport: sito finto + overlay -->
      <div class="pd-viewport" id="pdViewport">

        <!-- Sito finto (light) -->
        <div class="pd-site" id="pdSite">

          <!-- Linea laser di scansione -->
          <div class="pd-laser" id="pdLaser"></div>

          <!-- Problema 2: http non sicuro (in nav) -->
          <div class="pd-site-nav">
            <div class="pd-site-logo" id="pdLogo"></div>
            <div class="pd-prob" id="pdElemHttp">
              <div class="pd-http-badge">http://</div>
            </div>
          </div>

          <!-- Hero del sito finto -->
          <div class="pd-site-hero">
            <div class="pd-site-h1" id="pdSiteH1"></div>
            <div class="pd-site-sub">Tradizione dal 1987 · Via Roma, Napoli</div>
          </div>

          <!-- Problema 3: numero non cliccabile -->
          <div class="pd-phone-row pd-prob" id="pdElemPhone">
            <div class="pd-phone-num" id="pdPhoneNum"></div>
          </div>

          <!-- Problema 1: copyright obsoleto -->
          <div class="pd-site-footer pd-prob" id="pdElemCopy">
            <div class="pd-copyright" id="pdCopyText"></div>
          </div>

          <!-- Banner completamento (verde) -->
          <div class="pd-banner" id="pdBanner">
            <div class="pd-check-ring">✓</div>
            <div class="pd-banner-text">
              <div class="pd-banner-main">Analisi completata · 3 problemi trovati</div>
              <div class="pd-banner-sub">→ email personalizzata generata in</div>
            </div>
            <div class="pd-gen-timer" id="pdGenTimer">4.2s</div>
          </div>

        </div><!-- /.pd-site -->

        <!-- Layer tooltip flottanti -->
        <div class="pd-tooltip-layer" id="pdTipLayer">
          <div class="pd-tip" id="pdTip1" style="top:78%">
            <span class="pd-tip-icon">⏰</span> Sito obsoleto — anni senza aggiornamenti
          </div>
          <div class="pd-tip" id="pdTip2" style="top:14%">
            <span class="pd-tip-icon">🔓</span> Sito non sicuro — Google penalizza
          </div>
          <div class="pd-tip" id="pdTip3" style="top:52%">
            <span class="pd-tip-icon">📵</span> Non cliccabile da mobile — perdi chiamate
          </div>
        </div>

      </div><!-- /.pd-viewport -->

      <!-- Footer: contatori live -->
      <div class="pd-counters">
        <div class="pd-cnt">
          <div class="pd-cnt-val" id="pdC1">0</div>
          <div class="pd-cnt-lbl">Email generate</div>
        </div>
        <div class="pd-cnt">
          <div class="pd-cnt-val" id="pdC2">0</div>
          <div class="pd-cnt-lbl">Lead trovati</div>
        </div>
        <div class="pd-cnt">
          <div class="pd-cnt-val" id="pdC3">0</div>
          <div class="pd-cnt-lbl">Risposte ricevute</div>
        </div>
      </div>
    `;
  }

  // ── HELPERS ─────────────────────────────────────────────────────────────────

  const delay = ms => new Promise(r => setTimeout(r, ms));

  // Typewriter URL carattere per carattere
  async function typeUrl(text) {
    const el  = document.getElementById('pdUrlTyped');
    const cur = document.getElementById('pdCursor');
    if (!el) return;
    el.textContent = '';
    if (cur) cur.style.display = 'inline-block';
    for (const ch of text) {
      el.textContent += ch;
      await delay(30 + Math.random() * 22);
    }
    await delay(180);
    if (cur) cur.style.display = 'none';
  }

  // Counter roll-up (easing ease-out cubic)
  function rollCounters(targets) {
    const STEPS   = 38;
    const STEP_MS = 28;
    const ids = ['pdC1', 'pdC2', 'pdC3'];

    ids.forEach((id, i) => {
      const el  = document.getElementById(id);
      if (!el) return;
      const from = parseInt(el.dataset.current || '0', 10);
      const to   = targets[i];
      let step   = 0;

      const iv = setInterval(() => {
        step++;
        const t   = step / STEPS;
        const eas = 1 - Math.pow(1 - t, 3); // ease-out cubic
        const val = Math.round(from + (to - from) * eas);
        el.textContent = val >= 1000
          ? (val / 1000).toFixed(1).replace('.', ',') + 'k'
          : String(val);
        if (step >= STEPS) {
          clearInterval(iv);
          el.dataset.current = String(to);
          el.textContent = to >= 1000
            ? (to / 1000).toFixed(1).replace('.', ',') + 'k'
            : String(to);
        }
      }, STEP_MS);
    });
  }

  // Countdown timer nel banner
  function animateGenTimer() {
    const el = document.getElementById('pdGenTimer');
    if (!el) return;
    let t = 4.2;
    const iv = setInterval(() => {
      t = Math.max(0, t - 0.1);
      el.textContent = t > 0 ? t.toFixed(1) + 's' : '✓';
      if (t <= 0) clearInterval(iv);
    }, 100);
  }

  // ── CICLO PRINCIPALE ────────────────────────────────────────────────────────

  // Soglie relative (0‒1) nella .pd-site dove la linea laser attiva ogni problema
  const PROBLEMS = [
    { elemId: 'pdElemHttp',  tipId: 'pdTip2', at: 0.14 },
    { elemId: 'pdElemPhone', tipId: 'pdTip3', at: 0.54 },
    { elemId: 'pdElemCopy',  tipId: 'pdTip1', at: 0.80 },
  ];

  // Contatori cumulativi (crescono ad ogni ciclo)
  const cumulative = [847, 2341, 312];

  let _running   = false;
  let _loopTimer = null;

  function resetUI(site) {
    // Rimuovi flag e tooltip
    PROBLEMS.forEach(p => {
      document.getElementById(p.elemId)?.classList.remove('flagged');
      document.getElementById(p.tipId)?.classList.remove('show');
    });
    // Nascondi laser e banner
    const laser  = document.getElementById('pdLaser');
    const banner = document.getElementById('pdBanner');
    if (laser)  { laser.style.opacity = '0'; laser.style.top = '0px'; }
    if (banner) banner.classList.remove('show');
    // Cursore URL
    const cur = document.getElementById('pdCursor');
    if (cur) cur.style.display = 'inline-block';
  }

  function loadSiteData(s) {
    const logo    = document.getElementById('pdLogo');
    const h1      = document.getElementById('pdSiteH1');
    const phone   = document.getElementById('pdPhoneNum');
    const copy    = document.getElementById('pdCopyText');
    if (logo)  logo.textContent  = s.name;
    if (h1)    h1.textContent    = s.name.replace(/^.{2}\s/, ''); // senza emoji
    if (phone) phone.textContent = s.phone;
    if (copy)  copy.textContent  = s.copy;
  }

  async function runCycle() {
    if (_running) return;
    _running = true;

    const viewport = document.getElementById('pdViewport');
    const site     = document.getElementById('pdSite');
    const laser    = document.getElementById('pdLaser');
    const banner   = document.getElementById('pdBanner');
    if (!viewport || !site || !laser) { _running = false; return; }

    // ── Fase 0: reset + carica dati sito ──
    resetUI(site);
    loadSiteData(SITES[siteIdx]);
    siteIdx = (siteIdx + 1) % SITES.length;

    // ── Fase 1: digita URL ──
    await typeUrl(SITES[(siteIdx + SITES.length - 1) % SITES.length].url);
    await delay(300);

    // ── Fase 2: scan laser dall'alto al basso (2s) ──
    const totalH  = site.offsetHeight;
    const SCAN_MS = 2000;

    laser.style.opacity = '1';
    laser.style.top     = '0px';

    let probIdx  = 0;
    let startTs  = null;

    await new Promise(resolve => {
      function tick(ts) {
        if (!startTs) startTs = ts;
        const progress = Math.min((ts - startTs) / SCAN_MS, 1);
        laser.style.top = progress * totalH + 'px';

        // Evidenzia man mano che la linea supera la soglia
        while (probIdx < PROBLEMS.length && progress >= PROBLEMS[probIdx].at) {
          const p = PROBLEMS[probIdx++];
          document.getElementById(p.elemId)?.classList.add('flagged');
          setTimeout(() => document.getElementById(p.tipId)?.classList.add('show'), 160);
        }

        if (progress < 1) requestAnimationFrame(tick);
        else resolve();
      }
      requestAnimationFrame(tick);
    });

    laser.style.opacity = '0';
    await delay(280);

    // ── Fase 3: banner verde + countdown ──
    if (banner) {
      // Reset animazione checkmark (ricrea l'elemento)
      const ring = banner.querySelector('.pd-check-ring');
      if (ring) { ring.style.animation = 'none'; void ring.offsetWidth; ring.style.animation = ''; }
      banner.classList.add('show');
      animateGenTimer();
    }

    // ── Fase 4: counter roll-up ──
    const nextTargets = [
      cumulative[0] += Math.floor(Math.random() * 15 + 8),
      cumulative[1] += Math.floor(Math.random() * 40 + 20),
      cumulative[2] += Math.floor(Math.random() * 5 + 2),
    ];
    rollCounters(nextTargets);

    // ── Fase 5: pausa → fade-out → loop ──
    await delay(2800);

    // Fade out dell'area sito
    viewport.style.transition = 'opacity 0.55s ease';
    viewport.style.opacity    = '0';
    await delay(600);

    // Reset opacità silenzioso
    viewport.style.transition = '';
    viewport.style.opacity    = '';

    _running = false;
    _loopTimer = setTimeout(runCycle, 500);
  }

  // ── INIT ─────────────────────────────────────────────────────────────────────

  function init() {
    const container = document.getElementById('problem-detector');
    if (!container) return;

    injectStyles();
    buildHTML(container);

    // Avvia al primo ingresso nel viewport (IntersectionObserver)
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          runCycle();
          obs.unobserve(container);
        }
      });
    }, { threshold: 0.25 });
    obs.observe(container);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

}());
