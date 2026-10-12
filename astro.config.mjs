import { defineConfig } from 'astro/config';

// SITE_URL：网站正式域名，在 Cloudflare Pages 的环境变量里设置，用于生成 canonical / hreflang
export default defineConfig({
  site: process.env.SITE_URL || 'https://example.pages.dev',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
});
