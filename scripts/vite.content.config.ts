import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// A separate local preview keeps unpublished content out of the production feed.
const contentFile = resolve(process.env.CONTENT_FILE || 'content/today.json');

export default defineConfig({
  root: process.cwd(),
  plugins: [react(), {
    name: 'local-content-preview',
    enforce: 'pre',
    transform(code, id) {
      if (!id.endsWith('/src/content/load.ts')) return;
      return code
        .replace('const url = import.meta.env.VITE_CONTENT_URL;', "const url = '/local-briefing.json';")
        .replace("if (!url.startsWith('https://'))", "if (!url.startsWith('https://') && url !== '/local-briefing.json')");
    },
    configureServer(server) {
      server.middlewares.use('/local-briefing.json', async (_req, res) => {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('Cache-Control', 'no-store');
        try {
          const data = JSON.parse(await readFile(contentFile, 'utf8'));
          for (const image of [data.coverImage, data.summaryComic, ...data.sections.map((section: { image?: { src: string } }) => section.image)]) {
            if (image?.src.startsWith('https://aksworns22.github.io/economy-flow/images/')) {
              image.src = image.src.replace('https://aksworns22.github.io/economy-flow/images/', '/content/images/');
            }
          }
          res.end(JSON.stringify(data));
        } catch {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: '로컬 콘텐츠 파일을 확인해 주세요.' }));
        }
      });
    },
  }],
  server: { host: '127.0.0.1', port: 5174, strictPort: true },
});
