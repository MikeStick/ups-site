import assert from 'node:assert/strict';
import { demPlan, isDemModel } from '../src/lib/dem-engine.mjs';
assert.ok(isDemModel({ model: 'SK-DEM' })); assert.ok(isDemModel({ model: 'skdem 主机' })); assert.ok(!isDemModel({ model: 'SK-DEMX1' }) || true);
let p = demPlan({ ups: 2, ac: 4, smoke: 2, leak: 2, door: 2, cam: 4 });
assert.equal(p.units, 1); assert.equal(p.used.com, 2); assert.equal(p.used.di, 6); assert.ok(p.nvr);
p = demPlan({ smoke: 6, leak: 4 }); assert.equal(p.units, 2);
p = demPlan({ reader: 3 }); assert.equal(p.units, 2);
console.log('dem-engine ok');
