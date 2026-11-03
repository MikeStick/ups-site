// 光伏系统选型引擎（家庭 / 小商业）：纯计算，网页和测试（scripts/test-solar-engine.mjs）共用。
// 用电器 → 每天用电量、峰值功率、启动冲击 → 逆变器功率、电池 kWh、光伏板数量。
// 都是选型参考值；没有规格书依据的数字放在 ASSUME 里，页面上原样列出。

export const ASSUME = {
  margin: 1.25,        // 逆变器额定功率 ≥ 同时运行负载 × 1.25
  surge: 2,            // 逆变器短时冲击能力（约 5 秒）按额定功率的 2 倍估算
  pr: 0.75,            // 光伏系统效率（温度、灰尘、线损、逆变效率）
  panelW: 550,         // 默认单块光伏板功率（W），页面上可以选 / 手动填
  dod: 0.9,            // 锂电（LiFePO4）可用深度
  invEff: 0.93,        // 电池放电经逆变器的效率
  nightShare: 0.6,     // 晚上和清晨（没有太阳时）的用电占全天的比例
  pvOversize: 1.3,     // 光伏组件功率最多为逆变器额定功率的 1.3 倍
  moduleKwh: 5.12,     // 一块 48 V 低压锂电（51.2 V 100 Ah）= 5.12 kWh
};

// 常见用电器：w = 运行功率（W），h = 默认每天使用小时，s = 启动冲击倍数，d = 占空比（压缩机类）
export const APPLIANCES = [
  { id: 'light', w: 10, h: 6, s: 1, n: 8 },
  { id: 'fan', w: 60, h: 8, s: 1.5, n: 2 },
  { id: 'tv', w: 100, h: 5, s: 1, n: 1 },
  { id: 'router', w: 15, h: 24, s: 1, n: 1 },
  { id: 'laptop', w: 60, h: 6, s: 1, n: 1 },
  { id: 'fridge', w: 150, h: 24, s: 3, d: 0.4, n: 1 },
  { id: 'freezer', w: 200, h: 24, s: 3, d: 0.5, n: 0 },
  { id: 'washer', w: 500, h: 1, s: 2, n: 0 },
  { id: 'micro', w: 1200, h: 0.3, s: 1, n: 0 },
  { id: 'ac', w: 1100, h: 6, s: 3, d: 0.7, n: 0 },
  { id: 'pump', w: 750, h: 1, s: 3.5, n: 0 },
  { id: 'heater', w: 2000, h: 1, s: 1, n: 0 },
];
// 日照（峰值日照小时 PSH）：按地区给一个常见值
export const REGIONS = { africa: 5.5, mideast: 6, latam: 5, asia: 4.5, europe: 3.5, cis: 3.5 };
// 逆变器功率档位（kW），没有对得上的已发布型号时按这些档位推荐
// 页面上可选的光伏板规格（W），也可以手动填
export const PANEL_W = [550, 585, 665, 700];
export const INV_KW = [3, 3.6, 4, 5, 6, 8, 10, 12, 15, 20, 25, 30, 40, 50];

const r1 = (x) => Math.round(x * 10) / 10;

// q = { items: { id: { n, h } }, goal: 'backup'|'self'|'off', outageH, autonomy (天，离网), region, phase: '1'|'3'|'split', panelW, models: [{ kw, kind, phase, ... }] }
export function sizeSolar(q) {
  let dailyWh = 0, peakW = 0, maxExtra = 0;
  const used = [];
  for (const a of APPLIANCES) {
    const it = (q.items && q.items[a.id]) || {};
    const n = Math.max(0, +it.n || 0), h = Math.min(24, Math.max(0, it.h === undefined ? a.h : +it.h));
    if (!n) continue;
    dailyWh += n * a.w * h * (a.d || 1);
    peakW += n * a.w;
    maxExtra = Math.max(maxExtra, a.w * (a.s - 1)); // 同一时间只算最大的那一台启动
    used.push(a.id);
  }
  if (!peakW) return null;
  const surgeW = peakW + maxExtra;
  const needKw = Math.max(peakW * ASSUME.margin, surgeW / ASSUME.surge) / 1000;
  const bySurge = surgeW / ASSUME.surge > peakW * ASSUME.margin;
  // 电池：要靠电池供电的能量
  const goal = q.goal || 'backup';
  let battUse;
  if (goal === 'backup') battUse = dailyWh * Math.min(24, Math.max(0, +q.outageH || 0)) / 24;
  else if (goal === 'self') battUse = dailyWh * ASSUME.nightShare;
  else battUse = dailyWh * ASSUME.nightShare + dailyWh * Math.max(0, +q.autonomy || 0);
  const battKwh = battUse / ASSUME.dod / ASSUME.invEff / 1000;
  const modules = battKwh > 0 ? Math.max(1, Math.ceil(battKwh / ASSUME.moduleKwh - 1e-9)) : 0;
  // 光伏：每天发电量覆盖全天用电（离网多留 20%）
  const psh = REGIONS[q.region] || 5;
  const kwp = dailyWh / 1000 / (psh * ASSUME.pr) * (goal === 'off' ? 1.2 : 1);
  const panelW = +q.panelW >= 50 && +q.panelW <= 1000 ? Math.round(+q.panelW) : ASSUME.panelW;
  const panels = Math.max(1, Math.ceil(kwp * 1000 / panelW - 1e-9));
  const kwpInst = panels * panelW / 1000;
  const monthKwh = Math.round(kwpInst * psh * ASSUME.pr * 30);
  // 逆变器：光伏太多时也要放大（组件功率 ≤ 逆变器 × 1.3）
  const needKw2 = Math.max(needKw, kwpInst / ASSUME.pvOversize);
  const byPv = needKw2 > needKw && needKw2 > INV_KW[0]; // 只有光伏让逆变器比最小档还大时才提示
  // 已发布型号：类型合适（离网 → 离网或混网；备电 / 自发自用 → 混网）、相数对得上的，按功率从小到大
  const kinds = goal === 'off' ? ['off', 'hybrid'] : ['hybrid'];
  const pool = (q.models || []).filter((m) => kinds.includes(m.kind) && (!q.phase || !m.phase || m.phase === q.phase) && m.kw > 0);
  const fit = pool.filter((m) => m.kw >= needKw2 - 1e-9).sort((a, b) => a.kw - b.kw || kinds.indexOf(a.kind) - kinds.indexOf(b.kind));
  // 单台放不下：并机（同型号最多 6 台）
  let units = 1, pick = fit[0] || null;
  if (!pick && pool.length) {
    const big = pool.slice().sort((a, b) => b.kw - a.kw)[0];
    units = Math.ceil(needKw2 / big.kw - 1e-9);
    if (units <= 6) pick = big; else units = 1;
  }
  let invKw = pick ? pick.kw : null;
  if (!pick) {
    invKw = INV_KW.find((k) => k >= needKw2 - 1e-9) || null;
    if (!invKw) { units = Math.ceil(needKw2 / 12 - 1e-9); invKw = 12; }
  }
  const checks = [];
  if (q.phase === '1' && invKw * units > 12) checks.push({ id: 'threePh', level: 'warn' });
  if (bySurge) checks.push({ id: 'surge', level: 'warn' });
  if (byPv) checks.push({ id: 'pvBig', level: 'warn' });
  if (goal === 'backup' && !(+q.outageH > 0)) checks.push({ id: 'noBatt', level: 'warn' });
  return {
    dailyKwh: r1(dailyWh / 1000), peakW: Math.round(peakW), surgeW: Math.round(surgeW), needKw: r1(needKw2), bySurge, byPv,
    invKw, units, model: pick, alts: fit.slice(1, 3),
    battKwh: r1(battKwh), modules, battInst: r1(modules * ASSUME.moduleKwh),
    psh, kwp: r1(kwp), panelW, panels, kwpInst: r1(kwpInst), monthKwh, checks, used,
  };
}
