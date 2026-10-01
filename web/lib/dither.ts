/* 8×8 Bayer matrix, normalised to (v + 0.5) / 64 */
const B8 = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
].map((row) => row.map((v) => (v + 0.5) / 64));

/* Per-cell temporal noise: nudges cells across a level boundary so the pattern churns while the tone holds */
function churn(cx: number, cy: number, tick: number) {
  const n = Math.sin(cx * 127.1 + cy * 311.7 + tick * 74.7) * 43758.5453;
  return n - Math.floor(n) - 0.5;
}

type DitherOptions = { jitter?: number; tick?: number };

/**
 * Ordered dither of a density plane into a square-in-square ladder.
 *
 * Writes 1 into `out` where a pixel is inked. `select` limits the pass to the
 * cells it mostly covers, so two colours can share one grid.
 */
export function ditherPlane(
  density: Float32Array,
  select: Uint8Array | null,
  cell: number,
  w: number,
  h: number,
  out: Uint8Array,
  { jitter = 0, tick = 0 }: DitherOptions = {},
) {
  const s2 = Math.max(2, Math.round(cell * 0.78));
  const hole = Math.max(1, Math.round(s2 * 0.34));
  const off = Math.floor((s2 - hole) / 2);
  const cols = Math.ceil(w / cell);
  const rows = Math.ceil(h / cell);
  out.fill(0);

  const paint = (x0: number, y0: number, rw: number, rh: number, v: number) => {
    for (let y = Math.max(0, y0); y < Math.min(h, y0 + rh); y++)
      for (let x = Math.max(0, x0); x < Math.min(w, x0 + rw); x++) out[y * w + x] = v;
  };

  for (let cy = 0; cy < rows; cy++)
    for (let cx = 0; cx < cols; cx++) {
      const bx = cx * cell;
      const by = cy * cell;
      const x1 = Math.min(w, bx + cell);
      const y1 = Math.min(h, by + cell);
      let d = 0;
      let selected = 0;
      let n = 0;
      for (let y = by; y < y1; y++)
        for (let x = bx; x < x1; x++) {
          const o = y * w + x;
          d += density[o];
          if (!select || select[o]) selected++;
          n++;
        }
      if (!n || selected * 2 < n) continue;
      d = Math.min(0.9, Math.max(0, d / n));
      if (jitter) d += churn(cx, cy, tick) * jitter;

      const threshold = B8[cy & 7][cx & 7];
      const level = Math.max(0, Math.min(4, Math.round(d * 4 + (threshold - 0.5) * 0.9)));
      if (level === 0) continue;

      if (level === 1) paint(bx + off, by + off, hole, hole, 1);
      else if (level === 2) {
        paint(bx, by, s2, 1, 1);
        paint(bx, by + s2 - 1, s2, 1, 1);
        paint(bx, by, 1, s2, 1);
        paint(bx + s2 - 1, by, 1, s2, 1);
      } else if (level === 3) {
        paint(bx, by, s2, s2, 1);
        paint(bx + off, by + off, hole, hole, 0);
      } else paint(bx, by, s2, s2, 1);
    }
  return out;
}
