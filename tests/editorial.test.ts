import test from 'node:test';
import assert from 'node:assert/strict';
import { validateEditorialStudy } from '../src/editorial/schema';
import { john1PrologueStudy } from '../src/editorial/studies/john-1-1-18';

test('estudo inicial possui claims rastreáveis e fontes existentes', () => {
  assert.deepEqual(validateEditorialStudy(john1PrologueStudy), []);
  assert.ok(john1PrologueStudy.claims.every(claim => claim.sourceIds.length > 0));
});

test('rascunho não finge revisão humana', () => {
  assert.equal(john1PrologueStudy.review.status, 'draft');
  assert.equal(john1PrologueStudy.review.reviewer, null);
  assert.equal(john1PrologueStudy.review.reviewedAt, null);
});

test('estudo aprovado sem revisor real falha validação', () => {
  const invalid = {
    ...john1PrologueStudy,
    review: { status: 'approved' as const, reviewer: null, reviewedAt: null },
  };
  assert.ok(validateEditorialStudy(invalid).some(error => error.includes('human reviewer')));
});
