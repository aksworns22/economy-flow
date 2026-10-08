import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  use: { channel: 'chrome', baseURL: 'http://localhost:5173', viewport: { width: 390, height: 844 } },
  webServer: [
    { command: 'npm run dev', url: 'http://localhost:5173', reuseExistingServer: !process.env.CI },
    { command: 'npm run build:web && npm run preview -- --port 4173', url: 'http://localhost:4173', reuseExistingServer: !process.env.CI },
  ],
});
