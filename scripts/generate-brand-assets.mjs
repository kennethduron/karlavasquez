import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

const root = process.cwd();
const sourceFavicon = path.join(root, "assets", "favicon.jpg");
const sourceOpenGraph = path.join(root, "assets", "opengraph.jpg");
const publicRoot = path.join(root, "public");
const imageRoot = path.join(publicRoot, "images", "knv");

await mkdir(imageRoot, { recursive: true });

async function createPaddedMark(size, padding, output) {
  const innerSize = size - padding * 2;
  return sharp(sourceFavicon)
    .trim({ background: "#ffffff", threshold: 10 })
    .resize(innerSize, innerSize, {
      fit: "contain",
      background: "#ffffff",
      kernel: sharp.kernel.lanczos3,
    })
    .extend({
      top: padding,
      bottom: padding,
      left: padding,
      right: padding,
      background: "#ffffff",
    })
    .png({ compressionLevel: 9, palette: size <= 32 })
    .toFile(output);
}

const favicon16 = path.join(publicRoot, "favicon-16x16.png");
const favicon32 = path.join(publicRoot, "favicon-32x32.png");

await Promise.all([
  createPaddedMark(16, 1, favicon16),
  createPaddedMark(32, 2, favicon32),
  createPaddedMark(180, 16, path.join(publicRoot, "apple-touch-icon.png")),
  createPaddedMark(192, 17, path.join(imageRoot, "icon-192.png")),
  createPaddedMark(512, 46, path.join(imageRoot, "icon-512.png")),
  sharp(sourceFavicon)
    .trim({ background: "#ffffff", threshold: 10 })
    .resize(104, 104, {
      fit: "contain",
      background: "#ffffff",
      kernel: sharp.kernel.lanczos3,
    })
    .extend({ top: 12, bottom: 12, left: 12, right: 12, background: "#ffffff" })
    .webp({ quality: 90, effort: 6 })
    .toFile(path.join(imageRoot, "navbar-brand-icon.webp")),
  sharp(sourceOpenGraph)
    .trim({ background: "#ffffff", threshold: 10 })
    .resize(1140, 570, {
      fit: "contain",
      background: "#ffffff",
      kernel: sharp.kernel.lanczos3,
    })
    .extend({ top: 30, bottom: 30, left: 30, right: 30, background: "#ffffff" })
    .jpeg({ quality: 90, mozjpeg: true })
    .toFile(path.join(imageRoot, "opengraph-1200x630.jpg")),
]);

const faviconBuffers = await Promise.all([
  sharp(favicon16).png().toBuffer(),
  sharp(favicon32).png().toBuffer(),
]);
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(faviconBuffers.length, 4);
const entries = Buffer.alloc(16 * faviconBuffers.length);
let offset = header.length + entries.length;
faviconBuffers.forEach((buffer, index) => {
  const size = index === 0 ? 16 : 32;
  const entry = index * 16;
  entries.writeUInt8(size, entry);
  entries.writeUInt8(size, entry + 1);
  entries.writeUInt8(0, entry + 2);
  entries.writeUInt8(0, entry + 3);
  entries.writeUInt16LE(1, entry + 4);
  entries.writeUInt16LE(32, entry + 6);
  entries.writeUInt32LE(buffer.length, entry + 8);
  entries.writeUInt32LE(offset, entry + 12);
  offset += buffer.length;
});
await writeFile(
  path.join(publicRoot, "favicon.ico"),
  Buffer.concat([header, entries, ...faviconBuffers]),
);

process.stdout.write("Official KNV brand derivatives generated.\n");
