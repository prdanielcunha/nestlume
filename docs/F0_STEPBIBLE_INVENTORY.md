# NestLume — STEPBible original-language data inventory

Evidence date: 2026-09-30

## Decision
STEPBible-Data is approved as an **import source candidate** for the original-language subsystem. No runtime data is imported merely because this inventory exists. Every derived package must record transformations and attribution before shipping.

Canonical repository: https://github.com/STEPBible/STEPBible-Data  
Pinned source commit: `b99716b0cddb648ddb95cc786a197180f2f97d48` (2026-09-18)  
Repository license declaration: **CC BY 4.0**  
Required credit: **STEP Bible**, linked to https://www.STEPBible.org/

The upstream README expressly permits inclusion of any part of STEPBible-Data in software/publications, permits adaptations, asks that changes be recorded, and requires attribution.

## Pinned files

| Dataset | Purpose in NestLume | Git blob SHA | Size |
|---|---|---:|---:|
| TBESG — Translators Brief lexicon of Extended Strongs for Greek | Greek lemma/gloss/definition lookup | `efe271a1dbb73fa01f8fa6e0f164c6687757a9ae` | 4,736,912 B |
| TBESH — Translators Brief lexicon of Extended Strongs for Hebrew | Hebrew/Aramaic lemma/gloss/definition lookup | `a64990a674d13245ae1e9ed426bc69197c2fbad5` | 3,288,045 B |
| TAGNT Mat–Jhn | Greek NT word forms, lexical/morphological tags and edition attestation for Matthew–John | `705c1bc1cf752e013efcef99b8d9a3b7853bf843` | 14,189,032 B |
| TAGNT Act–Rev | Greek NT word forms, lexical/morphological tags and edition attestation for Acts–Revelation | `4bbea2c14681b01eb889d5a2d1dc0856858a32de` | 15,939,932 B |
| TAHOT Gen–Deu | Hebrew OT tagged source | `eb051292f8cee648c4f3eaf1b48cd0f1f30dc1d5` | 18,190,455 B |
| TAHOT Jos–Est | Hebrew OT tagged source | `e3824344f6dea1a3f51932d1b0a53537c3c2023e` | 24,500,317 B |
| TAHOT Job–Sng | Hebrew OT tagged source | `3d7af689417b54ebc468700b2bd86a8ba5377530` | 9,540,133 B |
| TAHOT Isa–Mal | Hebrew OT tagged source | `1cfe6718a1dae0d5d45a57a942d3f7f716ac6342` | 17,977,518 B |

## Product boundaries
- Do not use Strong's numbers alone as an interpretation engine.
- The lexical definition does not decide the meaning of a word in a specific verse; context and tagged occurrence data must constrain the explanation.
- Display lemma and verse form separately.
- Preserve Greek/Hebrew/Aramaic script and normalization.
- Do not create word-to-word alignments to user-pasted protected translations unless a validated alignment/right exists.
- Pronunciation remains disabled until an audio/convention source with documented rights is pinned.
- Latin may be added as translation/history context; it is not labeled as an original language.
- Derived data must keep this source commit, input blob hashes, transformer version/hash, generation date and CC BY 4.0 attribution.
- Do not publish TIPNR's AI-generated descriptive prose as if it were human-reviewed editorial evidence. Proper-name identity/reference data can be evaluated separately.

## Import gate
Before F6 lexical data becomes TESTADO:
1. write deterministic parsers for the pinned TSV formats;
2. recompute the Git blob hash of every downloaded source before parsing;
3. extract only fields required by NestLume;
4. test João 1 and representative Hebrew/Aramaic passages against the source;
5. record any normalization/transformation;
6. show user-facing STEP Bible attribution and CC BY 4.0 notice;
7. verify that the Bible-edition verse reference maps correctly to the tagged source tradition before claiming exact word alignment.
