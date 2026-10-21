// 产品品类：客户档案系统里 type 字段（中文）决定产品出现在哪个栏目
export const OFFLINE_TYPES = ['离线式UPS', '离线式锂电UPS', '在线互动式UPS'];
export const isOffline = (p) => OFFLINE_TYPES.includes(p.type);
export const isLineInteractive = (p) => p.type === '在线互动式UPS';
export const isLithiumOffline = (p) => p.type === '离线式锂电UPS';
// 列表筛选 / 标签用：off = 离线式，lion = 离线式锂电，li = 在线互动式
export const offKind = (p) => (isLineInteractive(p) ? 'li' : isLithiumOffline(p) ? 'lion' : 'off');
// Mini UPS 栏目：除离线式 / 在线互动式以外的已发布产品（以后加品类时在这里分流）
export const isMini = (p) => !isOffline(p);

// 容量：从"额定功率 + 单位"或"容量"文字（如 1000VA/600W、1.5kVA/900W）里解析 VA 和 W
export function capacityOf(p) {
  const txt = `${p.ratedPower || ''}${p.ratedPowerUnit || ''} ${p.outputPower || ''}`;
  const num = (re) => { const m = txt.match(re); return m ? parseFloat(m[1]) * (/k/i.test(m[2] || '') ? 1000 : 1) : 0; };
  let va = num(/(\d+(?:\.\d+)?)\s*(k?)VA/i);
  // 没写单位时（如额定功率只填了 400）：离线式产品按 VA 理解，再不行用型号里的数字（GF400 → 400 VA）
  if (!va && isOffline(p)) {
    const bare = String(p.ratedPower || '').match(/^\s*(\d+(?:\.\d+)?)\s*$/);
    const unit = String(p.ratedPowerUnit || '');
    if (bare && !/w/i.test(unit)) va = parseFloat(bare[1]) * (/k/i.test(unit) ? 1000 : 1);
    if (!va) { const m = String(p.model || '').match(/(\d{3,4})/); if (m && +m[1] >= 300 && +m[1] <= 3000) va = +m[1]; }
  }
  let w = num(/(\d+(?:\.\d+)?)\s*(k?)W(?!h)/i);
  if (!w && va) w = Math.round(va * 0.6);
  return { va, w };
}

// 容量显示：1000 VA / 600 W、1.5 kVA / 900 W
export function fmtCap(c) {
  if (!c || !c.va) return '';
  const va = c.va >= 1000 ? `${c.va / 1000} kVA` : `${c.va} VA`;
  return c.w ? `${va} / ${c.w} W` : va;
}

// 同系列型号：同一栏目里字母前缀相同的型号（GF400 / GF600 / GF1000；Gi600 / Gi1000 / Gi1200 PRO），按容量数字排序
const seriesKey = (p) => {
  const m = String(p.model || '').trim().toUpperCase().match(/^([A-Z]+)[-\s]?(\d+(?:\.\d+)?)(.*)$/);
  return m ? { key: `${isOffline(p) ? 'o' : 'm'}|${m[1]}`, n: parseFloat(m[2]), sfx: m[3].trim() } : null;
};
export function seriesOf(p, all) {
  const me = seriesKey(p);
  if (!me) return [];
  const list = all.map((x) => ({ x, k: seriesKey(x) })).filter((o) => o.k && o.k.key === me.key)
    .sort((a, b) => a.k.n - b.k.n || a.k.sfx.localeCompare(b.k.sfx)).map((o) => o.x);
  return list.length >= 2 ? list : [];
}

// 列表默认排序用的系列名：GF400 → "GF|"，同系列排在一起；型号不是"字母+数字"格式的按型号本身
export function seriesName(p) {
  const k = seriesKey(p);
  return k ? k.key.slice(2) : String(p.model || '').toUpperCase();
}
