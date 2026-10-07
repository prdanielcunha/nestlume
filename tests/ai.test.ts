import test from 'node:test';
import assert from 'node:assert/strict';
import { AI_DISCLOSURE_VERSION, prepareAiRequest, type AiConsent, type AiStudyInput } from '../src/lib/ai';

const consent: AiConsent = {
  disclosureVersion: AI_DISCLOSURE_VERSION,
  provider: 'nestai',
  acceptedAt: '2026-09-30T12:00:00.000Z',
  allowPastedText: false,
};

const base: AiStudyInput = {
  provider: 'nestai',
  feature: 'question',
  locale: 'pt',
  question: 'O que João 1 afirma sobre a Palavra?',
  reference: 'João 1:1-5',
  evidence: [{ id: 'blivre:JHN:1:1-5', kind: 'scripture', sourceLabel: 'Bíblia Livre 2018.2.0', text: 'No princípio era a Palavra...' }],
};

test('IA falha fechada sem consentimento', () => {
  const result = prepareAiRequest(base, null);
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.code, 'consent_required');
});

test('troca de provedor exige novo consentimento', () => {
  const result = prepareAiRequest({ ...base, provider: 'cloudflare-workers-ai' }, consent);
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.code, 'provider_changed');
});

test('texto colado exige autorização específica', () => {
  const result = prepareAiRequest({ ...base, feature: 'pasted-text', pastedText: 'Trecho privado do usuário' }, consent);
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.code, 'pasted_text_consent_required');
});

test('requisição fundamentada é preparada sem truncar conteúdo', () => {
  const result = prepareAiRequest(base, consent);
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.request.question, base.question);
    assert.equal(result.request.evidence[0].text, base.evidence[0].text);
  }
});

test('não gera sem evidência', () => {
  const result = prepareAiRequest({ ...base, evidence: [] }, consent);
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.code, 'evidence_required');
});
