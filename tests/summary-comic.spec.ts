import { readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';

const content = JSON.parse(readFileSync('content/today.json', 'utf8'));

test('새 앱은 만화 요약 다음에 본문을 표시한다', async ({ page }) => {
  await page.route('https://aksworns22.github.io/economy-flow/today.json', route => route.fulfill({ json: content }));
  await page.route(content.summaryComic.src, route => route.fulfill({ contentType: 'image/png', body: readFileSync('content/images/2026-10-11/comic-summary-v2.png') }));
  await page.goto('http://localhost:4173');
  await expect(page.getByRole('heading', { name: '4컷 만화로 요약한 경제 흐름' })).toBeVisible();
  await expect(page.locator('.comic-summary img')).toBeVisible();
  await expect(page.locator('.key-summary')).toHaveCount(0);
  await expect(page.locator('.comic-summary + .news-section h3')).toHaveText(`1. ${content.sections[0].title}`);
  await expect.poll(() => page.locator('.comic-summary img').evaluate(image => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  }
});

test('만화 없는 콘텐츠는 기존 경제 동향을 유지한다', async ({ page }) => {
  const legacy = structuredClone(content);
  delete legacy.summaryComic;
  await page.route('https://aksworns22.github.io/economy-flow/today.json', route => route.fulfill({ json: legacy }));
  await page.goto('http://localhost:4173');
  await expect(page.getByRole('heading', { name: '오늘의 경제 동향' })).toBeVisible();
  await expect(page.locator('.key-summary li')).toHaveCount(content.keyPoints.length);
  await expect(page.locator('.comic-summary')).toHaveCount(0);
});

test('만화 로딩 실패 시 기존 요약으로 돌아간다', async ({ page }) => {
  await page.route('https://aksworns22.github.io/economy-flow/today.json', route => route.fulfill({ json: content }));
  await page.route(content.summaryComic.src, route => route.abort());
  await page.goto('http://localhost:4173');
  await expect(page.getByRole('heading', { name: '오늘의 경제 동향' })).toBeVisible();
  await expect(page.locator('.key-summary li')).toHaveCount(content.keyPoints.length);
  await expect(page.locator('.comic-summary')).toHaveCount(0);
});
