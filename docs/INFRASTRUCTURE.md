# Infrastructure, cost and publication gate

Evidence date: 2026-09-30

## Required production shape
- Firebase Hosting, not Vercel.
- Isolated Firebase project/site for NestLume.
- Spark/no-cost plan only.
- No linked billing account, Blaze upgrade, paid trial or overage-capable resource.
- Custom domain target: `nestlume.millionsnest.com`.
- No change to nameservers, registrar, root domain, mail, MX, SPF, DKIM, DMARC or unrelated subdomains.

## Current Firebase cost evidence
Official Firebase documentation reviewed on 2026-09-30 states:
- Spark is a no-cost plan and does not require a payment method.
- Firebase Hosting provides no-cost storage up to 10 GB.
- The Hosting usage/quota documentation states no-cost data transfer up to 10 GB/month; when a non-Blaze project exceeds that quota, Hosting is disabled after a short grace period until the next month rather than billing automatically.
- The general Firebase pricing table simultaneously displays a 360 MB/day Hosting transfer figure. Because official pages are not perfectly aligned, NestLume must use the stricter observed/project-console quota as the operational guard and must not infer unlimited free capacity.
- Custom domain + SSL are supported by Hosting.

Authoritative references:
- https://firebase.google.com/pricing
- https://firebase.google.com/docs/hosting/usage-quotas-pricing

## Current access inventory
Available in this session:
- GitHub connector with admin/push access to `prdanielcunha/nestlume`.
- Public web verification.

Not available in this session:
- Firebase/Google Cloud project-management connector or authenticated Firebase CLI session.
- DNS-zone write connector for the authoritative provider.
- Cloudflare account connector/token.
- A browser automation connector capable of signing into Firebase/Cloudflare consoles.

The plugin catalog was searched for Firebase/Google Cloud/Cloudflare DNS access and no suitable installed write integration was available.

## Consequence
No Firebase project/site has been created or modified by this batch. No DNS record has been added, deleted or changed. `firebase.json` intentionally has no `.firebaserc` project binding, preventing accidental deployment to another MillionsNest Firebase project.

## Publication gate
F11 remains blocked until authenticated infrastructure access can:
1. enumerate existing Firebase projects/sites and billing state;
2. create or select an isolated Spark project/site without billing;
3. deploy the exact approved build;
4. request the exact Firebase custom-domain verification/routing records;
5. read the authoritative DNS zone and confirm `nestlume` has no conflicting record;
6. write only the required `nestlume`/verification records;
7. verify DNS propagation, certificate issuance and HTTPS;
8. run public smoke tests;
9. record the release and rollback target.

No production URL will be claimed before all nine steps have evidence.
