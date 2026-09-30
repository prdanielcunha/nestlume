# NestLume — whole-Bible scope

Decision date: 2026-09-30

## Product scope

NestLume is a **whole-Bible reading and study product**. João and Provérbios are early examples and validation fixtures, not a product boundary, content package, or permanent editorial focus.

A user must be able to open, search, resume, annotate, paste against, and ask grounded questions about **any valid passage in the integrated 66-book Bible corpus**.

## Two different kinds of coverage

### 1. Bible-wide study capability
This is a core product capability and must not depend on a hand-authored study existing for the passage.

For every valid passage, the product may provide, subject to available verified evidence:
- Scripture reading and reference resolution;
- local word/reference search;
- notes, bookmarks and continuity;
- grounded AI questions using the selected passage as explicit evidence;
- contextual exploration when a verified source exists;
- people, places, objects and concepts when verified entity data exists;
- original-language exploration when exact verse/form/lemma alignment has been validated;
- Bible connections when the relationship can be justified and sourced.

When evidence for a requested layer is missing, NestLume must say so. It must not replace missing lexical, historical, archaeological or textual-critical evidence with model improvisation.

### 2. Human-reviewed editorial library
Human-authored/reviewed encounters are an **additional premium editorial layer**. Their coverage may grow progressively across the canon, and the interface must state whether a reviewed encounter exists for the current passage.

The absence of a published editorial encounter must never imply that the passage is unsupported by NestLume or that the user cannot study it.

## Early examples

João 1 and selected passages in João/Provérbios may be used to validate:
- narrative/discourse/wisdom handling;
- entity disambiguation;
- original-language UX;
- source/certainty disclosure;
- editorial workflow;
- grounded-AI behavior.

These examples do not define the final corpus of studies.

## Architecture rule

No central reader, search, AI, lexical, entity or source subsystem may contain an architectural assumption that supported study equals João or Provérbios.

Specific passage assets are registered through generic registries keyed by canonical reference and versioned source metadata. The reader asks the registry what additional layers are available for the current passage.

## Whole-Bible validation matrix

Before the product is considered broadly validated, testing must include representative passages from:
- Torah/Pentateuch;
- historical books;
- poetry and wisdom;
- major and minor prophets;
- Gospels;
- Acts;
- Pauline and General Epistles;
- Revelation.

Tests must include prose, poetry, law, genealogy, prophecy, parable, discourse, apocalyptic material and passages containing textual/lexical uncertainty.

## Original languages

Greek, Hebrew and Aramaic support is Bible-wide in architecture but only displayed at passage/word precision after alignment is validated for the relevant source data. Latin is translation-history context, not an original-language substitute.

## Editorial truthfulness

A generated answer is not a published editorial study. A draft is not a reviewed study. A verified lexical bundle is not permission to infer unsupported theology. These states remain visibly separate throughout the whole canon.
