import { sizeHv, HV_GENERIC, levelOf } from '../src/lib/hvcab-engine.mjs';
let bad = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) bad++; };
let r = sizeHv({ kw: 10, hours: 1, models: HV_GENERIC });
ok(r.level === 204.8 && r.mod.m === 'R204.8V100AH' && r.n === 1, `10 kW × 1 h auto → 204.8 V, ${r.mod.m} × ${r.n} (need ${r.need} kWh, ${r.amps} A)`);
r = sizeHv({ kw: 10, hours: 2, models: HV_GENERIC });
ok(r.totalKwh >= r.need && r.n === 1 && r.mod.m === 'R204.8V150AH', `10 kW × 2 h → ${r.mod.m} × ${r.n} = ${r.totalKwh} kWh`);
r = sizeHv({ kw: 40, hours: 0.5, models: HV_GENERIC });
ok(r.level === 409.6 && r.totalKwh >= r.need && r.n * r.mod.maxA >= r.amps, `40 kW × 30 min → 409.6 V ${r.mod.m} × ${r.n} (${r.amps} A, byCurrent ${r.byCurrent})`);
r = sizeHv({ kw: 30, hours: 0.25, level: 204.8, models: HV_GENERIC });
ok(r.n * r.mod.maxA >= r.amps && r.mod.v === 204.8, `30 kW × 15 min @204.8 → current ok ${r.mod.m} × ${r.n} (${r.amps} A)`);
r = sizeHv({ kw: 10, hours: 1, level: 409.6, models: HV_GENERIC.filter((m) => m.v === 204.8) });
ok(r.switched && r.level === 204.8, 'missing level → switch');
r = sizeHv({ kw: 200, hours: 4, models: HV_GENERIC });
ok(r.overPar, `200 kW × 4 h → over parallel (${r.n})`);
ok(sizeHv({ kw: 0, hours: 1, models: HV_GENERIC }) === null, 'zero → null');
ok(levelOf(192) === 204.8 && levelOf(400) === 409.6 && levelOf(48) === 0, 'levelOf');
if (bad) { console.log(bad + ' failed'); process.exit(1); }
