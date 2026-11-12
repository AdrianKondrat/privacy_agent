import { useMemo, useState } from 'react';
import { hierarchy, cluster } from 'd3-hierarchy';
import data from '../data/leak-map.json';

type Action = 'hide' | 'remove' | 'unknown';
type View = 'sample' | 'breaches' | 'trackers';
interface Source { id: string; name: string; value: number; detail?: string[]; year?: number; share?: number; action?: Action; public?: boolean }
interface Group { id: string; name: string; note: string; items: Source[] }
interface Branch { name: string; group?: Group; item?: Source; children?: Branch[]; value?: number }
const sample: Group[] = [
  { id: 'published', name: 'Public listings', note: 'Fictional public pages that list personal details.', items: [
    { id: 'directory', name: 'People directory', value: 5, detail: ['Name', 'Email', 'Phone', 'Address', 'Age'], action: 'remove', public: true },
    { id: 'broker', name: 'Broker listing', value: 4, detail: ['Name', 'Phone', 'Address', 'Age'], action: 'remove', public: true },
    { id: 'register', name: 'Public register', value: 3, detail: ['Name', 'Address', 'Occupation'], action: 'unknown', public: true },
  ] },
  { id: 'posted', name: 'Social profiles', note: 'Fictional profiles with details visible to everyone.', items: [
    { id: 'social', name: 'Social profile', value: 4, detail: ['Name', 'Location', 'Birth date', 'Occupation'], action: 'hide', public: true },
    { id: 'forum', name: 'Forum profile', value: 2, detail: ['Username', 'Email'], action: 'hide', public: true },
  ] },
  { id: 'indexed', name: 'Search results', note: 'Fictional search copies. Hiding a result does not delete its source.', items: [
    { id: 'search', name: 'Search snippet', value: 3, detail: ['Name', 'Phone', 'Address'], action: 'hide', public: true },
  ] },
  { id: 'shared', name: 'App sharing', note: 'Fictional sharing with third parties. This is not a public listing.', items: [
    { id: 'shopping', name: 'Shopping app', value: 3, detail: ['Email', 'Location', 'Device ID'], action: 'unknown', public: false },
    { id: 'fitness', name: 'Fitness app', value: 2, detail: ['Location', 'Device ID'], action: 'unknown', public: false },
  ] },
  { id: 'stolen', name: 'Known breaches', note: 'Fictional leaked copies. Removal cannot be verified in this example.', items: [
    { id: 'oldaccount', name: 'Old account breach', value: 4, detail: ['Email', 'Username', 'Password', 'Phone'], action: 'unknown', public: false },
  ] },
];
const format = new Intl.NumberFormat('en-GB', { notation: 'compact', maximumSignificantDigits: 3 });
const actionNames: Record<Action, string> = { hide: 'Can be hidden · demo', remove: 'Removal candidate · demo', unknown: 'No verified removal' };
// Rounded so the server and the browser draw identical paths (floating-point sin/cos differ in the last digits).
const round = (value: number) => Math.round(value * 100) / 100;
const polar = (angle: number, radius: number) => [round(Math.sin(angle) * radius), round(-Math.cos(angle) * radius)];
export default function LeakMap() {
  const [view, setView] = useState<View>('sample');
  const [filter, setFilter] = useState('all');
  const [kind, setKind] = useState('all');
  const [preview, setPreview] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const groups: Group[] = view === 'sample' ? sample : data[view].sectors;
  const all = groups.flatMap(group => group.items.map(item => ({ item, group })));
  const kinds = [...new Set(all.flatMap(({ item }) => item.detail ?? []))].sort();
  const filtered = groups.map(group => ({ ...group, items: group.items.filter(item =>
    (kind === 'all' || item.detail?.includes(kind)) && (filter === 'all' || (filter === 'public' ? item.public : item.action === filter)))
      .map(item => ({ ...item, value: view === 'sample' && kind !== 'all' ? 1 : item.value })) })).filter(group => group.items.length);
  const items = filtered.flatMap(group => group.items.map(item => ({ item, group })));
  const total = items.reduce((sum, { item }) => sum + item.value, 0);
  const reducible = items.filter(({ item }) => item.action === 'hide' || item.action === 'remove').reduce((sum, { item }) => sum + item.value, 0);
  const remaining = preview ? total - reducible : total;
  const nodes = useMemo(() => {
    const root = hierarchy<Branch>({ name: 'Exposure', children: filtered.map(group => ({ name: group.name, group, children: group.items.map(item => ({ name: item.name, item, group, value: item.value })) })) }).sum(d => d.value ?? 0);
    return cluster<Branch>().size([Math.PI * 2, 240]).separation((a, b) => a.parent === b.parent ? 1 : 1.8)(root).descendants().filter(node => node.depth > 0);
  }, [view, filter, kind]);
  const focused = items.find(({ item }) => item.id === (hovered ?? selected));
  const isSample = view === 'sample';
  const unit = isSample ? 'data appearances' : view === 'breaches' ? 'account records' : 'site–company pairs';
  const changeView = (next: View) => { setView(next); setFilter('all'); setKind('all'); setSelected(null); setHovered(null); setPreview(false); };
  const clear = () => { setFilter('all'); setKind('all'); setSelected(null); setHovered(null); setPreview(false); };
  return <div className="radial-map">
    <div className="radial-toolbar">
      <div className="radial-tabs" role="group" aria-label="Dataset">
        {(['sample', 'breaches', 'trackers'] as View[]).map(key => <button key={key} type="button" aria-pressed={view === key} onClick={() => changeView(key)}>{ { sample: 'A sample footprint', breaches: 'Known breaches', trackers: 'Web tracking' }[key]}</button>)}
      </div>
      <span className="radial-provenance">{isSample ? 'Fictional person · illustrative data' : view === 'breaches' ? `Have I Been Pwned · ${data.breaches.asOf}` : `WhoTracks.me · ${data.trackers.month}`}</span>
    </div>
    <div className="radial-filters">
      {isSample && <label>Show exposure<select value={filter} onChange={event => { setFilter(event.target.value); setSelected(null); }}><option value="all">All sources</option><option value="public">Publicly visible</option><option value="hide">Can be hidden · demo</option><option value="remove">Removal candidates · demo</option><option value="unknown">No verified removal</option></select></label>}
      {view !== 'trackers' && <label>Personal data<select value={kind} onChange={event => { setKind(event.target.value); setSelected(null); }}><option value="all">All data types</option>{kinds.map(value => <option key={value}>{value}</option>)}</select></label>}
      {isSample && <label className="radial-toggle"><input type="checkbox" checked={preview} onChange={event => setPreview(event.target.checked)} /><span>Preview after hiding & removal</span></label>}
      <button className="radial-reset" type="button" onClick={clear}>Reset view</button>
    </div>
    <div className="radial-workspace">
      <figure className="radial-figure">
        <svg viewBox="-390 -330 780 660" className="radial-chart" role="group" aria-label="Radial tree. Centre: footprint. Branches: source groups. End nodes: individual sources. Select a source to inspect it.">
          {nodes.map(node => {
            const { group, item } = node.data;
            const removed = preview && (item ? item.action === 'hide' || item.action === 'remove' : group!.items.every(i => i.action === 'hide' || i.action === 'remove'));
            const [x, y] = polar(node.x, node.y);
            const parent = node.parent!;
            const [px, py] = parent.depth ? polar(parent.x, parent.y) : polar(node.x, 68);
            const [cx, cy] = polar(node.x, (node.y + (parent.depth ? parent.y : 68)) / 2);
            const [pcx, pcy] = polar(parent.depth ? parent.x : node.x, (node.y + (parent.depth ? parent.y : 68)) / 2);
            const radius = item ? 5 + 14 * Math.sqrt(item.value / Math.max(...items.map(({ item }) => item.value), 1)) : 7;
            const label = item?.name ?? group!.name;
            const active = item && (selected === item.id || hovered === item.id);
            const showLabel = !item || isSample || active || item.value >= Math.max(...items.map(({ item }) => item.value), 1) * .35;
            return <g key={item ? `source-${item.id}` : `group-${group!.id}`}>
              <path className="radial-branch" data-active={Boolean(active)} data-removed={Boolean(removed)} d={`M${px},${py} C${pcx},${pcy} ${cx},${cy} ${x},${y}`} />
              <g transform={`translate(${x},${y})`} className={item ? 'radial-node' : undefined} role={item ? 'button' : undefined} tabIndex={item ? 0 : undefined} aria-pressed={item ? selected === item.id : undefined}
                aria-label={item ? `${item.name}: ${format.format(item.value)} ${unit}${isSample ? '. ' + actionNames[item.action!] : ''}` : undefined}
                onMouseEnter={() => item && setHovered(item.id)} onMouseLeave={() => setHovered(null)}
                onFocus={() => item && setHovered(item.id)} onBlur={() => setHovered(null)}
                onClick={() => item && setSelected(selected === item.id ? null : item.id)}
                onKeyDown={event => { if (item && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); setSelected(selected === item.id ? null : item.id); } }}>
                <title>{label}: {format.format(node.value ?? 0)} {unit}{removed ? ' · hidden or removed in preview' : ''}</title>
                {item && <circle r={Math.max(22, radius + 5)} fill="transparent" />}
                <circle className="radial-node-dot" data-active={Boolean(active)} data-removed={Boolean(removed)} r={radius} />
                {showLabel && <text x={item ? (x >= 0 ? radius + 8 : -radius - 8) : 0} y={item ? 4 : -16} textAnchor={item ? (x >= 0 ? 'start' : 'end') : 'middle'} className={item ? 'tree-source-label' : 'tree-group-label'}>{label.length > 21 ? label.slice(0, 19) + '…' : label}</text>}
                {item && isSample && <text textAnchor="middle" y="4" className="tree-node-count" data-removed={Boolean(removed)}>{item.value}</text>}
              </g>
            </g>;
          })}
          <circle className="radial-hub" r="68" />
          <text textAnchor="middle" y="-17" className="radial-center-label">{isSample ? 'YOU · DEMO' : 'DATASET'}</text>
          <text textAnchor="middle" y="18" className="radial-center-value">{format.format(remaining)}</text>
          <text textAnchor="middle" y="39" className="radial-center-label">{preview ? 'remaining · demo' : unit}</text>
        </svg>
        {!items.length && <p className="radial-empty">No sources match these filters. <button type="button" onClick={clear}>Clear filters</button></p>}
        <figcaption>Read from the centre out: <strong>footprint → source group → source.</strong> Larger end nodes mean more {unit}. Select a node to inspect it. {preview && 'Green hollow nodes and dashed branches show the simulated hiding or removal.'}</figcaption>
      </figure>
      <aside className="radial-inspector" aria-label="Exposure details">
        <h2>{focused ? focused.item.name : isSample ? 'Where your details go.' : 'Follow the exposure.'}</h2>
        {focused ? <div className="radial-source-detail" aria-live="polite">
          <p>{focused.group.name}{focused.item.year ? ` · ${focused.item.year}` : ''}</p>
          <p className="radial-readout"><strong>{format.format(focused.item.value)}</strong> {unit}</p>
          {focused.item.detail?.length ? <><h3>Data found here</h3><div className="radial-data-tags">{focused.item.detail.map(detail => <span key={detail}>{detail}</span>)}</div></> : <p>Personal data types are not provided in this dataset.</p>}
          {isSample ? <><h3>{actionNames[focused.item.action!]}</h3><p>{focused.item.action === 'hide' ? 'This example hides details from public view. The source still retains them, and existing copies may remain.' : focused.item.action === 'remove' ? 'This example assumes a successful removal from this listing. A real request needs your approval and a verified result.' : 'No removal is assumed for this source. Existing copies may remain outside your control.'}</p></> : focused.item.share !== undefined ? <p>Sends an identifier on {(focused.item.share * 100).toFixed(1)}% of measured visits where it appears.</p> : <p>This is a historical breach count, not a count of unique people or removable records.</p>}
          <p className="radial-small">{focused.group.note}</p>
          <button type="button" className="radial-reset" onClick={() => { setSelected(null); setHovered(null); }}>Back to overview</button>
        </div> : <>
          <p>{isSample ? 'One detail, appearing at one source, counts once. The same email on three sites counts as three appearances.' : 'Choose an end node or a source in the table to inspect its data. These are aggregate measurements, not your personal footprint.'}</p>
          <dl className="radial-summary"><div><dt>Sources in view</dt><dd>{items.length}</dd></div>
          {isSample && <><div><dt>Average details per source</dt><dd>{items.length ? (total / items.length).toFixed(1) : '—'}</dd></div><div><dt>Could hide or remove · demo</dt><dd>{reducible} / {total}</dd></div><div><dt>Remaining after preview</dt><dd>{total - reducible}</dd></div></>}
          </dl>
          {isSample ? <p className="radial-small">Illustrative counts for this fictional footprint, not a population average or a measurement of data leaving your device. No scan or removal is performed.</p> : <p className="radial-small">{view === 'breaches' ? 'Accounts may appear in multiple breaches. Filtering a data type selects breaches reporting that type, not individual records confirmed to contain it.' : 'Sites can use several companies, so segments overlap in real life. The total counts site–company pairs, not unique websites, bytes, or personal details.'} Removal potential is not measured.</p>}
        </>}
        <div className="radial-group-list" aria-label="Source groups">{filtered.map(group => <div key={group.id}><span>{group.name}</span><strong>{format.format(group.items.reduce((sum, item) => sum + item.value, 0))}</strong></div>)}</div>
      </aside>
    </div>
    <details className="radial-table"><summary>Explore all {items.length} sources as a table</summary><div><table><thead><tr><th>Source</th><th>Group</th><th>{unit}</th><th>{isSample ? 'Public visibility / action' : 'Data recorded'}</th></tr></thead><tbody>{items.map(({ item, group }) => <tr key={item.id}><th><button type="button" aria-pressed={selected === item.id} onClick={() => { setSelected(item.id); setHovered(null); }}>{item.name}</button></th><td>{group.name}</td><td>{item.value.toLocaleString('en-GB')}</td><td>{isSample ? `${item.public ? 'Public' : 'Not a public listing'} · ${actionNames[item.action!]}` : item.detail?.join(', ') || (item.share !== undefined ? `${(item.share * 100).toFixed(1)}% of visits send an ID` : 'Not provided')}</td></tr>)}</tbody></table></div></details>
  </div>;
}
