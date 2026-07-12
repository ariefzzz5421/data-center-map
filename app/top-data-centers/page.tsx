import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ExternalLink, MapPin, Server, Trophy, Zap } from "lucide-react";
import "./top-list.css";

export const metadata: Metadata = {
  title: "Top List Data Center — AI Infrastructure Atlas",
  description: "Ten companies ranked by the capacity of their largest publicly reported AI data center campus.",
};

const companies = [
  { rank:1, company:"Meta", campus:"Hyperion", capacityMw:5000, capacity:"5 GW", location:"Richland Parish, Louisiana", country:"United States", countryCode:"US", status:"Building", basis:"Maximum planned cluster scale", note:"Meta says Hyperion can scale to 5 GW, making it the largest disclosed single-company AI cluster in this comparison.", source:"https://engineering.fb.com/2025/09/29/data-infrastructure/metas-infrastructure-evolution-and-the-advent-of-ai/" },
  { rank:2, company:"Amazon Web Services", campus:"Project Rainier", capacityMw:2200, capacity:"2.2 GW", location:"Northern Indiana", country:"United States", countryCode:"US", status:"Operational", basis:"Wider campus capacity", note:"AWS describes Rainier as a 2.2 GW campus; its operational AI cluster uses nearly half a million Trainium2 chips.", source:"https://preview.prod.sustainability.aboutamazon.com/stories/inside-amazons-approach-to-data-center-sustainability" },
  { rank:3, company:"Microsoft", campus:"Pecos AI Campus", capacityMw:2000, capacity:"~2 GW", location:"Pecos, Texas", country:"United States", countryCode:"US", status:"Announced", basis:"Planned capacity addition", note:"Microsoft officially announced approximately 2 GW of new campus capacity, delivered over five to seven years.", source:"https://blogs.microsoft.com/blog/2026/06/22/powering-the-next-wave-of-ai-expanding-capacity-with-our-new-datacenter-in-pecos/" },
  { rank:4, company:"Tract", campus:"Silver Springs Campus", capacityMw:1600, capacity:"Up to 1.6 GW", location:"Lyon County, Nevada", country:"United States", countryCode:"US", status:"Announced", basis:"Maximum site support", note:"The 1,060-acre development can support up to 1.6 GW; the initial 700 MW remains under utility study.", source:"https://www.tract.com/news/tract-expands-its-greater-reno-portfolio-closing-on-1060-acres-in-silver-springs-nevada-following-successful-rezoning-and-development-agreement-with-lyon-county/" },
  { rank:5, company:"DataVolt", campus:"Oxagon AI Factory", capacityMw:1500, capacity:"1.5 GW", location:"Oxagon, NEOM", country:"Saudi Arabia", countryCode:"SA", status:"Building", basis:"Planned factory capacity", note:"DataVolt's first $5B phase is part of a 1.5 GW renewable-powered, net-zero AI factory planned for operation from 2028.", source:"https://data-volt.com/media/breaking-news/datavolt-signs-agreement-with-neom-to-design-and-develop-the-regions-first-truly-sustainable-net-zero-ai-factory-campus-in-oxagon/" },
  { rank:6, company:"Vantage Data Centers", campus:"Frontier", capacityMw:1400, capacity:"1.4 GW", location:"Shackelford County, Texas", country:"United States", countryCode:"US", status:"Building", basis:"Critical IT load", note:"Vantage's $25B Frontier plan includes ten data centers and liquid-cooled racks designed for next-generation AI deployments.", source:"https://vantage-dc.com/news/vantage-data-centers-unveils-plans-for-frontier-a-25b-mega-campus-in-texas-to-meet-unprecedented-ai-demand/" },
  { rank:7, company:"Nscale", campus:"Monarch AI Campus", capacityMw:1350, capacity:"Up to 1.35 GW", location:"Mason County, West Virginia", country:"United States", countryCode:"US", status:"Announced", basis:"AI compute letter of intent", note:"Nscale and Microsoft signed a letter of intent covering up to 1.35 GW of Vera Rubin AI compute at the flagship campus.", source:"https://www.nscale.com/press-releases/nscale-west-virginia-ai-factory" },
  { rank:8, company:"OpenAI · G42", campus:"Stargate UAE", capacityMw:1000, capacity:"1 GW", location:"Abu Dhabi", country:"United Arab Emirates", countryCode:"AE", status:"Building", basis:"Dedicated Stargate cluster", note:"The 1 GW Stargate cluster begins with a 200 MW phase and sits inside the wider 5 GW UAE–US AI campus.", source:"https://openai.com/index/introducing-stargate-uae/" },
  { rank:9, company:"Google", campus:"Visakhapatnam AI Hub", capacityMw:1000, capacity:"Gigawatt-scale", location:"Visakhapatnam, Andhra Pradesh", country:"India", countryCode:"IN", status:"Building", basis:"Public full-stack hub scale", note:"Google's $15B program combines gigawatt-scale data center operations, new energy sources, and subsea connectivity.", source:"https://blog.google/intl/en-in/company-news/our-first-ai-hub-in-india-powered-by-a-15-billion-investment/" },
  { rank:10, company:"Reliance Industries", campus:"Jamnagar AI Campus", capacityMw:1000, capacity:"Gigawatt-scale", location:"Jamnagar, Gujarat", country:"India", countryCode:"IN", status:"Building", basis:"Long-range campus direction", note:"Reliance says work has begun on gigawatt-scale AI-ready campuses; the first 120 MW is scheduled to commission in phases.", source:"https://www.ril.com/news-media/events/reliance-at-the-forefront" },
] as const;

const totalGw = companies.reduce((sum, item) => sum + item.capacityMw, 0) / 1000;

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
          <p><Zap size={14} /> Capacity leaderboard · July 2026</p>
          <h1>The companies building<br />the <em>largest AI campuses.</em></h1>
          <div className="toplist-intro"><p>Ranked by each operator&apos;s largest publicly reported single-campus power figure—not the company&apos;s total worldwide fleet.</p><div><strong>{totalGw.toFixed(2)} GW</strong><span>combined reported scale</span></div><div><strong>10</strong><span>operators or consortia</span></div><div><strong>4</strong><span>countries represented</span></div></div>
        </section>

        <div className="method-note"><strong>How to read this list</strong><span>Operational, building, and announced capacity are shown together because many companies do not publish live IT load. Campus envelope, utility power, and critical IT load are different measurements; every row labels its basis.</span></div>

        <section className="company-ranking" aria-label="Ten largest publicly reported company data center campuses">
          {companies.map((item) => (
            <article className="company-row" key={item.company}>
              <span className="company-rank">{String(item.rank).padStart(2,"0")}</span>
              <span className="company-flag"><Image src={`/flags/${item.countryCode.toLowerCase()}.svg`} alt={`${item.country} flag`} width={38} height={28} /></span>
              <div className="company-main">
                <div className="company-title"><h2>{item.company}</h2><span className={`company-status ${item.status.toLowerCase()}`}>{item.status}</span></div>
                <p>{item.campus}</p>
                <div className="company-location"><MapPin size={12} /> {item.location}, {item.country}</div>
                <div className="capacity-track" aria-hidden="true"><span style={{width:`${Math.max(12,(item.capacityMw / 5000) * 100)}%`}} /></div>
              </div>
              <div className="company-power"><strong>{item.capacity}</strong><span>{item.basis}</span></div>
              <p className="company-note">{item.note}</p>
              <a href={item.source} target="_blank" rel="noreferrer" aria-label={`View source for ${item.company}`}><ExternalLink size={15} /></a>
            </article>
          ))}
        </section>

        <section className="toplist-caveat"><Server size={20} /><div><strong>Why some famous names are absent</strong><p>Companies such as xAI often disclose GPU counts or power arrangements without one directly comparable campus MW figure. They are not force-ranked until a reliable like-for-like number is public.</p></div></section>
      </div>
    </main>
  );
}
