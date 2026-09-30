# F0 — Product contract and rights inventory

Status: **EM ANDAMENTO**  
Evidence date: 2026-09-30

## Budget and product boundary
- Additional authorized operating cost: **R$ 0**.
- No billing activation, Blaze migration, paid API, trial requiring future payment or overage-capable resource is authorized.
- Public Bible reading and local study state do not require login.
- Hub/organization integration is explicitly deferred; it is not needed for the public-reading core.

## Scripture corpus
### Approved prototype source
- Work: **Bíblia Livre (BLIVRE)**
- Distribution ID: `porbr2018` / `PORBLJ`
- Stated edition: 2018
- Copyright: © 2018 Diego Santos, Mario Sérgio and Marco Teles
- Current distribution source: https://ebible.org/porbr2018/
- Current distribution license statement: **Creative Commons Attribution 4.0**
- Prototype passage source: https://ebible.org/porbr2018/JHN01.htm
- Prototype scope: João 1:1–18 only
- Transformation in prototype: verse segmentation into typed data; wording preserved.
- Attribution is visible from the reader.

### Material conflict recorded
The historical `blivre/BibliaLivre` source repository README/LICENSE still identifies CC BY 3.0 Brazil, while the current eBible distribution identifies CC BY 4.0. The repository also contains multiple generated textual traditions (`tr`, `n4`, `geral`). Therefore NestLume does **not** silently treat that Git repository as byte-identical to the current `porbr2018` eBible export.

### Full-corpus gate
The full Bible is not yet marked imported. The official eBible VPL/USFM binary URLs were verified, but this execution environment could not retrieve their ZIP bytes. Before F4 can be accepted, import must pin the exact official artifact, compute SHA-256, record retrieval date, verify 66 books / 1,189 chapters / expected verse inventory for that edition, and retain required attribution/license metadata.

## Protected translations
NAA, NVI, NVT and other protected editions are not bundled. Availability in an API, website or source repository is not treated as distribution authorization.

Pasted text may carry a user-supplied version label. It remains private input and is not used to reconstruct a shared protected corpus.

## Original-language and lexical data
Candidate: STEPBible datasets, which are distributed under dataset-specific notices. No lexical dataset is bundled in this batch. The prototype explicitly labels its Greek panel as incomplete until an approved dataset is imported. Do not infer word alignment for pasted text.

## Typography
This batch uses operating-system font stacks only. No font files or font CDN are bundled, avoiding an unverified font-license artifact and preserving offline behavior.

## Images/maps
No external image or map dataset is bundled in this batch.

## Software
Runtime dependencies are ordinary npm packages listed in `package.json`. Dependency-license auditing is a CI/release gate before public production publication.

## Editorial reviewers
No human editorial reviewer is invented here. Named reviewers/responsible people must be recorded only when the owner assigns real people.

## F0 exit status
Not yet **TESTADO/CONCLUÍDO**, because the full BLIVRE artifact and all future lexical/media sources have not been imported and hashed. The rights model for the first clickable prototype is resolved.
