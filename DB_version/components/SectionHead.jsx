'use client';

export default function SectionHead({ num, total, title, count, action }) {
  return (
    <div className="sec-head">
      <div className="sec-num">{num} / {total || '06'}</div>
      <h2 className="sec-title">{title}</h2>
      <div className="sec-meta">
        <span className="chip">{count}</span>
        {action}
      </div>
    </div>
  );
}
