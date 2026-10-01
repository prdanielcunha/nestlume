export type PassageSharePayload = {
  title: string;
  text: string;
  url: string;
};

export function buildPassageSharePayload(reference: string, relativePath: string, origin: string): PassageSharePayload {
  const url = new URL(relativePath, origin).toString();
  return {
    title: `NestLume · ${reference}`,
    text: `${reference} · NestLume`,
    url,
  };
}

export async function sharePassage(payload: PassageSharePayload): Promise<'shared' | 'copied'> {
  if (typeof navigator.share === 'function') {
    await navigator.share(payload);
    return 'shared';
  }

  if (!navigator.clipboard?.writeText) {
    throw new Error('Compartilhamento não disponível neste navegador.');
  }

  await navigator.clipboard.writeText(payload.url);
  return 'copied';
}
