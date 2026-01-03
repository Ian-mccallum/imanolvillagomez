#!/usr/bin/env node

/**
 * Upload videos to Cloudflare R2
 * 
 * Usage:
 * 1. Set environment variables:
 *    export R2_ACCOUNT_ID="your-account-id"
 *    export R2_ACCESS_KEY_ID="your-access-key"
 *    export R2_SECRET_ACCESS_KEY="your-secret-key"
 *    export R2_BUCKET_NAME="your-bucket-name"
 *    export R2_PUBLIC_URL="https://your-bucket.r2.dev" (or custom domain)
 * 
 * 2. Run: node scripts/upload-to-r2.js
 */

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { readdir, readFile, stat } from 'fs/promises';
import { join, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get environment variables
const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucketName = process.env.R2_BUCKET_NAME;
const publicUrl = process.env.R2_PUBLIC_URL || `https://${bucketName}.r2.dev`;

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
    // Use Upload for large files (multipart upload)
    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: bucketName,
        Key: key,
        Body: fileContent,
        ContentType: 'video/mp4',
        CacheControl: 'public, max-age=31536000, immutable',
        // Accept-Ranges header is automatically set by R2 for video files
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

async function uploadVideos() {
  const videosDir = join(__dirname, '../public/videos');
  
  try {
    const files = await readdir(videosDir);
    const mp4Files = files.filter(f => f.endsWith('.mp4'));

    console.log(`\n🚀 Found ${mp4Files.length} MP4 files to upload\n`);

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
    console.log('\n💡 Copy the R2_PUBLIC_URL value and add it to your .env file:');
    console.log(`   VITE_R2_PUBLIC_URL=${publicUrl}`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

uploadVideos();


