// 首页动画（"如果这个时候停电"）：六个场景 + UPS 的文字（三语）
// 场景图片 / 短视频在客户档案系统「网站管理 → 首页动画」上传，图片位 id = hp_<场景>；没上传时显示占位插画
export const HP_SCENES = ['hospital', 'school', 'fab', 'airport', 'esports', 'family'];

export const HT = {
  en: {
    scenes: {
      hospital: ['Operating theatre', 'Monitor · 72 bpm'],
      school: ['23:00 · Evening study', 'Lights on'],
      fab: ['Chip fab · 24/7 production', 'Line 3 · running'],
      airport: ['Airport terminal · Departures', 'Check-in open'],
      esports: ['PUBG esports final', 'LIVE'],
      family: ['Family movie night', 'TV on'],
    },
    off: 'No power', on: 'UPS · 0 ms',
    q: 'What if the power went out right now?',
    ifSke: 'With an SKE UPS…',
    restored: 'Everything keeps running. Zero interruption.',
    slogan: 'With SKE, no surprises.',
    skip: 'Skip', replay: 'Replay', cta1: 'See our UPS range', cta2: 'Rack-mount online UPS',
  },
  es: {
    scenes: {
      hospital: ['Quirófano', 'Monitor · 72 lpm'],
      school: ['23:00 · Estudio nocturno', 'Luces encendidas'],
      fab: ['Fábrica de chips · 24/7', 'Línea 3 · en marcha'],
      airport: ['Terminal del aeropuerto · Salidas', 'Check-in abierto'],
      esports: ['Final de esports PUBG', 'EN VIVO'],
      family: ['Noche de cine en familia', 'TV encendida'],
    },
    off: 'Sin energía', on: 'UPS · 0 ms',
    q: '¿Y si se corta la luz ahora mismo?',
    ifSke: 'Con un UPS SKE…',
    restored: 'Todo sigue funcionando. Sin ninguna interrupción.',
    slogan: 'Con SKE, sin sorpresas.',
    skip: 'Saltar', replay: 'Repetir', cta1: 'Ver nuestros UPS', cta2: 'UPS online para rack',
  },
  ru: {
    scenes: {
      hospital: ['Операционная', 'Монитор · 72 уд/мин'],
      school: ['23:00 · Вечерние занятия', 'Свет включён'],
      fab: ['Завод микросхем · 24/7', 'Линия 3 · работает'],
      airport: ['Терминал аэропорта · Вылет', 'Регистрация открыта'],
      esports: ['Финал PUBG по киберспорту', 'LIVE'],
      family: ['Семейный вечер у телевизора', 'ТВ включён'],
    },
    off: 'Нет питания', on: 'ИБП · 0 мс',
    q: 'А если прямо сейчас отключат свет?',
    ifSke: 'С ИБП SKE…',
    restored: 'Всё продолжает работать. Ни секунды перерыва.',
    slogan: 'С SKE — никаких неожиданностей.',
    skip: 'Пропустить', replay: 'Повторить', cta1: 'Наши ИБП', cta2: 'Стоечные онлайн-ИБП',
  },
};
