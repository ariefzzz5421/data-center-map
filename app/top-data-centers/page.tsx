import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowDownWideNarrow, ArrowLeft, ArrowRight, ExternalLink, Info, MapPin, Server, Trophy, Zap } from "lucide-react";
import { COMPANY_CAMPUSES } from "./companies";
import "./top-list.css";

export const metadata: Metadata = {
  title: "Top 30 Data Center Companies — AI Infrastructure Atlas",
  description: "Thirty operators ranked by the capacity of their largest publicly reported AI or AI-ready data center campus.",
};

const totalGw = COMPANY_CAMPUSES.reduce((sum, item) => sum + item.capacityMw, 0) / 1000;
const countryCount = new Set(COMPANY_CAMPUSES.map((item) => item.country)).size;

export default function TopDataCentersPage() {
  return (
    <main className="toplist-page">
      <header className="toplist-header">
        <Link href="/" className="toplist-back"><ArrowLeft size={16} /> Back to atlas</Link>
        <span className="toplist-brand"><Trophy size={17} /> Top List Data Center</span>
        <Link href="/inside-data-center" className="toplist-next">Explore inside <ArrowRight size={15} /></Link>
      </header>

      <div className="toplist-content">
        <section className="toplist-hero">
          <p><Zap size={14} /> Public capacity leaderboard · July 2026</p>
          <h1>30 companies shaping<br />the <em>AI infrastructure race.</em></h1>
          <div className="toplist-intro">
            <p>One major campus per operator or consortium, ranked by its largest comparable public power figure—not by total worldwide fleet size.</p>
            <div><strong>{totalGw.toFixed(2)} GW</strong><span>combined reported scale</span></div>
            <div><strong>30</strong><span>operators or consortia</span></div>
            <div><strong>{countryCount}</strong><span>countries represented</span></div>
          </div>
        </section>

        <div className="ranking-toolbar">
          <span><ArrowDownWideNarrow size={14} /> Largest MW first</span>
          <span>1 GW = 1,000 MW</span>
          <span><i /> Operational <i /> Building / mixed <i /> Announced</span>
        </div>

        <div className="method-note">
          <strong>How to read this list</strong>
          <span>Operational, building, and announced projects appear together because operators rarely publish live facility IT load. Campus envelope, electrical capacity, and critical IT load are not identical; each row labels its measurement basis.</span>
        </div>

        <section className="company-ranking" aria-label="Thirty largest publicly reported AI and AI-ready company campuses">
          {COMPANY_CAMPUSES.map((item) => (
            <article className="company-row" key={item.rank}>
              <span className="company-rank">{String(item.rank).padStart(2,"0")}</span>
              <span className="company-logo">
                <Image src={item.logo} alt={`${item.company} logo`} width={44} height={44} sizes="44px" />
              </span>
              <div className="company-main">
                <div className="company-title"><h2>{item.company}</h2><span className={`company-status ${item.statusTone}`}>{item.status}</span></div>
                <p>{item.campus}</p>
                <div className="company-location"><MapPin size={12} /> {item.location}, {item.country}</div>
                <div className="capacity-track" aria-hidden="true"><span style={{width:`${Math.max(5,(item.capacityMw / 5000) * 100)}%`}} /></div>
              </div>
              <div className="company-power">
                <strong>{item.capacity}</strong>
                <span>{item.basis}</span>
                {item.sortingProxy && <small>* sorting proxy</small>}
              </div>
              <p className="company-note">{item.note}</p>
              <a href={item.source} target="_blank" rel="noreferrer" aria-label={`View public source for ${item.company}`}><ExternalLink size={15} /></a>
            </article>
          ))}
        </section>

        <section className="toplist-caveat">
          <Info size={20} />
          <div><strong>Not a definitive global ownership ranking</strong><p>Public disclosures change quickly and often mix future campus envelopes with operational load. Google and Reliance use “gigawatt-scale” wording, so 1,000 MW is only a sorting proxy. xAI, HUMAIN, Baidu, Alibaba Cloud, and Switch are not force-ranked where a comparable official single-campus MW figure could not be verified.</p></div>
        </section>

        <section className="toplist-next-tour">
          <Server size={22} />
          <div><span>NEXT ROUTE</span><h2>Now see what those megawatts power.</h2><p>Explore a living Three.js model of the grid, UPS, GPU racks, fiber network, and liquid-cooling loop.</p></div>
          <Link href="/inside-data-center">Enter the data hall <ArrowRight size={15} /></Link>
        </section>
      </div>
    </main>
  );
}
