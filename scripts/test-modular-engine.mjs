// 模块化 UPS 选型引擎测试：node scripts/test-modular-engine.mjs
// 每个用例的期望值都是按注释里的公式手算出来的，引擎改了规则这里要同步改，并写明原因。
import assert from 'node:assert/strict';
import { catalog } from '../src/data/modular-catalog.mjs';
import { configure, batteryPlan, altitudeFactor } from '../src/lib/modular-engine.mjs';

const CAT = catalog();
let n = 0;
const t = (name, fn) => { fn(); n++; console.log('✓', name); };
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);

t('目录：型号名与规格书一致', () => {
  const names = CAT.map((x) => x.model);
  for (const m of ['RM 20/10X-PI', 'RM 180/30X-PI', 'RM 100/50X-PI', 'RM 200/50X-PI', 'RM 40/20X-Mini', 'RM 150/30X-Mini', 'RM 150/25X-Mini',
    'RM 120/20X-Plus', 'RM 300/30X-Plus', 'RM 800/50X-Plus', 'RM 300/100X-Plus', 'RM 1200/100X-Plus']) assert.ok(names.includes(m), m);
  // Mini 6 槽机柜上限 150 kVA：30 kVA 模块只能用 5 个
  assert.equal(CAT.find((x) => x.model === 'RM 150/30X-Mini').usable, 5);
  // PI 机柜高度 356 mm → 8U
  assert.equal(CAT.find((x) => x.model === 'RM 20/10X-PI').rackU, 8);
});

t('海拔降额：1500 m 内不降，2500 m → 90%', () => {
  assert.equal(altitudeFactor(1200), 1);
  assert.equal(altitudeFactor(2500), 0.9);
});

t('电池恒功率：200 kW / 15 min / 40 节', () => {
  const b = batteryPlan({ loadKw: 200, minutes: 15, blocks: 40 });
  // P = 200000 / 0.95 = 210526 W；240 节 → 877.2 W/cell；× 1.25 × 1.10 = 1206.1 W/cell
  near(b.wCell, 877.2, 0.2, 'W/cell');
  near(b.wCellDesign, 1206.1, 0.3, 'design W/cell');
  // 典型 VRLA 15 min ≈ 2.8 W/cell/Ah → 430.8 Ah → 3 串 × 150 Ah
  assert.equal(b.strings, 3); assert.equal(b.ah, 150);
  // 终止电压 40 × 6 × 1.75 = 420 V；放电末期电流 501 A；直流开关 ≥ 626 A → 630 A
  assert.equal(b.vEnd, 420); near(b.iEnd, 501.3, 0.5, 'I end'); assert.equal(b.breakerDc, 630);
});

t('200 kW N+1 400 V：最小合适机柜 + 5 个 50 kVA 的备选', () => {
  const r = configure({ grid: '400', loadKw: 200, pf: 1, red: 1, minutes: 15, blocks: 40, rechargeH: 8, ambient: 25 }, CAT);
  // 25 kVA：N = 8 → 装 9 个，10 槽机柜 RM 250/25X-Plus（容量最小且装得下）
  assert.equal(r.best.fr.model, 'RM 250/25X-Plus'); assert.equal(r.best.inst, 9); assert.equal(r.best.free, 1);
  const o50 = r.options.find((o) => o.fr.model === 'RM 300/50X-Plus');
  assert.ok(o50 && o50.inst === 5);
  // RM 200/50X-PI 只有 4 槽，装不下 5 个
  assert.ok(!r.options.some((o) => o.fr.model === 'RM 200/50X-PI'));
  // 充电：9 × 10 A = 90 A（机柜上限 100 A）；450 Ah × 1.15 / 90 + 2 = 7.75 h ≤ 8 h
  assert.equal(r.best.charge.avail, 90); near(r.best.charge.hours, 7.8, 0.06, 'recharge h');
});

t('单相电网：只剩 Mini 2/4 槽', () => {
  const r = configure({ grid: '1ph', loadKw: 30, pf: 0.9, red: 1 }, CAT);
  assert.ok(r.options.length > 0);
  assert.ok(r.options.every((o) => o.fr.series === 'Mini' && o.fr.slots <= 4));
});

t('208 V / 480 V 电网：标红需要变压器', () => {
  const r = configure({ grid: '208', loadKw: 50, pf: 0.9, red: 1 }, CAT);
  assert.ok(r.warnings.some((w) => w.id === 'grid' && w.level === 'bad'));
});

t('功率因数：90 kW、PF 0.9 → 按 100 kVA 选', () => {
  const r = configure({ grid: '400', loadKw: 90, pf: 0.9, red: 0, kind: 'rack' }, CAT);
  near(r.need.kva, 100, 0.01, 'kVA');
  // 机架式里：50 kVA × 2 = RM 100/50X-PI 正好 100 kVA
  assert.ok(r.options.some((o) => o.fr.model === 'RM 100/50X-PI' && o.inst === 2));
});

t('冲击负载：超过 150% 会转旁路', () => {
  const r = configure({ grid: '400', loadKw: 40, pf: 1, red: 1, inrushKw: 60, kind: 'rack' }, CAT);
  const c = r.best.checks.find((x) => x.id === 'inrush');
  // 选中 RM 60/30X-PI？不一定，只检查判断逻辑：峰值 100 kVA / 装机容量
  assert.ok(c); assert.equal(c.level, 100 / r.best.capInst <= 1.5 ? (100 / r.best.capN <= 1.5 ? 'ok' : 'warn') : 'bad');
});

t('1500 kW：单机柜装不下，提示并机', () => {
  const r = configure({ grid: '400', loadKw: 1500, pf: 1, red: 1 }, CAT);
  assert.equal(r.best, null); assert.ok(r.parallel && r.parallel.units >= 2);
});

console.log(`\n${n} tests passed`);
