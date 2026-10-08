import { test, expect } from '@playwright/test';

test('바로 본문 진입, 하단에 모인 기사 출처, 기사 아래 용어 설명', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('유가와 금리가 오르면, 주식은 왜 흔들릴까요?');
  await expect(page.getByText('예시 콘텐츠예요.')).toHaveCount(0);
  await expect(page.locator('section.sources')).toHaveCount(0);
  await expect(page.locator('.news-section .article-sources')).toHaveCount(0);
  await expect(page.locator('article > footer.article-sources')).toHaveCount(1);
  await expect(page.locator('article > :last-child')).toHaveClass('article-sources');
  await expect(page.getByRole('heading', { name: '기사 출처' })).toBeVisible();
  await expect(page.locator('.article-sources a')).toHaveCount(4);
  await expect(page.locator('.article-sources a').first()).toHaveText('파이낸셜뉴스 · 코스피, 1.98% 내린 6803.90 마감…코스닥은 900선 내줘[fn마감시황]');
  await expect(page.getByRole('button', { name: '글자 크게 보기' })).toHaveCount(0);
  await expect(page.locator('.hero-image, .article-photo img')).toHaveCount(5);
  for (const image of await page.locator('.hero-image, .article-photo img').all()) {
    await image.scrollIntoViewIfNeeded();
    await image.evaluate((element: HTMLImageElement) => element.decode());
    expect(await image.evaluate((element: HTMLImageElement) => element.naturalWidth)).toBeGreaterThan(0);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: 'test-results/mobile-reader.png', fullPage: true });
  await expect(page.locator('.article-explanation')).toHaveCount(4);
  await expect(page.getByRole('button', { name: /뜻 보기/ })).toHaveCount(0);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  for (const section of await page.locator('.news-section').all()) {
    const explanation = section.locator('.article-explanation');
    await explanation.scrollIntoViewIfNeeded();
    await expect(explanation).toBeVisible();
    await expect(explanation.locator('dt')).toHaveCount(1);
    await expect(explanation.locator('dd').nth(0)).not.toBeEmpty();
    await expect(explanation.locator('dd')).toHaveCount(1);
  }
  await expect(page.locator('.news-section').nth(2).locator('.article-explanation')).toContainText('금리는 돈을 빌릴 때 내는 이자의 비율이에요.');
  await page.locator('.article-sources').last().scrollIntoViewIfNeeded();
  await expect(page.locator('.article-sources').last()).toBeVisible();
  expect(errors).toEqual([]);
});

test('320px 화면, 200% 글자 확대에서 가로 넘침 없음', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '32px';
    document.querySelector('h1')!.textContent = '금리와 환율, 국제 유가와 물가의 연결을 함께 살펴보는 아주 긴 오늘의 경제 흐름 제목';
    document.querySelector('.news-section > p')!.textContent = '긴 문단이 작은 화면에서 어떻게 줄바꿈되는지 살펴봐요. '.repeat(30);
  });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(overflow).toBe(false);
  await page.screenshot({ path: 'test-results/large-text.png', fullPage: true });
  await page.locator('.article-explanation').last().scrollIntoViewIfNeeded();
  await expect(page.locator('.article-explanation').last()).toBeVisible();
  await page.locator('.article-sources').last().scrollIntoViewIfNeeded();
  await expect(page.locator('.article-sources').last()).toBeVisible();
});
