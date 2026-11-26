// 网站界面文字 + 规格名称的三语对照。
// 客户档案系统里 type / machineVariant 存的是中文，这里负责翻译；规格的数值本身不翻译。
import { addAr } from './lib/ar.mjs';

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
  '一体式锂电UPS': { es: 'UPS de litio todo en uno', en: 'All-in-one lithium UPS', ru: 'Литиевый ИБП «всё в одном»' },
  '锂电一体式UPS': { es: 'UPS de litio todo en uno', en: 'All-in-one lithium UPS', ru: 'Литиевый ИБП «всё в одном»' },
  '在线式高频UPS': { es: 'UPS online de alta frecuencia', en: 'High-frequency online UPS', ru: 'Высокочастотный онлайн-ИБП' },
  '高频塔式UPS': { es: 'UPS torre de alta frecuencia', en: 'High-frequency tower UPS', ru: 'Высокочастотный ИБП (башня)' },
  '工频UPS': { es: 'UPS de baja frecuencia', en: 'Low-frequency UPS', ru: 'Низкочастотный ИБП' },
  '机架式磷酸铁锂电池': { es: 'Batería LiFePO4 para rack', en: 'Rack-mount LiFePO4 battery', ru: 'Стоечный аккумулятор LiFePO4' },
  '壁挂式锂电池': { es: 'Batería de litio de pared', en: 'Wall-mount lithium battery', ru: 'Настенный литиевый аккумулятор' },
  '壁挂式磷酸铁锂电池': { es: 'Batería LiFePO4 de pared', en: 'Wall-mount LiFePO4 battery', ru: 'Настенный аккумулятор LiFePO4' },
  '壁挂式储能一体机': { es: 'ESS doméstico todo en uno de pared', en: 'Wall-mounted all-in-one home ESS', ru: 'Настенная домашняя ESS «всё в одном»' },
  '落地式储能一体机': { es: 'ESS doméstico todo en uno de piso', en: 'Floor-standing all-in-one home ESS', ru: 'Напольная домашняя ESS «всё в одном»' },
  '风冷工商业储能柜': { es: 'Gabinete ESS C&I refrigerado por aire', en: 'Air-cooled C&I ESS cabinet', ru: 'Шкаф ESS для бизнеса с воздушным охлаждением' },
  '液冷工商业储能柜': { es: 'Gabinete ESS C&I refrigerado por líquido', en: 'Liquid-cooled C&I ESS cabinet', ru: 'Шкаф ESS для бизнеса с жидкостным охлаждением' },
  '高压堆叠式储能一体机': { es: 'ESS doméstico apilable de alta tensión', en: 'High-voltage stacked all-in-one home ESS', ru: 'Высоковольтная стековая домашняя ESS' },
  '低压堆叠式储能一体机': { es: 'ESS doméstico apilable de baja tensión', en: 'Low-voltage stacked all-in-one home ESS', ru: 'Низковольтная стековая домашняя ESS' },
  '锂电替换铅酸电池': { es: 'Batería LiFePO4 de reemplazo de plomo-ácido', en: 'LiFePO4 lead-acid replacement battery', ru: 'Аккумулятор LiFePO4 на замену свинцовому' },
  '磷酸铁锂储能柜': { es: 'Gabinete de batería LiFePO4', en: 'LiFePO4 battery cabinet', ru: 'Батарейный шкаф LiFePO4' },
  '高压锂电池柜': { es: 'Gabinete de batería de litio de alta tensión', en: 'High-voltage lithium battery cabinet', ru: 'Высоковольтный литиевый батарейный шкаф' },
  '高压磷酸铁锂电池柜': { es: 'Gabinete LiFePO4 de alta tensión', en: 'High-voltage LiFePO4 battery cabinet', ru: 'Высоковольтный шкаф LiFePO4' },
  '落地式锂电池': { es: 'Batería de litio de piso', en: 'Floor-standing lithium battery', ru: 'Напольный литиевый аккумулятор' },
  '落地式磷酸铁锂电池': { es: 'Batería LiFePO4 de piso', en: 'Floor-standing LiFePO4 battery', ru: 'Напольный аккумулятор LiFePO4' },
  '机架式锂电池': { es: 'Batería de litio para rack', en: 'Rack-mount lithium battery', ru: 'Стоечный литиевый аккумулятор' },
  '太阳能混网逆变器': { es: 'Inversor solar híbrido', en: 'Hybrid solar inverter', ru: 'Гибридный солнечный инвертор' },
  '并网/离网逆变器': { es: 'Inversor solar on-grid / off-grid', en: 'On-grid / off-grid solar inverter', ru: 'Сетевой / автономный солнечный инвертор' },
  '模块化UPS': { es: 'UPS modular', en: 'Modular UPS', ru: 'Модульный ИБП' },
  '机架式模块化UPS': { es: 'UPS modular para rack', en: 'Rack-mount Modular UPS', ru: 'Стоечный модульный ИБП' },
  '机架式UPS': { es: 'UPS para rack', en: 'Rack-mount UPS', ru: 'Стоечный ИБП' },
  '机架式锂电UPS': { es: 'UPS para rack de litio', en: 'Lithium-ion Rack-mount UPS', ru: 'Стоечный ИБП с литий-ионной батареей' },
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

// 阿拉伯语：按英文自动补 ar（见 lib/ar.mjs）
addAr(UI);
UI.ar.langName = 'العربية';
addAr(SPEC);
addAr(TERMS);
addAr(hasChinese);
