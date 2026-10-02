import assert from 'node:assert/strict';
import test from 'node:test';
import { listEditorialStudies } from '../src/editorial/registry';
import { validateEditorialStudy } from '../src/editorial/schema';

test('editorial starter library now spans multiple biblical genres and testaments', () => {
  const studies = listEditorialStudies();
  assert.ok(studies.length >= 20, `expected at least 20 starter studies, received ${studies.length}`);
  for (const bookCode of ['GEN','PSA','ISA','MAT','JHN','PRO','ROM','1CO','EPH','JAS','REV']) {
    assert.ok(studies.some(study => study.reference.bookCode === bookCode), `${bookCode} starter coverage is required`);
  }
});

test('every editorial encounter is structurally valid and never fakes human review', () => {
  const ids = new Set<string>();
  for (const study of listEditorialStudies()) {
    assert.deepEqual(validateEditorialStudy(study), [], `invalid editorial study: ${study.id}`);
    assert.equal(ids.has(study.id), false, `duplicate study id: ${study.id}`);
    ids.add(study.id);

    if (!study.review.reviewer) {
      assert.equal(study.review.status, 'draft', `${study.id} must remain draft until a real reviewer is recorded`);
      assert.equal(study.review.reviewedAt, null);
    }
  }
});

test('each initial encounter has explicit Scripture evidence and a precise passage locator', () => {
  for (const study of listEditorialStudies()) {
    assert.ok(study.sources.some(source => source.kind === 'scripture'), `${study.id} is missing Scripture evidence`);
    for (const claim of study.claims) {
      assert.ok(claim.sourceIds.length > 0, `${study.id}/${claim.id} is missing evidence`);
    }
    assert.ok(study.reference.startVerse <= study.reference.endVerse, `${study.id} has an invalid verse range`);
  }
});
