#!/usr/bin/env node

/**
 * Upload videos to Cloudflare R2
 *
 * Usage:
 *   1. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY,
 *      R2_BUCKET_NAME (required). R2_PUBLIC_URL optional.
 *
 *   2a. Upload everything in public/videos/*.mp4:
 *       node scripts/upload-to-r2.js --all
 *
 *   2b. Upload only specific files (from public/videos/, same R2 keys as always):
 *       node scripts/upload-to-r2.js earlylifecrisis.mp4 MgnaCRRRTA.mp4
 *
 *   2c. Upload filenames listed in a file (one basename per line, # starts comment):
 *       node scripts/upload-to-r2.js --list=newWork/upload-batch.txt
 */

import { Upload } from '@aws-sdk/lib-storage';
import { S3Client } from '@aws-sdk/client-s3';
import { readdir, readFile, stat } from 'fs/promises';
import { join, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const videosDir = join(__dirname, '../public/videos');

function parseArgs() {
  const raw = process.argv.slice(2);
  let uploadAll = false;
  let listPath = null;
  const positionals = [];

  for (const a of raw) {
    if (a === '--all') {
      uploadAll = true;
      continue;
    }
    if (a === '--help' || a === '-h') {
      return { help: true };
    }
    if (a.startsWith('--list=')) {
      listPath = a.slice('--list='.length);
      continue;
    }
    if (a.startsWith('-')) {
      console.error(`Unknown option: ${a}`);
      process.exit(1);
    }
    positionals.push(a);
  }

  return { uploadAll, listPath, positionals };
}

function loadListFile(listPathAbsolute) {
  const text = readFileSync(listPathAbsolute, 'utf8');
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => basename(line));
}

// Get environment variables
const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucketName = process.env.R2_BUCKET_NAME;
const publicUrl = process.env.R2_PUBLIC_URL || `https://${bucketName}.r2.dev`;

const parsed = parseArgs();

if (parsed.help) {
  console.log(`
Usage:
  node scripts/upload-to-r2.js --all
      Upload every .mp4 in public/videos/

  node scripts/upload-to-r2.js <file1.mp4> [file2.mp4 ...]
      Upload only these files from public/videos/

  node scripts/upload-to-r2.js --list=PATH
      Upload basenames listed in PATH (after copying into public/videos/)

If you pass no arguments, this prints a hint (use --all or name files explicitly).
`);
  process.exit(0);
}

// Validate environment variables
if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
  console.error('❌ Missing required environment variables:');
  console.error('   R2_ACCOUNT_ID');
  console.error('   R2_ACCESS_KEY_ID');
  console.error('   R2_SECRET_ACCESS_KEY');
  console.error('   R2_BUCKET_NAME');
  console.error('\nOptional:');
  console.error('   R2_PUBLIC_URL (defaults to https://{bucket}.r2.dev)');
  process.exit(1);
}

// Initialize S3 client for R2
const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

async function uploadFile(filePath, key) {
  const fileContent = await readFile(filePath);
  const fileStats = await stat(filePath);
  const fileSizeMB = (fileStats.size / (1024 * 1024)).toFixed(2);

  console.log(`📤 Uploading ${basename(filePath)} (${fileSizeMB}MB)...`);

  try {
    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: bucketName,
        Key: key,
        Body: fileContent,
        ContentType: 'video/mp4',
        CacheControl: 'public, max-age=31536000, immutable',
      },
    });

    await upload.done();
    const url = `${publicUrl}/${key}`;
    console.log(`✅ ${basename(filePath)}: ${url}`);
    return url;
  } catch (error) {
    console.error(`❌ Failed to upload ${basename(filePath)}:`, error.message);
    throw error;
  }
}

async function resolveFileList({ uploadAll, listPath, positionals }) {
  if (uploadAll) {
    const files = await readdir(videosDir);
    return files.filter((f) => f.endsWith('.mp4')).sort();
  }

  let names = [...positionals];
  if (listPath) {
    const resolved = join(process.cwd(), listPath);
    names = names.concat(loadListFile(resolved));
  }

  names = [...new Set(names)].map((n) => basename(n)).filter(Boolean);

  if (names.length === 0) {
    console.error(`
No files specified.

  • Upload **only new** assets (recommended): copy MP4s into public/videos/, then:
      node scripts/upload-to-r2.js --list=newWork/upload-batch.txt
    Or name files explicitly:
      node scripts/upload-to-r2.js foo.mp4 bar.mp4

  • Upload **all** MP4s in public/videos/ (slow, redundant if already on R2):
      node scripts/upload-to-r2.js --all
`);
    process.exit(1);
  }

  const missing = [];
  const mp4Files = [];
  for (const name of names) {
    if (!name.endsWith('.mp4')) {
      console.error(`❌ Expected .mp4 filename, got: ${name}`);
      process.exit(1);
    }
    const filePath = join(videosDir, name);
    try {
      await stat(filePath);
      mp4Files.push(name);
    } catch {
      missing.push(name);
    }
  }
  if (missing.length) {
    console.error(`❌ Not found under public/videos/: ${missing.join(', ')}`);
    process.exit(1);
  }

  return mp4Files.sort();
}

async function uploadVideos() {
  try {
    const mp4Files = await resolveFileList(parsed);

    console.log(
      `\n🚀 Uploading ${mp4Files.length} MP4 file(s)${
        parsed.uploadAll ? ' (full public/videos scan)' : ' (selective)'
      }\n`,
    );

    const uploadedUrls = {};

    for (const file of mp4Files) {
      const filePath = join(videosDir, file);
      const key = `videos/${file}`;
      const url = await uploadFile(filePath, key);
      uploadedUrls[file] = url;
    }

    console.log('\n✨ Upload complete!\n');
    console.log('📋 Uploaded URLs:');
    console.log(JSON.stringify(uploadedUrls, null, 2));
    console.log('\n💡 Ensure VITE_R2_PUBLIC_URL matches your public base:');
    console.log(`   VITE_R2_PUBLIC_URL=${publicUrl}`);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

uploadVideos();
