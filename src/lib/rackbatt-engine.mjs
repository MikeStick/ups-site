// 机架式磷酸铁锂电池组选型：纯计算，网页和测试（scripts/test-rackbatt-engine.mjs）共用。
// 按"需要多少能量"或"负载 × 备电时间"算模块数，同时满足负载电流；再算机柜数、可用能量、备电时间、重量。
// 没有规格书依据的数字放在 ASSUME 里，页面上原样列出。

export const ASSUME = {
  dod: 0.9,          // 可用深度（LiFePO4 常用 90%）
  invEff: 0.95,      // 电池 → 逆变器的效率（估算备电时间）
  margin: 1.2,       // 放电电流留 20% 余量
  cabinetU: 42,      // 标准 42U 机柜
  reserveU: 6,       // 机柜里留给配电 / 汇流 / 走线的空间
  maxParallel: 16,   // 规格书没写时按最多 16 个并联估算
  // 没有已发布型号时用的通用模块（典型 48 V 机架式）
  generic: { m: '51.2 V 100 Ah', v: 51.2, ah: 100, kwh: 5.12, maxA: 100, u: 3, kg: 45 },
};
// 壁挂式（家用）没有已发布型号时用的通用模块：常见 51.2 V 200 Ah 10 kWh
export const WALL_GENERIC = { m: '51.2 V 200 Ah', v: 51.2, ah: 200, kwh: 10.24, maxA: 100, u: 0, kg: 90 };
export const KWH_PRESETS = [5, 10, 15, 20, 30, 40, 60];
const r1 = (x) => Math.round(x * 10) / 10;

// q = { mode: 'kwh'|'load', kwh, loadKw, hours, mod: { v, ah, kwh, maxA, u, kg, par }, generic（可选，默认机架式通用模块） }
export function sizeRack(q) {
  const mod = { ...(q.generic || ASSUME.generic), ...Object.fromEntries(Object.entries(q.mod || {}).filter(([, v]) => v)) };
  if (!mod.kwh && mod.v && mod.ah) mod.kwh = r1(mod.v * mod.ah / 1000);
  const loadKw = Math.max(0, +q.loadKw || 0);
  let needKwh;
  if (q.mode === 'load') needKwh = loadKw * Math.max(0, +q.hours || 0) / ASSUME.invEff / ASSUME.dod;
  else needKwh = Math.max(0, +q.kwh || 0) / ASSUME.dod; // 填的是"想用到的能量"
  if (!(needKwh > 0)) return null;
  const nE = Math.ceil(needKwh / mod.kwh - 1e-9);
  // 负载电流：负载 kW ÷ 电池电压（放电末期按 0.9 × 标称），每个模块分担，留 20% 余量
  const iLoad = loadKw > 0 ? loadKw * 1000 / ASSUME.invEff / (mod.v * 0.9) : 0;
  const nI = iLoad && mod.maxA ? Math.ceil(iLoad * ASSUME.margin / mod.maxA - 1e-9) : 0;
  const n = Math.max(1, nE, nI);
  const byCurrent = nI > nE;
  const maxPar = mod.par || ASSUME.maxParallel;
  const groups = Math.ceil(n / maxPar);     // 超过并联上限：分成几组（各接一台逆变器，或用高压方案）
  const perCab = mod.u ? Math.floor((ASSUME.cabinetU - ASSUME.reserveU) / mod.u) : 0;
  const cabinets = perCab ? Math.ceil(n / perCab) : 0;
  const totalKwh = r1(n * mod.kwh);
  const usableKwh = r1(totalKwh * ASSUME.dod);
  const maxKw = mod.maxA ? r1(n * mod.maxA * mod.v / 1000) : 0;   // 电池组最大持续放电功率
  const hours = loadKw > 0 ? r1(usableKwh * ASSUME.invEff / loadKw) : 0;
  const ahTotal = n * mod.ah;
  const checks = [];
  if (groups > 1) checks.push({ id: 'groups', level: 'warn', g: groups, p: maxPar });
  if (byCurrent) checks.push({ id: 'current', level: 'warn' });
  if (!mod.maxA && loadKw) checks.push({ id: 'noCurrent', level: 'warn' });
  return { mod, n, nE, nI, byCurrent, groups, maxPar, perCab, cabinets, totalKwh, usableKwh, maxKw, hours, ahTotal, kg: mod.kg ? Math.round(n * mod.kg) : 0, iLoad: Math.round(iLoad), checks };
}
