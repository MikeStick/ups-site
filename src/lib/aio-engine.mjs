// 一体式锂电 UPS（All-in-One Lithium UPS，例如 C1K-Pro / C2K-Pro / C3K-Pro）选型：
// 每个型号内置锂电池，电池节数可选（2 / 4 / 6 节），节数越多备电越久。
// 输入：负载 W、需要的备电小时；输出：推荐型号 + 电池节数、实际备电时间，以及当前负载下所有型号 × 节数的备电表。
// 测试：node scripts/test-aio-engine.mjs

export const AIO_ASSUME = { dod: 0.9, eff: 0.92, maxLoad: 1 };
// 没有已发布型号时用的典型系列（按 C1K/C2K/C3K-Pro 规格：每节约 896 Wh）
export const AIO_GENERIC = [
  { m: '1 kVA', w: 1000, opts: [{ n: 2, wh: 1792 }, { n: 4, wh: 3584 }, { n: 6, wh: 5376 }] },
  { m: '2 kVA', w: 2000, opts: [{ n: 4, wh: 3584 }, { n: 6, wh: 5376 }] },
  { m: '3 kVA', w: 3000, opts: [{ n: 6, wh: 5376 }] },
];
export const LOAD_PRESETS = [300, 500, 800, 1500, 2500];
export const HOUR_PRESETS = [1, 2, 4, 6, 8];

const nums = (s) => String(s).split(/\s*[\/／,，]\s*/).map((x) => parseFloat(x)).filter((x) => x > 0);

// 从产品字段里读电池配置：batterySpec 例如"2/4/6节，1792/3584/5376Wh"；
// 也会在其他字段和 extraSpecs 里找"…Wh"和"…节 / batt."。重量"28/38.5/49"按同样顺序对应。
export function aioOptions(p) {
  const texts = [p.batterySpec, p.batteryCapacity, ...(Array.isArray(p.extraSpecs) ? p.extraSpecs.map((x) => `${x.label || ''} ${x.value || ''}`) : []), p.sellingPoints, p.notes]
    .filter(Boolean).map(String);
  let wh = [], n = [];
  for (const t of texts) {
    if (!wh.length) { const m = t.match(/(\d+(?:\.\d+)?(?:\s*[\/／]\s*\d+(?:\.\d+)?)*)\s*Wh/i); if (m) wh = nums(m[1]); }
    if (!n.length) { const m = t.match(/(\d{1,2}(?:\s*[\/／]\s*\d{1,2})*)\s*(?:节|batt|pcs|块|x\s*batter)/i); if (m) n = nums(m[1]).map(Math.round); }
    if (!wh.length) { const m = t.match(/(\d+(?:\.\d+)?(?:\s*[\/／]\s*\d+(?:\.\d+)?)*)\s*kWh/i); if (m) wh = nums(m[1]).map((x) => Math.round(x * 1000)); }
  }
  const kg = nums(String(p.netWeight || '').replace(/kg/i, '').replace(/[（(].*$/, ''));
  if (!wh.length) return [];
  if (n.length !== wh.length) n = wh.map((_, i) => n[i] || 0);
  return wh.map((w, i) => ({ n: n[i], wh: Math.round(w), kg: kg.length === wh.length ? kg[i] : 0 })).sort((a, b) => a.wh - b.wh);
}

export const runtimeH = (wh, loadW) => (loadW > 0 ? (wh * AIO_ASSUME.dod * AIO_ASSUME.eff) / loadW : 0);

// models: [{ m, slug?, w, opts: [{ n, wh, kg }] }]
export function sizeAio({ loadW, hours, models }) {
  loadW = +loadW || 0; hours = +hours || 0;
  if (loadW <= 0 || !models || !models.length) return null;
  const ms = [...models].filter((x) => x.w > 0 && x.opts && x.opts.length).sort((a, b) => a.w - b.w);
  const fit = ms.filter((x) => x.w * AIO_ASSUME.maxLoad >= loadW);
  const table = ms.map((x) => ({ ...x, ok: x.w >= loadW, opts: x.opts.map((o) => ({ ...o, h: round1(runtimeH(o.wh, loadW)) })) }));
  if (!fit.length) return { over: true, loadW, maxW: ms.length ? ms[ms.length - 1].w : 0, table };
  let pick = null;
  for (const x of fit) { const o = x.opts.find((o) => runtimeH(o.wh, loadW) >= hours); if (o) { pick = { model: x, opt: o }; break; } }
  let short = false;
  if (!pick) { // 哪个都不够：选备电最久的那个（容量最大的电池配置），标出不够
    short = true;
    let best = null;
    for (const x of fit) for (const o of x.opts) if (!best || o.wh > best.opt.wh || (o.wh === best.opt.wh && x.w < best.model.w)) best = { model: x, opt: o };
    pick = best;
  }
  const h = runtimeH(pick.opt.wh, loadW);
  return { loadW, hours, model: pick.model, opt: pick.opt, runtime: round1(h), loadPct: Math.round((loadW / pick.model.w) * 100), short, table };
}
const round1 = (x) => Math.round(x * 10) / 10;
