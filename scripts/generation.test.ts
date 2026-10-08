import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, cp, readFile, writeFile, rm, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

for (const approved of [false, true]) {
  test(approved ? '생성 성공 시 이미지와 이전 콘텐츠를 보관한다' : '검토 실패 시 기존 콘텐츠를 유지한다', async () => {
    const root = await mkdtemp(join(tmpdir(), 'economy-generation-'));
    try {
      for (const folder of ['scripts', 'src/content', 'content']) {
        await mkdir(join(root, folder), { recursive: true });
        await cp(folder, join(root, folder), { recursive: true });
      }
      await writeFile(join(root, 'package.json'), '{"type":"module"}');
      const before = await readFile(join(root, 'content/today.json'), 'utf8');
      const draft = JSON.parse(before);
      draft.date = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date());
      draft.isExample = false;
      delete draft.coverImage;
      for (const section of draft.sections) delete section.image;
      const responses = [
        '테스트용 기사 수집 자료', JSON.stringify(draft),
        JSON.stringify({ approved, issues: approved ? [] : ['수치 확인 필요'] }),
      ].map(text => ({ status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text }] }] }));
      responses.push({ data: [{ b64_json: 'aW1hZ2U=' }] } as any);
      await writeFile(join(root, 'mock.mjs'), `const responses = ${JSON.stringify(responses)}; globalThis.fetch = async () => { if (!responses.length) throw new Error('초과 API 호출'); return { ok: true, json: async () => responses.shift() }; };`);
      const result = spawnSync(process.execPath, ['--experimental-strip-types', '--import', join(root, 'mock.mjs'), 'scripts/generate-content.ts'], {
        cwd: root, env: { ...process.env, OPENAI_API_KEY: 'mock-only' }, encoding: 'utf8', timeout: 10000,
      });
      if (!approved) {
        assert.notEqual(result.status, 0);
        assert.match(result.stderr, /검토에서 문제가/);
        assert.equal(await readFile(join(root, 'content/today.json'), 'utf8'), before);
      } else {
        assert.equal(result.status, 0, result.stderr);
        const after = JSON.parse(await readFile(join(root, 'content/today.json'), 'utf8'));
        assert.equal(after.coverImage.isAiGenerated, true);
        assert.equal(after.isExample, false);
        assert.equal((await readdir(join(root, 'content/archive'))).length, 1);
        assert.ok(after.version);
      }
    } finally { await rm(root, { recursive: true, force: true }); }
  });
}
