// 产品品类：客户档案系统里的细分品类决定产品出现在哪个栏目。
// 一个产品可以同时属于多个品类：type（主品类，决定参数表 / 询价面板）+ extraTypes（同时属于，只影响出现在哪些栏目）
export const typesOf = (p) => [p.type, ...(Array.isArray(p.extraTypes) ? p.extraTypes : [])].filter(Boolean);
const has = (p, list) => typesOf(p).some((t) => list.includes(t));
// 只看主品类（产品页用：决定显示哪套参数表、哪种询价面板、面包屑回到哪个栏目）
export const primary = (p) => ({ ...p, extraTypes: [] });
export const OFFLINE_TYPES = ['离线式UPS', '离线式锂电UPS', '在线互动式UPS'];
export const isOffline = (p) => has(p, OFFLINE_TYPES);
export const isLineInteractive = (p) => (isOffline(p) && OFFLINE_TYPES.includes(p.type) ? p.type === '在线互动式UPS' : has(p, ['在线互动式UPS']));
export const isLithiumOffline = (p) => (isOffline(p) && OFFLINE_TYPES.includes(p.type) ? p.type === '离线式锂电UPS' : has(p, ['离线式锂电UPS']));
// 列表筛选 / 标签用：off = 离线式，lion = 离线式锂电，li = 在线互动式
export const offKind = (p) => (isLineInteractive(p) ? 'li' : isLithiumOffline(p) ? 'lion' : 'off');
// 机架式 UPS 栏目（真双变换在线式，机架安装）
export const RACK_TYPES = ['机架式UPS', '机架式锂电UPS'];
export const isRack = (p) => has(p, RACK_TYPES);
export const isRackLithium = (p) => has(p, ['机架式锂电UPS']);
// 列表筛选 / 标签用：li = 锂电，lr = 长机（外接电池），std = 标机（内置铅酸）
export const rackKind = (p) => (isRackLithium(p) ? 'li' : isLongRun(p) ? 'lr' : 'std');
// 标机（内置电池）/ 长机（外接电池组）：看"标机/长机"字段，没填时型号末尾带 L 的算长机（如 RT3KL）
export const isLongRun = (p) => (p.machineVariant ? /长/.test(p.machineVariant) : /\d\s*K?L\b/i.test(String(p.model || '')));
// 模块化 UPS 栏目
export const MODULAR_TYPES = ['模块化UPS', '机架式模块化UPS'];
export const isModular = (p) => has(p, MODULAR_TYPES);
export const isRackModular = (p) => has(p, ['机架式模块化UPS']);
// 光伏逆变器栏目：大类 = 光伏逆变器，或细分品类是混网 / 并网离网逆变器
export const INVERTER_TYPES = ['太阳能混网逆变器', '并网/离网逆变器'];
// CRM 里产品的大类存的是大类 id（ups / inverter / battery，自建大类是随机 id），旧数据可能是中文名，两种都认
export const isInverter = (p) => p.category === 'inverter' || p.category === '光伏逆变器' || has(p, INVERTER_TYPES);
// 类型：hybrid 混网（光伏 + 电池 + 电网）；并网/离网逆变器里有电池参数的算离网（off），没有的算并网（grid）
export function invKind(p) {
  if (has(p, ['太阳能混网逆变器'])) return 'hybrid';
  if (p.batteryVoltage || p.batteryType || p.offGridRatedApparentPower) return 'off';
  return 'grid';
}
// 额定功率（kW）：离网额定视在功率 → 并网最大视在功率 → 容量 → 型号里的 5K / 8KW / 10kW
export function invKw(p) {
  for (const t of [p.offGridRatedApparentPower, p.onGridMaxApparentPower, p.outputPower, p.ratedPower && `${p.ratedPower}${p.ratedPowerUnit || ''}`]) {
    const m = String(t || '').match(/(\d+(?:\.\d+)?)\s*(k?)\s*(?:VA|W)\b/i);
    if (m) { const v = parseFloat(m[1]) * (m[2] ? 1 : 0.001); if (v > 0.2 && v < 500) return Math.round(v * 100) / 100; }
  }
  const m = String(p.model || '').match(/(\d+(?:\.\d+)?)\s*K(?:W)?\b/i);
  return m ? +m[1] : 0;
}
// 输出相数：'split' = 120/240 V 分相，'3' = 三相，'1' = 单相
export function invPhase(p) {
  const t = `${p.outputVoltage || ''} ${p.phase || ''} ${p.model || ''}`;
  if (/120\s*\/\s*240|split/i.test(t)) return 'split';
  if (/38\d|40\d|41\d|three|3\s*-?\s*ph|三相/i.test(t)) return '3';
  return '1';
}
// 电池电压：48 V 等低压（≤ 60 V）= lv，高压电池 = hv
export function invBattV(p) {
  const n = (String(p.batteryVoltage || '').match(/\d+(?:\.\d+)?/g) || []).map(Number);
  return !n.length ? '' : Math.max(...n) <= 60 ? 'lv' : 'hv';
}
// 储能电池：大类 = 储能电池。已有栏目：机架式磷酸铁锂电池（/batteries/rack-lithium/）、壁挂式锂电池（/batteries/wall-lithium/）、落地式锂电池（/batteries/floor-lithium/）；
// 铅酸、家庭储能系统的栏目还没做：不进任何列表，产品页照常生成
export const isBattery = (p) => p.category === 'battery' || p.category === '储能电池';
export const isUpsCat = (p) => p.category === 'ups' || p.category === 'UPS不间断电源';
export const RACK_BATT_TYPES = ['机架式磷酸铁锂电池', '机架式锂电池'];
export const isRackBattery = (p) => has(p, RACK_BATT_TYPES);
// 壁挂式锂电池栏目（/batteries/wall-lithium/）
export const WALL_BATT_TYPES = ['壁挂式锂电池', '壁挂式磷酸铁锂电池'];
export const isWallBattery = (p) => has(p, WALL_BATT_TYPES);
// 家庭储能一体机（电池 + 逆变器一体）：壁挂式 / 落地式两个细分品类，合在一个栏目 /home-ess/
export const ESS_WALL_TYPES = ['壁挂式储能一体机'];
export const ESS_FLOOR_TYPES = ['落地式储能一体机'];
// 堆叠式（逆变器主机 + 一层层电池模块，每层约 5 kWh）：高压 / 低压两个细分品类，型号名会重复（都有 15kWh、20kWh），靠细分品类区分
export const ESS_STACK_HV_TYPES = ['高压堆叠式储能一体机'];
export const ESS_STACK_LV_TYPES = ['低压堆叠式储能一体机'];
export const isHomeEss = (p) => has(p, [...ESS_WALL_TYPES, ...ESS_FLOOR_TYPES, ...ESS_STACK_HV_TYPES, ...ESS_STACK_LV_TYPES]);
export const essMount = (p) => (has(p, [...ESS_STACK_HV_TYPES, ...ESS_STACK_LV_TYPES]) ? 'stack' : has(p, ESS_FLOOR_TYPES) ? 'floor' : 'wall');
export const essVolt = (p) => (has(p, ESS_STACK_HV_TYPES) ? 'hv' : has(p, ESS_STACK_LV_TYPES) ? 'lv' : '');
// 参数：电池 kWh、逆变器 kW（型号名就是"2.5kWh + 3kW"这种写法，字段没填时从型号里读）、电池电压 / Ah、尺寸、重量
export function essSpec(p) {
  const name = String(p.model || '');
  let kwh = num1(p.moduleMaxEnergy || p.batteryCapacity);
  if (kwh > 100) kwh /= 1000;
  const mk = name.match(/(\d+(?:\.\d+)?)\s*kWh/i);
  if (!kwh && mk) kwh = +mk[1];
  const v = num1(p.moduleVoltage || p.batteryVoltage), ah = num1(p.moduleCapacity);
  if (!kwh && v && ah) kwh = Math.round(v * ah / 10) / 100; // 规格书写的是 2.5 / 5 kWh，填了就按填的显示
  let kw = num1(p.ratedPower || p.outputPower || p.inverterPower);
  if (kw > 100) kw /= 1000;
  const mw = name.match(/(\d+(?:\.\d+)?)\s*kW(?!h)/i);
  if (mw && (!kw || /w/i.test(String(p.ratedPowerUnit || '')) && kw > 100)) kw = +mw[1];
  if (!kw && mw) kw = +mw[1];
  const dims = (String(p.dimensions || p.moduleDimensions || '').match(/\d+(?:\.\d+)?/g) || []).map(Number).slice(0, 3);
  const mount = essMount(p);
  // 堆叠层数：每层约 5.12 kWh
  const layers = mount === 'stack' && kwh ? Math.max(1, Math.round(kwh / 5.12)) : 0;
  return { mount, volt: essVolt(p), layers, kwh, kw, v, ah, kg: num1(p.netWeight || p.moduleWeight), dims: dims.length === 3 ? dims : [] };
}
// 工商业户外储能柜（电池 + PCS 一体，IP54）：风冷 / 液冷两个细分品类，栏目 /ci-ess/（菜单"光伏与储能"栏）
export const CI_AIR_TYPES = ['风冷工商业储能柜'];
export const CI_LIQ_TYPES = ['液冷工商业储能柜'];
export const isCiEss = (p) => has(p, [...CI_AIR_TYPES, ...CI_LIQ_TYPES]);
// 选配（光伏 DC-DC / STS）：参数里有对应条目且值不是"/"就算支持
function ciOption(p, re) {
  const ex = Array.isArray(p.extraSpecs) ? p.extraSpecs : [];
  const hit = ex.filter((x) => re.test(`${x.label || ''}`));
  if (hit.length) return hit.some((x) => { const v = String(x.value || '').trim(); return v && !/^[\/—–-]+$/.test(v) && !/不支持|not supported|n\/a/i.test(v); });
  return re.test(String(p.sellingPoints || '')) && !/\(UP\)|L3\b/i.test(String(p.model || ''));
}
export function ciSpec(p) {
  let kwh = num1(p.moduleMaxEnergy || p.batteryCapacity || p.ratedCapacity);
  if (kwh > 5000) kwh /= 1000;
  let kw = num1(p.ratedPower || p.outputPower || p.pcsPower);
  if (kw > 5000) kw /= 1000;
  let t = num1(p.netWeight || p.moduleWeight);
  if (t > 100) t /= 1000; // 填的是 kg
  const dims = (String(p.dimensions || p.moduleDimensions || '').match(/\d+(?:\.\d+)?/g) || []).map(Number).slice(0, 3);
  return { cool: has(p, CI_LIQ_TYPES) ? 'liquid' : 'air', kwh, kw, v: num1(p.moduleVoltage || p.batteryVoltage),
    pv: ciOption(p, /PV|MPPT|光伏/i), sts: ciOption(p, /STS|静态开关|离网切换/i), dims: dims.length === 3 ? dims : [], t: Math.round(t * 10) / 10 };
}
// 锂电替换铅酸电池（LiFePO4 drop-in，12.8 / 25.6 / 51.2 V，型号如 LFP-12V7AH）：栏目 /batteries/lead-acid-replacement/
export const PBR_TYPES = ['锂电替换铅酸电池'];
export const isPbReplace = (p) => has(p, PBR_TYPES);
// 参数：电压（没填时按型号 12V / 24V / 48V 换成 12.8 / 25.6 / 51.2）、Ah、Wh（= V × Ah）、最大放电电流、尺寸 [长, 宽, 高]、重量
export function pbModule(p) {
  const mm = String(p.model || '').match(/(\d{2})\s*V\s*(\d+(?:\.\d+)?)\s*AH/i);
  let v = num1(p.moduleVoltage || p.batteryVoltage);
  if (!v && mm) v = { 12: 12.8, 24: 25.6, 48: 51.2 }[+mm[1]] || +mm[1];
  const ah = num1(p.moduleCapacity) || (mm ? +mm[2] : 0);
  const wh = v && ah ? Math.round(v * ah * 10) / 10 : 0;
  const maxA = num1(p.maxDischargeCurrent || p.recommendedDischargeCurrent || p.maxChargeDischargeCurrent);
  const kg = num1(p.moduleWeight || p.netWeight);
  const dims = (String(p.moduleDimensions || p.dimensions || '').match(/\d+(?:\.\d+)?/g) || []).map(Number).slice(0, 3);
  return { v, ah, wh, maxA, kg, dims: dims.length === 3 ? dims : [] };
}
// 12V 阀控式铅酸电池（VRLA，型号如 SK250-12 / SK250-12v）：栏目 /batteries/vrla/。参数解析在 vrla-engine.mjs（vrlaModule）
export const VRLA_TYPES = ['铅酸电池', '阀控式铅酸电池', '胶体电池'];
// CRM 里也可能新建了更具体的细分品类名（如"AGM阀控密封式免维护铅酸蓄电池"）：名字里带 铅酸 / 蓄电池 / VRLA / AGM / 胶体 / 阀控 的都算，锂电替换铅酸除外
// 型号规范化：去掉括号及后面的内容（"SK100-2V(2V100AH)" "SK100-2V 100Ah" → "SK100-2V"）
export const skModel = (m) => String(m || '').replace(/[（(].*$/, '').trim().split(/\s+/)[0];
// 品类名不含铅酸字样时，SK…-12 / SK…-12v / SK…-12vJ / SK…-2v 型号也算（锂电品类除外）
// 铅酸电池柜（电池箱）C-1 … C-40：型号 C-数字，或品类名带"电池柜 / 电池箱"（不含锂电、高压电池柜）。栏目 /batteries/battery-cabinet/，参数在 cab-engine.mjs
export const isBattCab = (p) => /^\s*C\s*-?\s*\d{1,2}(?=$|[\s(（\u4e00-\u9fff])/i.test(String(p.model || '').normalize('NFKC'))
  || typesOf(p).some((t) => /电池柜|电池箱|battery\s*cabinet/i.test(t) && !/锂|磷酸铁|高压|储能柜/.test(t));
export const isVrla = (p) => !isBattCab(p) && (has(p, VRLA_TYPES) || typesOf(p).some((t) => /铅酸|蓄电池|VRLA|AGM|胶体|阀控/i.test(t) && !/锂/.test(t)) || (/^SK\d{2,4}-(2|12)v?j?$/i.test(skModel(p.model)) && !typesOf(p).some((t) => /锂/.test(t))));
// 2V 单体（SK100-2v … SK3000-2v，或额定电压 2 V）单独一个栏目 /batteries/vrla-2v/；12V 栏目只放 12V 的
export const isCell2v = (p) => /^SK\d{2,4}-2v?$/i.test(skModel(p.model)) || /^2(?:\.0+)?\s*V?$/i.test(String(p.moduleVoltage || p.batteryVoltage || '').trim());
export const isVrla12 = (p) => isVrla(p) && !isCell2v(p);
export const isVrla2 = (p) => isVrla(p) && isCell2v(p);
// 高压磷酸铁锂电池柜（R204.8V / R409.6V 系列，给 UPS 和高压逆变器用，室内机柜式）：栏目 /batteries/hv-cabinet/
export const HV_CAB_TYPES = ['磷酸铁锂储能柜', '高压锂电池柜', '高压磷酸铁锂电池柜'];
export const isHvCab = (p) => has(p, HV_CAB_TYPES);
// 电池柜参数：在 battModule 基础上，从型号名（R204.8V100AH）补电压 / 容量，从各字段里找"≤ 27U"这种两位数 U 高
export function hvModule(p) {
  const b = battModule(p);
  const mm = String(p.model || '').match(/(\d+(?:\.\d+)?)\s*V\s*(\d+)\s*AH/i);
  if (mm) { if (!b.v) b.v = +mm[1]; if (!b.ah) b.ah = +mm[2]; }
  if (!b.kwh && b.v && b.ah) b.kwh = Math.round(b.v * b.ah / 10) / 100;
  const ex = Array.isArray(p.extraSpecs) ? p.extraSpecs.map((x) => `${x.label || ''} ${x.value || ''}`).join(' ') : '';
  const um = `${p.moduleDimensions || ''} ${p.dimensions || ''} ${p.cabinetSize || ''} ${ex}`.match(/(\d{1,2})\s*U\b/);
  b.u = um ? +um[1] : 0;
  return b;
}
export const FLOOR_BATT_TYPES = ['落地式锂电池', '落地式磷酸铁锂电池'];
export const isFloorBattery = (p) => has(p, FLOOR_BATT_TYPES);
const num1 = (v) => { const m = String(v || '').replace(',', '.').match(/\d+(?:\.\d+)?/); return m ? +m[0] : 0; };
// 机架式电池模块：电压 V、容量 Ah、能量 kWh（优先填的"模块最大能量"，没有就 V × Ah）、最大放电电流 A、高度 U、重量 kg、最多并联数
export function battModule(p) {
  const v = num1(p.moduleVoltage || p.cabinetRatedVoltage || p.batteryVoltage);
  const ah = num1(p.moduleCapacity);
  let kwh = num1(p.moduleMaxEnergy);
  if (kwh > 100) kwh /= 1000; // 填成了 Wh
  if (!kwh && v && ah) kwh = Math.round(v * ah / 10) / 100;
  const maxA = num1(p.maxDischargeCurrent || p.recommendedDischargeCurrent || p.maxChargeDischargeCurrent);
  const kg = num1(p.moduleWeight || p.netWeight);
  const um = `${p.model || ''} ${p.sellingPoints || ''} ${p.moduleDimensions || ''} ${p.dimensions || ''}`.match(/\b([1-9])\s*U\b/);
  let u = um ? +um[1] : 0;
  if (!u) { const nums = (String(p.moduleDimensions || p.dimensions || '').match(/\d+(?:\.\d+)?/g) || []).map(Number).filter((x) => x >= 40 && x <= 400); for (const x of nums.sort((a, b) => a - b)) { const k = Math.round(x / 44.45); if (k >= 1 && k <= 8 && Math.abs(x - k * 44.45) <= 10) { u = k; break; } } }
  const pm = String(p.sellingPoints || '').match(/(\d{1,2})\s*(?:pcs|units|modules|个|台)?\s*(?:in\s*)?parallel|parallel[^\n\d]{0,20}(\d{1,2})|并联[^\n\d]{0,6}(\d{1,2})/i);
  const par = pm ? +(pm[1] || pm[2] || pm[3]) : 0;
  return { v, ah, kwh, maxA, kg, u, par };
}
// 在线式高频 UPS 栏目（塔式，真双变换在线式，1–30 kVA；单相 / 三进单出 / 三进三出）
export const ONLINE_TYPES = ['在线式高频UPS', '高频塔式UPS', '在线式UPS'];
export const isOnline = (p) => has(p, ONLINE_TYPES);
// 一体式锂电 UPS（All-in-One Lithium UPS，内置锂电池、电池节数可选，例如 C1K-Pro）：栏目 /all-in-one-ups/
export const AIO_TYPES = ['一体式锂电UPS', '锂电一体式UPS'];
export const isAio = (p) => has(p, AIO_TYPES);
// 工频机 UPS 栏目（Industrial UPS）：带输出隔离变压器的工频在线式
export const INDUSTRIAL_TYPES = ['工频UPS'];
export const isIndustrial = (p) => has(p, INDUSTRIAL_TYPES);
// 工频机的相数：'11' 单进单出 / '31' 三进单出 / '33' 三进三出。先看"相数"字段（3/3、3进3出、三进三出、Three phase in/out…），
// 没填时看电压：输出是 380/400/415 V 的算三进三出，输入三相、输出 220–240 V 的算三进单出
export function phaseOf(p) {
  const t = String(p.phase || '').replace(/\s+/g, '').toLowerCase().replace(/three/g, '3').replace(/single|one/g, '1');
  const m = t.match(/([13一三单])(?:\/|进|in|ph|相)*.*?([13一三单])(?:出|out)?/);
  const n = (c) => (/[3三]/.test(c) ? '3' : '1');
  if (m && /[\/进出]|in|out/.test(t)) return n(m[1]) + n(m[2]);
  if (/^(3|三)(相|ph|phase)?$/.test(t)) return '33';
  const vo = `${p.outputVoltage || ''}`, vi = `${p.acInputVoltage || ''} ${p.inputVoltage || ''} ${p.inputVoltageRange || ''}`;
  if (/38\d|40\d|41\d/.test(vo)) return '33';
  if (/38\d|40\d|41\d|3\s*ph|三相/i.test(vi)) return '31';
  return '11';
}
// Mini DC UPS 栏目：品类是「迷你UPS」，或者属于 UPS 大类但不在其他任何 UPS 栏目里。
// 以前是「不属于任何栏目的产品都算 Mini」，CRM 里新加的品类（比如新的逆变器型号）会混进 Mini 页面，现在只兜底「UPS 大类、没填品类」的产品。
// 不属于任何栏目的产品，构建时会在日志里列出来（见首页 index.astro）
export const isMini = (p) => has(p, ['迷你UPS']) || (isUpsCat(p) && !p.type && !isOffline(p) && !isRack(p) && !isModular(p) && !isIndustrial(p) && !isOnline(p) && !isAio(p) && !isInverter(p) && !isBattery(p)
  && !isHomeEss(p) && !isCiEss(p) && !isWallBattery(p) && !isFloorBattery(p) && !isRackBattery(p) && !isHvCab(p) && !isPbReplace(p));
// 模块化 UPS 的功率模块：单模块容量（"50kVA/50kW"、"50KW"、"25"）和机柜最多能装几个模块
export function moduleOf(p) {
  const t = String(p.upsModuleCapacity || '');
  const num = (re) => { const m = t.match(re); return m ? parseFloat(m[1]) * (/k/i.test(m[2] || '') ? 1000 : 1) : 0; };
  let va = num(/(\d+(?:\.\d+)?)\s*(k?)VA/i), w = num(/(\d+(?:\.\d+)?)\s*(k?)W/i);
  if (!va && !w) { const m = t.match(/^\s*(\d+(?:\.\d+)?)\s*$/); if (m) va = +m[1] * 1000; } // 只写了数字：按 kVA
  if (va > 0 && va < 1000) va *= 1000; // 单位漏写成 VA / W
  if (w > 0 && w < 1000) w *= 1000;
  if (!w && va) w = va; // 模块化 UPS 输出功率因数通常是 1
  if (!va && w) va = w;
  let n = parseInt(String(p.upsModuleCount || '').match(/\d+/) || '', 10) || 0;
  if (!n && va) { const c = capacityOf(p); if (c.va) n = Math.round(c.va / va); }
  return { va, w, n };
}
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
  // 机架式 / 在线式高频：型号里的 1K / 3KL / 10K → kVA
  if (!va && (isRack(p) || isOnline(p) || isAio(p))) { const m = String(p.model || '').match(/(\d+(?:\.\d+)?)\s*K/i); if (m && +m[1] > 0 && +m[1] <= 40) va = +m[1] * 1000; }
  let w = num(/(\d+(?:\.\d+)?)\s*(k?)W(?!h)/i);
  const pf = parseFloat(String(p.powerFactor || p.outputPowerFactor || '').replace(',', '.'));
  if (!w && va && pf > 0 && pf <= 1) w = Math.round(va * pf);
  // 模块化 UPS 没有 1 kVA 以下的：数字小于 1000 说明单位其实是 kVA / kW（CRM 里单位默认是 VA，容易漏改）
  // 工频机也一样（1–400 kVA）
  if (isModular(p) || isIndustrial(p)) { if (va > 0 && va < 1000) va *= 1000; if (w > 0 && w < 1000) w *= 1000; }
  // 工频机：额定功率没写单位时按 kVA；输出功率因数默认 0.8
  if (!va && isIndustrial(p)) { const m = String(p.ratedPower || p.outputPower || '').match(/^\s*(\d+(?:\.\d+)?)\s*$/); if (m) va = +m[1] * 1000; }
  if (!w && va) w = Math.round(va * (isRack(p) || isOnline(p) ? 0.9 : isAio(p) ? 1 : isModular(p) ? 1 : isIndustrial(p) ? 0.8 : 0.6));
  return { va, w };
}

// 容量显示：1000 VA / 600 W、1.5 kVA / 900 W
export function fmtCap(c) {
  if (!c || !c.va) return '';
  const va = c.va >= 1000 ? `${c.va / 1000} kVA` : `${c.va} VA`;
  const w = c.w >= 10000 ? `${+(c.w / 1000).toFixed(1)} kW` : `${c.w} W`;
  return c.w ? `${va} / ${w}` : va;
}

// 同系列型号：同一栏目里字母前缀相同的型号（GF400 / GF600 / GF1000；Gi600 / Gi1000 / Gi1200 PRO），按容量数字排序
const seriesKey = (p) => {
  const m = String(p.model || '').trim().toUpperCase().match(/^([A-Z]+)[-\s]?(\d+(?:\.\d+)?)(.*)$/);
  return m ? { key: `${isOffline(p) ? 'o' : isRack(p) ? 'r' : isModular(p) ? 'u' : isIndustrial(p) ? 'i' : isOnline(p) ? 'h' : isAio(p) ? 'a' : 'm'}|${m[1]}`, n: parseFloat(m[2]), sfx: m[3].trim() } : null;
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

// 精密空调（机房空调）：型号 SK-FAJ… / SK-LAJ… / SK-RMJ…，或品类名带"精密空调 / 机房空调 / 基站空调 / 列间 / 机架式空调"。栏目 /precision-ac/，参数在 pac-engine.mjs
export const isPac = (p) => /^SK-?(FAJ|LAJ|RMJ)\d{3}/i.test(String(p.model || '').trim()) || typesOf(p).some((t) => /精密空调|机房空调|基站空调|列间空调|机架式空调|房间级空调/.test(t));
