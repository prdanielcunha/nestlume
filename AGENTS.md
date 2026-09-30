# NestLume — Agent Operational Contract

## Purpose
NestLume is a local-first Bible reading and study PWA. Scripture is central; contextual, historical, lexical, interpretive and pastoral layers must be distinguishable and sourced.

## Required reading before changes
1. `README.md`
2. `docs/ARCHITECTURE.md`
3. `docs/F0_RIGHTS_INVENTORY.md`
4. `docs/F1_AI_FEASIBILITY.md`
5. `docs/ROADMAP_STATUS.md`
6. The product master guide and roadmap supplied by the product owner when available.

## Permanent constraints
- Additional operating cost: R$ 0 unless the product owner explicitly changes the budget.
- Do not enable billing, Blaze, paid trials, overage-capable resources or paid APIs.
- Do not expose secrets in browser code, logs, CI output or the repository.
- Do not call static/prewritten content “AI”. AI features remain fail-closed until F1 is approved.
- Do not incorporate protected Bible translations without documentary distribution rights for the intended use.
- Pasted user text is private by default and must not silently enter shared indexes, public caches, telemetry or model training pipelines.
- Never invent sources, quotations, page numbers, lexical meanings, archaeological certainty or theological consensus.
- Preserve distinctions: Scripture / context / interpretation / inference / application.
- PT/EN/ES applies to product interface and accessibility, not to Bible-edition availability.
- Public reading must not depend on login. Hub integration is a separate, later security project.

## Architecture
- React + TypeScript + Vite PWA.
- Static versioned editorial content and Bible packages.
- Browser-local persistence for personal state; no Firestore dependency in the public-reading core.
- Firebase Hosting on an isolated Spark project when infrastructure access exists.
- `main` = development/integration. `production` = verified published code only.

## Testing gates
Before promotion: `npm install`, `npm run lint`, `npm test`, `npm run build`. Run relevant content-integrity, reference-parser, privacy and PWA tests as those modules land.

## Change discipline
Small scoped branches, no destructive history rewrites, no force-push, no weakening branch protections, no incidental changes to other MillionsNest apps.
