import React from 'react';

interface HeaderProps {
  nav: [string, string, string][];
  active: string;
  setActive: (active: string) => void;
  apiOnline: string;
}

function Header({ nav, active, setActive, apiOnline }: HeaderProps) {
  return (
    <header className="topbar">
      <button className="brand" onClick={() => setActive('map')}>
        <span>🛡️</span>
        <div>
          <b>CleanSignal</b>
          <small>Civic intelligence platform</small>
        </div>
        {apiOnline === 'offline' && <span className="demo-badge">Demo mode</span>}
      </button>
      <nav>
        {nav.map(([id, label, icon]) => (
          <button key={id} onClick={() => setActive(id)} className={active === id ? 'active' : ''}>
            <span>{icon}</span>
            {label}
          </button>
        ))}
      </nav>
      <div className={`api-pill ${apiOnline}`}>
        <span></span>
        {apiOnline === 'online' ? 'Backend online' : apiOnline === 'offline' ? 'Demo mode' : 'Checking API'}
      </div>
    </header>
  );
}

export default Header;