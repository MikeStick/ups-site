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

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT_JSON = path.join(ROOT, 'src/data/products.json');
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
    const name = `${idx + 1}.webp`;
    await sharp(buf).rotate().resize({ width: 1400, height: 1400, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82 }).toFile(path.join(dir, name));
    const thumb = `${idx + 1}-thumb.webp`;
    await sharp(buf).rotate().resize({ width: 480, height: 480, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 78 }).toFile(path.join(dir, thumb));
    return { src: `/media/${slug}/${name}`, thumb: `/media/${slug}/${thumb}` };
  }
  const ext = (url.split('.').pop() || 'jpg').split('?')[0].toLowerCase();
  const name = `${idx + 1}.${ext}`;
  await fs.writeFile(path.join(dir, name), buf);
  return { src: `/media/${slug}/${name}`, thumb: `/media/${slug}/${name}` };
}

async function main() {
  await fs.rm(MEDIA_DIR, { recursive: true, force: true });

  if (!API || !KEY) {
    console.warn('[fetch-data] 未设置 CRM_API_BASE / SITE_BUILD_KEY，使用示例数据');
    const sample = await fs.readFile(path.join(ROOT, 'src/data/sample-products.json'), 'utf8');
    await fs.writeFile(OUT_JSON, sample);
    return;
  }

  const list = await getJson(`${API}/api/public/products`);
  console.log(`[fetch-data] 拉取到 ${list.length} 个已发布产品`);
  for (const p of list) {
    const imgs = [];
    for (const [i, url] of (p.images || []).entries()) {
      const saved = await saveImage(url, p.slug, i);
      if (saved) imgs.push(saved);
    }
    p.images = imgs;
  }
  await fs.writeFile(OUT_JSON, JSON.stringify(list, null, 2));
}

main().catch((e) => {
  // 拉取失败时让构建直接失败：宁可网站保持上一个版本，也不要发布一个空网站
  console.error('[fetch-data] 失败：', e.message);
  process.exit(1);
});
