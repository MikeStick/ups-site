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
  // 表头可能有两行：型号一行 + 下面一行细分（"2 batt. / 4 batt."、"单进单出 / 三进单出"）。
  // 表头行 = 开头连续的、在 <thead> 里或全是 <th> 的行（最多 3 行）
  let H = 1;
  while (isHead && H < Math.min(3, rows.length - 1)) {
    const tr = trs[H], cells = rows[H];
    const inHead = tr.parentNode.tagName === 'THEAD' && trs[0].parentNode.tagName === 'THEAD';
    if (!(inHead || (cells.length && cells.every((x) => x.th)))) break;
    H++;
  }
  if (!isHead) {
    // 没有型号行：按普通表格输出
    return { t: 'grid', rows: rows.map((cells) => cells.map((x) => ({ text: x.text, cs: x.cs, rs: x.rs, th: x.th }))) };
  }
  const L = head[0].cs; // 参数名占几列
  const models = head.slice(1).map((x) => x.text);
  // 每个数据列对应的型号（第一行）和细分（第二、三行），合并单元格展开到每一列
  const cols = [];
  for (let c = L; c < N; c++) {
    const top = occ[0][c];
    const subs = [];
    for (let r = 1; r < H; r++) { const x = occ[r] && occ[r][c]; if (x && x !== top && x.text) subs.push(x.text); }
    cols.push({ m: top ? top.text : '', sub: subs.join(' · ') });
  }
  // 表头每一行的单元格（跨几列），给网站按原样画出两层表头
  const heads = [];
  for (let r = 0; r < H; r++) {
    const seen = new Set(), row = [];
    for (let c = L; c < N; c++) {
      const x = occ[r] && occ[r][c];
      if (!x || seen.has(x) || x.r !== r) continue; // 从上一行跨下来的格子不重复画
      seen.add(x);
      row.push({ text: x.text, col: Math.max(x.c, L) - L, cs: Math.min(x.c + x.cs, N) - Math.max(x.c, L), rs: Math.min(x.rs, H - r) });
    }
    heads.push(row);
  }
  const out = [];
  for (let r = H; r < rows.length; r++) {
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
  return { t: 'table', corner: head[0].text, models, cols, heads: H > 1 ? heads : null, rows: out };
}

const BLOCKY = 'table,ul,ol,h1,h2,h3,h4,h5,h6,img,svg';
const elKids = (n) => n.childNodes.filter((k) => k.nodeType === 1 && !['SCRIPT', 'STYLE'].includes(k.tagName));
function cardsOf(n) {
  if (!['DIV', 'SECTION', 'UL'].includes(n.tagName)) return null;
  const kids = elKids(n);
  if (kids.length < 2 || kids.length > 12) return null;
  const items = [];
  for (const k of kids) {
    if (!['DIV', 'LI', 'ARTICLE', 'A'].includes(k.tagName) || k.querySelector(BLOCKY)) return null;
    const lines = elKids(k).map(textOf).filter(Boolean);
    if (lines.length < 2 || lines.length > 5 || elKids(k).some((x) => elKids(x).some((y) => ['DIV', 'P', 'SECTION'].includes(y.tagName)))) return null;
    if (lines.join(' ').length > 160) return null;
    items.push(lines);
  }
  return items;
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
    // 型号卡片组（一排小卡片，每张 2–5 行短文字：型号 / 功率 / 电池选项…）→ 网站自己的卡片样式，不再拆成一行行文字
    const cards = cardsOf(n);
    if (cards) { blocks.push({ t: 'cards', items: cards }); continue; }
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
  const out = blocks.filter((b) => b.t !== 'p' || b.text);
  // 标题前面紧挨着的一行短文字 = 小标题（eyebrow，如 "Lithium UPS Series"）；第一个标题后面紧跟的段落 = 副标题
  const firstTitle = out.findIndex((b) => b.t === 'title');
  if (firstTitle > 0 && out[firstTitle - 1].t === 'p' && out[firstTitle - 1].text.length <= 40) out[firstTitle - 1] = { t: 'eyebrow', text: out[firstTitle - 1].text };
  if (firstTitle >= 0 && out[firstTitle + 1] && out[firstTitle + 1].t === 'p' && out[firstTitle + 1].text.length <= 160) out[firstTitle + 1] = { t: 'sub', text: out[firstTitle + 1].text };
  // 后面的 H1 / H2（Key Features、Technical Specifications）是小节标题，不和主标题一样大
  out.forEach((b, i) => { if (b.t === 'title' && i !== firstTitle) out[i] = { t: 'h', text: b.text }; });
  return out;
}

// 型号匹配（GS400 ↔ GS400BI MAX）：字母前缀 + 数字相同即可
export const modelKey = (m) => { const x = String(m || '').toUpperCase().replace(/\s+/g, '').match(/^([A-Z]+)-?(\d+(?:\.\d+)?)/); return x ? x[1] + x[2] : ''; };
