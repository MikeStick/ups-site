// 顶部搜索框用的索引（每种语言一份），打开搜索框时才下载
import { LANGS } from '../../config.mjs';
import { searchIndex } from '../../lib/search-index.mjs';
import products from '../../data/products.json';

export function getStaticPaths() { return LANGS.map((lang) => ({ params: { lang } })); }
export function GET({ params }) {
  return new Response(JSON.stringify(searchIndex(params.lang, products)), { headers: { 'Content-Type': 'application/json' } });
}
