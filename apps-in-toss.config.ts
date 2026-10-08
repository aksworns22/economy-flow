import { defineConfig } from '@apps-in-toss/web-framework/config';

// SDK 3.x: 표시 이름과 아이콘은 앱인토스 콘솔에서 설정합니다.
export default defineConfig({
  appName: process.env.AIT_APP_NAME || 'today-economy-flow',
  brand: { primaryColor: '#3182F6' },
  navigationBar: {
    withBackButton: false,
    withHomeButton: false,
    withTitle: false,
    transparentBackground: true,
    theme: 'light',
  },
  permissions: [],
  webBundleDir: 'dist',
});
