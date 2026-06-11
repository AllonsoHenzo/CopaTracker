'use client';

export default function SectionHead({ num, total, title, count, action }) {
  return (
    <div className="sec-head" style={{ padding: '32px 40px 18px', borderTop: '1.2px solid var(--line)', display: 'grid', gridTemplateColumns: '60px 1fr auto', gap: 24, alignItems: 'baseline', marginBottom: 0 }}>
      <div className="sec-num">{num} / {total || '06'}</div>
      <h2 className="sec-title">{title}</h2>
      <div className="sec-meta">
        <span className="chip">{count}</span>
        {action}
      </div>
    </div>
  );
}
