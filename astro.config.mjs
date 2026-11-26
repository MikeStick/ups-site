import { defineConfig } from 'astro/config';
import fs from 'node:fs';
import { STOCK_LABEL } from './src/lib/stock.mjs';
import path from 'node:path';

// 阿拉伯语页面从右往左排：页面里写死的箭头 "→"（"查看更多 →"）改成 "←"，方向才对
const rtlArrows = {
  name: 'rtl-arrows',
  hooks: {
    'astro:build:done': ({ dir }) => {
      const root = path.join(dir.pathname, 'ar');
      if (!fs.existsSync(root)) return;
      const walk = (d) => {
        for (const f of fs.readdirSync(d, { withFileTypes: true })) {
          const p = path.join(d, f.name);
          if (f.isDirectory()) walk(p);
          else if (f.name.endsWith('.html')) {
            const s = fs.readFileSync(p, 'utf8');
            const t = s.replace(/→/g, '←');
            if (t !== s) fs.writeFileSync(p, t);
          }
        }
      };
      walk(root);
    },
  },
};

// 顶部 Products 菜单的产品搜索：从每个产品页里取出 <script data-search-item> 条目，按语言汇总成 /<lang>/search.json，再把条目从页面里删掉
const productSearch = {
  name: 'product-search',
  hooks: {
    'astro:build:done': ({ dir }) => {
      const root = dir.pathname;
      const RE = /\s*<script type="application\/json" data-search-item>([\s\S]*?)<\/script>/;
      for (const lang of fs.readdirSync(root)) {
        const pdir = path.join(root, lang, 'p');
        if (!fs.existsSync(pdir) || !fs.statSync(pdir).isDirectory()) continue;
        const items = [];
        for (const slug of fs.readdirSync(pdir).sort()) {
          const f = path.join(pdir, slug, 'index.html');
          if (!fs.existsSync(f)) continue;
          const s = fs.readFileSync(f, 'utf8');
          const m = s.match(RE);
          if (!m) continue;
          try { items.push({ ...JSON.parse(m[1]), c: [], g: '', o: items.length }); } catch { /* 跳过坏条目 */ }
          fs.writeFileSync(f, s.replace(RE, ''));
        }
        items.sort((a, b) => a.m.localeCompare(b.m, undefined, { numeric: true })).forEach((x, i) => { x.o = i; });
        fs.writeFileSync(path.join(root, lang, 'search.json'), JSON.stringify({ items }));
        // 现货标记：栏目页的产品卡片图（<a class="pimg">）右上角加 "In stock"（迷你UPS卡片在 mini-ups.astro 里直接加）
        const stock = new Set(items.filter((x) => x.k).map((x) => x.u));
        if (stock.size) {
          const label = (STOCK_LABEL[lang] || STOCK_LABEL.en).replace(/[&<>"]/g, '');
          const badge = `<span class="stock-badge">${label}</span>`;
          const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : e.name.endsWith('.html') ? [path.join(d, e.name)] : []));
          for (const f of walk(path.join(root, lang))) {
            if (f.includes(`${path.sep}p${path.sep}`)) continue;
            const s = fs.readFileSync(f, 'utf8');
            const t = s
              .replace(/(<a class="pimg" href="([^"]+)"[^>]*>)/g, (m, open, u) => (stock.has(u) ? open + badge : m));
            if (t !== s) fs.writeFileSync(f, t);
          }
        }
      }
    },
  },
};

// SITE_URL：网站正式域名，在 Cloudflare Pages 的环境变量里设置，用于生成 canonical / hreflang
export default defineConfig({
  site: process.env.SITE_URL || 'https://example.pages.dev',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [productSearch, rtlArrows],
});
