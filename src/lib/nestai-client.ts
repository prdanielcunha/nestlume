import { initializeApp, getApps } from 'firebase/app';
import { ReCaptchaEnterpriseProvider, getToken as readAppCheckToken, initializeAppCheck, type AppCheck } from 'firebase/app-check';
import { createNestAiClient, type NestAiClient } from '@millionsnest/ai';
import type { AiStudyRequest, AiStudyResponse } from './ai';

const firebaseConfig = {
  apiKey: 'AIzaSyAhXY8TV8qoXz8Pd2u5jFHUTVssZmi3kMs',
  authDomain: 'millionsnest.firebaseapp.com',
  projectId: 'millionsnest',
  storageBucket: 'millionsnest.firebasestorage.app',
  messagingSenderId: '555464791734',
  appId: '1:555464791734:web:3059e8ac2b8089a1767817',
};

const defaultAppCheckSiteKey = '6LcpY-EtAAAAAElqBbIL_K7nAkm2wpuF6fbhsggG';
let check: AppCheck | null = null;
let client: NestAiClient | null = null;

export function nestAiPilotEnabled(): boolean {
  return import.meta.env.VITE_NESTLUME_NESTAI_ENABLED !== 'false';
}

function getNestLumeAppCheck(): AppCheck {
  if (check) return check;
  const siteKey = (import.meta.env.VITE_NESTLUME_APPCHECK_SITE_KEY || defaultAppCheckSiteKey).trim();
  if (!siteKey) throw new Error('NESTLUME_APPCHECK_NOT_CONFIGURED');
  const app = getApps().find((candidate) => candidate.name === 'nestlume-ai')
    ?? initializeApp(firebaseConfig, 'nestlume-ai');
  check = initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider(siteKey),
    isTokenAutoRefreshEnabled: true,
  });
  return check;
}

function getNestAiClient(): NestAiClient {
  if (client) return client;
  client = createNestAiClient({
    appId: 'nestlume',
    guest: true,
    organizationId: 'public:nestlume',
    baseUrl: 'https://ai.millionsnest.com/v1/',
    hubBaseUrl: 'https://www.millionsnest.com/',
    getAppCheckToken: async () => (await readAppCheckToken(getNestLumeAppCheck(), false)).token,
  });
  return client;
}

export async function requestGroundedStudyViaNestAi(request: AiStudyRequest): Promise<AiStudyResponse> {
  if (!nestAiPilotEnabled()) throw new Error('NESTLUME_NESTAI_DISABLED');
  const result = await getNestAiClient().run<AiStudyResponse>({
    task: 'nestlume.study.grounded',
    input: {
      question: request.question,
      reference: request.reference ?? null,
      feature: request.feature,
      locale: request.locale,
      pastedText: request.pastedText ?? null,
      evidence: request.evidence,
      consent: {
        disclosureVersion: request.consent.disclosureVersion,
        acceptedAt: request.consent.acceptedAt,
        allowPastedText: request.consent.allowPastedText,
      },
    },
  });
  if (!result.result?.answer || !Array.isArray(result.result.claims)) {
    throw new Error('NESTLUME_NESTAI_SCHEMA_UNEXPECTED');
  }
  return result.result;
}
