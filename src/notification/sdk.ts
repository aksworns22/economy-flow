import { Notification } from '@apps-in-toss/web-framework';

export const notificationAgreement = Object.assign(
  (params: Parameters<typeof Notification.requestAgreement>[0]) => Notification.requestAgreement(params),
  {
    isSupported: () => {
      try {
        return Notification.requestAgreement.isSupported();
      } catch {
        // 일반 브라우저에는 토스 앱 버전 정보를 제공하는 브릿지가 없습니다.
        return false;
      }
    },
  },
);
