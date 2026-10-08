import { test, expect } from '@playwright/test';

test('바로 본문 진입, 마지막 출처, 모든 용어의 열기와 닫기', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('유가와 금리가 오르면, 주식은 왜 흔들릴까요?');
  await expect(page.locator('.sample-note')).toHaveCount(0);
  await expect(page.locator('.sources')).toHaveCount(1);
  await expect(page.locator('.news-section .sources')).toHaveCount(0);
  await expect(page.locator('.sources .source-group')).toHaveCount(5);
  await expect(page.getByRole('button', { name: '글자 크게 보기' })).toHaveCount(0);
  await expect(page.locator('.hero-image, .article-photo img')).toHaveCount(5);
  for (const image of await page.locator('.hero-image, .article-photo img').all()) {
    await image.scrollIntoViewIfNeeded();
    await image.evaluate((element: HTMLImageElement) => element.decode());
    expect(await image.evaluate((element: HTMLImageElement) => element.naturalWidth)).toBeGreaterThan(0);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: 'test-results/mobile-reader.png', fullPage: true });
  for (const label of ['채권 금리', '인플레이션', '외국인직접투자(FDI)', '긴축']) {
    const trigger = page.getByRole('button', { name: `${label} 뜻 보기` });
    await trigger.click();
    await expect(page.getByRole('dialog')).toBeAttached();
    await expect(page.getByRole('heading', { name: label, exact: true })).toBeVisible();
    if (label === '인플레이션') {
      // 시각 확인용으로 TDS 진입 애니메이션이 끝난 프레임을 저장합니다.
      await page.waitForTimeout(600);
      await page.screenshot({ path: 'test-results/term-sheet.png' });
    }
    await page.getByRole('button', { name: '확인', exact: true }).click();
    await expect(page.getByRole('dialog')).not.toBeAttached();
    await expect(trigger).toBeFocused();
  }
  await page.getByRole('button', { name: '외국인직접투자(FDI) 뜻 보기' }).click();
  await expect(page.getByRole('heading', { name: '외국인직접투자(FDI)', exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeAttached();
  await page.getByRole('button', { name: '외국인직접투자(FDI) 뜻 보기' }).click();
  await page.evaluate(() => (window as unknown as { __ait: { trigger: (name: string) => void } }).__ait.trigger('backEvent'));
  await expect(page.getByRole('dialog')).not.toBeAttached();
  await page.locator('.sources').scrollIntoViewIfNeeded();
  await expect(page.locator('.sources')).toBeVisible();
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
  await page.getByRole('button', { name: '외국인직접투자(FDI) 뜻 보기' }).click();
  await expect(page.getByRole('button', { name: '확인', exact: true })).toBeVisible();
  await page.getByRole('button', { name: '확인', exact: true }).click();
  await page.locator('.sources').scrollIntoViewIfNeeded();
  await expect(page.locator('.sources')).toBeVisible();
});
