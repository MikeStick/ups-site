// News（新闻中心）预览用的示例稿件。上线后由 CRM 的"近期动态"提供同样结构的数据。
// 每篇：slug, date, cat（projects / products / company / events）, cover, place?, title{}, excerpt{}, blocks[]
// blocks 类型：p 段落 · h 小标题 · img 单图(+cap) · pair 两图并排 · gallery 横滑图集 · yt YouTube（id + 封面）· quote 引言 · stats 数字 · links 相关产品卡片
// 文字只写了英文（预览），es / ru 暂时回退英文。内容取自案例页和本周新上的产品类目。
const C = (n) => `/img/cases/${n}.jpg`;
export const NEWS_SAMPLE = [
  {
    slug: 'cooling-and-datacenter-range', date: '2026-11-10', cat: 'products', cover: '/img/pac/hero.webp',
    title: { en: 'New on the website: a complete Cooling & Datacenter range' },
    excerpt: { en: 'Precision air conditioning, IDM Ⅱ micro data centres and the SK-DEM monitoring host now have their own section — with online sizing tools that link cooling, UPS, batteries and cabinets.' },
    blocks: [
      { t: 'p', lead: true, en: 'Server rooms rarely need just one product. This week we brought precision cooling, prefabricated micro data centres and power & environment monitoring together in a new Cooling & Datacenter section, next to our UPS and battery ranges.' },
      { t: 'stats', items: [['50', 'precision AC models'], ['3', 'micro-module formats'], ['≤ 48', 'IT racks per module'], ['1U', 'SK-DEM monitoring host']] },
      { t: 'h', en: 'One configurator, every subsystem' },
      { t: 'p', en: 'The IDM configurator starts from the number of IT racks and the power per rack. It picks the format, sizes in-row or rack-mount cooling, chooses a rack-mount or modular UPS, calculates the 12 V batteries and battery cabinets — and draws the layout.' },
      { t: 'img', src: '/img/idm/explode-en.webp', fit: 'contain', cap: { en: 'IDM2 dual-row micro-module: cabinets, in-row cooling, UPS row-head cabinet, sealed cold aisle and roof panels linked to the fire system.' } },
      { t: 'quote', en: 'UPS, batteries, cooling, cabinets and monitoring — now sized together on one page.' },
      { t: 'pair', items: [{ src: '/img/pac/hero.webp', cap: { en: 'Precision air conditioning, 3.5–100 kW' } }, { src: '/img/dem/v3b.webp', cap: { en: 'SK-DEM monitoring platform V3.0' } }] },
      { t: 'links', items: ['precision-ac/', 'micro-data-center/', 'dcim-monitoring/'] },
    ],
  },
  {
    slug: 'indonesia-pv-storage-phase-2', date: '2025-06-18', cat: 'projects', cover: C('indonesia-2-1'), place: 'Indonesia',
    title: { en: 'Indonesia PV + storage project: Phase 2 handed over' },
    excerpt: { en: 'One year after Phase 1, SKE engineers commissioned the second 2 MW phase of a rooftop solar-plus-storage project in Indonesia.' },
    blocks: [
      { t: 'p', lead: true, en: 'The second 2 MW phase of our solar-plus-storage project in Indonesia has been installed, commissioned and handed over by the SKE team on site — exactly one year after Phase 1.' },
      { t: 'stats', items: [['2 MW', 'Phase 2'], ['4 MW', 'total with Phase 1'], ['12', 'months between phases']] },
      { t: 'gallery', items: [C('indonesia-2-2'), C('indonesia-2-3'), C('indonesia-2-4'), C('indonesia-2-5'), C('indonesia-2-6')] },
      { t: 'h', en: 'On site, start to finish' },
      { t: 'p', en: 'Our engineers worked with the local partner team on the rooftop array, the energy-storage cabinets and power conversion, then ran commissioning and handover on site.' },
      { t: 'yt', id: '', poster: C('indonesia-2-1'), cap: { en: 'Video placeholder — paste a YouTube link in the CRM' } },
      { t: 'links', items: ['ci-ess/', 'solar-inverters/'] },
    ],
  },
  {
    slug: 'sco-summit-2025', date: '2025-08-31', cat: 'events', cover: C('sco-2025-1'), place: 'Tianjin, China',
    title: { en: 'SCO Summit 2025: more than 100 SKE UPS on standby' },
    excerpt: { en: 'Ten years after the 2015 SCO meeting, SKE again supplied the machine-room and power equipment for the 25th Shanghai Cooperation Organisation Summit in Tianjin.' },
    blocks: [
      { t: 'p', lead: true, en: 'Ten years after the 2015 SCO meeting, SKE again supplied the machine-room and power equipment for the 25th Shanghai Cooperation Organisation Summit, held in Tianjin on 31 August 2025.' },
      { t: 'stats', items: [['100+', 'UPS units'], ['3,000+', 'batteries'], ['2015 → 2025', 'second SCO summit']] },
      { t: 'pair', items: [{ src: C('sco-2025-2'), cap: { en: 'Power back-up on site' } }, { src: C('sco-2025-3'), cap: { en: 'Summit venue' } }] },
      { t: 'quote', en: 'Completed as planned throughout the event.' },
      { t: 'links', items: ['online-ups/', 'industrial-ups/'] },
    ],
  },
  {
    slug: 'xinjiang-meteorological-data-centre', date: '2024-08-20', cat: 'projects', cover: C('xinjiang-met-2'), place: 'Urumqi, Xinjiang, China',
    title: { en: 'IDM2 double-row micro-module for the Xinjiang Meteorological Bureau' },
    excerpt: { en: 'A double-row micro-module data centre with SKE modular UPS for the Desert Meteorology Research Institute in Urumqi.' },
    blocks: [
      { t: 'p', lead: true, en: 'In July and August 2024 we built an IDM2 double-row micro-module data centre for the Desert Meteorology Research Institute in the Xinjiang Meteorological Bureau compound, powered by SKE modular UPS.' },
      { t: 'stats', items: [['4', 'double-row cold aisles'], ['20', 'in-row precision AC'], ['2', 'room precision AC'], ['2', 'SKE modular UPS']] },
      { t: 'gallery', items: [C('xinjiang-met-1'), C('xinjiang-met-3'), C('xinjiang-met-4')] },
      { t: 'links', items: ['micro-data-center/', 'modular-ups/', 'precision-ac/'] },
    ],
  },
  {
    slug: 'battery-cabinets-c-series', date: '2026-11-10', cat: 'products', cover: '/img/cab/c-16.webp', coverFit: 'contain',
    title: { en: 'C-series battery cabinets: one cabinet, one battery string' },
    excerpt: { en: 'Twelve cabinet sizes for 1 to 40 × 12 V VRLA batteries, with a planner that pairs batteries and cabinets to your UPS.' },
    blocks: [
      { t: 'p', lead: true, en: 'From a single-battery box to a 40-battery, 480 V cabinet: the new C-series holds one series string of 12 V AGM or gel batteries up to 120 Ah.' },
      { t: 'img', src: '/img/cab/c-16.webp', fit: 'contain', cap: { en: 'C-16: 16 × 12 V batteries, 192 V DC, four levels.' } },
      { t: 'links', items: ['batteries/battery-cabinet/', 'batteries/vrla/'] },
    ],
  },
  {
    slug: 'partners-worldwide', date: '2025-03-20', cat: 'company', cover: C('partners-2'),
    title: { en: '100+ agents and partners worldwide' },
    excerpt: { en: 'Local partners in more than 100 locations — and 38 agents across 7 regions in China — give SKE customers local sales and service.' },
    blocks: [
      { t: 'p', lead: true, en: 'More than 100 agents and partners worldwide, and 38 agents across 7 regions in China, give our customers local sales and service.' },
      { t: 'pair', items: [{ src: C('partners-1') }, { src: C('partners-3') }] },
      { t: 'yt', id: '', poster: C('partners-1'), cap: { en: 'Video placeholder — paste a YouTube link in the CRM' } },
    ],
  },
  {
    slug: 'shantou-hospital', date: '2024-12-15', cat: 'projects', cover: C('shantou-hospital-2'), place: 'Shantou, Guangdong, China',
    title: { en: 'New hospital campus data room on an IDM2 single-row module' },
    excerpt: { en: 'An IDM2 single-row micro-module data room for the new campus of the Chaoyang District TCM Hospital in Shantou.' },
    blocks: [
      { t: 'p', lead: true, en: 'In December 2024 we delivered an IDM2 single-row micro-module data room for the new campus of the Chaoyang District Hospital of Traditional Chinese Medicine in Shantou.' },
      { t: 'stats', items: [['4', 'in-row precision AC'], ['4', 'room precision AC'], ['2 + 1', 'integrated + modular UPS'], ['1', 'battery monitoring system']] },
      { t: 'gallery', items: [C('shantou-hospital-1'), C('shantou-hospital-3')] },
      { t: 'links', items: ['modular-ups/', 'micro-data-center/'] },
    ],
  },
];
export const NEWS_CATS = ['projects', 'products', 'events', 'company'];
