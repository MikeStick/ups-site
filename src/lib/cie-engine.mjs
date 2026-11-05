// 工商业户外储能柜（风冷 / 液冷，电池 + PCS 一体，选配光伏 DC-DC 和 STS）选型：
// 用途 peak（削峰填谷）/ backup（备用电源，需要 STS）/ pv（光伏 + 储能，需要 PV DC-DC）
// 柜数 = max(功率 ÷ 单柜 PCS 功率, 能量 ÷ 单柜可用能量, 光伏功率 ÷ 单柜光伏输入)；柜数最少的型号优先，其次总能量最接近需求、占地小。
// 测试：node scripts/test-cie-engine.mjs

export const CI_ASSUME = { dod: 0.9, eff: 0.95, pvPerCab: 100, maxPar: 10 };
export const KW_PRESETS = [50, 100, 200, 500, 1000];
export const H_PRESETS = [1, 2, 3, 4];
// 没有已发布型号时用的典型系列（来自风冷 / 液冷户外柜规格书）
export const CI_GENERIC = [
  { m: 'DZ062107B', cool: 'air', kwh: 107, kw: 62.5, v: 819.2, pv: true, sts: true, dims: [1000, 1300, 2100], t: 1.8 },
  { m: 'DZ105215B', cool: 'air', kwh: 215, kw: 105, v: 819.2, pv: true, sts: true, dims: [1850, 1250, 2280], t: 3.0 },
  { m: 'DZ105215B (UP)', cool: 'air', kwh: 215, kw: 105, v: 768, pv: false, sts: false, dims: [1310, 995, 2100], t: 3.2 },
  { m: 'DZ105233L2', cool: 'liquid', kwh: 233, kw: 105, v: 832, pv: true, sts: true, dims: [1692, 1385, 2220], t: 3.2 },
  { m: 'DZ105233L3', cool: 'liquid', kwh: 233, kw: 105, v: 832, pv: false, sts: false, dims: [1040, 1322, 2320], t: 3.0 },
];

const area = (m) => (m.dims && m.dims.length === 3 ? (m.dims[0] * m.dims[1]) / 1e6 : 0);

// q = { app, kw, hours, pvKw, cool: 'any'|'air'|'liquid', models }
export function sizeCi(q) {
  const kw = +q.kw || 0, hours = +q.hours || 0, pvKw = q.app === 'pv' ? +q.pvKw || 0 : 0;
  if (kw <= 0 || hours <= 0 || !q.models || !q.models.length) return null;
  const needOpt = q.app === 'backup' ? 'sts' : q.app === 'pv' ? 'pv' : '';
  // 先按选配过滤（备用电源要 STS、光伏要 PV DC-DC）；一个都没有时不过滤，标出 optMissing
  let all = q.models.filter((m) => m.kw > 0 && m.kwh > 0);
  let optMissing = false;
  if (needOpt) { const w = all.filter((m) => m[needOpt]); if (w.length) all = w; else optMissing = true; }
  const pool = all.filter((m) => !q.cool || q.cool === 'any' || m.cool === q.cool);
  if (!pool.length) return { none: true };
  const needKwh = (kw * hours) / (CI_ASSUME.dod * CI_ASSUME.eff);
  const size = (list) => list.map((m) => {
    const nP = Math.ceil(kw / m.kw - 1e-9), nE = Math.ceil(needKwh / m.kwh - 1e-9), nV = pvKw ? Math.ceil(pvKw / CI_ASSUME.pvPerCab - 1e-9) : 0;
    const n = Math.max(1, nP, nE, nV);
    return { mod: m, n, by: n === nV && nV > Math.max(nP, nE) ? 'pv' : nP > nE ? 'power' : 'energy', totalKwh: n * m.kwh };
  }).sort((a, b) => a.n - b.n || a.totalKwh - b.totalKwh || area(a.mod) - area(b.mod)); // 柜子少优先，其次总能量少、占地小
  const cand = size(pool);
  const c = cand[0], m = c.mod;
  const usable = c.totalKwh * CI_ASSUME.dod;
  const out = (x) => ({ mod: x.mod, n: x.n, totalKwh: Math.round(x.totalKwh), totalKw: Math.round(x.n * x.mod.kw * 10) / 10 });
  // 另一种冷却方式的最佳方案，给客户对比
  const other = size(all.filter((x) => x.cool !== m.cool))[0];
  return {
    app: q.app, kw, hours, pvKw, needKwh: Math.round(needKwh), optMissing, needOpt,
    ...out(c), by: c.by, usableKwh: Math.round(usable), runtime: Math.round(((usable * CI_ASSUME.eff) / kw) * 10) / 10,
    area: Math.round(c.n * area(m) * 10) / 10, tons: m.t ? Math.round(c.n * m.t * 10) / 10 : 0, pvMax: m.pv ? c.n * CI_ASSUME.pvPerCab : 0,
    overPar: c.n > CI_ASSUME.maxPar, alt: other ? out(other) : null,
  };
}
