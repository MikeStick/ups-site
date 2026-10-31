// 工频机选型引擎的检查：node scripts/test-industrial-engine.mjs
import { sizeIndustrial } from '../src/lib/industrial-engine.mjs';
let fail = 0;
const ok = (c, m) => { if (!c) { fail++; console.error('✗', m); } else console.log('✓', m); };
let r = sizeIndustrial({ phase: '33', loadKw: 40, loadType: 'mixed', minutes: 30 });
ok(r.unit === 80 && r.n === 1, `40 kW mixed → 80 kVA (need ${r.need})`); // 40/0.8=50 kVA /0.8 = 62.5 → 80
r = sizeIndustrial({ phase: '33', loadKw: 40, loadType: 'mixed', motorKw: 15, start: 'dol' });
ok(r.by === 'peak' && r.peakRatio <= 1.5 + 1e-9, `DOL 15 kW motor drives sizing (unit ${r.unit}, peak ${Math.round(r.peakRatio * 100)}%)`);
const soft = sizeIndustrial({ phase: '33', loadKw: 40, loadType: 'mixed', motorKw: 15, start: 'soft' });
ok(soft.unit <= r.unit, `soft start needs ≤ DOL rating (${soft.unit} ≤ ${r.unit})`);
r = sizeIndustrial({ phase: '33', loadKw: 500, loadType: 'mixed', red: 1 });
ok(r.n >= 2 && r.units === r.n + 1 && r.unit <= 400, `500 kW → ${r.n}+1 × ${r.unit} kVA`);
r = sizeIndustrial({ phase: '11', loadKw: 3, loadType: 'ctrl', rect: '12p' });
ok(r.rect === '1p' && r.unit === 6, `single phase 3 kW → ${r.unit} kVA, rect ${r.rect}`);
r = sizeIndustrial({ phase: '33', loadKw: 10, loadType: 'ctrl', rect: '12p' });
ok(r.rect === '6p' && !r.can12, `12p not offered below 40 kVA (unit ${r.unit})`);
r = sizeIndustrial({ phase: '33', loadKw: 100, loadType: 'ctrl', rect: '12pf', minutes: 15, blocks: 32 });
ok(r.rect === '12pf' && r.batt && r.batt.vNom === 384, `100 kW 12p+filter, battery 384 V ${r.batt.strings} × ${r.batt.ah} Ah`);
ok(sizeIndustrial({ phase: '33', loadKw: 0 }) === null, 'no load → null');
process.exit(fail ? 1 : 0);
