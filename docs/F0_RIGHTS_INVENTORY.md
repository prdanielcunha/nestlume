# F0 — Product contract and rights inventory

Status: **EM ANDAMENTO**  
Evidence date: 2026-09-30

## Budget and product boundary
- Additional authorized operating cost: **R$ 0**.
- No billing activation, Blaze migration, paid API, trial requiring future payment or overage-capable resource is authorized.
- Public Bible reading and local study state do not require login.
- Hub/organization integration is deferred; it is not needed for the public-reading core.

## Scripture corpus — imported and integrity-gated
### Exact corpus used by NestLume
- Work: **Bíblia Livre (BLIVRE)**
- Upstream repository: `blivre/BibliaLivre`
- Pinned release: **2018.2.0**, published 25/02/2018
- Imported source directory: `textos/f4/tr`
- Textual tradition label in that release: **Textus Receptus**
- Copyright stated by the project: © Diego Santos, Mario Sérgio e Marco Teles
- License attached to this exact pinned release: **Creative Commons Atribuição 3.0 Brasil**
- NestLume path: `public/corpus/blivre/2018.2.0/tr/`
- Imported book files: **66**
- Verified chapter count: **1,189**
- Verified verse-record count for this pinned corpus: **31,102**
- Import date: 2026-09-30
- Integrity manifest: `public/corpus/blivre/2018.2.0/manifest.json`
- Upstream license preserved verbatim: `public/corpus/blivre/2018.2.0/LICENCA_UPSTREAM.md`
- Upstream README preserved: `public/corpus/blivre/2018.2.0/README_UPSTREAM.md`

Each raw source file is preserved byte-for-byte as imported from the pinned release and recorded with its upstream Git object hash (`git-blob-sha1`). `scripts/build-corpus.mjs` recomputes that Git object hash from the local bytes before generating any runtime catalog/index. A mismatch fails the build.

The generated reader data does not invent Bible verses: it parses the release's own `\v Book.chapter.verse` records and removes formatting/footnote control markup for display. Added-word markup preserves the underlying words.

### Current eBible distribution is a separate provenance record
The current eBible `porbr2018` distribution identifies Bíblia Livre 2018 and states CC BY 4.0. The historical authors' GitHub release used for NestLume states CC BY 3.0 Brasil and contains several textual output traditions. NestLume therefore does **not** claim that the two distributions are byte-identical or interchange their licenses. The actual bundled corpus is governed and attributed according to the exact pinned source above.

## Protected translations
NAA, NVI, NVT and other protected editions are not bundled. Availability in an API, site, app or repository is not treated as distribution authorization.

Pasted text may carry a user-supplied version label. It remains private/local by default and is not used to reconstruct a shared protected corpus.

## Original-language and lexical data
Candidate source: **STEPBible Data**, whose repository currently states CC BY 4.0 and requires attribution to STEP Bible. The relevant datasets include TAGNT/TAHOT, TBESG/TBESH and TIPNR. They are not yet bundled in NestLume. Until the exact subset, commit/hash and transformations are pinned, the interface must not claim exhaustive word alignment or authoritative lexical coverage.

## Typography
The current implementation uses operating-system font stacks only. No font files or font CDN are bundled.

## Images/maps
No external image or map dataset is bundled in the current implementation.

## Software
Runtime dependencies are pinned in `package.json`/`package-lock.json`. CI runs install, TypeScript checking, tests, corpus integrity and production build. A separate dependency-license report is still a release gate before production.

## Editorial reviewers
No human editorial reviewer is invented. The João 1 study is explicitly labeled **rascunho editorial** in-product. Assigning and recording a real reviewer remains necessary before F5 can satisfy its review criterion.

## F0 exit status
The Scripture-rights/integrity portion is implemented and automatically verified. F0 remains **EM ANDAMENTO** because future lexical/media datasets still need exact import inventories and a real editorial reviewer must be assigned before reviewed studies can be published.
