export type EditorialLayer = 'scripture' | 'context' | 'interpretation' | 'inference' | 'application';
export type Certainty = 'high' | 'medium' | 'low';
export type ReviewStatus = 'draft' | 'in-review' | 'approved' | 'published';

export type EditorialSource = {
  id: string;
  kind: 'scripture' | 'book' | 'article' | 'lexicon' | 'dataset' | 'website';
  title: string;
  edition?: string;
  locator?: string;
  url?: string;
  license?: string;
};

export type EditorialClaim = {
  id: string;
  layer: EditorialLayer;
  text: string;
  sourceIds: string[];
  certainty: Certainty;
};

export type StudySection = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  layer: EditorialLayer;
  claimIds: string[];
};

export type EditorialStudy = {
  schemaVersion: 1;
  id: string;
  version: string;
  locale: 'pt-BR' | 'en' | 'es';
  reference: {
    editionId: string;
    bookCode: string;
    chapter: number;
    startVerse: number;
    endVerse: number;
  };
  title: string;
  lead: string;
  sources: EditorialSource[];
  claims: EditorialClaim[];
  sections: StudySection[];
  review: {
    status: ReviewStatus;
    reviewer: string | null;
    reviewedAt: string | null;
  };
};

export function validateEditorialStudy(study: EditorialStudy): string[] {
  const errors: string[] = [];
  const sourceIds = new Set(study.sources.map(source => source.id));
  const claimIds = new Set(study.claims.map(claim => claim.id));

  if (study.review.status !== 'draft' && !study.review.reviewer) {
    errors.push('A non-draft study must identify a real human reviewer.');
  }

  for (const claim of study.claims) {
    if (!claim.sourceIds.length) errors.push(`Claim ${claim.id} has no evidence source.`);
    for (const sourceId of claim.sourceIds) {
      if (!sourceIds.has(sourceId)) errors.push(`Claim ${claim.id} references missing source ${sourceId}.`);
    }
  }

  for (const section of study.sections) {
    if (!section.claimIds.length) errors.push(`Section ${section.id} has no claims.`);
    for (const claimId of section.claimIds) {
      if (!claimIds.has(claimId)) errors.push(`Section ${section.id} references missing claim ${claimId}.`);
    }
  }

  return errors;
}
