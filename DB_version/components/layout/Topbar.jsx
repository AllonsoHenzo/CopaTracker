'use client';

export default function Topbar({ title, subtitle, right }) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="topbar-date">{subtitle}</div>
        <h1 className="topbar-greet">{title}</h1>
      </div>
      <div className="topbar-right">{right}</div>
    </header>
  );
}
