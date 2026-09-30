# NestLume — maintenance and rollback

Effective: 2026-09-30

## Normal change path
1. Work lands on `main`.
2. CI validates source, rights/data integrity, build, browsers, offline, AI adapter syntax and secret rejection.
3. Only a green exact SHA may advance `production`.
4. `production` advances by fast-forward; never force-update to hide history.
5. Public deployment is tied to the exact approved SHA and recorded independently of branch state.

## Code rollback
Do not force `production` backwards.

If a released change must be undone:
1. identify the last known-good release SHA and the offending change;
2. create a revert/restoration commit on `main`;
3. run the full CI gate;
4. fast-forward `production` to the green restoration commit;
5. deploy that restoration build;
6. run public smoke tests and record the incident.

This keeps rollback history auditable.

## Data-source maintenance
For Bible/original-language/entity/geography/cross-reference data:
- never follow an upstream moving branch at runtime;
- pin commit/file identity before import;
- verify byte size/hash before parsing;
- record license/attribution and transformations;
- regenerate derived packages deterministically;
- fail the build if expected whole-canon coverage unexpectedly disappears;
- surface versification/alignment gaps rather than shifting references silently.

## Editorial maintenance
- draft, reviewed and published are distinct states;
- only a real identified human reviewer may move content into reviewed/published state;
- source changes invalidate dependent editorial claims for re-review;
- corrections create a new version rather than silently rewriting previously referenced conclusions.

## AI maintenance
Before changing provider/model:
- re-check service terms, age rules, privacy/retention, commercial use and model license;
- re-run the Portuguese F1 battery against the real endpoint;
- keep keys/bindings server-side;
- validate quota exhaustion and anti-abuse before inference;
- never make Bible reading/notebook/offline depend on live AI.

If AI becomes unsafe, incompatible or quota-exhausted, disable inference and keep the grounded offline/editorial product operational.

## Privacy
- pasted text and notebook data are private by default;
- pasted content is never encoded into URLs;
- third-party AI processing requires explicit disclosure and consent;
- no private content is added to public editorial datasets automatically;
- logs/telemetry must not capture pasted passages or notebook text.

## Infrastructure incident boundary
Do not change MillionsNest root DNS, MX/SPF/DKIM/DMARC, nameservers or unrelated subdomains as part of a NestLume rollback. Only the exact NestLume records may be changed after authoritative-zone verification.
