import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
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
  configureServer(server) {
    Object.assign(process.env, loadEnv('development', __dirname, ''));
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
