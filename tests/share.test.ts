import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPassageSharePayload } from '../src/lib/share';

test('passage sharing contains only canonical reference and URL', () => {
  const payload = buildPassageSharePayload(
    'João 1:1–5',
    '/ler/jhn/1?v=1-5',
    'https://nestlume.millionsnest.com',
  );

  assert.equal(payload.url, 'https://nestlume.millionsnest.com/ler/jhn/1?v=1-5');
  assert.match(payload.title, /João 1:1–5/);
  assert.match(payload.text, /João 1:1–5/);
  assert.doesNotMatch(JSON.stringify(payload), /anota|pergunta privada|caderno/i);
});
