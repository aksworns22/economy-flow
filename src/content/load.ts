import sample from './sample.json';
import type { DailySummary } from './types';

export const sampleSummary: DailySummary = sample;

export { parseSummary } from './parse';
import { parseSummary } from './parse';

export async function loadSummary(signal: AbortSignal): Promise<DailySummary & { fromCache?: boolean }> {
  const url = import.meta.env.VITE_CONTENT_URL;
  if (!url) {
    if (import.meta.env.PROD) throw new Error('콘텐츠 주소를 설정해 주세요.');
    return sampleSummary;
  }
  if (!url.startsWith('https://')) throw new Error('HTTPS 콘텐츠 주소가 필요해요.');
  const cacheKey = `economy-content:${url}`;
  try {
    const response = await fetch(url, { signal, cache: 'no-cache' });
    if (!response.ok) throw new Error('요약을 가져오지 못했어요.');
    const summary = parseSummary(await response.json());
    try { localStorage.setItem(cacheKey, JSON.stringify(summary)); } catch { /* 저장 공간이 없어도 읽기는 가능해요. */ }
    return summary;
  } catch (error) {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) return { ...parseSummary(JSON.parse(cached)), fromCache: true };
    } catch { /* 손상된 캐시는 사용하지 않아요. */ }
    throw error;
  }
}
