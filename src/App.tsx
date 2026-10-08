import { useEffect, useState } from 'react';
import { Button } from '@toss/tds-mobile';
import { loadSummary } from './content/load';
import type { DailySummary, EditorialImage } from './content/types';

function ArticlePhoto({ image }: { image: EditorialImage }) {
  return <figure className="article-photo">
    <img src={image.src} alt={image.alt} width="1200" height="800" loading="lazy" decoding="async" />
  {image.isAiGenerated && <figcaption>AI 생성 이미지</figcaption>}
  </figure>;
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
      setProgress(length > 0 ? Math.min(100, window.scrollY / length * 100) : 100);
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

      {error ? <section className="status" role="alert"><h1>요약을 불러오지 못했어요</h1><p>잠시 후 다시 시도해 주세요.</p><Button onClick={() => setAttempt(v => v + 1)}>다시 불러오기</Button></section> : !summary ? <p className="status" role="status">오늘의 요약을 가져오고 있어요.</p> : <article>
        {fromCache && <p className="sample-note" role="status">최신 콘텐츠를 가져오지 못해 마지막으로 읽은 내용을 보여드려요. <button onClick={() => setAttempt(v => v + 1)}>다시 불러오기</button></p>}
        {summary.isExample && <p className="sample-note">예시 콘텐츠예요.</p>}
        <header className={`article-header${summary.coverImage ? ' has-cover' : ''}`}>
          {summary.coverImage && <img className="hero-image" src={summary.coverImage.src} alt={summary.coverImage.alt} width="1200" height="800" decoding="async" />}
          {summary.coverImage?.isAiGenerated && <span className="ai-image-label">AI 생성 이미지</span>}
          <div className="hero-content">
          <div className="date-row"><time dateTime={summary.date}>{new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long', timeZone: 'Asia/Seoul' }).format(new Date(`${summary.date}T00:00:00+09:00`))}</time></div>
          <h1>{summary.title}</h1>{summary.description && <p className="article-deck">{summary.description}</p>}
          </div>
        </header>

        <section className="key-summary" aria-labelledby="key-title"><div className="eyebrow"><h2 id="key-title">오늘의 경제 동향</h2></div><ul>{summary.keyPoints.map((point, i) => <li key={i}><span className="point-number" aria-hidden="true">{i + 1}</span><span>{richText(point)}</span></li>)}</ul></section>
        {summary.sections.map((section, i) => <section className="news-section" key={section.id} aria-labelledby={`section-${section.id}`}><h3 id={`section-${section.id}`}><span className="section-index">{i + 1}. </span>{section.title}</h3>{section.image && <ArticlePhoto image={section.image} />}{section.paragraphs.map((paragraph, index) => <p key={index}>{richText(paragraph)}</p>)}{section.explanation && <aside className="article-explanation" aria-label={`${section.title} 쉬운 설명`}><dl><div><dt>{section.explanation.termLabel}</dt><dd>{section.explanation.termDescription}</dd></div></dl></aside>}<div className="article-sources" aria-label={`${section.title} 관련 기사`}><div className="source-list">{section.sources.map((source, index) => <p className="source-item" key={index}><span className="source-publisher-inline">{source.publisher}</span>{source.url ? <a href={source.url} target="_blank" rel="noopener noreferrer">{source.title}</a> : <span>{source.title}</span>}</p>)}</div></div></section>)}
      </article>}
    </main>
  </>;
}
