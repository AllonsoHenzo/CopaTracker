'use client';

import { useT } from '@/lib/i18n';

export default function Ticker() {
  const t = useT();
  const repeat = [...t.ticker, ...t.ticker, ...t.ticker];
  return (
    <div className="ticker">
      <div className="ticker-track">
        {repeat.map((it, i) => (
          <span key={i} className="ticker-item">
            <span className={`dot ${it.dot === 'y' ? 'dot-y' : it.dot === 'b' ? 'dot-b' : ''}`}></span>
            {it.text}
          </span>
        ))}
      </div>
    </div>
  );
}
