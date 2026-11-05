import { sizeCi, CI_GENERIC } from '../src/lib/cie-engine.mjs';
let bad = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) bad++; };
let r = sizeCi({ app: 'peak', kw: 100, hours: 2, cool: 'any', models: CI_GENERIC });
ok(r.totalKw >= 100 && r.usableKwh * 0.95 >= 200 - 1, `peak 100 kW × 2 h → ${r.mod.m} × ${r.n} (${r.totalKwh} kWh, by ${r.by})`);
r = sizeCi({ app: 'peak', kw: 50, hours: 1, cool: 'any', models: CI_GENERIC });
ok(r.mod.m === 'DZ062107B' && r.n === 1, `peak 50 kW × 1 h → ${r.mod.m}`);
r = sizeCi({ app: 'backup', kw: 200, hours: 2, cool: 'any', models: CI_GENERIC });
ok(r.mod.sts && !r.optMissing, `backup 200 kW × 2 h → STS model ${r.mod.m} × ${r.n}`);
r = sizeCi({ app: 'pv', kw: 100, hours: 2, pvKw: 300, cool: 'liquid', models: CI_GENERIC });
ok(r.mod.m === 'DZ105233L2' && r.n >= 3 && r.by === 'pv', `pv 300 kWp liquid → ${r.mod.m} × ${r.n} (by ${r.by})`);
r = sizeCi({ app: 'peak', kw: 500, hours: 2, cool: 'liquid', models: CI_GENERIC });
ok(r.mod.cool === 'liquid' && r.alt && r.alt.mod.cool === 'air', `liquid 500 kW × 2 h → ${r.mod.m} × ${r.n}, alt ${r.alt.mod.m} × ${r.alt.n}`);
r = sizeCi({ app: 'backup', kw: 100, hours: 1, cool: 'any', models: CI_GENERIC.filter((m) => !m.sts) });
ok(r.optMissing, 'no STS model → optMissing');
r = sizeCi({ app: 'peak', kw: 2000, hours: 2, cool: 'any', models: CI_GENERIC });
ok(r.overPar, `2 MW × 2 h → over parallel (${r.n})`);
ok(sizeCi({ app: 'peak', kw: 0, hours: 2, models: CI_GENERIC }) === null, 'zero → null');
if (bad) { console.log(bad + ' failed'); process.exit(1); }
