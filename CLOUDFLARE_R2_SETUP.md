# Cloudflare R2 Setup Guide

Complete guide to set up Cloudflare R2 for hosting your videos (100% FREE for your use case).

## Why Cloudflare R2?

- ✅ **10GB free storage** (you have 2.2GB)
- ✅ **Unlimited bandwidth** (no egress fees)
- ✅ **Fast CDN** included
- ✅ **S3-compatible API** (works with standard tools)
- ✅ **No credit card required**

## Step 1: Create Cloudflare Account

1. Go to https://dash.cloudflare.com/sign-up
2. Sign up for a free account (no credit card needed)
3. Verify your email

## Step 2: Create R2 Bucket

1. In Cloudflare Dashboard, go to **R2** (left sidebar)
2. Click **Create bucket**
3. Name your bucket (e.g., `nol-videos`)
4. Choose a location (pick closest to your users)
5. Click **Create bucket**

## Step 3: Get Your Account ID

1. In R2 dashboard, look at the URL or overview page
2. Your Account ID is shown there (format: `abc123def456...`)
3. Copy it - you'll need it for the upload script

## Step 4: Create R2 API Token (S3-Compatible)

**IMPORTANT**: You need R2-specific API tokens, NOT the general Cloudflare API tokens!

1. Go to **R2** in the left sidebar
2. Click **Manage R2 API Tokens** (at the top of the R2 page)
3. Click **Create API Token**
4. Give it a name (e.g., "Video Upload Token")
5. Set permissions:
   - **Object Read & Write** (or just **Object Write** if you only need upload)
   - **Admin Read** (optional, for listing objects)
6. Click **Create API Token**
7. **CRITICAL**: Copy BOTH values immediately (they're only shown once!):
   - **Access Key ID** (shorter string, e.g., `ldiiVa6fKTXb5nTrlbpdmFF1Nr4LTTM4EiyDl35p`)
   - **Secret Access Key** (longer string - this is what you're missing!)

## Step 5: Make Bucket Public

1. Go back to **R2** → Your bucket
2. Click **Settings** tab
3. Scroll to **Public Access**
4. Click **Allow Access** → **Allow List**
5. Copy the **Public URL** (format: `https://your-bucket.r2.dev`)

## Step 6: Install Dependencies

```bash
npm install @aws-sdk/client-s3 @aws-sdk/lib-storage
```

## Step 7: Set Environment Variables

Create a `.env` file in your project root (copy from `.env.example`):

```bash
# Cloudflare R2 Configuration
R2_ACCOUNT_ID=your-account-id-here
R2_ACCESS_KEY_ID=your-access-key-id-here
R2_SECRET_ACCESS_KEY=your-secret-access-key-here
R2_BUCKET_NAME=your-bucket-name-here
R2_PUBLIC_URL=https://your-bucket.r2.dev

# Frontend environment variable
VITE_R2_PUBLIC_URL=https://your-bucket.r2.dev
```

**Important**: Add `.env` to your `.gitignore` if it's not already there!

## Step 8: Upload Videos

Run the upload script:

```bash
node scripts/upload-to-r2.js
```

This will:
- Upload all MP4 files from `public/videos/`
- Show progress for each file
- Display the final URLs

## Step 9: Set Vercel Environment Variable

1. Go to your Vercel project dashboard
2. **Settings** → **Environment Variables**
3. Add:
   - **Name**: `VITE_R2_PUBLIC_URL`
   - **Value**: `https://your-bucket.r2.dev` (your R2 public URL)
   - **Environment**: Production, Preview, Development (check all)
4. Click **Save**

## Step 10: Deploy

1. Commit your changes:
   ```bash
   git add .
   git commit -m "Migrate videos to Cloudflare R2"
   git push
   ```

2. Vercel will automatically deploy with the new environment variable

3. Your videos will now load from R2! 🎉

## Troubleshooting

### Videos not loading?
- Check that `VITE_R2_PUBLIC_URL` is set in Vercel
- Verify bucket is set to public access
- Check browser console for CORS errors (R2 handles CORS automatically)

### Upload script fails?
- Verify all environment variables are set correctly
- Check that your API token has R2:Edit permissions
- Ensure bucket name matches exactly

### Want to test locally?
- Create `.env.local` with `VITE_R2_PUBLIC_URL=https://your-bucket.r2.dev`
- Run `npm run dev`
- Videos should load from R2

## Step 11: Set Up Custom Domain (Recommended for Production)

**IMPORTANT**: The public `*.r2.dev` URL is rate-limited and not recommended for production. Use a custom domain for better performance and no rate limits.

### Option A: If your domain is on Cloudflare DNS (Recommended)

1. In Cloudflare Dashboard → **R2** → Your bucket (`imanol`) → **Settings** tab
2. Scroll to **Public Access** → **Custom Domain** → **Connect Domain**
3. Enter a subdomain (e.g., `videos.imanolvillagomez.com` or `cdn.imanolvillagomez.com`)
4. Click **Connect Domain**
5. Cloudflare will automatically add the DNS record if your domain is managed by Cloudflare
6. Wait 2-5 minutes for DNS propagation
7. Update your `.env` file:
   ```bash
   VITE_R2_PUBLIC_URL=https://videos.imanolvillagomez.com
   ```
8. Update the same value in Vercel environment variables

### Option B: If your domain is NOT on Cloudflare DNS

1. Follow steps 1-3 above
2. Cloudflare will show you a DNS record to add (usually a CNAME)
3. Add this record to your DNS provider:
   - **Type**: CNAME
   - **Name**: `videos` (for `videos.imanolvillagomez.com`)
   - **Target**: The value Cloudflare provides
   - **TTL**: 3600 (or auto)
4. Wait for DNS propagation (can take up to 24 hours, usually 5-30 minutes)
5. Update your `.env` and Vercel environment variables as above

### Benefits of Custom Domain:
- ✅ No rate limits
- ✅ Cloudflare caching enabled
- ✅ Better performance
- ✅ Professional URLs
- ✅ Access control available

## Step 12: Configure CORS and Caching (IMPORTANT for Performance)

**CRITICAL**: R2 buckets don't cache by default, which causes slow loading. Follow these steps:

### A. Set Up CORS (Cross-Origin Resource Sharing)

1. Go to Cloudflare Dashboard → **R2** → Your bucket (`imanol`)
2. Click **Settings** tab
3. Scroll to **CORS Policy**
4. Click **Edit CORS Policy**
5. Add this CORS configuration:
   ```json
   [
     {
       "AllowedOrigins": ["*"],
       "AllowedMethods": ["GET", "HEAD"],
       "AllowedHeaders": ["*"],
       "ExposeHeaders": ["ETag", "Content-Length", "Content-Type", "Accept-Ranges"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```
6. Click **Save**

### B. Enable Caching with Cache Rules

1. Go to Cloudflare Dashboard → **Caching** → **Rules**
2. Click **Create Rule**
3. Name it: "R2 Video Caching"
4. Configure:
   - **If**: `Hostname` `is` `videos.imanolvillagomez.com`
   - **Then**: 
     - **Cache Level**: Cache Everything
     - **Edge Cache TTL**: 1 month
     - **Browser Cache TTL**: Respect Existing Headers
5. Click **Deploy**

### C. Enable Smart Tiered Cache (Optional but Recommended)

1. Go to Cloudflare Dashboard → **Caching** → **Tiered Cache**
2. Enable **Smart Tiered Cache Topology**
3. This reduces latency by caching closer to users

### Why This Matters:
- **Without caching**: Every video request goes to R2 origin (slow)
- **With caching**: Videos served from Cloudflare's edge cache (fast)
- **CORS**: Allows browsers to load videos from your domain

## Cost Breakdown

- **Storage**: 2.2GB = FREE (under 10GB limit)
- **Bandwidth**: FREE (unlimited)
- **Operations**: FREE (under generous limits)
- **Total**: $0/month ✅

## Next Steps

After everything is working:
- You can remove videos from `public/videos/` to reduce repo size
- Remove Git LFS tracking for videos
- Your site will load videos much faster from R2's CDN!

