import test from 'node:test';
import assert from 'node:assert/strict';
import bundle from '../src/editorial/lexical/generated/jhn-1-14.json' with { type: 'json' };

test('João 1:14 Palavra mapping is backed by TAGNT G3056 in TR', () => {
  const mapping = bundle.curatedMappings.find(item => item.eStrong === 'G3056');
  assert.ok(mapping);
  assert.equal(mapping?.displayedWord, 'Palavra');
  assert.deepEqual(mapping?.sourceInstances, ['Jhn.1.14#03']);

  const token = bundle.tokens.find(item => item.refInstance === 'Jhn.1.14#03');
  assert.equal(token?.surface, 'λόγος');
  assert.equal(token?.lemma, 'λόγος');
  assert.equal(token?.grammar, 'N-NSM');
  assert.ok(token?.editions.includes('TR'));
  assert.equal(bundle.lexicon.G3056.transliteration, 'logos');
});
