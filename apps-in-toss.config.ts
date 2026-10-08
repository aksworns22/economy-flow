import { defineConfig } from '@apps-in-toss/web-framework/config';

// SDK 3.x: 표시 이름과 아이콘은 앱인토스 콘솔에서 설정합니다.
export default defineConfig({
  appName: process.env.AIT_APP_NAME || 'economy-flow',
  brand: { primaryColor: '#3182F6' },
  navigationBar: { withBackButton: true, withHomeButton: true, withTitle: true, theme: 'light' },
  permissions: [],
  webBundleDir: 'dist',
});
