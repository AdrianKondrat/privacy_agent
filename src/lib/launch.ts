// `director` and `address` are the original keys; keep them for signups already stored in SQLite.
export const variants = {
  director: {
    path: '/',
    campaign: false,
    title: 'Find and fix personal data leaks',
    lines: ['Your data is traded.', 'You carry the cost.'],
    intro: 'Breaches, brokers and apps turn your details into other people’s revenue, and your fraud risk. Koverr will find where yours got out, fix what can be fixed, and keep the proof.',
  },
  breach: {
    path: '/breach/',
    campaign: true,
    title: 'Got a breach email? Here’s the fix',
    lines: ['Got a breach email?', 'Here’s the fix.'],
    intro: 'A breach notice tells you what went wrong and leaves the rest to you. Koverr will turn each one into a short list of fixes and stay on it until they’re done.',
  },
  scam: {
    path: '/scam-calls/',
    campaign: true,
    title: 'How did they get your number?',
    lines: ['How did they', 'get your number?'],
    intro: 'Scam calls and spam start with your details on somebody’s list. Koverr will help you find where they got out and work to get them removed.',
  },
  address: {
    path: '/home-address/',
    campaign: true,
    title: 'Find where your home address is exposed online',
    lines: ['Is your home', 'address online?'],
    intro: 'Old listings and public profiles can put your home address a search away. Koverr will help you spot where it appears and work to get it taken down.',
  },
  // The leak map is its own page (src/pages/leak-map.astro); this entry gives its signups a key and a return path.
  map: {
    path: '/leak-map/',
    campaign: false,
    title: 'The leak map: where personal data gets out, and who picks it up',
    lines: ['Where your data leaks.', 'Who picks it up.'],
    intro: 'Two real datasets drawn like a market map: billions of breached account records, and the companies whose code sits on the web’s most-visited sites.',
  },
} as const;
export type Variant = keyof typeof variants;
export const isVariant = (value: unknown): value is Variant => typeof value === 'string' && Object.hasOwn(variants, value);

// Optional questions asked after signup. Keys are stored; labels are shown.
export const regions = [
  ['uk', 'UK'],
  ['eu', 'EU or EEA'],
  ['us', 'US'],
  ['ca', 'Canada'],
  ['au', 'Australia or NZ'],
  ['other', 'Somewhere else'],
] as const;
export const worries = [
  ['breach', 'A data breach'],
  ['scams', 'Scam calls and spam'],
  ['findable', 'My address or number being findable'],
  ['fraud', 'Fraud or account takeover'],
  ['sharing', 'Apps sharing my data'],
] as const;
export type Region = typeof regions[number][0];
export type Worry = typeof worries[number][0];
const keyIn = <Key extends string>(options: readonly (readonly [Key, string])[], value: unknown): Key | null =>
  options.find(([key]) => key === value)?.[0] ?? null;
export const regionKey = (value: unknown) => keyIn(regions, value);
export const worryKey = (value: unknown) => keyIn(worries, value);

export const paths = [
  { name: 'Stolen', what: 'A company you used gets breached, and your login ends up in a dump.', fix: 'Change what was exposed, lock the account, and close it if you’ve stopped using it.', gain: 'Criminals resell the logins and try them on other sites.', cost: 'Account takeover: money moved, purchases made, an inbox you can’t get back into.' },
  { name: 'Sold', what: 'Data brokers and people-search sites trade your name, address and phone number.', fix: 'Opt-out and deletion requests, repeated when a listing comes back.', gain: 'Data brokers charge for profiles built from your name, address and phone number.', cost: 'Scam calls and mail, and your home address a search away.' },
  { name: 'Shared', what: 'Apps and shops pass what you do to advertisers and partners.', fix: 'Object, opt out, and delete the accounts you’ve forgotten.', gain: 'Advertisers and partners pay for what your apps know about you.', cost: 'Ads and offers tuned to you, and a trail you didn’t choose.' },
  { name: 'Published', what: 'Public registers print your details because the law says so.', fix: 'Ask for suppression where the register allows it.', gain: 'Resellers repackage public records into listings.', cost: 'Your name and address in public, with no expiry.' },
  { name: 'Posted', what: 'Old profiles, posts and photos say more than you remember.', fix: 'Tighten the settings, delete what’s stale, ask the host.', gain: 'Scrapers and profile sites collect what you left open.', cost: 'Raw material for convincing impersonation.' },
  { name: 'Indexed', what: 'Search engines and AI assistants surface all of the above.', fix: 'Removal requests to the search engine, once the source is dealt with.', gain: 'Whoever holds the page gets the search traffic.', cost: 'Everything above, found in seconds.' },
] as const;

export const consentVersion = 'launch-invite-v3';
