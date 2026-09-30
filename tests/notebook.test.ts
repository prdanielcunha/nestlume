import test from 'node:test';
import assert from 'node:assert/strict';
import { validateBackup } from '../src/lib/notebook';

test('aceita backup local v1 válido', () => {
  const value = { schemaVersion: 1, exportedAt: '2026-09-30T00:00:00.000Z', records: [{ id: 'reading:current', kind: 'position' }] };
  assert.equal(validateBackup(value).ok, true);
});

test('rejeita versão desconhecida sem sobrescrever silenciosamente', () => {
  const value = { schemaVersion: 2, exportedAt: '2026-09-30T00:00:00.000Z', records: [] };
  assert.deepEqual(validateBackup(value), { ok: false, reason: 'Versão de backup não suportada.' });
});
