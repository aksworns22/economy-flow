import { useEffect, useRef, useState } from 'react';
import { BottomSheet, Button } from '@toss/tds-mobile';
import { graniteEvent } from '@apps-in-toss/web-framework';
import { loadSummary } from './content/load';
import type { DailySummary, EditorialImage } from './content/types';

function ArticlePhoto({ image }: { image: EditorialImage }) {
  return <figure className="article-photo">
    <img src={image.src} alt={image.alt} width="1200" height="800" loading="lazy" decoding="async" />
  </figure>;
}

export default function App() {
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [activeTerm, setActiveTerm] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const closeTerm = () => setActiveTerm(null);

  useEffect(() => {
    let disposed = false;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 10000);
    setError(false);
    loadSummary(controller.signal).then(data => { if (!disposed) setSummary(data); }).catch(() => {
      if (!disposed) setError(true);
    }).finally(() => window.clearTimeout(timeout));
    return () => { disposed = true; window.clearTimeout(timeout); controller.abort(); };
  }, [attempt]);

  useEffect(() => {
    const update = () => {
      const length = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(length > 0 ? Math.min(100, window.scrollY / length * 100) : 100);
    };
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
    return () => { window.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, [summary]);

  useEffect(() => {
    if (!activeTerm) return;
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') closeTerm(); };
    window.addEventListener('keydown', escape);
    // 용어 창이 열려 있을 때만 기본 뒤로가기를 가로채고, 본문에서는 토스에 맡깁니다.
    const unsubscribe = (import.meta.env.DEV || /TossApp\//.test(navigator.userAgent)) ? graniteEvent.addEventListener('backEvent', {
      onEvent: closeTerm,
      onError: () => closeTerm(),
    }) : () => {};
    return () => { window.removeEventListener('keydown', escape); unsubscribe(); };
  }, [activeTerm]);

  const richText = (text: string) => text.split(/(\[\[[^|\]]+\|[^\]]+\]\])/g).map((part, i) => {
    const match = /^\[\[([^|\]]+)\|([^\]]+)\]\]$/.exec(part);
    if (!match || !summary?.terms[match[1]]) return part;
    return <button key={i} className="term" aria-label={`${match[2]} 뜻 보기`} aria-haspopup="dialog" onClick={event => { trigger.current = event.currentTarget; setActiveTerm(match[1]); }}>{match[2]}<span aria-hidden="true" className="term-dot">?</span></button>;
  });
  const term = activeTerm && summary ? summary.terms[activeTerm] : null;

  return <>
    <div className="reading-progress" aria-hidden="true"><div style={{ width: `${progress}%` }} /></div>
    <main className="reader">

      {error ? <section className="status" role="alert"><h1>요약을 불러오지 못했어요</h1><p>잠시 후 다시 시도해 주세요.</p><Button onClick={() => setAttempt(v => v + 1)}>다시 불러오기</Button></section> : !summary ? <p className="status" role="status">오늘의 요약을 가져오고 있어요.</p> : <article>
        <header className={`article-header${summary.coverImage ? ' has-cover' : ''}`}>
          {summary.coverImage && <img className="hero-image" src={summary.coverImage.src} alt={summary.coverImage.alt} width="1200" height="800" decoding="async" />}
          <div className="hero-content">
          <div className="date-row"><time dateTime={summary.date}>{new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long', timeZone: 'Asia/Seoul' }).format(new Date(`${summary.date}T00:00:00+09:00`))}</time><span>약 {summary.readingMinutes}분</span></div>
          <h1>{summary.title}</h1><p className="article-deck">복잡한 경제 뉴스, 내 일상과 연결해 읽어요.</p>
          </div>
        </header>

        <section className="key-summary" aria-labelledby="key-title"><div className="eyebrow"><h2 id="key-title">오늘의 핵심</h2></div><ul>{summary.keyPoints.map((point, i) => <li key={i}><span className="point-number" aria-hidden="true">{i + 1}</span><span>{richText(point)}</span></li>)}</ul></section>
        <div className="body-intro"><h2>뉴스를 하나의 흐름으로</h2><p>밑줄 친 용어를 누르면 뜻을 볼 수 있어요.</p></div>
        {summary.sections.map((section, i) => <section className="news-section" key={section.id} aria-labelledby={`section-${section.id}`}><h3 id={`section-${section.id}`}><span className="section-index">{i + 1}. </span>{section.title}</h3>{section.image && <ArticlePhoto image={section.image} />}{section.paragraphs.map((paragraph, index) => <p key={index}>{richText(paragraph)}</p>)}</section>)}
        <section className="closing" aria-labelledby="closing-title"><h2 id="closing-title">오늘 기억할 흐름</h2><p>{richText(summary.closing)}</p></section>
        <section className="sources" aria-labelledby="sources-title">
          <h2 id="sources-title">기사와 사진 출처</h2>
          {summary.sections.map((section, i) => <div className="source-group source-articles" key={section.id}>
            <span className="source-label-inline">기사 {i + 1}</span><div>{section.sources.map((source, index) => <p key={index}>{source.url ? <a href={source.url} target="_blank" rel="noopener noreferrer">{source.title} ↗</a> : <span>{source.title}</span>}<span className="source-publisher-inline"> · {source.publisher}</span></p>)}</div>
          </div>)}
          {(summary.coverImage || summary.sections.some(section => section.image)) && <p className="source-group">
            <span className="source-label-inline">사진</span>
            {Array.from(new Map([...(summary.coverImage ? [summary.coverImage] : []), ...summary.sections.flatMap(section => section.image ? [section.image] : [])].map(image => [image.creditUrl, image])).values()).map((image, i) => <span key={image.creditUrl}>{i > 0 && ' · '}<a href={image.creditUrl} target="_blank" rel="noopener noreferrer" aria-label={`${image.credit} 사진 ${i + 1} 출처`}>{image.credit} {i + 1} ↗</a></span>)}
          </p>}

        </section>
      </article>}
    </main>
    <BottomSheet open={!!term} aria-label={term ? `${term.label} 뜻` : '경제 용어'} onClose={closeTerm} onExited={() => trigger.current?.focus()} header={term ? <h2 className="sheet-title" id="term-title">{term.label}</h2> : undefined}>
      {term && <div className="term-content"><p className="sheet-kicker">경제 용어 쉽게 보기</p><p>{term.description}</p><div className="term-example">{term.example}</div><Button display="block" size="large" onClick={closeTerm}>확인</Button></div>}
    </BottomSheet>
  </>;
}
