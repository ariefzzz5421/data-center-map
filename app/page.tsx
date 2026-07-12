"use client";

import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  Check,
  ChevronRight,
  CircleDot,
  Globe2,
  Info,
  LocateFixed,
  Search,
  X,
  Zap,
} from "lucide-react";
import GlobeScene from "./globe-scene";
import { DATA_CENTERS, REGIONS, type DataCenter } from "./data-centers";

const formatMw = (mw: number) => mw >= 1000 ? `${(mw / 1000).toFixed(mw % 1000 ? 1 : 0)} GW` : `${mw} MW`;

export default function Home() {
  const [selected, setSelected] = useState<DataCenter>(DATA_CENTERS[0]);
  const [region, setRegion] = useState<(typeof REGIONS)[number]>("All regions");
  const [query, setQuery] = useState("");
  const [panelOpen, setPanelOpen] = useState(true);
  const [intro, setIntro] = useState(true);

  const filtered = useMemo(() => DATA_CENTERS.filter((dc) => {
    const regionMatch = region === "All regions" || dc.region === region;
    const q = query.trim().toLowerCase();
    return regionMatch && `${dc.name} ${dc.operator} ${dc.city} ${dc.country} ${dc.capacityLabel}`.toLowerCase().includes(q);
  }), [query, region]);

  const countryCount = useMemo(() => new Set(filtered.map((dc) => dc.countryCode)).size, [filtered]);

  const choose = (dc: DataCenter) => {
    setSelected(dc);
    setPanelOpen(true);
    setIntro(false);
  };

  return (
    <main className="app-shell">
      <GlobeScene data={filtered} selected={selected} onSelect={choose} />
      <div className="ambient-grid" aria-hidden="true" />

      <header className="topbar">
        <button className="brand" onClick={() => setIntro(true)} aria-label="Open atlas introduction">
          <span className="brand-mark"><Globe2 size={17} strokeWidth={1.8} /></span>
          <span>AI Infrastructure Atlas</span>
          <span className="edition">2026</span>
        </button>
        <div className="top-meta">
          <span className="live-dot" />
          <span>CAPACITY-RANKED INDEX</span>
          <span className="top-divider" />
          <span>{DATA_CENTERS.length} MAJOR CAMPUSES</span>
        </div>
        <button className="about-button" onClick={() => setIntro(true)}><Info size={16} /> About</button>
      </header>

      <section className="hero-copy" aria-label="Introduction">
        <p className="eyebrow"><CircleDot size={13} /> Planet-scale compute</p>
        <h1>The physical<br />frontier of <em>AI.</em></h1>
        <p className="hero-sub">Explore 50 of the world&apos;s largest AI and AI-ready campuses, ranked by publicly reported power capacity.</p>
      </section>

      <aside className={`directory ${panelOpen ? "is-open" : ""}`} aria-label="Data center directory">
        <div className="directory-head">
          <div>
            <p className="micro-label">GLOBAL POWER RANKING</p>
            <h2>Top 50 AI campuses</h2>
          </div>
          <button className="icon-button close-directory" onClick={() => setPanelOpen(false)} aria-label="Close directory"><X size={18} /></button>
        </div>

        <label className="search-box">
          <Search size={16} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search campus, country or capacity" aria-label="Search data centers" />
          {query && <button onClick={() => setQuery("")} aria-label="Clear search"><X size={14} /></button>}
        </label>

        <div className="region-tabs" aria-label="Filter by region">
          {REGIONS.map((item) => <button key={item} className={region === item ? "active" : ""} onClick={() => setRegion(item)}>{item}</button>)}
        </div>

        <div className="result-meta"><span>{filtered.length} CAMPUSES / {countryCount} COUNTRIES</span><span>POWER</span></div>
        <div className="center-list">
          {filtered.map((dc) => (
            <button className={`center-row ${selected.id === dc.id ? "selected" : ""}`} key={dc.id} onClick={() => choose(dc)}>
              <span className="row-number">{String(dc.rank).padStart(2, "0")}</span>
              <span className="country-flag" role="img" aria-label={dc.country}>{dc.flag}</span>
              <span className="row-main">
                <strong>{dc.name}</strong>
                <small>{dc.city} / {dc.operator}</small>
              </span>
              <span className="row-capacity">{formatMw(dc.capacityMw)}</span>
              <span className={`status-dot ${dc.status.toLowerCase()}`} title={dc.status} />
              <ChevronRight size={15} className="row-arrow" />
            </button>
          ))}
          {!filtered.length && <div className="empty-state">No campus matches this view.</div>}
        </div>
        <div className="directory-footnote">Ranked by reported full-campus power. Planned capacity is not the same as live IT load.</div>
      </aside>

      {!panelOpen && <button className="open-directory" onClick={() => setPanelOpen(true)}><Search size={16} /> Explore {filtered.length} campuses</button>}

      <section className="campus-card" aria-live="polite">
        <div className="card-topline">
          <span className={`status-pill ${selected.status.toLowerCase()}`}><span />{selected.status}</span>
          <span>GLOBAL RANK #{selected.rank}</span>
        </div>
        <p className="micro-label">SELECTED AI CAMPUS</p>
        <div className="campus-title-row">
          <span className="detail-flag" role="img" aria-label={selected.country}>{selected.flag}</span>
          <div><h2>{selected.name}</h2><p className="operator">{selected.operator}</p></div>
        </div>
        <div className="campus-facts">
          <div><LocateFixed size={15} /><span><small>LOCATION</small>{selected.city}<br />{selected.country}</span></div>
          <div><Zap size={15} /><span><small>REPORTED CAPACITY</small><strong>{selected.capacityLabel}</strong><br />{selected.capacityBasis}</span></div>
        </div>
        <p className="capacity-note"><Info size={13} /> {selected.capacityDetail}</p>
        <p className="campus-detail">{selected.detail}</p>
        <a href={selected.source} target="_blank" rel="noreferrer">View data source <ArrowUpRight size={15} /></a>
      </section>

      <div className="globe-controls">
        <span><span className="mouse-icon" /> DRAG TO ROTATE</span>
        <span><span className="scroll-icon" /> SCROLL TO ZOOM</span>
      </div>

      <footer>
        <span>AI INFRASTRUCTURE ATLAS</span>
        <span>Reported and planned capacity / Updated July 2026</span>
      </footer>

      {intro && (
        <div className="intro-overlay" role="dialog" aria-modal="true" aria-label="About this atlas">
          <button className="intro-backdrop" onClick={() => setIntro(false)} aria-label="Close introduction" />
          <div className="intro-card">
            <div className="intro-symbol"><Globe2 size={29} strokeWidth={1.4} /></div>
            <p className="eyebrow">The 2026 field map</p>
            <h2>50 campuses.<br />One <em>compute frontier.</em></h2>
            <p>This atlas tracks major purpose-built AI and AI-ready hyperscale campuses. Ranking uses the largest public power figure for each campus. Many values describe planned full buildout, not capacity operating today.</p>
            <button className="primary-action" onClick={() => setIntro(false)}>Explore the ranking <ArrowUpRight size={17} /></button>
            <div className="intro-note"><Check size={14} /> Every campus includes capacity context and a source</div>
          </div>
        </div>
      )}
    </main>
  );
}
