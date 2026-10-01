import fs from 'node:fs';
import path from 'node:path';
import { batteryCases } from './ai-battery-cases.mjs';

const endpoint = (process.env.NESTLUME_AI_ENDPOINT || '').replace(/\/$/, '');
const outputPath = process.env.NESTLUME_AI_BATTERY_OUTPUT || 'artifacts/ai-battery-result.json';
const disclosureVersion = '2026-09-30.1';
const provider = 'cloudflare-workers-ai';
const turnstileToken = process.env.NESTLUME_TURNSTILE_TOKEN || '';
const requestPath = process.env.NESTLUME_AI_PATH || '/v1/study';
const ciValidationToken = process.env.NESTLUME_CI_VALIDATION_TOKEN || process.env.NESTLUME_AI_CI_TOKEN || '';

if (!endpoint) {
  console.error('NESTLUME_AI_ENDPOINT is required. No request was sent.');
  process.exit(2);
}

if (requestPath === '/v1/ci-study' && !ciValidationToken) {
  console.error('CI validation route selected but no CI validation token is available.');
  process.exit(2);
}

async function verifyCiRouteWithRunner() {
  if (requestPath !== '/v1/ci-study') return;
  const response = await fetch(`${endpoint}${requestPath}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      origin: 'https://nestlume.millionsnest.com',
      'x-nestlume-ci-token': ciValidationToken,
    },
    body: '{}',
  });
  const raw = await response.text();
  let parsed = null;
  try { parsed = JSON.parse(raw); } catch {}
  if (response.status !== 400 || parsed?.error !== 'invalid_request') {
    console.error(`AI battery runner CI authentication failed (HTTP ${response.status}).`);
    process.exit(2);
  }
  console.log(`CI route authenticated by battery runner (tokenLength=${ciValidationToken.length}).`);
}

function cleanVerseBody(body) {
  return body
    .replace(/\\fn[\s\S]*?\\\*fn/g, ' ')
    .replace(/\\(?:added|it|bd|sc|wj)\s*\r?\n?/g, '')
    .replace(/\\\*(?:added|it|bd|sc|wj)\s*/g, '')
    .replace(/\\(?:key|fr|ft|fq|fqa|fk|fl|fv|xo|xt|xq|xk|xot|xnt)\s*\r?\n?[^\\\r\n]*/g, ' ')
    .replace(/\\\*?[A-Za-z0-9-]+/g, ' ')
    .replace(/\r?\n/g, ' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

function loadVerses(source) {
  const filePath = path.resolve('public/corpus/blivre/2018.2.0/tr', source.file);
  const raw = fs.readFileSync(filePath, 'utf8');
  const marker = /\\v\s+([^\s.]+)\.(\d+)\.(\d+)\s*\r?\n?/g;
  const matches = [...raw.matchAll(marker)];
  return matches
    .map((match, index) => ({
      chapter: Number(match[2]),
      verse: Number(match[3]),
      text: cleanVerseBody(raw.slice((match.index ?? 0) + match[0].length, index + 1 < matches.length ? matches[index + 1].index : raw.length)),
    }))
    .filter(row =>
      row.chapter === source.chapter &&
      row.verse >= source.startVerse &&
      row.verse <= source.endVerse
    );
}

function hydrateEvidence(item) {
  if (item.text) return item;
  if (!item.source) throw new Error(`Evidence ${item.id} has neither text nor corpus source.`);
  const verses = loadVerses(item.source);
  if (!verses.length) throw new Error(`No verses found for ${item.id}.`);
  return {
    id: item.id,
    kind: item.kind,
    sourceLabel: item.sourceLabel,
    text: verses.map(row => `${row.verse}. ${row.text}`).join('\n'),
  };
}

function structuralCheck(response, evidence) {
  const errors = [];
  if (!response || typeof response.answer !== 'string' || !response.answer.trim()) errors.push('missing answer');
  if (response.claims !== undefined && !Array.isArray(response.claims)) errors.push('claims is not an array');
  const evidenceIds = new Set(evidence.map(item => item.id));
  for (const [index, claim] of (response.claims || []).entries()) {
    if (typeof claim.text !== 'string' || !claim.text.trim()) errors.push(`claim ${index} missing text`);
    if (!Array.isArray(claim.evidenceIds)) errors.push(`claim ${index} missing evidenceIds`);
    for (const id of claim.evidenceIds || []) {
      if (!evidenceIds.has(id)) errors.push(`claim ${index} references unknown evidence id ${id}`);
    }
    if (!['high', 'medium', 'low'].includes(claim.certainty)) errors.push(`claim ${index} has invalid certainty`);
  }
  return errors;
}

async function runCase(testCase) {
  if (testCase.localOnly) {
    return {
      id: testCase.id,
      title: testCase.title,
      status: 'local-gate',
      humanCriteria: testCase.humanCriteria,
      note: 'This case must be verified by local reference/parser tests before any provider request.',
    };
  }

  if (testCase.blockedUntil) {
    return {
      id: testCase.id,
      title: testCase.title,
      status: 'blocked',
      blockedUntil: testCase.blockedUntil,
      humanCriteria: testCase.humanCriteria,
    };
  }

  const evidence = testCase.evidence.map(hydrateEvidence);
  const body = {
    schemaVersion: 1,
    provider,
    feature: testCase.feature,
    locale: testCase.locale,
    question: testCase.question,
    reference: testCase.reference,
    pastedText: testCase.pastedText,
    evidence,
    turnstileToken: turnstileToken || undefined,
    consent: {
      disclosureVersion,
      provider,
      acceptedAt: new Date().toISOString(),
      allowPastedText: Boolean(testCase.allowPastedText),
    },
  };

  const started = Date.now();
  let response;
  try {
    response = await fetch(`${endpoint}${requestPath}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        origin: 'https://nestlume.millionsnest.com',
        ...(ciValidationToken ? { 'x-nestlume-ci-token': ciValidationToken } : {}),
      },
      body: JSON.stringify(body),
    });
  } catch (error) {
    return {
      id: testCase.id,
      title: testCase.title,
      status: 'transport-error',
      latencyMs: Date.now() - started,
      error: String(error?.message || error),
      humanCriteria: testCase.humanCriteria,
    };
  }

  const raw = await response.text();
  let parsed = null;
  try { parsed = JSON.parse(raw); } catch {}

  if (!response.ok) {
    return {
      id: testCase.id,
      title: testCase.title,
      status: 'http-error',
      httpStatus: response.status,
      latencyMs: Date.now() - started,
      response: parsed ?? raw.slice(0, 1000),
      humanCriteria: testCase.humanCriteria,
    };
  }

  const structuralErrors = structuralCheck(parsed, evidence);
  return {
    id: testCase.id,
    title: testCase.title,
    status: structuralErrors.length ? 'structural-fail' : 'awaiting-human-review',
    latencyMs: Date.now() - started,
    structuralErrors,
    response: parsed,
    humanCriteria: testCase.humanCriteria,
  };
}

await verifyCiRouteWithRunner();

const results = [];
for (const testCase of batteryCases) {
  const result = await runCase(testCase);
  results.push(result);
  console.log(`${result.id}: ${result.status}${result.latencyMs ? ` (${result.latencyMs} ms)` : ''}`);
}

const summary = {
  generatedAt: new Date().toISOString(),
  endpoint,
  provider,
  requestPath,
  total: results.length,
  awaitingHumanReview: results.filter(result => result.status === 'awaiting-human-review').length,
  structuralFail: results.filter(result => result.status === 'structural-fail').length,
  blocked: results.filter(result => result.status === 'blocked').length,
  localGate: results.filter(result => result.status === 'local-gate').length,
  transportOrHttpErrors: results.filter(result => result.status === 'transport-error' || result.status === 'http-error').length,
  note: 'A result marked awaiting-human-review is not a passing biblical/editorial verdict. Human review is required.',
  results,
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(summary, null, 2) + '\n');
console.log(`Result written to ${outputPath}`);

const failOnBlocked = process.env.NESTLUME_AI_BATTERY_FAIL_ON_BLOCKED === 'true';
summary.failOnBlocked = failOnBlocked;
if (summary.structuralFail || summary.transportOrHttpErrors || (failOnBlocked && summary.blocked)) process.exitCode = 1;
