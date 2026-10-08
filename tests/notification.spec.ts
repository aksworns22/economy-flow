import { test, expect } from '@playwright/test';

for (const [result, text] of [
  ['newAgreement', '알림 신청이 완료됐어요.'],
  ['alreadyAgreed', '이미 알림을 신청하셨어요.'],
  ['agreementRejected', '알림을 신청하지 않았어요.'],
  ['error', '알림 신청에 실패했어요.'],
  ['throw', '알림 신청에 실패했어요.'],
  ['unsupported', '최신 버전의 토스 앱에서'],
]) {
  test(`알림 신청: ${result}`, async ({ page }) => {
    await page.route('**/src/notification/sdk.ts*', route => route.fulfill({
      contentType: 'application/javascript',
      body: `export const notificationAgreement = Object.assign((params) => {
        window.notificationCode = params.options.templateCode;
        window.notificationCalls = (window.notificationCalls || 0) + 1;
        if ('${result}' === 'throw') throw new Error('failed');
        const timer = setTimeout(() => '${result}' === 'error'
          ? params.onError(new Error('failed')) : params.onEvent({ type: '${result}' }), 250);
        return () => { clearTimeout(timer); window.notificationCleanups = (window.notificationCleanups || 0) + 1; };
      }, { isSupported: () => '${result}' !== 'unsupported' });`,
    }));
    await page.goto('/');
    const button = page.getByRole('button', { name: '알림받기', exact: true });
    await button.click();
    if (!['throw', 'unsupported'].includes(result)) {
      await expect(page.getByRole('button', { name: '신청 확인 중' })).toBeDisabled();
      await page.locator('.weekly-notification button').evaluate((button: HTMLButtonElement) => button.click());
    }
    await expect(page.locator('.notification-result')).toContainText(text);
    if (['newAgreement', 'error'].includes(result)) {
      await page.locator('.weekly-notification').screenshot({ path: `output/notification-preview/result-${result}.png` });
    }
    if (['newAgreement', 'alreadyAgreed'].includes(result)) {
      await expect(page.getByRole('button', { name: '신청 완료', exact: true })).toBeDisabled();
    } else if (['error', 'throw'].includes(result)) {
      await expect(page.getByRole('button', { name: '다시 시도하기' })).toBeEnabled();
    } else {
      await expect(button).toBeEnabled();
    }
    if (result !== 'unsupported') {
      expect(await page.evaluate(() => (window as any).notificationCode)).toBe('today-economy-flow-economy-briefing-tuesday-10am');
      expect(await page.evaluate(() => (window as any).notificationCalls)).toBe(1);
      if (result !== 'throw') expect(await page.evaluate(() => (window as any).notificationCleanups)).toBe(1);
    }
  });
}

test('일반 브라우저 신청 안내와 작은 화면 레이아웃', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  // 개발 도구의 SDK 모의 환경을 제외한 출시 웹 번들로 확인합니다.
  await page.route('https://aksworns22.github.io/economy-flow/today.json', async route => {
    const { readFileSync } = await import('node:fs');
    await route.fulfill({ json: JSON.parse(readFileSync('content/today.json', 'utf8')) });
  });
  await page.goto('http://localhost:4173');
  await page.getByRole('button', { name: '알림받기', exact: true }).click();
  await expect(page.locator('.notification-result')).toContainText('최신 버전의 토스 앱에서');
  await page.evaluate(() => document.documentElement.style.fontSize = '32px');
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  await page.locator('.weekly-notification').screenshot({ path: 'test-results/notification-large-text.png' });
});

test('요청 중 신청 영역 해제 시 SDK 이벤트 정리', async ({ page }) => {
  await page.route('**/src/App.tsx*', route => route.fulfill({
    contentType: 'application/javascript',
    body: `import React from '/node_modules/.vite/deps/react.js';
      import { WeeklyNotification } from '/src/components/WeeklyNotification.tsx';
      const { useState } = React;
      export default function App() {
        const [shown, setShown] = useState(true);
        return React.createElement(React.Fragment, null,
          React.createElement('button', { onClick: () => setShown(false) }, '영역 닫기'),
          shown && React.createElement(WeeklyNotification));
      }`,
  }));
  await page.route('**/src/notification/sdk.ts*', route => route.fulfill({
    contentType: 'application/javascript',
    body: `export const notificationAgreement = Object.assign(() => {
      return () => { window.notificationCleanups = (window.notificationCleanups || 0) + 1; };
    }, { isSupported: () => true });`,
  }));
  await page.goto('/');
  await page.getByRole('button', { name: '알림받기', exact: true }).click();
  await expect(page.getByRole('button', { name: '신청 확인 중' })).toBeDisabled();
  await page.getByRole('button', { name: '영역 닫기' }).click();
  await expect(page.locator('.weekly-notification')).toHaveCount(0);
  expect(await page.evaluate(() => (window as any).notificationCleanups)).toBe(1);
});

test('템플릿 코드가 없으면 신청 영역 숨김', async ({ page }) => {
  await page.route('**/src/components/WeeklyNotification.tsx*', async route => {
    const response = await route.fetch();
    const body = (await response.text()).replace(/const templateCode = [^;]+;/, 'const templateCode = undefined;');
    await route.fulfill({ response, body });
  });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('.weekly-notification')).toHaveCount(0);
});
