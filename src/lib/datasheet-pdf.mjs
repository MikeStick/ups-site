// 产品页"下载参数表（PDF）"：在访客浏览器里把所在模板的详情图片、详情 HTML（按顺序）和系列参数表拼成 PDF。
// 页面宽 = A4 宽（595pt），每一块一页、页高按内容（太长的切成几页），打开时 100% 显示、连续滚动。
// 生成用的库（jsPDF、html2canvas）只在点按钮时才下载，不影响页面打开速度。
const PAGE_W = 595.28;          // A4 宽，pt
const MAX_H = 14000;            // PDF 单页最大高度（pt），超过就切页
const RENDER_W = 1000;          // HTML 按这个宽度排版后截图（和电脑上看到的一样）
const SCALE = 2;                // 截图清晰度

export const wait = (ms) => new Promise((ok) => setTimeout(ok, ms));

export function loadImg(src) {
  return new Promise((ok, bad) => { const im = new Image(); im.onload = () => ok(im); im.onerror = () => bad(new Error('image ' + src)); im.src = src; });
}
export function imgToCanvas(im) {
  const c = document.createElement('canvas');
  c.width = im.naturalWidth; c.height = im.naturalHeight;
  const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(im, 0, 0);
  return c;
}

// 详情 HTML（/h/<哈希>.html，同源）：放进屏幕外的 iframe 按 1000px 宽排版，等样式和图片加载完再截图
export async function htmlToCanvas(url, h2c) {
  const fr = document.createElement('iframe');
  fr.style.cssText = `position:fixed;left:-30000px;top:0;width:${RENDER_W}px;height:1200px;border:0;visibility:hidden`;
  fr.src = url;
  document.body.appendChild(fr);
  try {
    await new Promise((ok, bad) => { fr.onload = ok; fr.onerror = bad; setTimeout(ok, 15000); });
    const doc = fr.contentDocument;
    // PDF 里四周留白（网站上铺满，PDF 里贴着纸边不好看）
    const pad = doc.createElement('style');
    pad.textContent = 'html body{padding:28px 36px!important;box-sizing:border-box}';
    doc.head.appendChild(pad);
    await wait(900); // Tailwind 等脚本生成样式
    await Promise.all([...doc.images].map((im) => (im.complete ? 0 : new Promise((ok) => { im.onload = im.onerror = ok; setTimeout(ok, 8000); }))));
    if (doc.fonts && doc.fonts.ready) await Promise.race([doc.fonts.ready, wait(3000)]);
    const h = Math.ceil(doc.documentElement.scrollHeight);
    fr.style.height = h + 'px';
    await wait(150);
    return await h2c(doc.documentElement, { scale: SCALE, width: RENDER_W, height: h, windowWidth: RENDER_W, windowHeight: h, backgroundColor: '#ffffff', useCORS: true, logging: false });
  } finally { fr.remove(); }
}

// 系列参数表（页面上的 .series-html）：复制一份到屏幕外、按 1000px（表格更宽就按表格宽度）排版后截图
export async function seriesToCanvas(el, h2c) {
  const box = document.createElement('div');
  box.style.cssText = `position:absolute;left:-30000px;top:0;width:${RENDER_W}px;background:#fff;padding:24px 28px;box-sizing:border-box`;
  const clone = el.cloneNode(true);
  clone.style.margin = '0';
  // PDF 里不突出当前型号：去掉高亮（.cur），所有型号正常显示
  clone.querySelectorAll('.cur').forEach((n) => n.classList.remove('cur'));
  box.appendChild(clone);
  document.body.appendChild(box);
  try {
    await wait(50);
    let need = RENDER_W;
    clone.querySelectorAll('*').forEach((n) => { if (n.scrollWidth > n.clientWidth + 2 && getComputedStyle(n).overflowX !== 'visible') need = Math.max(need, RENDER_W + n.scrollWidth - n.clientWidth + 8); });
    if (need > RENDER_W) { box.style.width = need + 'px'; await wait(50); }
    return await h2c(box, { scale: SCALE, backgroundColor: '#ffffff', useCORS: true, logging: false, windowWidth: Math.max(need, RENDER_W) });
  } finally { box.remove(); }
}

// st.pdf 在第一页时才创建（页面大小按内容）；比宽还矮的页要标成横向，否则 jsPDF 会把宽高对调
function addCanvas(st, c) {
  const ratio = PAGE_W / c.width;          // pt / px
  const sliceH = Math.floor(MAX_H / ratio); // 每页最多多少像素高
  for (let y = 0; y < c.height; y += sliceH) {
    const h = Math.min(sliceH, c.height - y);
    let src = c;
    if (y > 0 || h < c.height) {
      src = document.createElement('canvas'); src.width = c.width; src.height = h;
      src.getContext('2d').drawImage(c, 0, y, c.width, h, 0, 0, c.width, h);
    }
    const ph = h * ratio;
    const orient = ph >= PAGE_W ? 'p' : 'l';
    if (!st.pdf) st.pdf = new st.JsPDF({ unit: 'pt', format: [PAGE_W, ph], orientation: orient, compress: true });
    else st.pdf.addPage([PAGE_W, ph], orient);
    st.pdf.addImage(src.toDataURL('image/jpeg', 0.9), 'JPEG', 0, 0, PAGE_W, ph, undefined, 'FAST');
  }
}

async function build(cfg) {
  const [{ jsPDF }, h2cMod] = await Promise.all([import('jspdf'), import('html2canvas-pro')]);
  const h2c = h2cMod.default || h2cMod;
  const st = { JsPDF: jsPDF, pdf: null };
  for (const it of cfg.items || []) {
    let c = null;
    try {
      if (it.img) c = imgToCanvas(await loadImg(it.img));
      else if (it.html) c = await htmlToCanvas(it.html, h2c);
    } catch (e) { console.warn('[datasheet]', e); }
    if (c && c.width && c.height) addCanvas(st, c);
  }
  if (cfg.series) {
    for (const el of document.querySelectorAll('.series-html')) {
      try { const c = await seriesToCanvas(el, h2c); if (c.width && c.height) addCanvas(st, c); }
      catch (e) { console.warn('[datasheet]', e); }
    }
  }
  if (!st.pdf) throw new Error('empty');
  st.pdf.setDisplayMode('100%', 'continuous', 'UseNone'); // 打开时 100% 显示
  st.pdf.setProperties({ title: cfg.title || cfg.name, creator: 'SKE Power' });
  return st.pdf.output('blob');
}

function download(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name; a.rel = 'noopener';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

export function initDatasheet() {
  document.querySelectorAll('[data-ds]').forEach((btn) => {
    let cfg; try { cfg = JSON.parse(btn.dataset.ds); } catch { return; }
    const label = btn.querySelector('span');
    const text = label ? label.textContent : '';
    let cached = null;
    btn.addEventListener('click', async () => {
      if (btn.disabled) return;
      if (cached) { download(cached, cfg.name); return; }
      btn.disabled = true; if (label) label.textContent = cfg.busy || '…';
      try { cached = await build(cfg); download(cached, cfg.name); }
      catch (e) { console.error(e); alert(cfg.fail || 'PDF failed'); }
      finally { btn.disabled = false; if (label) label.textContent = text; }
    });
  });
}
