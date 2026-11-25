// The Copper Kettle v2 — hand-in builder (TypeScript, Node 22).
//
// Run from the repository root: `node main.ts`
//
// It assembles dist/ by copying game/ and screenshots/ into it, then
// writes dist/dossier.json with the vendored buildDossier, run on
// dist/ itself so the dossier describes exactly the files handed in.
// The dossier must equal what buildDossier writes from those two
// directories, byte for byte.
//
// The caps come from the competition's own gate (RULES.txt):
// the text at most 163,840 bytes, at most 4 screenshots of at most
// 262,144 bytes each, game/ at most 993 files and 48 MiB, and every
// path at most 1,000 bytes long.

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

const here = resolve(fileURLToPath(new URL('.', import.meta.url)));
const outDir = join(here, 'dist');

function main() {
  const gameDir = join(here, 'game');
  const shotsDir = join(here, 'screenshots');
  if (!existsSync(gameDir)) {
    throw new Error('main.ts: game/ is missing next to main.ts');
  }
  if (!existsSync(shotsDir)) {
    throw new Error('main.ts: screenshots/ is missing next to main.ts');
  }

  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });
  cpSync(gameDir, join(outDir, 'game'), { recursive: true });
  cpSync(shotsDir, join(outDir, 'screenshots'), { recursive: true });

  const dossier = buildDossier(outDir, CAPS);
  writeFileSync(join(outDir, 'dossier.json'), dossier);

  const decoded = new TextDecoder('utf-8').decode(dossier);
  const doc = JSON.parse(decoded) as { images?: unknown[]; text?: string; schema?: string };
  if (doc.schema !== 'makefun/dossier/v1') {
    throw new Error(`main.ts: unexpected dossier schema ${String(doc.schema)}`);
  }
  const imageCount = Array.isArray(doc.images) ? doc.images.length : 0;
  const sourceCount = ((doc.text || '').match(/^### game\//gm) || []).length;
  console.log(
    `dist/ ready: game/ (${sourceCount} source files), ` +
    `screenshots/ (${imageCount} images), dossier.json (${dossier.length} bytes)`,
  );
}

main();
