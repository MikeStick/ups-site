// 微模块数据中心 IDM Ⅱ（IDM-S 单柜 / IDM-R 单排 / IDM2-D 双排）：型号识别 + 配置器。
// 配置器把已有的几个引擎串起来：精密空调（pac-engine.pacSize）→ UPS（机架式 / 模块化）→ 12V 电池（vrla-engine.upsBackup）→ 电池柜（cab-engine.cabFor）。
// 规则来自画册：单柜 ≤10 kW、UPS 3–10 kVA、机架式空调 3.5/7.5/12.5 kW；单排 2–10 柜、10–60 kW、UPS 5–20 kVA 机架式或 20–150 kVA 模块化；
// 双排 ≤48 个 IT 柜、模块化 UPS 20–600 kVA（模块 20–60 kVA）、列间空调、通道长度 L ≤ 15 m。单柜功率 3–15 kW。
// 测试：node scripts/test-idm-engine.mjs
import { PAC_SPECS } from './pac-specs.mjs';
import { pacSize } from './pac-engine.mjs';
import { upsBackup, VR_GENERIC } from './vrla-engine.mjs';
import { cabFor } from './cab-engine.mjs';

export const IDM_MODELS = ['IDM-S', 'IDM-R', 'IDM2-D'];
export const idmKey = (m) => {
  const x = String(m || '').normalize('NFKC').toUpperCase().replace(/\s+/g, '').match(/^IDM(2|Ⅱ|II)?-?([SRD])\b/);
  if (!x) return '';
  return { S: 'IDM-S', R: 'IDM-R', D: 'IDM2-D' }[x[2]];
};
export const IDM_FACTS = {
  'IDM-S': { racks: [1, 1], kw: [0, 10], ups: [3, 10], form: 'S' },
  'IDM-R': { racks: [2, 10], kw: [10, 60], ups: [5, 150], form: 'R' },
  'IDM2-D': { racks: [6, 48], kw: [20, 600], ups: [20, 600], form: 'D' },
};
export const IDM_ASSUME = { pf: 0.9, upsMargin: 1.2, rackW: 0.6, maxLen: 15, rackUps: [3, 6, 10, 15, 20], modules: [20, 30, 50, 60], maxModules: 10 };

const pacList = (series, rh) => Object.values(PAC_SPECS).filter((s) => s.series === series && !!s.rh === !!rh)
  .map((s) => ({ model: s.model, series: s.series, rh: s.rh, sens: s.sens, cool: s.cool, w: Number(String(s.dims).split('×')[0]) || 600 }));

// UPS 直流母线电压（画册没写，按常见配置估算，报价时确认）：≤3 kVA 72 V，机架式 ≤20 kVA 192 V，模块化 384 V
export const dcFor = (kva, modular) => (modular ? 384 : kva <= 3 ? 72 : 192);

function pickUps(kva, form, redundancy) {
  const A = IDM_ASSUME;
  if (form === 'S' || (form === 'R' && kva <= 20)) {
    const cap = form === 'S' ? 10 : 20; // 单柜只放得下 3–10 kVA 机架式；超过就不加余量，按额定选
    const size = A.rackUps.find((x) => x >= kva && x <= cap) || A.rackUps.find((x) => x >= Math.min(kva / A.upsMargin, cap)) || cap;
    return { type: 'rack', kva: size, modules: 0, module: 0, dc: dcFor(size, false) };
  }
  // 模块化：选模块容量，使模块数 ≤ 10 且装机容量最小；N+1 时多一个模块
  let best = null;
  for (const m of A.modules) {
    const n = Math.max(1, Math.ceil(kva / m - 1e-9)) + (redundancy ? 1 : 0);
    if (n > A.maxModules) continue;
    const inst = n * m;
    if (!best || inst < best.inst || (inst === best.inst && n < best.n)) best = { m, n, inst };
  }
  if (!best) { const m = 60, n = Math.ceil(kva / m) + (redundancy ? 1 : 0); best = { m, n, inst: n * m }; }
  return { type: 'modular', kva: best.inst, modules: best.n, module: best.m, dc: dcFor(best.inst, true) };
}

// racks: IT 柜数；kw: 单柜功率；minutes: 后备时间；redundancy: 空调和 UPS 模块 N+1；rh: 恒温恒湿空调；batts: 12V 电池型号（vrlaModule 列表，可空）
export function idmPlan({ racks, kw, minutes = 15, redundancy = true, rh = false, batts }) {
  racks = Math.max(1, Math.round(+racks || 0)); kw = Math.max(0.5, +kw || 0); minutes = Math.max(5, +minutes || 15);
  const total = Math.round(racks * kw * 10) / 10;
  const A = IDM_ASSUME;
  const form = racks === 1 && total <= 10 ? 'S' : racks <= 10 && total <= 60 ? 'R' : 'D';
  const model = { S: 'IDM-S', R: 'IDM-R', D: 'IDM2-D' }[form];
  const modulesCount = form === 'D' ? Math.ceil(racks / 48) : 1;
  const notes = [];
  if (kw > 15) notes.push('density');
  if (racks > 48) notes.push('multi');
  // ---- 制冷 ----
  let cooling;
  if (form === 'S') {
    const list = pacList('rack', rh).sort((a, b) => a.sens - b.sens);
    const m = list.find((x) => x.sens >= total) || list[list.length - 1];
    cooling = { model: m.model, n: 1, spare: 0, sens: m.sens, w: 0 };
  } else {
    const r = pacSize({ kw: total / modulesCount, series: 'row', rh, redundancy: redundancy ? 1 : 0, models: pacList('row', rh) });
    // 单排：模块 ≤ 60 kW，优先 300 mm 宽的 12.5 / 25 kW 机型（与画册场景一一致）；双排：台数最少
    const o = (form === 'R' ? r.find((x) => x.m.w <= 300) : null) || r[0];
    cooling = o ? { model: o.m.model, n: o.n, spare: redundancy ? 1 : 0, sens: o.m.sens, w: o.m.w } : null;
    if (!cooling) notes.push('cooling');
  }
  // ---- UPS ----
  const kva = (total / A.pf) * A.upsMargin / modulesCount;
  const ups = pickUps(kva, form, redundancy);
  // ---- 电池 + 电池柜 ----
  const pool = (batts && batts.length ? batts : VR_GENERIC).filter((m) => m.v === 12 && m.ah <= 200);
  let battery = null, cabinets = null;
  const internal = form === 'S' && minutes <= 10;
  if (internal) battery = { internal: true };
  else {
    const res = upsBackup({ loadW: (total * 1000) / modulesCount, minutes, dcV: ups.dc, models: pool });
    if (res && res.best) {
      const b = res.best;
      battery = { model: b.mod.model, slug: b.mod.slug || '', ah: b.mod.ah, n: b.n, strings: b.strings, total: b.total, runtime: b.runtime, est: b.est };
      const c = b.mod.ah <= 120 ? cabFor({ n: b.n, ah: b.mod.ah, strings: b.strings }) : null;
      if (c && c.best) cabinets = { model: c.best.cab.model, qty: c.best.qty, perString: c.best.perString };
      else notes.push('rack'); // >120 Ah：用电池架
    } else notes.push(total / modulesCount >= 60 ? 'cells' : 'battery'); // 大负载：用 2V 单体（栏目 /batteries/vrla-2v/）
  }
  // ---- 布局（每个模块） ----
  const itPer = Math.ceil(racks / modulesCount);
  const acN = form === 'S' ? 0 : cooling ? cooling.n + cooling.spare : 0;
  let layout;
  if (form === 'S') layout = { rows: [['S']] };
  else if (form === 'R') {
    const row = ups.type === 'modular' ? ['P', 'U'] : ['P'];
    spread(row, itPer, acN);
    layout = { rows: [row] };
  } else {
    const head = ['P', 'U'];
    const top = itPer - Math.floor(itPer / 2), bot = Math.floor(itPer / 2);
    const acTop = Math.ceil(acN / 2), acBot = acN - acTop;
    const r1 = [...head]; spread(r1, top - 0, acTop);
    const r2 = []; spread(r2, bot, acBot);
    layout = { rows: [r1, r2] };
  }
  // 通道长度（m）：IT 柜 / 配电 / UPS 600 mm，列间空调按机型宽度
  const acW = cooling && cooling.w ? cooling.w / 1000 : 0.3;
  const rowLen = (row) => row.reduce((s, c) => s + (c === 'A' ? acW : c === 'S' ? 0.6 : A.rackW), 0);
  const length = Math.round(Math.max(...layout.rows.map(rowLen)) * 10) / 10;
  if (form === 'D' && length > A.maxLen) notes.push('length');
  return { form, model, racks, kw, total, modules: modulesCount, cooling, ups, battery, cabinets, layout, length, minutes, notes };
}
// 把 n 个 IT 柜和 a 台列间空调交错放在一排里（空调尽量均匀分布，两端是 IT）
function spread(row, n, a) {
  if (!a) { for (let i = 0; i < n; i++) row.push('I'); return; }
  const gap = n / a;
  let next = gap / 2, placed = 0;
  for (let i = 0; i < n; i++) {
    row.push('I');
    if (placed < a && i + 1 >= next) { row.push('A'); placed++; next += gap; }
  }
  while (placed++ < a) row.push('A');
}
