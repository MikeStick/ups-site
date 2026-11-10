// 12V 铅酸（VRLA）电池：参数读取 + 三个选型计算
// ① UPS 后备时间：负载 W + UPS 直流电压 → 每节电池要放多少瓦 → 按恒功率放电表算能撑多久；不够就几组并联
// ② 光伏电池组：每天用电 × 自主天数 ÷ 放电深度 → 需要多少 Ah；按系统电压串联，再并联
// ③ 按 Ah 找：同容量（或稍大）的型号 + 外形尺寸
// 放电表来自 CRM 的 extraSpecs：label "恒功率放电(W) 终止电压10.50V" 或 "…终止电压1.75V/Cell"，value "10min=4087; 15min=3740; 1h=1459 …"
// 表头是每单格（1.60–1.80 V/Cell）的，数值 × 单格数（12 V = 6 格）换算成每节电池。
// 测试：node scripts/test-vrla-engine.mjs

export const VR_ASSUME = { invEff: 0.92, endVCell: 1.75, solarDod: 0.5, solarEff: 0.85, maxStrings: 4, maxPar: 8 };
export const UPS_DC = [12, 24, 36, 48, 72, 96, 120, 192, 240, 384];

const num = (x) => { const m = String(x ?? '').replace(',', '.').match(/\d+(?:\.\d+)?/); return m ? +m[0] : 0; };
// "10min" "1h" "5Min" "20Hr" → 分钟
export function toMin(t) {
  const m = String(t).trim().match(/^(\d+(?:\.\d+)?)\s*(min|m|分钟|分|h|hr|hrs|小时|时)?$/i);
  if (!m) return 0;
  const v = +m[1], u = (m[2] || 'min').toLowerCase();
  return /^(h|hr|hrs|小时|时)$/.test(u) ? v * 60 : v;
}
// value "10min=4087; 15min=3740; …" → [[分钟, 数值], …]（按时间排序）
export function parseRow(value) {
  return String(value || '').split(/[;；,，\n]+/).map((x) => x.split(/[=:：]/)).filter((x) => x.length >= 2)
    .map(([t, v]) => [toMin(t), num(v)]).filter(([t, v]) => t > 0 && v > 0).sort((a, b) => a[0] - b[0]);
}
// 从 extraSpecs 里取恒功率 / 恒流表：{ cp: { '1.75': [[min, W每节], …] }, cc: {…} }，终止电压统一成每单格
export function dischargeTables(p, cells = 6) {
  const out = { cp: {}, cc: {} };
  for (const x of Array.isArray(p.extraSpecs) ? p.extraSpecs : []) {
    const label = String(x.label || '');
    const kind = /恒功率|constant\s*power|\bCP\b/i.test(label) ? 'cp' : /恒流|constant\s*current|\bCC\b/i.test(label) ? 'cc' : '';
    if (!kind) continue;
    const vm = label.match(/(\d+(?:\.\d+)?)\s*V/i);
    if (!vm) continue;
    let ev = +vm[1];
    const perCell = ev < 3;
    const rows = parseRow(x.value);
    if (rows.length < 2) continue;
    if (!perCell) ev = ev / cells;
    const key = (Math.round(ev * 100) / 100).toFixed(2);
    out[kind][key] = perCell && kind === 'cp' ? rows.map(([t, w]) => [t, Math.round(w * cells * 10) / 10]) : rows;
  }
  return out;
}

const spec = (p, re) => { const x = (Array.isArray(p.extraSpecs) ? p.extraSpecs : []).find((e) => re.test(String(e.label || ''))); return x ? String(x.value || '').trim() : ''; };
const SERIES = [['hr', /高倍率|high\s*rate|\bHR\b/i], ['gel', /胶体|gel/i], ['deep', /深循环|deep/i], ['front', /前置|front/i], ['agm', /AGM|备用|standby|固定/i]];
export function seriesOf(p) {
  const s = spec(p, /电池系列|series/i) + ' ' + (p.type || '');
  for (const [k, re] of SERIES) if (re.test(s)) return k;
  return 'agm';
}


// SK 系列规格书上的尺寸 / 重量 / 端子 / 设计寿命（逐个型号从规格书抄录）。
// AI 导入这些规格书时尺寸、重量常常没填或填错，网站以这张表为准；表里没有的型号仍然用 CRM 里的数据。
const SK_SPECS = {
  // 10HR（型号不带 v）
  'SK17-12': { dims: [181, 77, 167, 167], kg: 4.7, terminal: 'B1 (M5)', life: 3 },
  'SK24-12': { dims: [165, 126, 174, 174], kg: 7.6, terminal: 'B2', life: 5 },
  'SK38-12': { dims: [196, 165, 170, 170], kg: 11.8, terminal: 'B4', life: 10 },
  'SK65-12': { dims: [350, 167, 174, 174], kg: 20, terminal: 'B5 (M8)', life: 10 },
  'SK100-12': { dims: [332, 173, 218, 223], kg: 28, terminal: 'B5 (M8)', life: 10 },
  'SK120-12': { dims: [406, 173, 236, 236], kg: 34.5, terminal: 'B5 (M8)', life: 10 },
  'SK150-12': { dims: [486, 171, 240, 240], kg: 43, terminal: 'B5 (M8)', life: 10 },
  'SK200-12': { dims: [523, 240, 219, 223], kg: 58, terminal: 'B5 (M8)', life: 10 },
  'SK250-12': { dims: [520, 269, 220, 224], kg: 69, terminal: 'T16 (M8)', life: 8 },
  // 20HR（型号带 v）
  'SK24-12V': { dims: [165, 127, 173.5, 173.5], kg: 7.3, terminal: 'Φ14×M6', life: 8 },
  'SK38-12V': { dims: [197, 166, 170, 170], kg: 10.2, terminal: 'Φ14×M6', life: 8 },
  'SK65-12V': { dims: [330, 172, 180, 185], kg: 18.1, terminal: 'Φ16×M6', life: 8 },
  'SK100-12V': { dims: [329, 172, 216, 221], kg: 27.2, terminal: 'Φ18×M8', life: 8 },
  'SK120-12V': { dims: [404, 174.5, 210, 235], kg: 30.8, terminal: 'Φ18×M8', life: 8 },
  'SK150-12V': { dims: [483, 171, 240, 245], kg: 39.6, terminal: 'Φ18×M8', life: 8 },
  'SK200-12V': { dims: [522, 239, 216, 221], kg: 54.3, terminal: 'Φ20×M8', life: 8 },
  'SK250-12V': { dims: [520, 267.5, 220, 225], kg: 68.5, terminal: 'Φ20×M8', life: 8 },
  // 胶体 20HR（型号 SK…-12vJ；规格书没写设计寿命，不显示）
  'SK24-12VJ': { dims: [165, 127, 173.5, 173.5], kg: 7.3, terminal: 'Φ14×M6', res: 13, imax: 7.2 },
  'SK38-12VJ': { dims: [197, 166, 170, 170], kg: 10.2, terminal: 'Φ14×M6', res: 10.5, imax: 11.4 },
  'SK65-12VJ': { dims: [330, 172, 180, 185], kg: 18.1, terminal: 'Φ16×M6', res: 7.0, imax: 19.5 },
  'SK100-12VJ': { dims: [329, 172, 216, 221], kg: 27.2, terminal: 'Φ18×M8', res: 6.0, imax: 30 },
  'SK120-12VJ': { dims: [404, 174.5, 210, 235], kg: 30.8, terminal: 'Φ18×M8', res: 5.6, imax: 36 },
  'SK150-12VJ': { dims: [483, 171, 240, 245], kg: 39.6, terminal: 'Φ18×M8', res: 5.2, imax: 45 },
  'SK200-12VJ': { dims: [522, 239, 216, 221], kg: 54.3, terminal: 'Φ20×M8', res: 4.3, imax: 60 },
  'SK250-12VJ': { dims: [520, 267.5, 220, 225], kg: 68.5, terminal: 'Φ20×M8', res: 4.0, imax: 75 },
  // 2V 单体（型号 SK100-2v … SK3000-2v，都是 10HR；这里的 v 是"伏"，不表示 20HR）
  'SK100-2V': { dims: [170, 72, 210, 223], kg: 5.7, terminal: 'B5 (M8)', life: 15, res: 2.0, imax: 25 },
  'SK200-2V': { dims: [171, 111, 335, 365], kg: 12.5, terminal: 'B6 (M10)', life: 15, res: 0.7, imax: 50 },
  'SK300-2V': { dims: [170, 150, 336, 365], kg: 17.5, terminal: 'B6 (M10)', life: 15, res: 0.47, imax: 75 },
  'SK400-2V': { dims: [211, 172, 338, 367], kg: 22.5, terminal: 'B6 (M10)', life: 15, res: 0.45, imax: 100 },
  'SK500-2V': { dims: [240, 172, 338, 367], kg: 28, terminal: 'B6 (M10)', life: 15, res: 0.42, imax: 125 },
  'SK600-2V': { dims: [301, 172, 338, 367], kg: 32.5, terminal: 'B6 (M10)', life: 15, res: 0.4, imax: 150 },
  'SK800-2V': { dims: [410, 172, 339, 368], kg: 46, terminal: 'B6 (M10)', life: 15, res: 0.35, imax: 200 },
  'SK1000-2V': { dims: [473, 172, 338, 367], kg: 55, terminal: 'B6 (M10)', life: 15, res: 0.32, imax: 250 },
  'SK1200-2V': { dims: [473, 172, 338, 367], kg: 62.5, terminal: 'B6 (M10)', life: 15, res: 0.32, imax: 300 },
  'SK1500-2V': { dims: [400, 350, 351, 380], kg: 85.5, terminal: 'B6 (M10)', life: 15, res: 0.26, imax: 375 },
  'SK2000-2V': { dims: [490, 350, 342, 381], kg: 123, terminal: 'B6 (M10)', life: 15, res: 0.22, imax: 500 },
  'SK2500-2V': { dims: [490, 350, 342, 381], kg: 135, terminal: 'B6 (M10)', life: 15, res: 0.2, imax: 625 },
  'SK3000-2V': { dims: [712, 353, 341, 382], kg: 180, terminal: 'B6 (M10)', life: 15, res: 0.15, imax: 750 },
};
// 2V 单体电池（型号 SK…-2 / SK…-2v，或额定电压 2 V）
const skModel = (m) => String(m || '').replace(/[（(].*$/, '').trim().split(/\s+/)[0];
export const is2vModel = (p) => /^SK\d{2,4}-2v?$/i.test(skModel(p.model)) || num(p.moduleVoltage || p.batteryVoltage) === 2;
// 一节电池的参数
export function vrlaModule(p) {
  const mm = String(p.model || '').match(/(\d{2,4})\s*-\s*(\d{1,2})(?:v\b|\b)/i); // SK250-12 → 250 Ah, 12 V；SK1000-2v → 1000 Ah, 2 V
  // SK 系列命名：SK100-12 = 10HR、SK100-12v = 20HR，型号里的数字就是该容量率下的额定 Ah（规格书同时列了 20HR / 10HR 等多个容量，导入时容易填错）
  // 2V 单体 SK100-2v … SK3000-2v 全是 10HR
  const sk = skModel(p.model).match(/^SK(\d{2,4})-(12|2)(v?)(j?)$/i); // 末尾 J = 胶体（SK100-12vJ）
  const v = sk ? +sk[2] : num(p.moduleVoltage || p.batteryVoltage || spec(p, /额定电压|nominal\s*voltage/i)) || (mm ? +mm[2] : 12);
  const ah = sk ? +sk[1] : num(p.moduleCapacity || spec(p, /额定容量|rated\s*capacity/i)) || (mm ? +mm[1] : 0);
  const rateTxt = spec(p, /容量率|小时率|rate/i) + ' ' + p.model;
  const rate = sk ? (sk[2] === '12' && sk[3] ? 20 : 10) : /20\s*h/i.test(rateTxt) ? 20 : /10\s*h/i.test(rateTxt) ? 10 : /\d{2}v$/i.test(String(p.model || '').trim()) && v === 12 ? 20 : 10;
  // 尺寸 / 重量一般在模块字段里；没有的话从 extraSpecs 的"尺寸(长*宽*高*总高)""参考重量"取
  const dims = (String(p.moduleDimensions || p.dimensions || spec(p, /尺寸|dimension/i)).match(/\d+(?:\.\d+)?/g) || []).map(Number).slice(0, 4);
  const kg = num(p.moduleWeight || p.netWeight || spec(p, /重量|weight/i));
  const cells = Math.max(1, Math.round(v / 2));
  const fix = SK_SPECS[skModel(p.model).toUpperCase()];
  const raw = vrlaModuleRaw(p, { v, ah, rate, dims, kg, cells });
  if (sk && sk[4]) raw.series = 'gel';
  if (fix) return { ...raw, dims: fix.dims, kg: fix.kg, terminal: fix.terminal, life: fix.life ? `${fix.life}年以上` : raw.life, ...(fix.res ? { res: fix.res, imax: fix.imax } : {}) };
  return raw;
}
function vrlaModuleRaw(p, { v, ah, rate, dims, kg, cells }) {
  return { model: p.model, slug: p.slug, v, ah, rate, dims, kg, cells, series: seriesOf(p),
    life: spec(p, /设计寿命|design\s*life|寿命/i), terminal: spec(p, /端子|terminal/i), tables: dischargeTables(p, cells) };
}

// 典型恒功率曲线（每 Ah、每节 12 V、终止 1.75 V/单格），没有放电表的型号用它估算（来自 SK250-12 10HR 规格书）
const REF = [[5, 36.5], [10, 24.9], [15, 17.0], [30, 10.35], [60, 6.34], [120, 3.96], [180, 3.08], [240, 2.42], [300, 2.05], [360, 1.37], [600, 1.19], [1200, 0.62]];
function curveFor(m, endV) {
  const cp = m.tables.cp;
  const keys = Object.keys(cp);
  if (keys.length) {
    // 取最接近的终止电压（UPS 常用 1.67–1.75 V/单格）
    const k = keys.sort((a, b) => Math.abs(+a - endV) - Math.abs(+b - endV))[0];
    return { pts: cp[k], est: false, endV: +k };
  }
  // 20HR 标称的电池在短时放电时按 10HR 同 Ah 的约 92% 算（两份规格书 1h 恒功率对比得出）
  const f = m.ah * (m.v / 12) * (m.rate === 20 ? 0.92 : 1);
  return { pts: REF.map(([t, w]) => [t, w * f]), est: true, endV: VR_ASSUME.endVCell };
}
// 每节电池放 w 瓦能撑几分钟（对数插值；超出表格范围返回 0 或最大值外推一点）
export function runtimeAt(pts, w) {
  if (!pts.length || w <= 0) return 0;
  if (w > pts[0][1]) {
    // 比表里最大功率（最短时间）还大：在前两点的对数直线上外推，最多外推到 1.3 倍，再大就算撑不住
    if (w > pts[0][1] * 1.3 || pts.length < 2) return 0;
    const [t1, w1] = pts[0], [t2, w2] = pts[1];
    const k = Math.log(t2 / t1) / Math.log(w2 / w1);
    return t1 * Math.pow(w / w1, k);
  }
  for (let i = 0; i < pts.length - 1; i++) {
    const [t1, w1] = pts[i], [t2, w2] = pts[i + 1];
    if (w <= w1 && w >= w2) {
      const r = Math.log(w1 / w) / Math.log(w1 / w2);
      return Math.exp(Math.log(t1) + r * (Math.log(t2) - Math.log(t1)));
    }
  }
  const [tl, wl] = pts[pts.length - 1];
  return tl * (wl / w); // 比表里最小功率还小：按反比外推
}

// ① UPS：loadW 负载（W），minutes 要求后备时间，dcV UPS 电池电压，models = vrlaModule 列表
export function upsBackup({ loadW, minutes, dcV, models, endV = VR_ASSUME.endVCell, eff = VR_ASSUME.invEff }) {
  loadW = +loadW || 0; minutes = +minutes || 0; dcV = +dcV || 0;
  if (loadW <= 0 || minutes <= 0 || dcV <= 0 || !models || !models.length) return null;
  const opts = [];
  for (const m of models) {
    if (!m.ah || dcV % m.v) continue;
    const n = dcV / m.v; // 一组几节
    const c = curveFor(m, endV);
    for (let s = 1; s <= VR_ASSUME.maxStrings; s++) {
      const perBatt = loadW / eff / n / s;
      const t = runtimeAt(c.pts, perBatt);
      if (t >= minutes) { opts.push({ mod: m, n, strings: s, total: n * s, perBatt: Math.round(perBatt), runtime: Math.round(t), est: c.est, endV: c.endV, ah: m.ah * s }); break; }
    }
  }
  // 节数少的优先，其次总 Ah 小（便宜），再其次时间余量
  opts.sort((a, b) => a.total - b.total || a.ah - b.ah || a.runtime - b.runtime);
  const best = opts[0] || null;
  // 同 Ah 同并联数只留一个（10HR / 20HR 同容量的两个型号算一个方案）
  const uniq = opts.filter((o, i, arr) => arr.findIndex((x) => x.mod.ah === o.mod.ah && x.strings === o.strings) === i);
  const alts = uniq.filter((o) => o !== best).slice(0, 3);
  return { best, alts, n: dcV / 12, none: !best };
}
// 选定一个型号后，每个后备时间档能撑多久（给"不同负载下的后备时间"小表用）
export function runtimeTable({ mod, n, strings = 1, loads, endV = VR_ASSUME.endVCell, eff = VR_ASSUME.invEff }) {
  const c = curveFor(mod, endV);
  return loads.map((w) => ({ w, min: Math.round(runtimeAt(c.pts, w / eff / n / strings)) }));
}

// ② 光伏：dailyWh 每天用电，days 自主天数，sysV 12/24/48
export function solarBank({ dailyWh, days = 1, sysV, models, dod = VR_ASSUME.solarDod, eff = VR_ASSUME.solarEff }) {
  dailyWh = +dailyWh || 0; days = +days || 1; sysV = +sysV || 0;
  if (dailyWh <= 0 || !sysV || !models || !models.length) return null;
  const needAh = (dailyWh * days) / (sysV * dod * eff);
  const opts = [];
  for (const m of models) {
    if (!m.ah || sysV % m.v) continue;
    const s = sysV / m.v;
    const p = Math.max(1, Math.ceil(needAh / m.ah - 1e-9));
    if (p > VR_ASSUME.maxPar) continue;
    opts.push({ mod: m, s, p, total: s * p, ah: m.ah * p, kwh: Math.round((sysV * m.ah * p) / 100) / 10, usableKwh: Math.round((sysV * m.ah * p * dod) / 100) / 10, kg: m.kg ? Math.round(m.kg * s * p) : 0 });
  }
  opts.sort((a, b) => a.p - b.p || a.ah - b.ah);
  // 去掉同一并联数里更大的型号，只留最小够用的；最多 3 个方案
  const seen = new Set(), list = [];
  for (const o of opts) { if (seen.has(o.p)) continue; seen.add(o.p); list.push(o); if (list.length >= 3) break; }
  return { needAh: Math.round(needAh), opts: list, none: !list.length };
}

// ③ 按 Ah 找：same = 容量 ≥ 要求的最小型号（sameAll = 同 Ah 的 10HR / 20HR 型号）；prev / next = 前后各一个不同 Ah 的型号
export function findAh({ ah, rate, models }) {
  ah = +ah || 0;
  if (ah <= 0 || !models || !models.length) return null;
  const ms = models.filter((m) => m.ah && (!rate || m.rate === +rate)).sort((a, b) => a.ah - b.ah || a.rate - b.rate);
  if (!ms.length) return { none: true };
  const ahs = [...new Set(ms.map((m) => m.ah))];
  const i = ahs.findIndex((a) => a >= ah - 0.01);
  if (i < 0) return { tooBig: true, maxAh: ahs[ahs.length - 1], prev: ms[ms.length - 1], same: null, next: null };
  const sameAll = ms.filter((m) => m.ah === ahs[i]);
  const same = sameAll[0];
  const pick = (a) => { const l = ms.filter((m) => m.ah === a); return l.find((m) => m.rate === same.rate) || l[0]; };
  return { same, sameAll, prev: i > 0 ? pick(ahs[i - 1]) : null, next: i < ahs.length - 1 ? pick(ahs[i + 1]) : null, tooBig: false, maxAh: ahs[ahs.length - 1] };
}

// 还没有发布产品时，工具用这组常见 12V 规格（10HR，按典型曲线估算，不带链接）
export const VR_GENERIC = [17, 24, 38, 40, 55, 65, 75, 80, 100, 120, 150, 200, 250].map((ah) => ({
  model: `12V ${ah}Ah`, slug: '', v: 12, ah, rate: 10, dims: [], kg: 0, cells: 6, series: 'agm', life: '', terminal: '', tables: { cp: {}, cc: {} },
}));
// 估算一节电池重量（规格书 250Ah ≈ 69 kg，小电池单位重量略高）——只在没有重量时用于电池组总重
export const estKg = (ah) => Math.round(ah * 0.29 + 1);

// ④ 2V 单体电池组：直流系统（通信 48 V、电力 110 / 220 V）或 UPS 母线，每串节数 cells 由系统定（如 220 V 直流屏 = 104 节）
// loadW 负载（W，直流侧），minutes 后备时间，eff 逆变效率（直流负载 = 1）。返回最少并联串数的方案，节数相同时取 Ah 最小的；最多 3 个备选
export const CELL_SYS = [
  { k: '48', v: 48, cells: 24, eff: 1 },
  { k: '110', v: 110, cells: 52, eff: 1 },
  { k: '220', v: 220, cells: 104, eff: 1 },
  { k: '240', v: 240, cells: 120, eff: VR_ASSUME.invEff },
  { k: '384', v: 384, cells: 192, eff: VR_ASSUME.invEff },
];
export function cellBank({ loadW, minutes, cells, models, eff = 1, endV = VR_ASSUME.endVCell, maxStrings = 4 }) {
  loadW = +loadW || 0; minutes = +minutes || 0; cells = +cells || 0;
  if (loadW <= 0 || minutes <= 0 || cells <= 0 || !models || !models.length) return null;
  const opts = [];
  for (const m of models.filter((x) => x.v === 2 && x.ah > 0)) {
    const c = curveFor(m, endV);
    for (let s = 1; s <= maxStrings; s++) {
      const perCell = loadW / eff / cells / s;
      const t = runtimeAt(c.pts, perCell);
      if (t >= minutes) {
        opts.push({ mod: m, cells, strings: s, total: cells * s, perCell: Math.round(perCell * 10) / 10, runtime: Math.round(t), est: c.est, ah: m.ah * s,
          kwh: Math.round((2 * m.ah * cells * s) / 100) / 10, kg: m.kg ? Math.round(m.kg * cells * s) : 0 });
        break;
      }
    }
  }
  opts.sort((a, b) => a.strings - b.strings || a.ah - b.ah);
  const best = opts[0] || null;
  const alts = opts.filter((o) => o !== best && o.ah > (best ? best.ah : 0)).filter((o, i, a) => a.findIndex((x) => x.mod.ah === o.mod.ah && x.strings === o.strings) === i).slice(0, 2);
  return { best, alts, none: !best };
}
export const VR2_GENERIC = [100, 200, 300, 400, 500, 600, 800, 1000, 1200, 1500, 2000, 2500, 3000].map((ah) => ({
  model: `2V ${ah}Ah`, slug: '', v: 2, ah, rate: 10, dims: [], kg: 0, cells: 1, series: 'agm', life: '', terminal: '', tables: { cp: {}, cc: {} },
}));
