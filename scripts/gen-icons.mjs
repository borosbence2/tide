// Generates the PWA / Apple icons as real PNGs with zero dependencies
// (Node's built-in zlib only). Draws a calm radial "breathing orb".
//
// Run: node scripts/gen-icons.mjs
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const outDir = join(dirname(fileURLToPath(import.meta.url)), "..", "public");
mkdirSync(outDir, { recursive: true });

// --- CRC32 (PNG chunk checksum) ---
const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const body = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}
function smoothstep(t) {
  t = Math.max(0, Math.min(1, t));
  return t * t * (3 - 2 * t);
}

// Multi-stop radial gradient: glowing teal orb fading into the deep slate bg.
const stops = [
  [0.0, [169, 230, 220]],
  [0.3, [127, 212, 201]],
  [0.58, [63, 107, 140]],
  [0.82, [14, 23, 38]],
  [1.0, [14, 23, 38]],
];
function sample(u) {
  for (let i = 0; i < stops.length - 1; i++) {
    const [p0, c0] = stops[i];
    const [p1, c1] = stops[i + 1];
    if (u <= p1) {
      const t = smoothstep((u - p0) / (p1 - p0));
      return [lerp(c0[0], c1[0], t), lerp(c0[1], c1[1], t), lerp(c0[2], c1[2], t)];
    }
  }
  return stops[stops.length - 1][1];
}

function renderPng(size, radiusFactor) {
  const cx = size / 2;
  const cy = size * 0.46;
  const denom = size * radiusFactor;
  const stride = size * 4 + 1; // +1 filter byte per row
  const raw = Buffer.alloc(stride * size);
  for (let y = 0; y < size; y++) {
    raw[y * stride] = 0; // filter: none
    for (let x = 0; x < size; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const u = Math.sqrt(dx * dx + dy * dy) / denom;
      const [r, g, b] = sample(u);
      const o = y * stride + 1 + x * 4;
      raw[o] = Math.round(r);
      raw[o + 1] = Math.round(g);
      raw[o + 2] = Math.round(b);
      raw[o + 3] = 255; // opaque
    }
  }

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const targets = [
  ["icon-192.png", 192, 0.5],
  ["icon-512.png", 512, 0.5],
  ["icon-512-maskable.png", 512, 0.62], // smaller orb → survives mask safe-zone
  ["apple-touch-icon-180.png", 180, 0.5],
];
for (const [name, size, rf] of targets) {
  writeFileSync(join(outDir, name), renderPng(size, rf));
  console.log("wrote", name);
}
