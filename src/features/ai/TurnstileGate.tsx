import { useEffect, useRef, useState } from 'react';

type TurnstileApi = {
  render: (container: HTMLElement, options: {
    sitekey: string;
    action?: string;
    theme?: 'auto' | 'light' | 'dark';
    language?: string;
    appearance?: 'always' | 'execute' | 'interaction-only';
    callback?: (token: string) => void;
    'expired-callback'?: () => void;
    'error-callback'?: () => void;
  }) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT_ID = 'nestlume-turnstile-script';

function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);

  return new Promise((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;

    const waitForApi = () => {
      let attempts = 0;
      const timer = window.setInterval(() => {
        attempts += 1;
        if (window.turnstile) {
          window.clearInterval(timer);
          resolve(window.turnstile);
        } else if (attempts > 100) {
          window.clearInterval(timer);
          reject(new Error('Turnstile did not become available.'));
        }
      }, 50);
    };

    if (existing) {
      waitForApi();
      return;
    }

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.onload = waitForApi;
    script.onerror = () => reject(new Error('Could not load Turnstile.'));
    document.head.appendChild(script);
  });
}

export function TurnstileGate({
  siteKey,
  locale,
  resetCounter,
  onToken,
  onError,
}: {
  siteKey: string;
  locale: 'pt' | 'en' | 'es';
  resetCounter: number;
  onToken: (token: string) => void;
  onError: () => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const apiRef = useRef<TurnstileApi | null>(null);
  const [ready, setReady] = useState(false);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    let alive = true;

    loadTurnstile()
      .then(api => {
        if (!alive || !containerRef.current) return;
        apiRef.current = api;
        widgetIdRef.current = api.render(containerRef.current, {
          sitekey: siteKey,
          action: 'nestlume_ai_study',
          theme: 'auto',
          language: locale === 'pt' ? 'pt-BR' : locale,
          appearance: 'always',
          callback: token => {
            setVerified(true);
            onToken(token);
          },
          'expired-callback': () => {
            setVerified(false);
            onToken('');
          },
          'error-callback': () => {
            setVerified(false);
            onToken('');
            onError();
          },
        });
        setReady(true);
      })
      .catch(() => {
        if (alive) onError();
      });

    return () => {
      alive = false;
      if (apiRef.current && widgetIdRef.current) apiRef.current.remove(widgetIdRef.current);
      widgetIdRef.current = null;
      apiRef.current = null;
    };
  }, [siteKey, locale, onToken, onError]);

  useEffect(() => {
    if (!resetCounter || !apiRef.current || !widgetIdRef.current) return;
    setVerified(false);
    onToken('');
    apiRef.current.reset(widgetIdRef.current);
  }, [resetCounter, onToken]);

  const statusText = verified
    ? (locale === 'pt' ? 'Verificação concluída. A IA está pronta para receber sua pergunta.' : locale === 'es' ? 'Verificación concluida. La IA está lista para recibir tu pregunta.' : 'Verification complete. AI is ready for your question.')
    : (locale === 'pt' ? 'Conclua a verificação abaixo para liberar a IA.' : locale === 'es' ? 'Completa la verificación para habilitar la IA.' : 'Complete the verification below to enable AI.');

  return (
    <div className="turnstile-gate">
      <div ref={containerRef} />
      <span className={verified ? 'turnstile-status verified' : 'turnstile-status'} aria-live="polite">
        {!ready ? (locale === 'pt' ? 'Proteção antiabuso carregando…' : locale === 'es' ? 'Cargando protección antiabuso…' : 'Loading anti-abuse protection…') : statusText}
      </span>
    </div>
  );
}
