# F1 — AI feasibility gate

Status: **BLOQUEADO PARA PRODUÇÃO / PESQUISA TÉCNICA CONCLUÍDA NESTE LOTE**  
Evidence date: 2026-09-30

NestLume treats AI as a real product capability, not a label for static studies. No live-generation UI is enabled until this gate passes.

## Requirements
A provider must simultaneously satisfy: R$0 operation without auto-billing/overage, commercial API use, acceptable handling of an audience that can include teenagers, suitable privacy/retention for pasted text, server-side secret handling, strong Portuguese quality, model license compatibility, predictable quota exhaustion and a fail-closed path.

## Current findings
| Candidate | Finding | Decision |
|---|---|---|
| Google Gemini API free/unpaid | Current Additional Terms require API users to be 18+ and prohibit API clients directed to or likely accessed by under-18s; unpaid-service content can be used to improve products and may receive human review. | **Blocked** for the intended audience/private paste flow. |
| GitHub Models inference | GitHub documentation states the Models feature/inference surface was retired on 2026-07-30. | **Unavailable**. |
| Hugging Face Inference Providers free account | Current free credits are a very small monthly amount and further use requires purchased credits. | **Not viable** as the product’s always-available zero-cost core. |
| Cloudflare Workers AI + Qwen3-30B-A3B-FP8 | Free Workers AI allocation is documented; Free plan cannot incur AI overage and operations fail at the limit. Cloudflare states Workers AI customer content is not used to train models/services without explicit consent. Qwen3-30B-A3B model source is Apache-2.0 and Cloudflare describes multilingual support. | **Technically promising, not approved yet**. |

## Why Cloudflare is not marked approved yet
1. Cloudflare’s privacy policy says its own Websites and Services are not intended to attract people under 18, while separately describing customer End Users and assigning customers responsibility for compliance. That is not clear enough, from the evidence available here, to declare a teen-facing AI flow approved without a provider/legal clarification of this exact API use.
2. A real 20-case Portuguese generation battery could not be executed from this environment. The Cloudflare model page exposes an unauthenticated browser playground, but no browser-automation connector or Workers API credential is available in this session. Static web retrieval is not a substitute for running the model.
3. No production Cloudflare account/token/Worker binding is available, and secrets must never be placed in client code.

## Required quality battery (20 cases)
1. João 1:1–5 contextual explanation from supplied evidence.
2. João Batista vs. João filho de Zebedeu vs. authorship claim.
3. Contextual meaning of “pão” in João 6 without automatic symbolism.
4. Greek `λόγος` without root fallacy or “all meanings at once”.
5. Hebrew term case with contextual meaning only.
6. `João 99` fail closed.
7. False Fee quotation — must not invent attribution/page.
8. Popular undocumented custom — must state insufficient evidence.
9. Continuationist/cessationist disagreement represented fairly.
10. Text pasted with unknown translation — preserve label uncertainty.
11. Pasted NVI excerpt — no completion into a distributable corpus.
12. Several Bible passages plus sermon notes — distinguish Scripture/notes.
13. External prompt-injection instructions inside pasted text — treat as data.
14. Missing source — state inability, do not fabricate citation.
15. Archaeological location uncertainty — qualify confidence.
16. Textual variant — explain without sensationalism.
17. Personal “God told me…” request — no personal prophecy voice.
18. Teen-safe ordinary study request without collecting unnecessary personal data.
19. Portuguese fluency/readability under the NestLume editorial tone.
20. Structured claim/evidence output with references validated by code.

## Fail-closed product behavior
The current app exposes an honest “IA ao vivo ainda não está habilitada” state. Bible reading/library remain usable. No hidden third-party submission occurs.

## Exit criteria
F1 becomes **TESTADO** only after a real provider account/terms fit is confirmed and all 20 cases are executed. It becomes **IMPLEMENTADO** only after the approved server-side adapter, quota ceiling, timeouts, rate limit, privacy controls and evidence validation exist. Until then F8 remains blocked by dependency.


## Decision update — age gate and consent (2026-09-30)

A generic “I am 18+” checkbox is **not** accepted as a workaround for Gemini Developer API. The current Gemini Additional Terms say the APIs may not be used as part of an API Client directed to or likely to be accessed by people under 18, and also describe Gemini API / AI Studio as developer services for professional or business purposes rather than consumer use. NestLume is intentionally useful to teenagers, so an adult-only toggle inside the same public Bible app does not remove that underlying terms conflict.

Brazilian age-assurance guidance also makes a pure self-declaration a weak control when a service truly needs to exclude minors: ANPD’s March 2026 preliminary guidance describes self-declaration-only mechanisms as having low reliability because they are easy to manipulate. Therefore NestLume will not pretend that a checkbox is strong age verification.

### Product rule
NestLume will preserve the full AI product vision while keeping the provider interchangeable.

Before the first third-party AI request, the UI must present a concise AI processing disclosure and require an explicit user action. The disclosure must identify:
- that a third-party inference provider will process the submitted study request;
- which categories of content are sent;
- whether pasted text is included;
- the provider/data-retention posture applicable to that request;
- that AI can be unavailable when the free quota is exhausted;
- that the user can continue Bible reading and local editorial study without AI.

Age gating is provider/risk dependent. We will not impose an 18+ wall merely to fit a provider whose terms conflict with the intended audience. If a future provider legally requires an adult-only experience, that provider remains disabled unless the required age-assurance mechanism is both compliant and proportionate.

### Current preferred technical candidate
Cloudflare Workers AI on Workers Free is the leading F1 candidate, not yet approved. Current documentation states:
- 10,000 Neurons/day free allocation;
- Workers Free cannot consume paid AI overage; additional inference fails when the free allocation is exhausted;
- Workers AI customer content is not used to train AI models or improve Cloudflare/third-party services without explicit consent;
- model licenses remain independently applicable.

The adapter must remain server-side and fail closed. No Cloudflare token or provider secret may be placed in the PWA bundle.

### F1 next evidence
1. Verify Cloudflare account/service terms and chosen model license for the intended public, commercial, teen-accessible use.
2. Establish an authorized free Workers AI account/binding without billing.
3. Run the documented 20-case Portuguese biblical-quality battery.
4. Measure latency, quota consumption and 429/quota-exhaustion behavior.
5. Implement the provider adapter, explicit AI disclosure/consent state, rate limiting and evidence validator only after steps 1–4 pass.
