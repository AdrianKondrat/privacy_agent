import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import react from '@astrojs/react';
import mvpRoutes from './MVP/routes.mjs';

const allowedDomains = [
  { hostname: 'localhost', protocol: 'http' },
  { hostname: '127.0.0.1', protocol: 'http' },
];
for (const origin of [process.env.WAITLIST_ORIGIN, process.env.KOVERR_APP_ORIGIN]) {
  if (!origin) continue;
  const publicOrigin = new URL(origin);
  allowedDomains.push({
    hostname: publicOrigin.hostname,
    protocol: publicOrigin.protocol.slice(0, -1),
    ...(publicOrigin.port && { port: publicOrigin.port }),
  });
}

const server = defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  integrations: [react(), mvpRoutes()],
  trailingSlash: 'always',
  telemetry: false,
  security: { allowedDomains },
});

const cloudflarePreview = process.env.WORKERS_CI === '1' && process.env.WORKERS_CI_BRANCH === 'MVP';

export default cloudflarePreview
  ? (await import('./MVP/preview/astro.config.mjs')).default
  : server;
