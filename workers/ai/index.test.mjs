import test from 'node:test';
import assert from 'node:assert/strict';
import worker from './index.js';

const validBody = {
  schemaVersion: 1,
  provider: 'cloudflare-workers-ai',
  feature: 'question',
  locale: 'pt',
  question: 'O que João 1:1 afirma?',
  evidence: [{ id: 'scripture:JHN.1.1', kind: 'scripture', sourceLabel: 'Bíblia Livre · João 1:1', text: '1. No princípio era a Palavra...' }],
  consent: {
    disclosureVersion: '2026-09-30.1',
    provider: 'cloudflare-workers-ai',
    acceptedAt: '2026-09-30T12:00:00.000Z',
    allowPastedText: false,
  },
};

function request(body = validBody, origin = 'https://nestlume.millionsnest.com', path = '/v1/study', extraHeaders = {}) {
  return new Request(`https://nestlume-ai.example${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin, ...extraHeaders },
    body: JSON.stringify(body),
  });
}

test('rejects an unapproved browser origin before inference', async () => {
  let called = false;
  const response = await worker.fetch(request(validBody, 'https://evil.example'), {
    APP_ORIGIN: 'https://nestlume.millionsnest.com',
    REQUIRE_TURNSTILE: 'false',
    AI: { run: async () => { called = true; return { response: '{"answer":"x"}' }; } },
  });
  assert.equal(response.status, 403);
  assert.equal(called, false);
});

test('fails closed when Turnstile is required but secret is not configured', async () => {
  let called = false;
  const response = await worker.fetch(request(), {
    APP_ORIGIN: 'https://nestlume.millionsnest.com',
    REQUIRE_TURNSTILE: 'true',
    AI: { run: async () => { called = true; return { response: '{"answer":"x"}' }; } },
  });
  assert.equal(response.status, 503);
  assert.equal(called, false);
  assert.equal((await response.json()).error, 'anti_abuse_not_configured');
});

test('valid request reaches inference only when anti-abuse is disabled for isolated tests', async () => {
  let called = false;
  const response = await worker.fetch(request(), {
    APP_ORIGIN: 'https://nestlume.millionsnest.com',
    REQUIRE_TURNSTILE: 'false',
    MODEL: '@cf/google/gemma-4-26b-a4b-it',
    AI: {
      run: async () => {
        called = true;
        return { response: '{"answer":"O texto afirma que a Palavra já era no princípio.","claims":[],"limitations":[]}' };
      },
    },
  });
  assert.equal(response.status, 200);
  assert.equal(called, true);
  const data = await response.json();
  assert.match(data.answer, /Palavra/);
});


test('rejects generated claims that cite evidence ids not present in the request', async () => {
  const response = await worker.fetch(request(), {
    APP_ORIGIN: 'https://nestlume.millionsnest.com',
    REQUIRE_TURNSTILE: 'false',
    MODEL: '@cf/google/gemma-4-26b-a4b-it',
    AI: {
      run: async () => ({
        response: '{"answer":"Uma resposta.","claims":[{"text":"Afirmação","evidenceIds":["invented:source"],"certainty":"high"}],"limitations":[]}',
      }),
    },
  });
  assert.equal(response.status, 502);
  assert.equal((await response.json()).error, 'model_output_invalid');
});

test('accepts fenced JSON but still validates evidence references', async () => {
  const response = await worker.fetch(request(), {
    APP_ORIGIN: 'https://nestlume.millionsnest.com',
    REQUIRE_TURNSTILE: 'false',
    MODEL: '@cf/google/gemma-4-26b-a4b-it',
    AI: {
      run: async () => ({
        response: '```json\n{\"answer\":\"Resposta fundamentada.\",\"claims\":[{\"text\":\"A Palavra já era no princípio.\",\"evidenceIds\":[\"scripture:JHN.1.1\"],\"certainty\":\"high\"}],\"limitations\":[]}\n```',
      }),
    },
  });
  assert.equal(response.status, 200);
});


test('CI validation route is hidden without the server-side token', async () => {
  let called = false;
  const response = await worker.fetch(request(validBody, 'https://nestlume.millionsnest.com', '/v1/ci-study'), {
    APP_ORIGIN: 'https://nestlume.millionsnest.com',
    REQUIRE_TURNSTILE: 'true',
    TURNSTILE_SECRET: 'turnstile-secret',
    CI_VALIDATION_TOKEN: '12345678901234567890123456789012',
    AI: { run: async () => { called = true; return { response: '{"answer":"x","claims":[],"limitations":[]}' }; } },
  });
  assert.equal(response.status, 404);
  assert.equal(called, false);
});

test('CI validation route can test real inference without weakening public Turnstile', async () => {
  let called = false;
  const ciToken = '12345678901234567890123456789012';
  const response = await worker.fetch(
    request(validBody, 'https://nestlume.millionsnest.com', '/v1/ci-study', { 'x-nestlume-ci-token': ciToken }),
    {
      APP_ORIGIN: 'https://nestlume.millionsnest.com',
      REQUIRE_TURNSTILE: 'true',
      TURNSTILE_SECRET: 'turnstile-secret',
      CI_VALIDATION_TOKEN: ciToken,
      MODEL: '@cf/google/gemma-4-26b-a4b-it',
      AI: {
        run: async () => {
          called = true;
          return { response: '{"answer":"Resposta validada.","claims":[],"limitations":[]}' };
        },
      },
    },
  );
  assert.equal(response.status, 200);
  assert.equal(called, true);
});
