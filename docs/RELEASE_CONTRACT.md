# NestLume release contract

Effective date: 2026-09-30

## Branches
- `main`: current integrated development/homologation line.
- `production`: exact code approved for production delivery. It must only advance by fast-forward to a commit that already passed the full release CI on `main`.

The branches may intentionally point to the same commit after a release approval. Branch synchronization is **code state**, not proof that Firebase or the custom domain has been published.

## Publication evidence
A release is marked `PUBLICADO` only after all of these are evidenced for the same approved commit:
1. exact Firebase project/site identified;
2. Spark/no-billing state verified;
3. exact build deployed;
4. custom-domain records requested by Firebase confirmed;
5. authoritative DNS checked for conflicts and only required NestLume records changed;
6. DNS propagation verified;
7. valid HTTPS certificate verified;
8. public smoke tests run against `https://nestlume.millionsnest.com`;
9. rollback target recorded.

If infrastructure credentials are unavailable, `production` may be synchronized as the approved release code when explicitly requested by the owner, but the deployment status remains `BLOQUEADO`, never `PUBLICADO`.

## Release gate before synchronization
The target commit must have a successful NestLume CI run covering:
- TypeScript checks;
- unit/data integrity tests;
- dependency-license allowlist;
- deterministic production build;
- desktop/mobile Chromium smoke;
- offline verified-book test;
- AI Worker and F1-battery syntax;
- secret-like file rejection.

No force update is allowed for `production`.
