// 锂电替换铅酸电池（LiFePO4 drop-in，12.8 / 25.6 / 51.2 V）：
// ① 换一块电池：输入铅酸电池的电压和 Ah → 同容量的锂电型号，以及"可用电量相同"时能选的更小型号；估算铅酸重量做对比。
// ② 组一个电池组：系统电压 12 / 24 / 48 V + 需要的能量（或负载 × 小时）→ 几串几并的组合，列出几种方案。
// 测试：node scripts/test-pbr-engine.mjs

export const PB_ASSUME = { liDod: 0.9, pbDod: 0.5, eff: 0.95, maxSeries: 4, maxPar: 8, pbKgPerAh12: 0.3 };
export const LEVELS = { 12: 12.8, 24: 25.6, 48: 51.2 };
export const AH_PRESETS = [7, 9, 12, 18, 24, 38, 50, 65, 100, 150, 200];
export const KWH_PRESETS = [1, 2.5, 5, 10, 15];

const row = (m, v, ah, a, d, kg) => ({ m, v, ah, wh: Math.round(v * ah * 10) / 10, maxA: a, dims: d, kg });
// 没有已发布型号时用的典型系列（来自 LiFePO4 Lead-Acid Replacement Batteries 规格书，型号加 LFP- 前缀）
export const PB_GENERIC = [
  row('LFP-12V6AH', 12.8, 6, 10, [90, 70, 101], 0.7), row('LFP-12V7AH', 12.8, 7, 10, [151, 65, 94], 1.0), row('LFP-12V8AH', 12.8, 8, 10, [151, 65, 94], 1.0),
  row('LFP-12V10AH', 12.8, 10, 10, [151, 65, 94], 1.2), row('LFP-12V12AH', 12.8, 12, 20, [151, 98, 95], 1.6), row('LFP-12V18AH', 12.8, 18, 20, [151, 98, 95], 2.2),
  row('LFP-12V20AH', 12.8, 20, 30, [181, 77, 167], 2.5), row('LFP-12V24AH', 12.8, 24, 30, [165, 126, 175], 3.0), row('LFP-12V30AH', 12.8, 30, 30, [165, 126, 175], 3.8),
  row('LFP-12V35AH', 12.8, 35, 40, [195, 130, 154], 4.2), row('LFP-12V36AH', 12.8, 36, 40, [198, 166, 170], 4.2), row('LFP-12V50AH', 12.8, 50, 50, [229, 138, 210], 6.0),
  row('LFP-12V60AH', 12.8, 60, 60, [229, 138, 210], 6.2), row('LFP-12V80AH', 12.8, 80, 80, [260, 168, 210], 9.5), row('LFP-12V100AH', 12.8, 100, 100, [328, 172, 215], 12),
  row('LFP-12V150AH', 12.8, 150, 150, [328, 172, 215], 16), row('LFP-12V200AH', 12.8, 200, 200, [522, 240, 218], 23),
  row('LFP-24V4AH', 25.6, 4, 10, [190, 74, 68], 1.0), row('LFP-24V50AH', 25.6, 50, 50, [328, 172, 215], 12), row('LFP-24V100AH', 25.6, 100, 100, [522, 240, 218], 23),
  row('LFP-24V150AH', 25.6, 150, 100, [522, 240, 218], 32), row('LFP-24V200AH', 25.6, 200, 100, [522, 240, 218], 42),
  row('LFP-48V50AH', 51.2, 50, 50, [522, 240, 218], 22), row('LFP-48V100AH', 51.2, 100, 100, [521, 268, 220], 40),
];

// 12.8 → 12、25.6 → 24、51.2 → 48（铅酸习惯叫法）
export const classOf = (v) => (v > 40 ? 48 : v > 18 ? 24 : v > 8 ? 12 : 0);
// 铅酸估重：12 V 每 Ah 约 0.3 kg（12V7Ah ≈ 2.1 kg，12V100Ah ≈ 30 kg）
export const pbKg = (cls, ah) => Math.round(PB_ASSUME.pbKgPerAh12 * ah * (cls / 12) * 10) / 10;

export function replaceOne({ cls, ah, models }) {
  cls = +cls; ah = +ah || 0;
  if (!cls || ah <= 0 || !models) return null;
  const ms = models.filter((m) => classOf(m.v) === cls).sort((a, b) => a.ah - b.ah);
  if (!ms.length) return { none: true, cls };
  const same = ms.find((m) => m.ah >= ah - 0.01) || null;
  const needAh = (ah * PB_ASSUME.pbDod) / PB_ASSUME.liDod; // 可用电量相同需要的锂电 Ah
  const usable = ms.find((m) => m.ah >= needAh - 0.01) || null;
  const pb = { ah, kg: pbKg(cls, ah), usableWh: Math.round(cls * ah * PB_ASSUME.pbDod) };
  const mk = (m) => m && { mod: m, usableWh: Math.round(m.wh * PB_ASSUME.liDod), kg: m.kg, save: m.kg ? Math.round((1 - m.kg / pb.kg) * 100) : 0 };
  return { cls, pb, same: mk(same), small: usable && same && usable.ah < same.ah ? mk(usable) : null, tooBig: !same, maxAh: ms[ms.length - 1].ah };
}

// 电池组：sysV = 12 / 24 / 48；needWh = 需要的可用能量 Wh（已按负载 × 时间算好），loadW 用来核对电流
export function buildBank({ sysV, needWh, loadW = 0, models }) {
  sysV = +sysV; needWh = +needWh || 0;
  if (!sysV || needWh <= 0 || !models) return null;
  const nominal = needWh / PB_ASSUME.liDod;
  const opts = [];
  for (const m of models) {
    const c = classOf(m.v);
    if (!c || sysV % c || sysV / c > PB_ASSUME.maxSeries) continue;
    const s = sysV / c;
    const strWh = s * m.wh;
    let p = Math.max(1, Math.ceil(nominal / strWh - 1e-9));
    const amps = loadW ? loadW / (PB_ASSUME.eff * LEVELS[sysV] * 0.9) : 0;
    if (amps && m.maxA) p = Math.max(p, Math.ceil(amps / m.maxA - 1e-9));
    if (p > PB_ASSUME.maxPar) continue;
    const total = s * p * m.wh;
    opts.push({ mod: m, s, p, n: s * p, totalWh: Math.round(total), usableWh: Math.round(total * PB_ASSUME.liDod), kg: m.kg ? Math.round(s * p * m.kg * 10) / 10 : 0, amps: Math.round(amps), byCurrent: amps && m.maxA ? Math.ceil(amps / m.maxA - 1e-9) > Math.ceil(nominal / strWh - 1e-9) : false });
  }
  if (!opts.length) return { none: true };
  // 排序：块数少优先，其次电量超出少；先每种"串数"各取最好的一个，再按顺序补满 3 个方案
  opts.sort((a, b) => a.n - b.n || a.totalWh - b.totalWh);
  const best = [], seen = new Set();
  for (const o of opts) if (!seen.has(o.s)) { seen.add(o.s); best.push(o); }
  for (const o of opts) { if (best.length >= 3) break; if (!best.includes(o)) best.push(o); }
  best.splice(3);
  best.sort((a, b) => a.n - b.n || a.totalWh - b.totalWh);
  return { sysV, needWh: Math.round(needWh), opts: best };
}
export const loadToWh = (loadW, hours) => (loadW * hours) / PB_ASSUME.eff;
