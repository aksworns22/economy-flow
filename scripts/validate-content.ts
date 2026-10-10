import { readFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { parseSummary } from '../src/content/parse.ts';

export async function validateContent(path = 'content/today.json') {
  const summary = parseSummary(JSON.parse(await readFile(path, 'utf8')));
  for (const image of [summary.coverImage, summary.summaryComic, ...summary.sections.map(s => s.image)]) {
    if (!image) continue;
    const url = new URL(image.src, 'https://aksworns22.github.io/economy-flow/');
    if (url.origin !== 'https://aksworns22.github.io' || !url.pathname.startsWith('/economy-flow/images/')) throw new Error('이미지는 콘텐츠 저장소에 있어야 해요.');
    const local = resolve('content', decodeURIComponent(url.pathname.slice('/economy-flow/'.length)));
    if (!local.startsWith(resolve('content/images') + '/')) throw new Error('잘못된 이미지 경로');
    await access(local);
  }
  return summary;
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await validateContent(process.argv[2]);
  console.log('콘텐츠 형식과 이미지 파일 검증 완료');
}
