import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { parseSummary } from '../src/content/parse.ts';
import { validateContent } from './validate-content.ts';
const sample = JSON.parse(await readFile('content/today.json', 'utf8'));
test('공개 콘텐츠의 이미지 파일이 모두 존재한다', async () => { await validateContent(); });
test('중복 기사 ID를 거절한다', () => {
  const value = structuredClone(sample); value.sections.push(value.sections[0]);
  assert.throws(() => parseSummary(value));
});
test('HTTP 출처와 잘못된 AI 표시를 거절한다', () => {
  const value = structuredClone(sample); value.sections[0].sources[0].url = 'http://example.com';
  assert.throws(() => parseSummary(value));
  const other = structuredClone(sample); other.coverImage.isAiGenerated = 'yes';
  assert.throws(() => parseSummary(other));
});
