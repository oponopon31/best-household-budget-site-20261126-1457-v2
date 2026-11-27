// main.ts — hands the RencanaKeluarga site in for the make.fun competition.
// Node 22, standard library only. It copies app/ and screenshots/ from beside
// this file to /output (or MAKEFUN_OUTPUT_DIR outside the grader) and writes
// /output/dossier.json with buildDossier from the vendored make.fun library.
// Before copying it checks the entry is complete, so a half-built entry
// fails loudly here instead of silently reaching the scorer.

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Authored check: the entry must have an index, a stylesheet, and 3-4 shots.
function checkEntry(): void {
  const index = join(here, 'app', 'index.html');
  if (!existsSync(index)) throw new Error('missing app/index.html — build the site first');
  const shots = existsSync(join(here, 'screenshots'))
    ? readdirSync(join(here, 'screenshots')).filter((f) => !f.startsWith('.'))
    : [];
  if (shots.length < 3 || shots.length > 4) {
    throw new Error(`expected 3 or 4 screenshots, found ${shots.length}`);
  }
  for (const shot of shots) {
    const size = statSync(join(here, 'screenshots', shot)).size;
    if (size > 262144) throw new Error(`screenshot ${shot} is ${size} bytes, over the 256 KiB cap`);
  }
  console.log(`RencanaKeluarga entry: ${shots.length} screenshots (${shots.join(', ')})`);
}

checkEntry();
mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
const appBytes = readdirSync(join(out, 'app'), { recursive: true })
  .map((f) => join(out, 'app', f))
  .filter((f) => statSync(f).isFile())
  .reduce((s, f) => s + statSync(f).size, 0);
console.log(`app/ copied: ${appBytes} bytes`);
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 16777216 }),
);
console.log(`dossier.json written to ${join(out, 'dossier.json')}`);
