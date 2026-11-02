// 在线式高频 UPS 栏目（塔式，真双变换在线式）：在机架式 UPS 的文字（RT）基础上覆盖本栏目自己的内容（三语）
// 产品来自客户档案系统，细分品类 = 在线式高频UPS。
import { RT } from './rack-i18n.mjs';

// 选型助手里的常见设备（W，典型满载功耗的保守值）
export const ONLINE_DEVICES = [
  { id: 'pc', w: 300 }, { id: 'srv', w: 450 }, { id: 'net', w: 150 },
  { id: 'cctv', w: 250 }, { id: 'med', w: 600 }, { id: 'plc', w: 200 },
];

const EN = {
  nav: 'Online UPS (high-frequency)', title: 'Online high-frequency UPS',
  metaDesc: 'Online double-conversion high-frequency tower UPS, 1–30 kVA: 0 ms transfer, pure sine wave, PF 0.9 / 1.0, wide input voltage, standard and long-run models, single- and three-phase. Factory direct from China.',
  eyebrow: 'Online high-frequency UPS', h1a: 'Clean, unbroken power ', h1b: 'for every critical load',
  lead: 'True online double-conversion in a compact tower: the inverter powers your equipment all the time, so blackouts, brownouts and spikes never reach it. Single-phase and three-phase, internal batteries or external banks for hours of runtime.',
  ctaModels: 'See all models', ctaSizer: 'Size my UPS',
  facts: { range: 'Capacity range', transfer: 'Transfer time', pf: 'Output power factor', phase: 'Input / output phases' },
  sizerEyebrow: 'Load planner', sizerH: 'Which online UPS do I need?', sizerP: 'Add your equipment and pick the runtime. We add a 25% margin and size the external battery bank for long-run models.',
  devices: { pc: 'PC / workstation', srv: 'Small server', net: 'Router & switches', cctv: 'CCTV (NVR + cameras)', med: 'Medical / lab instrument', plc: 'PLC / control panel' },
  modelsH: 'Online high-frequency range', fPhase: 'Phases', cap1: '≤ 3 kVA', cap2: '4–10 kVA', cap3: '> 10 kVA',
  blocks: { ...RT.en.blocks, load: 'Your equipment' },
  featEyebrow: 'Why online high-frequency', featH: 'Professional protection in a compact tower',
  feats: [
    ['0 ms transfer', 'The inverter is always on, so computers, servers and instruments never see a break — not even a few milliseconds.'],
    ['Wide input, clean output', 'Works through brownouts, surges and generator power; the output stays a regulated pure sine wave with high power factor.'],
    ['Standard or long-run', 'Internal batteries for short outages, or a high-current charger and external battery bank for hours of runtime.'],
    ['Compact and efficient', 'High-frequency design without a heavy transformer: smaller, lighter and more efficient — ECO mode on many models.'],
  ],
  vsEyebrow: 'Which type?', vsH: 'Line-interactive, online high-frequency or industrial?',
  vs: {
    li: { tag: 'Line-interactive', h: 'Line-interactive UPS', rows: [['Load runs on', 'Mains, corrected by AVR'], ['Transfer time', '2–6 ms'], ['Best for', 'PCs, POS, small offices']], best: 'Budget protection for simple loads' },
    on: { tag: 'Online HF', h: 'Online high-frequency', rows: [['Load runs on', 'Inverter, always'], ['Transfer time', '0 ms'], ['Best for', 'Servers, network, medical, CCTV']], best: 'The standard for sensitive equipment' },
    lf: { tag: 'Industrial', h: 'Industrial-frequency (transformer)', rows: [['Load runs on', 'Inverter + isolation transformer'], ['Transfer time', '0 ms'], ['Best for', 'Motors, drives, harsh sites']], best: 'Heavy industry and surge loads' },
  },
  seeOffline: 'Offline & line-interactive UPS →', seeInd: 'Industrial UPS →', seeRack: 'Rack-mount online UPS →',
  appsH: 'Where online high-frequency UPS are used',
  apps: ['Offices & server rooms', 'Network & telecom', 'CCTV & security', 'Medical & laboratory', 'Banks & retail', 'Industrial control'],
  projEyebrow: 'Quote', projH: 'Tell us what you need',
  proj: [['Capacity', 'kVA, or your load in watts'], ['Phases', '1/1, 3/1 or 3/3'], ['Voltage', '220 / 230 / 240 V or 380 / 400 / 415 V'], ['Runtime', 'Internal batteries or external bank'], ['Monitoring', 'USB / RS-232, SNMP card, dry contacts'], ['Quantity', 'Pieces per order']],
  projCtaH: 'Get a quote today', projCtaP: 'Send the capacity, voltage, runtime and quantity — we reply on WhatsApp the same day.', projCta: 'Ask on WhatsApp',
  projMsg: 'Hello, I need an online UPS quote:\n• Capacity: \n• Phases / voltage: \n• Runtime: \n• Quantity: ',
  ctaH: 'Need a quote?', ctaP: 'Send us the capacity, voltage, runtime and quantity — we reply on WhatsApp the same day.',
  qVoltHint: 'Choose the voltage on site.', qNotesPh: 'Runtime needed, battery bank, SNMP card…', qOem: 'Price on request · quantity discounts', banner: 'Size this UPS for your load', bannerCta: 'Load planner',
  phaseTag: { '11': '1/1', '31': '3/1', '33': '3/3' }, phaseName: { '11': 'Single-phase in & out', '31': 'Three-phase in, single out', '33': 'Three-phase in & out' },
};

const ES = {
  nav: 'UPS online (alta frecuencia)', title: 'UPS online de alta frecuencia',
  metaDesc: 'UPS torre online de doble conversión y alta frecuencia, 1–30 kVA: transferencia 0 ms, onda senoidal pura, FP 0,9 / 1,0, amplio rango de entrada, modelos estándar y de larga autonomía, monofásicos y trifásicos. Directo de fábrica en China.',
  eyebrow: 'UPS online de alta frecuencia', h1a: 'Energía limpia y sin cortes ', h1b: 'para cada carga crítica',
  lead: 'Doble conversión online real en una torre compacta: el inversor alimenta sus equipos todo el tiempo, así los apagones, bajones y picos nunca les llegan. Monofásicos y trifásicos, baterías internas o bancos externos para horas de autonomía.',
  ctaModels: 'Ver todos los modelos', ctaSizer: 'Dimensionar mi UPS',
  facts: { range: 'Rango de capacidad', transfer: 'Tiempo de transferencia', pf: 'Factor de potencia de salida', phase: 'Fases de entrada / salida' },
  sizerEyebrow: 'Planificador de carga', sizerH: '¿Qué UPS online necesito?', sizerP: 'Añada sus equipos y elija la autonomía. Sumamos un 25% de margen y calculamos el banco de baterías externo para los modelos de larga autonomía.',
  devices: { pc: 'PC / estación de trabajo', srv: 'Servidor pequeño', net: 'Router y switches', cctv: 'CCTV (NVR + cámaras)', med: 'Equipo médico / de laboratorio', plc: 'PLC / tablero de control' },
  modelsH: 'Gama online de alta frecuencia', fPhase: 'Fases', cap1: '≤ 3 kVA', cap2: '4–10 kVA', cap3: '> 10 kVA',
  blocks: { ...RT.es.blocks, load: 'Sus equipos' },
  featEyebrow: 'Por qué online de alta frecuencia', featH: 'Protección profesional en una torre compacta',
  feats: [
    ['Transferencia 0 ms', 'El inversor siempre está encendido: computadoras, servidores e instrumentos nunca ven un corte, ni siquiera de unos milisegundos.'],
    ['Entrada amplia, salida limpia', 'Funciona con bajones, picos y generador; la salida es siempre una senoidal pura regulada con alto factor de potencia.'],
    ['Estándar o larga autonomía', 'Baterías internas para cortes breves, o cargador de alta corriente y banco de baterías externo para horas de autonomía.'],
    ['Compacto y eficiente', 'Diseño de alta frecuencia sin transformador pesado: más pequeño, liviano y eficiente, con modo ECO en muchos modelos.'],
  ],
  vsEyebrow: '¿Qué tipo?', vsH: '¿Interactivo, online de alta frecuencia o industrial?',
  vs: {
    li: { tag: 'Interactivo', h: 'UPS interactivo', rows: [['La carga funciona con', 'Red, corregida por AVR'], ['Transferencia', '2–6 ms'], ['Ideal para', 'PC, POS, oficinas pequeñas']], best: 'Protección económica para cargas simples' },
    on: { tag: 'Online AF', h: 'Online de alta frecuencia', rows: [['La carga funciona con', 'El inversor, siempre'], ['Transferencia', '0 ms'], ['Ideal para', 'Servidores, redes, medicina, CCTV']], best: 'El estándar para equipos sensibles' },
    lf: { tag: 'Industrial', h: 'Frecuencia industrial (transformador)', rows: [['La carga funciona con', 'Inversor + transformador de aislamiento'], ['Transferencia', '0 ms'], ['Ideal para', 'Motores, variadores, sitios exigentes']], best: 'Industria pesada y cargas con picos' },
  },
  seeOffline: 'UPS off-line e interactivos →', seeInd: 'UPS industrial →', seeRack: 'UPS online para rack →',
  appsH: 'Dónde se usan los UPS online de alta frecuencia',
  apps: ['Oficinas y salas de servidores', 'Redes y telecom', 'CCTV y seguridad', 'Medicina y laboratorios', 'Bancos y comercio', 'Control industrial'],
  projEyebrow: 'Cotización', projH: 'Cuéntenos qué necesita',
  proj: [['Capacidad', 'kVA, o su carga en vatios'], ['Fases', '1/1, 3/1 o 3/3'], ['Tensión', '220 / 230 / 240 V o 380 / 400 / 415 V'], ['Autonomía', 'Baterías internas o banco externo'], ['Monitoreo', 'USB / RS-232, tarjeta SNMP, contactos secos'], ['Cantidad', 'Unidades por pedido']],
  projCtaH: 'Reciba una cotización hoy', projCtaP: 'Envíe capacidad, tensión, autonomía y cantidad: respondemos por WhatsApp el mismo día.', projCta: 'Consultar por WhatsApp',
  projMsg: 'Hola, necesito una cotización de UPS online:\n• Capacidad: \n• Fases / tensión: \n• Autonomía: \n• Cantidad: ',
  ctaH: '¿Necesita una cotización?', ctaP: 'Envíenos capacidad, tensión, autonomía y cantidad: respondemos por WhatsApp el mismo día.',
  qVoltHint: 'Elija la tensión del sitio.', qNotesPh: 'Autonomía, banco de baterías, tarjeta SNMP…', qOem: 'Precio a consultar · descuentos por cantidad', banner: 'Dimensione este UPS para su carga', bannerCta: 'Planificador',
  phaseTag: { '11': '1/1', '31': '3/1', '33': '3/3' }, phaseName: { '11': 'Monofásico entrada y salida', '31': 'Entrada trifásica, salida monofásica', '33': 'Trifásico entrada y salida' },
};

const RU = {
  nav: 'Онлайн-ИБП (высокочастотные)', title: 'Высокочастотные онлайн-ИБП',
  metaDesc: 'Высокочастотные онлайн-ИБП двойного преобразования в корпусе tower, 1–30 кВА: переключение 0 мс, чистая синусоида, PF 0,9 / 1,0, широкий входной диапазон, стандартные и long-run модели, одно- и трёхфазные. Напрямую с завода в Китае.',
  eyebrow: 'Высокочастотный онлайн-ИБП', h1a: 'Чистое питание без перерывов ', h1b: 'для любой ответственной нагрузки',
  lead: 'Настоящее двойное преобразование в компактном корпусе: инвертор питает оборудование постоянно, поэтому отключения, просадки и скачки до него не доходят. Однофазные и трёхфазные, встроенные батареи или внешние блоки на часы автономии.',
  ctaModels: 'Все модели', ctaSizer: 'Подобрать ИБП',
  facts: { range: 'Диапазон мощности', transfer: 'Время переключения', pf: 'Выходной коэфф. мощности', phase: 'Фазы вход / выход' },
  sizerEyebrow: 'Расчёт нагрузки', sizerH: 'Какой онлайн-ИБП мне нужен?', sizerP: 'Добавьте оборудование и выберите автономию. Мы добавим 25% запаса и рассчитаем внешний блок батарей для long-run моделей.',
  devices: { pc: 'ПК / рабочая станция', srv: 'Небольшой сервер', net: 'Роутер и коммутаторы', cctv: 'Видеонаблюдение (NVR + камеры)', med: 'Медицинский / лабораторный прибор', plc: 'ПЛК / шкаф управления' },
  modelsH: 'Линейка высокочастотных онлайн-ИБП', fPhase: 'Фазы', cap1: '≤ 3 кВА', cap2: '4–10 кВА', cap3: '> 10 кВА',
  blocks: { ...RT.ru.blocks, load: 'Ваше оборудование' },
  featEyebrow: 'Почему высокочастотный онлайн', featH: 'Профессиональная защита в компактном корпусе',
  feats: [
    ['Переключение 0 мс', 'Инвертор работает всегда: компьютеры, серверы и приборы не замечают перерыва — даже в несколько миллисекунд.'],
    ['Широкий вход, чистый выход', 'Работает при просадках, скачках и от генератора; на выходе всегда стабилизированная синусоида с высоким коэффициентом мощности.'],
    ['Стандарт или long-run', 'Встроенные батареи для коротких отключений или мощное зарядное устройство и внешний блок батарей на часы работы.'],
    ['Компактный и экономичный', 'Высокочастотная схема без тяжёлого трансформатора: меньше, легче и с более высоким КПД, во многих моделях есть режим ECO.'],
  ],
  vsEyebrow: 'Какой тип?', vsH: 'Линейно-интерактивный, высокочастотный онлайн или промышленный?',
  vs: {
    li: { tag: 'Интерактивный', h: 'Линейно-интерактивный ИБП', rows: [['Нагрузка питается', 'От сети через AVR'], ['Переключение', '2–6 мс'], ['Для чего', 'ПК, кассы, небольшие офисы']], best: 'Бюджетная защита простых нагрузок' },
    on: { tag: 'Онлайн ВЧ', h: 'Высокочастотный онлайн', rows: [['Нагрузка питается', 'Всегда от инвертора'], ['Переключение', '0 мс'], ['Для чего', 'Серверы, сети, медицина, видеонаблюдение']], best: 'Стандарт для чувствительного оборудования' },
    lf: { tag: 'Промышленный', h: 'Промышленной частоты (трансформаторный)', rows: [['Нагрузка питается', 'Инвертор + разделительный трансформатор'], ['Переключение', '0 мс'], ['Для чего', 'Двигатели, приводы, тяжёлые условия']], best: 'Тяжёлая промышленность и пусковые токи' },
  },
  seeOffline: 'Резервные и интерактивные ИБП →', seeInd: 'Промышленные ИБП →', seeRack: 'Онлайн-ИБП для стойки →',
  appsH: 'Где применяются высокочастотные онлайн-ИБП',
  apps: ['Офисы и серверные', 'Сети и телеком', 'Видеонаблюдение и охрана', 'Медицина и лаборатории', 'Банки и торговля', 'Промышленная автоматика'],
  projEyebrow: 'Запрос цены', projH: 'Расскажите, что вам нужно',
  proj: [['Мощность', 'кВА или нагрузка в ваттах'], ['Фазы', '1/1, 3/1 или 3/3'], ['Напряжение', '220 / 230 / 240 В или 380 / 400 / 415 В'], ['Автономия', 'Встроенные батареи или внешний блок'], ['Мониторинг', 'USB / RS-232, карта SNMP, сухие контакты'], ['Количество', 'Штук в заказе']],
  projCtaH: 'Получите цену сегодня', projCtaP: 'Пришлите мощность, напряжение, автономию и количество — ответим в WhatsApp в тот же день.', projCta: 'Спросить в WhatsApp',
  projMsg: 'Здравствуйте, нужна цена на онлайн-ИБП:\n• Мощность: \n• Фазы / напряжение: \n• Автономия: \n• Количество: ',
  ctaH: 'Нужна цена?', ctaP: 'Пришлите мощность, напряжение, автономию и количество — ответим в WhatsApp в тот же день.',
  qVoltHint: 'Выберите напряжение на объекте.', qNotesPh: 'Нужная автономия, блок батарей, карта SNMP…', qOem: 'Цена по запросу · скидки от количества', banner: 'Подберите этот ИБП под нагрузку', bannerCta: 'Расчёт нагрузки',
  phaseTag: { '11': '1/1', '31': '3/1', '33': '3/3' }, phaseName: { '11': 'Однофазный вход и выход', '31': 'Трёхфазный вход, однофазный выход', '33': 'Трёхфазный вход и выход' },
};

export const OL = { en: { ...RT.en, ...EN }, es: { ...RT.es, ...ES }, ru: { ...RT.ru, ...RU } };
