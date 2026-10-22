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
    qty: 'Quantity', copyImg: 'Copy image', dl: 'Download', copiedImg: 'Image copied — paste it in WhatsApp or anywhere', shared: 'Shared', dlDone: 'Image downloaded',
    cont: 'Containers needed', only20: 'Only 20GP', only40: 'Only 40HQ', nCont: '{n} × {t}', lastFill: 'last one {p}% full', suggest: 'Suggested loading', lcl: 'Under ~15 m³ an LCL (shared container) shipment is usually cheaper.',
    imgModel: 'Model', imgQty: 'Quantity', imgDate: 'Date',
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
    qty: 'Cantidad', copyImg: 'Copiar imagen', dl: 'Descargar', copiedImg: 'Imagen copiada: péguela en WhatsApp o donde quiera', shared: 'Compartido', dlDone: 'Imagen descargada',
    cont: 'Contenedores necesarios', only20: 'Solo 20GP', only40: 'Solo 40HQ', nCont: '{n} × {t}', lastFill: 'el último al {p}%', suggest: 'Carga sugerida', lcl: 'Con menos de ~15 m³ suele ser más económico un envío LCL (contenedor compartido).',
    imgModel: 'Modelo', imgQty: 'Cantidad', imgDate: 'Fecha',
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
    qty: 'Количество', copyImg: 'Скопировать картинку', dl: 'Скачать', copiedImg: 'Картинка скопирована — вставьте её в WhatsApp или куда угодно', shared: 'Отправлено', dlDone: 'Картинка сохранена',
    cont: 'Нужно контейнеров', only20: 'Только 20GP', only40: 'Только 40HQ', nCont: '{n} × {t}', lastFill: 'последний заполнен на {p}%', suggest: 'Рекомендуемая загрузка', lcl: 'При объёме до ~15 м³ обычно выгоднее сборный груз (LCL).',
    imgModel: 'Модель', imgQty: 'Количество', imgDate: 'Дата',
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

// 集装箱：按体积和载重两个条件算（取更紧的那个）。可用容积 / 载重取常用的保守值。
export const CONTAINERS = { '20GP': { v: 28, kg: 21000 }, '40HQ': { v: 68, kg: 26000 } };
