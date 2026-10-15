import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

const dir = 'dist/national-exams-frontend/browser';
const source = readFileSync('src/environments/environment.ts', 'utf8');
const apiUrl = source.match(/apiUrl:\s*['"]([^'"]+)['"]/)?.[1];
assert.ok(apiUrl, 'Production API URL must be explicitly defined');
const url = new URL(apiUrl);
assert.equal(url.protocol, 'https:');
assert.ok(url.hostname.endsWith('.run.app'), 'Expected a Cloud Run production API');
assert.equal(url.pathname, '/api');
assert.match(source, /production:\s*true/);
const config = JSON.parse(readFileSync('angular.json', 'utf8'));
const prod = config.projects['national-exams-frontend'].architect.build.configurations.production;
assert.ok(!prod.fileReplacements?.some(r => r.replace === 'src/environments/environment.ts'),
  'Review production environment replacement before deployment');
const scripts = readdirSync(dir).filter(name => name.endsWith('.js'))
  .map(name => readFileSync(`${dir}/${name}`, 'utf8')).join('\n');
assert.ok(scripts.includes(apiUrl), 'Cloud Run API URL missing from the production bundle');
assert.deepEqual(JSON.parse(readFileSync(`${dir}/ngsw.json`, 'utf8')).dataGroups, []);
console.log('Production Cloud Run API and empty PWA dataGroups verified.');
