import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(readFileSync(path.join(root, 'BOLUM_ESLESME.json'), 'utf8'));
const faults = [];
if (manifest.chapters.length !== 70) faults.push(`70 yerine ${manifest.chapters.length} bölüm`);
const nums = manifest.chapters.map((x) => x.number);
if (nums.some((n, i) => n !== i + 1)) faults.push('Bölüm numaraları sıralı değil');
const allFiles = (folder) => {
  if (!existsSync(folder)) return [];
  return readdirSync(folder).flatMap((item) => {
    const itemPath = path.join(folder, item);
    return statSync(itemPath).isDirectory() ? allFiles(itemPath) : [itemPath];
  });
};
for (const chapter of manifest.chapters) {
  const dir = path.join(root, chapter.chapter);
  if (!existsSync(path.join(dir, 'README.md'))) faults.push(`README eksik: ${chapter.number}`);
  if (chapter.code_blocks && !existsSync(path.join(dir, 'kod_ornekleri.md'))) faults.push(`Örnekler eksik: ${chapter.number}`);
  for (const example of chapter.complete_examples) {
    if (!existsSync(path.join(dir, 'code', example))) faults.push(`Kod dosyası eksik: ${chapter.number}, ${example}`);
  }
}
const initial = path.join(root, '00_Baslangic_Movie_API', 'code', 'movie-api');
if (!existsSync(path.join(initial, 'package.json'))) faults.push('Birinci kitap final projesi eksik');

let checked = 0;
for (const group of [initial, path.join(root, '00_Kontrol_Noktalari'), ...manifest.chapters.map((c) => path.join(root, c.chapter, 'code'))]) {
  for (const file of allFiles(group).filter((x) => x.endsWith('.js') || x.endsWith('.mjs'))) {
    checked++;
    const proc = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
    if (proc.status !== 0) faults.push(`JavaScript sözdizimi: ${path.relative(root, file)}: ${proc.stderr.trim().slice(0, 180)}`);
  }
}
for (const milestone of allFiles(path.join(root, '00_Kontrol_Noktalari')).filter((x) => x.endsWith('.js'))) {
  const src = readFileSync(milestone, 'utf8');
  const expressions = [...src.matchAll(/(?:from|import)\s+["'](\.[^"']+)["']/g)];
  for (const match of expressions) {
    const p = path.resolve(path.dirname(milestone), match[1]);
    if (!existsSync(p)) faults.push(`Yerel import eksik: ${path.relative(root, milestone)} → ${match[1]}`);
  }
}
if (faults.length) {
  console.error(`BAŞARISIZ — ${faults.length} sorun:`);
  for (const fault of faults) console.error(`- ${fault}`);
  process.exitCode = 1;
} else {
  console.log(`TAMAM — 70 bölüm, ${checked} JavaScript dosyası, dört aşama ve yerel import bağlantıları kontrol edildi.`);
  console.log('Bu kontrol, gerçek MongoDB/HTTP entegrasyon testi değildir.');
}
