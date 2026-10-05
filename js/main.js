/* ==========================================================================
   ZEUS — Az istenek illata
   Vanilla JS, külső függőség nélkül.
   ========================================================================== */
(() => {
  'use strict';

  const root = document.documentElement;
  root.classList.remove('no-js');
  root.classList.add('js');

  /* ---------- Segédfüggvények ---------- */
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const rand = (a, b) => a + Math.random() * (b - a);
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const easeOutExpo = t => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
  const easeInOut = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const small = () => innerWidth < 700;
  const fmt = new Intl.NumberFormat('hu-HU');
  const ft = n => `${fmt.format(n)} Ft`;

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  /* ---------- Kiadások ---------- */
  const EDITIONS = {
    amber: {
      name: 'Ambrózia',
      desc: 'Aranyló, mézes melegség, amely szafránnal és borostyánnal izzik a bőrön.',
      top: ['Bergamott', 'Szicíliai mandarin', 'Rózsabors'],
      heart: ['Vadvirágméz', 'Szafrán', 'Narancsvirág', 'Tömjén'],
      base: ['Borostyán', 'Madagaszkári vanília', 'Tonkabab', 'Szantálfa'],
      meters: { longevity: [84, '10+ óra'], sillage: [76, 'Erős'], intensity: [88, 'Mély'] },
      price: { 50: 39900, 100: 59900 },
    },
    sapphire: {
      name: 'Égi Zafír',
      desc: 'Hűvös, villamos frissesség, amely mély, ámbrás fákba hull.',
      top: ['Kalábriai citrom', 'Levendula', 'Ózon', 'Gyömbér'],
      heart: ['Írisz', 'Fekete bors', 'Tengeri só'],
      base: ['Ámbra', 'Oud', 'Vetiver', 'Fehér pézsma'],
      meters: { longevity: [92, '12+ óra'], sillage: [84, 'Királyi'], intensity: [78, 'Erőteljes'] },
      price: { 50: 44900, 100: 64900 },
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
        const comp = this.ctx.createDynamicsCompressor();
        this.master = this.ctx.createGain();
        this.master.gain.value = .75;
        this.master.connect(comp).connect(this.ctx.destination);
        this.brown = this.noise(7, true);
        this.white = this.noise(1.5, false);
      }
      this.ctx.resume();
      return true;
    },
    noise(sec, brown) {
      const ctx = this.ctx;
      const len = Math.floor(ctx.sampleRate * sec);
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
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
      if (now - this.last < .3) return;
      this.last = now;
      const t0 = now + delay;
      const dur = 2.6 + Math.random() * 2.4;
      const p = clamp(power, .2, 1.3);

      const rumble = ctx.createBufferSource();
      rumble.buffer = this.brown;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(1100, t0);
      lp.frequency.exponentialRampToValueAtTime(60, t0 + dur);
      const g = ctx.createGain();
      g.gain.setValueAtTime(.0001, t0);
      g.gain.exponentialRampToValueAtTime(.95 * p, t0 + .05);
      g.gain.exponentialRampToValueAtTime(.32 * p, t0 + .55);
      g.gain.linearRampToValueAtTime(.55 * p, t0 + .7 + Math.random() * .6);
      g.gain.exponentialRampToValueAtTime(.0001, t0 + dur);
      rumble.connect(lp).connect(g).connect(this.master);
      rumble.start(t0, Math.random(), dur + .1);

      const crack = ctx.createBufferSource();
      crack.buffer = this.white;
      const hp = ctx.createBiquadFilter();
      hp.type = 'bandpass';
      hp.frequency.value = 1800;
      hp.Q.value = .6;
      const cg = ctx.createGain();
      cg.gain.setValueAtTime(.0001, t0);
      cg.gain.exponentialRampToValueAtTime(.45 * p, t0 + .008);
      cg.gain.exponentialRampToValueAtTime(.0001, t0 + .4);
      crack.connect(hp).connect(cg).connect(this.master);
      crack.start(t0, Math.random() * .8, .45);
    },
  };

  /* ==========================================================================
     Villám geometria & rajzolás
     ========================================================================== */
  function jag(x1, y1, x2, y2, disp, min) {
    let pts = [[x1, y1], [x2, y2]];
    let d = disp;
    while (d > min) {
      const next = [pts[0]];
      for (let i = 0; i < pts.length - 1; i++) {
        const [ax, ay] = pts[i];
        const [bx, by] = pts[i + 1];
        const dx = bx - ax, dy = by - ay;
        const len = Math.hypot(dx, dy) || 1;
        const off = (Math.random() - .5) * d;
        next.push([(ax + bx) / 2 - (dy / len) * off, (ay + by) / 2 + (dx / len) * off], [bx, by]);
      }
      pts = next;
      d *= .5;
    }
    return pts;
  }

  function polyLen(pts) {
    let L = 0;
    for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    return L;
  }

  function toPath(pts) {
    const p = new Path2D();
    p.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) p.lineTo(pts[i][0], pts[i][1]);
    return p;
  }

  function finishBolt(main, o) {
    const dist = polyLen(main);
    const paths = [{ pts: main, w: 1 }];
    const nb = o.branches ?? Math.round(rand(2, 5));
    for (let i = 0; i < nb; i++) {
      const idx = Math.floor(rand(.08, .8) * (main.length - 4)) + 1;
      const [sx, sy] = main[idx];
      const [nx, ny] = main[Math.min(main.length - 1, idx + 3)];
      const a = Math.atan2(ny - sy, nx - sx) + rand(.35, .95) * (Math.random() < .5 ? -1 : 1);
      const L = Math.min(dist * rand(.08, .26), 420);
      const bp = jag(sx, sy, sx + Math.cos(a) * L, sy + Math.sin(a) * L, L * .35, 2.5);
      paths.push({ pts: bp, w: rand(.3, .55) });
      if (Math.random() < .45 && bp.length > 6) {
        const j = Math.floor(bp.length * rand(.3, .6));
        const [qx, qy] = bp[j];
        const a2 = a + rand(.4, .8) * (Math.random() < .5 ? -1 : 1);
        const L2 = L * rand(.3, .55);
        paths.push({ pts: jag(qx, qy, qx + Math.cos(a2) * L2, qy + Math.sin(a2) * L2, L2 * .35, 2.5), w: .25 });
      }
    }
    for (const p of paths) p.path = toPath(p.pts);
    return {
      paths,
      len: dist,
      width: o.width ?? 2,
      life: 0,
      dur: o.dur ?? 720,
      tint: o.tint || '255,221,160',
      end: main[main.length - 1],
    };
  }

  function createBolt(x1, y1, x2, y2, o = {}) {
    const dist = Math.hypot(x2 - x1, y2 - y1);
    return finishBolt(jag(x1, y1, x2, y2, dist * (o.chaos ?? .24), Math.max(2.5, dist / 180)), o);
  }

  function boltAlong(points, o = {}) {
    let pts = [points[0]];
    for (let i = 0; i < points.length - 1; i++) {
      const [ax, ay] = points[i];
      const [bx, by] = points[i + 1];
      pts = pts.concat(jag(ax, ay, bx, by, Math.hypot(bx - ax, by - ay) * .22, 3).slice(1));
    }
    return finishBolt(pts, o);
  }

  // Valódi villám: gyors vezérkisülés, majd 1-2 visszavillanás és lecsengés.
  function boltAlpha(t) {
    if (t < .12) return 1;
    if (t < .19) return .3;
    if (t < .3) return 1;
    return Math.pow(1 - (t - .3) / .7, 2);
  }

  function drawBolt(ctx, b) {
    const t = b.life / b.dur;
    const a = boltAlpha(t);
    if (a <= .01) return;
    const grow = clamp(t / .09, 0, 1);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (grow < 1) ctx.setLineDash([b.len * grow, b.len * 2]);
    for (const p of b.paths) {
      ctx.shadowColor = `rgba(${b.tint},1)`;
      ctx.shadowBlur = 26;
      ctx.strokeStyle = `rgba(${b.tint},${a * .3})`;
      ctx.lineWidth = b.width * p.w * 5;
      ctx.stroke(p.path);
      ctx.shadowBlur = 9;
      ctx.strokeStyle = `rgba(255,255,255,${a})`;
      ctx.lineWidth = Math.max(.6, b.width * p.w);
      ctx.stroke(p.path);
    }
    ctx.restore();
  }

  function makeGlow(rgb, size = 64) {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const g = c.getContext('2d');
    const h = size / 2;
    const gr = g.createRadialGradient(h, h, 0, h, h, h);
    gr.addColorStop(0, 'rgba(255,255,255,1)');
    gr.addColorStop(.14, `rgba(${rgb},.95)`);
    gr.addColorStop(.42, `rgba(${rgb},.22)`);
    gr.addColorStop(1, `rgba(${rgb},0)`);
    g.fillStyle = gr;
    g.fillRect(0, 0, size, size);
    return c;
  }

  function makeClouds() {
    const W = 1200, H = 460;
    const blobs = [];
    for (let i = 0; i < 95; i++) {
      const y = Math.pow(Math.random(), 1.5) * H * .82;
      blobs.push({ x: rand(0, W), y, r: rand(50, 190) * (1 - (y / H) * .45), a: rand(.12, .42) });
    }
    const paint = (rgb, mul) => {
      const c = document.createElement('canvas');
      c.width = W;
      c.height = H;
      const g = c.getContext('2d');
      for (const b of blobs) {
        for (const dx of [-W, 0, W]) {
          const x = b.x + dx;
          if (x + b.r < 0 || x - b.r > W) continue;
          const gr = g.createRadialGradient(x, b.y, 0, x, b.y, b.r);
          gr.addColorStop(0, `rgba(${rgb},${b.a * mul})`);
          gr.addColorStop(1, `rgba(${rgb},0)`);
          g.fillStyle = gr;
          g.fillRect(x - b.r, b.y - b.r, b.r * 2, b.r * 2);
        }
      }
      g.globalCompositeOperation = 'destination-in';
      const fg = g.createLinearGradient(0, 0, 0, H);
      fg.addColorStop(0, '#000');
      fg.addColorStop(.65, 'rgba(0,0,0,.8)');
      fg.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = fg;
      g.fillRect(0, 0, W, H);
      return c;
    };
    return { dark: paint('36,44,78', 1), lit: paint('255,236,205', .85), ratio: H / W };
  }

  /* ==========================================================================
     Vihar – felhők, parázs, villámok egy vásznon
     ========================================================================== */
  class Storm {
    constructor(canvas, o = {}) {
      this.c = canvas;
      this.ctx = canvas.getContext('2d');
      this.o = Object.assign({
        embers: 60, clouds: true, auto: false, min: 5000, max: 10000,
        flashMul: .7, flashEl: null, cloudAlpha: 1, emberRGB: '247,205,120',
      }, o);
      this.cloudAlpha = this.o.cloudAlpha;
      this.bolts = [];
      this.flash = 0;
      this.flashAt = [0, 0];
      this.t = 0;
      this.raf = 0;
      this.running = false;
      this.visible = true;
      this.glow = makeGlow(this.o.emberRGB, 64);
      if (this.o.clouds) this.clouds = makeClouds();
      this.resize();
      this.embers = Array.from({ length: this.o.embers }, () => this.ember(true));
      this.loop = this.loop.bind(this);
      addEventListener('resize', () => this.resize());
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(([e]) => {
          this.visible = e.isIntersecting;
          if (this.visible && this.running) this.kick();
        }).observe(canvas);
      }
    }
    resize() {
      const r = this.c.getBoundingClientRect();
      const dpr = Math.min(devicePixelRatio || 1, 1.75);
      this.w = r.width || innerWidth;
      this.h = r.height || innerHeight;
      this.c.width = Math.round(this.w * dpr);
      this.c.height = Math.round(this.h * dpr);
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!this.running && this.embers) this.render(0);
    }
    ember(initial) {
      return {
        x: rand(0, this.w), y: initial ? rand(0, this.h) : this.h + rand(5, 40),
        vy: rand(14, 48), vx: rand(-8, 8), r: rand(.6, 2.3), ph: rand(0, 6.28), sp: rand(.8, 2.6),
      };
    }
    start() {
      if (this.running) return;
      this.running = true;
      this.kick();
      this.schedule();
    }
    stop() {
      this.running = false;
      clearTimeout(this.timer);
    }
    kick() {
      if (this.raf) return;
      this.last = performance.now();
      this.raf = requestAnimationFrame(this.loop);
    }
    loop(now) {
      this.raf = 0;
      if (!this.running || !this.visible) return;
      const dt = clamp(now - this.last, 0, 64);
      this.last = now;
      this.render(dt);
      this.raf = requestAnimationFrame(this.loop);
    }
    schedule() {
      if (!this.o.auto) return;
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        if (this.running && this.visible && !document.hidden) this.randomStrike();
        this.schedule();
      }, rand(this.o.min, this.o.max));
    }
    randomStrike(power) {
      const { w, h } = this;
      const x1 = rand(.1, .9) * w;
      const x2 = clamp(x1 + rand(-.25, .25) * w, w * .05, w * .95);
      return this.strike(x1, -20, x2, rand(.4, .78) * h, { power: power ?? rand(.45, .85) });
    }
    strike(x1, y1, x2, y2, o = {}) {
      return this.add(createBolt(x1, y1, x2, y2, { width: clamp(this.w / 800, 1.2, 2.6), ...o }), o);
    }
    strikeAlong(points, o = {}) {
      return this.add(boltAlong(points, { width: 2.2, branches: 6, ...o }), o);
    }
    add(b, o) {
      this.bolts.push(b);
      const p = o.power ?? .8;
      this.flash = Math.min(1.2, this.flash + p * this.o.flashMul);
      this.flashAt = b.end;
      if (o.sound !== false) Sound.thunder(p, rand(.05, .4));
      if (this.running) this.kick();
      return b;
    }
    render(dt) {
      const { ctx, w, h } = this;
      this.t += dt;
      ctx.clearRect(0, 0, w, h);

      // Felhők (két réteg, ellentétes irányba sodródva)
      if (this.clouds && this.cloudAlpha > 0) {
        const tw = Math.max(w * 1.15, 900);
        const th = tw * this.clouds.ratio;
        const layers = [[7, -th * .2, .95, -1], [16, -th * .04, .6, 1]];
        for (const [sp, y, a, dir] of layers) {
          const off = ((((this.t / 1000) * sp * dir) % tw) + tw) % tw;
          for (let x = off - tw; x < w; x += tw) {
            ctx.globalAlpha = a * this.cloudAlpha;
            ctx.drawImage(this.clouds.dark, x, y, tw, th);
            if (this.flash > .02) {
              ctx.globalCompositeOperation = 'lighter';
              ctx.globalAlpha = Math.min(1, this.flash) * a * this.cloudAlpha;
              ctx.drawImage(this.clouds.lit, x, y, tw, th);
              ctx.globalCompositeOperation = 'source-over';
            }
          }
        }
        ctx.globalAlpha = 1;
      }

      // Villanás fénye
      if (this.flash > .01) {
        const [fx, fy] = this.flashAt;
        const g = ctx.createRadialGradient(fx, fy, 0, fx, fy, Math.max(w, h) * .9);
        g.addColorStop(0, `rgba(255,244,222,${Math.min(.55, this.flash * .45)})`);
        g.addColorStop(.4, `rgba(190,200,255,${Math.min(.2, this.flash * .16)})`);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
        ctx.globalCompositeOperation = 'source-over';
        this.flash *= Math.exp(-dt / 170);
      } else this.flash = 0;

      // Villámok
      for (let i = this.bolts.length - 1; i >= 0; i--) {
        const b = this.bolts[i];
        b.life += dt;
        if (b.life >= b.dur) { this.bolts.splice(i, 1); continue; }
        drawBolt(ctx, b);
      }

      // Aranyparázs
      ctx.globalCompositeOperation = 'lighter';
      const s = dt / 1000, T = this.t / 1000;
      for (const e of this.embers) {
        e.y -= e.vy * s;
        e.x += (e.vx + Math.sin(T * e.sp + e.ph) * 12) * s;
        if (e.y < -20 || e.x < -20 || e.x > w + 20) Object.assign(e, this.ember(false));
        const tw = .45 + .55 * Math.abs(Math.sin(T * e.sp * 1.3 + e.ph));
        const fade = clamp(e.y / h, 0, 1);
        ctx.globalAlpha = Math.min(1, tw * (.2 + fade * .8) * (1 + this.flash));
        const sz = e.r * 9;
        ctx.drawImage(this.glow, e.x - sz / 2, e.y - sz / 2, sz, sz);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';

      if (this.o.flashEl) {
        const v = Math.min(1, this.flash).toFixed(3);
        if (v !== this.lastFlash) {
          this.o.flashEl.style.setProperty('--flash', v);
          this.lastFlash = v;
        }
      }
    }
  }

  /* ==========================================================================
     FX – teljes képernyős réteg (szikrák, villámok, lökéshullámok)
     ========================================================================== */
  const FX = {
    init() {
      this.c = $('#fx');
      if (!this.c) return;
      this.ctx = this.c.getContext('2d');
      this.bolts = [];
      this.sparks = [];
      this.rings = [];
      this.raf = 0;
      this.glow = makeGlow('255,210,130', 48);
      this.loop = this.loop.bind(this);
      this.resize();
      addEventListener('resize', () => this.resize());
    },
    resize() {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      this.w = innerWidth;
      this.h = innerHeight;
      this.c.width = Math.round(this.w * dpr);
      this.c.height = Math.round(this.h * dpr);
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    },
    kick() {
      if (!this.ctx || this.raf) return;
      this.last = performance.now();
      this.raf = requestAnimationFrame(this.loop);
    },
    loop(now) {
      const dt = clamp(now - this.last, 0, 48);
      this.last = now;
      const ctx = this.ctx;
      const s = dt / 1000;
      ctx.clearRect(0, 0, this.w, this.h);

      for (let i = this.bolts.length - 1; i >= 0; i--) {
        const b = this.bolts[i];
        b.life += dt;
        if (b.life >= b.dur) { this.bolts.splice(i, 1); continue; }
        drawBolt(ctx, b);
      }

      ctx.globalCompositeOperation = 'lighter';
      for (let i = this.rings.length - 1; i >= 0; i--) {
        const r = this.rings[i];
        r.life += dt;
        const t = r.life / r.dur;
        if (t >= 1) { this.rings.splice(i, 1); continue; }
        ctx.beginPath();
        ctx.arc(r.x, r.y, Math.max(0, r.max * easeOutExpo(t)), 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,222,160,${(1 - t) * .9})`;
        ctx.lineWidth = 2.5 * (1 - t) + .4;
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
        ctx.strokeStyle = `rgba(255,${Math.round(200 + a * 50)},${Math.round(120 + a * 90)},${a})`;
        ctx.lineWidth = p.r;
        ctx.beginPath();
        ctx.moveTo(p.x - p.vx * .025, p.y - p.vy * .025);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        ctx.globalAlpha = a * .8;
        const sz = p.r * 9;
        ctx.drawImage(this.glow, p.x - sz / 2, p.y - sz / 2, sz, sz);
        ctx.globalAlpha = 1;
      }
      ctx.globalCompositeOperation = 'source-over';

      if (this.bolts.length || this.sparks.length || this.rings.length) {
        this.raf = requestAnimationFrame(this.loop);
      } else {
        this.raf = 0;
        ctx.clearRect(0, 0, this.w, this.h);
      }
    },
    bolt(x1, y1, x2, y2, o = {}) {
      if (!this.ctx) return;
      this.bolts.push(createBolt(x1, y1, x2, y2, { width: 1.8, branches: 3, dur: 620, ...o }));
      this.kick();
    },
    burst(x, y, n = 30, o = {}) {
      if (!this.ctx) return;
      const sp = o.speed ?? 420;
      for (let i = 0; i < n; i++) {
        const a = rand(0, Math.PI * 2);
        const v = rand(.25, 1) * sp;
        this.sparks.push({
          x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - (o.lift ?? 140),
          life: 0, max: rand(450, 1150), r: rand(.8, 2.1),
        });
      }
      this.kick();
    },
    ring(x, y, max = 140, dur = 800) {
      if (!this.ctx) return;
      this.rings.push({ x, y, max, dur, life: 0 });
      this.kick();
    },
    strikeAt(x, y, power = .7) {
      this.bolt(clamp(x + rand(-160, 160), 0, this.w), -20, x, y);
      this.burst(x, y, 26);
      this.ring(x, y, 110);
      Sound.thunder(power, .03);
    },
  };

  /* ==========================================================================
     Szöveg effektek
     ========================================================================== */
  function splitText(el) {
    if (el.dataset.splitDone) return;
    el.dataset.splitDone = '1';
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
    el.classList.add('is-split');
    const sr = document.createElement('span');
    sr.className = 'sr-only';
    sr.textContent = label;
    el.prepend(sr);
  }

  function splitWords(el) {
    let i = 0;
    const walk = node => {
      Array.from(node.childNodes).forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.append(' '); return; }
            const s = document.createElement('span');
            s.className = 'sw2';
            s.style.setProperty('--i', i++);
            s.textContent = part;
            frag.append(s);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(el);
    el.style.setProperty('--n', i);
  }

  function splitFlicker(el) {
    const txt = el.textContent.trim();
    el.textContent = '';
    txt.split(' ').forEach((word, wi) => {
      if (wi) el.append(' ');
      const w = document.createElement('span');
      w.className = 'qw';
      for (const ch of word) {
        const c = document.createElement('span');
        c.className = 'qc';
        c.textContent = ch;
        w.append(c);
      }
      el.append(w);
    });
  }

  const GLYPHS = 'ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ';
  function scramble(el, dur = 1200) {
    const final = el.dataset.text ?? el.textContent;
    el.dataset.text = final;
    if (reduced) { el.textContent = final; return; }
    const start = performance.now();
    const step = now => {
      const t = clamp((now - start) / dur, 0, 1);
      let out = '';
      for (let i = 0; i < final.length; i++) {
        const ch = final[i];
        if (ch === ' ' || ch === '—' || t >= .25 + .75 * (i / final.length)) out += ch;
        else out += GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      el.textContent = out;
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function countUp(el) {
    const target = Number(el.dataset.count);
    if (reduced) { el.textContent = target; return; }
    const start = performance.now();
    const D = 2300;
    const tick = now => {
      const t = clamp((now - start) / D, 0, 1);
      el.textContent = Math.round(easeOutExpo(t) * target);
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  function toast(msg) {
    const t = $('#toast');
    if (!t) return;
    $('.toast__msg', t).textContent = msg;
    t.classList.add('is-on');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => t.classList.remove('is-on'), 3200);
  }

  function centerOf(el) {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, r };
  }

  /* ==========================================================================
     Intro – a nyitó jelenet
     ========================================================================== */
  const Intro = {
    exiting: false,
    async run() {
      const el = $('#intro');
      if (!el) return this.done();
      root.classList.add('is-locked');
      scrollTo(0, 0);
      if (reduced) { el.remove(); return this.done(); }
      this.el = el;

      const wh = $('#introWhisper');
      const txt = wh.textContent;
      wh.textContent = '';
      [...txt].forEach((ch, i) => {
        const s = document.createElement('span');
        s.className = 'ch';
        s.style.setProperty('--i', i);
        s.textContent = ch === ' ' ? ' ' : ch;
        wh.append(s);
      });

      this.storm = new Storm($('#introCanvas'), { embers: small() ? 26 : 50, flashMul: 1, cloudAlpha: 0 });
      this.storm.start();
      this.loaded = new Promise(r => (document.readyState === 'complete' ? r() : addEventListener('load', r, { once: true })));

      $('#introSkip').addEventListener('click', () => this.exit());
      this.onKey = e => { if (['Escape', 'Enter', ' '].includes(e.key)) this.exit(); };
      addEventListener('keydown', this.onKey);

      const t0 = performance.now();
      this.counter(t0);
      this.tweenClouds(t0);
      requestAnimationFrame(() => el.classList.add('is-on'));

      try {
        await this.step(420);
        const s = this.storm;
        s.strike(s.w * rand(.74, .88), -20, s.w * rand(.66, .8), s.h * rand(.18, .3), { power: .3, width: 1, branches: 2, sound: false, dur: 500 });
        const fonts = document.fonts ? document.fonts.load('700 100px Cinzel') : Promise.resolve();
        await Promise.race([fonts.catch(() => {}), wait(900)]);
        await this.step(Math.max(0, 1350 - (performance.now() - t0)));

        this.mainStrike();
        await this.step(120);
        el.classList.add('show-logo');
        await this.step(650);
        el.classList.add('show-meander');
        await this.step(450);
        el.classList.add('show-sub');
        scramble($('#introSub'), 1100);
        await this.step(450);
        el.classList.add('show-fill');
        await this.step(650);
        this.sideStrikes();
        await this.step(750);
        await Promise.race([this.loaded, wait(2500)]);
        await this.countDone;
        if (this.exiting) return;
        el.classList.add('is-glow');
        const c = centerOf($('.intro__logo', el));
        FX.burst(c.x, c.y, small() ? 24 : 46, { speed: 520, lift: 40 });
        await this.step(700);
        this.exit();
      } catch (e) {
        /* kihagyva */
      }
    },
    step(ms) {
      return wait(ms).then(() => { if (this.exiting) throw new Error('skip'); });
    },
    tweenClouds(t0) {
      const tick = now => {
        const t = clamp((now - t0) / 1600, 0, 1);
        if (this.storm.cloudAlpha < 1) this.storm.cloudAlpha = easeInOut(t);
        if (t < 1 && !this.exiting) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    },
    counter(t0) {
      const num = $('#introCount');
      const bar = $('#introBar');
      const D = 3900;
      this.countDone = new Promise(res => {
        const tick = now => {
          const t = this.exiting ? 1 : clamp((now - t0) / D, 0, 1);
          const v = Math.round(easeInOut(t) * 100);
          num.textContent = String(v).padStart(3, '0');
          bar.style.setProperty('--p', v / 100);
          if (t < 1) requestAnimationFrame(tick); else res();
        };
        requestAnimationFrame(tick);
      });
    },
    mainStrike() {
      const { storm, el } = this;
      const c = centerOf($('.intro__logo-wrap', el));
      storm.cloudAlpha = 1;
      storm.strike(c.x + rand(-90, 90), -30, c.x, c.y, {
        power: 1.2, width: clamp(storm.w / 520, 2.2, 3.6), branches: 6, dur: 950,
      });
      el.classList.add('is-struck');
      FX.burst(c.x, c.y, small() ? 40 : 75, { speed: 720, lift: 60 });
      FX.ring(c.x, c.y, Math.max(innerWidth, innerHeight) * .5, 1200);
    },
    sideStrikes() {
      const { storm, el } = this;
      const r = $('.intro__logo', el).getBoundingClientRect();
      const y = r.top + r.height * .5;
      const xl = r.left + r.width * .12;
      const xr = r.right - r.width * .1;
      storm.strike(xl - rand(40, 160), -20, xl, y, { power: .6, branches: 3 });
      FX.burst(xl, y, 22, { speed: 380 });
      setTimeout(() => {
        if (this.exiting) return;
        storm.strike(xr + rand(40, 160), -20, xr, y, { power: .6, branches: 3 });
        FX.burst(xr, y, 22, { speed: 380 });
      }, 170);
    },
    async exit() {
      if (this.exiting || !this.el) return;
      this.exiting = true;
      const { el, storm } = this;
      removeEventListener('keydown', this.onKey);
      const w = innerWidth, h = innerHeight;

      // Cikcakkos repedés – ugyanazon a vonalon hasad ketté a kép, ahol a villám fut.
      const N = Math.max(6, Math.round(w / 120));
      const amp = h > w ? 3 : 5;
      const pts = [];
      for (let i = 0; i <= N; i++) {
        const edge = i === 0 || i === N;
        pts.push([(i / N) * 100, 50 + (edge ? rand(-1.5, 1.5) : rand(-amp, amp))]);
      }
      const bottom = pts.map(([x, y]) => `${x}% ${y}%`).join(', ');
      const top = pts.slice().reverse().map(([x, y]) => `${x}% ${y + .25}%`).join(', ');
      $('.intro__half--top > i', el).style.clipPath = `polygon(0 0, 100% 0, ${top})`;
      $('.intro__half--bottom > i', el).style.clipPath = `polygon(${bottom}, 100% 100%, 0 100%)`;

      el.classList.add('is-exit');
      const px = pts.map(([x, y]) => [(x / 100) * w, (y / 100) * h]);
      px[0][0] = -20;
      px[px.length - 1][0] = w + 20;
      storm.cloudAlpha = 1;
      storm.strikeAlong(px, { power: 1, width: 2.6, dur: 1100, branches: 8 });
      px.forEach(([x, y], i) => { if (i % 2) FX.burst(x, y, 10, { speed: 320, lift: 20 }); });

      await wait(170);
      el.classList.add('is-split');
      this.done();
      await wait(1500);
      storm.stop();
      el.remove();
    },
    done() {
      root.classList.remove('is-locked');
      document.body.classList.add('is-ready');
      Hero.enter();
    },
  };

  /* ==========================================================================
     Hero
     ========================================================================== */
  const Hero = {
    init() {
      this.el = $('#hero');
      if (!this.el) return;
      this.stage = $('#heroStageInner');
      this.title = $('.hero__title-inner', this.el);
      this.moves = $$('.hb__move', this.el).map(m => ({ el: m, d: parseFloat(m.dataset.depth) || 0 }));
      this.storm = new Storm($('#heroSky'), {
        embers: small() ? 36 : 80, auto: !reduced, min: 4500, max: 9000, flashEl: this.el, flashMul: .65,
      });
      this.mx = this.my = this.tx = this.ty = 0;
      if (finePointer && !reduced) {
        addEventListener('pointermove', e => {
          this.tx = (e.clientX / innerWidth) * 2 - 1;
          this.ty = (e.clientY / innerHeight) * 2 - 1;
        }, { passive: true });
      }
    },
    enter() {
      if (!this.el) return;
      if (reduced) { this.storm.render(0); return; }
      this.storm.start();
      setTimeout(() => {
        const s = this.storm;
        const r = $('#heroStage').getBoundingClientRect();
        s.strike(s.w / 2 + rand(-80, 80), -20, s.w / 2 + rand(-40, 40), r.top + r.height * .3, { power: 1, width: 2.6, branches: 5 });
      }, 1350);
    },
    update(y, vh) {
      if (!this.el || y > vh * 1.3) return;
      this.mx = lerp(this.mx, this.tx, .06);
      this.my = lerp(this.my, this.ty, .06);
      const p = clamp(y / vh, 0, 1);
      if (reduced) return;
      this.stage.style.transform =
        `translate3d(0, ${(p * vh * .1).toFixed(1)}px, 0) rotateY(${(this.mx * 9).toFixed(2)}deg) rotateX(${(-this.my * 5 + p * 10).toFixed(2)}deg) scale(${(1 - p * .14).toFixed(3)})`;
      this.title.style.transform =
        `translate3d(${(this.mx * -18).toFixed(1)}px, ${(p * vh * .42 + this.my * -8).toFixed(1)}px, 0) scale(${(1 + p * .18).toFixed(3)})`;
      this.title.style.opacity = (1 - p * 1.15).toFixed(3);
      for (const m of this.moves) {
        m.el.style.transform = `translate3d(${(this.mx * 24 * m.d).toFixed(1)}px, ${(this.my * 12 * m.d).toFixed(1)}px, 0)`;
      }
    },
  };

  /* ==========================================================================
     Futószalag
     ========================================================================== */
  const Marquee = {
    init() {
      this.rows = $$('[data-marquee]').map(row => {
        const set = $('.marquee__set', row);
        return { row, set, dir: parseFloat(row.dataset.marquee) || 1, x: 0, w: 1 };
      });
      this.measure();
      addEventListener('resize', () => this.measure());
      if (document.fonts) document.fonts.ready.then(() => this.measure());
    },
    measure() {
      for (const r of this.rows) {
        $$('.marquee__set', r.row).slice(1).forEach(n => n.remove());
        r.w = r.set.offsetWidth || 1;
        const copies = Math.ceil((innerWidth * 2) / r.w) + 1;
        for (let i = 0; i < copies; i++) r.row.append(r.set.cloneNode(true));
        r.x = -Math.random() * r.w;
      }
    },
    update(dt, vel) {
      const boost = Math.min(Math.abs(vel) * 16, 1100);
      const sign = vel < -.5 ? -1 : 1;
      const skew = clamp(vel * .3, -10, 10);
      for (const r of this.rows) {
        const speed = (reduced ? 0 : 55 + boost) * sign;
        r.x -= r.dir * speed * dt / 1000;
        if (r.x <= -r.w) r.x += r.w;
        if (r.x > 0) r.x -= r.w;
        r.row.style.transform = `translate3d(${r.x.toFixed(1)}px,0,0) skewX(${(-skew * r.dir).toFixed(2)}deg)`;
      }
    },
  };

  /* ==========================================================================
     Megjelenési animációk
     ========================================================================== */
  const Reveal = {
    init() {
      $$('[data-split]').forEach(splitText);
      $$('[data-scrub]').forEach(splitWords);
      $$('[data-flicker]').forEach(splitFlicker);
      $$('[data-scramble]').forEach(el => { el.dataset.text = el.textContent; });

      const targets = $$('[data-reveal], [data-split], [data-scramble], .stat, #medallion, #footerGiant, #quoteText');
      if (!('IntersectionObserver' in window)) {
        targets.forEach(el => { el.classList.add('is-in'); this.on(el); });
        return;
      }
      const io = new IntersectionObserver(entries => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add('is-in');
          io.unobserve(e.target);
          this.on(e.target);
        }
      }, { threshold: .15, rootMargin: '0px 0px -6% 0px' });
      targets.forEach(el => io.observe(el));
    },
    on(el) {
      if (el.hasAttribute('data-scramble')) scramble(el);
      if (el.classList.contains('stat')) countUp($('[data-count]', el));
      if (el.id === 'notesPanel') Notes.reveal();
      if (el.id === 'quoteText') Quote.start();
      if (el.id === 'medallion' && !reduced) {
        setTimeout(() => {
          const c = centerOf($('.medallion__disc', el));
          if (c.r.bottom < 0 || c.r.top > innerHeight) return;
          FX.bolt(c.x + rand(-120, 120), Math.max(-20, c.r.top - 360), c.x, c.y, { width: 2, branches: 3 });
          FX.burst(c.x, c.y, 44, { speed: 420 });
          FX.ring(c.x, c.y, c.r.width * .8, 1000);
          Sound.thunder(.7, .02);
        }, 2300);
      }
    },
  };

  /* ==========================================================================
     Illatjegyek
     ========================================================================== */
  const Notes = {
    init() {
      this.sec = $('#illatjegyek');
      if (!this.sec) return;
      this.tabs = $$('[role="tab"]', this.sec);
      this.lists = {
        top: $('[data-tier="top"]', this.sec),
        heart: $('[data-tier="heart"]', this.sec),
        base: $('[data-tier="base"]', this.sec),
      };
      this.info = $('#notesPanel');
      this.stage = $('#notesStage');
      this.current = this.sec.dataset.edition || 'sapphire';
      this.shown = false;
      this.fill(this.current);
      this.applyMeters();

      this.tabs.forEach(t => t.addEventListener('click', () => this.set(t.dataset.edition, true)));
      $('[role="tablist"]', this.sec).addEventListener('keydown', e => {
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
        e.preventDefault();
        const i = this.tabs.findIndex(t => t.dataset.edition === this.current);
        const n = this.tabs[(i + (e.key === 'ArrowRight' ? 1 : this.tabs.length - 1)) % this.tabs.length];
        n.focus();
        this.set(n.dataset.edition, true);
      });
      $$('[data-goto-notes]').forEach(b => b.addEventListener('click', () => {
        const key = b.dataset.gotoNotes;
        this.set(key, false);
        this.sec.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
        setTimeout(() => this.strike(), 1000);
      }));
    },
    set(key, fx = true) {
      if (!this.sec || key === this.current || !EDITIONS[key]) return;
      this.current = key;
      this.sec.dataset.edition = key;
      this.tabs.forEach(t => {
        const on = t.dataset.edition === key;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        if (on) this.info.setAttribute('aria-labelledby', t.id);
      });
      $$('.notes__bottle', this.sec).forEach(b => b.classList.toggle('is-active', b.dataset.edition === key));
      $$('.note', this.sec).forEach(n => n.classList.add('is-out'));
      this.info.classList.add('is-swapping');
      clearTimeout(this.swapT);
      this.swapT = setTimeout(() => {
        this.fill(key);
        this.info.classList.remove('is-swapping');
        if (this.shown) this.showPills();
        this.applyMeters();
      }, 420);
      if (fx) this.strike();
      Order.setEdition(key, false);
    },
    fill(key) {
      const d = EDITIONS[key];
      $('#notesName').textContent = d.name;
      $('#notesDesc').textContent = d.desc;
      const offset = { top: 0, heart: 3, base: 6 };
      for (const tier of Object.keys(this.lists)) {
        const ul = this.lists[tier];
        ul.textContent = '';
        d[tier].forEach((name, i) => {
          const li = document.createElement('li');
          li.className = 'note';
          li.style.setProperty('--i', i + offset[tier]);
          const dot = document.createElement('i');
          dot.setAttribute('aria-hidden', 'true');
          li.append(dot, name);
          ul.append(li);
        });
      }
      const d2 = EDITIONS[key].meters;
      $$('[data-meter-label]', this.sec).forEach(b => { b.textContent = d2[b.dataset.meterLabel][1]; });
    },
    reveal() {
      this.shown = true;
      this.showPills();
      this.applyMeters();
    },
    showPills() {
      requestAnimationFrame(() => requestAnimationFrame(() => {
        $$('.note', this.sec).forEach(n => n.classList.add('is-in'));
      }));
    },
    applyMeters() {
      const m = EDITIONS[this.current].meters;
      $$('[data-meter]', this.sec).forEach(bar => {
        bar.style.setProperty('--v', this.shown ? m[bar.dataset.meter][0] : 0);
      });
    },
    strike() {
      if (reduced || !this.stage) return;
      const c = centerOf(this.stage);
      if (c.r.bottom < 0 || c.r.top > innerHeight) return;
      const y = c.r.top + c.r.height * .42;
      FX.bolt(c.x + rand(-160, 160), Math.max(-20, c.r.top - 240), c.x, y, { width: 2.2, branches: 4 });
      FX.burst(c.x, y, 36, { speed: 440 });
      FX.ring(c.x, y, c.r.width * .55, 900);
      Sound.thunder(.7, .04);
    },
  };

  /* ==========================================================================
     Rendelés
     ========================================================================== */
  const Order = {
    init() {
      this.form = $('#orderForm');
      if (!this.form) return;
      this.sec = $('#rendeles');
      this.state = { edition: this.sec.dataset.edition || 'sapphire', size: 100, qty: 1 };
      this.cart = 0;
      this.priceEl = $('#price');
      this.qtyEl = $('#qty');
      this.seg = $('#sizeSeg');
      this.btn = $('#addToCart');
      this.stage = $('.order__stage', this.sec);
      this.shownPrice = EDITIONS[this.state.edition].price[this.state.size];

      this.form.addEventListener('change', e => {
        const t = e.target;
        if (t.name === 'edition') { this.setEdition(t.value, true); Notes.set(t.value, false); }
        if (t.name === 'size') {
          this.state.size = Number(t.value);
          this.seg.dataset.size = t.value;
          this.update();
        }
      });
      $$('[data-qty]', this.form).forEach(b => b.addEventListener('click', () => {
        this.state.qty = clamp(this.state.qty + Number(b.dataset.qty), 1, 9);
        this.qtyEl.textContent = this.state.qty;
        this.update();
      }));
      this.form.addEventListener('submit', e => { e.preventDefault(); this.add(); });
      $$('[data-price-from]').forEach(el => { el.textContent = ft(EDITIONS[el.dataset.priceFrom].price[50]); });
      this.priceEl.textContent = ft(this.shownPrice);
    },
    setEdition(key, fx = true) {
      if (!this.sec || !EDITIONS[key]) return;
      const changed = key !== this.state.edition;
      this.state.edition = key;
      this.sec.dataset.edition = key;
      $$('.order__bottle', this.sec).forEach(b => b.classList.toggle('is-active', b.dataset.edition === key));
      const radio = $(`input[name="edition"][value="${key}"]`, this.form);
      if (radio) radio.checked = true;
      this.update();
      if (fx && changed && !reduced) {
        const c = centerOf(this.stage);
        const y = c.r.top + c.r.height * .4;
        FX.bolt(c.x + rand(-140, 140), Math.max(-20, c.r.top - 200), c.x, y, { width: 2.2, branches: 4 });
        FX.burst(c.x, y, 30, { speed: 400 });
        Sound.thunder(.6, .04);
      }
    },
    update() {
      const { edition, size, qty } = this.state;
      const target = EDITIONS[edition].price[size] * qty;
      const from = this.shownPrice;
      const start = performance.now();
      const D = reduced ? 1 : 700;
      cancelAnimationFrame(this.raf);
      const tick = now => {
        const t = clamp((now - start) / D, 0, 1);
        this.shownPrice = Math.round(lerp(from, target, easeOutExpo(t)) / 10) * 10;
        this.priceEl.textContent = ft(t >= 1 ? target : this.shownPrice);
        if (t < 1) this.raf = requestAnimationFrame(tick); else this.shownPrice = target;
      };
      this.raf = requestAnimationFrame(tick);
    },
    add() {
      if (this.btn.classList.contains('is-done')) return;
      const { edition, size, qty } = this.state;
      this.cart += qty;
      const cc = $('#cartCount');
      cc.textContent = this.cart;
      cc.classList.add('has-items');
      cc.classList.remove('bump');
      void cc.offsetWidth;
      cc.classList.add('bump');

      if (!reduced) {
        const c = centerOf(this.btn);
        FX.bolt(c.x + rand(-220, 220), -20, c.x, c.r.top, { width: 2.8, branches: 5, dur: 820 });
        FX.burst(c.x, c.y, small() ? 50 : 90, { speed: 640, lift: 220 });
        FX.ring(c.x, c.y, 240, 1000);
        const k = centerOf(cc);
        setTimeout(() => FX.burst(k.x, k.y, 18, { speed: 220, lift: 40 }), 250);
      }
      Sound.thunder(1, 0);
      this.btn.classList.add('is-done');
      setTimeout(() => this.btn.classList.remove('is-done'), 2200);
      toast(`ZEUS ${EDITIONS[edition].name} · ${size} ml × ${qty} – a kosárban`);
    },
  };

  /* ==========================================================================
     Idézet
     ========================================================================== */
  const Quote = {
    init() {
      this.sec = $('#quote');
      if (!this.sec) return;
      this.text = $('#quoteText');
      this.chars = $$('.qc', this.sec);
      this.storm = new Storm($('#quoteSky'), {
        embers: small() ? 20 : 34, auto: !reduced, min: 2600, max: 5600, flashEl: this.sec, flashMul: .8,
      });
      if (reduced) this.storm.render(0);
    },
    start() {
      if (!this.sec || reduced || this.started) return;
      this.started = true;
      this.storm.start();
      this.chars.forEach(c => setTimeout(() => c.classList.add('flick'), 150 + Math.random() * 1500));
      setTimeout(() => this.storm.randomStrike(1), 600);
      setInterval(() => {
        if (!this.storm.visible) return;
        const c = this.chars[(Math.random() * this.chars.length) | 0];
        c.classList.remove('flick');
        void c.offsetWidth;
        c.classList.add('flick');
      }, 850);
    },
  };

  /* ==========================================================================
     Görgetés-vezérelt animációk (egyetlen rAF ciklus)
     ========================================================================== */
  const Scroll = {
    init() {
      this.progress = $('#progress');
      this.nav = $('#nav');
      this.scrubs = $$('[data-scrub]');
      this.quoteSec = $('#quote');
      this.quoteText = $('#quoteText');
      this.craft = $('#mestermu');
      this.track = $('#craftTrack');
      this.craftItems = $$('.craft__item');
      this.craftLine = $('#craftLine');
      this.craftNow = $('#craftNow');
      this.lastY = scrollY;
      this.vel = 0;
      this.layout();
      addEventListener('resize', () => this.layout());
      addEventListener('load', () => this.layout());
      if (document.fonts) document.fonts.ready.then(() => this.layout());
    },
    layout() {
      this.vh = innerHeight;
      this.vw = innerWidth;
      if (this.craft && this.track) {
        this.craftExtra = Math.max(0, this.track.offsetWidth - this.vw);
        this.craft.style.height = `${this.craftExtra + this.vh}px`;
        this.itemPos = this.craftItems.map(it => ({ c: it.offsetLeft + it.offsetWidth / 2 }));
      }
      this.docH = root.scrollHeight - this.vh;
    },
    update(dt) {
      const y = scrollY;
      const vh = this.vh;
      const v = y - this.lastY;
      this.lastY = y;
      this.vel = lerp(this.vel, v, .12);

      if (this.progress) this.progress.style.setProperty('--p', (this.docH > 0 ? clamp(y / this.docH, 0, 1) : 0).toFixed(4));

      if (this.nav) {
        this.nav.classList.toggle('is-scrolled', y > 40);
        if (!root.classList.contains('menu-open')) {
          if (y > vh * .6 && v > 3) this.nav.classList.add('is-hidden');
          else if (v < -3 || y < vh * .6) this.nav.classList.remove('is-hidden');
        }
      }

      Hero.update(y, vh);
      Marquee.update(dt, this.vel);

      for (const s of this.scrubs) {
        const r = s.getBoundingClientRect();
        if (r.bottom < -50 || r.top > vh + 50) continue;
        s.style.setProperty('--p', clamp((vh * .85 - r.top) / (r.height + vh * .35), 0, 1).toFixed(3));
      }

      if (this.craft) {
        const r = this.craft.getBoundingClientRect();
        if (r.top < vh && r.bottom > 0) {
          const p = clamp(-r.top / Math.max(1, r.height - vh), 0, 1);
          const x = p * this.craftExtra;
          this.track.style.transform = `translate3d(${(-x).toFixed(1)}px,0,0)`;
          this.craftLine.style.setProperty('--p', p.toFixed(4));
          let current = 0;
          this.craftItems.forEach((it, i) => {
            const c = (this.itemPos[i].c - x - this.vw / 2) / this.vw;
            it.style.setProperty('--shift', clamp(c, -1.2, 1.2).toFixed(3));
            it.style.setProperty('--focus', clamp(1 - Math.abs(c) * 2, 0, 1).toFixed(3));
            if (c < .3) current = i + 1;
          });
          const label = String(current).padStart(2, '0');
          if (this.craftNow.textContent !== label) this.craftNow.textContent = label;
        }
      }

      if (this.quoteSec && !reduced) {
        const r = this.quoteSec.getBoundingClientRect();
        if (r.top < vh && r.bottom > 0) {
          const c = (r.top + r.height / 2 - vh / 2) / vh;
          this.quoteText.style.setProperty('--s', (1 - Math.min(1, Math.abs(c)) * .2).toFixed(3));
        }
      }
    },
  };

  /* ==========================================================================
     Egyedi kurzor
     ========================================================================== */
  const Cursor = {
    init() {
      if (!finePointer || reduced) return;
      this.el = $('#cursor');
      this.ring = $('.cursor__ring', this.el);
      this.dot = $('.cursor__dot', this.el);
      this.label = $('.cursor__label', this.el);
      root.classList.add('has-cursor');
      this.x = this.rx = innerWidth / 2;
      this.y = this.ry = innerHeight / 2;
      this.el.classList.add('is-hidden');
      addEventListener('pointermove', e => {
        if (e.pointerType !== 'mouse') return;
        this.x = e.clientX;
        this.y = e.clientY;
        this.dot.style.transform = `translate3d(${this.x}px,${this.y}px,0)`;
        this.el.classList.remove('is-hidden');
      }, { passive: true });
      document.addEventListener('pointerover', e => {
        const t = e.target.closest('a, button, label, input, [data-cursor]');
        const lab = t && t.dataset.cursor;
        this.el.classList.toggle('is-hover', !!t && !lab);
        this.el.classList.toggle('has-label', !!lab);
        if (lab) this.label.textContent = lab;
      });
      document.addEventListener('pointerdown', () => this.el.classList.add('is-down'));
      document.addEventListener('pointerup', () => this.el.classList.remove('is-down'));
      document.documentElement.addEventListener('mouseleave', () => this.el.classList.add('is-hidden'));
    },
    update() {
      if (!this.el) return;
      this.rx = lerp(this.rx, this.x, .2);
      this.ry = lerp(this.ry, this.y, .2);
      this.ring.style.transform = `translate3d(${this.rx.toFixed(1)}px,${this.ry.toFixed(1)}px,0)`;
    },
  };

  /* ==========================================================================
     Interakciók: 3D döntés, mágneses gombok, menü, hang, kattintás-villám
     ========================================================================== */
  const UI = {
    init() {
      if (finePointer && !reduced) {
        $$('[data-tilt]').forEach(card => {
          card.addEventListener('pointermove', e => {
            if (e.pointerType !== 'mouse') return;
            const r = card.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width;
            const py = (e.clientY - r.top) / r.height;
            card.style.setProperty('--ry', `${((px - .5) * 16).toFixed(2)}deg`);
            card.style.setProperty('--rx', `${((.5 - py) * 12).toFixed(2)}deg`);
            card.style.setProperty('--gx', `${(px * 100).toFixed(1)}%`);
            card.style.setProperty('--gy', `${(py * 100).toFixed(1)}%`);
            card.classList.add('is-tilting');
          });
          card.addEventListener('pointerleave', () => {
            card.style.setProperty('--rx', '0deg');
            card.style.setProperty('--ry', '0deg');
            card.classList.remove('is-tilting');
          });
        });

        $$('[data-magnetic]').forEach(el => {
          let rect = null;
          el.addEventListener('pointerenter', () => { rect = el.getBoundingClientRect(); });
          el.addEventListener('pointermove', e => {
            if (!rect || e.pointerType !== 'mouse') return;
            const x = e.clientX - (rect.left + rect.width / 2);
            const y = e.clientY - (rect.top + rect.height / 2);
            el.style.transform = `translate(${(x * .28).toFixed(1)}px, ${(y * .4).toFixed(1)}px)`;
          });
          el.addEventListener('pointerleave', () => { rect = null; el.style.transform = ''; });
        });
      }

      // Mobil menü
      const burger = $('#burger');
      const menu = $('#menu');
      const setMenu = open => {
        root.classList.toggle('menu-open', open);
        burger.setAttribute('aria-expanded', String(open));
        menu.setAttribute('aria-hidden', String(!open));
        if (open) $('#nav').classList.remove('is-hidden');
      };
      menu.setAttribute('aria-hidden', 'true');
      burger.addEventListener('click', () => setMenu(!root.classList.contains('menu-open')));
      $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));
      addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

      // Hang
      const sb = $('#soundBtn');
      sb.addEventListener('click', () => {
        const on = !Sound.on;
        if (on && !Sound.init()) { toast('A böngésző nem támogatja a hangot'); return; }
        Sound.on = on;
        sb.setAttribute('aria-pressed', String(on));
        toast(on ? 'Mennydörgés bekapcsolva' : 'Hang kikapcsolva');
        if (on) {
          const hr = $('#hero').getBoundingClientRect();
          if (hr.bottom > innerHeight * .3 && !reduced) Hero.storm.randomStrike(1);
          else Sound.thunder(.9, 0);
        }
      });

      // Vissza a tetejére
      $('#toTop').addEventListener('click', () => scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }));

      // Aktív menüpont
      const links = $$('.nav__links a');
      if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver(entries => {
          for (const e of entries) {
            if (!e.isIntersecting) continue;
            links.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === `#${e.target.id}`));
          }
        }, { rootMargin: '-45% 0px -50% 0px' });
        $$('main section[id]').forEach(s => io.observe(s));
      }

      // Kattints bárhová → villám
      let last = 0;
      document.addEventListener('click', e => {
        if (reduced) return;
        if (e.target.closest('a, button, input, label, select, textarea, #intro, .menu')) return;
        const now = performance.now();
        if (now - last < 200) return;
        last = now;
        FX.strikeAt(e.clientX, e.clientY, .6);
      });
    },
  };

  /* ==========================================================================
     Indítás
     ========================================================================== */
  FX.init();
  Reveal.init();
  Marquee.init();
  Hero.init();
  Notes.init();
  Order.init();
  Quote.init();
  Cursor.init();
  UI.init();
  Scroll.init();

  let lastT = performance.now();
  const frame = now => {
    const dt = clamp(now - lastT, 0, 64);
    lastT = now;
    Scroll.update(dt);
    Cursor.update();
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);

  Intro.run();
})();
