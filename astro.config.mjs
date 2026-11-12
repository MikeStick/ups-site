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

// SITE_URL：网站正式域名，在 Cloudflare Pages 的环境变量里设置，用于生成 canonical / hreflang
export default defineConfig({
  site: process.env.SITE_URL || 'https://example.pages.dev',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [rtlArrows],
});
