export const AI_DISCLOSURE_VERSION = '2026-09-30.1';
export const AI_MAX_QUESTION_CHARS = 2000;
export const AI_MAX_PASTED_TEXT_CHARS = 12000;
export const AI_MAX_EVIDENCE_ITEMS = 12;
export const AI_MAX_EVIDENCE_CHARS = 4000;

export type AiProviderId = 'nestai' | 'cloudflare-workers-ai' | 'openai-api' | 'google-gemini-api';
export type AiFeature = 'question' | 'pasted-text' | 'deep-dive' | 'original-language';
export type AiLocale = 'pt' | 'en' | 'es';

export type AiConsent = {
  disclosureVersion: typeof AI_DISCLOSURE_VERSION;
  provider: AiProviderId;
  acceptedAt: string;
  allowPastedText: boolean;
};

export type AiEvidence = {
  id: string;
  kind: 'scripture' | 'editorial' | 'lexical' | 'historical';
  sourceLabel: string;
  text: string;
};

export type AiStudyInput = {
  provider: AiProviderId;
  feature: AiFeature;
  locale: AiLocale;
  question: string;
  reference?: string;
  pastedText?: string;
  evidence: AiEvidence[];
};

export type AiStudyRequest = AiStudyInput & {
  schemaVersion: 1;
  consent: AiConsent;
};

export type AiStudyResponse = {
  answer: string;
  claims?: Array<{ text: string; evidenceIds: string[]; certainty: 'high' | 'medium' | 'low' }>;
  limitations?: string[];
  provider?: string;
  model?: string;
};

export type AiPrepareErrorCode =
  | 'consent_required'
  | 'provider_changed'
  | 'pasted_text_consent_required'
  | 'empty_question'
  | 'question_too_long'
  | 'pasted_text_too_long'
  | 'evidence_required'
  | 'too_many_evidence_items'
  | 'evidence_too_long';

export type AiPrepareResult =
  | { ok: true; request: AiStudyRequest }
  | { ok: false; code: AiPrepareErrorCode; message: string };

export function prepareAiRequest(input: AiStudyInput, consent: AiConsent | null): AiPrepareResult {
  const question = input.question.replace(/\u0000/g, '').trim();
  const pastedText = input.pastedText?.replace(/\u0000/g, '') ?? '';

  if (!consent || consent.disclosureVersion !== AI_DISCLOSURE_VERSION) {
    return { ok: false, code: 'consent_required', message: 'É necessário aceitar a explicação de processamento da IA antes de enviar dados.' };
  }
  if (consent.provider !== input.provider) {
    return { ok: false, code: 'provider_changed', message: 'O provedor de IA mudou. Revise e aceite a explicação atualizada antes de continuar.' };
  }
  if (!question) return { ok: false, code: 'empty_question', message: 'Escreva uma pergunta antes de continuar.' };
  if (question.length > AI_MAX_QUESTION_CHARS) {
    return { ok: false, code: 'question_too_long', message: `A pergunta excede o limite de ${AI_MAX_QUESTION_CHARS} caracteres. O NestLume não trunca texto silenciosamente.` };
  }
  if (pastedText && !consent.allowPastedText) {
    return { ok: false, code: 'pasted_text_consent_required', message: 'Você precisa permitir explicitamente o envio do texto colado nesta solicitação.' };
  }
  if (pastedText.length > AI_MAX_PASTED_TEXT_CHARS) {
    return { ok: false, code: 'pasted_text_too_long', message: `O texto colado excede o limite de ${AI_MAX_PASTED_TEXT_CHARS} caracteres. Divida o material antes de enviar.` };
  }
  if (!input.evidence.length) return { ok: false, code: 'evidence_required', message: 'A geração só é liberada quando existe evidência selecionada para fundamentar a resposta.' };
  if (input.evidence.length > AI_MAX_EVIDENCE_ITEMS) return { ok: false, code: 'too_many_evidence_items', message: 'Há evidências demais para uma única geração.' };
  if (input.evidence.some(item => item.text.length > AI_MAX_EVIDENCE_CHARS)) return { ok: false, code: 'evidence_too_long', message: 'Uma das evidências excede o limite permitido e precisa ser dividida explicitamente.' };

  return {
    ok: true,
    request: {
      schemaVersion: 1,
      provider: input.provider,
      feature: input.feature,
      locale: input.locale,
      question,
      reference: input.reference?.trim() || undefined,
      pastedText: pastedText || undefined,
      evidence: input.evidence.map(item => ({ ...item, text: item.text.replace(/\u0000/g, '') })),
      consent,
    },
  };
}

export function configuredTurnstileSiteKey(): string | null {
  const env = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env;
  const value = env?.VITE_NESTLUME_TURNSTILE_SITE_KEY?.trim();
  return value || null;
}

export function configuredAiEndpoint(): string | null {
  const env = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env;
  const raw = env?.VITE_NESTLUME_AI_ENDPOINT?.trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== 'https:' && url.hostname !== 'localhost') return null;
    return url.toString().replace(/\/$/, '');
  } catch {
    return null;
  }
}

export async function requestAiStudy(request: AiStudyRequest, endpoint = configuredAiEndpoint(), turnstileToken?: string): Promise<AiStudyResponse> {
  if (!endpoint) throw new Error('A IA ao vivo ainda não foi conectada a um provedor aprovado.');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);
  try {
    const response = await fetch(`${endpoint}/v1/study`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...request, turnstileToken: turnstileToken || undefined }),
      signal: controller.signal,
      credentials: 'omit',
    });
    if (response.status === 429) throw new Error('A IA atingiu um limite temporário de proteção ou da cota gratuita. Aguarde um pouco e tente novamente; a Bíblia e os estudos salvos continuam funcionando.');
    if (!response.ok) {
      let code = '';
      try {
        const body = await response.json() as { error?: string };
        code = body.error || '';
      } catch {
        // Keep the public message useful even when an upstream proxy does not return JSON.
      }
      if (response.status === 403 && code.startsWith('anti_abuse')) {
        throw new Error('A verificação de segurança não foi aceita. Refaça a verificação visível e envie novamente.');
      }
      if (response.status === 503 && code.includes('rate_limit')) {
        throw new Error('A proteção de uso da IA está temporariamente indisponível. Tente novamente em instantes.');
      }
      throw new Error(`A IA não conseguiu concluir esta solicitação (${response.status}${code ? ` · ${code}` : ''}).`);
    }
    const data = await response.json() as AiStudyResponse;
    if (!data.answer?.trim()) throw new Error('A resposta da IA chegou sem conteúdo utilizável.');
    return data;
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === 'AbortError') {
      throw new Error('A IA demorou mais de 60 segundos para responder. Tente novamente; sua leitura e seus dados locais não foram afetados.');
    }
    throw cause;
  } finally {
    clearTimeout(timeout);
  }
}
