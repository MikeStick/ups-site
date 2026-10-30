// 详情 HTML 片段文件：每个不重复的片段生成一个 /h/<内容哈希>.html，多个型号共用、浏览器缓存
import products from '../../data/products.json';
import { allDetailDocs } from '../../lib/detail-html.mjs';

export function getStaticPaths() {
  return allDetailDocs(products).map(({ hash, doc }) => ({ params: { hash }, props: { doc } }));
}

export function GET({ props }) {
  return new Response(props.doc, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
