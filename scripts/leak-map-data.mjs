// Builds src/data/leak-map.json from two public datasets:
//   - Have I Been Pwned breach list (CC BY 4.0)            https://haveibeenpwned.com/API/v3#AllBreaches
//   - WhoTracks.me monthly company statistics (CC BY 4.0)  https://github.com/whotracksme/whotracks.me
// Sector grouping, short names and severity levels are Koverr's own labels, defined below.
// Usage: npm run leak-map-data            (latest WhoTracks.me month)
//        npm run leak-map-data -- 2026-10 (a specific month)
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const out = fileURLToPath(new URL('../src/data/leak-map.json', import.meta.url));
const agent = { 'User-Agent': 'leak-map-data-script' };
const get = async (url) => {
  const response = await fetch(url, { headers: agent, signal: AbortSignal.timeout(60000) });
  if (!response.ok) throw new Error(url + ' returned ' + response.status);
  return response;
};

// ---------- Breaches ----------

const breachSectors = [
  ['compiled', 'Criminal compilations', 'Combo lists and stealer logs: logins gathered from many breaches and infected devices, then traded.'],
  ['brokers', 'Data brokers and marketing lists', 'Companies that collect and sell profiles, and the lists spammers build from them.'],
  ['social', 'Social and dating', 'Networks, communities and dating services.'],
  ['media', 'Media and games', 'Streaming, publishing, games and betting.'],
  ['shops', 'Shops and services', 'Retail, web portals, fitness, family history and telecoms.'],
  ['software', 'Software and tools', 'Design, documents, storage and other online tools.'],
  ['rest', 'Everything else', 'The long tail of smaller breaches.'],
];

// HIBP breach name -> [sector, short label]. Breaches outside this list fall into "Everything else".
const breachLabels = {
  SynthientCredentialStuffingThreatData: ['compiled', 'Synthient credential list'],
  Collection1: ['compiled', 'Collection #1'],
  ExploitIn: ['compiled', 'Exploit.In'],
  AntiPublic: ['compiled', 'Anti Public'],
  TelegramCombolists: ['compiled', 'Telegram combo lists'],
  AlienStealerLogs: ['compiled', 'ALIEN TXTBASE logs'],
  NotSOCRadar: ['compiled', 'Not SOCRadar'],
  Cit0day: ['compiled', 'Cit0day'],
  SynthientStealerLogThreatData: ['compiled', 'Synthient stealer logs'],
  Pemiblanc: ['compiled', 'Pemiblanc'],
  DataTrollStealerLogs: ['compiled', 'Data Troll logs'],
  '2844Breaches': ['compiled', '2,844 breaches'],
  StealerLogsJan2025: ['compiled', 'Stealer logs, Jan 2025'],
  NazApi: ['compiled', 'Naz.API'],
  June2026StealerLogs: ['compiled', 'Stealer logs, Jun 2026'],
  KayoMoe: ['compiled', 'Kayo.moe list'],
  VerificationsIO: ['brokers', 'Verifications.io'],
  OnlinerSpambot: ['brokers', 'Onliner Spambot'],
  PDL: ['brokers', 'People Data Labs'],
  RiverCityMedia: ['brokers', 'River City Media'],
  NationalPublicData: ['brokers', 'National Public Data'],
  Exactis: ['brokers', 'Exactis'],
  Apollo: ['brokers', 'Apollo'],
  DemandScience: ['brokers', 'DemandScience'],
  B2BUSABusinesses: ['brokers', 'B2B USA Businesses'],
  LeadHunter: ['brokers', 'Lead Hunter'],
  YouveBeenScraped: ['brokers', 'You’ve Been Scraped'],
  ModernBusinessSolutions: ['brokers', 'Modern Business Solutions'],
  NotAcxiom: ['brokers', 'Not Acxiom'],
  Straffic: ['brokers', 'Straffic'],
  DataAndLeads: ['brokers', 'Data & Leads'],
  TrikSpamBotnet: ['brokers', 'Trik spam botnet'],
  ShareThis: ['brokers', 'ShareThis'],
  Facebook: ['social', 'Facebook'],
  MySpace: ['social', 'MySpace'],
  Wattpad: ['social', 'Wattpad'],
  Twitter200M: ['social', 'Twitter'],
  AdultFriendFinder2016: ['social', 'Adult FriendFinder'],
  LinkedIn: ['social', 'LinkedIn'],
  Dubsmash: ['social', 'Dubsmash'],
  LinkedInScrape: ['social', 'LinkedIn scrape'],
  Gravatar: ['social', 'Gravatar'],
  Badoo: ['social', 'Badoo'],
  VK: ['social', 'VK'],
  Tumblr: ['social', 'Tumblr'],
  Netlog: ['social', 'Netlog'],
  Fling: ['social', 'Fling'],
  Edmodo: ['social', 'Edmodo'],
  Deezer: ['media', 'Deezer'],
  Zynga: ['media', 'Zynga'],
  '1win': ['media', '1win'],
  Youku: ['media', 'Youku'],
  Dailymotion: ['media', 'Dailymotion'],
  ThePostMillennial: ['media', 'The Post Millennial'],
  Suno: ['media', 'Suno'],
  iMesh: ['media', 'iMesh'],
  NetEase: ['shops', 'NetEase'],
  MyFitnessPal: ['shops', 'MyFitnessPal'],
  Evite: ['shops', 'Evite'],
  MyHeritage: ['shops', 'MyHeritage'],
  Rambler: ['shops', 'Rambler'],
  AdvanceAutoParts: ['shops', 'Advance Auto Parts'],
  JD: ['shops', 'JD.com'],
  Luxottica: ['shops', 'Luxottica'],
  UnderArmour: ['shops', 'Under Armour'],
  Tokopedia: ['shops', 'Tokopedia'],
  HotTopic: ['shops', 'Hot Topic'],
  AllegedATT: ['shops', 'AT&T (alleged)'],
  Houzz: ['shops', 'Houzz'],
  Adobe: ['software', 'Adobe'],
  Canva: ['software', 'Canva'],
  Nitro: ['software', 'Nitro'],
  Dropbox: ['software', 'Dropbox'],
  piZap: ['software', 'piZap'],
};
const breachesShown = 64;

// Severity by the most sensitive kind of data in the breach. 4 is worst.
const severe = [
  [4, /government issued id|passport|social security|bank account|^credit cards$|credit card cvv|driver'?s licen|national id|tax/i],
  [3, /^passwords$|password hint|security question|auth token|private message|email message|partial credit card|health|medical|sexual|pins?$|biometric|chat log|sms message/i],
  [2, /phone number|physical address|dates? of birth|latitude|home ownership|vehicle|family|income|net worth|credit status/i],
];
const breachLevel = (classes) => {
  for (const [level, pattern] of severe) if (classes.some(name => pattern.test(name))) return level;
  return 1;
};

async function breaches() {
  const list = await (await get('https://haveibeenpwned.com/api/v3/breaches')).json();
  const ranked = list.filter(entry => !entry.IsFabricated && !entry.IsRetired && breachLabels[entry.Name])
    .sort((a, b) => b.PwnCount - a.PwnCount).slice(0, breachesShown);
  const totalAccounts = list.reduce((sum, entry) => sum + entry.PwnCount, 0);
  const shownAccounts = ranked.reduce((sum, entry) => sum + entry.PwnCount, 0);
  const sectors = breachSectors.map(([id, name, note]) => ({
    id, name, note,
    items: ranked.filter(entry => breachLabels[entry.Name][0] === id).map(entry => ({
      id: entry.Name,
      name: breachLabels[entry.Name][1],
      value: entry.PwnCount,
      year: Number(entry.BreachDate.slice(0, 4)),
      level: breachLevel(entry.DataClasses),
      detail: [...entry.DataClasses].sort(),
    })),
  }));
  sectors.at(-1).items.push({
    id: 'rest',
    name: (list.length - ranked.length).toLocaleString('en-GB') + ' smaller breaches',
    value: totalAccounts - shownAccounts,
    level: 0,
    detail: [],
  });
  return {
    asOf: list.map(entry => entry.AddedDate).sort().at(-1).slice(0, 10),
    total: totalAccounts,
    count: list.length,
    sectors: sectors.filter(sector => sector.items.length),
  };
}

// ---------- Third parties on popular websites ----------

const trackerSectors = [
  ['platforms', 'Platforms', 'Companies that run advertising, analytics and social tools under one roof.'],
  ['adtech', 'Ad exchanges and bidders', 'They auction the chance to show you an advert, and need to recognise you to do it.'],
  ['identity', 'Identity, data and measurement', 'They link what you do across sites and devices into a profile, or measure audiences.'],
  ['analytics', 'Analytics and monitoring', 'Site owners use them to study visitors or catch errors.'],
  ['infra', 'Infrastructure', 'Networks that deliver files. They see your address and the page you asked for, and mostly stop there.'],
  ['service', 'Payments and consent', 'Checkout and cookie-banner providers. Payment firms identify devices to stop fraud.'],
  ['other', 'Other third parties', 'In the same ranking, not yet labelled by us.'],
];

// WhoTracks.me company id -> [sector, display name]. Unlisted ids fall into "Other third parties".
const trackerLabels = {
  google: ['platforms', 'Google'],
  amazon_associates: ['platforms', 'Amazon'],
  microsoft: ['platforms', 'Microsoft'],
  facebook: ['platforms', 'Meta'],
  twitter: ['platforms', 'X (Twitter)'],
  bytedance_inc: ['platforms', 'TikTok (ByteDance)'],
  yahoo: ['platforms', 'Yahoo'],
  pinterest: ['platforms', 'Pinterest'],
  reddit: ['platforms', 'Reddit'],
  yandex: ['platforms', 'Yandex'],
  criteo: ['adtech', 'Criteo'],
  pubmatic: ['adtech', 'PubMatic'],
  the_trade_desk: ['adtech', 'The Trade Desk'],
  magnite: ['adtech', 'Magnite'],
  index_exchange: ['adtech', 'Index Exchange'],
  outbrain: ['adtech', 'Outbrain'],
  equativ: ['adtech', 'Equativ'],
  rtb_house: ['adtech', 'RTB House'],
  triplelift: ['adtech', 'TripleLift'],
  openx: ['adtech', 'OpenX'],
  nexxen: ['adtech', 'Nexxen'],
  taboola: ['adtech', 'Taboola'],
  adform: ['adtech', 'Adform'],
  'media.net': ['adtech', 'Media.net'],
  improve_digital: ['adtech', 'Improve Digital'],
  sovrn: ['adtech', 'Sovrn'],
  onetag: ['adtech', 'OneTag'],
  blockthrough: ['adtech', 'Blockthrough'],
  rich_audience: ['adtech', 'Rich Audience'],
  conversant: ['adtech', 'Epsilon (Conversant)'],
  seedtag: ['adtech', 'Seedtag'],
  sharethrough: ['adtech', 'Sharethrough'],
  '33across': ['adtech', '33Across'],
  comcast: ['adtech', 'FreeWheel (Comcast)'],
  id5_technology_ltd: ['identity', 'ID5'],
  acxiom: ['identity', 'Acxiom / LiveRamp'],
  comscore: ['identity', 'Comscore'],
  lotame: ['identity', 'Lotame'],
  quantcast: ['identity', 'Quantcast'],
  neustar: ['identity', 'Neustar (TransUnion)'],
  integral_ad_science: ['identity', 'Integral Ad Science'],
  liveintent: ['identity', 'LiveIntent'],
  adobe: ['analytics', 'Adobe'],
  sentry: ['analytics', 'Sentry'],
  new_relic: ['analytics', 'New Relic'],
  automattic: ['analytics', 'Automattic'],
  datadog: ['analytics', 'Datadog'],
  bugsnag: ['analytics', 'Bugsnag'],
  hotjar: ['analytics', 'Hotjar'],
  cloudflare: ['infra', 'Cloudflare'],
  jsdelivr: ['infra', 'jsDelivr'],
  js_foundation: ['infra', 'jQuery CDN'],
  unpkg: ['infra', 'unpkg'],
  akamai: ['infra', 'Akamai'],
  fontawesome_com: ['infra', 'Font Awesome'],
  bootstrap_cdn: ['infra', 'Bootstrap CDN'],
  jw_player: ['infra', 'JW Player'],
  onetrust: ['service', 'OneTrust'],
  paypal: ['service', 'PayPal'],
  stripe: ['service', 'Stripe'],
};
// Present in the measurements because antivirus software on visitors' own machines adds it to pages,
// not because websites embed it.
const trackerSkip = new Set(['AO Kaspersky Lab']);
const trackersShown = 60;
// Share of visits on which the company sent an identifier able to single out the browser.
const trackerLevel = (share) => share >= .4 ? 4 : share >= .2 ? 3 : share >= .05 ? 2 : 1;
const titleCase = (id) => id.replace(/_/g, ' ').replace(/\b[a-z]/g, letter => letter.toUpperCase());

async function latestMonth() {
  const listing = await (await get('https://s3.amazonaws.com/data.whotracks.me/?list-type=2&delimiter=/')).text();
  return [...listing.matchAll(/<Prefix>(\d{4}-\d{2})\/<\/Prefix>/g)].map(match => match[1]).sort().at(-1);
}

async function trackers(month) {
  const csv = await (await get(`https://s3.amazonaws.com/data.whotracks.me/${month}/global/companies.csv`)).text();
  const [header, ...lines] = csv.trim().split('\n');
  const keys = header.split(',');
  const rows = lines.map(line => line.split(',')).filter(cells => cells.length === keys.length)
    .map(cells => Object.fromEntries(cells.map((cell, index) => [keys[index], cell])));
  const ranked = rows.filter(row => !trackerSkip.has(row.company))
    .sort((a, b) => b.site_reach_top10k - a.site_reach_top10k).slice(0, trackersShown);
  const sectors = trackerSectors.map(([id, name, note]) => ({
    id, name, note,
    items: ranked.filter(row => (trackerLabels[row.company]?.[0] ?? 'other') === id).map(row => ({
      id: row.company,
      name: trackerLabels[row.company]?.[1] ?? titleCase(row.company),
      value: Number(row.site_reach_top10k),
      share: Math.round(Number(row.tracked) * 1000) / 1000,
      reach: Math.round(Number(row.reach) * 1000) / 1000,
      level: trackerLevel(Number(row.tracked)),
    })),
  }));
  return { month, companies: rows.length, sectors: sectors.filter(sector => sector.items.length) };
}

const month = process.argv[2] ?? await latestMonth();
if (!/^\d{4}-\d{2}$/.test(month ?? '')) throw new Error('Could not work out which WhoTracks.me month to use.');
const data = { generated: new Date().toISOString().slice(0, 10), breaches: await breaches(), trackers: await trackers(month) };
writeFileSync(out, JSON.stringify(data, null, 1) + '\n');
const tiles = (view) => view.sectors.reduce((sum, sector) => sum + sector.items.length, 0);
console.log(`Wrote ${out}`);
console.log(`Breaches: ${data.breaches.count} listed, ${tiles(data.breaches)} tiles, as of ${data.breaches.asOf}`);
console.log(`Third parties: ${tiles(data.trackers)} of ${data.trackers.companies} companies, month ${data.trackers.month}`);
