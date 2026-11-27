// Gobble Dash entrypoint (Node 22, standard library only). The game lives in
// game/ as plain static files a desktop browser loads offline, and this
// program hands it in: it copies game/ and screenshots/ from beside this
// file into the output directory and writes dossier.json there with the
// vendored make.fun library. It writes nowhere else, uses no network, and
// two runs from any directory produce byte-identical output.
//
// Run it outside the grader with MAKEFUN_OUTPUT_DIR standing in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Start from a clean output directory so a stale screenshot or dossier from
// an earlier run can never leak into this one. Never remove the output
// directory itself: in the grader it is a mounted volume (/output), and
// removing a mount point throws EBUSY and fails the run. Clear only its
// contents instead.
mkdirSync(out, { recursive: true });
for (const child of readdirSync(out)) {
  rmSync(join(out, child), { recursive: true, force: true });
}
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The scorer's own caps: text_max_bytes shapes the dossier text; the rest
// refuse an entry the scorer would refuse (more than 4 screenshots or one
// over 256 KiB; more than 993 files in game/ or 48 MiB of game files in all,
// or a path under game/ over 1000 bytes). game/ shares /output's own
// 1000-entry cap with screenshots/ and dossier.json, so leave them room.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);

// Fail loudly instead of handing in a broken dossier: the file we just
// wrote must parse as JSON and name the dossier schema.
const dossier = JSON.parse(readFileSync(join(out, 'dossier.json'), 'utf8'));
if (dossier.schema !== 'makefun/dossier/v1') {
  throw new Error(`unexpected dossier schema: ${String(dossier.schema)}`);
}
