import test from 'node:test';
import assert from 'node:assert/strict';
import manifest from '../src/editorial/lexical/step-source-manifest.json' with { type: 'json' };

test('STEPBible source is pinned and licensed', () => {
  assert.equal(manifest.commit, 'b99716b0cddb648ddb95cc786a197180f2f97d48');
  assert.equal(manifest.license, 'CC BY 4.0');
  assert.match(manifest.attribution, /STEP Bible/);
});

test('every lexical input has a stable Git blob and nonzero size', () => {
  const ids = new Set<string>();
  for (const dataset of manifest.datasets) {
    assert.match(dataset.gitBlobSha1, /^[a-f0-9]{40}$/);
    assert.ok(dataset.sizeBytes > 0);
    assert.ok(!ids.has(dataset.id), `duplicate dataset id: ${dataset.id}`);
    ids.add(dataset.id);
  }
  assert.ok(ids.has('TBESG'));
  assert.ok(ids.has('TBESH'));
  assert.ok(ids.has('TAGNT-MAT-JHN'));
  assert.ok(ids.has('TAHOT-GEN-DEU'));
});
