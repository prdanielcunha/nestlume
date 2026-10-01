import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeReadingLens } from '../src/lib/readingLenses';

test('detecta palavras repetidas e preserva versículos de ocorrência', () => {
  const result = analyzeReadingLens([
    { verse: 1, text: 'A luz resplandece nas trevas.' },
    { verse: 2, text: 'A luz veio ao mundo, mas as trevas não a receberam.' },
  ]);

  const light = result.repeated.find(item => item.word.toLocaleLowerCase('pt-BR') === 'luz');
  assert.ok(light);
  assert.equal(light?.count, 2);
  assert.deepEqual(light?.verses, [1, 2]);
});

test('marca contraste textual sem transformá-lo em interpretação', () => {
  const result = analyzeReadingLens([
    { verse: 5, text: 'A luz brilha nas trevas, mas as trevas não a venceram.' },
  ]);
  assert.equal(result.contrasts[0]?.marker, 'mas');
  assert.equal(result.contrasts[0]?.verse, 5);
});

test('ignora palavras funcionais comuns e não inventa repetição', () => {
  const result = analyzeReadingLens([
    { verse: 1, text: 'E ele foi ao lugar.' },
    { verse: 2, text: 'E ela foi para a casa.' },
  ]);
  assert.equal(result.repeated.length, 0);
});
