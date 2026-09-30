# F1 — AI feasibility gate

Status: **EM ANDAMENTO / CANDIDATO CLOUDFLARE APROVADO DOCUMENTALMENTE, TESTE REAL PENDENTE**  
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
| Cloudflare Workers AI + Gemma 4 26B A4B | Workers Free currently includes 10,000 Neurons/day; excess operations fail instead of generating paid overage on the Free plan. Cloudflare states Workers AI Customer Content is not used to train AI models or improve Cloudflare/third-party services without explicit consent. Gemma 4 is Apache-2.0 and Cloudflare currently lists this model as available on Workers Free. | **Approved as the F1 implementation candidate; not yet production-tested**. |

## Cloudflare documentary gate
The current Workers AI service documents do not contain the Google-style prohibition against using the inference API inside an application likely to be accessed by under-18s. Cloudflare's Self-Serve terms place responsibility for Customer Content, necessary permissions and End User compliance on the customer. Cloudflare's general privacy policy separately says Cloudflare's own Websites and Services are not designed to attract under-18s; it also distinguishes customer websites/apps and their End Users. This is therefore not treated as permission to ignore Brazilian child/teen rules: NestLume must implement applicable ECA Digital/LGPD age, notice and data-minimization controls.

Cloudflare passes the current documentary architecture/cost/privacy gate for an F1 candidate because:
1. Workers Free provides 10,000 Neurons/day and the documented Free-plan behavior fails closed after the free allocation rather than billing overage.
2. Workers AI Customer Content is not used to train models or improve Cloudflare/third-party services without explicit consent.
3. Gemma 4 26B A4B remains listed as available on Workers Free and its upstream license is Apache-2.0.
4. The NestLume adapter uses a server-side AI binding and configures no KV/R2/D1/Durable Object prompt storage.

It is **not yet TESTADO for production** because a real Cloudflare account/binding is not available to this session and the 20-case Portuguese battery has not run against the actual model. Static documentation cannot substitute for inference evidence.

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


## Future paid migration
### OpenAI API
A future OpenAI API provider is structurally compatible with the NestLume adapter. OpenAI's current API guidance explicitly addresses applications serving people under 18 and requires additional safeguards, age-appropriate disclosures/content protections, applicable age assurance, and child/privacy-law compliance. Processing personal data from children under 13 or the applicable digital-consent age requires Zero Data Retention first. This makes OpenAI API a plausible future paid route, subject to revalidation of terms, retention, pricing and safeguards at migration time.

A ChatGPT Plus/Pro subscription is not an API backend or API credit and must never be automated as the NestLume inference service.

### Google Gemini / Vertex AI
Paying for Google Cloud does **not** currently remove the age restriction relevant to NestLume. Current Google Cloud Generative AI service terms prohibit customers and End Users from using a Generative AI Service as part of an application likely to be accessed by people under 18. Therefore paid Gemini/Vertex AI remains blocked for the intended general-audience NestLume unless Google's terms change or the product audience is legitimately re-scoped with compliant age assurance.

Because the NestLume frontend speaks to a provider-neutral server-side contract, switching providers later does not require rebuilding the reading/study UX.
