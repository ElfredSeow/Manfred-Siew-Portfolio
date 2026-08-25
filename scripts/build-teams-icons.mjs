#!/usr/bin/env node
// scripts/build-teams-icons.mjs
//
// Zero-dependency PNG generator for the Microsoft Teams app icon pair.
// Uses only node:zlib / node:fs / node:path / node:buffer / node:url — no
// npm packages, no canvas/sharp/pngjs. Hand-rolls the PNG encoder (IHDR /
// IDAT / IEND chunks, CRC32, zlib deflate for the image data stream) and a
// small polygon rasteriser with 4x supersampled box-downsample antialiasing.
//
// Output is fully deterministic: no timestamps, no randomness, no reliance
// on external state — running this script twice produces byte-identical
// files.

import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
// Icons sit flat next to manifest.json at the Teams app package's zip root
// (the manifest references them as bare "color.png" / "outline.png"
// relative to its own directory — a subfolder would break that).
const OUT_DIR = path.join(REPO_ROOT, 'teams');

// ---------------------------------------------------------------------------
// CRC32 (PNG chunk checksums)
// ---------------------------------------------------------------------------

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

// ---------------------------------------------------------------------------
// Minimal PNG encoder (RGBA, 8-bit, colour type 6, filter 0 per scanline)
// ---------------------------------------------------------------------------

const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

/**
 * Encode an RGBA8 buffer (top-to-bottom, row-major, 4 bytes/px) as a PNG.
 */
function encodePNG(width, height, rgba) {
  if (rgba.length !== width * height * 4) {
    throw new Error(
      `pixel buffer size mismatch: expected ${width * height * 4}, got ${rgba.length}`
    );
  }

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8);   // bit depth
  ihdrData.writeUInt8(6, 9);   // colour type 6 = RGBA
  ihdrData.writeUInt8(0, 10);  // compression method
  ihdrData.writeUInt8(0, 11);  // filter method
  ihdrData.writeUInt8(0, 12);  // interlace method

  // Build the raw (pre-deflate) scanline stream: filter byte 0 (None)
  // prepended to every row.
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    const srcStart = y * stride;
    const dstStart = y * (stride + 1);
    raw[dstStart] = 0; // filter type: None
    rgba.copy(raw, dstStart + 1, srcStart, srcStart + stride);
  }

  // level:9 + fixed strategy keeps deflateSync's output deterministic across
  // runs for identical input (no timestamps/randomness are involved in raw
  // DEFLATE/zlib framing).
  const idatData = deflateSync(raw, { level: 9 });

  return Buffer.concat([
    PNG_SIGNATURE,
    chunk('IHDR', ihdrData),
    chunk('IDAT', idatData),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ---------------------------------------------------------------------------
// Geometry: the delta-wing / paper-plane mark, defined once in a normalised
// 0..1 "shape space" whose bounding box (main dart + tail fin combined)
// exactly spans [0,1]x[0,1]. Every icon places this same shape space inside
// its own canvas at its own scale/padding.
// ---------------------------------------------------------------------------

// Main swept dart/delta silhouette: nose -> leading wingtip -> concave back
// notch -> tail wingtip. A single simple (non-self-intersecting) concave
// quadrilateral, nose pointing up-right (NE).
const MARK_MAIN = [
  [1.0, 0.0],
  [0.0, 0.3509],
  [0.4643, 0.5614],
  [0.3929, 0.9825],
];

// Small separated tail-fin sliver, offset with a clear gap from the main
// silhouette's trailing edge.
const MARK_FIN = [
  [0.6786, 0.8070],
  [0.8929, 0.7018],
  [0.8214, 1.0],
];

// Simplified silhouette used only by the 32px outline icon. The full-size
// MARK_MAIN dart tapers its tail to a long single-vertex point, which is
// fine at 192px but collapses to a multi-row hairline at 32px. This is a
// separate, chunkier reading of the same paper-plane mark: same nose-up,
// wingtip-left, swept-tail silhouette, but convex (no concave back notch —
// it wouldn't survive at 3px depth) and with a genuinely blunt tail formed
// by two corners instead of one point, so the tail reads as a flat swept
// cut rather than a needle. Every corner is additionally lightly chamfered
// (~1.4px at 26px scale) so no vertex — including the nose — resolves to a
// single-pixel run at this size; the resulting octagon still reads as the
// same 4-cornered dart. Derived by chamfering the quadrilateral
// [[25,1] nose, [1,9] wingtip, [6,25] tail-corner-A, [20,20] tail-corner-B]
// (in a 26x26 unit box matching the icon's safe-area footprint) and
// normalising by /26.
const MARK_OUTLINE = [
  [0.9478, 0.0905],
  [0.9105, 0.0555],
  [0.0895, 0.3291],
  [0.0545, 0.3975],
  [0.2147, 0.9102],
  [0.2815, 0.9434],
  [0.7185, 0.7873],
  [0.7829, 0.7172],
];

// ---------------------------------------------------------------------------
// Rasteriser: fills a set of polygons (union / OR across polygons, even-odd
// per polygon) into an RGBA buffer at a given canvas size, with 4x
// supersampled box-downsample antialiasing on the mark edges.
// ---------------------------------------------------------------------------

const SUPERSAMPLE = 4;

function pointInPolygon(x, y, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], yi = poly[i][1];
    const xj = poly[j][0], yj = poly[j][1];
    const intersects =
      (yi > y) !== (yj > y) &&
      x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

function pointInMark(sx, sy, polygons) {
  if (sx < 0 || sx > 1 || sy < 0 || sy > 1) return false;
  for (const poly of polygons) {
    if (pointInPolygon(sx, sy, poly)) return true;
  }
  return false;
}

/**
 * Render the mark's antialiased coverage mask (0..1 per pixel) at `size`
 * pixels, with the shape-space unit square scaled to `fillFraction` of the
 * canvas and centred.
 */
function renderCoverage(size, polygons, fillFraction) {
  const big = size * SUPERSAMPLE;
  const drawn = big * fillFraction;
  const margin = (big - drawn) / 2;

  const bigInside = new Uint8Array(big * big);
  for (let by = 0; by < big; by++) {
    const y = by + 0.5;
    const sy = (y - margin) / drawn;
    for (let bx = 0; bx < big; bx++) {
      const x = bx + 0.5;
      const sx = (x - margin) / drawn;
      bigInside[by * big + bx] = pointInMark(sx, sy, polygons) ? 1 : 0;
    }
  }

  const coverage = new Float64Array(size * size);
  const norm = SUPERSAMPLE * SUPERSAMPLE;
  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      let sum = 0;
      const baseY = py * SUPERSAMPLE;
      const baseX = px * SUPERSAMPLE;
      for (let dy = 0; dy < SUPERSAMPLE; dy++) {
        const row = (baseY + dy) * big;
        for (let dx = 0; dx < SUPERSAMPLE; dx++) {
          sum += bigInside[row + baseX + dx];
        }
      }
      coverage[py * size + px] = sum / norm;
    }
  }
  return coverage;
}

// ---------------------------------------------------------------------------
// Brand tokens
// ---------------------------------------------------------------------------

const BRAND_BLUE = [0x3e, 0x63, 0xe0];  // #3E63E0 - gradient top-left
const BRAND_INK = [0x2c, 0x46, 0xa8];   // #2C46A8 - gradient bottom-right
// Deep navy (#12172F) is a reserved brand token; not used in this mark.

function gradientColorAt(px, py, size) {
  const t = size > 1 ? (px + py) / (2 * (size - 1)) : 0;
  const clamped = t < 0 ? 0 : t > 1 ? 1 : t;
  return [
    BRAND_BLUE[0] + (BRAND_INK[0] - BRAND_BLUE[0]) * clamped,
    BRAND_BLUE[1] + (BRAND_INK[1] - BRAND_BLUE[1]) * clamped,
    BRAND_BLUE[2] + (BRAND_INK[2] - BRAND_BLUE[2]) * clamped,
  ];
}

// ---------------------------------------------------------------------------
// Icon builders
// ---------------------------------------------------------------------------

/**
 * color.png: full-bleed 192x192 square (no rounded corners — Teams applies
 * its own corner masking; a manually rounded icon renders incorrectly),
 * diagonal brand gradient background, white delta-wing mark centred inside
 * a 120x120 safe area (fillFraction 0.58 of 192 = ~111.4px, well within the
 * 120px safe area with >36px clear margin on every side).
 */
function buildColorIcon() {
  const SIZE = 192;
  const FILL_FRACTION = 0.58; // mark bbox as a fraction of the canvas
  const polygons = [MARK_MAIN, MARK_FIN];
  const coverage = renderCoverage(SIZE, polygons, FILL_FRACTION);

  const rgba = Buffer.alloc(SIZE * SIZE * 4);
  for (let py = 0; py < SIZE; py++) {
    for (let px = 0; px < SIZE; px++) {
      const c = coverage[py * SIZE + px];
      const [br, bg, bb] = gradientColorAt(px, py, SIZE);
      const idx = (py * SIZE + px) * 4;
      rgba[idx] = Math.round(c * 255 + (1 - c) * br);
      rgba[idx + 1] = Math.round(c * 255 + (1 - c) * bg);
      rgba[idx + 2] = Math.round(c * 255 + (1 - c) * bb);
      rgba[idx + 3] = 255; // fully opaque, edge to edge
    }
  }
  return encodePNG(SIZE, SIZE, rgba);
}

/**
 * outline.png: 32x32, fully transparent background, the same paper-plane
 * mark in pure white with alpha-only edges, using the simplified MARK_OUTLINE
 * geometry (see its comment): same nose-up-right / wingtip-left silhouette
 * as color.png, but with the tail fin dropped, the concave notch flattened,
 * and the tail squared off into a blunt swept cut instead of a point, so
 * nothing in the shape is thinner than ~3px at this size. Optically centred,
 * filling ~26x26 of the 32x32 canvas (~3px clear on every side).
 */
function buildOutlineIcon() {
  const SIZE = 32;
  const FILL_FRACTION = 26 / 32;
  const polygons = [MARK_OUTLINE];
  const coverage = renderCoverage(SIZE, polygons, FILL_FRACTION);

  const rgba = Buffer.alloc(SIZE * SIZE * 4);
  for (let py = 0; py < SIZE; py++) {
    for (let px = 0; px < SIZE; px++) {
      const c = coverage[py * SIZE + px];
      const idx = (py * SIZE + px) * 4;
      rgba[idx] = 255;
      rgba[idx + 1] = 255;
      rgba[idx + 2] = 255;
      rgba[idx + 3] = Math.round(c * 255);
    }
  }
  return encodePNG(SIZE, SIZE, rgba);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function writeIcon(filename, size, buildFn) {
  mkdirSync(OUT_DIR, { recursive: true });
  const png = buildFn();
  const outPath = path.join(OUT_DIR, filename);
  writeFileSync(outPath, png);
  console.log(`Wrote ${outPath} (${png.length} bytes, ${size}x${size})`);
}

writeIcon('color.png', 192, buildColorIcon);
writeIcon('outline.png', 32, buildOutlineIcon);
