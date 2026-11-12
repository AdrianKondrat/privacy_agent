export default function mvpRoutes() {
  return {
    name: 'koverr-mvp',
    hooks: {
      'astro:config:setup': ({ injectRoute }) => {
        injectRoute({
          pattern: '/app/',
          entrypoint: new URL('./pages/check.astro', import.meta.url),
        });
        injectRoute({
          pattern: '/app/privacy/',
          entrypoint: new URL('./pages/privacy.astro', import.meta.url),
        });
        injectRoute({
          pattern: '/app/inventory/',
          entrypoint: new URL('./pages/inventory.astro', import.meta.url),
        });
        injectRoute({
          pattern: '/app/cleanup/',
          entrypoint: new URL('./pages/cleanup.astro', import.meta.url),
        });
        injectRoute({
          pattern: '/app/cleanup/inventory/',
          entrypoint: new URL('./pages/inventory-data.ts', import.meta.url),
        });
        injectRoute({
          pattern: '/app/cleanup/drafts/',
          entrypoint: new URL('./pages/closure-drafts.astro', import.meta.url),
        });
        injectRoute({
          pattern: '/app/cleanup/review/',
          entrypoint: new URL('./pages/closure-review.astro', import.meta.url),
        });
        injectRoute({
          pattern: '/app/password/',
          entrypoint: new URL('./pages/password.astro', import.meta.url),
        });
      },
    },
  };
}
