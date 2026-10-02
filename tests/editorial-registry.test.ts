import test from 'node:test';
import assert from 'node:assert/strict';
import { findEditorialStudy, listEditorialStudies } from '../src/editorial/registry';

test('João 1 fixture is discovered through the generic reference registry', () => {
  const study = findEditorialStudy({ bookCode: 'JHN', chapter: 1, startVerse: 1, endVerse: 5 });
  assert.equal(study?.id, 'john-1-1-18-before-bethlehem');
});

test('absence of a hand-authored study is represented as no editorial layer, not a fake fallback', () => {
  const study = findEditorialStudy({ bookCode: 'EXO', chapter: 40, startVerse: 34, endVerse: 38 });
  assert.equal(study, null);
});

test('registry contains versioned studies rather than reader hardcodes', () => {
  for (const study of listEditorialStudies()) {
    assert.equal(study.schemaVersion, 1);
    assert.match(study.reference.bookCode, /^[A-Z0-9]{3}$/);
    assert.ok(study.reference.chapter > 0);
    assert.ok(study.reference.startVerse > 0);
    assert.ok(study.reference.endVerse >= study.reference.startVerse);
  }
});
