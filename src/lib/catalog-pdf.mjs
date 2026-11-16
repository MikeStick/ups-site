// 下载中心：在访客浏览器里生成 PDF（A4 竖版）——整本产品目录 / 某个类目或大类的目录 / 单个型号的资料。
// 版式参考纸质产品手册：每个系列一页（左上系列名、产品图 + 主要特点、下方蓝色表头的多型号对比参数表、相同参数合并单元格）。
//
// 轻量化：文字、表格、线条全部是 PDF 矢量（嵌入子集字体，只带用到的字），清晰且很小；
// 只有照片是图片，按版面实际大小缩放后再压成 JPEG。中文字符（比如中文地址）字体里没有，单独画成小图片。
// "所有系列详情"（模板详情图 / 详情 HTML）本身就是图片，压缩后放在每个类目后面；系列参数表 HTML 里的表格转成矢量表格。
// 阿拉伯语：整份文件从右到左排版，阿拉伯文字由 jsPDF 变形连写，夹在里面的型号 / 数字按从左到右单独排。
import { wait, loadImg, imgToCanvas, htmlToCanvas, seriesToCanvas } from './datasheet-pdf.mjs';

const PW = 595.28, PH = 841.89;               // A4，pt
const MX = 40, MT = 44, MB = 50;              // 页边距
const CW = PW - MX * 2;                       // 内容宽
const BOTTOM = PH - MB;                       // 内容区底线
const BLUE = [33, 96, 176], BLUE_D = [22, 64, 128], BLUE_L = [236, 242, 251], BLUE_M = [214, 227, 245];
const INK = [27, 35, 48], SOFT = [98, 110, 125], LINE = [196, 205, 216], ZEBRA = [247, 249, 252];
const SITE = 'www.ups-china.com', MAIL = 'sales@ups-china.com', PHONE = '+86 152 0127 3157';
const PX_PER_PT = 2.2;                        // 照片：每 pt 用多少像素（≈160 dpi，清楚又不大）
const JPEG_Q = 0.78;
const DETAIL_MAXW = 1150, DETAIL_Q = 0.72;    // 详情长图：宽 1150px（≈150 dpi）

function check(signal) { if (signal && signal.aborted) { const e = new Error('cancelled'); e.name = 'AbortError'; throw e; } }

/* ---------- 文字清理 ---------- */
const FIX = { '℃': '°C', '℉': '°F', '●': '•', '○': '◦', '～': '~', '〜': '~', '、': ', ', '。': '. ', '，': ', ', '：': ': ', '；': '; ', '（': '(', '）': ')', '【': '[', '】': ']', '“': '"', '”': '"', '‘': "'", '’': "'", '　': ' ', ' ': ' ', '​': '', '﻿': '', '\t': ' ' };
function clean(s) {
  return String(s == null ? '' : s)
    .replace(/[℃℉●○～〜、。，：；（）【】“”‘’　 ​﻿\t]/g, (c) => FIX[c])
    .replace(/[！-～]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/\r\n?/g, '\n').replace(/[ ]{2,}/g, ' ').trim();
}
const CJK = /[⺀-⿿぀-鿿豈-﫿가-힯]/;
const MIRROR = { '(': ')', ')': '(', '[': ']', ']': '[', '<': '>', '>': '<', '{': '}', '}': '{', '«': '»', '»': '«' };
const ARABIC = /[؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿]/;

/* ---------- 字体 ---------- */
const fontCache = {};
async function fontB64(url) {
  if (fontCache[url]) return fontCache[url];
  const buf = new Uint8Array(await (await fetch(url)).arrayBuffer());
  let s = '';
  for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode.apply(null, buf.subarray(i, i + 0x8000));
  return (fontCache[url] = btoa(s));
}
async function setupFonts(pdf, rtl) {
  const files = rtl ? ['PlexArabic-Regular', 'PlexArabic-SemiBold'] : ['PlexSans-Regular', 'PlexSans-SemiBold'];
  const data = await Promise.all(files.map((f) => fontB64(`/fonts/pdf/${f}.ttf`)));
  files.forEach((f, i) => { pdf.addFileToVFS(`${f}.ttf`, data[i]); pdf.addFont(`${f}.ttf`, 'F', i ? 'bold' : 'normal', 'Identity-H'); });
  pdf.setFont('F', 'normal');
}

/* ---------- 图片：按版面大小缩小、压成 JPEG ---------- */
const imgCache = new Map();
async function photo(url, wPt, hPt, cover = false) {
  if (!url) return null;
  const key = `${url}|${Math.round(wPt)}|${Math.round(hPt)}|${cover}`;
  if (imgCache.has(key)) return imgCache.get(key);
  const job = (async () => {
    let im;
    try { im = await loadImg(url); } catch (e) { return null; }
    const iw = im.naturalWidth, ih = im.naturalHeight;
    if (!iw || !ih) return null;
    let w, h, sx = 0, sy = 0, sw = iw, sh = ih;
    if (cover) { // 裁切铺满
      const k = Math.max(wPt / iw, hPt / ih); w = wPt; h = hPt;
      sw = wPt / k; sh = hPt / k; sx = (iw - sw) / 2; sy = (ih - sh) / 2;
    } else { const k = Math.min(wPt / iw, hPt / ih); w = iw * k; h = ih * k; }
    const cw = Math.max(1, Math.min(Math.round(w * PX_PER_PT), Math.round(sw))), ch = Math.max(1, Math.round(cw * h / w));
    const c = document.createElement('canvas'); c.width = cw; c.height = ch;
    const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, cw, ch); g.imageSmoothingQuality = 'high';
    g.drawImage(im, sx, sy, sw, sh, 0, 0, cw, ch);
    try { return { data: c.toDataURL('image/jpeg', JPEG_Q), w, h }; } catch (e) { return null; } // 跨域图片画不出来
  })();
  imgCache.set(key, job);
  return job;
}

/* ---------- 排版工具 ---------- */
function mkDoc(pdf, rtl) {
  const D = { pdf, rtl, size: 10, bold: false };
  const k = pdf.internal.scaleFactor;
  D.font = (bold, size, color = INK) => { D.bold = !!bold; D.size = size; pdf.setFont('F', bold ? 'bold' : 'normal'); pdf.setFontSize(size); pdf.setTextColor(...color); D.color = color; };
  const shape = (s) => (rtl && ARABIC.test(s) && pdf.processArabic ? pdf.processArabic(s) : s);
  D.w = (s) => { s = String(s); if (CJK.test(s)) return rasterW(s); return (pdf.getStringUnitWidth(shape(s)) * D.size) / k; };
  // 从左到右 / 从右到左：x 是"开始"那一侧的距离
  D.px = (x, w = 0) => (rtl ? PW - x - w : x);
  // 中文：字体里没有，画成小图片（只用于很少的几处，比如中文地址）
  const rc = document.createElement('canvas').getContext('2d');
  const cssFont = () => `${D.bold ? 600 : 400} ${D.size * 4}px "IBM Plex Sans","PingFang SC","Microsoft YaHei","Noto Sans SC",sans-serif`;
  function rasterW(s) { rc.font = cssFont(); return rc.measureText(s).width / 4; }
  function rasterText(s, x, y, align) {
    const w = rasterW(s), h = D.size * 1.35;
    const c = document.createElement('canvas'); c.width = Math.ceil(w * 4) + 4; c.height = Math.ceil(h * 4);
    const g = c.getContext('2d'); g.font = cssFont(); g.fillStyle = `rgb(${D.color.join(',')})`; g.textBaseline = 'alphabetic';
    g.fillText(s, 2, D.size * 4 * 1.02);
    const left = align === 'right' ? x - w : align === 'center' ? x - w / 2 : x;
    pdf.addImage(c.toDataURL('image/png'), 'PNG', left, y - D.size * 1.02, c.width / 4, c.height / 4, undefined, 'FAST');
  }
  // 一行字（物理坐标）。从右到左时把阿拉伯文和夹在中间的拉丁字母 / 数字分段，从右往左一段段排
  D.line = (s, x, y, align = 'left') => {
    s = String(s); if (!s) return;
    if (CJK.test(s)) return rasterText(s, x, y, align);
    if (!(rtl && ARABIC.test(s))) { pdf.text(s, x, y, { align }); return; }
    // 阿拉伯文段：jsPDF 只负责字形变形（连写），顺序自己反过来、括号镜像；夹在中间的拉丁字母 / 数字段保持从左到右
    const runs = [];
    const re = /[A-Za-z0-9][A-Za-z0-9 .,:/\-–+%°×~±=_#&*'"()]*/g; let last = 0, m;
    while ((m = re.exec(s))) {
      let t = m[0];
      for (;;) { // 段尾的空格、标点、多出来的括号归阿拉伯文那边
        const t0 = t; t = t.replace(/[\s.,:;\-(]+$/, '');
        while ((t.match(/\)/g) || []).length > (t.match(/\(/g) || []).length && t.endsWith(')')) t = t.slice(0, -1);
        if (t === t0) break;
      }
      if (!t) continue;
      if (m.index > last) runs.push({ t: s.slice(last, m.index), ar: true });
      runs.push({ t, ar: false }); last = m.index + t.length; re.lastIndex = last;
    }
    if (last < s.length) runs.push({ t: s.slice(last), ar: true });
    const ws = runs.map((r) => D.w(r.t)), total = ws.reduce((a, b) => a + b, 0);
    let xr = align === 'right' ? x : align === 'center' ? x + total / 2 : x + total;
    const VIS = { isInputVisual: true, isOutputVisual: true };
    runs.forEach((r, i) => {
      xr -= ws[i];
      if (!r.t.trim()) return;
      const t = r.ar ? Array.from(shape(r.t)).reverse().map((c) => MIRROR[c] || c).join('') : r.t;
      pdf.text(t, xr, y, VIS);
    });
  };
  // 逻辑盒子里写一行：align = start / center / end
  D.put = (s, x, y, w, align = 'start') => {
    const L = D.px(x, w);
    if (align === 'center') return D.line(s, L + w / 2, y, 'center');
    const atRight = (align === 'start') === rtl;
    D.line(s, atRight ? L + w : L, y, atRight ? 'right' : 'left');
  };
  D.wrap = (s, w) => {
    s = clean(s); if (!s) return [];
    if (CJK.test(s)) { // 中文按字切
      const out = []; let cur = '';
      for (const ch of s) { if (ch === '\n') { out.push(cur); cur = ''; continue; } if (D.w(cur + ch) > w && cur) { out.push(cur); cur = ch; } else cur += ch; }
      if (cur) out.push(cur); return out;
    }
    return pdf.splitTextToSize(s, rtl ? w * 0.94 : w);
  };
  // 段落：返回下一行的 y
  D.para = (s, x, y, w, o = {}) => {
    D.font(o.bold, o.size || 10, o.color || INK);
    const lh = (o.size || 10) * (o.lh || 1.42);
    let lines = D.wrap(s, w);
    if (o.max && lines.length > o.max) { lines = lines.slice(0, o.max); lines[o.max - 1] = lines[o.max - 1].replace(/\s*\S*$/, '') + ' …'; }
    for (const l of lines) { D.put(l, x, y + (o.size || 10) * 0.92, w, o.align || 'start'); y += lh; }
    return y;
  };
  D.rect = (x, y, w, h, fill, stroke, r = 0) => {
    const L = D.px(x, w);
    if (fill) pdf.setFillColor(...fill);
    if (stroke) { pdf.setDrawColor(...stroke); pdf.setLineWidth(0.6); }
    const mode = fill && stroke ? 'FD' : fill ? 'F' : 'S';
    if (r) pdf.roundedRect(L, y, w, h, r, r, mode); else pdf.rect(L, y, w, h, mode);
  };
  D.dot = (x, y, r, color = BLUE) => { pdf.setFillColor(...color); pdf.circle(D.px(x), y, r, 'F'); };
  D.img = (im, x, y, w, h) => { if (im) pdf.addImage(im.data, 'JPEG', D.px(x, w), y, w, h, undefined, 'FAST'); };
  return D;
}

/* ---------- 表格（支持合并单元格、跨页时重复表头） ---------- */
// rows: [[{ v, cs, rs, head, b, align, bg }]]；o: { x, w, size, labelW, equalFrom, minFont }
function layoutTable(D, rows, o) {
  const pad = o.pad || 4, x0 = o.x || MX, avail = o.w || CW;
  // 把合并单元格展开到网格里
  const grid = []; const cells = [];
  rows.forEach((r, ri) => {
    grid[ri] = grid[ri] || [];
    let ci = 0;
    for (const c of r) {
      while (grid[ri][ci]) ci++;
      const cs = Math.max(1, c.cs || 1), rs = Math.max(1, c.rs || 1);
      const cell = { ...c, v: clean(c.v), r: ri, c: ci, cs, rs };
      cells.push(cell);
      for (let a = 0; a < rs; a++) for (let b = 0; b < cs; b++) { grid[ri + a] = grid[ri + a] || []; grid[ri + a][ci + b] = cell; }
      ci += cs;
    }
  });
  const nRows = grid.length, nCols = Math.max(...grid.map((r) => r.length));
  let size = o.size || 8;
  let widths;
  for (; size >= (o.minFont || 6); size -= 0.5) {
    D.font(false, size);
    const nat = Array(nCols).fill(24), min = Array(nCols).fill(18);
    for (const c of cells) {
      if (c.cs !== 1) continue;
      D.font(c.head || c.b, size);
      const lines = String(c.v).split('\n');
      const n = Math.max(...lines.map((l) => D.w(l))) + pad * 2 + 1;
      const longest = Math.max(...String(c.v).split(/[\s\n]+/).map((t) => D.w(t))) + pad * 2 + 1;
      nat[c.c] = Math.max(nat[c.c], Math.min(n, 230)); min[c.c] = Math.max(min[c.c], Math.min(longest, 110));
    }
    if (o.labelW) { nat[0] = Math.max(min[0], o.labelW); min[0] = Math.min(nat[0], Math.max(min[0], o.labelW * 0.8)); }
    if (o.equalFrom != null && nCols > o.equalFrom) { // 型号列等宽
      const mx = Math.max(...min.slice(o.equalFrom)), nx = Math.max(...nat.slice(o.equalFrom));
      for (let i = o.equalFrom; i < nCols; i++) { min[i] = mx; nat[i] = nx; }
    }
    const sMin = min.reduce((a, b) => a + b, 0), sNat = nat.reduce((a, b) => a + b, 0);
    if (sMin > avail && size > (o.minFont || 6)) continue;
    if (sNat <= avail) { const k = avail / sNat; widths = nat.map((v) => v * k); }
    else { const room = avail - sMin, extra = sNat - sMin; widths = min.map((v, i) => v + (extra ? room * (nat[i] - v) / extra : 0)); }
    break;
  }
  if (!widths) { const sMin = Array(nCols).fill(avail / nCols); widths = sMin; }
  const colX = []; widths.reduce((a, w, i) => { colX[i] = a; return a + w; }, 0);
  const lh = size * (o.lh || 1.3);
  for (const c of cells) {
    const w = widths.slice(c.c, c.c + c.cs).reduce((a, b) => a + b, 0);
    D.font(c.head || c.b, size);
    c.lines = String(c.v).split('\n').flatMap((l) => (l ? D.wrap(l, w - pad * 2) : [''])); if (!c.lines.length) c.lines = [''];
    c.need = c.lines.length * lh + pad * 2 - 1;
    c.w = w;
  }
  const rowH = Array(nRows).fill(size * 1.3 + pad * 2 - 1);
  for (const c of cells) if (c.rs === 1) rowH[c.r] = Math.max(rowH[c.r], c.need);
  for (const c of cells) if (c.rs > 1) {
    const have = rowH.slice(c.r, c.r + c.rs).reduce((a, b) => a + b, 0);
    if (c.need > have) rowH[c.r + c.rs - 1] += c.need - have;
  }
  // 表头行：开头连续的 head 行；分页单位：被纵向合并单元格连在一起的行
  let headN = 0; while (headN < nRows && grid[headN].every((c) => c && c.head)) headN++;
  const blocks = []; let i = headN;
  while (i < nRows) { let j = i; let end = i; while (j <= end) { for (const c of grid[j]) if (c) end = Math.max(end, c.r + c.rs - 1); j++; } blocks.push([i, end]); i = end + 1; }
  return { x0, widths, colX, rowH, grid, cells, headN, blocks, size, lh, pad, nCols };
}
// 画表格；空间不够时调用 newPage() 换页（返回新的 y），返回表格底部 y
function drawTable(D, T, y, newPage) {
  const { x0, colX, rowH, grid, headN, blocks, size, lh, pad } = T;
  const drawRows = (from, to, y0, headRow) => {
    let y = y0;
    const done = new Set();
    for (let r = from; r <= to; r++) {
      for (const c of grid[r]) {
        if (!c || done.has(c)) continue;
        if (c.r !== r && !(r === from && c.r < from)) continue;
        done.add(c);
        const top = c.r < from ? y : y;
        const span = rowH.slice(Math.max(c.r, from), c.r + c.rs).reduce((a, b) => a + b, 0);
        const fill = c.head ? BLUE : c.bg || (c.label ? ZEBRA : null);
        D.pdf.setLineWidth(0.5);
        D.rect(x0 + colX[c.c], top, c.w, span, fill, LINE);
        D.font(c.head || c.b, size, c.head ? [255, 255, 255] : INK);
        const textH = c.lines.length * lh;
        let ty = top + (span - textH) / 2 + size * 0.95;
        const al = c.align || (c.label ? 'start' : 'center');
        for (const l of c.lines) { D.put(l, x0 + colX[c.c] + pad, ty, c.w - pad * 2, al); ty += lh; }
      }
      y += rowH[r];
    }
    return y;
  };
  const headH = rowH.slice(0, headN).reduce((a, b) => a + b, 0);
  if (y + headH + (blocks.length ? rowH[blocks[0][0]] : 0) > BOTTOM) y = newPage();
  y = drawRows(0, headN - 1, y);
  for (const [a, b] of blocks) {
    const h = rowH.slice(a, b + 1).reduce((s, v) => s + v, 0);
    if (y + h > BOTTOM && h < BOTTOM - MT - headH) { y = newPage(); if (headN) y = drawRows(0, headN - 1, y); }
    y = drawRows(a, b, y);
  }
  return y;
}

/* ---------- 读取产品页 ---------- */
async function readProduct(lang, slug) {
  const r = await fetch(`/${lang}/p/${slug}/`, { credentials: 'same-origin' });
  if (!r.ok) throw new Error(`page ${slug} ${r.status}`);
  const doc = new DOMParser().parseFromString(await r.text(), 'text/html');
  const q = (s) => doc.querySelector(s);
  const txt = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');
  // 产品图：主图区的图片（YouTube 缩略图不能用），没有就用模板详情的第一张图
  const imgs = [...doc.querySelectorAll('.gallery-col img, .gallery-col [data-src]')].map((el) => el.getAttribute('src') || el.dataset.src)
    .filter((u) => u && !/ytimg|youtube/i.test(u) && (u.startsWith('/') || u.startsWith(location.origin)));
  let ds = null; try { ds = JSON.parse((q('[data-ds]') || {}).dataset?.ds || 'null'); } catch (e) { ds = null; }
  return {
    slug,
    type: txt(q('.summary .type')),
    model: txt(q('.summary h1')),
    img: imgs[0] || '',
    imgs,
    hl: [...doc.querySelectorAll('.summary .highlights li')].map(txt).filter(Boolean),
    desc: txt(q('.summary .desc')),
    feats: [...doc.querySelectorAll('.details ul.features li')].map(txt).filter(Boolean),
    specs: [...doc.querySelectorAll('.details dl.specs > div')].map((d) => [txt(d.querySelector('dt')), txt(d.querySelector('dd'))]).filter((x) => x[0] && x[1]),
    vdis: [...doc.querySelectorAll('.details .vdis .vdis-t')].map((el) => ({ h: txt(el.querySelector('h3')), rows: htmlTableRows(el.querySelector('table')) })).filter((x) => x.rows.length),
    items: ds && Array.isArray(ds.items) ? ds.items : [],
    tplImg: ((ds && Array.isArray(ds.items) ? ds.items : []).find((x) => x.img) || {}).img || '',
    series: [...doc.querySelectorAll('.series-html')],
    doc,
  };
}
// HTML 表格 → 单元格数组（保留合并单元格；thead / th 当表头）
function htmlTableRows(tbl) {
  if (!tbl) return [];
  const rows = [];
  for (const tr of tbl.querySelectorAll('tr')) {
    const inHead = !!tr.closest('thead');
    const cells = [...tr.children].filter((c) => /^(TD|TH)$/.test(c.tagName)).map((c) => {
      const cl = c.cloneNode(true); cl.querySelectorAll('br').forEach((b) => b.replaceWith('\n'));
      cl.querySelectorAll('p,div,li').forEach((b) => b.append('\n'));
      const v = cl.textContent.replace(/[ \t\r]+/g, ' ').replace(/ *\n */g, '\n').replace(/\n{2,}/g, '\n').trim();
      return { v, cs: +c.getAttribute('colspan') || 1, rs: +c.getAttribute('rowspan') || 1, head: inHead || (c.tagName === 'TH' && [...tr.children].every((x) => x.tagName === 'TH')), b: c.tagName === 'TH', label: c.tagName === 'TH' && !inHead };
    });
    if (cells.length) rows.push(cells);
  }
  return rows;
}

/* ---------- 系列：同一个模板的产品放一起 ---------- */
function groupSeries(sec, pds, tplOf, imgOf = {}) {
  const order = [], map = new Map();
  for (const pd of pds) {
    const key = tplOf[pd.slug] || `type:${pd.type || pd.model}`;
    if (!map.has(key)) { map.set(key, []); order.push(key); }
    map.get(key).push(pd);
  }
  return order.map((k) => {
    const list = map.get(k).sort((a, b) => a.model.localeCompare(b.model, 'en', { numeric: true }));
    const types = [...new Set(list.map((p) => p.type).filter(Boolean))];
    const img = (list.find((p) => p.img) || {}).img || list.map((p) => imgOf[p.slug]).find(Boolean) || sec.img || (list.find((p) => p.tplImg) || {}).tplImg || '';
    for (const p of list) if (!p.img) p.img = imgOf[p.slug] || img;
    return { key: k, cat: sec.label, group: sec.group, list, title: types.length === 1 ? types[0] : sec.label, img };
  });
}

/* ---------- 页面 ---------- */
export async function buildPdf(job, onProgress = () => {}, signal) {
  const { jsPDF } = await import('jspdf');
  const rtl = job.dir === 'rtl';
  const pdf = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'p', compress: true, putOnlyUsedFonts: true });
  await setupFonts(pdf, rtl);
  const D = mkDoc(pdf, rtl);
  const P = job.pdfT, C = job.company || {};
  const multi = job.mode !== 'single';
  let pages = 0;
  const footer = () => {
    const n = pdf.getNumberOfPages();
    D.font(false, 7, SOFT);
    pdf.setDrawColor(...BLUE_M); pdf.setLineWidth(0.6); pdf.line(MX, PH - 34, PW - MX, PH - 34);
    D.put(`SKE POWER  ·  ${SITE}  ·  ${MAIL}  ·  WhatsApp ${PHONE}`, MX, PH - 22, CW - 40, 'start');
    D.font(true, 9, BLUE); D.put(String(n), MX, PH - 21.5, CW, 'end');
  };
  const newPage = () => { if (pages++) pdf.addPage('a4', 'p'); footer(); return MT; };

  // 1. 读所有产品（并发 4 个）
  const all = job.sections.flatMap((s) => s.slugs.map((slug) => ({ s, slug })));
  const got = new Map(); let done = 0;
  onProgress(0, all.length);
  for (let i = 0; i < all.length; i += 4) {
    check(signal);
    await Promise.all(all.slice(i, i + 4).map(async ({ slug }) => {
      try { got.set(slug, await readProduct(job.lang, slug)); } catch (e) { console.warn('[catalog]', e); }
      done++; onProgress(done, all.length);
    }));
  }
  const sections = job.sections.map((s) => ({ ...s, series: groupSeries(s, s.slugs.map((x) => got.get(x)).filter(Boolean), job.tplOf || {}, job.imgOf || {}) })).filter((s) => s.series.length);
  if (!sections.length) throw new Error('empty');

  const toc = [], idx = [];
  let tocPages = [];
  // 只有一两个系列（比如只选了一个类目）：不要单独的目录页，直接看产品
  const nSeries = sections.reduce((n, s) => n + s.series.length, 0);
  const withToc = multi && nSeries > 2;
  if (multi) {
    await cover(D, job, newPage);
    if (job.intro) await intro(D, job, newPage, signal);
  }
  if (withToc) {
    // 目录页先留出来，最后补内容
    const lines = sections.reduce((n, s) => n + 2 + (s.series.length > 1 ? s.series.length : 0), 0);
    const nToc = Math.max(1, Math.ceil(lines / 44));
    for (let k = 0; k < nToc; k++) { newPage(); tocPages.push(pdf.getNumberOfPages()); }
  }

  for (const sec of sections) {
    let first = 0;
    const secToc = { group: sec.group, label: sec.label, n: sec.series.reduce((a, s) => a + s.list.length, 0), page: 0, series: [] };
    for (const se of sec.series) {
      check(signal);
      const pg = multi ? await seriesPage(D, se, P, newPage) : await singlePage(D, se.list[0], se, P, newPage);
      if (!first) first = pg;
      secToc.series.push({ label: seriesLabel(se), page: pg });
      for (const pd of se.list) idx.push({ model: pd.model, page: pg });
    }
    secToc.page = first;
    toc.push(secToc);
    if (job.details || !multi) await details(D, sec, job, newPage, signal);
  }

  if (multi && idx.length > 6) indexPages(D, P, idx, newPage);
  if (withToc) drawToc(D, job, toc, tocPages);
  pdf.setDisplayMode('100%', 'continuous', 'UseNone');
  pdf.setProperties({ title: job.title, creator: 'SKE Power', subject: SITE, author: 'SKE Power' });
  return pdf.output('blob');
}
const seriesLabel = (se) => (se.list.length > 1 ? `${se.title} — ${se.list[0].model} … ${se.list[se.list.length - 1].model}` : `${se.title} — ${se.list[0].model}`);

// 页面左上角：蓝色竖条 + 类目 + 系列名
function headBlock(D, eyebrow, title, sub, y) {
  D.rect(MX, y, 3.2, 34, BLUE);
  D.font(false, 9.5, BLUE); D.put(clean(eyebrow), MX + 10, y + 9, CW - 10);
  let yy = D.para(title, MX + 10, y + 13, CW - 10, { size: 17, bold: true, color: BLUE_D, lh: 1.2, max: 2 });
  if (sub) yy = D.para(sub, MX + 10, yy + 1, CW - 10, { size: 8.5, color: SOFT, max: 2 });
  return Math.max(y + 40, yy) + 10;
}
// 小图标：圆角方框 + 勾
function featIcon(D, x, y) {
  const L = D.px(x, 12), pdf = D.pdf;
  pdf.setDrawColor(...BLUE); pdf.setLineWidth(1); pdf.roundedRect(L, y, 12, 12, 2.5, 2.5, 'S');
  pdf.setLineWidth(1.2); pdf.lines([[2.4, 2.6], [4.6, -5.4]], L + 2.8, y + 6.2, [1, 1], 'S');
}
function bullets(D, list, x, y, w, size = 9, maxY = BOTTOM) {
  for (const t of list) {
    D.font(false, size, INK);
    const lines = D.wrap(t, w - 12);
    if (y + lines.length * size * 1.4 > maxY) break;
    D.dot(x + 3, y + size * 0.62, 1.9);
    for (const l of lines) { D.put(l, x + 11, y + size * 0.92, w - 11); y += size * 1.4; }
    y += size * 0.35;
  }
  return y;
}
// 照片 + 主要特点
async function hero(D, img, feats, desc, P, y, opts = {}) {
  const imgW = opts.imgW || 220, imgH = opts.imgH || 190;
  const im = img ? await photo(img, imgW, imgH) : null;
  const tx = im ? MX + imgW + 22 : MX, tw = im ? CW - imgW - 22 : CW;
  let ty = y;
  if (desc) ty = D.para(desc, tx, ty, tw, { size: 9, color: SOFT, max: opts.descMax || 4 }) + 6;
  if (opts.chips && opts.chips.length) ty = chips(D, opts.chips, tx, ty, tw) + 6;
  if (feats.length) {
    featIcon(D, tx, ty); D.font(true, 12, BLUE); D.put(P.features, tx + 18, ty + 10.5, tw - 18);
    ty = bullets(D, feats.slice(0, opts.maxFeat || 8), tx, ty + 20, tw, 9, y + Math.max(imgH, 230));
  }
  if (im) D.img(im, MX + (imgW - im.w) / 2, y, im.w, im.h);
  return Math.max(ty, im ? y + im.h : y) + 14;
}
function chips(D, list, x, y, w, size = 8.5) {
  let cx = 0; const h = size + 8;
  for (const t0 of list) {
    const t = clean(t0); D.font(true, size, BLUE_D);
    const tw = Math.min(w, D.w(t) + 14);
    if (cx && cx + tw > w) { cx = 0; y += h + 5; }
    D.rect(x + cx, y, tw, h, BLUE_L, null, 4);
    D.font(true, size, BLUE_D); D.put(t, x + cx + 7, y + size + 1.6, tw - 14);
    cx += tw + 5;
  }
  return y + h;
}
function footnote(D, P, y) {
  if (y + 14 > BOTTOM) return y;
  D.font(false, 7, SOFT); D.put(`* ${clean(P.note)}`, MX, y + 9, CW);
  return y + 14;
}

// 系列页：多型号对比参数表（相同的参数合并成一格）
async function seriesPage(D, se, P, newPage) {
  let y = newPage(); const page = D.pdf.getNumberOfPages();
  const models = se.list.map((p) => p.model);
  y = headBlock(D, se.cat, se.title, models.join('  ·  '), y);
  const feats = [...new Set(se.list.flatMap((p) => p.feats))];
  y = await hero(D, se.img, feats, se.list.length === 1 ? se.list[0].desc : (se.list[0].desc && feats.length < 3 ? se.list[0].desc : ''), P, y);
  const cont = () => { const yy = newPage(); return headBlock(D, se.cat, `${se.title} (${P.cont || '…'})`, '', yy); };
  // 参数行：所有型号参数名的并集，按第一次出现的顺序
  const keys = []; const seen = new Set();
  for (const p of se.list) for (const [k] of p.specs) if (!seen.has(k)) { seen.add(k); keys.push(k); }
  const per = 5;
  for (let c0 = 0; c0 < se.list.length; c0 += per) {
    const part = se.list.slice(c0, c0 + per);
    const rows = [[{ v: P.model || 'Model', head: true }, ...part.map((p) => ({ v: p.model, head: true }))]];
    for (const k of keys) {
      const vals = part.map((p) => (p.specs.find((s) => s[0] === k) || [])[1] || '—');
      if (vals.every((v) => v === '—') || vals.every((v, i) => v === part[i].model)) continue; // "型号"这一行表头已经有了
      const row = [{ v: k, label: true }];
      for (let i = 0; i < vals.length;) { let j = i + 1; while (j < vals.length && vals[j] === vals[i] && vals[i] !== '—') j++; row.push({ v: vals[i], cs: j - i }); i = j; }
      rows.push(row);
    }
    if (rows.length < 2) continue;
    // 行高按剩余空间放宽一点（像纸质手册那样表格占满下半页），放不下就用紧凑版
    let T = layoutTable(D, rows, { size: part.length > 4 ? 8 : 8.6, pad: 6, lh: 1.32, labelW: part.length === 1 ? CW * 0.42 : 122, equalFrom: 1 });
    if (y + T.rowH.reduce((a, b) => a + b, 0) > BOTTOM - 16) T = layoutTable(D, rows, { size: part.length > 4 ? 7.5 : 8, pad: 4, labelW: part.length === 1 ? CW * 0.42 : 118, equalFrom: 1 });
    y = drawTable(D, T, y, cont) + 8;
  }
  footnote(D, P, y);
  return page;
}

// 单个型号：大一点的图 + 介绍 + 亮点 + 特点 + 两列参数表 + 附加表格
async function singlePage(D, pd, se, P, newPage) {
  let y = newPage(); const page = D.pdf.getNumberOfPages();
  y = headBlock(D, `${se.cat}${pd.type && pd.type !== se.cat ? ' · ' + pd.type : ''}`, pd.model, '', y);
  y = await hero(D, pd.img, pd.feats, pd.desc, P, y, { imgW: 220, imgH: 200, descMax: 8, chips: pd.hl, maxFeat: 10 });
  const cont = () => { const yy = newPage(); return headBlock(D, se.cat, `${pd.model} (${P.cont || '…'})`, '', yy); };
  if (pd.specs.length) {
    D.font(true, 12, BLUE); D.put(P.specs, MX, y + 10, CW); y += 18;
    const rows = pd.specs.map(([k, v]) => [{ v: k, label: true }, { v, align: 'start' }]);
    const T = layoutTable(D, rows, { size: 8.5, labelW: CW * 0.36 });
    y = drawTable(D, T, y, cont) + 10;
  }
  for (const t of pd.vdis) {
    if (y + 40 > BOTTOM) y = cont();
    if (t.h) { D.font(true, 10, BLUE_D); D.put(clean(t.h), MX, y + 9, CW); y += 15; }
    y = drawTable(D, layoutTable(D, t.rows, { size: 7.5 }), y, cont) + 10;
  }
  footnote(D, P, y);
  return page;
}

/* ---------- 系列详情：模板详情图 / 详情 HTML（图片，压缩）、系列参数表（矢量表格） ---------- */
async function details(D, sec, job, newPage, signal) {
  const P = job.pdfT, seen = new Set(), list = [];
  for (const se of sec.series) for (const pd of se.list) {
    for (const it of pd.items) { const key = it.img || it.html; if (key && !seen.has(key)) { seen.add(key); list.push({ ...it, se }); } }
    for (const el of pd.series) {
      const key = 'S:' + el.textContent.replace(/\s+/g, ' ').trim().slice(0, 400);
      if (!seen.has(key)) { seen.add(key); list.push({ seriesEl: el, se }); }
    }
  }
  if (!list.length) return;
  let h2c = null;
  const getH2c = async () => { if (!h2c) { const m = await import('html2canvas-pro'); h2c = m.default || m; } return h2c; };
  let y = BOTTOM, headed = false;
  const top = () => { y = newPage(); if (!headed) { headed = true; y = headBlock(D, sec.label, P.details, '', y); } return y; };
  for (const it of list) {
    check(signal);
    // 系列参数表 HTML：里面有表格就转成矢量表格
    if (it.seriesEl && it.seriesEl.querySelector('table')) {
      const el = it.seriesEl;
      const title = [...el.querySelectorAll('h1,h2,h3,h4,caption')].map((x) => x.textContent.replace(/\s+/g, ' ').trim()).filter(Boolean)[0] || it.se.title;
      for (const tbl of el.querySelectorAll('table')) {
        const rows = htmlTableRows(tbl); if (!rows.length) continue;
        if (y + 60 > BOTTOM) y = top(); else y += 6;
        D.font(true, 11, BLUE_D); D.put(clean(title), MX, y + 10, CW); y += 18;
        y = drawTable(D, layoutTable(D, rows, { size: 7.5, minFont: 5.5 }), y, () => top()) + 8;
      }
      continue;
    }
    let c = null;
    try {
      if (it.img) c = imgToCanvas(await loadImg(it.img));
      else if (it.html) c = await htmlToCanvas(it.html, await getH2c());
      else if (it.seriesEl) c = await seriesToCanvas(document.importNode(it.seriesEl, true), await getH2c());
    } catch (e) { console.warn('[catalog] detail', e); }
    if (!c || !c.width || !c.height) continue;
    // 缩到 1150px 宽，然后按页切（切口找空白行）
    if (c.width > DETAIL_MAXW) {
      const k = DETAIL_MAXW / c.width, o = document.createElement('canvas');
      o.width = DETAIL_MAXW; o.height = Math.round(c.height * k);
      const g = o.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(c, 0, 0, o.width, o.height); c = o;
    }
    const ratio = CW / c.width;
    let sy = 0;
    while (sy < c.height - 2) {
      if (BOTTOM - y < 120) top();
      const roomPx = (BOTTOM - y) / ratio;
      let end = Math.min(c.height, sy + roomPx);
      if (end < c.height) end = Math.max(sy + roomPx * 0.5, findCut(c, end, sy + roomPx * 0.5));
      const h = Math.max(1, Math.round(end - sy));
      const s = document.createElement('canvas'); s.width = c.width; s.height = h;
      const g = s.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, s.width, h); g.drawImage(c, 0, sy, c.width, h, 0, 0, c.width, h);
      D.pdf.addImage(s.toDataURL('image/jpeg', DETAIL_Q), 'JPEG', MX, y, CW, h * ratio, undefined, 'FAST');
      y += h * ratio + 8; sy += h;
    }
    await wait(0);
  }
}
// 从 target 往上找一整行颜色基本一样的像素行（空白处）作为切口
function findCut(c, target, minY) {
  const g = c.getContext('2d', { willReadFrequently: true });
  const top = Math.max(0, Math.floor(minY)), h = Math.max(1, Math.floor(target) - top);
  let data;
  try { data = g.getImageData(0, top, c.width, h).data; } catch (e) { return target; }
  const W = c.width, step = 5;
  for (let r = h - 1; r >= 0; r--) {
    const o = r * W * 4, R = data[o], G = data[o + 1], B = data[o + 2];
    let same = true;
    for (let x = step; x < W; x += step) { const i = o + x * 4; if (Math.abs(data[i] - R) + Math.abs(data[i + 1] - G) + Math.abs(data[i + 2] - B) > 24) { same = false; break; } }
    if (same) return top + r + 1;
  }
  return target;
}

/* ---------- 封面 ---------- */
async function cover(D, job, newPage) {
  const pdf = D.pdf, C = job.company || {}, P = job.pdfT;
  newPage(); // 封面不要页脚：下面先铺一层白底盖住
  D.rect(0, 0, PW, PH, [255, 255, 255]);
  // 浅蓝渐变背景（上半部分）
  const bands = 48, top = PH * 0.62;
  for (let i = 0; i < bands; i++) {
    const t = i / (bands - 1);
    const col = [Math.round(232 + 20 * t), Math.round(240 + 13 * t), Math.round(252 + 2 * t)].map((v) => Math.min(255, v));
    pdf.setFillColor(...col); pdf.rect(0, (top / bands) * i, PW, top / bands + 1, 'F');
  }
  // 装饰：几道斜的浅色光带
  pdf.setGState(new pdf.GState({ opacity: 0.35 }));
  pdf.setFillColor(...BLUE_M);
  pdf.triangle(PW * 0.48, 0, PW, 0, PW, top * 0.72, 'F');
  pdf.setFillColor(255, 255, 255);
  pdf.triangle(PW * 0.66, 0, PW, 0, PW, top * 0.42, 'F');
  pdf.setGState(new pdf.GState({ opacity: 1 }));
  // 品牌
  D.font(true, 20, BLUE_D); D.put('SKE POWER', 54, 76, PW - 108);
  if (C.tagline) { D.font(false, 9.5, SOFT); D.put(clean(C.tagline), 54, 92, PW - 108); }
  // 标题
  D.rect(54, 214, 40, 3.2, BLUE);
  D.font(false, 11, BLUE); D.put(clean(P.edition), 54, 240, PW - 108);
  let y = D.para(job.coverTitle, 54, 252, PW - 108, { size: 34, bold: true, color: BLUE_D, lh: 1.12, max: 3 });
  if (job.coverSub) y = D.para(job.coverSub, 54, y + 6, PW - 140, { size: 10.5, color: SOFT, max: 5, lh: 1.5 });
  // 照片
  const ph = await photo(C.coverPhoto, PW, PH - top - 74, true);
  if (ph) D.img(ph, 0, top, PW, ph.h);
  // 底部联系方式
  D.rect(0, PH - 74, PW, 74, BLUE_D);
  D.font(true, 10, [255, 255, 255]); D.put(SITE, 54, PH - 42, 200);
  D.font(false, 9, [205, 220, 240]); D.put(MAIL, 54, PH - 28, 200);
  D.font(false, 9, [205, 220, 240]); D.put('WhatsApp / WeChat', 54, PH - 42, PW - 108, 'end');
  D.font(true, 10, [255, 255, 255]); D.put(PHONE, 54, PH - 28, PW - 108, 'end');
}

/* ---------- 公司介绍（最多 5 页） ---------- */
async function intro(D, job, newPage, signal) {
  const C = job.company || {}, P = job.pdfT, B = C.bj || {};
  // 1. 关于我们
  check(signal);
  let y = newPage();
  y = headBlock(D, C.eyebrow, C.title, '', y);
  y = D.para(C.lead, MX, y, CW, { size: 11, color: INK, lh: 1.5 }) + 8;
  const ab = await photo(C.aboutPhoto, CW, 230, true);
  if (ab) { D.img(ab, MX, y, CW, ab.h); y += ab.h + 14; }
  const sw = (CW - 20) / 3;
  (C.stats || []).slice(0, 3).forEach((s, i) => {
    const x = MX + i * (sw + 10);
    D.rect(x, y, sw, 56, BLUE_L, null, 6);
    D.font(true, 20, BLUE); D.put(`${s.n}${s.u || ''}`, x + 12, y + 26, sw - 24);
    D.font(false, 8.5, SOFT); D.put(clean(s.l), x + 12, y + 44, sw - 24);
  });
  y += 70;
  y = D.para(C.p1, MX, y, CW, { size: 9.5, lh: 1.55 }) + 6;
  y = D.para(C.p2, MX, y, CW, { size: 9.5, lh: 1.55 }) + 8;
  chips(D, ['ISO 9001', 'ISO 14001', 'ISO 45001'], MX, y, CW);

  // 2. 工厂与质量
  if (C.facH) {
    check(signal);
    y = newPage(); y = headBlock(D, C.facEyebrow, C.facH, '', y);
    const fw = (CW - 12) / 2, fh = 150;
    const fac = (C.facPhotos || []).slice(0, 4);
    for (let i = 0; i < fac.length; i++) {
      const x = MX + (i % 2) * (fw + 12), yy = y + Math.floor(i / 2) * (fh + 26);
      const im = await photo(fac[i].src, fw, fh, true); if (im) D.img(im, x, yy, fw, im.h);
      D.font(true, 8.5, INK); D.put(clean(fac[i].cap), x, yy + fh + 12, fw);
    }
    y += Math.ceil(fac.length / 2) * (fh + 26) + 6;
    (C.flow || []).forEach(([h, d], i) => {
      if (y + 34 > BOTTOM) return;
      D.rect(MX, y, CW, 30, i % 2 ? null : ZEBRA, null, 4);
      D.font(true, 13, BLUE); D.put(String(i + 1).padStart(2, '0'), MX + 10, y + 19.5, 28);
      D.font(true, 9.5, INK); D.put(clean(h), MX + 44, y + 13, CW - 54);
      D.font(false, 8, SOFT); D.put(clean(d), MX + 44, y + 24.5, CW - 54);
      y += 33;
    });
    if (C.apps && C.apps.length && y + 50 < BOTTOM) { y += 8; D.font(true, 11, BLUE_D); D.put(clean(C.appsH), MX, y + 10, CW); chips(D, C.apps, MX, y + 18, CW); }
  }

  // 3. 北京办公室
  if (B.name) {
    check(signal);
    y = newPage(); y = headBlock(D, B.eyebrow, B.h, '', y);
    D.font(true, 10.5, BLUE); y = D.para(B.name, MX, y, CW, { size: 10.5, bold: true, color: BLUE }) + 6;
    const bp = await photo(B.photo, CW, 220, true); if (bp) { D.img(bp, MX, y, CW, bp.h); y += bp.h + 12; }
    y = D.para(B.p, MX, y, CW, { size: 9.5, lh: 1.55 }) + 8;
    if (B.certs) {
      const cw3 = (CW - 16) / 3;
      B.certs.slice(0, 3).forEach(([c, d], i) => { const x = MX + i * (cw3 + 8); D.rect(x, y, cw3, 38, null, LINE, 5); D.font(true, 9, BLUE); D.put(clean(c), x + 9, y + 15, cw3 - 18); D.font(false, 7.5, SOFT); D.put(clean(d), x + 9, y + 28, cw3 - 18); });
      y += 48;
    }
    if (B.sectors) { D.font(true, 11, BLUE_D); D.put(clean(B.sectorsH), MX, y + 10, CW); y = chips(D, B.sectors, MX, y + 18, CW) + 12; }
    if (B.clients && y + 60 < BOTTOM) {
      D.font(true, 11, BLUE_D); D.put(clean(B.clientsH), MX, y + 10, CW); y += 16;
      if (B.clientsP) y = D.para(B.clientsP, MX, y, CW, { size: 8.5, color: SOFT, max: 2 }) + 4;
      const half = Math.ceil(B.clients.length / 2), cw2 = (CW - 16) / 2;
      B.clients.forEach((cl, i) => { const x = MX + (i < half ? 0 : cw2 + 16), yy = y + (i % half) * 13; if (yy + 12 > BOTTOM) return; D.dot(x + 3, yy + 5.5, 1.6); D.font(false, 8.5, INK); D.put(clean(cl), x + 10, yy + 8.5, cw2 - 10); });
    }
  }

  // 4. 产品类目
  if (C.cats && C.cats.length) {
    check(signal);
    y = newPage(); y = headBlock(D, C.rangeEyebrow || P.contents, C.rangeH || P.catalogue, '', y);
    const per = 5, gw = (CW - (per - 1) * 8) / per, gh = 92;
    for (const g of C.cats) {
      if (y + 30 > BOTTOM) break;
      D.font(true, 10, BLUE); D.put(clean(g.h), MX, y + 10, CW); y += 16;
      for (let i = 0; i < g.items.length; i++) {
        const x = MX + (i % per) * (gw + 8);
        if (i && i % per === 0) y += gh + 8;
        if (y + gh > BOTTOM) break;
        const it = g.items[i];
        D.rect(x, y, gw, gh, null, LINE, 5);
        const im = await photo(it.img, gw - 16, 48); if (im) D.img(im, x + (gw - im.w) / 2, y + 6 + (48 - im.h) / 2, im.w, im.h);
        D.para(it.label, x + 6, y + 58, gw - 12, { size: 7.8, bold: true, max: 2, lh: 1.2 });
        D.font(false, 7, SOFT); D.put(P.modelsTpl.replace('{n}', it.n), x + 6, y + gh - 6, gw - 12);
      }
      y += gh + 12;
    }
  }

  // 5. 联系与地址
  check(signal);
  y = newPage(); y = headBlock(D, P.contact, P.locH, '', y);
  const pl = (k) => (C.places || []).find((x) => x.key === k) || {};
  const locs = [[P.factory, 'SKE Industrial Park', C.factory, '', C.factoryZh], [P.hq, pl('shenzhen').en, pl('shenzhen').enAddr, pl('shenzhen').zh, pl('shenzhen').zhAddr], [P.office, pl('beijing').en, pl('beijing').enAddr, pl('beijing').zh, pl('beijing').zhAddr]];
  for (const [title, en, enAddr, zh, zhAddr] of locs) {
    const y0 = y;
    D.font(true, 8.5, BLUE); D.put(clean(title).toUpperCase(), MX + 14, y + 16, CW - 28);
    let yy = D.para(en, MX + 14, y + 22, CW - 28, { size: 11, bold: true });
    yy = D.para(enAddr, MX + 14, yy, CW - 28, { size: 9, color: INK });
    if (zhAddr) { D.font(false, 7.5, SOFT); D.put(clean(P.zhAddr), MX + 14, yy + 8, CW - 28); D.font(false, 9, INK); D.put(clean(`${zh || ''} ${zhAddr}`), MX + 14, yy + 21, CW - 28); yy += 24; }
    D.rect(MX, y0, CW, yy - y0 + 10, null, LINE, 6); D.rect(MX, y0, 3, yy - y0 + 10, BLUE);
    y = yy + 22;
  }
  const bw = (CW - 16) / 3;
  [['WhatsApp / WeChat', PHONE], ['Email', MAIL], ['Web', SITE]].forEach(([k, v], i) => {
    const x = MX + i * (bw + 8);
    D.rect(x, y, bw, 46, BLUE_D, null, 6);
    D.font(false, 8, [190, 210, 238]); D.put(k, x + 12, y + 17, bw - 24);
    D.font(true, 10.5, [255, 255, 255]); D.put(v, x + 12, y + 34, bw - 24);
  });
  y += 60;
  D.para(P.note, MX, y, CW, { size: 8, color: SOFT });
}

/* ---------- 目录 / 型号索引 ---------- */
function drawToc(D, job, toc, tocPages) {
  const pdf = D.pdf, P = job.pdfT;
  let pi = 0;
  pdf.setPage(tocPages[pi]);
  let y = MT;
  D.font(true, 28, BLUE_D); D.put(P.contents, MX, y + 26, CW);
  D.font(false, 10, BLUE); D.put('contents', MX, y + 42, CW);
  D.rect(MX, y + 50, 28, 2.4, BLUE);
  y += 76;
  const leader = (x1, x2, yy) => { if (x2 - x1 < 8) return; pdf.setDrawColor(...LINE); pdf.setLineWidth(0.8); pdf.setLineDashPattern([0.6, 2.4], 0); pdf.line(x1, yy, x2, yy); pdf.setLineDashPattern([], 0); };
  const row = (label, page, size, bold, color, indent) => {
    if (y + size * 1.9 > BOTTOM) { pi = Math.min(pi + 1, tocPages.length - 1); pdf.setPage(tocPages[pi]); y = MT + 10; }
    D.font(bold, size, color);
    const txt = clean(label), pgs = String(page);
    const maxW = CW - indent - 40;
    let t = txt; while (D.w(t) > maxW && t.length > 4) t = t.slice(0, -2);
    if (t !== txt) t = t.replace(/\s*$/, '…');
    const tw = D.w(t);
    D.put(t, MX + indent, y + size, CW - indent);
    D.font(true, size, BLUE); D.put(pgs, MX, y + size, CW, 'end');
    const pw = D.w(pgs);
    if (D.rtl) leader(MX + pw + 6, PW - MX - indent - tw - 6, y + size - 1); else leader(MX + indent + tw + 6, PW - MX - pw - 6, y + size - 1);
    y += size * 1.85;
  };
  let lastGroup = null;
  for (const s of toc) {
    if (s.group && s.group !== lastGroup) { y += lastGroup === null ? 0 : 6; if (y + 40 > BOTTOM) { pi = Math.min(pi + 1, tocPages.length - 1); pdf.setPage(tocPages[pi]); y = MT + 10; } D.font(true, 12, BLUE); D.put(clean(s.group), MX, y + 12, CW); y += 22; lastGroup = s.group; }
    row(`${s.label}  (${P.modelsTpl.replace('{n}', s.n)})`, s.page, 10.5, true, INK, 0);
    if (s.series.length > 1) for (const se of s.series) row(se.label, se.page, 8.5, false, SOFT, 14);
  }
  if (y + 30 < BOTTOM) D.para(P.note, MX, y + 12, CW, { size: 8, color: SOFT });
  pdf.setPage(pdf.getNumberOfPages());
}
function indexPages(D, P, idx, newPage) {
  const rows = [...idx].sort((a, b) => a.model.localeCompare(b.model, 'en', { numeric: true }));
  const cols = 3, gap = 18, cw = (CW - gap * (cols - 1)) / cols, lh = 13.5;
  let i = 0;
  while (i < rows.length) {
    let y = newPage();
    y = headBlock(D, 'SKE POWER', P.index, '', y);
    const perCol = Math.floor((BOTTOM - y) / lh);
    for (let c = 0; c < cols && i < rows.length; c++) {
      for (let r = 0; r < perCol && i < rows.length; r++, i++) {
        const x = MX + c * (cw + gap), yy = y + r * lh;
        D.font(false, 8, INK);
        let m = clean(rows[i].model); while (D.w(m) > cw - 28 && m.length > 3) m = m.slice(0, -1);
        D.put(m, x, yy + 8.5, cw);
        D.font(true, 8, BLUE); D.put(String(rows[i].page), x, yy + 8.5, cw, 'end');
        D.pdf.setDrawColor(...BLUE_L); D.pdf.setLineWidth(0.5); D.pdf.line(D.px(x, cw), yy + lh - 1.5, D.px(x, cw) + cw, yy + lh - 1.5);
      }
    }
  }
}

// 以前的版本要从页面借样式（截图用）；现在不需要了，保留这个接口给下载页调用
export function resetPdfCss() { document.querySelectorAll('[data-pdfx]').forEach((l) => l.remove()); }

export function saveBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name; a.rel = 'noopener';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
