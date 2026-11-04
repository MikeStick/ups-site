import { sizeAio, aioOptions, AIO_GENERIC, runtimeH } from '../src/lib/aio-engine.mjs';
let bad = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) bad++; };
let r = sizeAio({ loadW: 500, hours: 4, models: AIO_GENERIC });
ok(r.model.w === 1000 && r.opt.n === 4 && !r.short, `500 W × 4 h → 1 kVA 4 batt (${r.model.m} ${r.opt.n}, ${r.runtime} h)`);
r = sizeAio({ loadW: 500, hours: 12, models: AIO_GENERIC });
ok(r.short && r.opt.wh === 5376 && r.model.w === 1000, `500 W × 12 h → short, biggest pack on smallest model (${r.runtime} h)`);
r = sizeAio({ loadW: 1500, hours: 1.5, models: AIO_GENERIC });
ok(r.model.w === 2000 && r.opt.n === 4, `1500 W × 1.5 h → 2 kVA 4 batt (${r.runtime} h)`);
r = sizeAio({ loadW: 3500, hours: 1, models: AIO_GENERIC });
ok(r.over && r.maxW === 3000, '3500 W → over');
ok(sizeAio({ loadW: 0, hours: 1, models: AIO_GENERIC }) === null, 'zero → null');
const o = aioOptions({ batterySpec: '2/4/6节，1792/3584/5376Wh', netWeight: '28/38.5/49（2/4/6节）' });
ok(o.length === 3 && o[0].n === 2 && o[2].wh === 5376 && o[1].kg === 38.5, 'parse batterySpec + weights ' + JSON.stringify(o));
const o2 = aioOptions({ extraSpecs: [{ label: '电池容量', value: '1792/3584/5376Wh（2/4/6节）' }] });
ok(o2.length === 3 && o2[2].n === 6, 'parse extraSpecs ' + JSON.stringify(o2));
const o3 = aioOptions({ batterySpec: '6节', extraSpecs: [{ label: '电池容量', value: '5376Wh' }], netWeight: '52' });
ok(o3.length === 1 && o3[0].n === 6 && o3[0].kg === 52, 'single option ' + JSON.stringify(o3));
ok(Math.abs(runtimeH(1792, 500) - 2.97) < 0.01, 'runtime 1792 Wh @500 W ≈ 2.97 h');
if (bad) { console.log(bad + ' failed'); process.exit(1); }
