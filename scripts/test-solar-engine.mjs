// 光伏选型引擎的检查：node scripts/test-solar-engine.mjs
import { sizeSolar } from '../src/lib/solar-engine.mjs';
let fail = 0;
const ok = (c, m) => { if (!c) { fail++; console.error('✗', m); } else console.log('✓', m); };
const home = { light: { n: 8 }, fan: { n: 2 }, tv: { n: 1 }, router: { n: 1 }, fridge: { n: 1 } };
let r = sizeSolar({ items: home, goal: 'backup', outageH: 8, region: 'africa' });
ok(r && r.dailyKwh > 2 && r.dailyKwh < 4, `basic home ≈ ${r.dailyKwh} kWh/day, peak ${r.peakW} W`);
ok(r.invKw === 3, `inverter 3 kW (need ${r.needKw})`);
ok(r.modules === 1, `8 h outage → ${r.modules} battery module(s) (${r.battKwh} kWh)`);
const off = sizeSolar({ items: home, goal: 'off', autonomy: 1, region: 'africa' });
ok(off.battKwh > r.battKwh && off.panels >= r.panels, `off-grid needs more battery (${off.battKwh}) and panels (${off.panels})`);
r = sizeSolar({ items: { ...home, ac: { n: 2 }, pump: { n: 1 } }, goal: 'self', region: 'mideast' });
ok(r.invKw >= 5, `with 2 AC + pump → ${r.invKw} kW (surge ${r.surgeW} W)`);
r = sizeSolar({ items: home, goal: 'self', region: 'africa', phase: '1', models: [{ kw: 5, kind: 'hybrid', phase: '1', m: 'H5K' }, { kw: 8, kind: 'hybrid', phase: '1', m: 'H8K' }, { kw: 3, kind: 'off', phase: '1', m: 'O3K' }] });
ok(r.model && r.model.m === 'H5K', `picks smallest published hybrid: ${r.model && r.model.m}`);
r = sizeSolar({ items: { heater: { n: 10 } }, goal: 'self', region: 'africa', phase: '1', models: [{ kw: 8, kind: 'hybrid', phase: '1', m: 'H8K' }] });
ok(r.units > 1 && r.model.m === 'H8K', `big load → ${r.units} × H8K in parallel`);
ok(sizeSolar({ items: {} }) === null, 'no load → null');
process.exit(fail ? 1 : 0);
