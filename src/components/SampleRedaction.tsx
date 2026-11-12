import { useRef, useState } from 'react';
import type { PointerEvent } from 'react';

const example = '12 EXAMPLE LANE';

export default function SampleRedaction() {
  const [revealed, setRevealed] = useState(false);
  const letters = useRef<(HTMLSpanElement | null)[]>([]);

  function proximity(event: PointerEvent<HTMLButtonElement>) {
    if (event.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    for (const letter of letters.current) {
      if (!letter) continue;
      const box = letter.getBoundingClientRect();
      const distance = Math.hypot(event.clientX - box.left - box.width / 2, event.clientY - box.top - box.height / 2);
      letter.style.setProperty('--blur', Math.min(6, distance / 7).toFixed(2) + 'px');
    }
  }

  function clear() {
    for (const letter of letters.current) letter?.style.removeProperty('--blur');
  }

  return (
    <button className="redact-sample" type="button" aria-pressed={revealed}
      aria-label={revealed ? 'Hide sample address: ' + example : 'Reveal sample address'}
      onPointerMove={proximity} onPointerLeave={clear} onClick={() => setRevealed(value => !value)}>
      <span className="redact-letters" aria-hidden="true">
        {Array.from(example, (character, index) => (
          <span key={index} ref={element => { letters.current[index] = element; }}>{character === ' ' ? '\u00a0' : character}</span>
        ))}
      </span>
      <span className="redact-label" aria-hidden="true">{revealed ? 'Hide' : 'Reveal'}</span>
    </button>
  );
}
