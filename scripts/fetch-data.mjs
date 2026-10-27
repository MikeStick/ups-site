// 构建前运行：从客户档案系统拉取已发布产品 → src/data/products.json
// 产品图片下载到 public/media/<slug>/，压缩成 WebP，随网站一起发布到 Cloudflare 全球节点，
// 客户打开页面时图片不经过 VPS。
//
// 需要的环境变量（在 Cloudflare Pages → Settings → Environment variables 里设置）：
//   CRM_API_BASE    https://b2b.google-helper.com
//   SITE_BUILD_KEY  和 VPS 上 site-config.json 里的 SITE_BUILD_KEY 一致
// 没有设置时（本地开发），使用 src/data/sample-products.json 里的示例数据。

import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
// 文件名里带上图片内容的短哈希：换了图片文件名就变，浏览器和 CDN 不会继续显示缓存里的旧图
const hashOf = (buf) => crypto.createHash('sha1').update(buf).digest('hex').slice(0, 8);

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT_JSON = path.join(ROOT, 'src/data/products.json');
const SITE_JSON = path.join(ROOT, 'src/data/site.json'); // 网站管理：图片位 + 近期动态
const MEDIA_DIR = path.join(ROOT, 'public/media');
const API = (process.env.CRM_API_BASE || '').replace(/\/$/, '');
const KEY = process.env.SITE_BUILD_KEY || '';

let sharp = null;
try { sharp = (await import('sharp')).default; } catch { console.warn('[fetch-data] sharp 不可用，图片按原格式保存'); }

async function getJson(url) {
  const r = await fetch(url, { headers: { 'x-site-key': KEY } });
  if (!r.ok) throw new Error(`${url} → HTTP ${r.status}`);
  return r.json();
}

async function saveImage(url, slug, idx) {
  const r = await fetch(url, { headers: { 'x-site-key': KEY } });
  if (!r.ok) { console.warn(`[fetch-data] 图片下载失败 ${url} → HTTP ${r.status}`); return null; }
  const buf = Buffer.from(await r.arrayBuffer());
  const dir = path.join(MEDIA_DIR, slug);
  await fs.mkdir(dir, { recursive: true });
  if (sharp) {
    const h = hashOf(buf);
    const name = `${idx + 1}-${h}.webp`;
    await sharp(buf).rotate().resize({ width: 1400, height: 1400, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82 }).toFile(path.join(dir, name));
    const thumb = `${idx + 1}-${h}-thumb.webp`;
    await sharp(buf).rotate().resize({ width: 480, height: 480, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 78 }).toFile(path.join(dir, thumb));
    return { src: `/media/${slug}/${name}`, thumb: `/media/${slug}/${thumb}` };
  }
  const ext = (url.split('.').pop() || 'jpg').split('?')[0].toLowerCase();
  const name = `${idx + 1}-${hashOf(buf)}.${ext}`;
  await fs.writeFile(path.join(dir, name), buf);
  return { src: `/media/${slug}/${name}`, thumb: `/media/${slug}/${name}` };
}

// 首页动画素材（hp_*）：视频原样保存；场景照片压成 1920 宽的 JPEG（全屏显示要清楚）；UPS 产品图保留透明背景（WebP）
async function saveHeroMedia(url, slot) {
  const r = await fetch(url, { headers: { 'x-site-key': KEY } });
  if (!r.ok) { console.warn(`[fetch-data] 首页动画素材下载失败 ${url} → HTTP ${r.status}`); return null; }
  const buf = Buffer.from(await r.arrayBuffer());
  const dir = path.join(MEDIA_DIR, '_site');
  await fs.mkdir(dir, { recursive: true });
  const ext = (decodeURIComponent(url).split('.').pop() || '').split('?')[0].toLowerCase();
  const h = hashOf(buf);
  if (ext === 'mp4' || ext === 'webm') {
    if (buf.length > 24 * 1024 * 1024) { console.warn(`[fetch-data] ${slot} 视频超过 24MB，Cloudflare 无法发布，已跳过`); return null; }
    const name = `${slot}-${h}.${ext}`;
    await fs.writeFile(path.join(dir, name), buf);
    return { src: `/media/_site/${name}` };
  }
  if (!sharp) { const name = `${slot}-${h}.${ext || 'jpg'}`; await fs.writeFile(path.join(dir, name), buf); return { src: `/media/_site/${name}` }; }
  if (slot === 'hp_ups') {
    const name = `${slot}-${h}.webp`;
    await sharp(buf).rotate().resize({ width: 700, height: 900, fit: 'inside', withoutEnlargement: true }).webp({ quality: 88 }).toFile(path.join(dir, name));
    return { src: `/media/_site/${name}` };
  }
  const name = `${slot}-${h}.jpg`;
  await sharp(buf).rotate().resize({ width: 1920, height: 1080, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 80, progressive: true, mozjpeg: true }).toFile(path.join(dir, name));
  return { src: `/media/_site/${name}` };
}

// 详情图：通常是很长的竖图，WebP 最大边长只有 16383px，所以用 JPEG（最大 65535px），宽度压到 1200 以内
// prefix：产品自己的详情图是 d1、d2…；模板图片放在 _tpl/<模板id>/ 下，用 t1、t2…
async function saveDetailImage(url, slug, idx, prefix = 'd') {
  const r = await fetch(url, { headers: { 'x-site-key': KEY } });
  if (!r.ok) { console.warn(`[fetch-data] 详情图下载失败 ${url} → HTTP ${r.status}`); return null; }
  const buf = Buffer.from(await r.arrayBuffer());
  const dir = path.join(MEDIA_DIR, slug);
  await fs.mkdir(dir, { recursive: true });
  if (sharp) {
    const name = `${prefix}${idx + 1}-${hashOf(buf)}.jpg`;
    const info = await sharp(buf, { limitInputPixels: false }).rotate()
      .resize({ width: 1200, withoutEnlargement: true })
      .flatten({ background: '#ffffff' })
      .jpeg({ quality: 82, progressive: true, mozjpeg: true })
      .toFile(path.join(dir, name));
    return { src: `/media/${slug}/${name}`, w: info.width, h: info.height };
  }
  const ext = (url.split('.').pop() || 'jpg').split('?')[0].toLowerCase();
  const name = `${prefix}${idx + 1}-${hashOf(buf)}.${ext}`;
  await fs.writeFile(path.join(dir, name), buf);
  return { src: `/media/${slug}/${name}` };
}

async function main() {
  await fs.rm(MEDIA_DIR, { recursive: true, force: true });

  if (!API || !KEY) {
    console.warn('[fetch-data] 未设置 CRM_API_BASE / SITE_BUILD_KEY，使用示例数据');
    const sample = await fs.readFile(path.join(ROOT, 'src/data/sample-products.json'), 'utf8');
    await fs.writeFile(OUT_JSON, sample);
    await fs.writeFile(SITE_JSON, JSON.stringify({ assets: {}, news: [] }));
    return;
  }

  const list = await getJson(`${API}/api/public/products`);
  console.log(`[fetch-data] 拉取到 ${list.length} 个已发布产品`);
  // 模板图片缓存：多个产品引用同一个模板时只下载、压缩一次，网站上也是同一个文件（浏览器缓存可复用）
  const tplCache = new Map();
  const tplCounters = new Map();
  async function saveTemplateImage(url) {
    if (tplCache.has(url)) return tplCache.get(url);
    const m = url.match(/\/tplmedia\/([^/]+)\//);
    const tplId = m ? decodeURIComponent(m[1]).replace(/[^A-Za-z0-9_-]/g, '') : 'misc';
    const n = tplCounters.get(tplId) || 0;
    tplCounters.set(tplId, n + 1);
    const job = saveDetailImage(url, `_tpl/${tplId}`, n, 't').catch((e) => {
      console.warn(`[fetch-data] 模板图片处理失败 ${url}：${e.message}`);
      return null;
    });
    tplCache.set(url, job);
    return job;
  }
  for (const p of list) {
    const imgs = [];
    for (const [i, url] of (p.images || []).entries()) {
      const saved = await saveImage(url, p.slug, i);
      if (saved) imgs.push(saved);
    }
    p.images = imgs;
    const details = [];
    for (const [i, url] of (p.detailImages || []).entries()) {
      try { const saved = await saveDetailImage(url, p.slug, i); if (saved) details.push(saved); }
      catch (e) { console.warn(`[fetch-data] 详情图处理失败 ${url}：${e.message}`); }
    }
    p.detailImages = details;
    const tpl = [];
    for (const url of p.templateImages || []) {
      const saved = await saveTemplateImage(url);
      if (saved) tpl.push(saved);
    }
    p.templateImages = tpl;
    // 详情图片 + HTML 片段的完整顺序：图片换成本地文件（和 templateImages 共用缓存），HTML 原样保留
    if (Array.isArray(p.templateDetail)) {
      const seq = [];
      for (const x of p.templateDetail) {
        if (x && x.img) { const saved = await saveTemplateImage(x.img); if (saved) seq.push({ img: saved }); }
        else if (x && x.html) seq.push({ html: x.html });
      }
      p.templateDetail = seq;
    }
  }
  await fs.writeFile(OUT_JSON, JSON.stringify(list, null, 2));
  await fetchSite();
}

// 网站管理的图片和动态。接口不可用时（比如 CRM 还没更新）不让构建失败，页面按"没上传图片、默认动态"显示。
async function fetchSite() {
  let site = { assets: {}, news: [] };
  try {
    const raw = await getJson(`${API}/api/public/site`);
    const assets = {};
    for (const [slot, urls] of Object.entries(raw.assets || {})) {
      if (!/^[A-Za-z0-9_-]+$/.test(slot)) continue;
      const saved = [];
      for (const [i, it] of (urls || []).entries()) {
        // 新格式 { url, caption:{en,es,ru} }；旧格式直接是 url 字符串
        const url = typeof it === 'string' ? it : it && it.url;
        if (!url) continue;
        try {
          const im = slot.startsWith('hp_') ? await saveHeroMedia(url, slot) : await saveDetailImage(url, '_site', i, `${slot}-`);
          if (im) saved.push({ ...im, caption: (it && it.caption) || {} });
        }
        catch (e) { console.warn(`[fetch-data] 网站图片处理失败 ${slot}：${e.message}`); }
      }
      if (saved.length) assets[slot] = saved;
    }
    site = { assets, news: Array.isArray(raw.news) ? raw.news : [] };
    console.log(`[fetch-data] 网站管理：${Object.keys(assets).length} 个图片位，${site.news.length} 条动态`);
  } catch (e) {
    console.warn('[fetch-data] 网站管理数据拉取失败（按默认内容构建）：', e.message);
  }
  await fs.writeFile(SITE_JSON, JSON.stringify(site, null, 2));
}

main().catch((e) => {
  // 拉取失败时让构建直接失败：宁可网站保持上一个版本，也不要发布一个空网站
  console.error('[fetch-data] 失败：', e.message);
  process.exit(1);
});
