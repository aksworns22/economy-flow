import sample from './sample.json';
import type { DailySummary } from './types';

export const sampleSummary: DailySummary = sample;

export function parseSummary(value: unknown): DailySummary {
  if (!value || typeof value !== 'object') throw new Error('콘텐츠 형식이 올바르지 않아요.');
  const data = value as DailySummary;
  const text = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0;
  const paragraphs = (v: unknown): v is string[] => Array.isArray(v) && v.length > 0 && v.every(text);
  if (!text(data.date) || !/^\d{4}-\d{2}-\d{2}$/.test(data.date) || Number.isNaN(Date.parse(data.date)) || !text(data.title) || typeof data.isExample !== 'boolean' || !Number.isFinite(data.readingMinutes) || data.readingMinutes <= 0 || !paragraphs(data.keyPoints) || !text(data.closing) || !data.terms || typeof data.terms !== 'object' || !Array.isArray(data.sections) || !data.sections.length) throw new Error('필수 콘텐츠가 없어요.');
  for (const term of Object.values(data.terms)) if (!term || !text(term.label) || !text(term.description) || !text(term.example)) throw new Error('용어 형식이 올바르지 않아요.');
  const ids = new Set<string>();
  for (const section of data.sections) {
    if (!section || !text(section.id) || ids.has(section.id) || !text(section.title) || !paragraphs(section.paragraphs) || !Array.isArray(section.sources) || !section.sources.length) throw new Error('본문 형식이 올바르지 않아요.');
    ids.add(section.id);
    for (const source of section.sources) {
      if (!source || !text(source.title) || !text(source.publisher) || (source.url !== undefined && (!text(source.url) || !source.url.startsWith('https://')))) throw new Error('출처 형식이 올바르지 않아요.');
    }
  }
  for (const body of [...data.keyPoints, ...data.sections.flatMap(s => s.paragraphs), data.closing]) {
    for (const match of body.matchAll(/\[\[([^|\]]+)\|([^\]]+)\]\]/g)) if (!Object.hasOwn(data.terms, match[1])) throw new Error('용어 설명이 없어요.');
  }
  return data;
}

export async function loadSummary(signal: AbortSignal): Promise<DailySummary> {
  const url = import.meta.env.VITE_CONTENT_URL;
  if (!url) return sampleSummary;
  if (!url.startsWith('https://')) throw new Error('HTTPS 콘텐츠 주소가 필요해요.');
  const response = await fetch(url, { signal, cache: 'no-cache' });
  if (!response.ok) throw new Error('요약을 가져오지 못했어요.');
  return parseSummary(await response.json());
}
