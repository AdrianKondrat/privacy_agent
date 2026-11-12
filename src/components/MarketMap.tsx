import { useEffect, useMemo, useRef, useState } from 'react';
import { hierarchy, treemap, treemapSquarify } from 'd3-hierarchy';

interface Item { id: string; name: string; value: number; year?: number; level: number; detail?: string[]; share?: number }
interface Sector { id: string; name: string; note: string; items: Item[] }
interface Props { sectors: Sector[]; asOf: string; kind?: 'breaches' | 'trackers'; total?: number }

type Node = { name: string; value?: number; item?: Item; sector?: Sector; children?: Node[] };

// What a leaked detail is worth to someone else, and what it can cost the person. Koverr's own plain-language reading,
// not a measurement: a detail being present in a breach does not show it was used.
const reading: Record<string, [gain: string, cost: string]> = {
  'Email addresses': ['Sold on to marketers and used as the target list for phishing.', 'Phishing that looks like your bank or a parcel firm.'],
  Passwords: ['Tried against your other accounts by criminals, in bulk.', 'An account taken over: money moved, purchases made, a locked-out inbox.'],
  'Phone numbers': ['Added to call and text lists that are bought and sold.', 'Scam calls, and number-swap attempts on your mobile account.'],
  'Physical addresses': ['Matched into people-search profiles and sold with them.', 'Mail fraud and credit applications made in your name.'],
  'Dates of birth': ['The missing piece that makes a profile worth more.', 'Identity checks passed by someone who isn’t you.'],
  'Government issued IDs': ['Sold at a premium for identity fraud.', 'Loans, accounts and benefits claimed in your name.'],
  'Partial credit card data': ['Used to make a phone scam sound genuine.', 'A caller who knows your card’s last digits is believed.'],
  'Credit status information': ['Used to pick targets who can borrow.', 'Credit offers and loan scams aimed at you.'],
  'Income levels': ['Used to rank people by how much they can be charged.', 'Scams and prices tuned to what you can pay.'],
  'Net worths': ['Used to rank people by how much they can be charged.', 'Scams and prices tuned to what you can pay.'],
  'Financial investments': ['Sold to investment-scam lead lists.', 'Fake investment pitches, the costliest scam type reported.'],
  Purchases: ['Sold to advertisers and data resellers.', 'A buying history that lets a scam sound like a refund.'],
  'IP addresses': ['Matched to a home and a device.', 'Your approximate location, tied to your name.'],
  'Geographic locations': ['Matched to a home and a device.', 'Your approximate location, tied to your name.'],
  Names: ['Joins the other details into one profile.', 'A caller who knows your name is believed.'],
};
const fallback: [string, string] = ['Combined with other details into a profile that can be sold.', 'More detail for anyone trying to sound like someone you trust.'];

// Plain-language line under each breach name: what kind of source it was. Koverr's own reading of the sector, not a claim about
// any single breach. Falls back to the sector name, so regenerated data with a new sector still reads.
const kindOf: Record<string, string> = {
  compiled: 'Stolen logins from many sites',
  brokers: 'Data broker or mailing list',
  social: 'Social or dating site',
  media: 'Media or games site',
  shops: 'Shop or service',
  software: 'Online tool',
  rest: 'Many smaller breaches',
};

const compact = new Intl.NumberFormat('en-GB', { notation: 'compact', maximumFractionDigits: 1 });
const whole = new Intl.NumberFormat('en-GB');
const levelWords = {
  breaches: ['Varied', 'Contact details', 'Personal details', 'Logins or private details', 'Identity or financial details'],
  trackers: ['Not measured', 'Rarely sends an ID', 'Sometimes sends an ID', 'Often sends an ID', 'Usually sends an ID'],
};

const layouts = {
  wide: { width: 1200, height: 560 },
  mid: { width: 800, height: 600 },
  narrow: { width: 390, height: 560 },
};

export default function MarketMap({ sectors, asOf, kind = 'breaches' }: Props) {
  const frame = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<keyof typeof layouts>('wide');
  const ordered = useMemo(() => [...sectors].sort((a, b) => b.items.reduce((s, i) => s + i.value, 0) - a.items.reduce((s, i) => s + i.value, 0)), [sectors]);
  const biggest = useMemo(() => ordered.flatMap(s => s.items).filter(i => i.level >= 3).sort((a, b) => b.value - a.value)[0], [ordered]);
  const [selected, setSelected] = useState<string>(biggest.id);

  useEffect(() => {
    const element = frame.current;
    if (!element) return;
    const observe = () => setMode(element.clientWidth < 640 ? 'narrow' : element.clientWidth < 900 ? 'mid' : 'wide');
    observe();
    const observer = new ResizeObserver(observe);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const size = layouts[mode];
  const { sectorBoxes, tiles } = useMemo(() => {
    const root = hierarchy<Node>({
      name: 'all',
      children: ordered.map(sector => ({ name: sector.name, sector, children: sector.items.map(item => ({ name: item.name, item, value: item.value })) })),
    }).sum(node => node.value ?? 0).sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
    const laid = treemap<Node>().tile(treemapSquarify).size([size.width, size.height]).paddingInner(3).paddingTop(d => (d.depth === 1 ? 30 : 0)).round(true)(root);
    const placed = laid.descendants();
    return {
      sectorBoxes: placed.filter(d => d.depth === 1),
      tiles: placed.filter(d => d.depth === 2),
    };
  }, [ordered, size.width, size.height]);

  const current = ordered.flatMap(s => s.items.map(item => ({ item, sector: s }))).find(entry => entry.item.id === selected)!;
  const [gain, cost] = useMemo(() => {
    if (kind === 'trackers') {
      const sites = whole.format(current.item.value);
      return [[current.sector.note], [`Its code runs on ${sites} of the 10,000 most-visited sites, so your visits to them can reach it.`, current.item.share ? `It sent an identifier able to single out a browser on ${(current.item.share * 100).toFixed(1)}% of measured visits.` : 'Whether it sent an identifier is not measured here.']] as [string[], string[]];
    }
    const rows = (current.item.detail ?? []).map(d => reading[d]).filter(Boolean);
    const unique = (index: 0 | 1) => [...new Set(rows.map(row => row[index]))].slice(0, 3);
    return rows.length ? [unique(0), unique(1)] : [[fallback[0]], [fallback[1]]];
  }, [current, kind]);

  const pct = (value: number, of: number) => `${(value / of) * 100}%`;
  const unit = kind === 'breaches' ? 'records' : 'sites';
  const gloss = (item: Item, sector: Sector) => (kind === 'breaches' ? [kindOf[sector.id] ?? sector.name, item.year].filter(Boolean).join(' · ') : sector.name);
  const [showAll, setShowAll] = useState(false);
  // The 'rest' bucket is a total of many small sources, not a source: it goes last so it doesn't read as the biggest one.
  const ranked = useMemo(() => ordered.flatMap(sector => sector.items.map(item => ({ item, sector }))).sort((a, b) => Number(a.sector.id === 'rest') - Number(b.sector.id === 'rest') || b.item.value - a.item.value), [ordered]);
  const top = ranked[0].item.value;
  const visible = showAll ? ranked : ranked.slice(0, 8);

  const ledger = (inline: boolean) => (
    <aside className={inline ? 'market-ledger market-ledger-inline' : 'market-ledger'} aria-live="polite" aria-label={kind === 'breaches' ? 'Selected breach' : 'Selected company'}>
      {!inline && <h3>{current.item.name}</h3>}
      <p className="ledger-gloss">{gloss(current.item, current.sector)}</p>
      <p className="ledger-meta">{whole.format(current.item.value)} {unit}</p>
      {kind === 'breaches' && (current.item.detail?.length ? <p className="ledger-data">{current.item.detail.join(', ')}</p> : <p className="ledger-data">Data types aren’t broken down for this group.</p>)}
      <div className="ledger-side ledger-gain">
        <h4>{kind === 'breaches' ? 'Who can use it' : 'Who gains'}</h4>
        <ul>{gain.map(line => <li key={line}>{line}</li>)}</ul>
      </div>
      <div className="ledger-side ledger-loss">
        <h4>{kind === 'breaches' ? 'What it can cost you' : 'What it means for you'}</h4>
        <ul>{cost.map(line => <li key={line}>{line}</li>)}</ul>
      </div>
      <p className="ledger-note">{kind === 'breaches' ? 'Being in a breach doesn’t show a detail was used. It shows the material exists and who may hold it. One person appears in many breaches.' : 'Presence is not proof of misuse: a file network and an ad exchange do different things. Sites can use several companies, so counts overlap.'}</p>
    </aside>
  );

  const head = (
    <div className="market-head">
      <span className="market-title">{kind === 'breaches' ? 'Breached account records by source' : 'Companies whose code runs on the 10,000 most-visited sites'}</span>
      <span className="market-sub">{kind === 'breaches' ? `Size is records. Shade is what was exposed. Have I Been Pwned, ${asOf}.` : `Size is sites carrying the code. Shade is how often it sent an identifier. WhoTracks.me, ${asOf}.`}</span>
    </div>
  );
  const key = (
    <div className="market-key" aria-hidden="true">
      <span>{kind === 'breaches' ? 'Exposed:' : 'Tracking:'}</span>
      {(kind === 'breaches' ? [0, 1, 2, 3, 4] : [1, 2, 3, 4]).map(level => <span key={level} className="key-step" data-level={level}>{levelWords[kind][level]}</span>)}
    </div>
  );

  // Phones: a treemap's small tiles cannot hold readable labels, so the same data is a ranked list, largest first.
  if (mode === 'narrow') {
    return (
      <div className="market market-list" data-kind={kind}>
        <div className="market-board" ref={frame}>
          {head}
          <ol className="rank">
            {visible.map(({ item, sector }) => {
              const open = selected === item.id;
              return (
                <li key={item.id} data-level={item.level} data-open={open}>
                  <button type="button" className="rank-row" aria-expanded={open} onClick={() => setSelected(item.id)}>
                    <span className="rank-name">{item.name}</span>
                    <span className="rank-value">{compact.format(item.value)}</span>
                    <span className="rank-sector">{gloss(item, sector)}</span>
                    <span className="rank-bar" aria-hidden="true"><span style={{ width: `${Math.max(2, (item.value / top) * 100)}%` }}></span></span>
                  </button>
                  {open && ledger(true)}
                </li>
              );
            })}
          </ol>
          {ranked.length > 8 && <button type="button" className="rank-more" onClick={() => setShowAll(value => !value)}>{showAll ? 'Show the top 8' : `Show all ${ranked.length}`}</button>}
          {key}
        </div>
      </div>
    );
  }

  return (
    <div className="market" data-kind={kind}>
      <div className="market-board" ref={frame}>
        {head}
        <div className="market-canvas" data-ui style={{ aspectRatio: `${size.width} / ${size.height}` }}>
          {sectorBoxes.map(box => (
            <div key={box.data.sector!.id} className="market-sector" style={{ left: pct(box.x0, size.width), top: pct(box.y0, size.height), width: pct(box.x1 - box.x0, size.width), height: pct(box.y1 - box.y0, size.height) }}>
              <span>{box.data.sector!.name} · {compact.format(box.value ?? 0)}</span>
            </div>
          ))}
          {tiles.map((tile, index) => {
            const item = tile.data.item!;
            const w = tile.x1 - tile.x0;
            const h = tile.y1 - tile.y0;
            const full = w > 135 && h > 100;
            const label = w > 112 && h > 46;
            const big = w > 150 && h > 150;
            return (
              <button key={item.id} type="button" className="market-tile" data-level={item.level} aria-pressed={selected === item.id}
                aria-label={`${item.name}, ${gloss(item, tile.parent!.data.sector!)}, ${whole.format(item.value)} ${unit}`}
                style={{ left: pct(tile.x0, size.width), top: pct(tile.y0, size.height), width: pct(w, size.width), height: pct(h, size.height), '--i': index } as React.CSSProperties}
                onClick={() => setSelected(item.id)}>
                {label && <span className="tile-head"><span className="tile-name">{item.name}</span>{big && <span className="tile-gloss">{gloss(item, tile.parent!.data.sector!)}</span>}</span>}
                {full && <span className="tile-value">{compact.format(item.value)}</span>}
              </button>
            );
          })}
        </div>
        {key}
      </div>
      {ledger(false)}
    </div>
  );
}
