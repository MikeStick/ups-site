// 精密空调（机房空调）：型号 → 参数、系列、选型。栏目页 /precision-ac/，产品页参数表。
// 系列：bts 基站（FAJ…F）· room1 房间级单系统 · room2 房间级双系统 · row 列间（LAJ）· rack 机架式（RMJ）
// 型号带 RH = 恒温恒湿（带 PTC 加热 + 加湿），不带 = 单冷。
import { PAC_SPECS } from './pac-specs.mjs';

export const PAC_SERIES = ['rack', 'bts', 'row', 'room1', 'room2'];

// 型号规范化：大写、去空格、全角括号转半角；CRM 里可能写成 SK-FAJ025U、SK-FAJ025UD、SK-FAJ025U(D) 都认
export const pacKey = (m) => String(m || '').toUpperCase().replace(/\s+/g, '').replace(/（/g, '(').replace(/）/g, ')');
const ALIASES = (() => {
  const a = {};
  for (const k of Object.keys(PAC_SPECS)) {
    a[k] = k;
    if (k.includes('U(D)')) { a[k.replace('U(D)', 'U')] = k; a[k.replace('U(D)', 'D')] = k; a[k.replace('U(D)', 'UD')] = k; a[k.replace('U(D)', 'U/D')] = k; }
  }
  for (const [x, k] of Object.entries({ ...a })) if (x.startsWith('SK-')) a[x.replace('SK-', 'SK')] = k;
  return a;
})();
export const pacSpec = (p) => {
  const k = pacKey(p && p.model);
  return PAC_SPECS[ALIASES[k]] || PAC_SPECS[ALIASES[k.replace(/-(DUAL|2S|双系统)$/, '-DS')]] || null;
};
export const isPacModel = (p) => !!pacSpec(p);

// 选型：热负荷 kW、场景（系列）、是否要恒温恒湿、冗余（N+1）→ 推荐型号 × 台数
// 冷量按"显冷量"算（机房负荷几乎全是显热）；台数 = ceil(负荷 / 单台显冷量)，再加冗余台数。返回最多 3 个方案（台数少的在前）
export function pacSize({ kw, series, rh, redundancy = 1, models }) {
  kw = +kw || 0;
  if (kw <= 0 || !models || !models.length) return [];
  const ss = [].concat(series); const pool = models.filter((m) => ss.includes(m.series) && !!m.rh === !!rh);
  const opts = pool.map((m) => {
    const n = Math.max(1, Math.ceil(kw / m.sens - 1e-9));
    return { m, n, total: n + (redundancy ? 1 : 0), cap: Math.round(n * m.sens * 10) / 10, spare: Math.round((n * m.sens - kw) / kw * 100) };
  }).filter((o) => o.n <= 12);
  opts.sort((a, b) => a.n - b.n || a.m.sens - b.m.sens);
  // 同台数只留最小的那个（够用就好）
  const seen = new Set(); const out = [];
  for (const o of opts) { if (seen.has(o.n)) continue; seen.add(o.n); out.push(o); if (out.length >= 3) break; }
  return out;
}
// 场景 → 系列：房间级把单系统和双系统一起比较（大负荷时双系统台数更少）
export const PAC_SCENE = { rack: ['rack'], bts: ['bts'], row: ['row'], room: ['room1', 'room2'] };
