// 站点地图：所有语言的列表页、定制页、产品页，带 hreflang 互相关联。提交给 Google Search Console 用。
import { LANGS, DEFAULT_LANG } from '../config.mjs';
import products from '../data/products.json';

export function GET({ site }) {
  const base = String(site || '').replace(/\/$/, '');
  const paths = ['', 'offline-ups/', 'about/', 'custom/', ...products.map((p) => `p/${p.slug}/`)];
  const today = new Date().toISOString().slice(0, 10);
  const urls = paths.flatMap((path) => LANGS.map((lang) => {
    const alt = LANGS.map((l) => `<xhtml:link rel="alternate" hreflang="${l}" href="${base}/${l}/${path}"/>`).join('')
      + `<xhtml:link rel="alternate" hreflang="x-default" href="${base}/${DEFAULT_LANG}/${path}"/>`;
    return `<url><loc>${base}/${lang}/${path}</loc><lastmod>${today}</lastmod>${alt}</url>`;
  }));
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
