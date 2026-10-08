import { useEffect, useRef, useState } from 'react';
import { Button } from '@toss/tds-mobile';
import { notificationAgreement } from '../notification/sdk';

const templateCode = import.meta.env.VITE_NOTIFICATION_TEMPLATE_CODE?.trim();

export function WeeklyNotification() {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');
  const active = useRef(false);
  const cleanup = useRef<(() => void) | undefined>();

  useEffect(() => () => {
    active.current = false;
    const release = cleanup.current;
    cleanup.current = undefined;
    release?.();
  }, []);

  if (!templateCode) return null;

  const request = () => {
    if (active.current) return;
    active.current = true;
    setPending(true);
    setMessage('');
    const finish = (text: string) => {
      if (!active.current) return;
      active.current = false;
      const release = cleanup.current;
      cleanup.current = undefined;
      release?.();
      setPending(false);
      setMessage(text);
    };

    try {
      if (!notificationAgreement.isSupported()) {
        finish('최신 버전의 토스 앱에서 알림을 신청해 주세요.');
        return;
      }
      const release = notificationAgreement({
        options: { templateCode },
        onEvent: ({ type }) => {
          const messages = {
            newAgreement: '알림 신청이 완료됐어요. 매주 화요일 오전 10시에 알려드릴게요.',
            alreadyAgreed: '이미 알림을 신청하셨어요.',
            agreementRejected: '알림을 신청하지 않았어요. 원하실 때 다시 신청할 수 있어요.',
          };
          finish(messages[type]);
        },
        onError: () => finish('알림 신청에 실패했어요. 잠시 후 다시 시도해 주세요.'),
      });
      // 동기적으로 결과가 전달되어도 반환된 구독을 해제합니다.
      if (active.current) cleanup.current = release;
      else release();
    } catch {
      finish('알림 신청에 실패했어요. 잠시 후 다시 시도해 주세요.');
    }
  };

  return <section className="weekly-notification" aria-labelledby="notification-title">
    <h2 id="notification-title">오늘의 경제 흐름, 알림으로 받아보세요</h2>
    <p>매주 화요일 오전 10시에 알림을 보내드려요.</p>
    <Button onClick={request} disabled={pending}>{pending ? '신청 확인 중' : '알림받기'}</Button>
    <p className="notification-result" role="status" aria-live="polite">{message}</p>
  </section>;
}
