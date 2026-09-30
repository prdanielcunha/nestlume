import test from 'node:test';
import assert from 'node:assert/strict';
import { cleanVerseBody, parseBookText } from '../src/lib/corpus';

test('preserva palavras adicionadas e remove nota editorial', () => {
  const body = 'Ele não era a Luz; mas \\added\nfoi enviado\n\\*added para testemunhar. \\fn\n\\key\nLuz\n\\*key\nnota\n\\*fn';
  assert.equal(cleanVerseBody(body), 'Ele não era a Luz; mas foi enviado para testemunhar.');
});

test('parseia referências de verso do formato BLIVRE f4', () => {
  const raw = '\\name-short\nJoão\n\\*name-short\n\\v Jo.1.1\nNo princípio era a Palavra.\n\\v Jo.1.2\nEsta estava junto de Deus.';
  assert.deepEqual(parseBookText(raw), [
    { chapter: 1, verse: 1, text: 'No princípio era a Palavra.' },
    { chapter: 1, verse: 2, text: 'Esta estava junto de Deus.' },
  ]);
});
