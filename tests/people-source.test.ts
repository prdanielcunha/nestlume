import test from 'node:test';
import assert from 'node:assert/strict';

test('TIPNR Named rows keep exhaustive references in column 4', () => {
  const line = '– Named\tJohn@Mat.3.1-Act\tG2491G«G2491=Ἰωάννης\tJohn\tMat.3.1; Jhn.1.6; Jhn.1.15\t';
  const cols = line.split('\t');
  assert.equal(cols[3], 'John');
  assert.match(cols[4], /Jhn\.1\.6/);
  assert.equal(cols[5], '');
});
