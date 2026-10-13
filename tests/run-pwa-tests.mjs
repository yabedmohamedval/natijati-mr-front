import { build } from 'esbuild';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const outfile = `${root}.angular/pwa-tests/status.mjs`;
await build({ absWorkingDir: root, entryPoints: ['tests/pwa-status.test.ts'], outfile,
  bundle: true, platform: 'node', format: 'esm', packages: 'external' });
for (const script of [`${root}tests/pwa-cache.test.mjs`, outfile]) {
  const result = spawnSync(process.execPath, [script], { stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) { process.exitCode = result.status ?? 1; break; }
}
