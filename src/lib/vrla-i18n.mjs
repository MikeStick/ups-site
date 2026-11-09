// 12V 铅酸（VRLA）电池栏目（/batteries/vrla/）：页面文字、三个选型工具（UPS 后备 / 光伏电池组 / 按 Ah 找）、系列介绍、常见问题（三语）。
// 产品来自客户档案系统，细分品类 = 铅酸电池（型号如 SK250-12 / SK250-12v）。系列、容量率、放电表在产品的 extraSpecs 里。
export const VR = {
  en: {
    nav: '12V lead-acid (VRLA)', title: '12V VRLA lead-acid batteries', crumbs: 'Products', crumbBatt: 'Batteries',
    metaDesc: '12V sealed VRLA lead-acid batteries from 17 Ah to 250 Ah: AGM standby, deep-cycle and gel, high-rate UPS and front-terminal batteries. Calculate UPS backup time and solar battery banks online. Factory direct from China.',
    eyebrow: 'Sealed lead-acid · 12 V', h1a: 'Batteries for UPS, telecom and solar — ', h1b: 'sized for your backup time',
    lead: 'Maintenance-free 12 V VRLA batteries in standard sizes from 17 Ah to 250 Ah. Tell us the load and the backup time, and we show how many batteries you need and which capacity.',
    ctaFinder: 'Calculate backup time', ctaModels: 'See all models',
    facts: { v: 'Nominal voltage', ah: 'Capacity range', models: 'Models', rate: 'Capacity rating', life: 'Design life (float)' },
    lifeVal: '8+ years',
    modelsEyebrow: 'Models', modelsH: 'All 12V VRLA batteries', tabAll: 'All', allSeries: 'All series', quote: 'Quote', seeModels: 'See models', rateSeries: '{r}HR series', modelsN: 'models',
    rateNote: '10HR / 20HR = rated capacity at the 10-hour or 20-hour discharge rate. Models ending in “v” (e.g. SK100-12v) are rated at 20HR, the others (e.g. SK100-12) at 10HR.',
    th: { model: 'Model', rate: 'Rate', ah: 'Capacity', dims: 'L × W × H / TH (mm)', kg: 'Weight', term: 'Terminal', life: 'Design life', series: 'Series' },
    seriesName: { agm: 'AGM standby', deep: 'Deep cycle', gel: 'Gel', hr: 'High-rate (HR)', front: 'Front terminal' },
    seriesEyebrow: 'Series', seriesH: 'Choose the series for your application',
    series: [
      ['agm', 'AGM standby', 'For UPS, alarm, emergency lighting and control systems on float charge. Low self-discharge, maintenance-free.'],
      ['hr', 'High-rate (HR)', 'Designed for the high currents of a UPS — more power in the first 5–30 minutes, sized by watts per battery.'],
      ['deep', 'Deep cycle / gel', 'For solar, off-grid and frequent cycling. Better recovery from deep discharge and a longer cycle life.'],
      ['front', 'Front terminal', 'Slim batteries with terminals at the front, for 19" and 23" telecom and data racks.'],
    ],
    vsH: 'Lead-acid or LiFePO4?', vsP: 'Lead-acid has the lowest purchase price and is the standard for UPS. If weight, space or cycle life matter more, see our LiFePO4 batteries in the same sizes.', vsLink: 'LiFePO4 lead-acid replacement →',
    appsEyebrow: 'Applications', appsH: 'Where our VRLA batteries are used',
    apps: ['UPS & data centres', 'Telecom & base stations', 'Solar & off-grid', 'Security & fire alarms', 'Emergency lighting', 'Power & railway'],
    faqEyebrow: 'FAQ', faqH: 'Questions about VRLA batteries',
    faq: [
      ['What is the difference between 10HR and 20HR?', 'It is the discharge rate used to rate the capacity. A battery rated 250 Ah at 20HR delivers 250 Ah over 20 hours; at the 10-hour rate it delivers a little less. Compare batteries at the same rate, and for UPS use the constant-power (W) data.'],
      ['How many batteries does my UPS need?', 'Divide the UPS battery voltage by 12 V: a 192 V UPS uses 16 batteries in series. Use the calculator above to choose the capacity for your load and backup time.'],
      ['How long do VRLA batteries last?', 'Our standby batteries have a design life of 8 years or more on float charge at 25 °C. High temperatures shorten the life: every 10 °C above 25 °C roughly halves it.'],
      ['Can I mix old and new batteries?', 'No. Use batteries of the same model and age in one string, and replace the whole string together.'],
      ['Can they be shipped by air or sea?', 'Sealed VRLA batteries are normally shipped as non-dangerous goods with the proper certificates. Tell us your destination and we confirm.'],
    ],
    projEyebrow: 'Quote', projH: 'Send us your project',
    proj: [['Battery size', 'Voltage and Ah, or the old model'], ['Quantity', 'Pieces or strings'], ['Application', 'UPS, telecom, solar…'], ['UPS / load', 'Model, kVA and backup time'], ['Terminals', 'M6 / M8 / F2 / front terminal'], ['Branding', 'OEM label if needed']],
    projCtaH: 'Get a battery quote', projCtaP: 'We reply with the matching batteries and quantity for your application — usually the same day.', projCta: 'Ask on WhatsApp',
    projMsg: 'Hello, I need a 12V VRLA battery quote:\n• Battery size (Ah) or old model: \n• Quantity: \n• Application: ',
    ctaH: 'Need a quote?', ctaP: 'Send us the battery size and quantity — we reply on WhatsApp the same day.',
    qMsg: 'Hello, I would like a quote for the {m} battery:',
    banner: 'Calculate how many batteries your UPS needs', bannerCta: 'Backup calculator',
    c: {
      eyebrow: 'Battery calculator', h: 'How many batteries, which capacity?',
      p: 'Calculate the batteries for a UPS backup time or a solar battery bank, or find the model for the battery you have now.',
      tabs: { ups: 'UPS backup time', solar: 'Solar battery bank', find: 'Find by Ah' },
      load: 'Load', loadU: 'W', va: 'or VA', pf: 'PF', mins: 'Backup time', minU: 'min', dc: 'UPS battery voltage', dcHint: '= {n} batteries in series', rate: 'Rated at', rateAny: 'Any',
      daily: 'Daily consumption', dailyU: 'kWh', days: 'Days of autonomy', dayU: 'day(s)', sys: 'System voltage',
      ah: 'Your battery', ahU: 'Ah',
      out: {
        best: 'Recommended', alt: 'Other options', cfg: '{n} × {m}', strings: '{s} strings in parallel', string1: '1 string', runtime: 'Backup time', perBatt: 'Per battery', est: 'estimated from a typical curve — confirm with us', total: 'Total', none: 'This load is too high for {n} batteries of these sizes — use a higher UPS voltage or ask us.',
        need: 'Capacity needed', cfgL: 'Configuration', bankCfg: '{s} in series × {p} in parallel', energy: 'Energy', usable: 'Usable (50%)', weight: 'Weight',
        same: 'Our model', smaller: 'Smaller', larger: 'Larger', dims: 'Size', tooBig: 'Above {ah} Ah — connect batteries in parallel or ask us.', li: 'Same size in LiFePO4 →', enter: 'Enter the values above.', table: 'Backup time at other loads', loadCol: 'Load', timeCol: 'Backup',
      },
      send: 'Send this to us', msgUps: 'Hello, I need batteries for a UPS:\n• Load: {w} W, backup {min} min, UPS {dc} V\n• Batteries: {cfg} (≈ {rt} min)\n• Quantity of UPS: ', msgSolar: 'Hello, I need a solar battery bank:\n• {daily} kWh/day × {days} day(s), {v} V\n• Batteries: {cfg}', msgFind: 'Hello, I need a replacement for a 12V {ah}Ah battery:\n• Our model: {m}\n• Quantity: ',
      assumeH: 'How we calculate', assume: ['UPS: inverter efficiency 92%, end voltage 1.75 V per cell (10.5 V per battery); runtime from the battery\'s constant-power discharge table at 25 °C.', 'Solar: 50% depth of discharge and 85% system efficiency for a long battery life.', 'Estimates for selection only — we confirm the final configuration with you.'],
    },
  },
  es: {
    nav: 'Plomo-ácido 12V (VRLA)', title: 'Baterías de plomo-ácido VRLA 12V', crumbs: 'Productos', crumbBatt: 'Baterías',
    metaDesc: 'Baterías selladas VRLA de plomo-ácido 12V de 17 Ah a 250 Ah: AGM standby, ciclo profundo y gel, alta descarga para UPS y terminal frontal. Calcule la autonomía del UPS y bancos solares en línea. Directo de fábrica en China.',
    eyebrow: 'Plomo-ácido sellado · 12 V', h1a: 'Baterías para UPS, telecom y solar — ', h1b: 'dimensionadas para su autonomía',
    lead: 'Baterías VRLA de 12 V libres de mantenimiento en tamaños estándar de 17 Ah a 250 Ah. Indíquenos la carga y la autonomía, y le mostramos cuántas baterías necesita y de qué capacidad.',
    ctaFinder: 'Calcular autonomía', ctaModels: 'Ver todos los modelos',
    facts: { v: 'Tensión nominal', ah: 'Rango de capacidad', models: 'Modelos', rate: 'Capacidad nominal', life: 'Vida útil de diseño (flotación)' },
    lifeVal: '8+ años',
    modelsEyebrow: 'Modelos', modelsH: 'Todas las baterías VRLA 12V', tabAll: 'Todas', allSeries: 'Todas las series', quote: 'Cotizar', seeModels: 'Ver modelos', rateSeries: 'Serie {r}HR', modelsN: 'modelos',
    rateNote: '10HR / 20HR = capacidad nominal a la tasa de descarga de 10 o 20 horas. Los modelos terminados en «v» (p. ej. SK100-12v) son 20HR; los demás (p. ej. SK100-12), 10HR.',
    th: { model: 'Modelo', rate: 'Tasa', ah: 'Capacidad', dims: 'L × A × H / HT (mm)', kg: 'Peso', term: 'Terminal', life: 'Vida de diseño', series: 'Serie' },
    seriesName: { agm: 'AGM standby', deep: 'Ciclo profundo', gel: 'Gel', hr: 'Alta descarga (HR)', front: 'Terminal frontal' },
    seriesEyebrow: 'Series', seriesH: 'Elija la serie para su aplicación',
    series: [
      ['agm', 'AGM standby', 'Para UPS, alarmas, iluminación de emergencia y sistemas de control en flotación. Baja autodescarga, sin mantenimiento.'],
      ['hr', 'Alta descarga (HR)', 'Diseñadas para las altas corrientes de un UPS: más potencia en los primeros 5–30 minutos, se dimensionan por vatios por batería.'],
      ['deep', 'Ciclo profundo / gel', 'Para solar, sistemas aislados y ciclos frecuentes. Mejor recuperación tras descargas profundas y más ciclos de vida.'],
      ['front', 'Terminal frontal', 'Baterías delgadas con terminales al frente, para racks de telecom y datos de 19" y 23".'],
    ],
    vsH: '¿Plomo-ácido o LiFePO4?', vsP: 'El plomo-ácido tiene el menor precio de compra y es el estándar para UPS. Si importan más el peso, el espacio o los ciclos, vea nuestras baterías LiFePO4 en los mismos tamaños.', vsLink: 'Reemplazo LiFePO4 de plomo-ácido →',
    appsEyebrow: 'Aplicaciones', appsH: 'Dónde se usan nuestras baterías VRLA',
    apps: ['UPS y centros de datos', 'Telecom y estaciones base', 'Solar y sistemas aislados', 'Seguridad y alarmas de incendio', 'Iluminación de emergencia', 'Energía y ferrocarril'],
    faqEyebrow: 'Preguntas', faqH: 'Preguntas sobre baterías VRLA',
    faq: [
      ['¿Qué diferencia hay entre 10HR y 20HR?', 'Es la tasa de descarga usada para indicar la capacidad. Una batería de 250 Ah a 20HR entrega 250 Ah en 20 horas; a la tasa de 10 horas entrega algo menos. Compare baterías a la misma tasa y, para UPS, use los datos de potencia constante (W).'],
      ['¿Cuántas baterías necesita mi UPS?', 'Divida la tensión de baterías del UPS entre 12 V: un UPS de 192 V usa 16 baterías en serie. Use la calculadora para elegir la capacidad según su carga y autonomía.'],
      ['¿Cuánto duran las baterías VRLA?', 'Nuestras baterías standby tienen una vida de diseño de 8 años o más en flotación a 25 °C. Las temperaturas altas la acortan: cada 10 °C por encima de 25 °C la reduce aproximadamente a la mitad.'],
      ['¿Puedo mezclar baterías viejas y nuevas?', 'No. Use baterías del mismo modelo y antigüedad en una cadena, y reemplace la cadena completa.'],
      ['¿Se pueden enviar por aire o mar?', 'Las baterías VRLA selladas normalmente se envían como mercancía no peligrosa con los certificados correspondientes. Indíquenos su destino y lo confirmamos.'],
    ],
    projEyebrow: 'Cotización', projH: 'Envíenos su proyecto',
    proj: [['Tamaño', 'Tensión y Ah, o el modelo anterior'], ['Cantidad', 'Piezas o cadenas'], ['Aplicación', 'UPS, telecom, solar…'], ['UPS / carga', 'Modelo, kVA y autonomía'], ['Terminales', 'M6 / M8 / F2 / frontal'], ['Marca', 'Etiqueta OEM si la necesita']],
    projCtaH: 'Cotizar baterías', projCtaP: 'Le respondemos con las baterías y la cantidad adecuadas para su aplicación, normalmente el mismo día.', projCta: 'Consultar por WhatsApp',
    projMsg: 'Hola, necesito cotización de baterías VRLA 12V:\n• Tamaño (Ah) o modelo anterior: \n• Cantidad: \n• Aplicación: ',
    ctaH: '¿Necesita una cotización?', ctaP: 'Envíenos el tamaño y la cantidad; le respondemos por WhatsApp el mismo día.',
    qMsg: 'Hola, quisiera una cotización de la batería {m}:',
    banner: 'Calcule cuántas baterías necesita su UPS', bannerCta: 'Calculadora de autonomía',
    c: {
      eyebrow: 'Calculadora de baterías', h: '¿Cuántas baterías y de qué capacidad?',
      p: 'Calcule las baterías para la autonomía de un UPS o un banco solar, o encuentre el modelo para la batería que tiene ahora.',
      tabs: { ups: 'Autonomía de UPS', solar: 'Banco solar', find: 'Buscar por Ah' },
      load: 'Carga', loadU: 'W', va: 'o VA', pf: 'FP', mins: 'Autonomía', minU: 'min', dc: 'Tensión de baterías del UPS', dcHint: '= {n} baterías en serie', rate: 'Capacidad a', rateAny: 'Cualquiera',
      daily: 'Consumo diario', dailyU: 'kWh', days: 'Días de autonomía', dayU: 'día(s)', sys: 'Tensión del sistema',
      ah: 'Su batería', ahU: 'Ah',
      out: {
        best: 'Recomendado', alt: 'Otras opciones', cfg: '{n} × {m}', strings: '{s} cadenas en paralelo', string1: '1 cadena', runtime: 'Autonomía', perBatt: 'Por batería', est: 'estimado con una curva típica; confírmelo con nosotros', total: 'Total', none: 'Esta carga es demasiado alta para {n} baterías de estos tamaños; use una tensión de UPS mayor o consúltenos.',
        need: 'Capacidad necesaria', cfgL: 'Configuración', bankCfg: '{s} en serie × {p} en paralelo', energy: 'Energía', usable: 'Útil (50%)', weight: 'Peso',
        same: 'Nuestro modelo', smaller: 'Más pequeña', larger: 'Más grande', dims: 'Tamaño', tooBig: 'Más de {ah} Ah: conecte baterías en paralelo o consúltenos.', li: 'Mismo tamaño en LiFePO4 →', enter: 'Introduzca los valores arriba.', table: 'Autonomía con otras cargas', loadCol: 'Carga', timeCol: 'Autonomía',
      },
      send: 'Enviarnos esto', msgUps: 'Hola, necesito baterías para un UPS:\n• Carga: {w} W, autonomía {min} min, UPS {dc} V\n• Baterías: {cfg} (≈ {rt} min)\n• Cantidad de UPS: ', msgSolar: 'Hola, necesito un banco de baterías solar:\n• {daily} kWh/día × {days} día(s), {v} V\n• Baterías: {cfg}', msgFind: 'Hola, necesito reemplazar una batería de 12V {ah}Ah:\n• Su modelo: {m}\n• Cantidad: ',
      assumeH: 'Cómo calculamos', assume: ['UPS: eficiencia del inversor 92 %, tensión final 1,75 V por celda (10,5 V por batería); autonomía según la tabla de descarga a potencia constante a 25 °C.', 'Solar: 50 % de profundidad de descarga y 85 % de eficiencia del sistema para una larga vida.', 'Estimaciones solo para selección; confirmamos la configuración final con usted.'],
    },
  },
  ru: {
    nav: 'Свинцовые 12V (VRLA)', title: 'Свинцово-кислотные батареи VRLA 12V', crumbs: 'Продукция', crumbBatt: 'Батареи',
    metaDesc: 'Герметичные свинцово-кислотные батареи VRLA 12V от 17 до 250 А·ч: AGM для буферного режима, циклические и гелевые, высокотоковые для ИБП и с фронтальными клеммами. Онлайн-расчёт времени автономии ИБП и батарей для СЭС. Напрямую от завода в Китае.',
    eyebrow: 'Герметичные свинцовые · 12 В', h1a: 'Батареи для ИБП, связи и СЭС — ', h1b: 'под нужное время автономии',
    lead: 'Необслуживаемые батареи VRLA 12 В стандартных размеров от 17 до 250 А·ч. Укажите нагрузку и время автономии — покажем, сколько батарей нужно и какой ёмкости.',
    ctaFinder: 'Рассчитать автономию', ctaModels: 'Все модели',
    facts: { v: 'Номинальное напряжение', ah: 'Ёмкость', models: 'Моделей', rate: 'Режим ёмкости', life: 'Срок службы (буфер)' },
    lifeVal: '8+ лет',
    modelsEyebrow: 'Модели', modelsH: 'Все батареи VRLA 12V', tabAll: 'Все', allSeries: 'Все серии', quote: 'Цена', seeModels: 'Смотреть модели', rateSeries: 'Серия {r}HR', modelsN: 'моделей',
    rateNote: '10HR / 20HR — номинальная ёмкость при 10- или 20-часовом разряде. Модели с буквой «v» (например, SK100-12v) — 20HR, остальные (например, SK100-12) — 10HR.',
    th: { model: 'Модель', rate: 'Режим', ah: 'Ёмкость', dims: 'Д × Ш × В / ПВ (мм)', kg: 'Вес', term: 'Клеммы', life: 'Срок службы', series: 'Серия' },
    seriesName: { agm: 'AGM буферные', deep: 'Циклические', gel: 'Гелевые', hr: 'Высокотоковые (HR)', front: 'Фронтальные клеммы' },
    seriesEyebrow: 'Серии', seriesH: 'Выберите серию под задачу',
    series: [
      ['agm', 'AGM буферные', 'Для ИБП, сигнализации, аварийного освещения и систем управления в буферном режиме. Низкий саморазряд, без обслуживания.'],
      ['hr', 'Высокотоковые (HR)', 'Рассчитаны на большие токи ИБП: больше мощности в первые 5–30 минут, подбираются по ваттам на батарею.'],
      ['deep', 'Циклические / гелевые', 'Для СЭС, автономных систем и частых циклов. Лучше восстанавливаются после глубокого разряда, больше циклов.'],
      ['front', 'Фронтальные клеммы', 'Узкие батареи с клеммами спереди для стоек 19" и 23" в связи и ЦОД.'],
    ],
    vsH: 'Свинцовые или LiFePO4?', vsP: 'Свинцовые батареи дешевле при покупке и остаются стандартом для ИБП. Если важнее вес, место или ресурс циклов — смотрите наши LiFePO4 в тех же размерах.', vsLink: 'LiFePO4 на замену свинцовым →',
    appsEyebrow: 'Применение', appsH: 'Где используются наши батареи VRLA',
    apps: ['ИБП и ЦОД', 'Связь и базовые станции', 'СЭС и автономные системы', 'Охранная и пожарная сигнализация', 'Аварийное освещение', 'Энергетика и ж/д'],
    faqEyebrow: 'Вопросы', faqH: 'Вопросы о батареях VRLA',
    faq: [
      ['Чем отличаются 10HR и 20HR?', 'Это режим разряда, при котором указана ёмкость. Батарея 250 А·ч при 20HR отдаёт 250 А·ч за 20 часов; при 10-часовом разряде — немного меньше. Сравнивайте батареи в одном режиме, а для ИБП используйте данные разряда постоянной мощностью (Вт).'],
      ['Сколько батарей нужно моему ИБП?', 'Разделите напряжение батарей ИБП на 12 В: ИБП на 192 В использует 16 батарей последовательно. Ёмкость под нагрузку и время автономии подберите калькулятором.'],
      ['Сколько служат батареи VRLA?', 'Расчётный срок службы наших буферных батарей — 8 лет и более при 25 °C. Высокая температура сокращает срок: каждые 10 °C выше 25 °C уменьшают его примерно вдвое.'],
      ['Можно ли смешивать старые и новые батареи?', 'Нет. В одной цепочке используйте батареи одной модели и одного возраста и меняйте цепочку целиком.'],
      ['Можно отправить самолётом или морем?', 'Герметичные батареи VRLA обычно перевозятся как неопасный груз с соответствующими сертификатами. Укажите пункт назначения — мы подтвердим.'],
    ],
    projEyebrow: 'Запрос', projH: 'Пришлите ваш проект',
    proj: [['Размер', 'Напряжение и А·ч или старая модель'], ['Количество', 'Штук или цепочек'], ['Применение', 'ИБП, связь, СЭС…'], ['ИБП / нагрузка', 'Модель, кВА и время автономии'], ['Клеммы', 'M6 / M8 / F2 / фронтальные'], ['Брендирование', 'OEM-этикетка при необходимости']],
    projCtaH: 'Запросить цену на батареи', projCtaP: 'Ответим с подходящими батареями и количеством для вашей задачи — обычно в тот же день.', projCta: 'Написать в WhatsApp',
    projMsg: 'Здравствуйте, прошу цену на батареи VRLA 12V:\n• Размер (А·ч) или старая модель: \n• Количество: \n• Применение: ',
    ctaH: 'Нужна цена?', ctaP: 'Пришлите размер и количество батарей — ответим в WhatsApp в тот же день.',
    qMsg: 'Здравствуйте, прошу цену на батарею {m}:',
    banner: 'Рассчитайте, сколько батарей нужно вашему ИБП', bannerCta: 'Калькулятор автономии',
    c: {
      eyebrow: 'Калькулятор батарей', h: 'Сколько батарей и какой ёмкости?',
      p: 'Рассчитайте батареи под время автономии ИБП или батарейный банк для СЭС либо найдите модель на замену вашей батарее.',
      tabs: { ups: 'Автономия ИБП', solar: 'Банк для СЭС', find: 'Поиск по А·ч' },
      load: 'Нагрузка', loadU: 'Вт', va: 'или ВА', pf: 'cos φ', mins: 'Время автономии', minU: 'мин', dc: 'Напряжение батарей ИБП', dcHint: '= {n} батарей последовательно', rate: 'Ёмкость при', rateAny: 'Любой',
      daily: 'Суточное потребление', dailyU: 'кВт·ч', days: 'Дней автономии', dayU: 'дн.', sys: 'Напряжение системы',
      ah: 'Ваша батарея', ahU: 'А·ч',
      out: {
        best: 'Рекомендуем', alt: 'Другие варианты', cfg: '{n} × {m}', strings: '{s} цепочки параллельно', string1: '1 цепочка', runtime: 'Автономия', perBatt: 'На батарею', est: 'оценка по типовой кривой — уточните у нас', total: 'Итого', none: 'Нагрузка слишком велика для {n} батарей таких размеров — выберите ИБП с большим напряжением или спросите нас.',
        need: 'Нужная ёмкость', cfgL: 'Схема', bankCfg: '{s} последовательно × {p} параллельно', energy: 'Энергия', usable: 'Полезная (50%)', weight: 'Вес',
        same: 'Наша модель', smaller: 'Меньше', larger: 'Больше', dims: 'Размер', tooBig: 'Больше {ah} А·ч — соедините батареи параллельно или спросите нас.', li: 'Тот же размер в LiFePO4 →', enter: 'Введите значения выше.', table: 'Автономия при другой нагрузке', loadCol: 'Нагрузка', timeCol: 'Автономия',
      },
      send: 'Отправить нам', msgUps: 'Здравствуйте, нужны батареи для ИБП:\n• Нагрузка: {w} Вт, автономия {min} мин, ИБП {dc} В\n• Батареи: {cfg} (≈ {rt} мин)\n• Количество ИБП: ', msgSolar: 'Здравствуйте, нужен батарейный банк для СЭС:\n• {daily} кВт·ч/сутки × {days} дн., {v} В\n• Батареи: {cfg}', msgFind: 'Здравствуйте, нужна замена батареи 12V {ah}Ah:\n• Ваша модель: {m}\n• Количество: ',
      assumeH: 'Как мы считаем', assume: ['ИБП: КПД инвертора 92 %, конечное напряжение 1,75 В на элемент (10,5 В на батарею); время — по таблице разряда постоянной мощностью при 25 °C.', 'СЭС: глубина разряда 50 % и КПД системы 85 % для долгого срока службы.', 'Это оценка для подбора — окончательную конфигурацию подтвердим с вами.'],
    },
  },
};

// 产品详情页：规格表行名 + CRM 里中文 extraSpecs 标签的翻译（网站不显示未翻译的中文标签，所以这里把铅酸常用的几项对上）
export const VR_P = {
  en: { volt: 'Nominal voltage', cap: 'Rated capacity', series: 'Series', dims: 'Dimensions L × W × H / TH', kg: 'Weight', cells: 'Cells', dis: 'Discharge data at 25 °C', cp: 'Constant power (W per battery)', cc: 'Constant current (A)', endV: 'End voltage', perCell: 'cell', tech: 'Technology', techV: 'Sealed VRLA (AGM), maintenance-free' },
  es: { volt: 'Tensión nominal', cap: 'Capacidad nominal', series: 'Serie', dims: 'Dimensiones L × A × H / HT', kg: 'Peso', cells: 'Celdas', dis: 'Datos de descarga a 25 °C', cp: 'Potencia constante (W por batería)', cc: 'Corriente constante (A)', endV: 'Tensión final', perCell: 'celda', tech: 'Tecnología', techV: 'VRLA sellada (AGM), sin mantenimiento' },
  ru: { volt: 'Номинальное напряжение', cap: 'Номинальная ёмкость', series: 'Серия', dims: 'Размеры Д × Ш × В / ПВ', kg: 'Вес', cells: 'Элементов', dis: 'Разрядные характеристики при 25 °C', cp: 'Постоянная мощность (Вт на батарею)', cc: 'Постоянный ток (А)', endV: 'Конечное напряжение', perCell: 'эл.', tech: 'Технология', techV: 'Герметичная VRLA (AGM), необслуживаемая' },
};
export const VR_LABELS = [
  [/温度对容量/, { en: 'Capacity vs. temperature', es: 'Capacidad según temperatura', ru: 'Ёмкость при температуре' }],
  [/浮充.*温度补偿/, { en: 'Float temp. compensation', es: 'Compensación de temperatura (flotación)', ru: 'Термокомпенсация (буфер)' }],
  [/循环.*温度补偿/, { en: 'Cycle temp. compensation', es: 'Compensación de temperatura (cíclica)', ru: 'Термокомпенсация (цикл)' }],
  [/月自放电/, { en: 'Self-discharge per month', es: 'Autodescarga mensual', ru: 'Саморазряд в месяц' }],
  [/持续放电电流/, { en: 'Max continuous discharge current', es: 'Corriente máx. de descarga continua', ru: 'Макс. длительный ток разряда' }],
  [/设计寿命|浮充寿命/, { en: 'Design life (float, 25 °C)', es: 'Vida de diseño (flotación, 25 °C)', ru: 'Срок службы (буфер, 25 °C)' }],
  [/端子/, { en: 'Terminal', es: 'Terminal', ru: 'Клеммы' }],
  [/浮充电压/, { en: 'Float charge voltage', es: 'Tensión de flotación', ru: 'Напряжение буферного заряда' }],
  [/循环.*电压|均充电压/, { en: 'Cycle charge voltage', es: 'Tensión de carga cíclica', ru: 'Напряжение циклического заряда' }],
  [/最大充电电流|充电电流/, { en: 'Max charge current', es: 'Corriente máx. de carga', ru: 'Макс. ток заряда' }],
  [/内阻/, { en: 'Internal resistance', es: 'Resistencia interna', ru: 'Внутреннее сопротивление' }],
  [/自放电/, { en: 'Self-discharge', es: 'Autodescarga', ru: 'Саморазряд' }],
  [/外壳|壳体/, { en: 'Case material', es: 'Material de la caja', ru: 'Материал корпуса' }],
  [/最大放电电流|放电电流/, { en: 'Max discharge current', es: 'Corriente máx. de descarga', ru: 'Макс. ток разряда' }],
  [/工作温度|使用温度|运行温度/, { en: 'Operating temperature', es: 'Temperatura de trabajo', ru: 'Рабочая температура' }],
  [/参考重量|重量/, { en: 'Weight', es: 'Peso', ru: 'Вес' }],
  [/尺寸/, { en: 'Dimensions', es: 'Dimensiones', ru: 'Размеры' }],
];
// 值里常见的中文词（"月" "年" "以上"）换掉；还有中文就不显示
const VZH = [[/（/g, { en: ' (', es: ' (', ru: ' (' }], [/）/g, { en: ')', es: ')', ru: ')' }], [/，/g, { en: ', ', es: ', ', ru: ', ' }], [/充电\s*/g, { en: 'charge ', es: 'carga ', ru: 'заряд ' }], [/放电\s*/g, { en: 'discharge ', es: 'descarga ', ru: 'разряд ' }], [/储存\s*/g, { en: 'storage ', es: 'almacén ', ru: 'хранение ' }], [/满荷电/g, { en: 'fully charged', es: 'carga completa', ru: 'полный заряд' }], [/[；;]\s*/g, { en: '; ', es: '; ', ru: '; ' }], [/年以上|年\s*以上/g, { en: '+ years', es: '+ años', ru: '+ лет' }], [/每月|\/月/g, { en: '/month', es: '/mes', ru: '/мес.' }], [/年/g, { en: ' years', es: ' años', ru: ' лет' }], [/毫欧|mΩ/g, { en: ' mΩ', es: ' mΩ', ru: ' мОм' }]];
export function vrlaSpecRows(p, m, lang) {
  const L = VR_P[lang], T = VR[lang];
  const rows = [[T.th.model, p.model], [L.tech, L.techV], [L.volt, `${m.v} V`], [L.cap, `${m.ah} Ah (${m.rate}HR)`], [L.series, T.seriesName[m.series]]];
  if (m.dims.length) rows.push([L.dims, `${m.dims.slice(0, 3).join(' × ')}${m.dims[3] ? ` / ${m.dims[3]}` : ''} mm`]);
  // 重量后面的公差（如 7.3（1±3%））一起显示
  const tol = (String(p.moduleWeight || '').match(/[（(][^）)]*±[^）)]*[）)]/) || [''])[0].replace('（', '(').replace('）', ')');
  if (m.kg) rows.push([L.kg, `${m.kg} kg${tol ? ' ' + tol : ''}`]);
  const seen = new Set();
  for (const x of Array.isArray(p.extraSpecs) ? p.extraSpecs : []) {
    const lb = String(x.label || '');
    if (/恒功率|恒流|constant|容量率|电池系列|series|尺寸|重量|额定电压|额定容量/i.test(lb)) continue;
    const hit = VR_LABELS.find(([re]) => re.test(lb));
    const label = hit ? hit[1][lang] : /[一-鿿]/.test(lb) ? '' : lb;
    let v = String(x.value || '').trim();
    for (const [re, t] of VZH) v = v.replace(re, t[lang]);
    if (!label || !v || /[一-鿿]/.test(v) || seen.has(label)) continue;
    seen.add(label); rows.push([label, v.replace(/\*/g, ' × ')]);
  }
  return rows;
}
// 放电表：每种（恒功率 / 恒流）一张，行 = 终止电压，列 = 时间（所有行的时间并集）
export function vrlaTables(m, lang) {
  const L = VR_P[lang];
  const fmtT = (t) => (t >= 60 ? `${+(t / 60).toFixed(1)}h` : `${t}min`);
  return ['cp', 'cc'].map((k) => {
    const tb = m.tables[k] || {};
    const keys = Object.keys(tb).sort((a, b) => +a - +b);
    if (!keys.length) return null;
    const times = [...new Set(keys.flatMap((v) => tb[v].map(([t]) => t)))].sort((a, b) => a - b);
    return { h: L[k], cols: times.map(fmtT), rows: keys.map((v) => {
      const mp = new Map(tb[v].map(([t, x]) => [t, x]));
      return [`${(+v * m.cells).toFixed(2)} V (${v} V/${L.perCell})`, ...times.map((t) => (mp.has(t) ? String(+(+mp.get(t)).toFixed(1)) : '—'))];
    }) };
  }).filter(Boolean);
}
