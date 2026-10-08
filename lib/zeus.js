/* ==========================================================================
   ZEUS — Az istenek illata
   Vanilla JS. A villámok egy könnyű canvason (shadowBlur nélkül) rajzolódnak,
   minden más csak transform/opacity → mobilon is folyamatos.
   ========================================================================== */
// A böngészőben fut, egyszer, a ZeusEffects komponens useEffect-jéből.
export function initZeus() {
  if (window.__zeusInit) return;
  window.__zeusInit = true;


  const root = document.documentElement;
  const body = document.body;

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const rand = (a, b) => a + Math.random() * (b - a);
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
  const easeOutExpo = t => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const small = () => innerWidth < 700;
  const ft = n => `${new Intl.NumberFormat('hu-HU').format(n)} Ft`;

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  /* ---------- Termékek ---------- */
  const PRODUCTS = {
    zeus: {
      name: 'Zeus',
      kicker: 'Az Olümposz ura',
      desc: 'Napfényes borostyán, vadvirágméz és szafrán – aranyló, meleg erő, amely órákon át ragyog a bőrön.',
      notes: {
        top: ['Bergamott', 'Mandarin', 'Rózsabors'],
        heart: ['Méz', 'Szafrán', 'Narancsvirág'],
        base: ['Borostyán', 'Vanília', 'Tonkabab', 'Szantálfa'],
      },
      price: 51600,
    },
    pharaon: {
      name: 'Pharaon',
      kicker: 'A Nílus királya',
      desc: 'Kék lótusz, tömjén és mirha – a fáraók kincseskamráinak titokzatos, királyi mélysége, arannyal szegélyezve.',
      notes: {
        top: ['Kardamom', 'Bergamott', 'Fekete bors'],
        heart: ['Kék lótusz', 'Tömjén', 'Írisz'],
        base: ['Mirha', 'Oud', 'Ámbra', 'Pézsma'],
      },
      price: 51600,
    },
  };

  /* ==========================================================================
     Hang – szintetizált mennydörgés (alapból kikapcsolva)
     ========================================================================== */
  const Sound = {
    on: false,
    ctx: null,
    last: 0,
    init() {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      if (!this.ctx) {
        this.ctx = new AC();
        this.master = this.ctx.createGain();
        this.master.gain.value = .8;
        this.master.connect(this.ctx.createDynamicsCompressor()).connect(this.ctx.destination);
        this.brown = this.noise(6, true);
        this.white = this.noise(1, false);
      }
      this.ctx.resume();
      return true;
    },
    noise(sec, brown) {
      const len = Math.floor(this.ctx.sampleRate * sec);
      const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = buf.getChannelData(0);
      let last = 0;
      for (let i = 0; i < len; i++) {
        const w = Math.random() * 2 - 1;
        if (brown) { last = (last + .02 * w) / 1.02; d[i] = last * 3.5; } else d[i] = w;
      }
      return buf;
    },
    thunder(power = 1, delay = 0) {
      if (!this.on || !this.ctx) return;
      const ctx = this.ctx;
      const now = ctx.currentTime;
      if (now - this.last < .25) return;
      this.last = now;
      const t0 = now + delay;
      const dur = 2.2 + Math.random() * 2;
      const p = clamp(power, .2, 1.2);

      const src = ctx.createBufferSource();
      src.buffer = this.brown;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(1100, t0);
      lp.frequency.exponentialRampToValueAtTime(60, t0 + dur);
      const g = ctx.createGain();
      g.gain.setValueAtTime(.0001, t0);
      g.gain.exponentialRampToValueAtTime(.95 * p, t0 + .04);
      g.gain.exponentialRampToValueAtTime(.3 * p, t0 + .5);
      g.gain.linearRampToValueAtTime(.5 * p, t0 + .8);
      g.gain.exponentialRampToValueAtTime(.0001, t0 + dur);
      src.connect(lp).connect(g).connect(this.master);
      src.start(t0, Math.random(), dur + .1);

      const crack = ctx.createBufferSource();
      crack.buffer = this.white;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 1800;
      bp.Q.value = .6;
      const cg = ctx.createGain();
      cg.gain.setValueAtTime(.0001, t0);
      cg.gain.exponentialRampToValueAtTime(.45 * p, t0 + .008);
      cg.gain.exponentialRampToValueAtTime(.0001, t0 + .35);
      crack.connect(bp).connect(cg).connect(this.master);
      crack.start(t0, Math.random() * .5, .4);
    },
  };

  /* ==========================================================================
     Villám geometria
     ========================================================================== */
  function jag(x1, y1, x2, y2, disp, min) {
    let pts = [[x1, y1], [x2, y2]];
    for (let d = disp; d > min; d *= .5) {
      const next = [pts[0]];
      for (let i = 0; i < pts.length - 1; i++) {
        const [ax, ay] = pts[i];
        const [bx, by] = pts[i + 1];
        const len = Math.hypot(bx - ax, by - ay) || 1;
        const off = (Math.random() - .5) * d;
        next.push([(ax + bx) / 2 - ((by - ay) / len) * off, (ay + by) / 2 + ((bx - ax) / len) * off], [bx, by]);
      }
      pts = next;
    }
    return pts;
  }

  function toPath(pts) {
    const p = new Path2D();
    p.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) p.lineTo(pts[i][0], pts[i][1]);
    return p;
  }

  function createBolt(x1, y1, x2, y2, o = {}) {
    const dist = Math.hypot(x2 - x1, y2 - y1);
    const main = jag(x1, y1, x2, y2, dist * .24, Math.max(3, dist / 150));
    const paths = [{ path: toPath(main), w: 1 }];
    const ang = Math.atan2(y2 - y1, x2 - x1);
    const n = o.branches ?? 3;
    for (let i = 0; i < n; i++) {
      const [sx, sy] = main[Math.floor(rand(.1, .75) * (main.length - 1))];
      const a = ang + rand(.35, .9) * (Math.random() < .5 ? -1 : 1);
      const L = Math.min(dist * rand(.12, .3), 320);
      paths.push({ path: toPath(jag(sx, sy, sx + Math.cos(a) * L, sy + Math.sin(a) * L, L * .35, 3)), w: rand(.3, .5) });
    }
    return { paths, len: dist * 1.4, width: o.width ?? 2.2, life: 0, dur: o.dur ?? 650, tint: o.tint || '255,222,160' };
  }

  // Vezérkisülés → visszavillanás → lecsengés
  const boltAlpha = t => (t < .12 ? 1 : t < .19 ? .35 : t < .3 ? 1 : Math.pow(1 - (t - .3) / .7, 2));

  /* ==========================================================================
     Effekt réteg (villámok, szikrák, lökéshullámok) – csak akkor fut, ha kell
     ========================================================================== */
  class Layer {
    constructor(canvas, fixed) {
      this.c = canvas;
      this.ctx = canvas.getContext('2d');
      this.fixed = fixed;
      this.bolts = [];
      this.sparks = [];
      this.rings = [];
      this.raf = 0;
      this.loop = this.loop.bind(this);
      this.resize();
      addEventListener('resize', () => this.resize());
    }
    resize() {
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      const r = this.fixed ? { width: innerWidth, height: innerHeight } : this.c.getBoundingClientRect();
      this.w = r.width;
      this.h = r.height;
      this.c.width = Math.round(this.w * dpr);
      this.c.height = Math.round(this.h * dpr);
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    kick() {
      if (this.raf) return;
      this.last = performance.now();
      this.raf = requestAnimationFrame(this.loop);
    }
    loop(now) {
      const dt = clamp(now - this.last, 0, 48);
      this.last = now;
      const ctx = this.ctx;
      const s = dt / 1000;
      ctx.clearRect(0, 0, this.w, this.h);
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      for (let i = this.bolts.length - 1; i >= 0; i--) {
        const b = this.bolts[i];
        b.life += dt;
        const t = b.life / b.dur;
        if (t >= 1) { this.bolts.splice(i, 1); continue; }
        const a = boltAlpha(t);
        const grow = clamp(t / .08, 0, 1);
        ctx.setLineDash(grow < 1 ? [b.len * grow, b.len * 2] : []);
        for (const p of b.paths) {
          const w = b.width * p.w;
          ctx.strokeStyle = `rgba(${b.tint},${a * .07})`;
          ctx.lineWidth = w * 16;
          ctx.stroke(p.path);
          ctx.strokeStyle = `rgba(${b.tint},${a * .22})`;
          ctx.lineWidth = w * 6;
          ctx.stroke(p.path);
          ctx.strokeStyle = `rgba(255,255,255,${a})`;
          ctx.lineWidth = Math.max(.8, w * 1.3);
          ctx.stroke(p.path);
        }
      }
      ctx.setLineDash([]);

      for (let i = this.rings.length - 1; i >= 0; i--) {
        const r = this.rings[i];
        r.life += dt;
        const t = r.life / r.dur;
        if (t >= 1) { this.rings.splice(i, 1); continue; }
        ctx.beginPath();
        ctx.arc(r.x, r.y, Math.max(0, r.max * easeOutExpo(t)), 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,222,160,${(1 - t) * .9})`;
        ctx.lineWidth = 3 * (1 - t) + .5;
        ctx.stroke();
      }

      const drag = Math.pow(.9, dt / 16);
      for (let i = this.sparks.length - 1; i >= 0; i--) {
        const p = this.sparks[i];
        p.life += dt;
        if (p.life >= p.max) { this.sparks.splice(i, 1); continue; }
        p.vx *= drag;
        p.vy = p.vy * drag + 900 * s;
        p.x += p.vx * s;
        p.y += p.vy * s;
        const a = 1 - p.life / p.max;
        const tx = p.x - p.vx * .03;
        const ty = p.y - p.vy * .03;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(p.x, p.y);
        ctx.strokeStyle = `rgba(255,190,90,${a * .35})`;
        ctx.lineWidth = p.r * 4;
        ctx.stroke();
        ctx.strokeStyle = `rgba(255,245,215,${a})`;
        ctx.lineWidth = p.r;
        ctx.stroke();
      }
      ctx.globalCompositeOperation = 'source-over';

      if (this.bolts.length || this.sparks.length || this.rings.length) {
        this.raf = requestAnimationFrame(this.loop);
      } else {
        this.raf = 0;
        ctx.clearRect(0, 0, this.w, this.h);
      }
    }
    bolt(x1, y1, x2, y2, o) {
      this.bolts.push(createBolt(x1, y1, x2, y2, o));
      this.kick();
    }
    burst(x, y, n = 30, o = {}) {
      const sp = o.speed ?? 420;
      for (let i = 0; i < n; i++) {
        const a = rand(0, Math.PI * 2);
        const v = rand(.25, 1) * sp;
        this.sparks.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - (o.lift ?? 140), life: 0, max: rand(400, 1000), r: rand(1, 2.2) });
      }
      this.kick();
    }
    ring(x, y, max = 140, dur = 800) {
      this.rings.push({ x, y, max, dur, life: 0 });
      this.kick();
    }
  }

  const FX = new Layer($('#fx'), true);
  const flashEl = $('#flash');

  function flash(power = 1, x = innerWidth / 2, y = innerHeight * .45) {
    if (reduced || !flashEl.animate) return;
    flashEl.style.setProperty('--fx', `${Math.round(x)}px`);
    flashEl.style.setProperty('--fy', `${Math.round(y)}px`);
    flashEl.animate([{ opacity: Math.min(.95, power) }, { opacity: 0 }], { duration: 300 + 450 * power, easing: 'cubic-bezier(.2,.7,.3,1)' });
  }

  function shake(el, power = 1) {
    if (reduced || !el || !el.animate) return;
    const a = 9 * power;
    el.animate([
      { transform: 'translate3d(0,0,0)' },
      { transform: `translate3d(${-a}px,${a * .5}px,0)` },
      { transform: `translate3d(${a}px,${-a * .4}px,0)` },
      { transform: `translate3d(${-a * .6}px,${a * .3}px,0)` },
      { transform: `translate3d(${a * .3}px,0,0)` },
      { transform: 'translate3d(0,0,0)' },
    ], { duration: 420, easing: 'ease-out' });
  }

  // Rövid rezgés Androidon (iOS-en nincs ilyen API, ott egyszerűen kimarad)
  function buzz(ms) {
    if (navigator.vibrate) { try { navigator.vibrate(ms); } catch (_) { /* nem baj */ } }
  }

  function pulse(el, peak = 1, dur = 900) {
    if (reduced || !el || !el.animate) return;
    el.animate([{ opacity: 0 }, { opacity: peak, offset: .15 }, { opacity: 0 }], { duration: dur, easing: 'ease-out' });
  }

  // Villám a palack kupakjába + szikrák + fénygyűrű
  function strikeBottle(b, power = 1) {
    if (reduced) return;
    const r = b.el.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    const x = r.left + r.width / 2;
    const y = r.top + r.height * .04;
    FX.bolt(x + rand(-140, 140), -30, x, y, { width: 2.8 * power, branches: 4, dur: 700 });
    flash(.55 * power, x, y);
    FX.burst(x, y, small() ? 34 : 50, { speed: 520, lift: 160 });
    FX.ring(x, r.top + r.height * .45, r.height * .55, 900);
    pulse(b.glow, 1, 1100);
    Sound.thunder(power);
  }

  /* ==========================================================================
     3D palack – ujjal / egérrel forgatható, lendülettel, koppintásra pörög
     ========================================================================== */
  class Bottle3D {
    constructor(el, o = {}) {
      this.el = el;
      const src = el.dataset.src;
      el.setAttribute('role', 'img');
      el.setAttribute('aria-label', el.dataset.label || 'Parfümösüveg');
      el.tabIndex = 0;
      el.innerHTML = `
        <span class="b3d__glow"></span>
        <span class="b3d__shadow"></span>
        <span class="b3d__spin">
          <span class="b3d__side"><img src="${src}" alt="" draggable="false"></span>
          <span class="b3d__face b3d__face--back"><img src="${src}" alt="" draggable="false"><span class="b3d__fx"><i class="b3d__shade"></i></span></span>
          <span class="b3d__face b3d__face--front"><img src="${src}" alt="" draggable="false"><span class="b3d__fx"><i class="b3d__shade"></i><i class="b3d__glare"></i></span></span>
        </span>`;
      this.spin = $('.b3d__spin', el);
      this.glow = $('.b3d__glow', el);
      this.shades = $$('.b3d__shade', el);
      this.glare = $('.b3d__glare', el);
      this.side = $('.b3d__side', el);
      const img = $('.b3d__face--front img', el);
      this.ready = img.decode ? img.decode().catch(() => {}) : Promise.resolve();

      this.angle = 0;
      this.vel = 0;
      this.base = 0;
      this.bias = 0;
      this.amp = 0;
      this.t = 0;
      this.mode = 'idle';
      this.osc = reduced ? 0 : (o.osc ?? 26);
      this.visible = true;
      this.lastA = null;
      this.onTap = null;

      const setDepth = w => el.style.setProperty('--d', `${(w * .44).toFixed(1)}px`);
      if ('ResizeObserver' in window) {
        new ResizeObserver(([e]) => setDepth(e.contentRect.width)).observe(el);
      } else {
        setDepth(el.offsetWidth);
        addEventListener('resize', () => setDepth(el.offsetWidth));
      }
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(([e]) => { this.visible = e.isIntersecting; }).observe(el);
      }

      el.addEventListener('pointerdown', e => this.down(e));
      el.addEventListener('pointermove', e => this.move(e));
      el.addEventListener('pointerup', e => this.up(e));
      el.addEventListener('pointercancel', () => this.cancel());
      el.addEventListener('lostpointercapture', () => { if (this.drag && this.drag.horiz) this.cancel(); });
      el.addEventListener('keydown', e => {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
          e.preventDefault();
          this.vel = e.key === 'ArrowLeft' ? -.7 : .7;
          this.mode = 'free';
        } else if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.tap();
        }
      });
      Bottle3D.all.push(this);
    }
    down(e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      const now = performance.now();
      this.drag = { id: e.pointerId, x: e.clientX, y: e.clientY, last: e.clientX, lt: now, t: now, horiz: null };
    }
    move(e) {
      const d = this.drag;
      if (!d || e.pointerId !== d.id) return;
      const dx = e.clientX - d.x;
      const dy = e.clientY - d.y;
      if (d.horiz === null) {
        if (Math.hypot(dx, dy) < 6) return;
        d.horiz = Math.abs(dx) >= Math.abs(dy) * .8;
        if (!d.horiz) { this.drag = null; return; }
        try { this.el.setPointerCapture(e.pointerId); } catch (_) { /* nem baj */ }
        this.el.classList.add('is-grab');
        this.mode = 'drag';
        this.vel = 0;
        body.classList.add('touched');
      }
      const now = performance.now();
      const step = (e.clientX - d.last) * .6;
      this.angle += step;
      this.vel = lerp(this.vel, step / Math.max(8, now - d.lt), .55);
      d.last = e.clientX;
      d.lt = now;
    }
    up(e) {
      const d = this.drag;
      if (!d || e.pointerId !== d.id) return;
      this.drag = null;
      this.el.classList.remove('is-grab');
      if (d.horiz) {
        this.vel = performance.now() - d.lt > 90 ? 0 : clamp(this.vel, -2.6, 2.6);
        this.mode = 'free';
      } else if (performance.now() - d.t < 450) {
        this.tap();
      }
    }
    cancel() {
      if (this.drag && this.drag.horiz) this.mode = 'free';
      this.drag = null;
      this.el.classList.remove('is-grab');
    }
    tap() {
      body.classList.add('touched');
      buzz(30);
      this.vel = (this.vel < 0 ? -1 : 1) * rand(1.4, 1.9);
      this.mode = 'free';
      if (this.onTap) this.onTap(this);
    }
    spinIn(from = -720, dur = 1400) {
      this.mode = 'tween';
      this.tw = { from, start: performance.now(), dur };
      this.angle = from;
    }
    toIdle() {
      this.mode = 'idle';
      this.base = Math.round(this.angle / 360) * 360;
      this.amp = 0;
      this.t = 0;
    }
    update(dt, now) {
      if (!this.visible && this.mode === 'idle') return;
      if (this.mode === 'tween') {
        const p = clamp((now - this.tw.start) / this.tw.dur, 0, 1);
        this.angle = lerp(this.tw.from, 0, easeOutCubic(p));
        if (p >= 1) this.toIdle();
      } else if (this.mode === 'free') {
        this.angle += this.vel * dt;
        this.vel *= Math.pow(.9965, dt);
        if (Math.abs(this.vel) < .07) this.toIdle();
      } else if (this.mode === 'idle') {
        this.t += dt;
        this.amp = Math.min(1, this.amp + dt / 1600);
        const target = this.base + this.bias + this.osc * this.amp * Math.sin(this.t * .0011);
        this.angle = lerp(this.angle, target, 1 - Math.exp(-dt / 200));
      }
      this.apply();
    }
    apply() {
      const a = this.angle;
      if (this.lastA !== null && Math.abs(a - this.lastA) < .02) return;
      this.lastA = a;
      const rad = (a * Math.PI) / 180;
      this.spin.style.transform = `rotateY(${a.toFixed(2)}deg)`;
      const shade = ((1 - Math.abs(Math.cos(rad))) * .7).toFixed(3);
      for (const s of this.shades) s.style.opacity = shade;
      this.side.style.opacity = Math.abs(Math.sin(rad)) > .2 ? '1' : '0';
      this.glare.style.transform = `translate3d(${(70 - Math.sin(rad) * 260).toFixed(1)}%,0,0)`;
    }
  }
  Bottle3D.all = [];

  /* ==========================================================================
     Hero
     ========================================================================== */
  const Hero = {
    init() {
      this.el = $('#top');
      this.inner = $('#heroInner');
      this.letters = $('#heroLetters');
      this.glow = $('#heroGlow');
      this.sky = new Layer($('#heroSky'), false);
      this.bottle = new Bottle3D($('#heroBottle'));
      this.bottle.onTap = b => strikeBottle(b, 1);
      this.mx = 0;
      this.tx = 0;
      this.visible = true;
      new IntersectionObserver(([e]) => { this.visible = e.isIntersecting; }).observe(this.el);
      if (finePointer && !reduced) {
        addEventListener('pointermove', e => { this.tx = (e.clientX / innerWidth) * 2 - 1; }, { passive: true });
      }
      this.embers();
      this.clouds();
    },
    embers() {
      if (reduced) return;
      const box = $('#embers');
      const n = small() ? 14 : 26;
      for (let i = 0; i < n; i++) {
        const s = document.createElement('i');
        s.className = 'ember';
        s.style.cssText = `--x:${rand(2, 98).toFixed(1)}%;--s:${rand(3, 8).toFixed(1)}px;--t:${rand(7, 14).toFixed(1)}s;--dl:${rand(-14, 0).toFixed(1)}s;--sw:${rand(-40, 40).toFixed(0)}px`;
        box.append(s);
      }
    },
    clouds() {
      const W = 1000, H = 380;
      const c = document.createElement('canvas');
      c.width = W;
      c.height = H;
      const g = c.getContext('2d');
      for (let i = 0; i < 80; i++) {
        const y = Math.pow(Math.random(), 1.5) * H * .8;
        const r = rand(45, 170) * (1 - (y / H) * .45);
        const x = rand(0, W);
        for (const dx of [-W, 0, W]) {
          const gr = g.createRadialGradient(x + dx, y, 0, x + dx, y, r);
          gr.addColorStop(0, `rgba(48,58,98,${rand(.12, .4).toFixed(2)})`);
          gr.addColorStop(1, 'rgba(48,58,98,0)');
          g.fillStyle = gr;
          g.fillRect(x + dx - r, y - r, r * 2, r * 2);
        }
      }
      g.globalCompositeOperation = 'destination-in';
      const fade = g.createLinearGradient(0, 0, 0, H);
      fade.addColorStop(0, '#000');
      fade.addColorStop(.7, 'rgba(0,0,0,.7)');
      fade.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = fade;
      g.fillRect(0, 0, W, H);
      try { $('#clouds').style.backgroundImage = `url(${c.toDataURL('image/png')})`; } catch (_) { /* nem baj */ }
    },
    start() {
      if (reduced) return;
      clearTimeout(this.timer);
      const next = () => {
        this.timer = setTimeout(() => {
          if (this.visible && !document.hidden) this.ambient();
          next();
        }, rand(5000, 9000));
      };
      next();
    },
    ambient() {
      const { w, h } = this.sky;
      const x1 = rand(.1, .9) * w;
      const x2 = clamp(x1 + rand(-.25, .25) * w, w * .05, w * .95);
      const y2 = rand(.35, .7) * h;
      this.sky.bolt(x1, -20, x2, y2, { width: clamp(w / 600, 1.4, 2.6), branches: 4 });
      const r = this.el.getBoundingClientRect();
      flash(.32, x2, r.top + y2);
      pulse(this.glow, .7, 800);
      Sound.thunder(.55, rand(.15, .5));
    },
    update() {
      if (!finePointer || reduced || !this.visible) return;
      this.mx = lerp(this.mx, this.tx, .06);
      this.letters.style.transform = `translate3d(${(this.mx * -16).toFixed(1)}px,0,0)`;
      this.bottle.bias = this.mx * 22;
    },
  };

  /* ==========================================================================
     Intro – a hero maga a nyitójelenet
     ========================================================================== */
  const Intro = {
    async run() {
      if (reduced) { this.finish(); return; }
      root.classList.add('is-locked');
      scrollTo(0, 0);
      const fonts = document.fonts ? Promise.race([document.fonts.ready, wait(1200)]).catch(() => {}) : null;
      const img = Promise.race([Hero.bottle.ready, wait(1500)]);

      await wait(80);
      body.classList.add('i-line');
      await Promise.all([wait(1000), fonts, img]);

      // 1. villám: belecsap a vonalba
      const lr = $('#introLine').getBoundingClientRect();
      const x = lr.left + lr.width / 2;
      const y = lr.top + lr.height / 2;
      FX.bolt(x + rand(-50, 50), -30, x, y, { width: 3.6, branches: 6, dur: 800 });
      flash(1, x, y);
      shake(Hero.inner, 1.3);
      FX.burst(x, y, small() ? 55 : 85, { speed: 720, lift: 80 });
      FX.ring(x, y, Math.max(innerWidth, innerHeight) * .5, 1000);
      FX.ring(x, y, Math.max(innerWidth, innerHeight) * .28, 750);
      body.classList.add('i-strike');
      Sound.thunder(1.1);
      await wait(170);

      // 2. a betűk becsapódnak
      const letters = $$('.hl');
      letters.forEach((l, i) => setTimeout(() => this.slam(l), i * 150));
      await wait(letters.length * 150 + 220);

      // 3. sugarak + a palack pörögve megérkezik
      body.classList.add('i-rays');
      await wait(120);
      body.classList.add('i-bottle');
      Hero.bottle.spinIn(-720, 1550);
      await wait(1400);

      // 4. záró villám a kupakba
      strikeBottle(Hero.bottle, 1.15);
      pulse(Hero.glow, 1, 1000);
      shake(Hero.inner, .6);
      await wait(250);
      this.finish();
    },
    slam(l) {
      l.classList.add('is-in');
      setTimeout(() => {
        const r = l.getBoundingClientRect();
        FX.burst(r.left + r.width / 2, r.top + r.height * .85, small() ? 12 : 18, { speed: 320, lift: 120 });
        shake(Hero.inner, .45);
        flash(.14, r.left + r.width / 2, r.top + r.height / 2);
      }, 200);
    },
    finish() {
      body.classList.remove('intro', 'i-line', 'i-strike', 'i-rays', 'i-bottle');
      body.classList.add('is-ready');
      root.classList.remove('is-locked');
      Hero.start();
    },
  };

  /* ==========================================================================
     Kosár
     ========================================================================== */
  const Cart = {
    n: 0,
    add(key, btn) {
      if (btn.classList.contains('is-done')) return;
      const p = PRODUCTS[key];
      this.n++;
      const badge = $('#badge');
      badge.textContent = this.n;
      badge.classList.add('has');
      badge.classList.remove('bump');
      void badge.offsetWidth;
      badge.classList.add('bump');
      if (!reduced) {
        const r = btn.getBoundingClientRect();
        const x = r.left + r.width / 2;
        const y = r.top + r.height / 2;
        FX.bolt(x + rand(-200, 200), -30, x, r.top, { width: 3, branches: 5, dur: 800 });
        FX.burst(x, y, small() ? 55 : 85, { speed: 620, lift: 220 });
        FX.ring(x, y, 220, 900);
        flash(.4, x, y);
        const b = badge.getBoundingClientRect();
        setTimeout(() => FX.burst(b.left + b.width / 2, b.top + b.height / 2, 16, { speed: 200, lift: 40 }), 260);
      }
      Sound.thunder(.9);
      buzz([20, 40, 30]);
      btn.classList.add('is-done');
      setTimeout(() => btn.classList.remove('is-done'), 2000);
      toast(`${p.name} · 100 ml – a kosárban (${ft(p.price)})`);
    },
  };

  function toast(msg) {
    const t = $('#toast');
    $('.toast__msg', t).textContent = msg;
    t.classList.add('is-on');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => t.classList.remove('is-on'), 3000);
  }

  /* ==========================================================================
     Kollekció – Zeus / Pharaon váltó
     ========================================================================== */
  const Collection = {
    init() {
      this.sec = $('#kollekcio');
      this.stage = $('#stage');
      this.info = $('#info');
      this.notes = $('#notes');
      this.tabs = $$('[role="tab"]', this.sec);
      this.keys = Object.keys(PRODUCTS);
      this.slots = {};
      this.bottles = {};
      $$('.stage__slot', this.sec).forEach(s => {
        const b = new Bottle3D($('.b3d', s));
        b.onTap = bb => strikeBottle(bb, .9);
        this.slots[s.dataset.product] = s;
        this.bottles[s.dataset.product] = b;
      });
      this.current = this.sec.dataset.product;
      this.render(this.current);

      this.tabs.forEach(t => t.addEventListener('click', () => this.set(t.dataset.product)));
      $('[role="tablist"]', this.sec).addEventListener('keydown', e => {
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
        e.preventDefault();
        this.step(e.key === 'ArrowRight' ? 1 : -1);
        $(`[role="tab"][data-product="${this.current}"]`, this.sec).focus();
      });
      $$('[data-step]', this.sec).forEach(b => b.addEventListener('click', () => this.step(Number(b.dataset.step))));
      $('#addBtn').addEventListener('click', e => Cart.add(this.current, e.currentTarget));
    },
    step(dir) {
      const i = this.keys.indexOf(this.current);
      this.set(this.keys[(i + dir + this.keys.length) % this.keys.length]);
    },
    set(key) {
      if (key === this.current || this.busy) return;
      this.busy = true;
      const prev = this.current;
      this.current = key;
      this.sec.dataset.product = key;
      this.tabs.forEach(t => {
        const on = t.dataset.product === key;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        if (on) this.info.setAttribute('aria-labelledby', t.id);
      });

      const out = this.slots[prev];
      const inn = this.slots[key];
      this.bottles[prev].vel = 2.4;
      this.bottles[prev].mode = 'free';
      out.classList.add('is-leaving');
      out.classList.remove('is-active');

      if (!reduced) {
        setTimeout(() => {
          const r = this.stage.getBoundingClientRect();
          const x = r.left + r.width / 2;
          const y = r.top + r.height * .42;
          FX.bolt(x + rand(-150, 150), Math.max(-30, r.top - 280), x, y, { width: 2.8, branches: 5 });
          flash(.5, x, y);
          FX.burst(x, y, small() ? 40 : 60, { speed: 520 });
          FX.ring(x, y, r.width * .5, 850);
          Sound.thunder(.8);
        }, 120);
      }
      setTimeout(() => {
        out.classList.remove('is-leaving');
        inn.classList.add('is-active');
        this.bottles[key].spinIn(-540, 1100);
      }, 280);

      this.info.classList.add('is-swap');
      setTimeout(() => {
        this.render(key);
        this.info.classList.remove('is-swap');
        this.busy = false;
      }, 320);
    },
    render(key) {
      const p = PRODUCTS[key];
      $('#pKicker').textContent = p.kicker;
      $('#pName').textContent = p.name;
      $('#pDesc').textContent = p.desc;
      $('#pPrice').textContent = ft(p.price);
      const shown = this.notes.classList.contains('is-in');
      this.notes.classList.remove('is-in');
      let i = 0;
      for (const tier of ['top', 'heart', 'base']) {
        const ul = $(`[data-tier="${tier}"]`, this.notes);
        ul.textContent = '';
        for (const name of p.notes[tier]) {
          const li = document.createElement('li');
          li.className = 'chip';
          li.style.setProperty('--i', i++);
          li.textContent = name;
          ul.append(li);
        }
      }
      if (shown) {
        void this.notes.offsetWidth;
        this.notes.classList.add('is-in');
      }
    },
  };

  /* ==========================================================================
     Megjelenés görgetéskor + „becsapódó” címek
     ========================================================================== */
  function splitChars(el) {
    const label = el.textContent.replace(/\s+/g, ' ').trim();
    let i = 0;
    const walk = node => {
      Array.from(node.childNodes).forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.append(' '); return; }
            const w = document.createElement('span');
            w.className = 'sw';
            w.setAttribute('aria-hidden', 'true');
            for (const ch of part) {
              const c = document.createElement('span');
              c.className = 'sc';
              c.textContent = ch;
              c.style.setProperty('--i', i++);
              w.append(c);
            }
            frag.append(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(el);
    const sr = document.createElement('span');
    sr.className = 'sr-only';
    sr.textContent = label;
    el.prepend(sr);
  }

  function initReveal() {
    $$('[data-slam]').forEach(splitChars);
    const targets = $$('[data-reveal], [data-slam]');
    if (!('IntersectionObserver' in window)) { targets.forEach(t => t.classList.add('is-in')); return; }
    const io = new IntersectionObserver(entries => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
        if (e.target.hasAttribute('data-slam') && !reduced) {
          const r = e.target.getBoundingClientRect();
          setTimeout(() => {
            FX.burst(r.left + r.width / 2, r.top + r.height / 2, small() ? 20 : 30, { speed: 380, lift: 60 });
          }, 450);
        }
      }
    }, { threshold: .2, rootMargin: '0px 0px -5% 0px' });
    targets.forEach(t => io.observe(t));
  }

  /* ==========================================================================
     Egyéb: kurzor, navigáció, hang, kattintás-villám
     ========================================================================== */
  const Cursor = {
    init() {
      if (!finePointer || reduced) return;
      this.el = $('#cursor');
      this.ring = $('.cursor__ring', this.el);
      this.dot = $('.cursor__dot', this.el);
      root.classList.add('has-cursor');
      this.x = this.rx = -100;
      this.y = this.ry = -100;
      addEventListener('pointermove', e => {
        if (e.pointerType !== 'mouse') return;
        this.x = e.clientX;
        this.y = e.clientY;
        this.dot.style.transform = `translate3d(${this.x}px,${this.y}px,0)`;
      }, { passive: true });
      document.addEventListener('pointerover', e => {
        this.el.classList.toggle('is-hover', !!e.target.closest('a, button, .b3d'));
      });
    },
    update() {
      if (!this.el) return;
      this.rx = lerp(this.rx, this.x, .22);
      this.ry = lerp(this.ry, this.y, .22);
      this.ring.style.transform = `translate3d(${this.rx.toFixed(1)}px,${this.ry.toFixed(1)}px,0)`;
    },
  };

  function initUI() {
    const nav = $('#nav');
    const onScroll = () => nav.classList.toggle('is-solid', scrollY > 30);
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    $$('[data-add]').forEach(b => b.addEventListener('click', () => Cart.add(b.dataset.add, b)));
    $('#toTop').addEventListener('click', () => scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }));

    const sb = $('#soundBtn');
    sb.addEventListener('click', () => {
      const on = !Sound.on;
      if (on && !Sound.init()) { toast('A böngésző nem támogatja a hangot'); return; }
      Sound.on = on;
      sb.setAttribute('aria-pressed', String(on));
      toast(on ? 'Mennydörgés bekapcsolva' : 'Hang kikapcsolva');
      if (on) Sound.thunder(.9);
    });

    // Koppints / kattints bárhová → villám csap oda.
    // Pointer eseményekkel, mert iOS-en a sima felületekre nem érkezik click.
    let last = 0;
    let start = null;
    document.addEventListener('pointerdown', e => {
      start = e.isPrimary ? { x: e.clientX, y: e.clientY, t: performance.now() } : null;
    }, { passive: true });
    document.addEventListener('pointerup', e => {
      const s = start;
      start = null;
      if (!s || reduced || body.classList.contains('intro')) return;
      if (e.target.closest('a, button, input, label, .b3d, .nav, .tabs')) return;
      const now = performance.now();
      if (now - s.t > 450 || Math.hypot(e.clientX - s.x, e.clientY - s.y) > 12 || now - last < 220) return;
      last = now;
      const x = e.clientX;
      const y = e.clientY;
      FX.bolt(clamp(x + rand(-160, 160), 0, innerWidth), -30, x, y, { width: 2.2, branches: 3 });
      FX.burst(x, y, small() ? 22 : 28, { speed: 380 });
      FX.ring(x, y, 100, 650);
      flash(.2, x, y);
      buzz(20);
      Sound.thunder(.5);
    }, { passive: true });
  }

  /* ==========================================================================
     Indítás
     ========================================================================== */
  Hero.init();
  Collection.init();
  Cursor.init();
  initReveal();
  initUI();

  let lastT = performance.now();
  const frame = now => {
    const dt = clamp(now - lastT, 0, 50);
    lastT = now;
    for (const b of Bottle3D.all) b.update(dt, now);
    Hero.update();
    Cursor.update();
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);

  Intro.run();
}
