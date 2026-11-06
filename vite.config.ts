import { defineConfig, loadEnv, type Plugin, type ViteDevServer } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Dev only: serve api/*.ts through Vite so /art works on localhost the way it
 * does on Vercel. Loads .env into process.env for the handler.
 */
const devApi = (): Plugin => ({
  name: 'dev-api',
  apply: 'serve',
  async configureServer(server) {
    Object.assign(process.env, loadEnv('development', __dirname, ''));
    if (process.env.STUDIO_FIXTURE === '1') await fixtureStore(server);
    server.middlewares.use(async (req, res, next) => {
      const url = new URL(req.url ?? '/', 'http://localhost');
      const m = url.pathname.match(/^\/api\/([\w-]+)$/);
      if (!m) return next();
      try {
        const mod = await server.ssrLoadModule(`/api/${m[1]}.ts`);
        let raw = '';
        for await (const chunk of req) raw += chunk;
        const vreq = Object.assign(req, {
          query: Object.fromEntries(url.searchParams),
          body: raw ? JSON.parse(raw) : {},
        });
        const vres = Object.assign(res, {
          status(code: number) {
            res.statusCode = code;
            return vres;
          },
          json(v: unknown) {
            res.setHeader('content-type', 'application/json');
            res.end(JSON.stringify(v));
            return vres;
          },
        });
        await mod.default(vreq, vres);
      } catch (e) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: String(e) }));
      }
    });
  },
});

/**
 * STUDIO_FIXTURE=1: the real /api/art against an in-memory bucket seeded from
 * fixtures/studio, password "fixture". Presigned URLs point back at /__r2 here.
 * Never touches the production bucket.
 */
async function fixtureStore(server: ViteDevServer) {
  const { S3Client } = await import('@aws-sdk/client-s3');
  const seedPath = path.join(__dirname, 'fixtures/studio/seed.mjs');
  const { seedStudio } = await import(/* @vite-ignore */ seedPath);
  type Obj = string | Buffer | { file: string; type?: string };
  const objects: Map<string, Obj> = seedStudio();
  const port = server.config.server.port ?? 5173;
  Object.assign(process.env, {
    ART_KEY: 'fixture',
    R2_ACCOUNT_ID: 'fixture',
    R2_ACCESS_KEY_ID: 'fixture',
    R2_SECRET_ACCESS_KEY: 'fixture',
    R2_BUCKET_NAME: 'fixture',
    R2_ENDPOINT: `http://localhost:${port}/__r2`,
  });
  const bytes = (o: Obj) =>
    typeof o === 'string' || Buffer.isBuffer(o) ? Buffer.from(o) : fs.readFileSync(path.join(__dirname, o.file));
  S3Client.prototype.send = async function (command: { constructor: { name: string }; input: Record<string, never> }) {
    const { Key, Prefix = '', Delimiter, Body, CopySource } = command.input as Record<string, string>;
    const keys = () => Array.from(objects.keys()).filter((k) => k.startsWith(Prefix)).sort();
    switch (command.constructor.name) {
      case 'GetObjectCommand': {
        const o = objects.get(Key);
        if (o === undefined) throw Object.assign(new Error('NoSuchKey'), { name: 'NoSuchKey' });
        const b = bytes(o);
        return { Body: { transformToString: async () => b.toString(), transformToByteArray: async () => b }, ContentLength: b.length };
      }
      case 'HeadObjectCommand': {
        const o = objects.get(Key);
        if (o === undefined) throw Object.assign(new Error('NotFound'), { name: 'NotFound' });
        return { ContentLength: bytes(o).length, LastModified: new Date() };
      }
      case 'PutObjectCommand':
        objects.set(Key, typeof Body === 'string' ? Body : Buffer.from(Body ?? ''));
        return {};
      case 'DeleteObjectCommand':
        objects.delete(Key);
        return {};
      case 'CopyObjectCommand': {
        const from = decodeURIComponent(CopySource.split('/').slice(1).join('/'));
        if (!objects.has(from)) throw Object.assign(new Error('NoSuchKey'), { name: 'NoSuchKey' });
        objects.set(Key, objects.get(from)!);
        return {};
      }
      case 'ListObjectsV2Command': {
        if (!Delimiter)
          return { Contents: keys().map((k) => ({ Key: k, Size: bytes(objects.get(k)!).length, LastModified: new Date() })) };
        const prefixes = new Set<string>();
        const contents = [];
        for (const k of keys()) {
          const rest = k.slice(Prefix.length);
          const i = rest.indexOf(Delimiter);
          if (i >= 0) prefixes.add(Prefix + rest.slice(0, i + 1));
          else contents.push({ Key: k, Size: bytes(objects.get(k)!).length, LastModified: new Date() });
        }
        return { CommonPrefixes: Array.from(prefixes).map((p) => ({ Prefix: p })), Contents: contents };
      }
      default:
        throw new Error(`fixture store: unsupported ${command.constructor.name}`);
    }
  } as never;
  server.middlewares.use('/__r2/fixture/', async (req, res) => {
    const key = decodeURIComponent((req.url ?? '').split('?')[0].replace(/^\//, ''));
    if (req.method === 'PUT') {
      const chunks: Buffer[] = [];
      for await (const c of req) chunks.push(c as Buffer);
      objects.set(key, Buffer.concat(chunks));
      res.end();
      return;
    }
    const o = objects.get(key);
    if (o === undefined) {
      res.statusCode = 404;
      res.end();
      return;
    }
    res.setHeader('content-type', typeof o === 'object' && 'file' in o ? (o.type ?? 'application/octet-stream') : 'application/octet-stream');
    res.end(bytes(o));
  });
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), devApi()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/pages': path.resolve(__dirname, './src/pages'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/constants': path.resolve(__dirname, './src/constants'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/contexts': path.resolve(__dirname, './src/contexts'),
      '@/assets': path.resolve(__dirname, './src/assets'),
    },
  },
});
