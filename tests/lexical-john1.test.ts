import test from 'node:test';
import assert from 'node:assert/strict';
import bundle from '../src/editorial/lexical/generated/jhn-1-1.json' with { type: 'json' };

test('João 1:1 lexical bundle is pinned to the approved STEPBible snapshot', () => {
  assert.equal(bundle.provenance.commit, 'b99716b0cddb648ddb95cc786a197180f2f97d48');
  assert.equal(bundle.provenance.tagnt.blobSha, '705c1bc1cf752e013efcef99b8d9a3b7853bf843');
  assert.equal(bundle.provenance.tbesg.blobSha, 'efe271a1dbb73fa01f8fa6e0f164c6687757a9ae');
  assert.equal(bundle.license, 'CC BY 4.0');
});

test('all 17 tagged tokens for João 1:1 are attested in TR', () => {
  assert.equal(bundle.tokens.length, 17);
  assert.ok(bundle.tokens.every(token => token.editions.includes('TR')));
});

test('curated Palavra mapping resolves to λόγος without pretending universal alignment', () => {
  const mapping = bundle.curatedMappings.find(item => item.eStrong === 'G3056');
  assert.ok(mapping);
  assert.equal(mapping?.displayedWord, 'Palavra');
  assert.equal(mapping?.mappingType, 'curated-contextual');
  assert.deepEqual(mapping?.sourceInstances, ['Jhn.1.1#05', 'Jhn.1.1#08', 'Jhn.1.1#17']);

  const logos = bundle.lexicon.G3056;
  assert.equal(logos.greek, 'λόγος');
  assert.equal(logos.transliteration, 'logos');
  assert.equal(logos.gloss, 'word');
  assert.ok(mapping?.sourceInstances.every(id => bundle.tokens.some(token => token.refInstance === id && token.eStrong === 'G3056')));
});
