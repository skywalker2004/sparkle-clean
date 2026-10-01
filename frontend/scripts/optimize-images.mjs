/**
 * One-time image optimization script.
 * Reads every .jpg in src/components/images/, resizes to max-width 800px,
 * re-encodes as WebP at quality 78, and writes a .webp alongside the original.
 * Run once: node scripts/optimize-images.mjs
 */
import sharp from "sharp";
import { readdir, stat } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dir = dirname(fileURLToPath(import.meta.url));
const imgDir = join(__dir, "../src/components/images");

const files = (await readdir(imgDir)).filter((f) => f.endsWith(".jpg"));

let totalBefore = 0;
let totalAfter = 0;

for (const file of files) {
  const src = join(imgDir, file);
  const dest = join(imgDir, file.replace(/\.jpg$/, ".webp"));
  const before = (await stat(src)).size;
  totalBefore += before;

  await sharp(src)
    .resize({ width: 800, withoutEnlargement: true })
    .webp({ quality: 78 })
    .toFile(dest);

  const after = (await stat(dest)).size;
  totalAfter += after;

  const saving = Math.round((1 - after / before) * 100);
  console.log(
    `${file.padEnd(45)} ${Math.round(before / 1024)}KB → ${Math.round(after / 1024)}KB  (-${saving}%)`
  );
}

console.log(
  `\nTotal: ${Math.round(totalBefore / 1024)}KB → ${Math.round(totalAfter / 1024)}KB  (-${Math.round((1 - totalAfter / totalBefore) * 100)}%)`
);
