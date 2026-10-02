import { FormEvent, useCallback, useState } from 'react';
import { Locale, messages } from '../../i18n/messages';
import { loadChapter, resolveBook } from '../../lib/corpus';
import { buildIntegratedStudyEvidence } from '../../lib/studyEvidence';
import { parseReferenceSyntax } from '../../lib/reference';
import {
  AI_DISCLOSURE_VERSION,
  AiConsent,
  AiEvidence,
  AiStudyResponse,
  configuredAiEndpoint,
  configuredTurnstileSiteKey,
  prepareAiRequest,
  requestAiStudy,
} from '../../lib/ai';
import { TurnstileGate } from './TurnstileGate';

type T = Record<keyof typeof messages.pt, string>;
type ReaderTarget = { code: string; chapter: number; startVerse?: number; endVerse?: number };

export function AskPage({ t, locale, onOpenReader, onNotebook, initialPastedText, initialVersion, initialReference, onConsumePastedDraft }: {
  t: T;
  locale: Locale;
  onOpenReader: (target: ReaderTarget) => void;
  onNotebook: () => void;
  initialPastedText?: string;
  initialVersion?: string;
  initialReference?: string;
  onConsumePastedDraft?: () => void;
}) {
  const provider = 'cloudflare-workers-ai' as const;
  const [pastedText] = useState(() => initialPastedText?.trim() || '');
  const [declaredVersion] = useState(() => initialVersion?.trim() || '');
  const [question, setQuestion] = useState(() => {
    if (pastedText) return t.pastedAiDefaultQuestion;
    const params = new URLSearchParams(window.location.search);
    return params.get('mode') === 'study'
      ? 'Faça um estudo profundo e integrado desta passagem: comece pelo que o texto afirma, observe o contexto, conecte dados do idioma original, pessoas, lugares e referências relacionadas apenas quando estiverem nas evidências; diferencie observação, interpretação e aplicação e mostre os limites das fontes.'
      : '';
  });
  const [reference, setReference] = useState(() =>
    initialReference?.trim() ||
    new URLSearchParams(window.location.search).get('ref') ||
    (pastedText ? '' : 'João 1:1-5')
  );
  const [accepted, setAccepted] = useState(false);
  const [allowPastedText, setAllowPastedText] = useState(false);
  const [status, setStatus] = useState('');
  const [result, setResult] = useState<AiStudyResponse | null>(null);
  const [lastEvidence, setLastEvidence] = useState<AiEvidence[]>([]);
  const [sending, setSending] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileReset, setTurnstileReset] = useState(0);
  const endpoint = configuredAiEndpoint();
  const turnstileSiteKey = configuredTurnstileSiteKey();
  const handleTurnstileError = useCallback(() => setStatus(t.aiAntiAbuseError), [t.aiAntiAbuseError]);

  async function buildEvidence(): Promise<{ evidence: AiEvidence[]; target?: ReaderTarget }> {
    const evidence: AiEvidence[] = [];
    let target: ReaderTarget | undefined;

    if (reference.trim()) {
      const syntax = parseReferenceSyntax(reference);
      if (!syntax) throw new Error(t.aiInvalidReference);

      const book = await resolveBook(syntax.bookQuery);
      if (!book || syntax.chapter > book.chapters) throw new Error(t.aiInvalidReference);

      const chapter = await loadChapter(book.file, syntax.chapter);
      const maxVerse = Math.max(...chapter.map(verse => verse.verse));
      const start = syntax.startVerse ?? 1;
      if (start > maxVerse) throw new Error(t.aiInvalidReference);

      const end = syntax.endVerse ?? Math.min(start + 9, maxVerse);
      if (end > maxVerse) throw new Error(t.aiInvalidReference);

      const selected = chapter.filter(verse => verse.verse >= start && verse.verse <= end);
      if (!selected.length) throw new Error(t.aiInvalidReference);

      target = { code: book.ubsCode, chapter: syntax.chapter, startVerse: start, endVerse: end };
      evidence.push(...await buildIntegratedStudyEvidence(book, target, chapter));
    }

    if (pastedText) {
      evidence.push({
        id: 'user:pasted-text',
        kind: 'editorial',
        sourceLabel: declaredVersion
          ? `Texto fornecido pelo usuário · versão declarada: ${declaredVersion}`
          : 'Texto fornecido pelo usuário · versão não informada',
        text: pastedText,
      });
    }

    if (!evidence.length) throw new Error(t.aiInvalidReference);
    return { evidence, target };
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setStatus('');
    setResult(null);
    setLastEvidence([]);
    setSending(true);

    try {
      const { evidence } = await buildEvidence();
      setLastEvidence(evidence);
      const consent: AiConsent | null = accepted ? {
        disclosureVersion: AI_DISCLOSURE_VERSION,
        provider,
        acceptedAt: new Date().toISOString(),
        allowPastedText: pastedText ? allowPastedText : false,
      } : null;

      const prepared = prepareAiRequest({
        provider,
        feature: pastedText ? 'pasted-text' : 'question',
        locale,
        question,
        reference: reference.trim() || undefined,
        pastedText: pastedText || undefined,
        evidence,
      }, consent);

      if (!prepared.ok) {
        setStatus(prepared.message);
        return;
      }

      if (!endpoint) {
        setStatus(t.aiPreparedNotConnected);
        return;
      }
      if (!turnstileSiteKey) {
        setStatus(t.aiAntiAbuseMissing);
        return;
      }
      if (!turnstileToken) {
        setStatus(t.aiAntiAbuseRequired);
        return;
      }

      const response = await requestAiStudy(prepared.request, endpoint, turnstileToken);
      setResult(response);
      setStatus('');
      if (pastedText) onConsumePastedDraft?.();
    } catch (cause) {
      setStatus(cause instanceof Error ? cause.message : t.error);
    } finally {
      setSending(false);
      if (turnstileToken) setTurnstileReset(value => value + 1);
    }
  }

  async function openReference() {
    try {
      const { target } = await buildEvidence();
      if (!target) throw new Error(t.aiReferenceNotProvided);
      onOpenReader(target);
    } catch (cause) {
      setStatus(cause instanceof Error ? cause.message : t.error);
    }
  }

  return (
    <div className="page narrow-page ask-page">
      <p className="kicker">{t.askNestLume.toUpperCase()}</p>
      <h1 className="page-title">{t.askTitle}</h1>
      <p className="page-intro">{t.askIntro}</p>

      <form onSubmit={submit}>
        <label className="field">
          <span>{t.question}</span>
          <textarea
            value={question}
            maxLength={2000}
            onChange={event => setQuestion(event.target.value)}
            placeholder={t.askPlaceholder}
          />
          <small>{question.length} / 2000</small>
        </label>

        {pastedText && (
          <section className="pasted-ai-preview">
            <p className="micro-label">{t.pastedTextPrivate.toUpperCase()}</p>
            <strong>{declaredVersion ? `${t.declaredVersion}: ${declaredVersion}` : t.versionNotProvided}</strong>
            <p>{pastedText.length > 420 ? `${pastedText.slice(0, 420)}…` : pastedText}</p>
          </section>
        )}

        <label className="field">
          <span>{t.referenceOptional}</span>
          <input value={reference} onChange={event => setReference(event.target.value)} placeholder="João 1:1–5" />
        </label>

        <section className="ai-disclosure" aria-labelledby="ai-disclosure-title">
          <p className="micro-label">{t.aiProcessing.toUpperCase()}</p>
          <h2 id="ai-disclosure-title">{t.aiDisclosureTitle}</h2>
          <p>{t.aiDisclosureBody}</p>
          <dl>
            <div><dt>{t.provider}</dt><dd>Cloudflare Workers AI · {t.aiCandidate}</dd></div>
            <div><dt>{t.sentData}</dt><dd>{pastedText ? t.sentDataPastedBody : t.sentDataBody}</dd></div>
            <div><dt>{t.storage}</dt><dd>{t.storageBody}</dd></div>
            <div><dt>{t.quota}</dt><dd>{t.quotaBody}</dd></div>
          </dl>

          <label className="consent-check">
            <input type="checkbox" checked={accepted} onChange={event => setAccepted(event.target.checked)} />
            <span>{t.aiConsent}</span>
          </label>

          {pastedText && (
            <label className="consent-check pasted-consent">
              <input type="checkbox" checked={allowPastedText} onChange={event => setAllowPastedText(event.target.checked)} />
              <span>{t.pastedTextConsent}</span>
            </label>
          )}

          {turnstileSiteKey && (
            <TurnstileGate
              siteKey={turnstileSiteKey}
              locale={locale}
              resetCounter={turnstileReset}
              onToken={setTurnstileToken}
              onError={handleTurnstileError}
            />
          )}
        </section>

        <div className="ask-actions">
          <button className="primary simple" type="submit" disabled={!question.trim() || sending}>
            {sending ? t.loading : t.askSubmit}
          </button>
          <button className="secondary" type="button" onClick={() => void openReference()}>{t.readPassage}</button>
          <button className="secondary" type="button" onClick={onNotebook}>{t.notebook}</button>
        </div>
      </form>

      <div className="ai-status" role="status">
        <strong>{endpoint ? t.aiEndpointConfigured : t.aiEndpointPending}</strong>
        <p>{status || (endpoint ? t.aiEndpointConfiguredBody : t.aiEndpointPendingBody)}</p>
      </div>

      {result && (
        <section className="ai-answer">
          <p className="micro-label">{t.aiUnreviewed.toUpperCase()}</p>
          <h2>{t.answer}</h2>
          <p>{result.answer}</p>

          {!!result.claims?.length && (
            <div className="ai-claims">
              <h3>{t.aiClaims}</h3>
              {result.claims.map((claim, index) => {
                const sources = lastEvidence.filter(item => claim.evidenceIds.includes(item.id));
                return (
                  <article key={index}>
                    <div className="claim-meta">
                      <span>{t.certainty}: <strong>{claim.certainty === 'high' ? t.certaintyHigh : claim.certainty === 'medium' ? t.certaintyMedium : t.certaintyLow}</strong></span>
                    </div>
                    <p>{claim.text}</p>
                    <small>{t.supportingSources}</small>
                    <ul>{sources.map(source => <li key={source.id}>{source.sourceLabel}</li>)}</ul>
                  </article>
                );
              })}
            </div>
          )}

          {!!result.limitations?.length && (
            <div className="ai-limitations">
              <h3>{t.limitations}</h3>
              <ul>{result.limitations.map((item, index) => <li key={index}>{item}</li>)}</ul>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
