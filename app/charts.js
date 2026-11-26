// charts.js — the site's own canvas charts. No libraries: each function takes
// a <canvas> element and plain data, sizes for the device pixel ratio, and
// draws axes, gridlines, value labels and a legend in the site's palette.

const INK = '#14201f';
const TEAL = '#0e6b5c';
const AMBER = '#e8a317';
const SLATE = '#6b7a76';
const GRID = '#ddd8c9';
const SLATE_BLUE = '#4a6b8a';

function setup(canvas, height) {
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth || canvas.parentElement.clientWidth || 600;
  const h = height;
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  canvas.style.height = h + 'px';
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  return { ctx, w, h };
}

function niceBounds(values, pad = 0.12) {
  let min = Math.min(...values);
  let max = Math.max(...values);
  if (min === max) { min -= 1; max += 1; }
  const span = max - min;
  min -= span * pad;
  max += span * pad;
  return { min, max };
}

function axes(ctx, x0, y0, x1, y1, labels, ymin, ymax, format) {
  ctx.strokeStyle = GRID;
  ctx.fillStyle = SLATE;
  ctx.font = '11px system-ui, -apple-system, sans-serif';
  ctx.lineWidth = 1;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  const steps = 4;
  for (let i = 0; i <= steps; i++) {
    const v = ymin + ((ymax - ymin) * i) / steps;
    const y = y1 - ((v - ymin) / (ymax - ymin)) * (y1 - y0);
    ctx.beginPath();
    ctx.moveTo(x0, y);
    ctx.lineTo(x1, y);
    ctx.stroke();
    ctx.fillText(format(v), x0 - 6, y);
  }
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  labels.forEach((lab, i) => {
    const x = x0 + ((i + 0.5) / labels.length) * (x1 - x0);
    ctx.fillText(String(lab), x, y1 + 6);
  });
}

function legend(ctx, items, x, y) {
  ctx.font = '12px system-ui, -apple-system, sans-serif';
  ctx.textBaseline = 'middle';
  let cx = x;
  for (const item of items) {
    ctx.fillStyle = item.colour;
    ctx.fillRect(cx, y - 5, 14, 10);
    ctx.fillStyle = INK;
    ctx.textAlign = 'left';
    ctx.fillText(item.label, cx + 19, y);
    cx += 19 + ctx.measureText(item.label).width + 22;
  }
}

// Line chart with one or more series. opts: labels, series[{label, colour, values}],
// height, format (value formatter), yLabel.
export function lineChart(canvas, opts) {
  const height = opts.height || 260;
  const { ctx, w, h } = setup(canvas, height);
  const all = opts.series.flatMap((s) => s.values);
  const { min, max } = niceBounds(all);
  const padL = 52, padR = 14, padT = 30, padB = 26;
  const x0 = padL, y0 = padT, x1 = w - padR, y1 = h - padB;
  legend(ctx, opts.series.map((s) => ({ label: s.label, colour: s.colour })), x0, 14);
  axes(ctx, x0, y0, x1, y1, opts.labels, min, max, opts.format || ((v) => v.toFixed(1)));
  const n = opts.labels.length;
  for (const s of opts.series) {
    ctx.strokeStyle = s.colour;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    s.values.forEach((v, i) => {
      const x = x0 + ((i + 0.5) / n) * (x1 - x0);
      const y = y1 - ((v - min) / (max - min)) * (y1 - y0);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.fillStyle = s.colour;
    s.values.forEach((v, i) => {
      const x = x0 + ((i + 0.5) / n) * (x1 - x0);
      const y = y1 - ((v - min) / (max - min)) * (y1 - y0);
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    });
  }
  if (opts.yLabel) {
    ctx.fillStyle = SLATE;
    ctx.font = '11px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(opts.yLabel, x0, h - 12);
  }
}

// Vertical bar chart. opts: labels, values, colour, height, format, yLabel.
export function barChart(canvas, opts) {
  const height = opts.height || 260;
  const { ctx, w, h } = setup(canvas, height);
  const values = opts.values;
  const min = Math.min(0, ...values);
  const max = Math.max(...values);
  const { min: ymin, max: ymax } = niceBounds([min, max]);
  const padL = 52, padR = 14, padT = 14, padB = 26;
  const x0 = padL, y0 = padT, x1 = w - padR, y1 = h - padB;
  axes(ctx, x0, y0, x1, y1, opts.labels, ymin, ymax, opts.format || ((v) => v.toFixed(1)));
  const n = values.length;
  const slot = (x1 - x0) / n;
  const bw = Math.min(46, slot * 0.62);
  const zeroY = y1 - ((0 - ymin) / (ymax - ymin)) * (y1 - y0);
  values.forEach((v, i) => {
    const x = x0 + (i + 0.5) * slot - bw / 2;
    const y = y1 - ((v - ymin) / (ymax - ymin)) * (y1 - y0);
    ctx.fillStyle = v < 0 ? '#b3543f' : (opts.colour || TEAL);
    ctx.fillRect(x, Math.min(y, zeroY), bw, Math.abs(zeroY - y));
    ctx.fillStyle = INK;
    ctx.font = '11px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = v < 0 ? 'top' : 'bottom';
    ctx.fillText((opts.format || ((x) => x.toFixed(1)))(v), x + bw / 2, v < 0 ? y + 4 : y - 4);
  });
  if (opts.yLabel) {
    ctx.fillStyle = SLATE;
    ctx.font = '11px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(opts.yLabel, x0, h - 12);
  }
}

// Grouped bars for two series (exports vs imports).
export function groupedBarChart(canvas, opts) {
  const height = opts.height || 260;
  const { ctx, w, h } = setup(canvas, height);
  const all = [...opts.series[0].values, ...opts.series[1].values];
  const { min, max } = niceBounds([0, ...all]);
  const padL = 52, padR = 14, padT = 30, padB = 26;
  const x0 = padL, y0 = padT, x1 = w - padR, y1 = h - padB;
  legend(ctx, opts.series.map((s) => ({ label: s.label, colour: s.colour })), x0, 14);
  axes(ctx, x0, y0, x1, y1, opts.labels, min, max, opts.format || ((v) => v.toFixed(0)));
  const n = opts.labels.length;
  const slot = (x1 - x0) / n;
  const bw = Math.min(30, slot * 0.34);
  opts.series.forEach((s, si) => {
    ctx.fillStyle = s.colour;
    s.values.forEach((v, i) => {
      const x = x0 + (i + 0.5) * slot - bw + si * bw;
      const y = y1 - ((v - min) / (max - min)) * (y1 - y0);
      ctx.fillRect(x, y, bw, y1 - y);
    });
  });
}

// Donut chart with a centre label and a side legend list drawn in HTML.
export function donutChart(canvas, segments) {
  const height = 240;
  const { ctx, w, h } = setup(canvas, height);
  const cx = w / 2;
  const cy = h / 2;
  const r = Math.min(w, h) / 2 - 14;
  const total = segments.reduce((a, s) => a + s.share, 0);
  let start = -Math.PI / 2;
  for (const s of segments) {
    const sweep = (s.share / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, start, start + sweep);
    ctx.closePath();
    ctx.fillStyle = s.colour;
    ctx.fill();
    const mid = start + sweep / 2;
    const lx = cx + Math.cos(mid) * (r * 0.66);
    const ly = cy + Math.sin(mid) * (r * 0.66);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(s.share.toFixed(1) + '%', lx, ly);
    start += sweep;
  }
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.52, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.fillStyle = INK;
  ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
  ctx.fillText('GDP by sector', cx, cy - 8);
  ctx.fillStyle = SLATE;
  ctx.font = '12px system-ui, -apple-system, sans-serif';
  ctx.fillText('2024', cx, cy + 12);
}

// Population pyramid: women left (teal), men right (amber), 5-year bands.
export function pyramidChart(canvas, bands) {
  const height = 420;
  const { ctx, w, h } = setup(canvas, height);
  const maxV = Math.max(...bands.flatMap((b) => [b.women, b.men]));
  const padT = 30, padB = 24;
  const rowH = (h - padT - padB) / bands.length;
  const centre = w / 2;
  const half = (w / 2) - 46;
  ctx.font = '12px system-ui, -apple-system, sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = TEAL;
  ctx.textAlign = 'right';
  ctx.fillText('Women', centre - 8, 12);
  ctx.fillStyle = AMBER;
  ctx.textAlign = 'left';
  ctx.fillText('Men', centre + 8, 12);
  bands.forEach((b, i) => {
    const y = padT + i * rowH;
    const bh = Math.max(4, rowH - 3);
    const wW = (b.women / maxV) * half;
    const wM = (b.men / maxV) * half;
    ctx.fillStyle = TEAL;
    ctx.fillRect(centre - wW, y, wW, bh);
    ctx.fillStyle = AMBER;
    ctx.fillRect(centre, y, wM, bh);
    ctx.fillStyle = INK;
    ctx.font = '11px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(b.band, centre - half - 6, y + bh / 2);
    ctx.textAlign = 'left';
    ctx.fillText(String(b.women), centre - wW - 4, y + bh / 2);
    ctx.fillText(String(b.men), centre + wM + 4, y + bh / 2);
  });
  ctx.fillStyle = SLATE;
  ctx.font = '11px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Thousands of people, 2024', centre, h - 8);
}

export { SLATE_BLUE };
