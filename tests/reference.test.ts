import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeText, parseReference } from '../src/lib/reference';

test('normaliza acentos e pontuação', () => {
  assert.equal(normalizeText('João, 1:1–5'), 'joao 1 1 5');
});

test('resolve referência em português sem acento', () => {
  assert.deepEqual(parseReference('joao 1:1-5'), { book: 'João', chapter: 1, startVerse: 1, endVerse: 5 });
});

test('distingue João de 1 João', () => {
  assert.equal(parseReference('João 1')?.book, 'João');
  assert.equal(parseReference('1 João 1')?.book, '1 João');
});

test('João 99 falha fechado em vez de inventar passagem', () => {
  assert.equal(parseReference('João 99'), null);
});
