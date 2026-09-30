# NestLume

NestLume is a premium, local-first Bible reading and study PWA for careful Scripture reading, contextual discovery and traceable sources.

## Current batch
This repository begins with the verified foundation/prototype slice: product-rights inventory, AI feasibility gate, editorial design system, mobile-first clickable reading flow, PT/EN/ES interface, honest unavailable states, BLIVRE João 1:1–18 sourced from eBible, a fail-closed reference parser and PWA shell.

AI generation is intentionally **disabled** until provider age/privacy/cost/model-license requirements and a real Portuguese quality battery pass. The app does not use the user’s ChatGPT subscription as an API and does not automate ChatGPT.

## Development
```bash
npm install
npm run check
npm run dev
```

## Hosting target
Firebase Hosting, isolated Spark project, no billing. The Firebase project/site and custom domain are not bound in source until the real project exists and access is verified.

## Branch contract
- `main`: development/integration
- `production`: only code that has passed release gates and is actually published

See `docs/ROADMAP_STATUS.md` for evidence-based status.
