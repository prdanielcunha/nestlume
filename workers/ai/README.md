# NestLume AI edge adapter

Status: source implementation only; **not deployed or production-approved** until F1 passes.

This Worker is intentionally separate from Firebase Hosting so the public Bible-reading core can remain on Firebase Spark while AI inference uses a server-side Cloudflare Workers AI binding.

## Safety boundaries
- No API token or model secret is sent to the browser.
- No KV, R2, D1, Durable Object or other prompt storage is configured.
- Only the configured NestLume origin is accepted in production.
- Every generation requires the current disclosure/consent version.
- Pasted text requires request-specific permission.
- Every request must include an evidence bundle.
- Quota exhaustion returns 429; Scripture/editorial features remain available.
- This source does not replace F1's real 20-case quality/safety battery or production rate limiting.

## Candidate model
`@cf/google/gemma-4-26b-a4b-it` is the F1 candidate because it is currently available on Workers Free and Gemma 4 is published under Apache-2.0. Revalidate model availability, license and Cloudflare terms immediately before deployment.


## Turnstile gate
Production configuration sets `REQUIRE_TURNSTILE=true`. The PWA receives only the public sitekey. The Worker secret must be added to the target Worker secret store as `TURNSTILE_SECRET`; never commit it or place it in a Vite variable.

The Worker calls Cloudflare Siteverify **before** `env.AI.run()`, validates the configured action and production hostname, and rejects missing/invalid/replayed tokens without spending AI inference quota.

For automated F1 staging only, Cloudflare publishes dedicated Turnstile test credentials. Use their test secret in the staging Worker and provide the dummy token through `NESTLUME_TURNSTILE_TOKEN` to `npm run ai:battery`. Never deploy test credentials to production.

A real production widget for `nestlume.millionsnest.com` must be created in the authorized Cloudflare account before F1 can become TESTADO.
