#!/usr/bin/env node
// Builds the uploadable Microsoft Teams app package: a flat zip containing
// teams/manifest.json plus the two icon PNGs it references, all at the zip
// root. Zero dependencies — the ZIP container is written by hand.
//
// Usage:
//   node scripts/build-teams-package.mjs            build dist/teams/manfred-siew-teams-app.zip
//   node scripts/build-teams-package.mjs --check     validate only, do not write the zip
//   node scripts/build-teams-package.mjs -c          same as --check

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join, basename, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateRawSync, crc32 } from 'node:zlib';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export const REPO_ROOT = resolve(__dirname, '..');

export const TEAMS_DIR = join(REPO_ROOT, 'teams');
export const MANIFEST_PATH = join(TEAMS_DIR, 'manifest.json');
export const DIST_DIR = join(REPO_ROOT, 'dist', 'teams');
export const OUTPUT_ZIP = join(DIST_DIR, 'manfred-siew-teams-app.zip');

const GUID_RE = /^[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}$/;
const SEMVER_RE = /^([0-9]|[1-9][0-9]*)\.([0-9]|[1-9][0-9]*)\.([0-9]|[1-9][0-9]*)$/;
const ACCENT_RE = /^#[0-9a-fA-F]{6}$/;
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const SCHEME_RE = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//;

function isHttps(url) {
  return typeof url === 'string' && /^https:\/\//i.test(url);
}

function isNonEmptyString(v) {
  return typeof v === 'string' && v.length > 0;
}

/**
 * Parses the PNG magic + IHDR width/height straight out of the file bytes.
 * Returns { width, height } or null if the buffer doesn't start with the
 * PNG signature.
 */
export function readPngDimensions(buf) {
  if (!Buffer.isBuffer(buf) || buf.length < 24) return null;
  if (!buf.subarray(0, 8).equals(PNG_MAGIC)) return null;
  return {
    width: buf.readUInt32BE(16),
    height: buf.readUInt32BE(20),
  };
}

/**
 * Validates a parsed manifest object (plus disk-resident icon files under
 * teamsDir). Returns an array of human-readable error strings — empty
 * means valid. Collects every problem found rather than stopping at the
 * first.
 */
export function validateManifest(manifest, teamsDir) {
  const errors = [];

  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
    return ['manifest.json: root value must be a JSON object'];
  }

  // manifestVersion
  if (!isNonEmptyString(manifest.manifestVersion)) {
    errors.push('manifestVersion: must be present and non-empty');
  }

  // id
  if (typeof manifest.id !== 'string' || !GUID_RE.test(manifest.id)) {
    errors.push(`id: must be a GUID matching ${GUID_RE} (got ${JSON.stringify(manifest.id)})`);
  }

  // version
  if (typeof manifest.version !== 'string' || !SEMVER_RE.test(manifest.version)) {
    errors.push(`version: must be a semver string like "1.0.0" (got ${JSON.stringify(manifest.version)})`);
  }

  // accentColor
  if (typeof manifest.accentColor !== 'string' || !ACCENT_RE.test(manifest.accentColor)) {
    errors.push(`accentColor: must match #RRGGBB (got ${JSON.stringify(manifest.accentColor)})`);
  }

  // name
  const name = manifest.name && typeof manifest.name === 'object' ? manifest.name : {};
  if (!isNonEmptyString(name.short)) {
    errors.push('name.short: must be present and non-empty');
  } else if (name.short.length > 30) {
    errors.push(`name.short: must be <= 30 chars (got ${name.short.length})`);
  }
  if (!isNonEmptyString(name.full)) {
    errors.push('name.full: must be present and non-empty');
  } else if (name.full.length > 100) {
    errors.push(`name.full: must be <= 100 chars (got ${name.full.length})`);
  }

  // description
  const description = manifest.description && typeof manifest.description === 'object' ? manifest.description : {};
  if (!isNonEmptyString(description.short)) {
    errors.push('description.short: must be present and non-empty');
  } else if (description.short.length > 80) {
    errors.push(`description.short: must be <= 80 chars (got ${description.short.length})`);
  }
  if (!isNonEmptyString(description.full)) {
    errors.push('description.full: must be present and non-empty');
  } else if (description.full.length > 4000) {
    errors.push(`description.full: must be <= 4000 chars (got ${description.full.length})`);
  }

  // developer
  const developer = manifest.developer && typeof manifest.developer === 'object' ? manifest.developer : {};
  if (!isNonEmptyString(developer.name)) {
    errors.push('developer.name: must be present and non-empty');
  } else if (developer.name.length > 32) {
    errors.push(`developer.name: must be <= 32 chars (got ${developer.name.length})`);
  }
  for (const field of ['websiteUrl', 'privacyUrl', 'termsOfUseUrl']) {
    const val = developer[field];
    if (!isNonEmptyString(val)) {
      errors.push(`developer.${field}: must be present and non-empty`);
    } else if (!isHttps(val)) {
      errors.push(`developer.${field}: must use https:// (got ${JSON.stringify(val)})`);
    }
  }

  // icons — presence, on-disk existence, magic bytes, exact dimensions
  const icons = manifest.icons && typeof manifest.icons === 'object' ? manifest.icons : {};
  const iconChecks = [
    { field: 'color', value: icons.color, width: 192, height: 192 },
    { field: 'outline', value: icons.outline, width: 32, height: 32 },
  ];
  for (const { field, value, width, height } of iconChecks) {
    if (!isNonEmptyString(value)) {
      errors.push(`icons.${field}: must be present and non-empty`);
      continue;
    }
    const diskPath = join(teamsDir, value);
    if (!existsSync(diskPath)) {
      errors.push(`icons.${field}: referenced file "${value}" does not exist on disk under teams/ (expected ${diskPath})`);
      continue;
    }
    const buf = readFileSync(diskPath);
    if (!buf.subarray(0, 8).equals(PNG_MAGIC)) {
      errors.push(`icons.${field}: "${value}" does not start with the PNG magic bytes (\\x89PNG\\r\\n\\x1a\\n)`);
      continue;
    }
    const dims = readPngDimensions(buf);
    if (!dims || dims.width !== width || dims.height !== height) {
      errors.push(`icons.${field}: "${value}" must be exactly ${width}x${height} (got ${dims ? `${dims.width}x${dims.height}` : 'unreadable'})`);
    }
  }

  // staticTabs
  if (!Array.isArray(manifest.staticTabs)) {
    errors.push('staticTabs: must be an array');
  } else {
    if (manifest.staticTabs.length > 16) {
      errors.push(`staticTabs: must have <= 16 entries (got ${manifest.staticTabs.length})`);
    }
    manifest.staticTabs.forEach((tab, i) => {
      const label = `staticTabs[${i}]`;
      if (!tab || typeof tab !== 'object') {
        errors.push(`${label}: must be an object`);
        return;
      }
      if (!isNonEmptyString(tab.entityId)) {
        errors.push(`${label}.entityId: must be present and non-empty`);
      } else if (tab.entityId.length > 64) {
        errors.push(`${label}.entityId: must be <= 64 chars (got ${tab.entityId.length})`);
      }
      if (tab.contentUrl !== undefined && !isHttps(tab.contentUrl)) {
        errors.push(`${label}.contentUrl: must use https:// (got ${JSON.stringify(tab.contentUrl)})`);
      }
      if (tab.websiteUrl !== undefined && !isHttps(tab.websiteUrl)) {
        errors.push(`${label}.websiteUrl: must use https:// (got ${JSON.stringify(tab.websiteUrl)})`);
      }
      if (!Array.isArray(tab.scopes) || tab.scopes.length === 0) {
        errors.push(`${label}.scopes: must be a non-empty array`);
      }
    });
  }

  // validDomains — no scheme, no path
  if (manifest.validDomains !== undefined) {
    if (!Array.isArray(manifest.validDomains)) {
      errors.push('validDomains: must be an array');
    } else {
      manifest.validDomains.forEach((domain, i) => {
        const label = `validDomains[${i}]`;
        if (typeof domain !== 'string' || domain.length === 0) {
          errors.push(`${label}: must be a non-empty string`);
          return;
        }
        if (SCHEME_RE.test(domain)) {
          errors.push(`${label}: must not contain a scheme, e.g. "https://" (got ${JSON.stringify(domain)})`);
        }
        if (domain.includes('/')) {
          errors.push(`${label}: must not contain a path (got ${JSON.stringify(domain)})`);
        }
      });
    }
  }

  return errors;
}

// Fixed DOS date/time (1980-01-01 00:00:00) so zip bytes are deterministic.
const DOS_TIME = 0;
const DOS_DATE = 0x0021; // (0 << 9) | (1 << 5) | 1

/**
 * Builds a zip (as a Buffer) from a flat list of { name, data } entries,
 * all placed at the zip root. Uses DEFLATE (method 8) via zlib and a fixed
 * DOS timestamp on every entry so the output is byte-for-byte deterministic
 * across runs given the same input bytes.
 */
export function buildZipBuffer(entries) {
  const localParts = [];
  const centralParts = [];
  const summary = [];
  let offset = 0;

  for (const { name, data } of entries) {
    const nameBuf = Buffer.from(name, 'utf8');
    const crc = crc32(data) >>> 0;
    const compressed = deflateRawSync(data, { level: 9 });
    const uncompressedSize = data.length;
    const compressedSize = compressed.length;

    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0); // local file header signature
    localHeader.writeUInt16LE(20, 4); // version needed to extract
    localHeader.writeUInt16LE(0, 6); // general purpose bit flag
    localHeader.writeUInt16LE(8, 8); // compression method: DEFLATE
    localHeader.writeUInt16LE(DOS_TIME, 10);
    localHeader.writeUInt16LE(DOS_DATE, 12);
    localHeader.writeUInt32LE(crc, 14);
    localHeader.writeUInt32LE(compressedSize, 18);
    localHeader.writeUInt32LE(uncompressedSize, 22);
    localHeader.writeUInt16LE(nameBuf.length, 26);
    localHeader.writeUInt16LE(0, 28); // extra field length

    localParts.push(localHeader, nameBuf, compressed);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0); // central dir file header signature
    centralHeader.writeUInt16LE(20, 4); // version made by
    centralHeader.writeUInt16LE(20, 6); // version needed to extract
    centralHeader.writeUInt16LE(0, 8); // general purpose bit flag
    centralHeader.writeUInt16LE(8, 10); // compression method
    centralHeader.writeUInt16LE(DOS_TIME, 12);
    centralHeader.writeUInt16LE(DOS_DATE, 14);
    centralHeader.writeUInt32LE(crc, 16);
    centralHeader.writeUInt32LE(compressedSize, 20);
    centralHeader.writeUInt32LE(uncompressedSize, 24);
    centralHeader.writeUInt16LE(nameBuf.length, 28);
    centralHeader.writeUInt16LE(0, 30); // extra field length
    centralHeader.writeUInt16LE(0, 32); // file comment length
    centralHeader.writeUInt16LE(0, 34); // disk number start
    centralHeader.writeUInt16LE(0, 36); // internal file attributes
    centralHeader.writeUInt32LE(0, 38); // external file attributes
    centralHeader.writeUInt32LE(offset, 42); // relative offset of local header

    centralParts.push(centralHeader, nameBuf);

    summary.push({ name, uncompressedSize, compressedSize });
    offset += localHeader.length + nameBuf.length + compressed.length;
  }

  const centralDirOffset = offset;
  const centralDir = Buffer.concat(centralParts);

  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0); // end of central directory signature
  eocd.writeUInt16LE(0, 4); // number of this disk
  eocd.writeUInt16LE(0, 6); // disk with central directory
  eocd.writeUInt16LE(entries.length, 8); // entries on this disk
  eocd.writeUInt16LE(entries.length, 10); // total entries
  eocd.writeUInt32LE(centralDir.length, 12); // central directory size
  eocd.writeUInt32LE(centralDirOffset, 16); // central directory offset
  eocd.writeUInt16LE(0, 20); // comment length

  const buffer = Buffer.concat([...localParts, centralDir, eocd]);
  return { buffer, summary };
}

function loadManifest(manifestPath) {
  if (!existsSync(manifestPath)) {
    return { manifest: null, parseError: `manifest not found at ${manifestPath}` };
  }
  const raw = readFileSync(manifestPath);
  try {
    return { manifest: JSON.parse(raw.toString('utf8')), raw, parseError: null };
  } catch (err) {
    return { manifest: null, raw, parseError: `manifest.json is not valid JSON: ${err.message}` };
  }
}

function main() {
  const args = process.argv.slice(2);
  const checkOnly = args.includes('--check') || args.includes('-c');

  const { manifest, raw, parseError } = loadManifest(MANIFEST_PATH);

  if (parseError) {
    console.error('Teams manifest validation FAILED:\n');
    console.error(`  - ${parseError}`);
    console.error('\n1 problem found.');
    process.exit(1);
  }

  const errors = validateManifest(manifest, TEAMS_DIR);

  if (errors.length > 0) {
    console.error('Teams manifest validation FAILED:\n');
    for (const err of errors) console.error(`  - ${err}`);
    console.error(`\n${errors.length} problem${errors.length === 1 ? '' : 's'} found in ${MANIFEST_PATH}`);
    process.exit(1);
  }

  console.log(`Teams manifest OK (id=${manifest.id}, version=${manifest.version})`);

  if (checkOnly) {
    console.log('--check: validation only, zip not written.');
    process.exit(0);
  }

  const colorIconPath = join(TEAMS_DIR, manifest.icons.color);
  const outlineIconPath = join(TEAMS_DIR, manifest.icons.outline);

  const entries = [
    { name: 'manifest.json', data: raw },
    { name: basename(manifest.icons.color), data: readFileSync(colorIconPath) },
    { name: basename(manifest.icons.outline), data: readFileSync(outlineIconPath) },
  ];

  const { buffer, summary } = buildZipBuffer(entries);

  mkdirSync(DIST_DIR, { recursive: true });
  writeFileSync(OUTPUT_ZIP, buffer);

  console.log('\nPackage contents:');
  for (const { name, uncompressedSize, compressedSize } of summary) {
    console.log(`  ${name}  (${uncompressedSize} bytes -> ${compressedSize} bytes deflated)`);
  }
  console.log(`\nTotal zip size: ${buffer.length} bytes`);
  console.log(`Output: ${OUTPUT_ZIP}`);
  console.log(`App id: ${manifest.id}`);
  console.log(`App version: ${manifest.version}`);

  process.exit(0);
}

const isMain = process.argv[1] && resolve(process.argv[1]) === __filename;
if (isMain) {
  main();
}
