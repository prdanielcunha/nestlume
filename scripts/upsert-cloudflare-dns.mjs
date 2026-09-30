import fs from 'node:fs';

const token = process.env.CLOUDFLARE_API_TOKEN || process.env.CF_API_TOKEN || '';
const zoneName = process.env.CLOUDFLARE_ZONE_NAME || 'millionsnest.com';
const evidencePath = process.env.FIREBASE_CUSTOM_DOMAIN_JSON || 'artifacts/firebase-custom-domain.json';

if (!token) {
  console.log('CLOUDFLARE_DNS_AUTOMATION=unavailable:no-token');
  process.exit(0);
}

if (!fs.existsSync(evidencePath)) {
  console.error(`Firebase custom-domain evidence not found at ${evidencePath}`);
  process.exit(2);
}

const firebaseDomain = JSON.parse(fs.readFileSync(evidencePath, 'utf8'));

async function cf(path, options = {}) {
  const response = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    ...options,
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const body = await response.json().catch(() => null);
  if (!response.ok || !body?.success) {
    const errors = body?.errors?.map(error => error.message).join(' | ') || `HTTP ${response.status}`;
    throw new Error(errors);
  }
  return body;
}

const zones = await cf(`/zones?name=${encodeURIComponent(zoneName)}&status=active&per_page=5`);
const zone = zones.result?.find(item => item.name === zoneName);
if (!zone?.id) {
  console.log(`CLOUDFLARE_DNS_AUTOMATION=unavailable:zone-not-accessible:${zoneName}`);
  process.exit(0);
}

const desiredCnames = (firebaseDomain.requiredDnsUpdates?.desired || [])
  .flatMap(group => group.records || [])
  .filter(record => record.requiredAction === 'ADD' && record.type === 'CNAME');

const desiredTxt = (firebaseDomain.cert?.verification?.dns?.desired || [])
  .flatMap(group => group.records || [])
  .filter(record => record.requiredAction === 'ADD' && record.type === 'TXT');

async function listRecords(type, name) {
  const result = await cf(`/zones/${zone.id}/dns_records?type=${encodeURIComponent(type)}&name=${encodeURIComponent(name)}&per_page=100`);
  return result.result || [];
}

async function ensureCname(record) {
  const name = record.domainName.replace(/\.$/, '');
  const content = record.rdata.replace(/\.$/, '');
  const existing = await listRecords('CNAME', name);
  const exact = existing.find(item => item.content?.replace(/\.$/, '') === content);

  if (exact) {
    if (exact.proxied) {
      await cf(`/zones/${zone.id}/dns_records/${exact.id}`, {
        method: 'PUT',
        body: JSON.stringify({ type: 'CNAME', name, content, ttl: 1, proxied: false }),
      });
      console.log(`CLOUDFLARE_DNS_UPDATED=CNAME:${name}:dns-only`);
    } else {
      console.log(`CLOUDFLARE_DNS_OK=CNAME:${name}`);
    }
    return;
  }

  if (existing.length) {
    const current = existing[0];
    await cf(`/zones/${zone.id}/dns_records/${current.id}`, {
      method: 'PUT',
      body: JSON.stringify({ type: 'CNAME', name, content, ttl: 1, proxied: false }),
    });
    console.log(`CLOUDFLARE_DNS_UPDATED=CNAME:${name}`);
    return;
  }

  await cf(`/zones/${zone.id}/dns_records`, {
    method: 'POST',
    body: JSON.stringify({ type: 'CNAME', name, content, ttl: 1, proxied: false }),
  });
  console.log(`CLOUDFLARE_DNS_CREATED=CNAME:${name}`);
}

async function ensureTxt(record) {
  const name = record.domainName.replace(/\.$/, '');
  const content = record.rdata;
  const existing = await listRecords('TXT', name);
  if (existing.some(item => item.content === content)) {
    console.log(`CLOUDFLARE_DNS_OK=TXT:${name}`);
    return;
  }

  await cf(`/zones/${zone.id}/dns_records`, {
    method: 'POST',
    body: JSON.stringify({ type: 'TXT', name, content, ttl: 1 }),
  });
  console.log(`CLOUDFLARE_DNS_CREATED=TXT:${name}`);
}

if (!desiredCnames.length) {
  console.log('CLOUDFLARE_DNS_NOTE=no-cname-add-requested');
}
if (!desiredTxt.length) {
  console.log('CLOUDFLARE_DNS_NOTE=no-cert-txt-add-requested');
}

for (const record of desiredCnames) await ensureCname(record);
for (const record of desiredTxt) await ensureTxt(record);

console.log(`CLOUDFLARE_DNS_AUTOMATION=success:zone:${zoneName}`);
