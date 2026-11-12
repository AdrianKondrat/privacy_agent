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
          pattern: '/app/password/',
          entrypoint: new URL('./pages/password.astro', import.meta.url),
        });
      },
    },
  };
}
