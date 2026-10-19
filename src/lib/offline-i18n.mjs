// 离线式 / 在线互动式 UPS 栏目：页面文字、询价面板、参数表标签（三语）
export const OEM_MOQ_OFFLINE = 1000;
export const OEM_SAMPLE_FEE_OFFLINE = 3000;

// 选型助手里的常见设备（W）
export const DEVICES = [
  { id: 'pc', w: 250 }, { id: 'monitor', w: 30 }, { id: 'laptop', w: 65 },
  { id: 'pos', w: 60 }, { id: 'router', w: 16 }, { id: 'dvr', w: 60 },
];

// 参数表：字段 → 标签
export const SPEC_FIELDS = ['outputPower', 'acInputVoltage', 'inputVoltageRange', 'inputFrequency', 'outputVoltage', 'outputVoltageRange', 'waveform',
  'transferTime', 'frequencyRangeBatteryMode', 'batteryVoltage', 'batterySpec', 'chargeCurrent', 'chargeTime', 'ledDisplay', 'lcdDisplay',
  'fullProtection', 'alarmInfo', 'interfacePort', 'noiseLevel', 'humidity', 'dimensions', 'netWeight'];

export const OT = {
  en: {
    nav: 'Offline UPS', navMini: 'Mini DC UPS', navProducts: 'Products',
    title: 'Offline & line-interactive UPS', metaDesc: 'Offline and line-interactive UPS from 600 VA to 3 kVA with AVR and sockets for every market. Factory direct, OEM from 1000 pcs.',
    crumbs: 'Products',
    eyebrow: 'Offline & line-interactive UPS', h1a: 'Clean backup for ', h1b: 'PCs, POS & networks',
    lead: 'Compact UPS with automatic voltage regulation. Keeps computers, cash registers, routers and CCTV running through power cuts and voltage swings — with sockets made for your market.',
    ctaModels: 'See all models', ctaSizer: 'Find my UPS size',
    facts: { range: 'Capacity range', transfer: 'Transfer time', input: 'Wide input with AVR', sockets: 'Socket standards, up to 10 per unit' },
    sizerEyebrow: 'Sizing helper', sizerH: 'How big a UPS do I need?', sizerP: 'Add the devices you want to protect. We add a 25% safety margin and suggest the right capacity.',
    devices: { pc: 'Desktop PC', monitor: 'Monitor', laptop: 'Laptop', pos: 'POS terminal', router: 'Router + ONT', dvr: 'DVR + 4 cameras' },
    totalLoad: 'Total load', addDevice: 'Add a device to see our recommendation.', needAtLeast: 'With a 25% margin you need at least {w} W. Suitable models:',
    tooBig: 'Above {w} W — ask us for a bigger model or an online UPS.', backupNote: 'Backup time is an estimate for new batteries at 25 °C. Offline UPS are designed for a few minutes up to half an hour — enough to save work and shut down safely.',
    min: 'min',
    modelsEyebrow: 'Models', modelsH: 'Offline & line-interactive range',
    fType: 'Type', fAll: 'All', fOff: 'Offline', fLi: 'Line-interactive', fCap: 'Capacity', cap1: '≤ 1 kVA', cap2: '1–2 kVA', cap3: '> 2 kVA',
    noModels: 'Models will be published here soon — contact us for the full range.', noMatch: 'No model matches — tell us what you need and we will suggest one.',
    cBattery: 'Battery', cTransfer: 'Transfer', cWave: 'Waveform', cSockets: 'Sockets', details: 'Details', quote: 'Quote',
    socketsEyebrow: 'Sockets for your market', socketsH: 'Six socket standards, fitted at the factory', socketsP: 'Every model can be built with the outlets your customers use — up to 10 per unit, no adapters needed.',
    vsEyebrow: 'Which type?', vsH: 'Offline or line-interactive?',
    vs: {
      off: { tag: 'Offline', h: 'Offline (standby) UPS', rows: [['How it works', 'Passes mains through; switches to battery when power fails'], ['Voltage swings', 'Basic AVR on most models'], ['Transfer time', 'Typically 4–8 ms'], ['Price', 'Lowest cost per VA']], best: 'Best for: home PCs, routers, small shops with stable power' },
      li: { tag: 'Line-interactive', h: 'Line-interactive UPS', rows: [['How it works', 'Corrects high and low voltage without using the battery'], ['Voltage swings', 'Multi-step AVR, longer battery life'], ['Transfer time', 'Typically 2–6 ms'], ['Price', 'Slightly higher, better protection']], best: 'Best for: offices, POS, CCTV, areas with unstable voltage' },
    },
    compareEyebrow: 'Specifications', compareH: 'Compare models',
    appsEyebrow: 'Applications', appsH: 'Where offline UPS make the difference',
    apps: ['Home & gaming PCs', 'Shops & POS', 'Offices', 'CCTV & DVR', 'Internet & Wi-Fi', 'Gaming consoles'],
    oemEyebrow: 'OEM for importers', oemH: 'Your brand, your sockets, your box',
    oem: [['Logo & colour', 'Silk-screen or laser logo, custom front panel colour'], ['Sockets', 'Any of the 6 standards, up to 10 per unit'], ['LED or LCD', 'Choose the display for your price point'], ['Battery', 'Battery size and quantity for your runtime'], ['Interfaces', 'USB / RS-232, RJ45 surge protection'], ['Packaging', 'Colour box and manual in your language']],
    oemCtaH: 'Start an OEM order', oemCtaP: 'OEM from 1000 pcs. The sample costs US$3,000, fully refunded on your bulk order.', oemCta: 'Request OEM quote',
    ctaH: 'Need a quote?', ctaP: 'Send us the capacity, socket type and quantity — we reply on WhatsApp the same day.',
    // 产品页询价面板
    qTitle: 'Request a quote', qQty: 'Quantity', pcs: 'pcs', qSockets: 'Sockets', qSocketHint: 'Default configuration shown. Change the type or number (max 10).',
    qCount: 'Number of sockets', qNotes: 'Notes (optional)', qNotesPh: 'Brand, display, battery, delivery country…', qSend: 'Ask for price on WhatsApp', qMail: 'Ask by email',
    qOem: 'OEM with your logo from 1000 pcs · sample US$3,000, refunded on the bulk order', qPrice: 'Price on request · FOB China',
    qMsg: 'Hello, I would like a quote for the {m}:', lQty: 'Quantity', lSockets: 'Sockets', lNotes: 'Notes',
    banner: 'Your brand on this model?', bannerCta: 'OEM from 1000 pcs',
    spec: {
      outputPower: 'Capacity', acInputVoltage: 'Input voltage', inputVoltageRange: 'Input voltage range', inputFrequency: 'Input frequency', outputVoltage: 'Output voltage',
      outputVoltageRange: 'Output regulation', waveform: 'Waveform (battery mode)', transferTime: 'Transfer time', frequencyRangeBatteryMode: 'Frequency (battery mode)',
      batteryVoltage: 'Battery voltage', batterySpec: 'Battery', chargeCurrent: 'Charge current', chargeTime: 'Recharge time', ledDisplay: 'LED indicators', lcdDisplay: 'LCD display',
      fullProtection: 'Protection', alarmInfo: 'Audible alarms', interfacePort: 'Interface', noiseLevel: 'Noise', humidity: 'Humidity', dimensions: 'Dimensions (mm)', netWeight: 'Net weight (kg)',
      sockets: 'Sockets (default)', model: 'Model', type: 'Type',
    },
  },
  es: {
    nav: 'UPS offline', navMini: 'Mini UPS DC', navProducts: 'Productos',
    title: 'UPS offline e interactivos', metaDesc: 'UPS offline e interactivos de 600 VA a 3 kVA con AVR y tomas para cada mercado. Directo de fábrica, OEM desde 1000 uds.',
    crumbs: 'Productos',
    eyebrow: 'UPS offline e interactivos', h1a: 'Respaldo confiable para ', h1b: 'PC, POS y redes',
    lead: 'UPS compactos con regulación automática de voltaje. Mantienen computadoras, cajas registradoras, routers y cámaras funcionando durante apagones y variaciones de voltaje, con las tomas de su mercado.',
    ctaModels: 'Ver todos los modelos', ctaSizer: 'Calcular mi UPS',
    facts: { range: 'Rango de capacidad', transfer: 'Tiempo de transferencia', input: 'Entrada amplia con AVR', sockets: 'Tipos de toma, hasta 10 por equipo' },
    sizerEyebrow: 'Asistente de selección', sizerH: '¿Qué tamaño de UPS necesito?', sizerP: 'Agregue los equipos que quiere proteger. Sumamos un 25% de margen y le sugerimos la capacidad adecuada.',
    devices: { pc: 'PC de escritorio', monitor: 'Monitor', laptop: 'Laptop', pos: 'Terminal POS', router: 'Router + ONT', dvr: 'DVR + 4 cámaras' },
    totalLoad: 'Carga total', addDevice: 'Agregue un equipo para ver nuestra recomendación.', needAtLeast: 'Con un 25% de margen necesita al menos {w} W. Modelos adecuados:',
    tooBig: 'Más de {w} W: consúltenos por un modelo mayor o un UPS online.', backupNote: 'La autonomía es una estimación con baterías nuevas a 25 °C. Los UPS offline están pensados para unos minutos hasta media hora: lo suficiente para guardar el trabajo y apagar con seguridad.',
    min: 'min',
    modelsEyebrow: 'Modelos', modelsH: 'Gama offline e interactiva',
    fType: 'Tipo', fAll: 'Todos', fOff: 'Offline', fLi: 'Interactivo', fCap: 'Capacidad', cap1: '≤ 1 kVA', cap2: '1–2 kVA', cap3: '> 2 kVA',
    noModels: 'Pronto publicaremos los modelos aquí; contáctenos para ver toda la gama.', noMatch: 'Ningún modelo coincide: cuéntenos qué necesita y le sugerimos uno.',
    cBattery: 'Batería', cTransfer: 'Transferencia', cWave: 'Onda', cSockets: 'Tomas', details: 'Detalles', quote: 'Cotizar',
    socketsEyebrow: 'Tomas para su mercado', socketsH: 'Seis tipos de toma, instalados en fábrica', socketsP: 'Cada modelo se puede fabricar con las tomas que usan sus clientes: hasta 10 por equipo, sin adaptadores.',
    vsEyebrow: '¿Qué tipo?', vsH: '¿Offline o interactivo?',
    vs: {
      off: { tag: 'Offline', h: 'UPS offline (standby)', rows: [['Cómo funciona', 'Deja pasar la red y cambia a batería cuando se corta la luz'], ['Variaciones de voltaje', 'AVR básico en la mayoría de modelos'], ['Transferencia', 'Normalmente 4–8 ms'], ['Precio', 'El menor costo por VA']], best: 'Ideal para: PC del hogar, routers, tiendas con red estable' },
      li: { tag: 'Interactivo', h: 'UPS interactivo', rows: [['Cómo funciona', 'Corrige voltaje alto y bajo sin usar la batería'], ['Variaciones de voltaje', 'AVR de varios pasos, mayor vida de batería'], ['Transferencia', 'Normalmente 2–6 ms'], ['Precio', 'Algo mayor, mejor protección']], best: 'Ideal para: oficinas, POS, CCTV, zonas con voltaje inestable' },
    },
    compareEyebrow: 'Especificaciones', compareH: 'Comparar modelos',
    appsEyebrow: 'Aplicaciones', appsH: 'Donde un UPS offline marca la diferencia',
    apps: ['PC del hogar y gaming', 'Tiendas y POS', 'Oficinas', 'CCTV y DVR', 'Internet y Wi-Fi', 'Consolas'],
    oemEyebrow: 'OEM para importadores', oemH: 'Su marca, sus tomas, su caja',
    oem: [['Logo y color', 'Logo serigrafiado o láser, color de panel a medida'], ['Tomas', 'Cualquiera de los 6 tipos, hasta 10 por equipo'], ['LED o LCD', 'Elija la pantalla según su precio objetivo'], ['Batería', 'Capacidad y cantidad según la autonomía'], ['Interfaces', 'USB / RS-232, protección RJ45'], ['Empaque', 'Caja a color y manual en su idioma']],
    oemCtaH: 'Iniciar un pedido OEM', oemCtaP: 'OEM desde 1000 uds. La muestra cuesta US$3.000 y se reembolsa completa en su pedido de producción.', oemCta: 'Pedir cotización OEM',
    ctaH: '¿Necesita una cotización?', ctaP: 'Envíenos la capacidad, el tipo de toma y la cantidad: respondemos por WhatsApp el mismo día.',
    qTitle: 'Pedir cotización', qQty: 'Cantidad', pcs: 'uds', qSockets: 'Tomas', qSocketHint: 'Se muestra la configuración estándar. Cambie el tipo o la cantidad (máx. 10).',
    qCount: 'Número de tomas', qNotes: 'Notas (opcional)', qNotesPh: 'Marca, pantalla, batería, país de destino…', qSend: 'Pedir precio por WhatsApp', qMail: 'Pedir por email',
    qOem: 'OEM con su logo desde 1000 uds · muestra US$3.000, reembolsada en el pedido de producción', qPrice: 'Precio a consultar · FOB China',
    qMsg: 'Hola, quisiera una cotización del {m}:', lQty: 'Cantidad', lSockets: 'Tomas', lNotes: 'Notas',
    banner: '¿Su marca en este modelo?', bannerCta: 'OEM desde 1000 uds',
    spec: {
      outputPower: 'Capacidad', acInputVoltage: 'Voltaje de entrada', inputVoltageRange: 'Rango de entrada', inputFrequency: 'Frecuencia de entrada', outputVoltage: 'Voltaje de salida',
      outputVoltageRange: 'Regulación de salida', waveform: 'Onda (modo batería)', transferTime: 'Tiempo de transferencia', frequencyRangeBatteryMode: 'Frecuencia (modo batería)',
      batteryVoltage: 'Voltaje de batería', batterySpec: 'Batería', chargeCurrent: 'Corriente de carga', chargeTime: 'Tiempo de recarga', ledDisplay: 'Indicadores LED', lcdDisplay: 'Pantalla LCD',
      fullProtection: 'Protecciones', alarmInfo: 'Alarmas sonoras', interfacePort: 'Interfaz', noiseLevel: 'Ruido', humidity: 'Humedad', dimensions: 'Dimensiones (mm)', netWeight: 'Peso neto (kg)',
      sockets: 'Tomas (estándar)', model: 'Modelo', type: 'Tipo',
    },
  },
  ru: {
    nav: 'Резервные ИБП', navMini: 'Мини-ИБП DC', navProducts: 'Продукция',
    title: 'Резервные и линейно-интерактивные ИБП', metaDesc: 'Резервные и линейно-интерактивные ИБП от 600 ВА до 3 кВА с AVR и розетками для любого рынка. Напрямую с завода, OEM от 1000 шт.',
    crumbs: 'Продукция',
    eyebrow: 'Резервные и линейно-интерактивные ИБП', h1a: 'Надёжное резервное питание для ', h1b: 'ПК, касс и сетей',
    lead: 'Компактные ИБП с автоматической регулировкой напряжения. Компьютеры, кассы, роутеры и видеонаблюдение продолжают работать при отключениях и скачках напряжения — с розетками под ваш рынок.',
    ctaModels: 'Все модели', ctaSizer: 'Подобрать мощность',
    facts: { range: 'Диапазон мощности', transfer: 'Время переключения', input: 'Широкий вход с AVR', sockets: 'Типов розеток, до 10 на ИБП' },
    sizerEyebrow: 'Помощник подбора', sizerH: 'Какой ИБП мне нужен?', sizerP: 'Добавьте устройства, которые нужно защитить. Мы прибавим 25% запаса и подберём мощность.',
    devices: { pc: 'Настольный ПК', monitor: 'Монитор', laptop: 'Ноутбук', pos: 'POS-терминал', router: 'Роутер + ONT', dvr: 'Видеорегистратор + 4 камеры' },
    totalLoad: 'Общая нагрузка', addDevice: 'Добавьте устройство, чтобы увидеть рекомендацию.', needAtLeast: 'С запасом 25% нужно не меньше {w} Вт. Подходящие модели:',
    tooBig: 'Больше {w} Вт — запросите более мощную модель или онлайн-ИБП.', backupNote: 'Время работы — оценка для новых батарей при 25 °C. Резервные ИБП рассчитаны на несколько минут, до получаса — достаточно, чтобы сохранить работу и корректно выключиться.',
    min: 'мин',
    modelsEyebrow: 'Модели', modelsH: 'Резервные и линейно-интерактивные модели',
    fType: 'Тип', fAll: 'Все', fOff: 'Резервный', fLi: 'Интерактивный', fCap: 'Мощность', cap1: '≤ 1 кВА', cap2: '1–2 кВА', cap3: '> 2 кВА',
    noModels: 'Скоро здесь появятся модели — свяжитесь с нами, чтобы получить весь ассортимент.', noMatch: 'Нет подходящих моделей — напишите, что нужно, и мы предложим вариант.',
    cBattery: 'Батарея', cTransfer: 'Переключение', cWave: 'Форма сигнала', cSockets: 'Розетки', details: 'Подробнее', quote: 'Запросить цену',
    socketsEyebrow: 'Розетки под ваш рынок', socketsH: 'Шесть стандартов розеток, ставим на заводе', socketsP: 'Любую модель можно собрать с розетками ваших клиентов — до 10 на ИБП, без переходников.',
    vsEyebrow: 'Какой тип?', vsH: 'Резервный или линейно-интерактивный?',
    vs: {
      off: { tag: 'Резервный', h: 'Резервный (offline) ИБП', rows: [['Принцип', 'Пропускает сеть напрямую и переходит на батарею при отключении'], ['Скачки напряжения', 'Базовый AVR у большинства моделей'], ['Переключение', 'Обычно 4–8 мс'], ['Цена', 'Самая низкая стоимость за ВА']], best: 'Для дома, роутеров и магазинов со стабильной сетью' },
      li: { tag: 'Интерактивный', h: 'Линейно-интерактивный ИБП', rows: [['Принцип', 'Корректирует повышенное и пониженное напряжение без батареи'], ['Скачки напряжения', 'Многоступенчатый AVR, батарея служит дольше'], ['Переключение', 'Обычно 2–6 мс'], ['Цена', 'Немного выше, защита лучше']], best: 'Для офисов, касс, видеонаблюдения и нестабильной сети' },
    },
    compareEyebrow: 'Характеристики', compareH: 'Сравнение моделей',
    appsEyebrow: 'Применение', appsH: 'Где резервный ИБП особенно нужен',
    apps: ['Домашние и игровые ПК', 'Магазины и кассы', 'Офисы', 'Видеонаблюдение', 'Интернет и Wi-Fi', 'Игровые приставки'],
    oemEyebrow: 'OEM для импортёров', oemH: 'Ваш бренд, ваши розетки, ваша коробка',
    oem: [['Логотип и цвет', 'Шелкография или лазер, цвет передней панели на заказ'], ['Розетки', 'Любой из 6 стандартов, до 10 на ИБП'], ['LED или LCD', 'Индикация под вашу цену'], ['Батарея', 'Ёмкость и количество под нужное время работы'], ['Интерфейсы', 'USB / RS-232, защита RJ45'], ['Упаковка', 'Цветная коробка и инструкция на вашем языке']],
    oemCtaH: 'Начать OEM-заказ', oemCtaP: 'OEM от 1000 шт. Образец стоит 3 000 USD и полностью возвращается при серийном заказе.', oemCta: 'Запросить OEM-предложение',
    ctaH: 'Нужно коммерческое предложение?', ctaP: 'Пришлите мощность, тип розеток и количество — ответим в WhatsApp в тот же день.',
    qTitle: 'Запросить цену', qQty: 'Количество', pcs: 'шт.', qSockets: 'Розетки', qSocketHint: 'Показана стандартная конфигурация. Измените тип или количество (до 10).',
    qCount: 'Количество розеток', qNotes: 'Примечания (необязательно)', qNotesPh: 'Бренд, индикация, батарея, страна доставки…', qSend: 'Узнать цену в WhatsApp', qMail: 'Запросить по email',
    qOem: 'OEM с вашим логотипом от 1000 шт. · образец 3 000 USD, возвращается при серийном заказе', qPrice: 'Цена по запросу · FOB Китай',
    qMsg: 'Здравствуйте, прошу коммерческое предложение на {m}:', lQty: 'Количество', lSockets: 'Розетки', lNotes: 'Примечания',
    banner: 'Ваш бренд на этой модели?', bannerCta: 'OEM от 1000 шт.',
    spec: {
      outputPower: 'Мощность', acInputVoltage: 'Входное напряжение', inputVoltageRange: 'Диапазон входного напряжения', inputFrequency: 'Входная частота', outputVoltage: 'Выходное напряжение',
      outputVoltageRange: 'Стабилизация выхода', waveform: 'Форма сигнала (от батареи)', transferTime: 'Время переключения', frequencyRangeBatteryMode: 'Частота (от батареи)',
      batteryVoltage: 'Напряжение батареи', batterySpec: 'Батарея', chargeCurrent: 'Ток заряда', chargeTime: 'Время заряда', ledDisplay: 'LED-индикация', lcdDisplay: 'LCD-дисплей',
      fullProtection: 'Защиты', alarmInfo: 'Звуковые сигналы', interfacePort: 'Интерфейс', noiseLevel: 'Шум', humidity: 'Влажность', dimensions: 'Габариты (мм)', netWeight: 'Вес нетто (кг)',
      sockets: 'Розетки (стандарт)', model: 'Модель', type: 'Тип',
    },
  },
};

const hasZh = (s) => /[一-鿿]/.test(String(s || ''));
// 参数值：带中文的用接口给的译文；没有译文就不显示（不把中文展示给客户）
export function specValue(p, field, lang) {
  const v = p[field];
  if (v === undefined || v === null || v === '') return '';
  if (!hasZh(v)) return String(v);
  const t = p.specI18n && p.specI18n[field];
  return (t && (t[lang] || t.en)) || '';
}
