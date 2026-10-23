// 产品品类：客户档案系统里 type 字段（中文）决定产品出现在哪个栏目
export const OFFLINE_TYPES = ['离线式UPS', '离线式锂电UPS', '在线互动式UPS'];
export const isOffline = (p) => OFFLINE_TYPES.includes(p.type);
export const isLineInteractive = (p) => p.type === '在线互动式UPS';
export const isLithiumOffline = (p) => p.type === '离线式锂电UPS';
// 列表筛选 / 标签用：off = 离线式，lion = 离线式锂电，li = 在线互动式
export const offKind = (p) => (isLineInteractive(p) ? 'li' : isLithiumOffline(p) ? 'lion' : 'off');
// 机架式 UPS 栏目（真双变换在线式，机架安装）
export const RACK_TYPES = ['机架式UPS', '机架式锂电UPS'];
export const isRack = (p) => RACK_TYPES.includes(p.type);
export const isRackLithium = (p) => p.type === '机架式锂电UPS';
// 列表筛选 / 标签用：li = 锂电，lr = 长机（外接电池），std = 标机（内置铅酸）
export const rackKind = (p) => (isRackLithium(p) ? 'li' : isLongRun(p) ? 'lr' : 'std');
// 标机（内置电池）/ 长机（外接电池组）：看"标机/长机"字段，没填时型号末尾带 L 的算长机（如 RT3KL）
export const isLongRun = (p) => (p.machineVariant ? /长/.test(p.machineVariant) : /\d\s*K?L\b/i.test(String(p.model || '')));
// Mini UPS 栏目：除离线式 / 在线互动式 / 机架式以外的已发布产品（以后加品类时在这里分流）
export const isMini = (p) => !isOffline(p) && !isRack(p);
// 机架高度（U）：型号 / 卖点里写了 2U、3U 就用它；否则从尺寸里找接近 44.45mm 整数倍的那个数（排除 19 英寸机箱的宽度）
export function rackUnits(p) {
  const m = `${p.model || ''} ${p.sellingPoints || ''} ${p.dimensions || ''}`.match(/\b([1-6])\s*U\b/);
  if (m) return +m[1];
  const nums = (String(p.dimensions || '').match(/\d+(?:\.\d+)?/g) || []).map(Number).filter((x) => x >= 40 && x <= 300);
  for (const x of nums.sort((a, b) => a - b)) {
    const u = Math.round(x / 44.45);
    if (u >= 1 && u <= 6 && Math.abs(x - u * 44.45) <= 8) return u;
  }
  return 0;
}

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
  // 机架式：型号里的 1K / 3KL / 10K → kVA
  if (!va && isRack(p)) { const m = String(p.model || '').match(/(\d+(?:\.\d+)?)\s*K/i); if (m && +m[1] > 0 && +m[1] <= 40) va = +m[1] * 1000; }
  let w = num(/(\d+(?:\.\d+)?)\s*(k?)W(?!h)/i);
  const pf = parseFloat(String(p.powerFactor || p.outputPowerFactor || '').replace(',', '.'));
  if (!w && va && pf > 0 && pf <= 1) w = Math.round(va * pf);
  if (!w && va) w = Math.round(va * (isRack(p) ? 0.9 : 0.6));
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
  return m ? { key: `${isOffline(p) ? 'o' : isRack(p) ? 'r' : 'm'}|${m[1]}`, n: parseFloat(m[2]), sfx: m[3].trim() } : null;
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
