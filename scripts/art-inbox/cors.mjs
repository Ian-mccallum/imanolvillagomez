#!/usr/bin/env node
// Lets the /art page PUT files straight into R2. Merges with existing rules.
import { S3Client, GetBucketCorsCommand, PutBucketCorsCommand } from '@aws-sdk/client-s3';
import { readFileSync } from 'node:fs';
for (const l of readFileSync('.env', 'utf8').split('\n')) {
  const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/); if (m) process.env[m[1]] ??= m[2].replace(/^['"]|['"]$/g, '');
}
const s3 = new S3Client({ region: 'auto', endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY } });
const Bucket = process.env.R2_BUCKET_NAME;
let rules = [];
try { rules = (await s3.send(new GetBucketCorsCommand({ Bucket }))).CORSRules ?? []; } catch { /* none yet */ }
console.log('existing:', JSON.stringify(rules));
rules = rules.filter((r) => r.ID !== 'art-upload');
rules.push({ ID: 'art-upload', AllowedMethods: ['PUT'], AllowedHeaders: ['content-type'], ExposeHeaders: ['ETag'], MaxAgeSeconds: 3600,
  AllowedOrigins: ['https://imanolvillagomez.com', 'https://www.imanolvillagomez.com', 'https://*.vercel.app', 'http://localhost:5173', 'http://localhost:3000'] });
await s3.send(new PutBucketCorsCommand({ Bucket, CORSConfiguration: { CORSRules: rules } }));
console.log('now:', JSON.stringify(rules));
