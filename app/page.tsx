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

export type DataCenter = {
  id: string;
  name: string;
  operator: string;
  city: string;
  country: string;
  region: "Americas" | "Europe" | "Asia Pacific" | "Middle East";
  lat: number;
  lng: number;
  status: "Operational" | "Building" | "Announced";
  scale: string;
  detail: string;
  source: string;
};

export const DATA_CENTERS: DataCenter[] = [
  { id: "abilene", name: "Stargate Abilene", operator: "OpenAI · Oracle", city: "Abilene, Texas", country: "United States", region: "Americas", lat: 32.45, lng: -99.73, status: "Operational", scale: "Flagship campus", detail: "The first Stargate campus—built as a dense, purpose-designed home for frontier AI training and inference.", source: "https://openai.com/index/five-new-stargate-sites/" },
  { id: "colossus", name: "Colossus", operator: "xAI", city: "Memphis, Tennessee", country: "United States", region: "Americas", lat: 35.05, lng: -90.02, status: "Operational", scale: "Supercomputer cluster", detail: "xAI's rapidly expanded GPU supercluster in Memphis, created to train and serve the Grok family of models.", source: "https://x.ai/memphis/info" },
  { id: "fairwater-wi", name: "Fairwater Wisconsin", operator: "Microsoft", city: "Mount Pleasant, Wisconsin", country: "United States", region: "Americas", lat: 42.72, lng: -87.90, status: "Operational", scale: "315-acre campus", detail: "A liquid-cooled AI superfactory connecting hundreds of thousands of accelerators through a high-speed flat network.", source: "https://news.microsoft.com/source/2026/06/23/microsoft-completes-construction-on-first-datacenter-facility-in-mount-pleasant-wisconsin/" },
  { id: "rainier", name: "Project Rainier", operator: "AWS · Anthropic", city: "New Carlisle, Indiana", country: "United States", region: "Americas", lat: 41.70, lng: -86.51, status: "Operational", scale: "~500K Trainium2 chips", detail: "One of the world's largest purpose-built AI compute clusters, developed by AWS for Anthropic model workloads.", source: "https://www.aboutamazon.com/news/aws/aws-project-rainier-ai-trainium-chips-compute-cluster" },
  { id: "hyperion", name: "Hyperion", operator: "Meta", city: "Richland Parish, Louisiana", country: "United States", region: "Americas", lat: 32.44, lng: -91.76, status: "Building", scale: "Multi-gigawatt campus", detail: "Meta's largest planned AI training cluster, a vast campus designed to scale over several years.", source: "https://about.fb.com/news/2025/12/metas-richland-parish-data-center-supports-louisiana-economy-875-million-in-contracts/" },
  { id: "fairwater-atl", name: "Fairwater Atlanta", operator: "Microsoft", city: "Atlanta, Georgia", country: "United States", region: "Americas", lat: 33.75, lng: -84.39, status: "Operational", scale: "AI superfactory node", detail: "Linked with Wisconsin through Microsoft's dedicated AI WAN to coordinate distributed, planet-scale training jobs.", source: "https://blogs.microsoft.com/blog/2025/11/12/infinite-scale-the-architecture-behind-the-azure-ai-superfactory/" },
  { id: "narvik", name: "Narvik AI Campus", operator: "Nscale · Aker · Microsoft", city: "Narvik", country: "Norway", region: "Europe", lat: 68.44, lng: 17.43, status: "Building", scale: "230 MW initial capacity", detail: "A hydropower-backed Arctic AI campus using the region's cool climate and established industrial infrastructure.", source: "https://news.microsoft.com/source/emea/features/the-port-town-in-norway-emerging-as-an-ai-hub/" },
  { id: "loughton", name: "Loughton AI Campus", operator: "Nscale · Microsoft", city: "Loughton", country: "United Kingdom", region: "Europe", lat: 51.65, lng: 0.06, status: "Building", scale: "UK AI supercomputer", detail: "A purpose-built UK AI supercomputer campus designed to provide sovereign, large-scale compute capacity.", source: "https://blogs.microsoft.com/blog/2025/09/18/inside-the-worlds-most-powerful-ai-datacenter/" },
  { id: "stargate-uae", name: "Stargate UAE", operator: "G42 · OpenAI · Oracle", city: "Abu Dhabi", country: "United Arab Emirates", region: "Middle East", lat: 24.45, lng: 54.38, status: "Building", scale: "1 GW cluster", detail: "The first international Stargate deployment, forming the anchor of a broader 5 GW UAE–US AI campus.", source: "https://openai.com/index/introducing-stargate-uae/" },
  { id: "ytl-johor", name: "YTL AI Cloud", operator: "YTL · NVIDIA", city: "Kulai, Johor", country: "Malaysia", region: "Asia Pacific", lat: 1.66, lng: 103.60, status: "Operational", scale: "Green AI campus", detail: "Southeast Asian sovereign AI infrastructure hosted inside YTL's solar-powered Green Data Center Park.", source: "https://www.ytl.com/wp-content/uploads/ytles/sites/2/files/annual-report/YTLPI_AR2024.pdf" },
  { id: "sakai", name: "Sakai AI Data Center", operator: "SoftBank · Sharp", city: "Sakai, Osaka", country: "Japan", region: "Asia Pacific", lat: 34.57, lng: 135.48, status: "Building", scale: "150 MW target", detail: "An industrial-site conversion designed to become a large-scale base for generative AI training and inference in Japan.", source: "https://www.softbank.jp/en/corp/news/press/sbkk/2024/20240607_01/" },
  { id: "johor-bytedance", name: "Johor AI Campus", operator: "ByteDance", city: "Johor Bahru", country: "Malaysia", region: "Asia Pacific", lat: 1.49, lng: 103.74, status: "Building", scale: "Regional AI hub", detail: "A major expansion of ByteDance's regional compute footprint supporting AI and content infrastructure across Southeast Asia.", source: "https://www.mida.gov.my/mida-news/bytedance-to-invest-rm10-billion-in-malaysia-for-ai-hub/" },
  { id: "jamnagar", name: "Jamnagar AI Campus", operator: "Reliance Industries", city: "Jamnagar, Gujarat", country: "India", region: "Asia Pacific", lat: 22.47, lng: 70.07, status: "Building", scale: "Gigawatt-scale ambition", detail: "A planned AI infrastructure campus tied to Reliance's green-energy ecosystem and sovereign compute strategy.", source: "https://www.ril.com/ar2024-25/pdf/reliance-ir-2025.pdf" },
  { id: "patagonia", name: "Stargate Argentina", operator: "OpenAI · Sur Energy", city: "Patagonia", country: "Argentina", region: "Americas", lat: -39.80, lng: -68.90, status: "Announced", scale: "Up to 500 MW", detail: "A proposed renewable-powered AI campus intended to establish large-scale compute capacity in Latin America.", source: "https://openai.com/index/stargate-argentina/" },
];

const REGIONS = ["All regions", "Americas", "Europe", "Asia Pacific", "Middle East"] as const;

export default function Home() {
  const [selected, setSelected] = useState<DataCenter>(DATA_CENTERS[0]);
  const [region, setRegion] = useState<(typeof REGIONS)[number]>("All regions");
  const [query, setQuery] = useState("");
  const [panelOpen, setPanelOpen] = useState(true);
  const [intro, setIntro] = useState(true);

  const filtered = useMemo(() => DATA_CENTERS.filter((dc) => {
    const regionMatch = region === "All regions" || dc.region === region;
    const q = query.toLowerCase();
    return regionMatch && `${dc.name} ${dc.operator} ${dc.city} ${dc.country}`.toLowerCase().includes(q);
  }), [query, region]);

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
          <span>CURATED GLOBAL INDEX</span>
          <span className="top-divider" />
          <span>{DATA_CENTERS.length} MAJOR CAMPUSES</span>
        </div>
        <button className="about-button" onClick={() => setIntro(true)}><Info size={16} /> About</button>
      </header>

      <section className="hero-copy" aria-label="Introduction">
        <p className="eyebrow"><CircleDot size={13} /> Planet-scale compute</p>
        <h1>The physical<br />frontier of <em>AI.</em></h1>
        <p className="hero-sub">Explore the major campuses powering the world&apos;s most advanced artificial intelligence systems.</p>
      </section>

      <aside className={`directory ${panelOpen ? "is-open" : ""}`} aria-label="Data center directory">
        <div className="directory-head">
          <div>
            <p className="micro-label">GLOBAL DIRECTORY</p>
            <h2>AI data centers</h2>
          </div>
          <button className="icon-button close-directory" onClick={() => setPanelOpen(false)} aria-label="Close directory"><X size={18} /></button>
        </div>

        <label className="search-box">
          <Search size={16} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search campus or operator" aria-label="Search data centers" />
          {query && <button onClick={() => setQuery("")} aria-label="Clear search"><X size={14} /></button>}
        </label>

        <div className="region-tabs" aria-label="Filter by region">
          {REGIONS.map((item) => <button key={item} className={region === item ? "active" : ""} onClick={() => setRegion(item)}>{item}</button>)}
        </div>

        <div className="result-meta"><span>{filtered.length} campuses</span><span>STATUS · LOCATION</span></div>
        <div className="center-list">
          {filtered.map((dc, index) => (
            <button className={`center-row ${selected.id === dc.id ? "selected" : ""}`} key={dc.id} onClick={() => choose(dc)}>
              <span className="row-number">{String(index + 1).padStart(2, "0")}</span>
              <span className="row-main">
                <strong>{dc.name}</strong>
                <small>{dc.city} · {dc.operator}</small>
              </span>
              <span className={`status-dot ${dc.status.toLowerCase()}`} title={dc.status} />
              <ChevronRight size={15} className="row-arrow" />
            </button>
          ))}
          {!filtered.length && <div className="empty-state">No campus matches this view.</div>}
        </div>
      </aside>

      {!panelOpen && <button className="open-directory" onClick={() => setPanelOpen(true)}><Search size={16} /> Explore {filtered.length} campuses</button>}

      <section className="campus-card" aria-live="polite">
        <div className="card-topline"><span className={`status-pill ${selected.status.toLowerCase()}`}><span />{selected.status}</span><span>{selected.region}</span></div>
        <p className="micro-label">SELECTED CAMPUS</p>
        <h2>{selected.name}</h2>
        <p className="operator">{selected.operator}</p>
        <div className="campus-facts">
          <div><LocateFixed size={15} /><span><small>LOCATION</small>{selected.city}, {selected.country}</span></div>
          <div><Zap size={15} /><span><small>SCALE</small>{selected.scale}</span></div>
        </div>
        <p className="campus-detail">{selected.detail}</p>
        <a href={selected.source} target="_blank" rel="noreferrer">View primary source <ArrowUpRight size={15} /></a>
      </section>

      <div className="globe-controls">
        <span><span className="mouse-icon" /> DRAG TO ROTATE</span>
        <span><span className="scroll-icon" /> SCROLL TO ZOOM</span>
      </div>

      <footer>
        <span>AI INFRASTRUCTURE ATLAS</span>
        <span>Publicly announced projects · Updated July 2026</span>
      </footer>

      {intro && (
        <div className="intro-overlay" role="dialog" aria-modal="true" aria-label="About this atlas">
          <button className="intro-backdrop" onClick={() => setIntro(false)} aria-label="Close introduction" />
          <div className="intro-card">
            <div className="intro-symbol"><Globe2 size={29} strokeWidth={1.4} /></div>
            <p className="eyebrow">The 2026 field map</p>
            <h2>Where intelligence<br />meets <em>infrastructure.</em></h2>
            <p>This atlas maps a curated set of publicly announced, purpose-built AI campuses—not every conventional cloud facility. Locations are approximate and project plans can change.</p>
            <button className="primary-action" onClick={() => setIntro(false)}>Explore the globe <ArrowUpRight size={17} /></button>
            <div className="intro-note"><Check size={14} /> Sources link directly from every campus profile</div>
          </div>
        </div>
      )}
    </main>
  );
}
