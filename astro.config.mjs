import { defineConfig } from 'astro/config';
import fs from 'node:fs';
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
