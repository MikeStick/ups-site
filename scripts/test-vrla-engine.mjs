// node scripts/test-vrla-engine.mjs
import assert from 'node:assert/strict';
import { vrlaModule, parseRow, toMin, upsBackup, solarBank, findAh, runtimeAt, dischargeTables } from '../src/lib/vrla-engine.mjs';
assert.equal(toMin('10min'), 10); assert.equal(toMin('1h'), 60); assert.equal(toMin('20Hr'), 1200); assert.equal(toMin('5Min'), 5);
assert.deepEqual(parseRow('10min=4087; 15min=3740; 1h=1459'), [[10, 4087], [15, 3740], [60, 1459]]);
// SK250-12（10HR，每单格表）
const p10 = { model: 'SK250-12', moduleVoltage: '12', moduleCapacity: '250', moduleDimensions: '520*269*220*224', moduleWeight: '69', extraSpecs: [
  { label: '容量率', value: '10HR' }, { label: '恒功率放电(W) 终止电压1.75V/Cell', value: '5min=1522; 10min=1036; 15min=709; 30min=431.3; 1h=264.2; 2h=164.91; 3h=128.21; 4h=100.84; 5h=85.47; 6h=57.11; 10h=49.48; 20h=25.91' } ] };
// SK250-12v（20HR，每节表）
const p20 = { model: 'SK250-12v', moduleVoltage: '12', moduleCapacity: '250', moduleDimensions: '520*267.5*220*225', moduleWeight: '68.5', extraSpecs: [
  { label: '容量率', value: '20HR' }, { label: '恒功率放电(W) 终止电压10.50V', value: '10min=4087; 15min=3740; 30min=2380; 1h=1459; 2h=839; 3h=644; 4h=517; 5h=441; 8h=296; 10h=271; 20h=148' } ] };
const a = vrlaModule(p10), b = vrlaModule(p20);
assert.equal(a.rate, 10); assert.equal(b.rate, 20); assert.equal(a.ah, 250); assert.equal(a.cells, 6);
assert.deepEqual(Object.keys(a.tables.cp), ['1.75']); assert.equal(a.tables.cp['1.75'][0][1], 9132); // 1522 W/格 × 6
assert.deepEqual(Object.keys(b.tables.cp), ['1.75']); assert.equal(b.tables.cp['1.75'][0][1], 4087);
// 插值：1459 W 正好 60 分钟
assert.equal(Math.round(runtimeAt(b.tables.cp['1.75'], 1459)), 60);
const r = runtimeAt(b.tables.cp['1.75'], 2000); assert.ok(r > 30 && r < 60, 'between 30 and 60 min: ' + r);
// UPS：10 kW 负载，192 V（16 节），30 分钟 → 每节 ≈ 680 W
const small = { model: 'SK100-12', moduleVoltage: '12', moduleCapacity: '100', extraSpecs: [] };
const models = [a, b, vrlaModule(small)];
const u = upsBackup({ loadW: 10000, minutes: 30, dcV: 192, models });
assert.ok(u.best, 'has option'); assert.equal(u.best.n, 16);
assert.ok(u.best.runtime >= 30);
console.log('UPS best', u.best.mod.model, u.best.strings, 'x', u.best.n, u.best.runtime + 'min', u.best.est ? '(est)' : '');
// 太大：1000 kW 不可能
assert.equal(upsBackup({ loadW: 1e6, minutes: 30, dcV: 192, models }).none, true);
// 光伏：每天 5 kWh，2 天，48 V → 5000*2/(48*0.5*0.85) ≈ 490 Ah
const s = solarBank({ dailyWh: 5000, days: 2, sysV: 48, models });
assert.equal(s.needAh, 490); assert.equal(s.opts[0].s, 4); assert.equal(s.opts[0].p, 2); assert.equal(s.opts[0].mod.ah, 250);
// 按 Ah 找
const f = findAh({ ah: 200, models }); assert.equal(f.same.ah, 250); assert.equal(f.prev.ah, 100);
assert.equal(findAh({ ah: 300, models }).tooBig, true);
{ // 同 Ah 的 10HR / 20HR 两个型号：same 一个，sameAll 两个，前后是不同 Ah
  const mk = (ah, rate) => ({ model: `SK${ah}-12${rate === 20 ? 'v' : ''}`, v: 12, ah, rate, dims: [], tables: { cp: {}, cc: {} } });
  const ms = [mk(55, 10), mk(55, 20), mk(65, 10), mk(65, 20), mk(75, 10)];
  const r = findAh({ ah: 65, models: ms });
  assert.equal(r.same.model, 'SK65-12'); assert.equal(r.sameAll.length, 2); assert.equal(r.prev.model, 'SK55-12'); assert.equal(r.next.model, 'SK75-12');
}
assert.equal(findAh({ ah: 100, rate: 20, models }).same.model, 'SK250-12v');
console.log('vrla engine OK');
