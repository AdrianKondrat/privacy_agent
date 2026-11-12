import { useCallback, useEffect, useRef, useState } from 'react';

// The product promise in one fragment: a leak starts in black and white, and colour returns as it is fixed.
// Fictional data, labelled as such. The same record appears in full in the sample section.
const log = [
  ['3 Nov', 'Found on the directory page'],
  ['3 Nov', 'Removal request approved and sent'],
  ['11 Nov', 'Directory replied: listing removed'],
  ['18 Nov', 'Page checked: address not found'],
  ['18 Dec', 'Checked again: still gone'],
] as const;
const status = ['Exposed', 'Request sent', 'Listing removed', 'Page checked', 'Closed, checked twice'] as const;
const last = log.length - 1;

export default function HeroRecord() {
  const [step, setStep] = useState(0);
  const timer = useRef<number>(0);

  const play = useCallback(() => {
    window.clearTimeout(timer.current);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setStep(last); return; }
    setStep(0);
    let next = 0;
    const tick = () => {
      next += 1;
      setStep(next);
      if (next < last) timer.current = window.setTimeout(tick, 1000);
    };
    timer.current = window.setTimeout(tick, 1700);
  }, []);

  useEffect(() => { play(); return () => window.clearTimeout(timer.current); }, [play]);

  const fixed = step >= 2;
  return (
    <article className="hero-record" data-state={fixed ? 'fixed' : 'exposed'} aria-labelledby="hero-record-title">
      <div className="record-bar">
        <span>Leak record</span>
        <span>Sample, fictional data</span>
      </div>
      <div className="record-body">
        <h2 id="hero-record-title">Home address in an old listing</h2>
        <dl className="record-facts">
          <div><dt>Leak path</dt><dd>Sold: a public directory profile</dd></div>
          <div><dt>Visible</dt><dd className="record-value" key={fixed ? 'fixed' : 'exposed'}>{fixed ? 'Not on the page' : '12 Example Lane'}</dd></div>
        </dl>
        <ol className="record-log" aria-label="What happened">
          {log.map(([date, event], index) => (
            <li key={event} data-row={index} data-reached={step >= index} data-done={step >= index && index >= 2}>
              <span className="log-date">{date}</span>
              <span className="log-event">{event}</span>
            </li>
          ))}
        </ol>
      </div>
      <div className="record-foot">
        <span className="record-status" role="status"><span className="status-dot" aria-hidden="true"></span>{status[step]}</span>
        <button type="button" className="record-replay" onClick={play}>Replay</button>
      </div>
    </article>
  );
}
