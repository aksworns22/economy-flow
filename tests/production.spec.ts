import { test, expect } from '@playwright/test';

test('실제 빌드 결과도 일반 브라우저에서 읽고 용어를 닫을 수 있다', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('http://localhost:4173');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.getByRole('button', { name: '인플레이션 뜻 보기' }).click();
  await expect(page.getByRole('heading', { name: '인플레이션', exact: true })).toBeVisible();
  await page.getByRole('button', { name: '확인', exact: true }).click();
  await expect(page.getByRole('dialog')).not.toBeAttached();
  expect(errors).toEqual([]);
});
