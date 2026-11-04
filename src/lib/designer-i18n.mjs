// 光伏系统选型器独立页（/solar-designer/）：光伏系列菜单的第二项。选型器本身是 SolarVisual（和光伏逆变器页面共用）。
// 现在：首屏 → 选型器 → 系统由哪几部分组成（链接到逆变器和各类电池页面）→ 三步说明 → 常见问题 → 询价。
// 以后光伏系列产品齐全（光伏板、汇流箱等）再把选型结果直接对应到具体型号。
export const SD = {
  en: {
    nav: 'Solar system designer', title: 'Solar system designer', crumbs: 'Products', crumbSolar: 'Solar',
    metaDesc: 'Free online solar system designer: choose your appliances and region, and get the inverter size, battery storage and number of solar panels for backup, bill savings or off-grid. Factory direct inverters and LiFePO4 batteries from China.',
    eyebrow: 'Free online tool', h1a: 'Design your solar system ', h1b: 'in two minutes',
    lead: 'Pick what you want to power and where you are. We size the inverter, the battery and the solar panels — and show you how energy flows by day, at night and in a power cut.',
    cta: 'Start designing', ctaParts: 'What’s in a system',
    facts: [['3', 'Goals: backup, savings, off-grid'], ['12', 'Common appliances'], ['550–700 W', 'Panel sizes, or enter yours'], ['WhatsApp', 'Send the result to us']],
    partsEyebrow: 'Your system', partsH: 'What a solar system is made of',
    parts: [
      ['Solar inverter', 'The heart of the system: turns solar and battery power into mains power and switches over in a power cut.', 'solar-inverters/'],
      ['Wall-mount battery', 'Slim LiFePO4 battery for homes, 5–15 kWh per unit, hangs on the wall next to the inverter.', 'batteries/wall-lithium/'],
      ['Floor-standing battery', 'High-capacity LiFePO4 on wheels, 10–24 kWh per unit, with touch screen and app.', 'batteries/floor-lithium/'],
      ['Rack-mount battery', '19" LiFePO4 modules for larger banks, telecom and equipment rooms.', 'batteries/rack-lithium/'],
    ],
    partsMore: 'See models',
    stepsEyebrow: 'How it works', stepsH: 'Three steps to a quote',
    steps: [['Choose your goal', 'Backup for power cuts, lower electricity bills, or a fully off-grid home.'], ['Add your appliances', 'How many of each and how many hours a day — we add up power and daily energy.'], ['Get the system', 'Inverter, battery and panels, with the energy flow shown. Send it to us on WhatsApp for a quote.']],
    faqEyebrow: 'FAQ', faqH: 'Questions about sizing a solar system',
    faq: [
      ['How accurate is the designer?', 'It uses typical sun hours for your region, 90% usable battery energy and normal inverter efficiency. It is a good starting point; we confirm the final system with you before quoting.'],
      ['Do I need to buy the panels from you?', 'No. We make the inverters and LiFePO4 batteries; the designer tells you how many watts of panels you need, so you can buy them locally or ask us about them with your quote.'],
      ['Which battery should I choose?', 'Wall-mount for most homes, floor-standing when you want more kWh in one unit or cannot drill the wall, rack-mount for large banks and equipment rooms. All work with our hybrid inverters.'],
    ],
    ctaH: 'Want us to check your design?', ctaP: 'Send us the result or just your appliance list — we reply on WhatsApp the same day.',
  },
  es: {
    nav: 'Diseñador de sistema solar', title: 'Diseñador de sistema solar', crumbs: 'Productos', crumbSolar: 'Solar',
    metaDesc: 'Diseñador de sistema solar en línea y gratuito: elija sus equipos y su región y obtenga el tamaño del inversor, la batería y la cantidad de paneles para respaldo, ahorro o sistemas off-grid. Inversores y baterías LiFePO4 directo de fábrica en China.',
    eyebrow: 'Herramienta gratuita en línea', h1a: 'Diseñe su sistema solar ', h1b: 'en dos minutos',
    lead: 'Elija qué quiere alimentar y dónde está. Dimensionamos el inversor, la batería y los paneles, y le mostramos cómo fluye la energía de día, de noche y en un corte de luz.',
    cta: 'Empezar a diseñar', ctaParts: 'Qué incluye un sistema',
    facts: [['3', 'Objetivos: respaldo, ahorro, off-grid'], ['12', 'Equipos comunes'], ['550–700 W', 'Tamaños de panel, o el suyo'], ['WhatsApp', 'Envíenos el resultado']],
    partsEyebrow: 'Su sistema', partsH: 'De qué se compone un sistema solar',
    parts: [
      ['Inversor solar', 'El corazón del sistema: convierte la energía solar y de la batería en corriente de red y conmuta en un corte de luz.', 'solar-inverters/'],
      ['Batería de pared', 'Batería LiFePO4 delgada para el hogar, 5–15 kWh por unidad, se cuelga junto al inversor.', 'batteries/wall-lithium/'],
      ['Batería de piso', 'LiFePO4 de gran capacidad con ruedas, 10–24 kWh por unidad, con pantalla táctil y app.', 'batteries/floor-lithium/'],
      ['Batería para rack', 'Módulos LiFePO4 de 19" para bancos grandes, telecom y salas de equipos.', 'batteries/rack-lithium/'],
    ],
    partsMore: 'Ver modelos',
    stepsEyebrow: 'Cómo funciona', stepsH: 'Tres pasos hasta la cotización',
    steps: [['Elija su objetivo', 'Respaldo en cortes de luz, menos gasto en electricidad o una casa totalmente off-grid.'], ['Agregue sus equipos', 'Cuántos de cada uno y cuántas horas al día: sumamos la potencia y la energía diaria.'], ['Reciba el sistema', 'Inversor, batería y paneles, con el flujo de energía. Envíelo por WhatsApp para cotizar.']],
    faqEyebrow: 'Preguntas frecuentes', faqH: 'Preguntas sobre el dimensionamiento solar',
    faq: [
      ['¿Qué tan preciso es el diseñador?', 'Usa las horas de sol típicas de su región, 90% de energía utilizable de la batería y la eficiencia normal del inversor. Es un buen punto de partida; confirmamos el sistema final con usted antes de cotizar.'],
      ['¿Tengo que comprarles los paneles?', 'No. Fabricamos los inversores y las baterías LiFePO4; el diseñador le indica cuántos vatios de paneles necesita, así puede comprarlos localmente o consultarnos junto con su cotización.'],
      ['¿Qué batería debo elegir?', 'De pared para la mayoría de las casas, de piso si quiere más kWh en una unidad o no puede perforar la pared, para rack en bancos grandes y salas de equipos. Todas funcionan con nuestros inversores híbridos.'],
    ],
    ctaH: '¿Quiere que revisemos su diseño?', ctaP: 'Envíenos el resultado o solo su lista de equipos: respondemos por WhatsApp el mismo día.',
  },
  ru: {
    nav: 'Подбор солнечной системы', title: 'Подбор солнечной системы', crumbs: 'Продукция', crumbSolar: 'Солнечная энергия',
    metaDesc: 'Бесплатный онлайн-подбор солнечной системы: выберите приборы и регион — получите мощность инвертора, ёмкость аккумуляторов и число солнечных панелей для резерва, экономии или автономного дома. Инверторы и аккумуляторы LiFePO4 напрямую с завода в Китае.',
    eyebrow: 'Бесплатный онлайн-инструмент', h1a: 'Соберите солнечную систему ', h1b: 'за две минуты',
    lead: 'Выберите, что нужно питать и где вы находитесь. Мы подберём инвертор, аккумулятор и солнечные панели и покажем, как идёт энергия днём, ночью и при отключении.',
    cta: 'Начать подбор', ctaParts: 'Из чего состоит система',
    facts: [['3', 'Цели: резерв, экономия, автономия'], ['12', 'Типовых приборов'], ['550–700 Вт', 'Мощность панели или своя'], ['WhatsApp', 'Отправьте результат нам']],
    partsEyebrow: 'Ваша система', partsH: 'Из чего состоит солнечная система',
    parts: [
      ['Солнечный инвертор', 'Сердце системы: превращает энергию солнца и аккумулятора в сетевое напряжение и переключается при отключении.', 'solar-inverters/'],
      ['Настенный аккумулятор', 'Тонкий аккумулятор LiFePO4 для дома, 5–15 кВт·ч на блок, вешается рядом с инвертором.', 'batteries/wall-lithium/'],
      ['Напольный аккумулятор', 'Ёмкий LiFePO4 на колёсах, 10–24 кВт·ч на блок, с сенсорным экраном и приложением.', 'batteries/floor-lithium/'],
      ['Стоечный аккумулятор', '19-дюймовые модули LiFePO4 для больших блоков, телекома и аппаратных.', 'batteries/rack-lithium/'],
    ],
    partsMore: 'Модели',
    stepsEyebrow: 'Как это работает', stepsH: 'Три шага до цены',
    steps: [['Выберите цель', 'Резерв при отключениях, меньше счета за электричество или полностью автономный дом.'], ['Добавьте приборы', 'Сколько штук и сколько часов в день — мы сложим мощность и суточную энергию.'], ['Получите систему', 'Инвертор, аккумулятор и панели с наглядными потоками энергии. Отправьте нам в WhatsApp для расчёта цены.']],
    faqEyebrow: 'Вопросы', faqH: 'Вопросы о подборе солнечной системы',
    faq: [
      ['Насколько точен подбор?', 'Используются типичные солнечные часы для региона, 90% полезной энергии аккумулятора и обычный КПД инвертора. Это хорошая отправная точка; окончательную систему мы согласуем с вами перед расчётом цены.'],
      ['Панели обязательно покупать у вас?', 'Нет. Мы производим инверторы и аккумуляторы LiFePO4; подбор покажет, сколько ватт панелей нужно, — купите их на месте или спросите нас вместе с запросом цены.'],
      ['Какой аккумулятор выбрать?', 'Настенный — для большинства домов, напольный — если нужно больше кВт·ч в одном блоке или нельзя сверлить стену, стоечный — для больших блоков и аппаратных. Все работают с нашими гибридными инверторами.'],
    ],
    ctaH: 'Проверить ваш проект?', ctaP: 'Пришлите результат или просто список приборов — ответим в WhatsApp в тот же день.',
  },
};

// 菜单分组标题
export const NAV_GROUPS = {
  en: { ups: 'UPS', solar: 'Solar', batt: 'Batteries' },
  es: { ups: 'UPS', solar: 'Solar', batt: 'Baterías' },
  ru: { ups: 'ИБП', solar: 'Солнечная энергия', batt: 'Аккумуляторы' },
};
