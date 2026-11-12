export type PasswordRangeResult = 'found' | 'absent' | 'unavailable';

export async function checkPassword(password: string, request = fetch): Promise<PasswordRangeResult> {
  try {
    const bytes = new TextEncoder().encode(password);
    let digest: ArrayBuffer;
    try {
      // SHA-1 is the range API's lookup format. Koverr does not use it to store passwords.
      digest = await crypto.subtle.digest('SHA-1', bytes);
    } finally {
      bytes.fill(0);
    }
    const hash = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('').toUpperCase();
    const prefix = hash.slice(0, 5);
    const suffix = hash.slice(5);
    const response = await request(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: { 'Add-Padding': 'true' },
      credentials: 'omit',
      redirect: 'error',
      referrerPolicy: 'no-referrer',
      cache: 'no-store',
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) return 'unavailable';

    const entries = (await response.text()).trim().split(/\r?\n/);
    let found = false;
    for (const entry of entries) {
      const match = /^([A-F0-9]{35}):(\d+)$/i.exec(entry);
      if (!match) return 'unavailable';
      if (match[1].toUpperCase() === suffix && Number(match[2]) > 0) found = true;
    }
    return found ? 'found' : 'absent';
  } catch {
    return 'unavailable';
  }
}
