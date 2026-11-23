export async function checkLivePilot(origin: URL, request = fetch) {
  const get = (path: string) => request(new URL(path, origin), {
    redirect: 'error', signal: AbortSignal.timeout(10_000),
  });
  const health = await get('/app/health/').catch(() => null);
  if (!health || health.status !== 200 || await health.text().catch(() => '') !== 'ok\n') {
    throw new Error('The pilot health endpoint did not return its expected response.');
  }
  const page = await get('/app/audit/').catch(() => null);
  const html = await page?.text().catch(() => '');
  if (!page || page.status !== 200 || !html?.includes('data-koverr-pilot="invite-only"') || !html.includes('Assisted audit')) {
    throw new Error('The live invite-only form is unavailable at the specified origin.');
  }
}

if (import.meta.main) {
  try {
    const origin = URL.parse(process.argv[2] ?? '');
    if (process.argv.length !== 3 || !origin || origin.protocol !== 'https:' || origin.href !== origin.origin + '/') {
      throw new Error('Usage: node MVP/scripts/check-live-pilot.ts https://pilot.example.com');
    }
    await checkLivePilot(origin);
    console.log('The health endpoint and live invite-only form are available.');
  } catch (error) {
    console.error(error instanceof Error ? error.message : 'The pilot check failed.');
    process.exitCode = 1;
  }
}
