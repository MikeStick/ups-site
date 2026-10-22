// 箱单：客户档案系统里填的箱规 { per 每箱数量, nw 每箱净重, gw 每箱毛重, l/w/h 外箱 mm }，按数量算箱数、重量、体积。
// 所有品类通用（以后新加的品类也一样），没填全就不显示。
const num = (x) => parseFloat(String(x ?? '').replace(',', '.')) || 0;

export function packOf(p) {
  const k = p && p.pack;
  if (!k) return null;
  const pk = { per: Math.round(num(k.per)), nw: num(k.nw), gw: num(k.gw), l: num(k.l), w: num(k.w), h: num(k.h) };
  if (!(pk.per > 0 && pk.gw > 0 && pk.l > 0 && pk.w > 0 && pk.h > 0)) return null;
  if (!pk.nw || pk.nw > pk.gw) pk.nw = 0; // 没填净重（或填错）就不显示净重相关的列
  return pk;
}

export const PK = {
  en: {
    title: 'Packing list', sub: 'Calculated for {q} pcs · {per} pcs per carton', copy: 'Copy packing list', copied: 'Copied',
    cartons: 'Cartons', gw: 'Total G.W.', nw: 'Total N.W.', cbm: 'Total volume',
    cols: ['Model', 'QTY (pcs)', 'Pcs / carton', 'Cartons', 'N.W. / carton (kg)', 'G.W. / carton (kg)', 'Total N.W. (kg)', 'Total G.W. (kg)', 'Carton size (mm)', 'Volume (m³)'],
    full: 'Full cartons', part: 'Part carton', total: 'Total',
    mini: '{c} cartons · {g} kg G.W. · {v} m³', see: 'Packing list ↓',
    air: 'Air freight chargeable weight', airNote: 'Volumetric {v} kg vs actual {g} kg (÷6000)',
    c20: '20GP container (≈28 m³)', c40: '40HQ container (≈68 m³)', fill: '{p}% full',
    foot: 'Estimated from our standard carton. The final packing list is issued with your shipment.',
  },
  es: {
    title: 'Lista de empaque', sub: 'Calculada para {q} uds · {per} uds por caja', copy: 'Copiar lista de empaque', copied: 'Copiado',
    cartons: 'Cajas', gw: 'Peso bruto total', nw: 'Peso neto total', cbm: 'Volumen total',
    cols: ['Modelo', 'Cantidad (uds)', 'Uds / caja', 'Cajas', 'P. neto / caja (kg)', 'P. bruto / caja (kg)', 'P. neto total (kg)', 'P. bruto total (kg)', 'Medidas caja (mm)', 'Volumen (m³)'],
    full: 'Cajas completas', part: 'Caja parcial', total: 'Total',
    mini: '{c} cajas · {g} kg bruto · {v} m³', see: 'Lista de empaque ↓',
    air: 'Peso facturable aéreo', airNote: 'Volumétrico {v} kg vs real {g} kg (÷6000)',
    c20: 'Contenedor 20GP (≈28 m³)', c40: 'Contenedor 40HQ (≈68 m³)', fill: '{p}% ocupado',
    foot: 'Estimación según nuestra caja estándar. La lista de empaque definitiva se emite con el envío.',
  },
  ru: {
    title: 'Упаковочный лист', sub: 'Расчёт для {q} шт. · {per} шт. в коробке', copy: 'Скопировать упаковочный лист', copied: 'Скопировано',
    cartons: 'Коробок', gw: 'Брутто всего', nw: 'Нетто всего', cbm: 'Объём всего',
    cols: ['Модель', 'Кол-во (шт.)', 'Шт. / коробка', 'Коробок', 'Нетто / коробка (кг)', 'Брутто / коробка (кг)', 'Нетто всего (кг)', 'Брутто всего (кг)', 'Размер коробки (мм)', 'Объём (м³)'],
    full: 'Полные коробки', part: 'Неполная коробка', total: 'Итого',
    mini: '{c} кор. · {g} кг брутто · {v} м³', see: 'Упаковочный лист ↓',
    air: 'Оплачиваемый вес (авиа)', airNote: 'Объёмный {v} кг / фактический {g} кг (÷6000)',
    c20: 'Контейнер 20GP (≈28 м³)', c40: 'Контейнер 40HQ (≈68 м³)', fill: 'заполнен на {p}%',
    foot: 'Оценка по нашей стандартной коробке. Окончательный упаковочный лист выдаётся с отгрузкой.',
  },
};
