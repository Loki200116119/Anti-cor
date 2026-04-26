import React, { useMemo } from 'react';
import SectionTitle from './SectionTitle';
import { Region } from '../types';
import { normalizeRisk, sectorLabel } from '../utils';
import { riskClass } from '../constants';

interface MapSectionProps {
  stats: any;
  regions: Region[];
  pickedRegion: Region;
  selectedRegion: string;
  setSelectedRegion: (region: string) => void;
  selectedSector: string;
  setSelectedSector: (sector: string) => void;
  setActive: (active: string) => void;
}

function Stat({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className="stat">
      <span>{icon}</span>
      <b>{value}</b>
      <small>{label}</small>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="info">
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}

function Legend() {
  return (
    <div className="legend">
      <span><i className="low"></i>Low</span>
      <span><i className="medium"></i>Medium</span>
      <span><i className="high"></i>High</span>
      <span><i className="critical"></i>Critical</span>
    </div>
  );
}

function MapSection({ stats, regions, pickedRegion, selectedRegion, setSelectedRegion, selectedSector, setSelectedSector, setActive }: MapSectionProps) {
  const total = stats?.total_reports ?? regions.reduce((s, r) => s + (r.reports || 0), 0);
  const verified = stats?.verified_signals ?? 312;
  const high = stats?.high_risk_regions ?? regions.filter(r => ['High', 'Critical'].includes(normalizeRisk(r.risk_level, r.risk_score))).length;
  const avg = stats?.average_response_time_days ?? 9;
  const topSector = stats?.top_sector ?? 'education';

  return (
    <section>
      <SectionTitle icon="📍" eyebrow="Corruption Map" title="Hudud va sektorlar bo'yicha pro dashboard" subtitle="Bu bo'lim static xarita emas: hudud risklari, sector filter, trend, agency response va AI insight bir joyda ko'rinadi." />
      <div className="stats-grid">
        <Stat label="Total reports" value={total.toLocaleString?.() || total} icon="📄" />
        <Stat label="Verified signals" value={verified} icon="✅" />
        <Stat label="High-risk regions" value={high} icon="⚠️" />
        <Stat label="Avg response time" value={`${avg} days`} icon="⏱️" />
        <Stat label="Top sector" value={sectorLabel(topSector)} icon="📊" />
      </div>
      <div className="filters">
        <button className={selectedSector === 'all' ? 'active' : ''} onClick={() => setSelectedSector('all')}>All sectors</button>
        {[
          { key: 'education', label: 'Ta\'lim', icon: '🎓' },
          { key: 'medicine', label: 'Tibbiyot', icon: '🏥' },
          { key: 'construction', label: 'Qurilish', icon: '🏗️' },
          { key: 'sport', label: 'Sport', icon: '⚽' },
          { key: 'publicServices', label: 'Davlat xizmatlari', icon: '🏛️' },
          { key: 'transport', label: 'Transport', icon: '🚌' },
          { key: 'procurement', label: 'Davlat xaridlari', icon: '📦' },
        ].map(s => (
          <button key={s.key} onClick={() => setSelectedSector(s.key)} className={selectedSector === s.key ? 'active' : ''}>
            {s.icon} {s.label}
          </button>
        ))}
      </div>
      <div className="map-layout">
        <div className="map-card">
          <div className="map-head">
            <div>
              <h3>Uzbekistan risk map</h3>
              <p>Region card bosilganda detail panel yangilanadi.</p>
            </div>
            <Legend />
          </div>
          <div className="region-grid">
            {regions.map(r => {
              const level = normalizeRisk(r.risk_level, r.risk_score);
              return (
                <button
                  key={r.region}
                  onClick={() => setSelectedRegion(r.region)}
                  className={`region ${riskClass[level]} ${selectedRegion === r.region ? 'selected' : ''}`}
                >
                  <span>📍</span>
                  <b>{r.region}</b>
                  <strong>{r.risk_score}/100</strong>
                  <small>{level} · {r.reports} reports</small>
                </button>
              );
            })}
          </div>
        </div>
        <aside className="detail-card">
          <div className="detail-top">
            <h3>{pickedRegion.region}</h3>
            <span className={`risk-badge ${riskClass[normalizeRisk(pickedRegion.risk_level, pickedRegion.risk_score)]}`}>
              {normalizeRisk(pickedRegion.risk_level, pickedRegion.risk_score)}
            </span>
          </div>
          <Info label="Risk score" value={`${pickedRegion.risk_score}/100`} />
          <Info label="Report count" value={pickedRegion.reports || 0} />
          <Info label="Trend" value={pickedRegion.trend || '+12%'} />
          <Info label="Top sector" value={sectorLabel(pickedRegion.top_sector)} />
          <Info label="Avg response" value={`${pickedRegion.avg_response_time_days || 9} days`} />
          <Info label="Corruption pattern" value={pickedRegion.pattern || 'Unofficial payment and routing risk'} />
          <button className="full" onClick={() => setActive('report')}>Report here</button>
        </aside>
      </div>
      <div className="ai-insight">
        <b>🤖 AI Insight</b>
        <p>{stats?.ai_insight || 'Reports in education increased by 28% this month. Highest growth: Tashkent region. Common issue: exam-related payments. Recommendation: prioritize evidence-based reports with organization names.'}</p>
      </div>
    </section>
  );
}

export default MapSection;