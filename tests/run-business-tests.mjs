// Uses Node's test runner and the esbuild already installed by Angular; no Karma changes.
import { build } from 'esbuild';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const outfile = `${root}.angular/business-tests/public-journeys.test.mjs`;
await build({
  absWorkingDir: root,
  entryPoints: ['tests/public-journeys.test.ts'],
  outfile,
  bundle: true,
  platform: 'node',
  format: 'esm',
  packages: 'external',
  sourcemap: 'inline'
});
const result = spawnSync(process.execPath, [outfile], { stdio: 'inherit' });
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
