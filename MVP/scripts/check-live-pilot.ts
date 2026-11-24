export async function checkLivePilot(origin: URL, request = fetch) {
  const get = (path: string, redirect: RequestRedirect = 'error') => request(new URL(path, origin), {
    redirect, signal: AbortSignal.timeout(10_000),
  }).catch(() => null);
  const [health, page, root, app, sample, waitlist] = await Promise.all([
    get('/app/health/'),
    get('/app/audit/'),
    get('/', 'manual'),
    get('/app/', 'manual'),
    get('/app/?sample=1'),
    get('/api/launch-list/', 'manual'),
  ]);
  if (!health || health.status !== 200 || await health.text().catch(() => '') !== 'ok\n') {
    throw new Error('The pilot health endpoint did not return its expected response.');
  }
  const html = await page?.text().catch(() => '');
  if (!page || page.status !== 200 || !html?.includes('data-koverr-pilot="invite-only"') ||
      !html.includes('Assisted audit') || !page.headers.get('cache-control')?.includes('no-store')) {
    throw new Error('The live invite-only form is unavailable at the specified origin.');
  }
  if (root?.status !== 302 || root.headers.get('location') !== '/app/' ||
      app?.status !== 302 || app.headers.get('location') !== '/app/audit/') {
    throw new Error('The pilot root and app routes did not redirect to the audit.');
  }
  const sampleHtml = await sample?.text().catch(() => '');
  if (sample?.status !== 200 || !sampleHtml?.includes('These findings are fictional.')) {
    throw new Error('The fictional sample is unavailable.');
  }
  if (waitlist?.status !== 404) {
    throw new Error('The isolated pilot must return 404 for the landing signup route.');
  }
}

if (import.meta.main) {
  try {
    const origin = URL.parse(process.argv[2] ?? '');
    if (process.argv.length !== 3 || !origin || origin.protocol !== 'https:' || origin.href !== origin.origin + '/') {
      throw new Error('Usage: node MVP/scripts/check-live-pilot.ts https://pilot.example.com');
    }
    await checkLivePilot(origin);
    console.log('The invite-only audit, health, redirects, fictional sample and landing isolation passed.');
  } catch (error) {
    console.error(error instanceof Error ? error.message : 'The pilot check failed.');
    process.exitCode = 1;
  }
}
