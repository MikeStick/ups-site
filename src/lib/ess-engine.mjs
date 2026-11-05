// 家庭储能一体机（电池 + 逆变器一体，壁挂式 / 落地式 / 堆叠式高压 / 堆叠式低压）规划：
// 用电器（数量、每天小时）→ 同时运行功率、启动冲击、每天用电量 → 逆变器功率够不够、停电时电池能撑几小时 → 推荐型号。
// 用电器清单、冲击倍数和光伏选型器共用（solar-engine.mjs 的 APPLIANCES）。测试：node scripts/test-ess-engine.mjs
import { APPLIANCES } from './solar-engine.mjs';

export const ESS_ASSUME = { margin: 1.25, surge: 2, dod: 0.9, eff: 0.93 };
export const OUTAGE_H = [2, 4, 8, 12];
// 没有已发布型号时用的典型系列（来自规格书：2.5 kWh + 3 kW / 5 kWh + 5 kW，壁挂式和落地式各两款）
export const ESS_GENERIC = [
  { m: '2.5kWh + 3kW', mount: 'wall', kwh: 2.5, kw: 3, v: 25.6, ah: 100, dims: [500, 145, 550], kg: 29 },
  { m: '5kWh + 5kW', mount: 'wall', kwh: 5, kw: 5, v: 51.2, ah: 100, dims: [500, 140, 700], kg: 56 },
  { m: '2.5kWh + 3kW', mount: 'floor', kwh: 2.5, kw: 3, v: 25.6, ah: 100, dims: [370, 240, 450], kg: 30 },
  { m: '5kWh + 5kW', mount: 'floor', kwh: 5, kw: 5, v: 51.2, ah: 100, dims: [370, 285, 475], kg: 55 },
  // 堆叠式（规格书：高压 10 kW 逆变器 + 2–4 层 102 V 模块；低压 5 kW 逆变器 + 3–5 层 51.2 V 模块）
  { m: '10kWh', mount: 'stack', volt: 'hv', layers: 2, kwh: 10, kw: 10, v: 204, ah: 50, dims: [460, 450, 670], kg: 112.5 },
  { m: '15kWh', mount: 'stack', volt: 'hv', layers: 3, kwh: 15, kw: 10, v: 307, ah: 50, dims: [460, 450, 820], kg: 155 },
  { m: '20kWh', mount: 'stack', volt: 'hv', layers: 4, kwh: 20, kw: 10, v: 409, ah: 50, dims: [460, 450, 970], kg: 197.5 },
  { m: '15kWh', mount: 'stack', volt: 'lv', layers: 3, kwh: 15, kw: 5, v: 51.2, ah: 300, dims: [460, 450, 710], kg: 144 },
  { m: '20kWh', mount: 'stack', volt: 'lv', layers: 4, kwh: 20, kw: 5, v: 51.2, ah: 400, dims: [460, 450, 860], kg: 168 },
  { m: '25kWh', mount: 'stack', volt: 'lv', layers: 5, kwh: 25, kw: 5, v: 51.2, ah: 500, dims: [460, 450, 1010], kg: 228 },
];

export function loadOf(items) {
  let dailyWh = 0, peakW = 0, maxExtra = 0;
  const used = [];
  for (const a of APPLIANCES) {
    const it = (items && items[a.id]) || {};
    const n = Math.max(0, +it.n || 0), h = Math.min(24, Math.max(0, it.h === undefined ? a.h : +it.h));
    if (!n) continue;
    dailyWh += n * a.w * h * (a.d || 1); peakW += n * a.w; maxExtra = Math.max(maxExtra, a.w * (a.s - 1)); used.push(a.id);
  }
  return { dailyWh: Math.round(dailyWh), peakW, surgeW: peakW + maxExtra, used };
}

// q = { items, outageH, mount: 'wall'|'floor'|'any', models }
export function sizeEss(q) {
  const L = loadOf(q.items);
  if (!L.peakW) return null;
  const needKw = Math.max(L.peakW * ESS_ASSUME.margin, L.surgeW / ESS_ASSUME.surge) / 1000;
  const bySurge = L.surgeW / ESS_ASSUME.surge > L.peakW * ESS_ASSUME.margin;
  const avgW = L.dailyWh / 24;
  const outageH = Math.max(0, +q.outageH || 0);
  const needWh = avgW * outageH;
  const pool = (q.models || []).filter((m) => m.kw > 0 && m.kwh > 0 && (!q.mount || q.mount === 'any' || m.mount === q.mount)).sort((a, b) => a.kw - b.kw || a.kwh - b.kwh);
  const usable = (m) => m.kwh * 1000 * ESS_ASSUME.dod * ESS_ASSUME.eff;
  const powerOk = pool.filter((m) => m.kw >= needKw - 1e-9);
  const base = { ...L, needKw: r1(needKw), bySurge, avgW: Math.round(avgW), outageH, needWh: Math.round(needWh) };
  if (!powerOk.length) return { ...base, over: true, maxKw: pool.length ? pool[pool.length - 1].kw : 0 };
  // 功率够的里面：按功率从小到大、电池从小到大，取第一个电池也够的；都不够时取电池最大的（一样大取功率小的）
  const both = powerOk.find((m) => usable(m) >= needWh - 1e-9);
  const pick = both || [...powerOk].sort((a, b) => b.kwh - a.kwh || a.kw - b.kw)[0];
  const rt = avgW > 0 ? usable(pick) / avgW : 0;
  return { ...base, model: pick, short: !both, runtime: r1(Math.min(rt, 99)), loadPct: Math.round((L.peakW / (pick.kw * 1000)) * 100), usableWh: Math.round(usable(pick)) };
}
const r1 = (x) => Math.round(x * 10) / 10;
