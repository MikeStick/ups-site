// 下载中心：在访客浏览器里生成 PDF（A4 竖版）——整本产品目录 / 某个类目或大类的目录 / 单个型号的资料。
// 产品内容直接取网站上已发布的产品页（同站，数据总是最新）：图片、型号、亮点、介绍、特点、参数表；
// 勾选"详细页"时再加上所在模板的详情图片、详情 HTML 和系列参数表（同一份内容只放一次）。
// 每一块先按网页排版截图，再切成 A4 页：切口找整行空白的位置，避免把一行字切成两半。
// 页眉页脚用 PDF 自带字体只写拉丁字母（品牌、网址、页码），其他文字都在截图里，所以俄语、阿拉伯语都能正常显示。
import { wait, loadImg, imgToCanvas, htmlToCanvas, seriesToCanvas } from './datasheet-pdf.mjs';

const A4W = 595.28, A4H = 841.89;
const MX = 34, MT = 46, MB = 44;                 // 页边距（pt）
const CW = A4W - MX * 2, CH = A4H - MT - MB;     // 内容区
const SHEET_W = 794;                              // 产品页排版宽度（px）≈ A4 宽
const SCALE = 1.6;                                // 截图倍率：清晰度和文件大小的折中
const MAXW = 1300;                                // 截图最宽像素，超过先缩小（控制文件大小）
const JPEG_Q = 0.8;
const ACCENT = [15, 107, 92];

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const isLatin = (s) => /^[\x20-\x7e]*$/.test(String(s || ''));
function check(signal) { if (signal && signal.aborted) { const e = new Error('cancelled'); e.name = 'AbortError'; throw e; } }

/* ---------- 样式：只给生成用的离屏元素 ---------- */
const CSS = `
.pdfx{position:absolute;left:-40000px;top:0;width:${SHEET_W}px;background:#fff;color:#15211f;font-family:var(--body);box-sizing:border-box}
.pdfx *{box-sizing:border-box}
.pdfx h1,.pdfx h2,.pdfx h3{font-family:var(--display);margin:0;letter-spacing:0;color:#15211f}
.ps{padding:6px 4px 10px}
.ps-cat{display:flex;align-items:center;gap:10px;font:600 12px var(--mono);text-transform:uppercase;letter-spacing:.12em;color:#0f6b5c;border-bottom:2px solid #0f6b5c;padding-bottom:8px;margin-bottom:22px}
[dir=rtl] .ps-cat,[dir=rtl] .ps-type,[dir=rtl] .tc-h small{letter-spacing:0}
.ps-head{display:grid;grid-template-columns:300px minmax(0,1fr);gap:28px;align-items:start}
.ps-head.noimg{grid-template-columns:1fr}
.ps-img{border:1px solid #e3e8e6;border-radius:14px;background:#f6f8f7;display:flex;align-items:center;justify-content:center;aspect-ratio:1/1;overflow:hidden}
.ps-img img{width:92%;height:92%;object-fit:contain}
.ps-type{font:600 12px var(--mono);text-transform:uppercase;letter-spacing:.08em;color:#5b6b67}
.ps h1{font-size:40px;line-height:1.05;margin:6px 0 14px;word-break:break-word}
.ps-hl{list-style:none;margin:0 0 14px;padding:0;display:flex;flex-wrap:wrap;gap:6px}
.ps-hl li{border:1px solid #d5ddda;border-radius:8px;padding:5px 10px;font-size:13px;font-weight:600}
.ps-desc{margin:0;font-size:14.5px;line-height:1.6;color:#33413e}
.ps h2{font-size:21px;margin:26px 0 10px;padding-bottom:6px;border-bottom:1px solid #e3e8e6}
.ps-feat{margin:0;padding:0 0 0 20px;columns:2;column-gap:30px;font-size:13.5px;line-height:1.55}
[dir=rtl] .ps-feat{padding:0 20px 0 0}
.ps-feat li{break-inside:avoid;margin-bottom:5px}
.ps-specs{width:100%;border-collapse:collapse;font-size:13px}
.ps-specs th,.ps-specs td{padding:7px 10px;border-bottom:1px solid #e9eeec;text-align:start;vertical-align:top}
.ps-specs th{width:38%;color:#5b6b67;font-weight:600}
.ps-specs tr:nth-child(odd) td,.ps-specs tr:nth-child(odd) th{background:#f6f8f7}
.ps-extra h3{font-size:16px;margin:16px 0 6px}
.ps-extra table{width:100%;border-collapse:collapse;font-size:11.5px}
.ps-extra th,.ps-extra td{border:1px solid #e3e8e6;padding:4px 6px;text-align:center}
.ps-extra thead th{background:#f0f4f2}
/* 封面 */
.cv{height:${Math.round(SHEET_W * A4H / A4W)}px;background:#0f1d1b;color:#e6efec;padding:64px 60px 54px;display:flex;flex-direction:column;position:relative;overflow:hidden}
.cv-brand{font:700 30px var(--display);color:#fff;letter-spacing:.02em}
.cv-brand small{display:block;font:500 13px var(--body);color:#9fb2ad;letter-spacing:0;margin-top:4px}
.cv-photo{margin:46px -60px 0;height:420px;background:#22302d center/cover no-repeat}
.cv-t{margin-top:auto}
.cv-eye{font:600 13px var(--mono);text-transform:uppercase;letter-spacing:.14em;color:#5ef0a0}
[dir=rtl] .cv-eye{letter-spacing:0}
.cv h1{font-size:62px;line-height:1.02;color:#fff;margin:10px 0 14px}
.cv-sub{font-size:16px;color:#c9d6d2;line-height:1.55;max-width:600px}
.cv-foot{display:flex;justify-content:space-between;gap:20px;margin-top:40px;padding-top:18px;border-top:1px solid rgba(255,255,255,.16);font-size:13px;color:#9fb2ad}
.cv-foot b{color:#fff}
/* 公司介绍 */
.in{padding:4px 2px 8px}
.in h1{font-size:38px;margin:0 0 10px}
.in-lead{font-size:16px;line-height:1.6;color:#33413e;margin:0 0 18px}
.in-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:0 0 20px}
.in-stats div{border:1px solid #e3e8e6;border-radius:12px;padding:12px 14px}
.in-stats b{display:block;font:700 28px var(--display);color:#0f6b5c}
.in-stats b small{font-size:15px}
.in-stats span{font-size:12.5px;color:#5b6b67}
.in p{font-size:14px;line-height:1.65;color:#33413e;margin:0 0 12px}
.in-ph{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:8px 0 18px}
.in-ph div{aspect-ratio:4/3;border-radius:10px;background:#eef2f0 center/cover no-repeat}
.in-cert{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 18px}
.in-cert span{border:1px solid #0f6b5c;color:#0f6b5c;border-radius:6px;padding:4px 10px;font:600 12px var(--mono)}
.in-ct{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
.in-ct div{background:#f6f8f7;border-radius:10px;padding:12px 14px;font-size:12.5px;line-height:1.5}
.in-ct b{display:block;font-size:13.5px;margin-bottom:2px}
/* 目录 / 索引 */
.tc{padding:4px 2px 8px}
.tc h1{font-size:38px;margin:0 0 20px}
.tc-g{margin:0 0 16px}
.tc-gh{font:600 12px var(--mono);text-transform:uppercase;letter-spacing:.12em;color:#0f6b5c;margin:0 0 6px}
.tc-r{display:flex;align-items:baseline;gap:8px;padding:6px 0;font-size:15px;border-bottom:1px dotted #cfd8d5}
.tc-r small{color:#5b6b67;font-size:12.5px}
.tc-r i{flex:1}
.tc-r b{font:600 14px var(--mono);direction:ltr}
.ix{columns:3;column-gap:26px;font-size:12px}
.ix div{display:flex;gap:6px;padding:3px 0;border-bottom:1px dotted #dfe5e3;break-inside:avoid}
.ix div span{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;direction:ltr;text-align:start}
.ix div b{font:600 11.5px var(--mono)}
.dt-h{font:600 12px var(--mono);text-transform:uppercase;letter-spacing:.12em;color:#0f6b5c;border-bottom:2px solid #0f6b5c;padding:0 0 8px;margin:0 0 4px}
`;
function ensureCss() {
  if (document.getElementById('pdfx-css')) return;
  const st = document.createElement('style'); st.id = 'pdfx-css'; st.textContent = CSS; document.head.appendChild(st);
}

/* ---------- 截图 ---------- */
function mount(html, dir, lang) {
  const box = document.createElement('div');
  box.className = 'pdfx'; box.dir = dir; box.lang = lang; box.innerHTML = html;
  document.body.appendChild(box);
  return box;
}
async function waitImages(el) {
  await Promise.all([...el.querySelectorAll('img')].map((im) => (im.complete && im.naturalWidth ? 0 : new Promise((ok) => { im.onload = im.onerror = ok; setTimeout(ok, 10000); }))));
  const bgs = [...el.querySelectorAll('[data-bg]')].map((d) => d.dataset.bg);
  await Promise.all(bgs.map((u) => loadImg(u).catch(() => 0)));
}
async function shoot(h2c, html, job) {
  const box = mount(html, job.dir, job.lang);
  try {
    await waitImages(box);
    if (document.fonts && document.fonts.ready) await Promise.race([document.fonts.ready, wait(2500)]);
    await wait(60); // 阿拉伯语页面的数字方向修正（MutationObserver）先跑完
    return await h2c(box, { scale: SCALE, backgroundColor: '#ffffff', useCORS: true, logging: false, windowWidth: SHEET_W });
  } finally { box.remove(); }
}
function fitWidth(c, maxW = MAXW) {
  if (c.width <= maxW) return c;
  const k = maxW / c.width, o = document.createElement('canvas');
  o.width = maxW; o.height = Math.round(c.height * k);
  const g = o.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(c, 0, 0, o.width, o.height);
  return o;
}
// 从 target 往上找一整行颜色基本一样的像素行（空白处）作为切口；找不到就硬切
function findCut(c, target, minY) {
  const g = c.getContext('2d', { willReadFrequently: true });
  const top = Math.max(0, Math.floor(minY)), h = Math.max(1, Math.floor(target) - top);
  let data;
  try { data = g.getImageData(0, top, c.width, h).data; } catch (e) { return target; }
  const W = c.width, step = 5;
  for (let r = h - 1; r >= 0; r--) {
    const o = r * W * 4;
    const R = data[o], G = data[o + 1], B = data[o + 2];
    let same = true;
    for (let x = step; x < W; x += step) {
      const i = o + x * 4;
      if (Math.abs(data[i] - R) + Math.abs(data[i + 1] - G) + Math.abs(data[i + 2] - B) > 24) { same = false; break; }
    }
    if (same) return top + r + 1;
  }
  return target;
}

/* ---------- PDF 页面 ---------- */
function newPage(st) {
  if (!st.pdf) st.pdf = new st.JsPDF({ unit: 'pt', format: 'a4', orientation: 'p', compress: true });
  else st.pdf.addPage('a4', 'p');
  return st.pdf.getNumberOfPages();
}
function frame(st, n, label) {
  const pdf = st.pdf;
  pdf.setDrawColor(...ACCENT); pdf.setLineWidth(1.2); pdf.line(MX, 30, A4W - MX, 30);
  pdf.setFont('helvetica', 'bold'); pdf.setFontSize(9); pdf.setTextColor(...ACCENT);
  pdf.text('SKE POWER', MX, 24);
  if (label && isLatin(label)) { pdf.setFont('helvetica', 'normal'); pdf.setTextColor(110, 125, 121); pdf.text(String(label).slice(0, 70), A4W - MX, 24, { align: 'right' }); }
  pdf.setDrawColor(220, 228, 225); pdf.setLineWidth(.6); pdf.line(MX, A4H - 30, A4W - MX, A4H - 30);
  pdf.setFont('helvetica', 'normal'); pdf.setFontSize(8); pdf.setTextColor(110, 125, 121);
  pdf.text('www.ups-china.com  ·  sales@ups-china.com  ·  WhatsApp +86 152 0127 3157', MX, A4H - 18);
  pdf.text(String(n), A4W - MX, A4H - 18, { align: 'right' });
}
// 一张截图放进 A4 内容区，太长就在空白处切成几页；返回第一页页码
function addA4(st, canvas, label) {
  const c = fitWidth(canvas);
  const ratio = CW / c.width, pageH = CH / ratio;
  let y = 0, first = 0;
  while (y < c.height - 2) {
    let end = Math.min(c.height, y + pageH);
    if (end < c.height) end = Math.max(y + pageH * 0.55, findCut(c, end, y + pageH * 0.55));
    const h = Math.max(1, Math.round(end - y));
    const s = document.createElement('canvas'); s.width = c.width; s.height = h;
    const g = s.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, s.width, h); g.drawImage(c, 0, y, c.width, h, 0, 0, c.width, h);
    const n = newPage(st); if (!first) first = n;
    st.pdf.addImage(s.toDataURL('image/jpeg', JPEG_Q), 'JPEG', MX, MT, CW, h * ratio, undefined, 'FAST');
    frame(st, n, label);
    y += h;
  }
  return first;
}
// 封面：整页铺满，不加页眉页脚
function addFull(st, canvas) {
  const c = fitWidth(canvas);
  newPage(st);
  st.pdf.addImage(c.toDataURL('image/jpeg', 0.86), 'JPEG', 0, 0, A4W, A4H, undefined, 'FAST');
}

/* ---------- 读取产品页 ---------- */
const cssLoaded = new Set();
// 生成完把借来的产品页样式拿掉（页面上还原），下次生成重新加载
export function resetPdfCss() { document.querySelectorAll('[data-pdfx]').forEach((l) => l.remove()); cssLoaded.clear(); }
async function loadPageCss(doc) {
  // Astro 会把小的样式表直接内联成 <style>：也一起带过来（按内容去重）
  for (const st of doc.querySelectorAll('style')) {
    const txt = st.textContent || '', key = 'S' + txt.length + ':' + txt.slice(0, 120);
    if (!txt.includes('series-html') || cssLoaded.has(key)) continue;
    cssLoaded.add(key);
    const el = document.createElement('style'); el.textContent = txt; el.dataset.pdfx = '1'; document.head.appendChild(el);
  }
  const links = [...doc.querySelectorAll('link[rel="stylesheet"][href]')].map((l) => l.getAttribute('href')).filter((h) => h && !cssLoaded.has(h));
  await Promise.all(links.map((h) => new Promise((ok) => {
    cssLoaded.add(h);
    const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = h; l.dataset.pdfx = '1';
    l.onload = l.onerror = ok; document.head.appendChild(l); setTimeout(ok, 6000);
  })));
}
async function readProduct(lang, slug) {
  const r = await fetch(`/${lang}/p/${slug}/`, { credentials: 'same-origin' });
  if (!r.ok) throw new Error(`page ${slug} ${r.status}`);
  const doc = new DOMParser().parseFromString(await r.text(), 'text/html');
  const q = (s) => doc.querySelector(s);
  const txt = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');
  const img = q('.gallery-col img');
  let ds = null; try { ds = JSON.parse((q('[data-ds]') || {}).dataset?.ds || 'null'); } catch (e) { ds = null; }
  return {
    doc,
    type: txt(q('.summary .type')),
    model: txt(q('.summary h1')),
    img: img ? img.getAttribute('src') : '',
    hl: [...doc.querySelectorAll('.summary .highlights li')].map(txt).filter(Boolean),
    desc: txt(q('.summary .desc')),
    feats: [...doc.querySelectorAll('.details ul.features li')].map(txt).filter(Boolean),
    specs: [...doc.querySelectorAll('.details dl.specs > div')].map((d) => [txt(d.querySelector('dt')), txt(d.querySelector('dd'))]).filter((x) => x[0] || x[1]),
    vdis: [...doc.querySelectorAll('.details .vdis .vdis-t')].map((el) => ({ h: txt(el.querySelector('h3')), table: (el.querySelector('table') || {}).outerHTML || '' })),
    items: ds && Array.isArray(ds.items) ? ds.items : [],
    series: [...doc.querySelectorAll('.series-html')],
  };
}
function sheetHtml(pd, catLabel, P) {
  const stripAttrs = (h) => h.replace(/\s(class|style|data-astro-cid-[\w-]+)="[^"]*"/g, '');
  return `<div class="ps">
    ${catLabel ? `<div class="ps-cat">${esc(catLabel)}</div>` : ''}
    <div class="ps-head${pd.img ? '' : ' noimg'}">
      ${pd.img ? `<div class="ps-img"><img src="${esc(pd.img)}" alt=""></div>` : ''}
      <div class="ps-info">
        ${pd.type && pd.type.toLowerCase() !== String(catLabel || '').toLowerCase() ? `<div class="ps-type">${esc(pd.type)}</div>` : ''}
        <h1>${esc(pd.model)}</h1>
        ${pd.hl.length ? `<ul class="ps-hl">${pd.hl.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
        ${pd.desc ? `<p class="ps-desc">${esc(pd.desc)}</p>` : ''}
      </div>
    </div>
    ${pd.feats.length ? `<h2>${esc(P.features)}</h2><ul class="ps-feat">${pd.feats.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
    ${pd.specs.length ? `<h2>${esc(P.specs)}</h2><table class="ps-specs">${pd.specs.map(([k, v]) => `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`).join('')}</table>` : ''}
    ${pd.vdis.length ? `<div class="ps-extra">${pd.vdis.map((x) => `<h3>${esc(x.h)}</h3>${stripAttrs(x.table)}`).join('')}</div>` : ''}
  </div>`;
}

/* ---------- 封面、公司介绍、目录、索引 ---------- */
function coverHtml(job) {
  const C = job.company;
  return `<div class="cv">
    <div class="cv-brand">SKE POWER<small>${esc(C.tagline || '')}</small></div>
    ${C.coverPhoto ? `<div class="cv-photo" data-bg="${esc(C.coverPhoto)}" style="background-image:url('${esc(C.coverPhoto)}')"></div>` : ''}
    <div class="cv-t">
      <div class="cv-eye">${esc(job.pdfT.edition)}</div>
      <h1>${esc(job.coverTitle)}</h1>
      ${job.coverSub ? `<div class="cv-sub">${esc(job.coverSub)}</div>` : ''}
    </div>
    <div class="cv-foot"><span><b>www.ups-china.com</b><br>sales@ups-china.com</span><span style="text-align:end">WhatsApp / WeChat<br><b>+86 152 0127 3157</b></span></div>
  </div>`;
}
function introHtml(job) {
  const C = job.company, P = job.pdfT;
  return `<div class="in">
    <div class="ps-cat">${esc(C.eyebrow)}</div>
    <h1>${esc(C.title)}</h1>
    <p class="in-lead">${esc(C.lead)}</p>
    <div class="in-stats">${C.stats.map((s) => `<div><b>${esc(s.n)}${s.u ? `<small>${esc(s.u)}</small>` : ''}</b><span>${esc(s.l)}</span></div>`).join('')}</div>
    <p>${esc(C.p1)}</p><p>${esc(C.p2)}</p>
    ${C.photos.length ? `<div class="in-ph">${C.photos.slice(0, 3).map((u) => `<div data-bg="${esc(u)}" style="background-image:url('${esc(u)}')"></div>`).join('')}</div>` : ''}
    <div class="in-cert">${['ISO 9001', 'ISO 14001', 'ISO 45001'].map((x) => `<span>${x}</span>`).join('')}</div>
    <div class="in-ct">
      <div><b>${esc(P.factory)}</b>${esc(C.factory)}</div>
      <div><b>${esc(P.hq)}</b>${esc(C.hq)}</div>
      <div><b>${esc(P.office)}</b>${esc(C.office)}</div>
      <div><b>${esc(P.contact)}</b>sales@ups-china.com<br>WhatsApp / WeChat +86 152 0127 3157<br>www.ups-china.com</div>
    </div>
  </div>`;
}
function tocHtml(job, toc) {
  const P = job.pdfT;
  const groups = [];
  for (const e of toc) { let g = groups.find((x) => x.h === e.group); if (!g) groups.push((g = { h: e.group, rows: [] })); g.rows.push(e); }
  return `<div class="tc"><h1>${esc(P.contents)}</h1>
    ${groups.map((g) => `<div class="tc-g">${g.h ? `<div class="tc-gh">${esc(g.h)}</div>` : ''}${g.rows.map((e) => `<div class="tc-r"><span>${esc(e.label)}</span>${e.n ? `<small>${esc(P.modelsTpl.replace('{n}', e.n))}</small>` : ''}<i></i><b>${e.page}</b></div>`).join('')}</div>`).join('')}
    <p style="font-size:12px;color:#5b6b67;margin-top:22px">${esc(P.note)}</p></div>`;
}
function indexHtml(job, idx) {
  const rows = [...idx].sort((a, b) => a.model.localeCompare(b.model, 'en', { numeric: true }));
  return `<div class="tc"><div class="dt-h">${esc(job.pdfT.index)}</div><div class="ix" style="margin-top:12px">${rows.map((r) => `<div><span>${esc(r.model)}</span><b>${r.page}</b></div>`).join('')}</div></div>`;
}

/* ---------- 主流程 ---------- */
// job: { mode: 'single'|'catalog', lang, dir, sections: [{ group, label, slugs }], intro, details, pdfT, company, coverTitle, coverSub, title }
export async function buildPdf(job, onProgress = () => {}, signal) {
  ensureCss();
  const [{ jsPDF }, h2cMod] = await Promise.all([import('jspdf'), import('html2canvas-pro')]);
  const h2c = h2cMod.default || h2cMod;
  const st = { JsPDF: jsPDF, pdf: null };
  const P = job.pdfT;
  const total = job.sections.reduce((n, s) => n + s.slugs.length, 0);
  let done = 0;
  const seen = new Set(); // 详情内容去重：同一个模板的图片 / HTML / 系列表只放一次
  const toc = [], idx = [];
  let tocPage = 0;
  const multi = job.mode !== 'single';

  if (multi) {
    addFull(st, await shoot(h2c, coverHtml(job), job)); check(signal);
    if (job.intro) { addA4(st, await shoot(h2c, introHtml(job), job)); check(signal); }
    tocPage = newPage(st); // 目录页先空着，最后补上（这时才知道每个类目从第几页开始）
  }

  for (const sec of job.sections) {
    const details = [];
    let first = 0;
    for (const slug of sec.slugs) {
      check(signal);
      onProgress(done, total);
      let pd;
      try { pd = await readProduct(job.lang, slug); } catch (e) { console.warn('[catalog]', e); done++; continue; }
      const c = await shoot(h2c, sheetHtml(pd, sec.label, P), job);
      const pg = addA4(st, c, pd.model);
      if (!first) first = pg;
      idx.push({ model: pd.model, page: pg });
      if (job.details || !multi) {
        for (const it of pd.items) {
          const key = it.img || it.html;
          if (key && !seen.has(key)) { seen.add(key); details.push({ ...it, model: pd.model }); }
        }
        if (pd.series.length) {
          await loadPageCss(pd.doc);
          for (const el of pd.series) {
            const key = 'S:' + el.textContent.replace(/\s+/g, ' ').trim().slice(0, 400);
            if (!seen.has(key)) { seen.add(key); details.push({ series: document.importNode(el, true), model: pd.model }); }
          }
        }
      }
      done++;
      onProgress(done, total);
      // 单个型号：详情紧接在后面
      if (!multi) await addDetails(st, h2c, details.splice(0), job, signal, pd.model);
    }
    if (multi && first) toc.push({ group: sec.group, label: sec.label, n: sec.slugs.length, page: first });
    if (multi && details.length) await addDetails(st, h2c, details, job, signal, sec.label, true);
  }
  if (!st.pdf) throw new Error('empty');

  if (multi) {
    if (idx.length > 6) addA4(st, await shoot(h2c, indexHtml(job, idx), job));
    // 补目录页（目录只有一页：类目数量不多）
    const c = fitWidth(await shoot(h2c, tocHtml(job, toc), job));
    st.pdf.setPage(tocPage);
    const ratio = CW / c.width, h = Math.min(CH, c.height * ratio);
    st.pdf.addImage(c.toDataURL('image/jpeg', JPEG_Q), 'JPEG', MX, MT, CW, h, undefined, 'FAST');
    frame(st, tocPage, '');
    st.pdf.setPage(st.pdf.getNumberOfPages());
  }
  st.pdf.setDisplayMode('100%', 'continuous', 'UseNone');
  st.pdf.setProperties({ title: job.title, creator: 'SKE Power', subject: 'www.ups-china.com' });
  return st.pdf.output('blob');
}

async function addDetails(st, h2c, list, job, signal, label, withHeader) {
  let headed = !withHeader;
  for (const it of list) {
    check(signal);
    let c = null;
    try {
      if (it.img) c = imgToCanvas(await loadImg(it.img));
      else if (it.html) c = await htmlToCanvas(it.html, h2c);
      else if (it.series) c = await seriesToCanvas(it.series, h2c); // 它会自己复制一份放到屏幕外排版
    } catch (e) { console.warn('[catalog] detail', e); }
    if (!c || !c.width || !c.height) continue;
    if (!headed) {
      // 类目的"系列详情"第一页上面加一条小标题
      const head = await shoot(h2c, `<div class="ps" style="padding-bottom:0"><div class="dt-h">${esc(label)} · ${esc(job.pdfT.details)}</div></div>`, job);
      const merged = document.createElement('canvas');
      const cc = fitWidth(c), hh = fitWidth(head, cc.width);
      merged.width = cc.width; merged.height = Math.round(hh.height * cc.width / hh.width) + cc.height;
      const g = merged.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, merged.width, merged.height);
      g.drawImage(hh, 0, 0, merged.width, merged.height - cc.height); g.drawImage(cc, 0, merged.height - cc.height);
      c = merged; headed = true;
    }
    addA4(st, c, isLatin(it.model) ? it.model : '');
  }
}

export function saveBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name; a.rel = 'noopener';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
