// 模块化 UPS 选型引擎：纯计算，不碰页面。网页和测试（scripts/test-modular-engine.mjs）共用这一份。
// 每一条规则的依据写在旁边：规格书（datasheet）、标准（IEEE 485 / IEC 62040-3 / IEC 60364）、或明确标注的工程假设（ASSUME）。
// 输出里的数字都是"选型参考"，最终以工厂确认为准；电池只给出匹配标准（恒功率 W/cell），按这个标准去找电池厂家的放电表。

// —— 工程假设（页面上会原样列出，方便工程师审核）——
export const ASSUME = {
  battEff: 0.95,       // 电池模式逆变效率（规格书只给了整机效率 95.5–96%，电池模式取 0.95 偏保守）
  aging: 1.25,         // 老化系数：寿命末期容量 80%（IEEE 485）
  margin: 1.10,        // 设计余量（IEEE 485 推荐 1.10–1.15）
  endV: 1.75,          // 终止电压 V/cell（12V 电池 = 10.5V），UPS 短时放电常用值
  cellsPerBlock: 6,
  altDeratePer100m: 0.01, // 海拔 > 1500 m 每 100 m 降 1%（规格书只写 < 1500 m，超出部分按常用值估算，需工厂确认）
  chargeAbsorbH: 2,    // 恒压阶段大约 2 h
  rechargeFactor: 1.15,// 充回容量 = 放出容量 × 1.15（充电效率）
  vrlaKgPerAh: 0.30,   // 12V VRLA 每 Ah 约 0.3 kg（估算地面荷载用）
  genRatio: [1.25, 1.5], // 发电机 / UPS 输入容量比（输入 THDi ≤ 3%，取低值即可）
  lfpDod: 0.9, lfpAging: 1.1,
  lfpCells: 160, lfpVCell: 3.2, lfpEndV: 2.8, // 高压锂电：160 节 LFP 串联 = 512 V 标称（放电末 448 V，落在 UPS 360–600 VDC 范围内）
  lfpMaxC: 3,          // UPS 专用高倍率 LFP 按 3C 放电能力算（短时备电时电流比能量更先成为限制）
  lfpKgPerKwh: 10,     // 含模块外壳和电池架，粗估

};

// 典型高倍率 VRLA：放电到 1.75 V/cell、25 °C 时，每 Ah 额定容量能给出的 W/cell（随时间插值）。
// 只用来估算"大概需要多大 Ah 的电池"，最终必须用具体电池型号的放电表核对。
const VRLA_W_PER_AH = [[5, 5.0], [10, 3.6], [15, 2.8], [20, 2.3], [30, 1.7], [45, 1.25], [60, 1.0], [90, 0.72], [120, 0.57], [180, 0.40], [240, 0.31], [480, 0.17]];
export const LFP_AH = [50, 100, 150, 200, 280];
export const STD_AH = [7, 9, 12, 17, 24, 26, 33, 38, 40, 45, 50, 55, 65, 70, 80, 90, 100, 120, 134, 150, 160, 180, 200];
export const STD_BREAKER = [16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600, 2000, 2500, 3200, 4000];

const interp = (tbl, x) => {
  if (x <= tbl[0][0]) return tbl[0][1];
  for (let i = 1; i < tbl.length; i++) {
    if (x <= tbl[i][0]) { const [x0, y0] = tbl[i - 1], [x1, y1] = tbl[i]; return y0 + (y1 - y0) * (x - x0) / (x1 - x0); }
  }
  return tbl[tbl.length - 1][1];
};
const up = (list, v) => list.find((x) => x >= v) || null;
const r1 = (x) => Math.round(x * 10) / 10;

// 电网：直接兼容的只有 380/400/415 V 三相，和 Mini 2/4 槽的 220/230/240 V 单相
export const GRIDS = {
  '400': { v: 400, phases: 3, ok: true }, '380': { v: 380, phases: 3, ok: true }, '415': { v: 415, phases: 3, ok: true },
  '208': { v: 208, phases: 3, ok: false }, '220': { v: 220, phases: 3, ok: false }, '440': { v: 440, phases: 3, ok: false }, '480': { v: 480, phases: 3, ok: false },
  '1ph': { v: 230, phases: 1, ok: true },
};

// 海拔降额系数
export function altitudeFactor(alt) {
  if (!(alt > 1500)) return 1;
  return Math.max(0.5, 1 - ASSUME.altDeratePer100m * Math.ceil((alt - 1500) / 100));
}

// 电池：恒功率法（IEEE 485 思路）。返回匹配标准 + 典型 VRLA 估算
export function batteryPlan({ loadKw, minutes, blocks, type = 'vrla', ambient = 25 }) {
  if (!(minutes > 0) || !(loadKw > 0)) return null;
  const pW = loadKw * 1000 / ASSUME.battEff;              // 电池要给出的功率
  const cells = blocks * ASSUME.cellsPerBlock;
  const tempF = ambient < 25 ? 1 + 0.01 * Math.min(15, 25 - ambient) * 0.8 : 1; // 低于 25 °C 容量下降（约 0.8%/°C，IEEE 485 表格近似）
  const wCell = pW / cells;                               // 实际每节放电功率
  const wCellDesign = wCell * ASSUME.aging * ASSUME.margin * tempF; // 选电池时要满足的 W/cell
  const vEnd = blocks * ASSUME.cellsPerBlock * ASSUME.endV; // 终止电压（整串，12V 电池 = 6 节 × 1.75 V）
  const iEnd = pW / vEnd;                                  // 放电末期最大直流电流
  const out = { pW, cells, wCell, wCellDesign, tempF, vNom: blocks * 12, vEnd, iEnd, breakerDc: up(STD_BREAKER, iEnd * 1.25) };
  if (type === 'lfp') {
    const kwh = pW * minutes / 60 / 1000 / ASSUME.lfpDod * ASSUME.lfpAging;
    // 簇（cluster）= 160 节串联 512 V，单簇容量从标准电芯里选；同时满足能量和最大放电倍率
    const vNomL = ASSUME.lfpCells * ASSUME.lfpVCell, vEndL = ASSUME.lfpCells * ASSUME.lfpEndV;
    const iL = pW / vEndL;
    const ahE = kwh * 1000 / vNomL, ahC = iL / ASSUME.lfpMaxC;
    const ahNeed = Math.max(ahE, ahC);
    const clusters = Math.max(1, Math.ceil(ahNeed / LFP_AH[LFP_AH.length - 1]));
    const ah = up(LFP_AH, ahNeed / clusters) || LFP_AH[LFP_AH.length - 1];
    const kwhInst = r1(clusters * ah * vNomL / 1000);
    return { ...out, type, kwh: r1(kwh), cRate: r1(pW / 1000 / kwh), vNom: vNomL, vEnd: vEndL, iEnd: iL, breakerDc: up(STD_BREAKER, iL * 1.25),
      clusters, ah, kwhInst, modules: clusters * 10, moduleKwh: r1(ah * vNomL / 10 / 1000), byPower: ahC > ahE, cInst: r1(iL / (clusters * ah)),
      kg: Math.round(kwhInst * ASSUME.lfpKgPerKwh), runMin: Math.round(clusters * ah * vNomL * ASSUME.lfpDod / ASSUME.lfpAging / pW * 60) };
  }
  const perAh = interp(VRLA_W_PER_AH, minutes);
  const ahTotal = wCellDesign / perAh;
  let strings = Math.max(1, Math.ceil(ahTotal / 200));
  let ah = up(STD_AH, ahTotal / strings) || 200;
  const kg = Math.round(blocks * strings * ah * ASSUME.vrlaKgPerAh);
  return { ...out, type, perAh, ahTotal: Math.round(ahTotal), strings, ah, blocksTotal: blocks * strings, kg };
}

// 一个具体型号（机柜 + 模块规格）对这组需求的方案
function solve(fr, q, need) {
  const m = fr.moduleKva;
  const nNow = Math.max(1, Math.ceil(need.kvaNow / m - 1e-9));
  const inst = nNow + q.red;
  const nFut = Math.max(1, Math.ceil(need.kvaFuture / m - 1e-9)) + q.red;
  const fits = inst <= fr.usable;
  const futureFits = nFut <= fr.usable;
  const capInst = inst * m * need.altF;                   // 装上的模块（含冗余）在现场条件下的可用容量
  const capN = nNow * m * need.altF;                      // 坏一个冗余模块后（只剩 N 个）的容量
  const util = need.kva / capInst;
  const effPct = fr.eff;
  const lossKw = q.loadKw * (100 / effPct - 1);
  const checks = [];
  // 冲击负载：按规格书过载能力 110%/60 min、125%/10 min、150%/1 min 判断
  // 冲击电流通常只持续几秒：≤ 150% 在 1 min 过载能力内，逆变器带得住；> 150% 会转旁路（市电），停电时没有旁路可转
  if (q.inrushKw > 0) {
    const peak = (q.loadKw + q.inrushKw) / (q.pf || 1);
    const ratio = peak / capInst, ratioN = peak / capN;
    checks.push({ id: 'inrush', level: ratio <= 1.5 ? (ratioN <= 1.5 ? 'ok' : 'warn') : 'bad', ratio: Math.round(ratio * 100), ratioN: Math.round(ratioN * 100) });
  }
  if (util < 0.3) checks.push({ id: 'lowUtil', level: 'warn', util: Math.round(util * 100) });
  // 充电：可用充电电流 = 模块数 × 单模块充电电流，受机柜上限约束
  let charge = null;
  if (need.batt && need.batt.type !== 'lfp') {
    const avail = Math.min(inst * fr.moduleChargeA, fr.frameChargeA || Infinity);
    const ahInst = need.batt.ah * need.batt.strings;
    const h = ahInst * ASSUME.rechargeFactor / avail + ASSUME.chargeAbsorbH;
    const needA = ahInst * ASSUME.rechargeFactor / Math.max(1, (q.rechargeH || 8) - ASSUME.chargeAbsorbH);
    charge = { avail, hours: r1(h), needA: Math.ceil(needA), ok: h <= (q.rechargeH || 8), c: r1(avail / ahInst * 100) / 100 };
    checks.push({ id: 'charge', level: charge.ok ? 'ok' : 'warn', ...charge });
  }
  // 电流（满足最终机柜容量布线：按机柜额定 + 充电功率）
  const v = need.grid.v, ph = need.grid.phases;
  const iFor = (kva) => (ph === 3 ? kva * 1000 / (Math.sqrt(3) * v) : kva * 1000 / v);
  const chargeKw = charge ? charge.avail * q.blocks * 13.8 / 1000 : 0; // 充电功率 = 充电电流 × 均充电压（13.8 V/块）
  const inKvaNow = (q.loadKw / (effPct / 100) + chargeKw) / 0.99;
  const inKvaFrame = (fr.ratingKva / (effPct / 100) + chargeKw) / 0.99;
  const elec = {
    iInNow: Math.round(iFor(inKvaNow)), iInFrame: Math.round(iFor(inKvaFrame)),
    brIn: up(STD_BREAKER, iFor(inKvaFrame) * 1.25), iOut: Math.round(iFor(fr.ratingKva)), brOut: up(STD_BREAKER, iFor(fr.ratingKva) * 1.25),
    brByp: up(STD_BREAKER, iFor(fr.ratingKva) * 1.25),
    genKva: [Math.ceil(inKvaNow * ASSUME.genRatio[0] / 5) * 5, Math.ceil(inKvaNow * ASSUME.genRatio[1] / 5) * 5],
    heatW: Math.round(lossKw * 1000), btu: Math.round(lossKw * 1000 * 3.412),
  };
  const modKg = inst * fr.module.kg;
  const footM2 = fr.dims.d * fr.dims.w / 1e6;
  const inst2 = { kg: Math.round(fr.kg + modKg), floor: Math.round((fr.kg + modKg) / footM2) };
  // 排序分：先看能不能装下现在和将来，再看容量是否合适（不浪费）、负载率是否在 40–80%
  const score = (fits ? 0 : 1e6) + (futureFits ? 0 : 1e4) + fr.ratingKva + Math.abs(0.6 - util) * 50;
  return { fr, nNow, inst, nFut, fits, futureFits, free: fr.usable - inst, util, capInst, capN, lossKw, charge, elec, install: inst2, checks, score };
}

// 主入口
// q = { grid:'400', freq:50|60, loadKw, pf, loadType:'it'|'mixed'|'motor', inrushKw, futureKw, red:0|1|2, altitude, ambient,
//       minutes, battType:'vrla'|'lfp', blocks, rechargeH, kind:''|'rack'|'compact'|'cabinet' }
export function configure(q, cat) {
  const grid = GRIDS[q.grid] || GRIDS['400'];
  const pf = Math.min(1, Math.max(0.5, q.pf || 0.9));
  const altF = altitudeFactor(q.altitude || 0);
  const kva = q.loadKw / pf;                              // 规格书：输出功率因数 1 → kVA = kW，负载按 kVA 和 kW 中较大者
  const kvaNow = kva / altF;
  const kvaFuture = Math.max(q.futureKw || 0, q.loadKw) / pf / altF;
  const warnings = [];
  if (!grid.ok) warnings.push({ id: 'grid', level: 'bad', v: grid.v });
  if (q.ambient > 40) warnings.push({ id: 'ambient', level: 'bad', t: q.ambient });
  else if (q.ambient > 30) warnings.push({ id: 'battTemp', level: 'warn', t: q.ambient });
  if (altF < 1) warnings.push({ id: 'altitude', level: 'warn', alt: q.altitude, f: Math.round(altF * 100) });
  if (q.loadType === 'mixed' || q.loadType === 'it') warnings.push({ id: 'neutral', level: 'info' });
  if (q.red === 0) warnings.push({ id: 'noRed', level: 'warn' });
  warnings.push({ id: 'spof', level: 'info' });
  const blocks = Math.min(50, Math.max(30, Math.round((q.blocks || 40) / 2) * 2));
  const batt = batteryPlan({ loadKw: q.loadKw, minutes: q.minutes, blocks, type: q.battType, ambient: q.ambient ?? 25 });
  const need = { kva, kvaNow, kvaFuture, altF, grid, batt };
  const qq = { ...q, pf, blocks };
  const pool = cat.filter((fr) => (grid.phases === 1 ? fr.singlePhase : true) && (!q.kind || fr.kind === q.kind));
  const all = pool.map((fr) => solve(fr, qq, need)).sort((a, b) => a.score - b.score);
  const ok = all.filter((s) => s.fits);
  // 一个机柜装不下：建议同型号并机（每台按 N/k + 冗余），这里只给出台数，具体并机方案需工厂确认
  let parallel = null;
  if (!ok.length && cat.length) {
    const big = [...pool].sort((a, b) => b.ratingKva - a.ratingKva)[0];
    const units = Math.ceil((Math.ceil(kvaNow / big.moduleKva) + q.red) / big.usable);
    parallel = { model: big.model, units, ratingKva: big.ratingKva };
  }
  return { input: qq, need, blocks, batt, warnings, best: ok[0] || null, options: ok.slice(0, 8), parallel, all };
}

// 配置编号：输入参数的短哈希，方便在报价和沟通中引用
export function configId(q) {
  const s = JSON.stringify(q); let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return 'MU-' + h.toString(36).toUpperCase().slice(0, 6);
}
