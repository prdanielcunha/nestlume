import { EditorialStudy } from './schema';
import { john1PrologueStudy } from './studies/john-1-1-18';
import { initialEditorialLibrary } from './studies/initial-library';

export type EditorialLookup = {
  bookCode: string;
  chapter: number;
  startVerse?: number;
  endVerse?: number;
};

const studies: EditorialStudy[] = [
  john1PrologueStudy,
  ...initialEditorialLibrary,
];

export function listEditorialStudies(): readonly EditorialStudy[] {
  return studies;
}

export function findEditorialStudy(target: EditorialLookup): EditorialStudy | null {
  const start = target.startVerse ?? 1;
  const end = target.endVerse ?? Number.MAX_SAFE_INTEGER;

  return studies.find(study => {
    if (study.reference.bookCode !== target.bookCode.toUpperCase()) return false;
    if (study.reference.chapter !== target.chapter) return false;
    return start <= study.reference.endVerse && end >= study.reference.startVerse;
  }) ?? null;
}

export function hasPublishedEditorialCoverage(target: EditorialLookup): boolean {
  const study = findEditorialStudy(target);
  return study?.review.status === 'published';
}
