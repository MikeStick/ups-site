// HTML 详情模板 → 网站内容块。
// 只取文字和结构（标题 / 段落 / 列表 / 表格），原文件的样式、class、脚本、链接、图片全部丢掉，
// 输出由网站自己的组件渲染，所以不存在样式冲突和脚本注入。
import { parse } from 'node-html-parser';

const clean = (t) => String(t || '').replace(/\s*\[cite:[^\]]*\]/gi, '').replace(/[ \s]+/g, ' ').trim();
const textOf = (n) => clean(n.text);
const num = (v) => Math.max(1, Math.min(50, parseInt(v, 10) || 1));

// 带" | "分隔的一行卖点 → 标签
function chipsOf(t) {
  const parts = t.replace(/^[^\w\d]+/u, '').split(/\s*[|｜]\s*/).map(clean).filter(Boolean);
  return parts.length >= 2 ? parts : null;
}

// 表格：按网格展开 rowspan / colspan。第一行是型号行（第一格是"MODEL"之类，可跨多列 = 参数名列数），
// 参数名列合并成一个（"LED display · AC mode"），全宽单格的行 = 分组标题。
function tableOf(tbl) {
  const trs = tbl.querySelectorAll('tr');
  if (!trs.length) return null;
  const occ = []; // occ[r][c] = cell
  const rows = trs.map((tr, r) => {
    occ[r] = occ[r] || [];
    let c = 0;
    const cells = [];
    for (const td of tr.childNodes.filter((n) => n.tagName === 'TD' || n.tagName === 'TH')) {
      while (occ[r][c]) c++;
      const cell = { r, c, cs: num(td.getAttribute('colspan')), rs: num(td.getAttribute('rowspan')), text: textOf(td), th: td.tagName === 'TH' };
      for (let i = 0; i < cell.rs; i++) for (let j = 0; j < cell.cs; j++) { occ[r + i] = occ[r + i] || []; occ[r + i][c + j] = cell; }
      cells.push(cell);
      c += cell.cs;
    }
    return cells;
  });
  const N = Math.max(...occ.slice(0, rows.length).map((o) => o.length));
  const head = rows[0];
  const isHead = head.length > 1 && (head.some((x) => x.th) || trs[0].parentNode.tagName === 'THEAD');
  if (!isHead) {
    // 没有型号行：按普通表格输出
    return { t: 'grid', rows: rows.map((cells) => cells.map((x) => ({ text: x.text, cs: x.cs, rs: x.rs, th: x.th }))) };
  }
  const L = head[0].cs; // 参数名占几列
  const models = head.slice(1).map((x) => x.text);
  const out = [];
  for (let r = 1; r < rows.length; r++) {
    const cells = rows[r];
    if (cells.length === 1 && cells[0].c === 0 && cells[0].cs >= N) { out.push({ sec: cells[0].text }); continue; }
    if (!occ[r]) continue;
    const parts = [];
    for (let c = 0; c < L; c++) { const x = occ[r][c]; if (x && x.text && !parts.includes(x.text)) parts.push(x.text); }
    const data = cells.filter((x) => x.c + x.cs > L).map((x) => {
      const start = Math.max(x.c, L);
      return { text: x.text, col: start - L, cs: Math.min(x.c + x.cs, N) - start, rs: x.rs };
    });
    out.push({ label: parts.join(' · '), cells: data });
  }
  return { t: 'table', corner: head[0].text, models, rows: out };
}

function walk(node, blocks) {
  for (const n of node.childNodes) {
    if (n.nodeType === 3) { const t = clean(n.text); if (t) blocks.push({ t: 'p', text: t }); continue; }
    if (n.nodeType !== 1) continue;
    const tag = n.tagName;
    if (['SCRIPT', 'STYLE', 'HEAD', 'TITLE', 'IFRAME', 'OBJECT', 'EMBED', 'NOSCRIPT', 'TEMPLATE', 'IMG', 'SVG', 'BUTTON', 'FORM', 'INPUT', 'SELECT'].includes(tag)) continue;
    if (tag === 'H1' || tag === 'H2') { const t = textOf(n); if (t) blocks.push({ t: 'title', text: t }); continue; }
    if (/^H[3-6]$/.test(tag)) { const t = textOf(n); if (t) blocks.push({ t: 'h', text: t }); continue; }
    if (tag === 'TABLE') { const tb = tableOf(n); if (tb) blocks.push(tb); continue; }
    if (tag === 'UL' || tag === 'OL') {
      const items = n.querySelectorAll('li').map(textOf).filter(Boolean);
      if (items.length) blocks.push({ t: items.length <= 16 && items.every((x) => x.length <= 40) ? 'chips' : 'list', items });
      continue;
    }
    const hasBlock = n.querySelector('table,p,ul,ol,h1,h2,h3,h4,h5,h6,div');
    if ((tag === 'P' || tag === 'DIV' || tag === 'SECTION' || tag === 'ARTICLE') && !hasBlock) {
      const t = textOf(n);
      if (!t) continue;
      const chips = chipsOf(t);
      blocks.push(chips ? { t: 'hi', items: chips } : { t: 'p', text: t });
      continue;
    }
    walk(n, blocks);
  }
}

export function tplHtmlBlocks(html) {
  if (!html) return [];
  const root = parse(String(html), { lowerCaseTagName: false, comment: false, blockTextElements: { script: false, style: false, noscript: false, pre: true } });
  const body = root.querySelector('body') || root;
  const blocks = [];
  walk(body, blocks);
  // 相邻的短文字段落合并检查：只保留非空
  return blocks.filter((b) => b.t !== 'p' || b.text);
}

// 型号匹配（GS400 ↔ GS400BI MAX）：字母前缀 + 数字相同即可
export const modelKey = (m) => { const x = String(m || '').toUpperCase().replace(/\s+/g, '').match(/^([A-Z]+)-?(\d+(?:\.\d+)?)/); return x ? x[1] + x[2] : ''; };
