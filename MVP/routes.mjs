export default function mvpRoutes() {
  return {
    name: 'koverr-mvp',
    hooks: {
      'astro:config:setup': ({ injectRoute }) => {
        injectRoute({
          pattern: '/app/',
          entrypoint: new URL('./pages/check.astro', import.meta.url),
        });
      },
    },
  };
}
