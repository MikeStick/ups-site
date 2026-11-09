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

// 一节电池的参数
export function vrlaModule(p) {
  const mm = String(p.model || '').match(/(\d{2,3})\s*-\s*(\d{1,2})\b/); // SK250-12 → 250 Ah, 12 V
  const v = num(p.moduleVoltage || p.batteryVoltage || spec(p, /额定电压|nominal\s*voltage/i)) || (mm ? +mm[2] : 12);
  // SK 系列命名：SK100-12 = 10HR、SK100-12v = 20HR，型号里的数字就是该容量率下的额定 Ah（规格书同时列了 20HR / 10HR 等多个容量，导入时容易填错）
  const sk = String(p.model || '').trim().match(/^SK(\d{2,3})-12(v?)$/i);
  const ah = sk ? +sk[1] : num(p.moduleCapacity || spec(p, /额定容量|rated\s*capacity/i)) || (mm ? +mm[1] : 0);
  const rateTxt = spec(p, /容量率|小时率|rate/i) + ' ' + p.model;
  const rate = sk ? (sk[2] ? 20 : 10) : /20\s*h/i.test(rateTxt) ? 20 : /10\s*h/i.test(rateTxt) ? 10 : /v$/i.test(String(p.model || '').trim()) ? 20 : 10;
  // 尺寸 / 重量一般在模块字段里；没有的话从 extraSpecs 的"尺寸(长*宽*高*总高)""参考重量"取
  const dims = (String(p.moduleDimensions || p.dimensions || spec(p, /尺寸|dimension/i)).match(/\d+(?:\.\d+)?/g) || []).map(Number).slice(0, 4);
  const kg = num(p.moduleWeight || p.netWeight || spec(p, /重量|weight/i));
  const cells = Math.max(1, Math.round(v / 2));
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
