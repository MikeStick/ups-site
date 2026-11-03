// 机架式电池选型引擎的检查：node scripts/test-rackbatt-engine.mjs
import { sizeRack } from '../src/lib/rackbatt-engine.mjs';
let fail = 0;
const ok = (c, m) => { if (!c) { fail++; console.error('✗', m); } else console.log('✓', m); };
let r = sizeRack({ mode: 'kwh', kwh: 10 });
ok(r.n === 3 && r.usableKwh >= 10, `10 kWh usable → ${r.n} × 5.12 kWh (${r.usableKwh} usable)`);
r = sizeRack({ mode: 'load', loadKw: 5, hours: 4 });
ok(r.usableKwh * 0.95 / 5 >= 4 - 0.05 && r.hours >= 4, `5 kW × 4 h → ${r.n} modules, ${r.hours} h`);
r = sizeRack({ mode: 'load', loadKw: 15, hours: 0.5 });
ok(r.byCurrent, `15 kW for 30 min is limited by current → ${r.n} modules (energy needs ${r.nE})`);
r = sizeRack({ mode: 'kwh', kwh: 100 });
ok(r.groups === 2 && r.cabinets >= 2, `100 kWh → ${r.n} modules, ${r.groups} groups, ${r.cabinets} cabinets`);
r = sizeRack({ mode: 'kwh', kwh: 20, mod: { v: 51.2, ah: 200, kwh: 10.24, maxA: 150, u: 4, kg: 85 } });
ok(r.n === 3 && r.kg === 255, `200 Ah modules → ${r.n} modules, ${r.kg} kg`);
ok(sizeRack({ mode: 'kwh', kwh: 0 }) === null, 'zero → null');
process.exit(fail ? 1 : 0);
