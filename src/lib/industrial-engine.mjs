// 工频机 UPS（Industrial / low-frequency UPS）选型引擎：纯计算，网页和测试（scripts/test-industrial-engine.mjs）共用。
// 输出都是"选型参考"，最终以工厂确认为准。每条规则的依据写在旁边；没有规格书依据的数字放在 ASSUME 里，页面上原样列出。
import { batteryPlan } from './modular-engine.mjs';

export const ASSUME = {
  pfOut: 0.8,          // 工频机常见输出功率因数 0.8（kW = kVA × 0.8）；以具体型号规格书为准
  maxLoad: 0.8,        // 长期负载不超过额定容量的 80%（和模块化页面同一条规则）
  overload: [[1.25, '10 min'], [1.5, '1 min']], // 工频机常见过载能力：125% 10 分钟、150% 1 分钟
  eff: 0.92,           // 整机效率（工频机带隔离变压器，取 92% 估算发热和输入电流）
  inPf: { '6p': 0.8, '6pf': 0.95, '12p': 0.9, '12pf': 0.95 }, // 输入功率因数
  thdi: { '6p': '≈ 30%', '6pf': '< 10%', '12p': '≈ 10–12%', '12pf': '< 5%' }, // 输入电流谐波
  gen: { '6p': 2.5, '6pf': 1.5, '12p': 1.5, '12pf': 1.25 }, // 配套发电机容量 / UPS 输入 kVA
  minKva12p: 40,       // 12 脉冲整流一般从 40 kVA（三相输入）起做
  maxParallel: 6,      // 最多并机台数
  motorEff: 0.9, motorPf: 0.85, // 电机额定效率、功率因数（估算启动 kVA）
};

// 额定容量档位（kVA）：单相输出 1–20 kVA，三进单出 10–80 kVA，三进三出 10–400 kVA
export const RATINGS = {
  '11': [1, 2, 3, 6, 10, 15, 20],
  '31': [10, 15, 20, 30, 40, 60, 80],
  '33': [10, 15, 20, 30, 40, 60, 80, 100, 120, 160, 200, 250, 300, 400],
};
// 负载类型：功率因数（kW → kVA）
export const LOAD_TYPES = { ctrl: 0.9, mixed: 0.8, motor: 0.8 };
// 电机启动方式：启动电流倍数（相对电机额定电流）
export const START = { dol: 6, sd: 2.5, soft: 3, vfd: 1.1 };
// 电池直流电压：12 V 电池块数
export const BLOCK_OPTS = [16, 18, 20, 30, 32, 40];
export const defaultBlocks = (phase) => (phase === '11' ? 16 : 32);

const up = (list, v) => list.find((x) => x >= v - 1e-9) || null;
const STD_BREAKER = [6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600];
const r1 = (x) => Math.round(x * 10) / 10;

// q = { phase:'11'|'31'|'33', vIn, vOut, loadKw, loadType, motorKw, start, rect:'6p'|'6pf'|'12p'|'12pf', red:0|1, minutes, blocks }
export function sizeIndustrial(q) {
  const phase = RATINGS[q.phase] ? q.phase : '33';
  const ladder = RATINGS[phase];
  const kw = Math.max(0, +q.loadKw || 0);
  if (!kw) return null;
  const pfLoad = LOAD_TYPES[q.loadType] || 0.8;
  const loadKva = kw / pfLoad;
  // 连续负载：kW 不超过 额定kVA × PF × 80%，kVA 不超过 额定kVA × 80%
  const needCont = Math.max(kw / ASSUME.pfOut, loadKva) / ASSUME.maxLoad;
  // 冲击：最大一台电机启动时，其他负载照常运行；峰值不超过 150%（1 min 过载能力）
  const motorKw = Math.max(0, Math.min(+q.motorKw || 0, kw));
  const startF = START[q.start] || START.dol;
  const motorKva = motorKw / (ASSUME.motorEff * ASSUME.motorPf);
  const peakKva = motorKw ? (loadKva - motorKw / pfLoad) + motorKva * startF : loadKva;
  const needPeak = motorKw ? peakKva / ASSUME.overload[1][0] : 0;
  const need = Math.max(needCont, needPeak);
  // 单台放不下 → 容量并机（N 台平分），再按冗余加一台
  const maxR = ladder[ladder.length - 1];
  let n = Math.max(1, Math.ceil(need / maxR - 1e-9));
  let unit = up(ladder, need / n);
  while (!unit && n < 20) { n++; unit = up(ladder, need / n); }
  const units = n + (q.red ? 1 : 0);
  const tooMany = units > ASSUME.maxParallel;
  const sysKva = unit * n;                  // N 台（不算冗余那台）能带的容量
  const instKva = unit * units;
  const util = loadKva / instKva;           // 所有装机一起分担时的负载率
  const utilN = loadKva / sysKva;           // 坏一台（N+1）时剩下的负载率
  const peakRatio = motorKw ? peakKva / sysKva : 0;
  const by = needPeak > needCont ? 'peak' : 'cont';
  // 12 脉冲：只有三相输入、单台 ≥ 40 kVA 才提供
  const can12 = phase !== '11' && unit >= ASSUME.minKva12p;
  let rect = phase === '11' ? '1p' : (q.rect || '6p');
  if (!can12 && (rect === '12p' || rect === '12pf')) rect = rect === '12pf' ? '6pf' : '6p';
  // 输入 / 输出电流和开关（按单台额定）
  const vIn = +q.vIn || (phase === '11' ? 230 : 400), vOut = +q.vOut || (phase === '33' ? 400 : 230);
  const iFor = (kva, v, ph3) => (ph3 ? kva * 1000 / (Math.sqrt(3) * v) : kva * 1000 / v);
  const inPf = rect === '1p' ? 0.8 : ASSUME.inPf[rect];
  const inKva = unit * ASSUME.pfOut / ASSUME.eff / inPf;     // 满载输入（不含充电）
  const elec = {
    iIn: Math.round(iFor(inKva, vIn, phase !== '11')), brIn: up(STD_BREAKER, iFor(inKva, vIn, phase !== '11') * 1.25),
    iOut: Math.round(iFor(unit, vOut, phase === '33')), brOut: up(STD_BREAKER, iFor(unit, vOut, phase === '33') * 1.25),
    thdi: rect === '1p' ? '≈ 30%' : ASSUME.thdi[rect],
    genKva: Math.ceil(kw / ASSUME.eff / inPf * (rect === '1p' ? 2.5 : ASSUME.gen[rect]) / 5) * 5,
    heatKw: r1(kw * (1 / ASSUME.eff - 1)),
  };
  // 电池：整套系统的负载、按选择的直流电压（12 V 电池块数）
  const blocks = BLOCK_OPTS.includes(+q.blocks) ? +q.blocks : defaultBlocks(phase);
  const batt = q.minutes > 0 ? batteryPlan({ loadKw: kw, minutes: +q.minutes, blocks, type: 'vrla' }) : null;
  const checks = [];
  if (motorKw) checks.push({ id: 'peak', level: peakRatio <= 1.25 ? 'ok' : peakRatio <= 1.5 ? 'warn' : 'bad', pct: Math.round(peakRatio * 100) });
  if (util < 0.3) checks.push({ id: 'lowUtil', level: 'warn', pct: Math.round(util * 100) });
  if (tooMany) checks.push({ id: 'tooMany', level: 'bad', units });
  if (q.start === 'dol' && motorKw && by === 'peak') checks.push({ id: 'soft', level: 'warn' });
  return { phase, kw, pfLoad, loadKva: r1(loadKva), need: r1(need), by, n, units, unit, sysKva, instKva, util, utilN, peakKva: r1(peakKva), peakRatio, motorKw,
    rect, can12, inPf, elec, blocks, vDc: blocks * 12, batt, checks, tooMany };
}
