// News（新闻中心）界面文字 + 日期格式。稿件数据见 src/data/news-sample.mjs（预览）/ 以后来自 CRM。
import { addAr } from './ar.mjs';
export const NW = {
  en: { nav: 'News', title: 'Newsroom', crumbs: 'Home', eyebrow: 'SKE Newsroom', h1: 'Projects, products and people', lead: 'What we shipped, built and launched — with photos and video from site.',
    latest: 'Latest', all: 'All', cats: { projects: 'Projects', products: 'Products', events: 'Events', company: 'Company', video: 'Video' },
    read: 'Read story', min: 'min read', more: 'More stories', related: 'Keep reading', share: 'Share', copy: 'Copy link', copied: 'Copied',
    contents: 'In this story', back: 'All news', prev: 'Previous', next: 'Next', watch: 'Watch', video: 'Video', photos: 'photos', related_products: 'Products in this story',
    empty: 'No stories in this category yet.',
    metaDesc: 'News from SKE Power: project deliveries, new products, events and company updates — with photos and video.' },
  es: { nav: 'Noticias', title: 'Sala de prensa', crumbs: 'Inicio', eyebrow: 'Noticias SKE', h1: 'Proyectos, productos y personas', lead: 'Lo que entregamos, construimos y lanzamos, con fotos y vídeo desde el sitio.',
    latest: 'Lo último', all: 'Todo', cats: { projects: 'Proyectos', products: 'Productos', events: 'Eventos', company: 'Empresa', video: 'Vídeo' },
    read: 'Leer', min: 'min de lectura', more: 'Más noticias', related: 'Siga leyendo', share: 'Compartir', copy: 'Copiar enlace', copied: 'Copiado',
    contents: 'En esta noticia', back: 'Todas las noticias', prev: 'Anterior', next: 'Siguiente', watch: 'Ver', video: 'Vídeo', photos: 'fotos', related_products: 'Productos de esta noticia',
    empty: 'Aún no hay noticias en esta categoría.',
    metaDesc: 'Noticias de SKE Power: proyectos entregados, nuevos productos, eventos y novedades, con fotos y vídeo.' },
  ru: { nav: 'Новости', title: 'Новости', crumbs: 'Главная', eyebrow: 'Новости SKE', h1: 'Проекты, продукты и люди', lead: 'Что мы поставили, построили и запустили — с фото и видео с объектов.',
    latest: 'Свежее', all: 'Все', cats: { projects: 'Проекты', products: 'Продукты', events: 'События', company: 'Компания', video: 'Видео' },
    read: 'Читать', min: 'мин чтения', more: 'Ещё новости', related: 'Читайте также', share: 'Поделиться', copy: 'Копировать ссылку', copied: 'Скопировано',
    contents: 'В этой статье', back: 'Все новости', prev: 'Предыдущая', next: 'Следующая', watch: 'Смотреть', video: 'Видео', photos: 'фото', related_products: 'Продукты в статье',
    empty: 'В этой категории пока нет новостей.',
    metaDesc: 'Новости SKE Power: сданные проекты, новые продукты, события и новости компании — с фото и видео.' },
};
const MON = { en: 'en-GB', es: 'es-ES', ru: 'ru-RU', ar: 'ar-u-nu-latn' };
export const monthYear = (d, lang) => new Date(d + 'T00:00:00Z').toLocaleDateString(MON[lang], { month: 'long', year: 'numeric', timeZone: 'UTC' });
export const fullDate = (d, lang) => new Date(d + 'T00:00:00Z').toLocaleDateString(MON[lang], { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
export const tx = (x, lang) => (x && typeof x === 'object' && !Array.isArray(x) ? x[lang] || x.en || '' : x || '');
// 阅读时长：按全部文字词数 / 200
export const readMin = (n, lang) => {
  const words = [tx(n.excerpt, lang), ...n.blocks.map((b) => tx(b, lang) || (b.en || ''))].join(' ').split(/\s+/).length;
  return Math.max(1, Math.round(words / 200) + n.blocks.filter((b) => ['img', 'pair', 'gallery', 'yt'].includes(b.t)).length * 0.3 | 0) || 1;
};
export const hasVideo = (n) => n.blocks.some((b) => b.t === 'yt');
export const photoCount = (n) => n.blocks.reduce((s, b) => s + (b.t === 'img' ? 1 : b.t === 'pair' ? b.items.length : b.t === 'gallery' ? b.items.length : 0), 0);

// 阿拉伯语：按英文自动补 ar（见 lib/ar.mjs）
addAr(NW);
addAr(MON);
addAr(monthYear);
addAr(fullDate);
addAr(tx);
addAr(readMin);
addAr(hasVideo);
addAr(photoCount);
