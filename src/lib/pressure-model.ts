// Schematic plantar pressure model rendered as a sensor grid (pedobarography look).
// Foot-local units: foot length = 1, x runs medial -> lateral (max FOOT_W), y runs toes -> heel.
// t = 0: shoe only, t = 1: heat-moulded contoured insole.
// The heel peak values are the measured means from Bonanno et al., Sci Rep 2019;9:1688
// (walking in work-type boots, n = 28): 214.1 kPa -> 172.5 kPa (-19 %). Everything else is illustrative.

export const HEEL_PEAK_WITHOUT = 214.1;
export const HEEL_PEAK_WITH = 172.5;
export const SCALE_MAX = 232; // kPa at the top of the colour ramp

const FOOT_W = 0.385;

type RGB = [number, number, number];

// colour ramp in brand colours: navy -> steel -> light olive -> near white
export const PRESSURE_RAMP: ReadonlyArray<readonly [number, RGB]> = [
  [0.0, [27, 51, 75]],
  [0.18, [44, 82, 110]],
  [0.4, [80, 126, 152]],
  [0.58, [116, 159, 181]],
  [0.76, [184, 194, 128]],
  [0.9, [228, 233, 176]],
  [1.0, [252, 253, 236]],
];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const smoothstep = (e0: number, e1: number, x: number) => {
  const k = clamp01((x - e0) / (e1 - e0));
  return k * k * (3 - 2 * k);
};

// signed distance helpers (negative = inside)
function sdEllipse(x: number, y: number, cx: number, cy: number, rx: number, ry: number, rot = 0) {
  const c = Math.cos(rot);
  const s = Math.sin(rot);
  const dx = x - cx;
  const dy = y - cy;
  const px = (dx * c + dy * s) / rx;
  const py = (-dx * s + dy * c) / ry;
  return (Math.hypot(px, py) - 1) * Math.min(rx, ry);
}

function sdCapsule(x: number, y: number, ax: number, ay: number, bx: number, by: number, r: number) {
  const pax = x - ax;
  const pay = y - ay;
  const bax = bx - ax;
  const bay = by - ay;
  const h = clamp01((pax * bax + pay * bay) / (bax * bax + bay * bay));
  return Math.hypot(pax - bax * h, pay - bay * h) - r;
}

const smin = (a: number, b: number, k: number) => {
  const h = clamp01(0.5 + (0.5 * (b - a)) / k);
  return lerp(b, a, h) - k * h * (1 - h);
};

function contactDistance(x: number, y: number, t: number) {
  const heel = sdEllipse(x, y, 0.2, 0.868, 0.118, 0.122);
  const fore = sdEllipse(x, y, 0.192, 0.305, 0.182, 0.098, -0.2);
  // midfoot isthmus: a lateral band without support, widening medially as the moulded contour fills the arch
  const mx = lerp(0.268, 0.222, t);
  const midfoot = sdCapsule(x, y, mx - 0.012, 0.75, mx + 0.012, 0.43, lerp(0.062, 0.108, t));
  const sole = smin(smin(heel, midfoot, 0.05), fore, 0.05);
  const toes = Math.min(
    sdEllipse(x, y, 0.082, 0.088, 0.05, 0.064, -0.08),
    sdEllipse(x, y, 0.172, 0.062, 0.031, 0.04),
    sdEllipse(x, y, 0.232, 0.08, 0.028, 0.036),
    sdEllipse(x, y, 0.282, 0.106, 0.026, 0.033),
    sdEllipse(x, y, 0.324, 0.14, 0.024, 0.029),
  );
  return Math.min(sole, toes);
}

const gauss = (x: number, y: number, cx: number, cy: number, sx: number, sy: number) =>
  Math.exp(-((x - cx) ** 2 / (2 * sx * sx) + (y - cy) ** 2 / (2 * sy * sy)));

function pressureAt(x: number, y: number, t: number) {
  let p = lerp(HEEL_PEAK_WITHOUT, HEEL_PEAK_WITH, t) * gauss(x, y, 0.2, 0.875, lerp(0.062, 0.078, t), lerp(0.066, 0.082, t));
  p += lerp(62, 74, t) * gauss(x, y, 0.275, 0.6, 0.05, 0.13); // lateral midfoot
  p += lerp(0, 56, t) * gauss(x, y, 0.15, 0.6, 0.055, 0.12); // medial arch
  p += 150 * gauss(x, y, 0.085, 0.325, 0.05, 0.055); // metatarsal head 1
  p += 170 * gauss(x, y, 0.2, 0.29, 0.06, 0.055); // metatarsal heads 2-3
  p += 115 * gauss(x, y, 0.315, 0.335, 0.05, 0.055); // metatarsal heads 4-5
  p += lerp(165, 180, t) * gauss(x, y, 0.082, 0.09, 0.036, 0.046); // hallux (+9 % in the study)
  p += 84 * gauss(x, y, 0.172, 0.064, 0.024, 0.03);
  p += 66 * gauss(x, y, 0.232, 0.082, 0.022, 0.028);
  p += 50 * gauss(x, y, 0.282, 0.108, 0.02, 0.026);
  p += 38 * gauss(x, y, 0.324, 0.142, 0.018, 0.022);
  return p;
}

// deterministic per-cell jitter so the map reads as measured data
const hash = (i: number, j: number, seed: number) => {
  const s = Math.sin(i * 127.1 + j * 311.7 + seed * 74.7) * 43758.5453;
  return s - Math.floor(s);
};

function ramp(v: number): RGB {
  const k = clamp01(v);
  for (let i = 1; i < PRESSURE_RAMP.length; i++) {
    const [p1, c1] = PRESSURE_RAMP[i];
    if (k <= p1) {
      const [p0, c0] = PRESSURE_RAMP[i - 1];
      const f = (k - p0) / (p1 - p0);
      return [lerp(c0[0], c1[0], f), lerp(c0[1], c1[1], f), lerp(c0[2], c1[2], f)];
    }
  }
  return PRESSURE_RAMP[PRESSURE_RAMP.length - 1][1];
}

export type PressureMapOptions = {
  /** 0 = shoe only, 1 = with the heat-moulded insole */
  t: number;
  /** CSS pixel size of the canvas */
  width: number;
  height: number;
  dpr?: number;
  /** sensor cell pitch in CSS pixels */
  cell?: number;
  gap?: number;
};

export function renderPressureMap(canvas: HTMLCanvasElement, { t, width, height, dpr = 1, cell = 9, gap = 1.5 }: PressureMapOptions) {
  const w = Math.round(width * dpr);
  const h = Math.round(height * dpr);
  if (canvas.width !== w) canvas.width = w;
  if (canvas.height !== h) canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const footLen = Math.min(height * 0.92, (width * 0.92) / (FOOT_W * 2 + 0.085));
  const footW = FOOT_W * footLen;
  const between = footLen * 0.085;
  const x0 = (width - (footW * 2 + between)) / 2;
  const y0 = (height - footLen) / 2;
  const feet = [
    { ox: x0, mirror: true, seed: 1 }, // left foot, medial edge faces the centre
    { ox: x0 + footW + between, mirror: false, seed: 2 },
  ];

  const cols = Math.floor(width / cell);
  const rows = Math.floor(height / cell);
  const offX = (width - cols * cell) / 2;
  const offY = (height - rows * cell) / 2;
  const size = cell - gap;
  const radius = Math.min(1.8, size / 4);

  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const px = offX + i * cell + cell / 2;
      const py = offY + j * cell + cell / 2;
      let drawn = false;
      for (const foot of feet) {
        let lx = (px - foot.ox) / footLen;
        const ly = (py - y0) / footLen;
        if (foot.mirror) lx = FOOT_W - lx;
        if (lx < -0.03 || lx > FOOT_W + 0.03 || ly < -0.03 || ly > 1.03) continue;
        const d = contactDistance(lx, ly, t);
        if (d >= 0) continue;
        const edge = smoothstep(0, 0.034, -d);
        const jitter = 1 + (hash(i, j, foot.seed) - 0.5) * 0.1;
        const v = (pressureAt(lx, ly, t) * lerp(0.35, 1, edge) * jitter) / SCALE_MAX;
        const [r, g, b] = ramp(v);
        ctx.fillStyle = `rgba(${r | 0},${g | 0},${b | 0},${lerp(0.55, 1, clamp01(v * 2.2))})`;
        ctx.beginPath();
        ctx.roundRect(px - size / 2, py - size / 2, size, size, radius);
        ctx.fill();
        drawn = true;
        break;
      }
      if (!drawn) {
        ctx.fillStyle = "rgba(255,255,255,0.05)";
        ctx.beginPath();
        ctx.arc(px, py, 0.9, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}
