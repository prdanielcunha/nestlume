# F1 — AI feasibility gate

Status: **TESTADO / IMPLEMENTADO COM CLOUDFLARE WORKERS AI**  
Evidence date: 2026-10-01

NestLume treats AI as a real product capability, not a label for static studies. The live provider is Cloudflare Workers AI through the server-side `nestlume-ai` Worker.

## Exit evidence

The F1 candidate moved from documentary approval to real execution:

- authorized Cloudflare account and Workers AI binding are active;
- no provider credential is shipped to the browser;
- the official NestLume origin is enforced server-side;
- explicit processing consent is required in the UI;
- pasted text requires separate explicit consent;
- Cloudflare Turnstile is verified before public inference;
- public inference has a server-side rate-limit binding;
- provider/quota/protection failures fail closed while the Bible/local notebook continue working;
- production deployment executes the Portuguese live battery against the real Worker before Firebase Hosting publication;
- output claims must cite evidence IDs that exist in the request;
- semantic guards cover known hallucination patterns found during editorial inspection;
- pinned Greek/Hebrew evidence can enter the live battery from the STEPBible-derived packages.

## Provider decision

Cloudflare Workers AI + Gemma 4 26B A4B remains the current zero-additional-cost implementation. The adapter remains provider-neutral so a future approved provider can replace it without rebuilding the reading/study UX.

Gemini remains outside the intended public teen-accessible path under the previously reviewed terms. A future paid OpenAI API adapter remains a separate migration decision and a ChatGPT consumer subscription is never treated as API credit.

## Quality battery

The release battery covers the original 20-case plan, including contextual explanation, identity confusion, symbolism overreach, Greek/Hebrew, invalid reference, false quotation, undocumented custom, theological disagreement, unknown/pasted translations, prompt injection, missing source, archaeology uncertainty, textual-variant limits, personal prophecy, teen-safe explanation, Portuguese quality and claim/evidence structure.

The battery now distinguishes:

- `awaiting-human-review`: structurally and semantically accepted by automated gates, but not a human doctrinal seal;
- `semantic-fail`: output matched a known unsupported-content guard;
- `structural-fail`: response contract/evidence linkage invalid;
- `http-error` / `transport-error`: provider or transport failure;
- `local-gate`: behavior validated before any provider call;
- `blocked`: a requested feature lacks sufficient pinned evidence and is intentionally unavailable.

Textual-variant analysis remains a deliberate blocked fixture until a suitable licensed/pinned evidence source is integrated. That is fail-closed behavior, not a missing generic Bible-reading capability.

## Grounding policy

The user's question is a request, not evidence. The model must not use its own latent knowledge to add Greek/Hebrew, etymology, manuscript facts, archaeology, dates, customs, authorship, quotations or denominational labels unless the request's evidence bundle explicitly contains them.

Every returned factual claim must reference existing evidence IDs. The narrative answer is constrained to synthesize those claims. Invalid model output is rejected by the Worker.

## Cost and availability boundary

The product does not enable automatic paid overage. When the free inference allocation or a protection limit is unavailable, generation stops and the UI tells the user to try later. Scripture reading, downloaded books, contextual data already packaged in the PWA and local notebook remain independent of AI availability.

## Remaining human work is not an F1 infrastructure blocker

F1 verifies technical/provider feasibility. Human doctrinal approval of hand-authored editorial studies belongs to F5, and real-device/human-reader acceptance belongs to F10. Those human gates are intentionally not fabricated by automation.
