// 高压磷酸铁锂电池柜（R204.8V / R409.6V 系列）选型：给 UPS 或高压逆变器配电池柜。
// 输入：负载 kW、备电时间（小时）、直流电压等级（204.8 V ≈ 16 节 12 V 铅酸 / 192 V 母线；409.6 V ≈ 32 节 / 384 V 母线；auto = 按功率自动选）。
// 规则：所需能量 = 负载 × 时间 ÷（90% 可用 × 95% 效率）；放电电流 = 负载 ÷（95% × 最低放电电压 0.875 × 额定电压），每柜不超过最大放电电流；
// 柜数 = 两者取大；同一电压等级里选"总容量最接近需求"的型号（同样大小时柜子少的优先）。最多并联 MAX_PAR 柜。
// 测试：node scripts/test-hvcab-engine.mjs

export const HV_ASSUME = { dod: 0.9, eff: 0.95, vMinRatio: 0.875, maxPar: 8, autoKw: 20 };
export const HV_LEVELS = [204.8, 409.6];
export const HV_BUS = { 204.8: 192, 409.6: 384 }; // 对应铅酸母线电压
// 没有已发布型号时用的典型系列（来自 R204.8V / R409.6V 规格书）
export const HV_GENERIC = [
  { m: 'R204.8V50AH', v: 204.8, ah: 50, kwh: 10.24, maxA: 50, u: 18, kg: 100 },
  { m: 'R204.8V100AH', v: 204.8, ah: 100, kwh: 20.48, maxA: 100, u: 20, kg: 200 },
  { m: 'R204.8V150AH', v: 204.8, ah: 150, kwh: 30.72, maxA: 150, u: 25, kg: 290 },
  { m: 'R204.8V200AH', v: 204.8, ah: 200, kwh: 40.96, maxA: 200, u: 30, kg: 290 },
  { m: 'R409.6V50AH', v: 409.6, ah: 50, kwh: 20.48, maxA: 50, u: 27, kg: 180 },
  { m: 'R409.6V100AH', v: 409.6, ah: 100, kwh: 40.96, maxA: 100, u: 36, kg: 360 },
];
export const KW_PRESETS = [6, 10, 20, 40, 80];
export const TIME_PRESETS = [0.25, 0.5, 1, 2, 4]; // 小时

const near = (v, lv) => Math.abs(v - lv) / lv < 0.08;
export const levelOf = (v) => HV_LEVELS.find((lv) => near(v, lv)) || 0;

export function sizeHv({ kw, hours, level = 'auto', models }) {
  kw = +kw || 0; hours = +hours || 0;
  if (kw <= 0 || hours <= 0 || !models || !models.length) return null;
  const lv = level === 'auto' ? (kw > HV_ASSUME.autoKw ? 409.6 : 204.8) : +level;
  let ms = models.filter((m) => levelOf(m.v) === lv && m.kwh > 0);
  let switched = false;
  if (!ms.length) { // 这个电压等级没有已发布型号：换另一个等级
    const other = HV_LEVELS.find((x) => x !== lv && models.some((m) => levelOf(m.v) === x));
    if (!other) return null;
    ms = models.filter((m) => levelOf(m.v) === other && m.kwh > 0); switched = true;
  }
  const v = levelOf(ms[0].v);
  const need = (kw * hours) / (HV_ASSUME.dod * HV_ASSUME.eff);
  const amps = (kw * 1000) / (HV_ASSUME.eff * HV_ASSUME.vMinRatio * v);
  const cand = ms.map((m) => {
    const nE = Math.ceil(need / m.kwh - 1e-9);
    const nI = m.maxA ? Math.ceil(amps / m.maxA - 1e-9) : 1;
    const n = Math.max(1, nE, nI);
    return { mod: m, n, nE, nI, total: n * m.kwh };
  });
  cand.sort((a, b) => (a.n > HV_ASSUME.maxPar) - (b.n > HV_ASSUME.maxPar) || a.total - b.total || a.n - b.n);
  const c = cand[0], m = c.mod;
  const usable = c.total * HV_ASSUME.dod;
  return {
    level: v, switched, bus: HV_BUS[v], need: r1(need), amps: Math.round(amps),
    mod: m, n: c.n, byCurrent: c.nI > c.nE, totalKwh: r2(c.total), usableKwh: r1(usable),
    runtime: r1((usable * HV_ASSUME.eff) / kw), maxKw: m.maxA ? r1((c.n * m.maxA * v * HV_ASSUME.vMinRatio) / 1000) : 0,
    perCabA: Math.round(amps / c.n), kg: m.kg ? Math.round(m.kg * c.n) : 0, overPar: c.n > HV_ASSUME.maxPar,
  };
}
const r1 = (x) => Math.round(x * 10) / 10;
const r2 = (x) => Math.round(x * 100) / 100;
