import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import cloudflare from '@astrojs/cloudflare';
import { defineConfig } from 'astro/config';
import mvpRoutes from '../routes.mjs';

const configPath = fileURLToPath(new URL('./wrangler.pilot.jsonc', import.meta.url));
const { vars } = JSON.parse(readFileSync(configPath, 'utf8'));
const origin = new URL(vars.KOVERR_APP_ORIGIN);

export default defineConfig({
  srcDir: './MVP/deploy/worker-src',
  output: 'server',
  outDir: './dist/pilot-worker',
  session: false,
  adapter: cloudflare({ configPath, imageService: 'passthrough' }),
  integrations: [mvpRoutes()],
  trailingSlash: 'always',
  telemetry: false,
  security: {
    allowedDomains: [{ hostname: origin.hostname, protocol: 'https' }],
  },
});
