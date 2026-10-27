// 模块化 UPS 产品目录（来自工厂规格书《10-1200kVA Modular UPS (PI/Mini/Plus Series)》）
// 结构：系列 → 机柜（槽位数、可用模块规格、机柜容量上限、充电能力、尺寸重量）→ 功率模块（kVA、充电电流、尺寸重量）。
// 选型引擎 src/lib/modular-engine.mjs 只读这里的数据；以后新增系列 / 别家同类产品，按同样格式加一段即可。
// 尺寸统一写成 D×W×H（mm，和规格书一致）。

// 三个系列共用的电气参数（规格书各表一致的项）
const COMMON = {
  input: { wiring: '3W+N+PE', voltages: [380, 400, 415], range: '138–485 VAC', freq: '40–70 Hz', pf: '≥ 0.99', thdi: '≤ 3% (linear) / ≤ 5% (non-linear)', generator: true },
  output: { voltages: [380, 400, 415], pf: 1, accuracy: '±1%', freq: [50, 60], crest: '3:1', thdv: '≤ 2% (linear) / ≤ 4% (non-linear)' },
  overload: [[1.10, 60 * 60], [1.25, 10 * 60], [1.50, 60]], // [负载倍数, 允许秒数]
  battery: { blocksMin: 30, blocksMax: 50, blocksDefault: 40, blockV: 12 }, // 30–50 节 12V（偶数），默认 40 节
  transfer: '0 ms',
  env: { tMin: 0, tMax: 40, altitude: 1500, humidity: '0–95% (non-condensing)', noise: '< 70 dB' },
  standards: 'EN 62040-1, EN 62040-2, EN 62040-3, YD/T 2165-2017',
  comms: 'USB, CAN, RS485, FE, dry contacts; optional SNMP card, parallel card, LBS card, temperature sensor',
};

// 功率模块
export const MODULES = {
  10: { kva: 10, chargeA: 5, dims: '620×440×86', kg: 19 },
  15: { kva: 15, chargeA: 5, dims: '620×440×86', kg: 19 },
  20: { kva: 20, chargeA: 5, dims: '620×440×86', kg: 19 },
  25: { kva: 25, chargeA: 10, dims: '620×440×86', kg: 21.6 },
  30: { kva: 30, chargeA: 10, dims: '620×440×86', kg: 21.6 },
  50: { kva: 50, chargeA: 15, chargeDefaultA: 10, dims: '620×440×131', kg: 33 },
  100: { kva: 100, chargeA: 30, chargeDefaultA: 20, dims: '750×440×131', kg: 49 },
};

const f = (name, slots, mods, d, w, h, kg, extra = {}) => ({ name, slots, mods, d, w, h, kg, ...extra });

export const SERIES = [
  {
    id: 'PI', kind: 'rack', title: 'PI series · rack-mount modular UPS', range: '10–200 kVA',
    note: '19-inch frame. Independent mains and bypass inputs. Centralised bypass + maintenance bypass.',
    eff: 95.5, singlePhase: false, lowVoltDerate: '138–305 VAC input: linear derating (10–30 kVA modules)',
    frames: [
      f('RM {r}/{m}X-PI', 2, [10, 15, 20, 25, 30], 835, 485, 356, 48.5),
      f('RM {r}/{m}X-PI', 4, [10, 15, 20, 25, 30], 835, 485, 534, 53.5),
      f('RM {r}/{m}X-PI', 6, [10, 15, 20, 25, 30], 835, 485, 712, 63.5),
      f('RM {r}/{m}X-PI', 2, [50], 838, 485, 489.5, 50, { frameChargeA: 30 }),
      f('RM {r}/{m}X-PI', 4, [50], 838, 485, 756.5, 72.5, { frameChargeA: 60 }),
    ],
  },
  {
    id: 'Mini', kind: 'compact', title: 'Mini series · compact modular UPS on castors', range: '10–150 kVA',
    note: 'Mobile tower with castors. Standard maintenance bypass. 2- and 4-slot frames also available single-phase (220/230/240 V).',
    eff: 95.5, singlePhase: true,
    frames: [
      f('RM {r}/{m}X-Mini', 2, [10, 15, 20], 750, 485, 649, 63, { singlePhase: true, chargeCapA: 5 }),
      f('RM {r}/{m}X-Mini', 4, [10, 15, 20], 850, 485, 827, 75, { singlePhase: true, chargeCapA: 5 }),
      f('RM {r}/{m}X-Mini', 6, [10, 15, 20, 25, 30], 850, 485, 1005, 87, { maxKva: 150 }),
    ],
  },
  {
    id: 'Plus', kind: 'cabinet', title: 'Plus series · floor-standing modular UPS', range: '20–1200 kVA',
    note: 'Floor-standing cabinet. Standard maintenance bypass. Large touch screen.',
    eff: 95.5, singlePhase: false,
    frames: [
      f('RM {r}/{m}X-Plus', 6, [20, 25, 30], 850, 600, 1350, 158, { frameChargeA: { 20: 25, 25: 50, 30: 50 } }),
      f('RM {r}/{m}X-Plus', 10, [20, 25, 30], 850, 600, 2000, 245, { frameChargeA: { 20: 50, 25: 100, 30: 100 } }),
      f('RM {r}/{m}X-Plus', 6, [50], 850, 600, 2000, 235, { eff: 96 }),
      f('RM {r}/{m}X-Plus', 8, [50], 850, 1200, 2000, 407, { eff: 96 }),
      f('RM {r}/{m}X-Plus', 10, [50], 850, 1200, 2000, 443, { eff: 96 }),
      f('RM {r}/{m}X-Plus', 12, [50], 850, 1200, 2000, 513, { eff: 96 }),
      f('RM {r}/{m}X-Plus', 16, [50], 850, 2400, 2000, 919, { eff: 96 }),
      f('RM {r}/{m}X-Plus', 3, [100], 1000, 600, 2000, 255, { eff: 96, thdv: '≤ 1% (linear) / ≤ 3% (non-linear)' }),
      f('RM {r}/{m}X-Plus', 6, [100], 1000, 800, 2000, 412, { eff: 96, thdv: '≤ 1% (linear) / ≤ 3% (non-linear)' }),
      f('RM {r}/{m}X-Plus', 8, [100], 1000, 1600, 2000, 700, { eff: 96, thdv: '≤ 1% (linear) / ≤ 3% (non-linear)', alt: '1000×1800×2000 / 900 kg with four switches' }),
      f('RM {r}/{m}X-Plus', 10, [100], 1000, 1600, 2000, 710, { eff: 96, thdv: '≤ 1% (linear) / ≤ 3% (non-linear)', alt: '1000×1800×2000 / 910 kg with four switches' }),
      f('RM {r}/{m}X-Plus', 12, [100], 1000, 1600, 2000, 720, { eff: 96, thdv: '≤ 1% (linear) / ≤ 3% (non-linear)', alt: '1000×1800×2000 / 920 kg with four switches' }),
    ],
  },
];

// 展开成"机柜 × 模块规格"的具体型号列表，引擎直接用
export function catalog() {
  const out = [];
  for (const s of SERIES) {
    for (const fr of s.frames) {
      for (const m of fr.mods) {
        const mod = MODULES[m];
        const usable = fr.maxKva ? Math.min(fr.slots, Math.floor(fr.maxKva / m)) : fr.slots; // Mini 6 槽机柜最大 150 kVA：30 kVA 模块最多用 5 个
        const rating = usable * m;
        const fc = typeof fr.frameChargeA === 'object' ? fr.frameChargeA[m] : fr.frameChargeA;
        out.push({
          model: fr.name.replace('{r}', rating).replace('{m}', m),
          series: s.id, kind: s.kind, slots: fr.slots, usable, moduleKva: m, ratingKva: rating,
          singlePhase: !!fr.singlePhase,
          eff: fr.eff || s.eff, thdv: fr.thdv || COMMON.output.thdv,
          moduleChargeA: fr.chargeCapA ? Math.min(fr.chargeCapA, mod.chargeA) : mod.chargeA,
          frameChargeA: fc || null,
          dims: { d: fr.d, w: fr.w, h: fr.h }, kg: fr.kg, alt: fr.alt || '',
          rackU: s.kind === 'rack' ? Math.round(fr.h / 44.45) : 0, // 356 mm = 8U（8 × 44.45 = 355.6）
          module: mod,
          batteryV: m === 100 ? '360–600 VDC' : '±180 … ±300 VDC (360–600 VDC)',
        });
      }
    }
  }
  return out;
}

export const COMMON_SPECS = COMMON;
