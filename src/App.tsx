import { useEffect, useRef, useState } from 'react';
import { Button } from '@toss/tds-mobile';
import { loadSummary } from './content/load';
import type { DailySummary, EditorialImage } from './content/types';

function LoadingPhoto({ image, cover = false }: { image: EditorialImage; cover?: boolean }) {
  const [state, setState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (element?.complete) setState(element.naturalWidth > 0 ? 'loaded' : 'error');
  }, []);

  return <div className={`loading-photo${cover ? ' hero-photo' : ''}`} aria-busy={state === 'loading'}>
    {state !== 'loaded' && <div className={`photo-placeholder${state === 'loading' ? ' is-loading' : ''}`} aria-hidden="true" />}
    {state === 'error' ? <span className="photo-error" role="img" aria-label={image.alt}>사진을 불러오지 못했어요</span> : <img
      ref={ref} src={image.src} alt={image.alt} width="1200" height="800"
      loading={cover ? 'eager' : 'lazy'} decoding="async"
      className={`${cover ? 'hero-image ' : ''}${state === 'loaded' ? 'is-loaded' : ''}`}
      onLoad={() => setState('loaded')} onError={() => setState('error')}
    />}
  </div>;
}

function ArticlePhoto({ image }: { image: EditorialImage }) {
  return <figure className="article-photo">
    <LoadingPhoto key={image.src} image={image} />
  </figure>;
}

function SummarySkeleton() {
  return <section className="summary-skeleton" role="status" aria-label="오늘의 경제 요약을 불러오는 중">
    <div aria-hidden="true">
      <div className="skeleton-cover" />
      <div className="skeleton-card">
        <div className="skeleton-block skeleton-heading" />
        {[0, 1, 2].map(i => <div className="skeleton-point" key={i}>
          <div className="skeleton-block skeleton-number" />
          <div className="skeleton-lines"><div className="skeleton-block" /><div className="skeleton-block short" /></div>
        </div>)}
      </div>
      <div className="skeleton-body"><div className="skeleton-block skeleton-heading" /><div className="skeleton-lines"><div className="skeleton-block" /><div className="skeleton-block" /><div className="skeleton-block short" /></div></div>
    </div>
  </section>;
}

export default function App() {
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [fromCache, setFromCache] = useState(false);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let disposed = false;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 10000);
    setError(false);
    loadSummary(controller.signal).then(data => { if (!disposed) { setSummary(data); setFromCache(Boolean(data.fromCache)); } }).catch(() => {
      if (!disposed) setError(true);
    }).finally(() => window.clearTimeout(timeout));
    return () => { disposed = true; window.clearTimeout(timeout); controller.abort(); };
  }, [attempt]);

  useEffect(() => {
    const refresh = () => { if (document.visibilityState === 'visible') setAttempt(v => v + 1); };
    document.addEventListener('visibilitychange', refresh);
    return () => document.removeEventListener('visibilitychange', refresh);
  }, []);

  useEffect(() => {
    const update = () => {
      const length = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(!summary ? 0 : length > 0 ? Math.min(100, window.scrollY / length * 100) : 100);
    };
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
    return () => { window.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, [summary]);

  const richText = (text: string) => text.replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, '$2')
    .split(/(\*\*[^*]+\*\*)/g)
    .map((part, index) => part.startsWith('**') && part.endsWith('**')
      ? <mark className="text-highlight" key={index}>{part.slice(2, -2)}</mark>
      : part);

  return <>
    <div className="reading-progress" aria-hidden="true"><div style={{ width: `${progress}%` }} /></div>
    <main className="reader">

      {error ? <section className="status" role="alert">
        <div className="status-content">
          <svg className="status-icon" width="88" height="88" viewBox="0 0 88 88" fill="none" aria-hidden="true">
            <rect x="17" y="8" width="54" height="70" rx="12" fill="var(--adaptiveGrey100,#f2f4f6)" />
            <path d="M30 27h28M30 39h18" stroke="var(--adaptiveGrey300,#d1d6db)" strokeWidth="5" strokeLinecap="round" />
            <circle cx="64" cy="65" r="19" fill="var(--adaptiveGrey500,#8b95a1)" />
            <path d="M64 55v10" stroke="var(--adaptiveBackground,#fff)" strokeWidth="4" strokeLinecap="round" />
            <circle cx="64" cy="72" r="2" fill="var(--adaptiveBackground,#fff)" />
          </svg>
          <h1>경제 흐름을 불러오지 못했어요</h1>
          <p>잠시 후 다시 시도해 주세요</p>
        </div>
        <div className="status-action"><Button onClick={() => setAttempt(v => v + 1)}>다시 불러오기</Button></div>
      </section> : !summary ? <SummarySkeleton /> : <article>
        {fromCache && <p className="sample-note" role="status">최신 콘텐츠를 가져오지 못해 마지막으로 읽은 내용을 보여드려요. <button onClick={() => setAttempt(v => v + 1)}>다시 불러오기</button></p>}
        <header className={`article-header${summary.coverImage ? ' has-cover' : ''}`}>
          {summary.coverImage && <LoadingPhoto key={summary.coverImage.src} image={summary.coverImage} cover />}
          <div className="hero-content">
          <div className="date-row"><time dateTime={summary.date}>{new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long', timeZone: 'Asia/Seoul' }).format(new Date(`${summary.date}T00:00:00+09:00`))}</time></div>
          <h1>{summary.title}</h1>{summary.description && <p className="article-deck">{summary.description}</p>}
          </div>
        </header>

        <section className="key-summary" aria-labelledby="key-title"><div className="eyebrow"><h2 id="key-title">오늘의 경제 동향</h2></div><ul>{summary.keyPoints.map((point, i) => <li key={i}><span className="point-number" aria-hidden="true">{i + 1}</span><span>{richText(point)}</span></li>)}</ul></section>
        {summary.sections.map((section, i) => <section className="news-section" key={section.id} aria-labelledby={`section-${section.id}`}><h3 id={`section-${section.id}`}><span className="section-index">{i + 1}. </span>{section.title}</h3>{section.image && <ArticlePhoto image={section.image} />}{section.paragraphs.map((paragraph, index) => <p key={index}>{richText(paragraph)}</p>)}{section.explanation && <aside className="article-explanation" aria-label={`${section.title} 쉬운 설명`}><dl><div><dt>{section.explanation.termLabel}</dt><dd>{section.explanation.termDescription}</dd></div></dl></aside>}</section>)}
        <footer className="article-sources" aria-labelledby="sources-title">
          <h2 id="sources-title">기사 출처</h2>
          <div className="source-list">{summary.sections.flatMap(section => section.sources.map((source, index) => <p className="source-item" key={`${section.id}-${index}`}>{source.url ? <a href={source.url} target="_blank" rel="noopener noreferrer">{source.publisher} · {source.title}</a> : <span>{source.publisher} · {source.title}</span>}</p>))}</div>
        </footer>
      </article>}
    </main>
  </>;
}
