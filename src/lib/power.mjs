// 从客户档案系统的规格字段里推算：电池能量（Wh）、输出功率（W）、输出口标签。
// 用于产品列表筛选和"能撑多久"计算器。都是估算值，页面上会注明。

// 电池能量：支持 "5000mAh*4"、"2600mAh×3"、"12V4.5AH*1"、"12V 9AH x2" 这几种常见写法
export function batteryWh(p) {
  const s = String(p.batterySpec || '').replace(/\s+/g, '').replace(/[×xX]/g, '*');
  const isLfp = /LFP|LIFEPO4/i.test(`${p.model || ''} ${p.batterySpec || ''}`);
  let m = s.match(/(\d+(?:\.\d+)?)V(\d+(?:\.\d+)?)A[Hh](?:\*(\d+))?/);
  if (m) return +m[1] * +m[2] * (+m[3] || 1);
  m = s.match(/(\d+(?:\.\d+)?)mAh(?:\*(\d+))?/i);
  if (m) {
    const cellV = isLfp ? 3.2 : 3.7; // 磷酸铁锂 3.2V，普通锂电 3.7V
    return (+m[1] / 1000) * cellV * (+m[2] || 1);
  }
  return 0;
}

export function powerW(p) {
  const m = String(p.outputPower || '').match(/(\d+(?:\.\d+)?)\s*W/i);
  return m ? +m[1] : 0;
}

// 输出口标签，例如 ["USB", "9V", "12V", "PoE 24V", "PoE 48V"]
export function outputTags(p) {
  const tags = new Set();
  for (const o of Array.isArray(p.outputPorts) ? p.outputPorts : []) {
    const type = String(o.type || '').toUpperCase();
    const volts = (String(o.voltage || '').match(/\d+(?:\.\d+)?(?=\s*V)/gi) || []).map(Number);
    if (type.includes('USB')) tags.add('USB');
    else if (type.includes('POE')) volts.forEach((v) => tags.add(`PoE ${v}V`));
    else volts.forEach((v) => tags.add(`${v}V`));
  }
  const order = (t) => (t === 'USB' ? 0 : t.startsWith('PoE') ? 1000 + parseFloat(t.slice(4)) : parseFloat(t));
  return [...tags].sort((a, b) => order(a) - order(b));
}

export const EFFICIENCY = 0.85; // 直流转换效率估算

// 常见设备的典型功耗（W）——计算器预设
export const DEVICES = [
  { id: 'router', w: 10 },
  { id: 'ont', w: 6 },
  { id: 'cam', w: 5 },
  { id: 'poecam', w: 7 },
  { id: 'starlink', w: 30 },
];

export const CALC_T = {
  en: {
    title: 'How long will it run?', sub: 'Pick the devices you want to keep online during a power cut.',
    devices: { router: 'Wi-Fi router', ont: 'Fiber ONT / modem', cam: 'IP camera', poecam: 'PoE camera', starlink: 'Starlink Mini' },
    custom: 'Other load (W)', total: 'Total load', runtime: 'Estimated backup time', over: 'Load is above this model’s {w} W output — choose a bigger model.',
    none: 'Add a device to see the backup time.', note: 'Estimate based on battery capacity and {e}% conversion efficiency. Actual time depends on the devices.',
    h: 'h', min: 'min',
    filterTitle: 'Find the right model', outputs: 'Outputs needed', avail: 'Availability', any: 'Any',
    stock: 'In stock', group: 'Group buy', load: 'My devices', clear: 'Clear filters', count: '{n} models', count1: '1 model', noMatch: 'No model matches these filters.',
    canPower: 'Only models that can power my devices', runs: '≈ {t} backup',
  },
  es: {
    title: '¿Cuánto tiempo dura?', sub: 'Elija los equipos que quiere mantener encendidos durante un apagón.',
    devices: { router: 'Router Wi-Fi', ont: 'ONT de fibra / módem', cam: 'Cámara IP', poecam: 'Cámara PoE', starlink: 'Starlink Mini' },
    custom: 'Otra carga (W)', total: 'Carga total', runtime: 'Autonomía estimada', over: 'La carga supera la salida de {w} W de este modelo: elija uno más potente.',
    none: 'Agregue un equipo para ver la autonomía.', note: 'Estimación según la capacidad de la batería y {e}% de eficiencia de conversión. El tiempo real depende de los equipos.',
    h: 'h', min: 'min',
    filterTitle: 'Encuentre el modelo adecuado', outputs: 'Salidas necesarias', avail: 'Disponibilidad', any: 'Todas',
    stock: 'En stock', group: 'Compra grupal', load: 'Mis equipos', clear: 'Quitar filtros', count: '{n} modelos', count1: '1 modelo', noMatch: 'Ningún modelo coincide con estos filtros.',
    canPower: 'Solo modelos que pueden alimentar mis equipos', runs: '≈ {t} de autonomía',
  },
  ru: {
    title: 'Сколько проработает?', sub: 'Выберите устройства, которые должны работать при отключении света.',
    devices: { router: 'Wi-Fi роутер', ont: 'Оптический ONT / модем', cam: 'IP-камера', poecam: 'PoE-камера', starlink: 'Starlink Mini' },
    custom: 'Другая нагрузка (Вт)', total: 'Общая нагрузка', runtime: 'Примерное время работы', over: 'Нагрузка выше выходной мощности модели ({w} Вт) — выберите модель мощнее.',
    none: 'Добавьте устройство, чтобы увидеть время работы.', note: 'Оценка по ёмкости батареи и КПД преобразования {e}%. Реальное время зависит от устройств.',
    h: 'ч', min: 'мин',
    filterTitle: 'Подбор модели', outputs: 'Нужные выходы', avail: 'Наличие', any: 'Все',
    stock: 'В наличии', group: 'Совместная закупка', load: 'Мои устройства', clear: 'Сбросить фильтры', count: 'Моделей: {n}', count1: 'Моделей: 1', noMatch: 'Нет моделей по этим фильтрам.',
    canPower: 'Только модели, которые потянут мои устройства', runs: '≈ {t} работы',
  },
};
