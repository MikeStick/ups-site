// 详情里的 HTML 片段（CRM 模板的"详情 HTML 片段"）→ 独立的 .html 文件 /h/<内容哈希>.html
// 以前每个产品页把片段整段写进 iframe 的 srcdoc：同一个片段被 N 个型号引用，就随 N 个页面各下载一次。
// 现在同样内容只生成一个文件，文件名是内容哈希：浏览器打开过一个型号后，其他型号直接用缓存
// （public/_headers 里 /h/* 设了长期缓存；内容一改哈希就变，不会用到旧的）。
import { createHash } from 'node:crypto';
import { LANGS } from '../config.mjs';

// 片段里注入的小脚本：把内容高度报给父页面，父页面据此调整 iframe 高度
const HH_SCRIPT = '<script>(function(){function s(){try{parent.postMessage({skeHtmlH:Math.ceil(document.documentElement.getBoundingClientRect().height)},"*")}catch(e){}}addEventListener("load",s);if(window.ResizeObserver)new ResizeObserver(s).observe(document.documentElement);setTimeout(s,300);setTimeout(s,1500);})()</' + 'script>';

export function htmlDoc(h) {
  const base = '<base target="_blank">';
  if (/<html[\s>]/i.test(h)) {
    const d = /<head[^>]*>/i.test(h) ? h.replace(/<head[^>]*>/i, (m) => m + base) : h.replace(/<html[^>]*>/i, (m) => m + '<head>' + base + '</head>');
    return /<\/body>/i.test(d) ? d.replace(/<\/body>/i, HH_SCRIPT + '</body>') : d + HH_SCRIPT;
  }
  return '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' + base +
    '<style>html,body{margin:0;padding:0}body{font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:#15211f}img{max-width:100%;height:auto}</style></head><body>' + h + HH_SCRIPT + '</body></html>';
}

export const htmlHash = (doc) => createHash('sha256').update(doc).digest('hex').slice(0, 16);
export const htmlUrl = (h) => `/h/${htmlHash(htmlDoc(h))}.html`;

// 某个产品在某种语言下的 HTML 片段原文（和产品页取法一致）
export function detailHtmlsOf(p, lang) {
  return (Array.isArray(p.templateDetail) ? p.templateDetail : [])
    .filter((x) => !x.img && x.html)
    .map((x) => (typeof x.html === 'string' ? x.html : (x.html[lang] || x.html.en || '')))
    .filter(Boolean);
}

// 全站所有不重复的片段文件：[{ hash, doc }]
export function allDetailDocs(products) {
  const seen = new Map();
  for (const lang of LANGS) for (const p of products) for (const h of detailHtmlsOf(p, lang)) {
    const doc = htmlDoc(h);
    const hash = htmlHash(doc);
    if (!seen.has(hash)) seen.set(hash, doc);
  }
  return [...seen].map(([hash, doc]) => ({ hash, doc }));
}
