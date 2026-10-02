export type EyeState = "idle" | "think" | "speak";

const TAU = Math.PI * 2;
const FRAME_MS = 45;
const clamp = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/**
 * Draws the assistant's eye on a canvas: a diamond frame around a 13 × 13 grid of
 * cells, the ring of cells lit as the iris. It blinks every few seconds while idle,
 * sweeps round the ring while thinking, and pulses while speaking.
 *
 * Ported from the prototype's eye.js. Returns `destroy`.
 */
export function mountEye(canvas: HTMLCanvasElement, getState: () => EyeState) {
  const ctx = canvas.getContext("2d");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let raf = 0;
  let t0: number | null = null;
  let last = 0;

  function draw(t: number) {
    if (!ctx) return;
    const accent = getComputedStyle(canvas).getPropertyValue("--color-accent").trim() || "#ff4700";
    const state = getState();
    const S = canvas.width;
    const p = Math.floor(S / 15.3);
    const c = S / 2;
    const size = Math.round(p * 0.75);
    const hole = Math.max(2, Math.round(size * 0.34));

    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, S, S);

    const amp = state === "speak" ? clamp(Math.pow(Math.abs(Math.sin(Math.PI * t * 4.3)), 0.8)) : 0;
    const phase = t % 5;
    let lid = 9;
    if (state === "idle" && phase < 0.36) lid = 4.5 * Math.abs(1 - phase / 0.18);

    /* The frame is the boundary: a ring that swells while speaking is cut by the diamond */
    const R = p * 7.35;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(c, c - R);
    ctx.lineTo(c + R, c);
    ctx.lineTo(c, c + R);
    ctx.lineTo(c - R, c);
    ctx.closePath();
    ctx.clip();

    for (let y = -6; y <= 6; y++)
      for (let x = -6; x <= 6; x++) {
        const d = Math.abs(x) + Math.abs(y);
        const base = Math.max(Math.abs(x), Math.abs(y)) <= 5 ? 0.2 : 0.06;
        let ring = clamp(d - (3 - 1.4 * amp) + 1) * clamp(4 + 1.8 * amp - d + 1) * clamp(lid - Math.abs(y) + 0.5);
        if (state === "think" && ring) {
          const diff = (((t * 3 - Math.atan2(y, x)) % TAU) + TAU) % TAU;
          ring *= Math.max(0.14, 1 - diff / 4.2);
        }
        const line = Math.abs(y) < 0.5 && Math.abs(x) <= 4 ? clamp(1 - lid / 1.5) : 0;
        const b = Math.max(ring, line);
        const px = Math.round(c + x * p);
        const py = Math.round(c + y * p);

        ctx.globalAlpha = base + (1 - base) * b;
        ctx.fillStyle = accent;
        ctx.fillRect(px - size / 2, py - size / 2, size, size);

        /* Unlit cells are hollow: their centres are erased, so the eye sits on any ground */
        const h = 1 - clamp((b - 0.45) / 0.4);
        if (h > 0) {
          ctx.globalAlpha = h;
          ctx.globalCompositeOperation = "destination-out";
          ctx.fillStyle = "#000";
          ctx.fillRect(px - hole / 2, py - hole / 2, hole, hole);
          ctx.globalCompositeOperation = "source-over";
        }
      }
    ctx.restore();

    ctx.globalAlpha = 1;
    ctx.strokeStyle = accent;
    ctx.lineWidth = p * 0.21;
    ctx.beginPath();
    ctx.moveTo(c, c - R);
    ctx.lineTo(c + R, c);
    ctx.lineTo(c, c + R);
    ctx.lineTo(c - R, c);
    ctx.closePath();
    ctx.stroke();
  }

  function loop(now: number) {
    raf = requestAnimationFrame(loop);
    if (t0 === null) t0 = now;
    /* Skipped while hidden (the bar's field is not displayed on phones) */
    if (now - last < FRAME_MS || !canvas.offsetParent) return;
    last = now;
    draw((now - t0) / 1000 + 1);
  }

  if (reduced.matches) draw(1);
  else raf = requestAnimationFrame(loop);

  return {
    redraw: () => draw(t0 === null ? 1 : (performance.now() - t0) / 1000 + 1),
    destroy: () => cancelAnimationFrame(raf),
  };
}
