export const auditSources = {
  '192': {
    name: '192.com',
    search: 'https://www.192.com/',
    hosts: ['192.com', 'www.192.com'],
    scope: 'Search for your name and town.',
    route: 'https://www.192.com/c01/new-request/',
    action: 'Complete the removal form for each relevant address. Open the confirmation link in your email.',
    method: 'Online form',
    kind: 'Listing suppression',
    goal: 'listing',
  },
  ukphonebook: {
    name: 'ukphonebook.com',
    search: 'https://www.ukphonebook.com/residential-telephone-directory',
    hosts: ['ukphonebook.com', 'www.ukphonebook.com'],
    scope: 'Use the free residential phone directory. Stop if the site asks for credits.',
    route: 'https://www.ukphonebook.com/remove-me',
    action: 'Complete the record removal form manually. Use a separate form for each person at an address.',
    method: 'Online form',
    kind: 'Listing suppression',
    goal: 'listing',
  },
  google: {
    name: 'Google Search',
    search: 'https://www.google.co.uk/',
    hosts: [],
    scope: 'Search for your name and town, phone number, or username.',
    route: 'https://support.google.com/websearch/answer/12719076?hl=en-GB',
    action: 'Check the eligibility rules. Request removal of the result if Google shows eligible contact information.',
    method: 'Google removal tool',
    kind: 'Search-result removal',
    goal: 'search',
  },
} as const;

export type SourceId = keyof typeof auditSources;
export const quickSources: readonly SourceId[] = ['192', 'ukphonebook'];
export const deepSources: readonly SourceId[] = [...quickSources, 'google'];

export const optionalRoutes = {
  experian: {
    name: 'Experian UK',
    kind: 'Marketing suppression',
    route: 'https://www.experian.co.uk/privacy/consumer-information-portal/opt-out-options/',
    action: 'Choose the relevant direct marketing opt-out. This applies to marketing data.',
    method: 'Provider opt-out',
    goal: 'marketing',
  },
  register: {
    name: 'Open electoral register',
    kind: 'Open register opt-out',
    route: 'https://www.gov.uk/electoral-register/opt-out-of-the-open-register',
    action: 'Contact your electoral registration office. Ask it to remove your details from the open register.',
    method: 'Electoral registration office',
    goal: 'register',
  },
} as const;

export const removalTargets = { ...auditSources, ...optionalRoutes } as const;
export type TargetId = keyof typeof removalTargets;
