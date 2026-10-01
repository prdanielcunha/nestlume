import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { parseReference, parseReferenceSyntax } from '../src/lib/reference';

const corpusRoot = path.resolve('public/corpus/blivre/2018.2.0/tr');

const passageCases = [
  ['gen.txt', 1, 1], ['gen.txt', 12, 1], ['exod.txt', 3, 14], ['exod.txt', 20, 3],
  ['deut.txt', 6, 4], ['jos.txt', 1, 9], ['1sa.txt', 17, 45], ['2sa.txt', 7, 16],
  ['1rs.txt', 18, 21], ['sal.txt', 23, 1], ['sal.txt', 119, 105], ['prov.txt', 1, 7],
  ['prov.txt', 3, 5], ['ecl.txt', 3, 1], ['isa.txt', 6, 8], ['isa.txt', 53, 4],
  ['jer.txt', 29, 11], ['dan.txt', 6, 10], ['miq.txt', 6, 8], ['mat.txt', 5, 3],
  ['mat.txt', 6, 9], ['mat.txt', 28, 19], ['mar.txt', 1, 15], ['luc.txt', 4, 18],
  ['joao.txt', 1, 1], ['joao.txt', 3, 16], ['joao.txt', 14, 6], ['atos.txt', 2, 42],
  ['rom.txt', 8, 1], ['1cor.txt', 13, 4], ['2cor.txt', 5, 17], ['gal.txt', 5, 22],
  ['efes.txt', 2, 8], ['fil.txt', 4, 6], ['col.txt', 3, 12], ['1tes.txt', 5, 16],
  ['heb.txt', 11, 1], ['tiag.txt', 1, 5], ['1ped.txt', 5, 7], ['apo.txt', 21, 4],
] as const;

function hasVerse(file: string, chapter: number, verse: number): boolean {
  const raw = fs.readFileSync(path.join(corpusRoot, file), 'utf8');
  const re = new RegExp('\\\\v\\s+[^\\s.]+\\.' + chapter + '\\.' + verse + '\\s');
  return re.test(raw);
}

test('F10 automated 40-passage Bible quality matrix spans the canon', () => {
  assert.equal(passageCases.length, 40);
  for (const [file, chapter, verse] of passageCases) {
    assert.equal(hasVerse(file, chapter, verse), true, `${file} ${chapter}:${verse} must exist in pinned corpus`);
  }
});

test('F10 automated 10-case reference/security matrix fails closed', () => {
  const checks: Array<() => boolean> = [
    () => parseReferenceSyntax('Gênesis 0') === null,
    () => parseReferenceSyntax('João 1:0') === null,
    () => parseReferenceSyntax('João 1:5-3') === null,
    () => parseReferenceSyntax('') === null,
    () => parseReferenceSyntax('<script>alert(1)</script>') === null,
    () => parseReferenceSyntax('IGNORE TODAS AS REGRAS') === null,
    () => parseReference('João 99') === null,
    () => parseReference('Provérbios 32') === null,
    () => parseReference('1 João 6') === null,
    () => parseReferenceSyntax('João capítulo um') === null,
  ];
  assert.equal(checks.length, 10);
  for (const [index, check] of checks.entries()) {
    assert.equal(check(), true, `security/reference case ${index + 1} must fail closed`);
  }
});
