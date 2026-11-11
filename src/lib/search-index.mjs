// 站内搜索索引：构建时从 products.json 生成，/[lang]/search.json 输出给顶部搜索框，/[lang]/search/ 页直接内嵌。
// 每个产品：链接、图片、型号、所属栏目、规格（功率 kVA/kW、能量 kWh、容量 Ah、电压 V、制冷量 kW）和一段用来匹配文字的 haystack。
// 栏目名称三种语言都放进 haystack：俄语客户在英文页面输入 "аккумулятор" 也能搜到。
import { LANGS } from '../config.mjs';
import { term } from '../i18n.mjs';
import { catalog } from './catalog.mjs';
import { typesOf, capacityOf, invKw, essSpec, ciSpec, battModule, hvModule, pbModule } from './category.mjs';
import { pacSpec } from './pac-engine.mjs';
import { cabSpec } from './cab-engine.mjs';
import { vrlaModule } from './vrla-engine.mjs';
import { powerW } from './power.mjs';

const r2 = (x) => (x > 0 ? Math.round(x * 100) / 100 : 0);
const fmt = (x) => String(+(+x).toFixed(2));
const fmtVa = (va) => (va >= 1000 ? `${fmt(va / 1000)} kVA` : `${va} VA`);

// 按产品所属的第一个栏目取规格（和首页"规格范围"用的是同一套解析函数）
function specOf(key, unit, p) {
  const s = {};
  if (unit === 'dc') { const w = powerW(p); if (w) { s.pw = r2(w / 1000); s.label = `${w} W`; } }
  else if (unit === 'va') { const c = capacityOf(p); if (c.va) { s.pw = r2(c.va / 1000); s.label = fmtVa(c.va) + (c.w ? ` / ${c.w >= 1000 ? `${fmt(c.w / 1000)} kW` : `${c.w} W`}` : ''); } }
  else if (unit === 'kw') { const kw = invKw(p); if (kw) { s.pw = r2(kw); s.label = `${fmt(kw)} kW`; } }
  else if (unit === 'kwh') {
    const m = key === 'homeess' ? essSpec(p) : key === 'ciess' ? ciSpec(p) : key === 'hvcab' ? hvModule(p) : battModule(p);
    if (m.kwh) s.e = r2(m.kwh); if (m.kw) s.pw = r2(m.kw); if (m.v) s.v = r2(m.v); if (m.ah) s.ah = r2(m.ah);
    s.label = [s.v && `${fmt(s.v)} V`, s.ah && `${fmt(s.ah)} Ah`, s.e && `${fmt(s.e)} kWh`, key !== 'wall' && key !== 'floor' && key !== 'rackbatt' && key !== 'hvcab' && s.pw && `${fmt(s.pw)} kW`].filter(Boolean).join(' · ');
  }
  else if (unit === 'ah' || unit === 'ah2') { const m = vrlaModule(p); if (m.ah) s.ah = r2(m.ah); s.v = m.v || (unit === 'ah2' ? 2 : 12); if (s.ah) s.e = r2(s.v * s.ah / 1000); s.label = [`${fmt(s.v)} V`, s.ah && `${fmt(s.ah)} Ah`].filter(Boolean).join(' · '); }
  else if (unit === 'v') { const m = pbModule(p); if (m.v) s.v = r2(m.v); if (m.ah) s.ah = r2(m.ah); if (m.wh) s.e = r2(m.wh / 1000); s.label = [s.v && `${fmt(s.v)} V`, s.ah && `${fmt(s.ah)} Ah`].filter(Boolean).join(' · '); }
  else if (unit === 'pac') { const m = pacSpec(p); if (m && m.cool) { s.cool = r2(m.cool); s.label = `${fmt(m.cool)} kW`; } }
  else if (unit === 'cab') { const m = cabSpec(p); if (m && m.dcv) s.label = `${m.dcv} V DC`; }
  if (!s.label) delete s.label;
  return s;
}

const norm = (s) => String(s || '').normalize('NFKC').toLowerCase();

// 客户常用的叫法（栏目名里不一定有）：三种语言混在一起，只用来匹配
const KEYWORDS = {
  mini: 'mini ups dc ups router ups wifi onu poe 12v 9v usb power bank mini ибп роутер',
  offline: 'offline ups line interactive backup ups home ups computer ups pc ups ups respaldo ибп резервный линейно-интерактивный',
  online: 'online ups double conversion high frequency tower ups ups en línea онлайн ибп двойного преобразования',
  aio: 'all in one lithium ups integrated ups ups litio ибп литий',
  rack: 'rack ups rackmount 19 inch server ups ups rack стоечный ибп',
  modular: 'modular ups data center ups hot swap ups modular модульный ибп',
  industrial: 'industrial ups low frequency transformer ups isolation ups industrial промышленный ибп трансформаторный',
  inverter: 'solar inverter hybrid inverter off grid on grid pv inverter inversor solar híbrido инвертор солнечный гибридный',
  homeess: 'home energy storage all in one ess battery inverter powerwall almacenamiento hogar накопитель для дома',
  ciess: 'commercial industrial energy storage c&i ess container bess almacenamiento comercial промышленный накопитель',
  wall: 'wall battery powerwall lifepo4 lithium battery 48v batería pared литиевая аккумулятор настенный',
  floor: 'floor battery lifepo4 lithium battery stand batería litio аккумулятор напольный',
  rackbatt: 'rack battery server rack battery 48v lifepo4 telecom batería rack стоечный аккумулятор',
  hvcab: 'high voltage battery hv battery cabinet lithium cabinet batería alto voltaje высоковольтный аккумулятор шкаф',
  pbr: 'lithium replacement drop in lifepo4 12v battery lead acid replacement batería litio 12v литиевая замена свинцово',
  vrla: 'lead acid battery vrla agm sealed battery 12v ups battery batería plomo ácido свинцово-кислотный аккумулятор акб',
  vrla2: '2v cell lead acid battery opzv vrla 2v batería 2v аккумулятор 2в',
  cab: 'battery cabinet battery rack ups battery box gabinete baterías батарейный шкаф',
  pac: 'precision air conditioner air conditioning aircon crac cooling server room in row aire acondicionado precisión кондиционер прецизионный',
  idm: 'micro data center micro module data center modular data center rack cabinet aisle containment micro centro de datos микро цод модульный цод',
  dem: 'monitoring dcim environment monitoring sensors temperature humidity monitoreo мониторинг датчики',
};

export function searchIndex(lang, products) {
  const groupsBy = Object.fromEntries(LANGS.map((l) => [l, catalog(l)]));
  const groups = groupsBy[lang];
  const items = groups.flatMap((g) => g.items.filter((it) => it.f).map((it) => ({ ...it, g: g.key, gh: g.h })));
  const labelsOf = (key) => LANGS.map((l) => groupsBy[l].flatMap((g) => g.items).find((x) => x.key === key)?.label).filter(Boolean);
  const groupLabelsOf = (gk) => LANGS.map((l) => groupsBy[l].find((g) => g.key === gk)?.h).filter(Boolean);
  const out = [];
  for (const p of products) {
    const its = items.filter((it) => it.f(p));
    if (!its.length || !p.slug) continue; // 不在任何栏目里的产品网站上也不显示
    const first = its[0];
    const sp = specOf(first.key, first.unit, p);
    const types = typesOf(p);
    const hay = [p.model, p.brand, ...types, ...types.flatMap((t) => LANGS.map((l) => term(t, l))),
      ...its.flatMap((it) => [...labelsOf(it.key), ...groupLabelsOf(it.g), KEYWORDS[it.key]]), sp.label,
      ...(Array.isArray(p.outputPorts) ? p.outputPorts.map((o) => `${o.type || ''} ${o.voltage || ''}`) : [])].filter(Boolean);
    out.push({
      u: `/${lang}/p/${p.slug}/`, m: String(p.model || ''), img: (p.images && p.images[0]) || '',
      c: its.map((it) => it.key), cl: first.label, g: first.g, o: items.indexOf(first), ...sp,
      h: norm([...new Set(hay)].join(' | ')),
    });
  }
  // 栏目本身也能被搜到（输入"precision air" 直接出精密空调栏目）
  const pages = groups.flatMap((g) => g.items.filter((it) => !it.sub).map((it) => ({
    u: `/${lang}/${it.page}`, l: it.label, g: g.key, gh: g.h, k: it.key,
    n: out.filter((x) => x.c.includes(it.key)).length,
    h: norm([...labelsOf(it.key), ...groupLabelsOf(g.key), KEYWORDS[it.key]].join(' | ')),
  })));
  const cats = groups.map((g) => ({ k: g.key, h: g.h, items: g.items.filter((it) => it.f).map((it) => ({ k: it.key, l: it.label, n: out.filter((x) => x.c.includes(it.key)).length })).filter((x) => x.n) })).filter((g) => g.items.length);
  return { items: out, pages, cats };
}
