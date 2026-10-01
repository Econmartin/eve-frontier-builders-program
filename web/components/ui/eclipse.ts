import { ditherPlane } from "@/lib/dither";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const sstep = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

type RGB = [number, number, number];

function parseColor(value: string): RGB {
  if (value.startsWith("#")) {
    const hex = value.length === 4 ? [...value.slice(1)].map((c) => c + c).join("") : value.slice(1);
    return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16)) as RGB;
  }
  const parts = value.match(/[\d.]+/g);
  return parts ? [+parts[0], +parts[1], +parts[2]] : [0, 0, 0];
}

type Buffers = {
  n: number;
  dens: Float32Array;
  sel: Uint8Array;
  solid: Uint8Array;
  selA: Uint8Array;
  selI: Uint8Array;
  mA: Uint8Array;
  mI: Uint8Array;
  img: ImageData;
};

const CELLS = 30;
const GLOW = 10;
const SLIDE_MS = 450;
const HOVER_MS = 260;
const MAX_DPR = 2.5;

/**
 * Draws the theme mark on a canvas: an accent sun with an ink body sliding
 * across it, dithered on the same grid as the page art.
 *
 * `host` is the element whose hover and focus light the mark. Returns `set`
 * to move between light (sun) and dark (eclipsed), and `destroy`.
 */
export function mountEclipse(canvas: HTMLCanvasElement, host: HTMLElement) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const root = document.documentElement;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");

  let t = 0;
  let from = 0;
  let to = 0;
  let at = 0;
  let raf = 0;
  let last = 0;
  let buf: Buffers | null = null;

  /* One envelope drives the hover: glow radius, its alpha and the grain's churn all read off `lit` */
  let lit = 0;
  let litFrom = 0;
  let litTo = 0;
  let litAt = 0;

  function ensure(): [number, number, Buffers] | null {
    if (!ctx) return null;
    const dpr = Math.min(MAX_DPR, devicePixelRatio || 1);
    const w = Math.max(8, Math.round(canvas.clientWidth * dpr));
    const h = Math.max(8, Math.round(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      buf = null;
    }
    if (!buf || buf.n !== w * h) {
      const n = w * h;
      buf = {
        n,
        dens: new Float32Array(n),
        sel: new Uint8Array(n),
        solid: new Uint8Array(n),
        selA: new Uint8Array(n),
        selI: new Uint8Array(n),
        mA: new Uint8Array(n),
        mI: new Uint8Array(n),
        img: ctx.createImageData(w, h),
      };
    }
    return [w, h, buf];
  }

  function build(w: number, h: number, { dens, sel, solid }: Buffers) {
    dens.fill(0);
    sel.fill(0);
    solid.fill(0);
    const cx = w / 2;
    const cy = h / 2;
    const R = Math.min(w, h) * 0.34;
    const e = ease(t);
    const sx = cx + mix(-2.5, 0.3, e) * R;
    const sy = cy + mix(-0.6, -0.16, e) * R;
    const halo = mix(0.62, 0.16, e) * lit;
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        const sun = Math.hypot(x - cx, y - cy) - R;
        const body = Math.hypot(x - sx, y - sy) - R * 1.02;
        if (sun < 0) {
          if (body < 0) {
            dens[i] = mix(0.3, 0.9, sstep(0, -R * 0.7, body));
            sel[i] = 2;
          } else solid[i] = 1;
        } else if (sun < R * 0.52 && body > 0) {
          dens[i] = halo * (1 - sun / (R * 0.52));
          sel[i] = 1;
        }
      }
  }

  function paint(now: number) {
    const sized = ensure();
    if (!ctx || !sized) return;
    const [w, h, b] = sized;
    build(w, h, b);
    const { dens, sel, solid, selA, selI, mA, mI, img } = b;
    for (let i = 0; i < w * h; i++) {
      selA[i] = sel[i] === 1 ? 1 : 0;
      selI[i] = sel[i] === 2 ? 1 : 0;
    }

    /* Cell size has a floor in device pixels, so the grain stays chunky at 40px */
    const cell = Math.max(5, Math.round(Math.min(w, h) / CELLS));
    const hard = Math.min(w, h) / cell < 9;
    const live = lit > 0.002 && !reduced.matches;
    if (hard) {
      mA.fill(0);
      mI.fill(0);
    } else {
      const options = live ? { jitter: 0.2 * lit, tick: Math.floor(now / 110) } : {};
      ditherPlane(dens, selA, cell, w, h, mA, options);
      ditherPlane(dens, selI, cell, w, h, mI, options);
    }

    const accent = parseColor(getComputedStyle(root).getPropertyValue("--color-accent").trim());
    const ink = parseColor(getComputedStyle(canvas).color);
    const d = img.data;
    for (let i = 0; i < w * h; i++) {
      const o = i * 4;
      let c: RGB | null = null;
      if (solid[i] === 1) c = accent;
      else if (hard) {
        if (dens[i] > 0.46) c = sel[i] === 1 ? accent : ink;
      } else if (mA[i]) c = accent;
      else if (mI[i]) c = ink;
      if (c) {
        d[o] = c[0];
        d[o + 1] = c[1];
        d[o + 2] = c[2];
        d[o + 3] = 255;
      } else d[o + 3] = 0;
    }
    ctx.putImageData(img, 0, 0);

    /* The glow is drawn per frame: a CSS transition from `filter: none` pads the missing shadow with black */
    const pale = Math.round(mix(100, 20, t));
    const hue = `color-mix(in srgb, var(--color-accent) ${pale}%, var(--color-foreground))`;
    const colour = `color-mix(in srgb, ${hue} ${(mix(68, 58, t) * lit).toFixed(1)}%, transparent)`;
    const g = GLOW * lit;
    canvas.style.filter =
      g < 0.4
        ? "none"
        : `drop-shadow(0 0 ${g.toFixed(1)}px ${colour}) drop-shadow(0 0 ${(g * 0.34).toFixed(1)}px ${colour})`;
  }

  function frame(now: number) {
    const moving = t !== to;
    const fading = lit !== litTo;
    if (!moving && !fading && (litTo === 0 || reduced.matches)) {
      raf = 0;
      return;
    }
    /* A ramp wants every frame; a held hover only wants the churn rate */
    if (!moving && !fading && now - last < 90) {
      raf = requestAnimationFrame(frame);
      return;
    }
    last = now;
    if (moving) {
      const k = Math.min(1, (now - at) / SLIDE_MS);
      t = k === 1 ? to : mix(from, to, k);
    }
    if (fading) {
      const k = Math.min(1, (now - litAt) / HOVER_MS);
      lit = k === 1 ? litTo : mix(litFrom, litTo, k);
    }
    paint(now);
    raf = requestAnimationFrame(frame);
  }

  const wake = () => {
    if (!raf) raf = requestAnimationFrame(frame);
  };

  const setHover = (on: boolean) => {
    litFrom = lit;
    litTo = on ? 1 : 0;
    litAt = performance.now();
    wake();
  };

  const onEnter = () => setHover(true);
  const onLeave = () => setHover(false);
  const onResize = () => paint(performance.now());

  host.addEventListener("pointerenter", onEnter);
  host.addEventListener("pointerleave", onLeave);
  host.addEventListener("focusin", onEnter);
  host.addEventListener("focusout", onLeave);
  addEventListener("resize", onResize);

  return {
    /* `instant` on first paint, so the page does not load mid-eclipse */
    set(dark: boolean, instant = false) {
      to = dark ? 1 : 0;
      if (instant || reduced.matches) {
        t = to;
        paint(performance.now());
        return;
      }
      from = t;
      at = performance.now();
      wake();
    },
    destroy() {
      cancelAnimationFrame(raf);
      host.removeEventListener("pointerenter", onEnter);
      host.removeEventListener("pointerleave", onLeave);
      host.removeEventListener("focusin", onEnter);
      host.removeEventListener("focusout", onLeave);
      removeEventListener("resize", onResize);
    },
  };
}
