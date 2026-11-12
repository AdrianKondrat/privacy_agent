import { defineConfig } from 'astro/config';

export default defineConfig({
  srcDir: './MVP/preview/src',
  output: 'static',
  trailingSlash: 'always',
  telemetry: false,
  integrations: [{
    name: 'koverr-preview-routes',
    hooks: {
      'astro:config:setup': ({ injectRoute }) => {
        injectRoute({
          pattern: '/app/inventory/',
          entrypoint: new URL('../pages/inventory.astro', import.meta.url),
        });
        injectRoute({
          pattern: '/app/password/',
          entrypoint: new URL('../pages/password.astro', import.meta.url),
        });
      },
    },
  }],
});
