import fs from 'node:fs';

const lock = JSON.parse(fs.readFileSync('package-lock.json', 'utf8'));
const allowedLicenses = new Set([
  'MIT',
  'Apache-2.0',
  'ISC',
  'BSD-3-Clause',
  'CC-BY-4.0',
]);

const packages = [];
const missing = [];
const unexpected = [];

for (const [packagePath, metadata] of Object.entries(lock.packages ?? {})) {
  if (!packagePath) continue;

  const name = packagePath.replace(/^node_modules\//, '');
  const record = {
    name,
    version: metadata.version ?? null,
    license: metadata.license ?? null,
    resolved: metadata.resolved ?? null,
  };
  packages.push(record);

  if (!record.license) missing.push(record);
  else if (!allowedLicenses.has(record.license)) unexpected.push(record);
}

packages.sort((a, b) => a.name.localeCompare(b.name));

const counts = packages.reduce((acc, item) => {
  const key = item.license ?? 'MISSING';
  acc[key] = (acc[key] ?? 0) + 1;
  return acc;
}, {});

const report = {
  generatedFrom: 'package-lock.json',
  packageVersion: lock.version,
  packageCount: packages.length,
  allowedLicenses: [...allowedLicenses].sort(),
  counts,
  missing,
  unexpected,
  packages,
};

fs.mkdirSync('artifacts', { recursive: true });
fs.writeFileSync('artifacts/dependency-licenses.json', JSON.stringify(report, null, 2) + '\n');

console.log(JSON.stringify({
  packageVersion: report.packageVersion,
  packageCount: report.packageCount,
  counts: report.counts,
  missing: missing.length,
  unexpected: unexpected.length,
}, null, 2));

if (missing.length || unexpected.length) {
  console.error('Dependency license gate failed. Review artifacts/dependency-licenses.json.');
  process.exit(1);
}
