// 站内搜索的匹配逻辑（浏览器里运行；顶部搜索框和 /search/ 页共用）。
// 输入里的"数值 + 单位"会被识别成规格目标：3kVA / 5kW / 800W → 功率，10kWh → 能量，100Ah → 容量，48V → 电压；
// 其余文字按词匹配型号、栏目名（三种语言）、品类。所有词都要命中（AND）；型号命中的排前面，规格越接近目标越靠前。
const norm = (s) => String(s || '').normalize('NFKC').toLowerCase();
const flat = (s) => norm(s).replace(/[^a-z0-9Ѐ-ӿ一-鿿]+/g, '');

const UNIT_RE = /(\d+(?:[.,]\d+)?)\s*(kva|ква|kw|квт|kwh|квт·?ч|квтч|wh|втч|va|ва|w|вт|ah|а·?ч|ач|mah|v|в)(?![a-zа-я])/giu;
const UNIT_MAP = {
  kva: ['pw', 1], 'ква': ['pw', 1], kw: ['pw', 1], 'квт': ['pw', 1], va: ['pw', 0.001], 'ва': ['pw', 0.001], w: ['pw', 0.001], 'вт': ['pw', 0.001],
  kwh: ['e', 1], 'квт·ч': ['e', 1], 'квтч': ['e', 1], wh: ['e', 0.001], 'втч': ['e', 0.001],
  ah: ['ah', 1], 'а·ч': ['ah', 1], 'ач': ['ah', 1], mah: ['ah', 0.001], v: ['v', 1], 'в': ['v', 1],
};

export function parseQuery(q) {
  const targets = {};
  let rest = norm(q).replace(UNIT_RE, (all, num, unit) => {
    const u = UNIT_MAP[unit] || UNIT_MAP[unit.replace(/·/g, '')];
    if (!u) return all;
    const v = parseFloat(num.replace(',', '.')) * u[1];
    if (v > 0) targets[u[0]] = v;
    return ' ';
  });
  const words = rest.split(/[\s,;/|+]+/).map((w) => w.trim()).filter((w) => w.length > 0 && !/^[-–—.]+$/.test(w));
  return { words, targets };
}

// 词尾简单去掉（batteries → batter，conditioner → condition，baterías → bater），让单复数、词形变化也能命中
const stem = (w) => (w.length < 5 ? w : w.replace(/(ies|es|s|ers|er|ing|ías|ía|as|os|ы|и|ов|ей|ам|ах|ой|ая|ый|ий)$/u, ''));
const metricOf = (it, k) => (k === 'pw' ? it.pw || it.cool || 0 : it[k] || 0);

// opts: { q, cat（栏目 key 或分组 key）, r: { pw:[min,max], e:[..], ah:[..], cool:[..] }, v（电压，精确值）, sort: 'rel'|'asc'|'desc' }
export function runSearch(index, opts = {}) {
  const { words, targets } = parseQuery(opts.q || '');
  const r = opts.r || {};
  const out = [];
  for (const it of index.items) {
    if (opts.cat && !(it.c.includes(opts.cat) || it.g === opts.cat)) continue;
    let ok = true;
    for (const [k, [lo, hi]] of Object.entries(r)) {
      if (lo === '' && hi === '') continue;
      const v = it[k] || 0;
      if (!v || (lo !== '' && v < +lo) || (hi !== '' && v > +hi)) { ok = false; break; }
    }
    if (!ok) continue;
    if (opts.v && Math.abs((it.v || 0) - +opts.v) > 0.01) continue;
    let score = 0;
    const fm = flat(it.m);
    for (const w of words) {
      const fw = flat(w);
      if (fw && fm === fw) score += 120;
      else if (fw && fm.startsWith(fw)) score += 70;
      else if (fw && fw.length >= 2 && fm.includes(fw)) score += 45;
      else if (it.h.includes(w) || (stem(w) !== w && it.h.includes(stem(w)))) score += 12;
      else if (fw.length >= 3 && flat(it.h).includes(fw)) score += 8;
      else { ok = false; break; }
    }
    if (!ok) continue;
    let near = 0;
    for (const [k, t] of Object.entries(targets)) {
      const v = metricOf(it, k);
      if (!v) { ok = false; break; }
      const ratio = v / t;
      const tol = k === 'v' ? 0.12 : 0.5;
      if (Math.abs(Math.log(ratio)) > Math.log(1 + tol)) { ok = false; break; }
      const d = Math.abs(Math.log(ratio));
      score += 60 - d * 80;
      near += d;
    }
    if (!ok) continue;
    out.push({ it, score, near });
  }
  const key = (x) => metricOf(x.it, opts.sortKey || 'pw') || x.it.e || x.it.ah || x.it.cool || 0;
  if (opts.sort === 'asc') out.sort((a, b) => key(a) - key(b) || a.it.m.localeCompare(b.it.m));
  else if (opts.sort === 'desc') out.sort((a, b) => key(b) - key(a) || a.it.m.localeCompare(b.it.m));
  else out.sort((a, b) => b.score - a.score || a.near - b.near || (a.it.o ?? 0) - (b.it.o ?? 0) || key(a) - key(b) || a.it.m.localeCompare(b.it.m, undefined, { numeric: true }));
  return { list: out.map((x) => x.it), words, targets };
}

// 栏目名命中（只看文字，不看数值）
export function matchPages(index, q) {
  const { words } = parseQuery(q);
  if (!words.length) return [];
  return index.pages.filter((p) => words.every((w) => p.h.includes(w) || p.h.includes(stem(w)) || (flat(w).length >= 3 && flat(p.h).includes(flat(w)))));
}

export const fmtNum = (x) => String(+(+x).toFixed(2));
