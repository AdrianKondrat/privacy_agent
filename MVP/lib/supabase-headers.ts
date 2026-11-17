export function supabaseHeaders(key: string, userToken?: string, admin = false) {
  const headers = new Headers({ apikey: key });
  const bearer = userToken ?? (admin && !key.startsWith('sb_secret_') ? key : undefined);
  if (bearer) headers.set('authorization', 'Bearer ' + bearer);
  return headers;
}
