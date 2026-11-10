// 新闻数据：客户档案系统「网站管理 → 新闻 / 动态」里的图文文章（构建时拉到 src/data/site.json，图片已下载到 /media/news-*/）。
// 后台还没有发布文章时，用 src/data/news-sample.mjs 的示例内容。
// 后台输出的块是 { t, text:{en,es,ru} }，这里统一成页面用的格式 { t, en, es, ru }（和示例数据一样）。
import site from '../data/site.json';
import { NEWS_SAMPLE } from '../data/news-sample.mjs';

const norm = (n) => ({
  ...n,
  date: String(n.date || n.datetime || '').slice(0, 10),
  blocks: (n.blocks || []).map((b) => {
    if (b.text) { const { text, ...rest } = b; return { ...rest, ...text }; }
    if (b.t === 'gallery') return { ...b, items: (b.items || []).map((it) => (typeof it === 'string' ? it : it.src)) };
    return b;
  }),
});
const real = (Array.isArray(site.news) ? site.news : []).filter((n) => n && n.kind === 'article' && n.slug && n.title && n.title.en);
export const NEWS_IS_SAMPLE = real.length === 0;
export const NEWS_LIST = (real.length ? real.map(norm) : NEWS_SAMPLE)
  .slice().sort((a, b) => String(b.datetime || b.date).localeCompare(String(a.datetime || a.date)));
