import { readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';

test('실제 빌드 결과에도 기사 아래 설명이 바로 보인다', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('https://aksworns22.github.io/economy-flow/today.json', route => route.fulfill({ json: JSON.parse(readFileSync('content/today.json', 'utf8')) }));
  await page.goto('http://localhost:4173');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('.article-explanation')).toHaveCount(4);
  await page.locator('.article-explanation').nth(1).scrollIntoViewIfNeeded();
  await expect(page.locator('.article-explanation').nth(1)).toContainText('인플레이션이란?');
  await expect(page.getByText('이 기사는요', { exact: true })).toHaveCount(0);
  expect(errors).toEqual([]);
});


test('원격 콘텐츠 교체와 요청 실패 시 캐시 표시', async ({ page }) => {
  const content = JSON.parse(readFileSync('content/today.json', 'utf8'));
  content.title = '원격에서 교체한 제목';
  content.description = '매일 바뀌는 소개 문장';
  content.isExample = false;
  content.coverImage.isAiGenerated = true;
  let offline = false;
  await page.route('https://aksworns22.github.io/economy-flow/today.json', route => offline ? route.abort() : route.fulfill({ json: content }));
  await page.goto('http://localhost:4173');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(content.title);
  await expect(page.getByText(content.description)).toBeVisible();
  await expect(page.getByText('AI 생성 이미지')).toBeVisible();
  offline = true;
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(content.title);
  await expect(page.getByRole('status')).toContainText('마지막으로 읽은 내용');
});
