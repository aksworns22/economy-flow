import { useEffect, useRef, useState } from 'react';
import { Button } from '@toss/tds-mobile';
import { notificationAgreement } from '../notification/sdk';

type Result = 'newAgreement' | 'alreadyAgreed' | 'agreementRejected' | 'error' | 'unsupported';

const resultCopy: Record<Result, { title: string; description: string }> = {
  newAgreement: { title: '알림 신청이 완료됐어요.', description: '매주 화요일 오전 10시에 만나요.' },
  alreadyAgreed: { title: '이미 알림을 신청하셨어요.', description: '매주 화요일 오전 10시에 알려드릴게요.' },
  agreementRejected: { title: '알림을 신청하지 않았어요.', description: '원하실 때 언제든 다시 신청할 수 있어요.' },
  error: { title: '알림 신청에 실패했어요.', description: '잠시 후 다시 시도해 주세요.' },
  unsupported: { title: '토스 앱에서 신청해 주세요.', description: '최신 버전의 토스 앱에서 알림을 받을 수 있어요.' },
};

const templateCode = import.meta.env.VITE_NOTIFICATION_TEMPLATE_CODE?.trim();

export function WeeklyNotification() {
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
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
    if (active.current || result === 'newAgreement' || result === 'alreadyAgreed') return;
    active.current = true;
    setPending(true);
    setResult(null);
    const finish = (value: Result) => {
      if (!active.current) return;
      active.current = false;
      const release = cleanup.current;
      cleanup.current = undefined;
      release?.();
      setPending(false);
      setResult(value);
    };

    try {
      if (!notificationAgreement.isSupported()) {
        finish('unsupported');
        return;
      }
      const release = notificationAgreement({
        options: { templateCode },
        onEvent: ({ type }) => {
          finish(type);
        },
        onError: () => finish('error'),
      });
      // 동기적으로 결과가 전달되어도 반환된 구독을 해제합니다.
      if (active.current) cleanup.current = release;
      else release();
    } catch {
      finish('error');
    }
  };

  const agreed = result === 'newAgreement' || result === 'alreadyAgreed';
  const copy = result ? resultCopy[result] : null;

  return <section className="weekly-notification" aria-labelledby="notification-title" aria-busy={pending}>
    <h2 id="notification-title">오늘의 경제 흐름, 알림으로 받아보세요</h2>
    <p>매주 화요일 오전 10시에 알림을 보내드려요.</p>
    <Button onClick={request} disabled={pending || agreed}>
      {pending ? '신청 확인 중' : agreed ? '신청 완료' : result === 'error' ? '다시 시도하기' : '알림받기'}
    </Button>
    <div className={`notification-result${agreed ? ' is-agreed' : ''}`} role="status" aria-live="polite" aria-atomic="true">
      {copy && <>
        <span className="notification-result-icon" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="12" fill="currentColor" />
            {agreed ? <path d="m6.5 12 3.5 3.5 7.5-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              : <><path d="M12 6.5v6" stroke="white" strokeWidth="2" strokeLinecap="round" /><circle cx="12" cy="16.5" r="1" fill="white" /></>}
          </svg>
        </span>
        <div><strong>{copy.title}</strong><p>{copy.description}</p></div>
      </>}
    </div>
  </section>;
}
