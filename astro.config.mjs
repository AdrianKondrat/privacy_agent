import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import react from '@astrojs/react';

const publicOrigin = process.env.WAITLIST_ORIGIN ? new URL(process.env.WAITLIST_ORIGIN) : undefined;
const allowedDomains = [
  { hostname: 'localhost', protocol: 'http' },
  { hostname: '127.0.0.1', protocol: 'http' },
];
if (publicOrigin) {
  allowedDomains.push({
    hostname: publicOrigin.hostname,
    protocol: publicOrigin.protocol.slice(0, -1),
    ...(publicOrigin.port && { port: publicOrigin.port }),
  });
}

export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  integrations: [react()],
  trailingSlash: 'always',
  telemetry: false,
  security: { allowedDomains },
});
