// 网站界面文字 + 规格名称的三语对照。
// 客户档案系统里 type / machineVariant 存的是中文，这里负责翻译；规格的数值本身不翻译。

export const UI = {
  es: {
    langName: 'Español',
    products: 'Productos',
    allProducts: 'Todos los productos',
    viewDetails: 'Ver detalles',
    specs: 'Especificaciones',
    details: 'Detalles del producto',
    features: 'Características',
    description: 'Descripción',
    pricing: 'Precio por volumen',
    qty: 'Cantidad',
    unitPrice: 'Precio unitario (USD)',
    from: (n) => `desde ${n} uds`,
    stock: 'En stock',
    stockQty: (n) => `${n} uds listas para enviar`,
    stockRules: 'Pedido mínimo 20 uds, en múltiplos de 20. Lo que exceda el stock se fabrica y se envía en 30 días.',
    group: 'Compra grupal',
    groupRules: 'Pedido mínimo 100 uds, en múltiplos de 100. El lote entra en producción al llegar a 1000 uds entre todos los compradores; cada uno elige su enchufe.',
    plugNote: 'Entrada universal 100–240V. Enchufe a elección: US, EU, UK, AU, India u otro.',
    askQuote: 'Pedir cotización por WhatsApp',
    askEmail: 'Escribir por email',
    video: 'Video',
    playVideo: 'Reproducir video',
    noProducts: 'Pronto publicaremos nuestros productos.',
    priceNote: 'Precios FOB en USD, sin flete. Sujetos a confirmación.',
    bigOrder: 'Más de 1000 uds: contáctenos para un precio especial.',
    morePhotos: 'Fotos',
    quoteMsg: (model) => `Hola, me interesa el ${model}. ¿Me pueden enviar una cotización?`,
  },
  en: {
    langName: 'English',
    products: 'Products',
    allProducts: 'All products',
    viewDetails: 'View details',
    specs: 'Specifications',
    details: 'Product details',
    features: 'Features',
    description: 'Description',
    pricing: 'Volume pricing',
    qty: 'Quantity',
    unitPrice: 'Unit price (USD)',
    from: (n) => `from ${n} pcs`,
    stock: 'In stock',
    stockQty: (n) => `${n} pcs ready to ship`,
    stockRules: 'Minimum order 20 pcs, in steps of 20. Anything above stock is produced and ships within 30 days.',
    group: 'Group buy',
    groupRules: 'Minimum order 100 pcs, in steps of 100. The batch goes into production once all buyers together reach 1000 pcs; each buyer picks their own plug.',
    plugNote: 'Universal 100–240V input. Plug of your choice: US, EU, UK, AU, India or other.',
    askQuote: 'Get a quote on WhatsApp',
    askEmail: 'Send an email',
    video: 'Video',
    playVideo: 'Play video',
    noProducts: 'Our products will be published here soon.',
    priceNote: 'FOB prices in USD, freight not included. Subject to confirmation.',
    bigOrder: 'Over 1000 pcs: contact us for a special price.',
    morePhotos: 'Photos',
    quoteMsg: (model) => `Hello, I'm interested in the ${model}. Could you send me a quote?`,
  },
  ru: {
    langName: 'Русский',
    products: 'Продукция',
    allProducts: 'Вся продукция',
    viewDetails: 'Подробнее',
    specs: 'Характеристики',
    details: 'Подробнее о товаре',
    features: 'Особенности',
    description: 'Описание',
    pricing: 'Цена от объёма',
    qty: 'Количество',
    unitPrice: 'Цена за шт. (USD)',
    from: (n) => `от ${n} шт.`,
    stock: 'В наличии',
    stockQty: (n) => `${n} шт. готовы к отправке`,
    stockRules: 'Минимальный заказ 20 шт., кратно 20. Сверх наличия — производство и отгрузка в течение 30 дней.',
    group: 'Совместная закупка',
    groupRules: 'Минимальный заказ 100 шт., кратно 100. Партия запускается в производство, когда все покупатели вместе набирают 1000 шт.; вилку каждый выбирает сам.',
    plugNote: 'Универсальный вход 100–240В. Вилка на выбор: US, EU, UK, AU, India или другая.',
    askQuote: 'Запросить цену в WhatsApp',
    askEmail: 'Написать на email',
    video: 'Видео',
    playVideo: 'Смотреть видео',
    noProducts: 'Скоро здесь появится наша продукция.',
    priceNote: 'Цены FOB в USD, без учёта доставки. Требуют подтверждения.',
    bigOrder: 'Более 1000 шт.: свяжитесь с нами для специальной цены.',
    morePhotos: 'Фото',
    quoteMsg: (model) => `Здравствуйте, меня интересует ${model}. Пришлите, пожалуйста, коммерческое предложение.`,
  },
};

// 规格名称
const SPEC = {
  model: { es: 'Modelo', en: 'Model', ru: 'Модель' },
  brand: { es: 'Marca', en: 'Brand', ru: 'Бренд' },
  type: { es: 'Tipo', en: 'Type', ru: 'Тип' },
  machineVariant: { es: 'Versión', en: 'Machine type', ru: 'Исполнение' },
  outputPower: { es: 'Potencia de salida', en: 'Output power', ru: 'Выходная мощность' },
  ratedPower: { es: 'Potencia nominal', en: 'Rated power', ru: 'Номинальная мощность' },
  powerFactor: { es: 'Factor de potencia', en: 'Power factor', ru: 'Коэффициент мощности' },
  inputVoltage: { es: 'Voltaje de entrada', en: 'Input voltage', ru: 'Входное напряжение' },
  outputPortCount: { es: 'Número de salidas', en: 'Output ports', ru: 'Количество выходов' },
  outputTypes: { es: 'Tipos de salida', en: 'Output types', ru: 'Типы выходов' },
  output: { es: 'Salida', en: 'output', ru: 'Выход' },
  batterySpec: { es: 'Batería (cantidad × capacidad)', en: 'Battery qty & capacity', ru: 'Батареи (кол-во × ёмкость)' },
  dimensions: { es: 'Dimensiones (mm)', en: 'Dimensions (mm)', ru: 'Габариты (мм)' },
  netWeight: { es: 'Peso neto (kg)', en: 'Net weight (kg)', ru: 'Вес нетто (кг)' },
};

const TERMS = {
  '迷你UPS': { es: 'Mini UPS', en: 'Mini UPS', ru: 'Мини-ИБП' },
  '离线式UPS': { es: 'UPS offline', en: 'Offline UPS', ru: 'Резервный ИБП (Offline)' },
  '离线式锂电UPS': { es: 'UPS offline de litio', en: 'Lithium-ion Offline UPS', ru: 'Резервный ИБП с литий-ионной батареей' },
  '在线互动式UPS': { es: 'UPS interactivo', en: 'Line-interactive UPS', ru: 'Линейно-интерактивный ИБП' },
  '在线式高频UPS': { es: 'UPS online de alta frecuencia', en: 'High-frequency online UPS', ru: 'Высокочастотный онлайн-ИБП' },
  '高频塔式UPS': { es: 'UPS torre de alta frecuencia', en: 'High-frequency tower UPS', ru: 'Высокочастотный ИБП (башня)' },
  '工频UPS': { es: 'UPS de baja frecuencia', en: 'Low-frequency UPS', ru: 'Низкочастотный ИБП' },
  '模块化UPS': { es: 'UPS modular', en: 'Modular UPS', ru: 'Модульный ИБП' },
  '机架式UPS': { es: 'UPS para rack', en: 'Rack-mount UPS', ru: 'Стоечный ИБП' },
  // 机型：与客户档案系统 normalizeMachineVariant / MACHINE_VARIANT_NOTES 保持一致
  '标机': { es: 'Estándar (batería incorporada)', en: 'Standard (built-in battery)', ru: 'Стандартное (встроенная батарея)' },
  '标准机型': { es: 'Estándar (batería incorporada)', en: 'Standard (built-in battery)', ru: 'Стандартное (встроенная батарея)' },
  '长机': { es: 'Larga autonomía (batería externa)', en: 'Long backup (external battery)', ru: 'Длительное резервирование (внешние батареи)' },
  '长延时机型': { es: 'Larga autonomía (batería externa)', en: 'Long backup (external battery)', ru: 'Длительное резервирование (внешние батареи)' },
};

const hasChinese = (s) => /[一-鿿]/.test(String(s || ''));

export function term(value, lang) {
  if (!value) return '';
  const t = TERMS[value];
  if (t) return t[lang];
  return hasChinese(value) ? '' : value; // 没收录的中文词宁可不显示，也不要把中文展示给客户
}

// 按客户档案系统里的字段，组装出网站规格表的行
export function specRows(p, lang) {
  const L = (k) => SPEC[k][lang];
  const rows = [];
  const push = (label, value) => { if (value && !hasChinese(value)) rows.push([label, String(value)]); };
  push(L('model'), p.model);
  push(L('brand'), p.brand);
  push(L('type'), term(p.type, lang));
  push(L('machineVariant'), term(p.machineVariant, lang));
  push(L('outputPower'), p.outputPower);
  if (p.ratedPower) push(L('ratedPower'), `${p.ratedPower}${p.ratedPowerUnit ? ' ' + p.ratedPowerUnit : ''}`);
  push(L('powerFactor'), p.powerFactor);
  push(L('inputVoltage'), p.inputVoltage);
  push(L('outputPortCount'), p.outputPortCount);
  const ports = Array.isArray(p.outputPorts) ? p.outputPorts : [];
  if (ports.length) {
    push(L('outputTypes'), ports.map((o) => o.type).join(' / '));
    for (const o of ports) {
      const label = lang === 'en' ? `${o.type} ${L('output')}` : `${L('output')} ${o.type}`;
      push(label, [o.voltage, o.current].filter(Boolean).join(' / '));
    }
  }
  push(L('batterySpec'), p.batterySpec);
  push(L('dimensions'), p.dimensions);
  push(L('netWeight'), p.netWeight);
  // 其他参数：标签是中文的（AI 导入时没翻译的）先跳过，构建日志里能看到
  for (const x of Array.isArray(p.extraSpecs) ? p.extraSpecs : []) {
    if (hasChinese(x.label)) continue;
    push(x.label, x.value);
  }
  return rows;
}

// 阶梯价：客户档案系统只填起订量单价（minPrice）和1000台单价（maxPrice），中间档位按数量线性插值。
// 公式与客户档案系统 App.jsx 里的 webTiers() 保持一致。
export function tiersOf(p) {
  const sale = p.sale || {};
  const pMin = Number(sale.minPrice), pMax = Number(sale.maxPrice);
  if (pMin > 0) {
    const moq = sale.mode === 'group' ? 100 : 20;
    if (!(pMax > 0)) return [{ qty: moq, price: pMin }];
    const pts = [moq];
    for (let q = 100; q <= 1000; q += 100) if (q > moq) pts.push(q);
    return pts.map((q) => ({ qty: q, price: Math.round((pMin + (pMax - pMin) * (q - moq) / (1000 - moq)) * 100) / 100 }));
  }
  // 兼容旧格式：逐档填写的 tiers
  return (Array.isArray(sale.tiers) ? sale.tiers : [])
    .map((t) => ({ qty: Number(t.qty), price: Number(t.price) }))
    .filter((t) => t.qty > 0 && t.price > 0)
    .sort((a, b) => a.qty - b.qty);
}
