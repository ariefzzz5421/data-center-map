import type { Metadata } from "next";
import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BatteryCharging,
  Building2,
  Cpu,
  Database,
  ExternalLink,
  Factory,
  Gauge,
  Network,
  ShieldCheck,
  Snowflake,
  Zap,
} from "lucide-react";
import "./guide.css";

export const metadata: Metadata = {
  title: "MW & GW Guide — AI Infrastructure Atlas",
  description: "Understand data center power, cost, scale, and the systems inside an AI campus.",
};

const components = [
  { icon: Factory, title: "Grid & substations", text: "High-voltage utility feeds, transformers, switchgear, and redundant distribution bring power safely to the campus." },
  { icon: BatteryCharging, title: "UPS & backup", text: "Battery UPS bridges short interruptions. Generators or on-site generation keep critical systems running during longer outages." },
  { icon: Snowflake, title: "Cooling plant", text: "Chillers, cooling towers, pumps, heat exchangers, and direct-to-chip liquid loops remove heat from dense AI racks." },
  { icon: Cpu, title: "AI compute racks", text: "GPU or accelerator servers, CPUs, memory, rack power shelves, and high-speed interconnects perform model training and inference." },
  { icon: Network, title: "Network fabric", text: "Ethernet or InfiniBand switches, optical transceivers, fiber, routers, and subsea or terrestrial links move data at very high speed." },
  { icon: Database, title: "Storage systems", text: "Fast local flash, shared object storage, and backup systems continuously feed training data and preserve model checkpoints." },
  { icon: ShieldCheck, title: "Safety & security", text: "Physical access control, cameras, fire detection, clean-agent suppression, and cyber controls protect people and equipment." },
  { icon: Activity, title: "Operations & DCIM", text: "Sensors and Data Center Infrastructure Management software track temperature, power, water, failures, and capacity in real time." },
];

export default function GuidePage() {
  return (
    <main className="guide-page">
      <div className="guide-glow" aria-hidden="true" />
      <header className="guide-header">
        <Link href="/" className="guide-back"><ArrowLeft size={16} /> Back to atlas</Link>
        <span className="guide-brand"><Gauge size={17} /> Power field guide</span>
        <span className="guide-edition">2026</span>
      </header>

      <article className="guide-content">
        <section className="guide-hero">
          <p className="guide-kicker"><Zap size={14} /> Understand the scale</p>
          <h1>From megawatts<br />to <em>machine intelligence.</em></h1>
          <p>MW and GW describe the power a data center can draw at one moment. They are a capacity ceiling—not the amount of energy used over a day or year.</p>
        </section>

        <section className="unit-grid" aria-label="Power unit definitions">
          <div className="unit-card">
            <span className="unit-symbol">MW</span>
            <div><strong>1 megawatt</strong><p>1,000 kilowatts<br />1,000,000 watts</p></div>
          </div>
          <div className="unit-equals"><span>× 1,000</span><ArrowRight /></div>
          <div className="unit-card featured">
            <span className="unit-symbol">GW</span>
            <div><strong>1 gigawatt</strong><p>1,000 megawatts<br />1,000,000,000 watts</p></div>
          </div>
        </section>

        <section className="guide-section">
          <div className="section-heading"><span>01</span><div><p>POWER VS ENERGY</p><h2>How large is it?</h2></div></div>
          <div className="scale-table">
            <div className="scale-head"><span>Facility capacity</span><span>Energy at full load</span><span>Approx. IT power at PUE 1.2</span></div>
            <div><strong>100 MW</strong><span>2.4 GWh/day · 876 GWh/year</span><span>≈ 83 MW for compute</span></div>
            <div><strong>1 GW</strong><span>24 GWh/day · 8.76 TWh/year</span><span>≈ 833 MW for compute</span></div>
          </div>
          <p className="definition-note"><strong>PUE</strong> means Power Usage Effectiveness: total facility power divided by IT power. A PUE of 1.2 means every 1 MW used by computers needs about 0.2 MW more for cooling and electrical overhead.</p>
        </section>

        <section className="guide-section">
          <div className="section-heading"><span>02</span><div><p>ROUGH 2026 COST</p><h2>What would it cost to build?</h2></div></div>
          <div className="cost-grid">
            <div className="cost-card">
              <div className="cost-top"><span>100 MW AI data center</span><Building2 size={19} /></div>
              <strong className="cost-total">$2.5–4.0B+</strong>
              <p>Rough fully equipped planning range</p>
              <dl><div><dt>Shell, power & cooling</dt><dd>$1.0–1.5B</dd></div><div><dt>AI hardware & network</dt><dd>up to ~$2.5B</dd></div></dl>
            </div>
            <div className="cost-card featured">
              <div className="cost-top"><span>1 GW AI campus</span><Factory size={19} /></div>
              <strong className="cost-total">$25–40B+</strong>
              <p>Usually delivered as many buildings and phases</p>
              <dl><div><dt>Shell, power & cooling</dt><dd>$10–15B</dd></div><div><dt>AI hardware & network</dt><dd>up to ~$25B</dd></div></dl>
            </div>
          </div>
          <div className="estimate-note"><strong>These are order-of-magnitude estimates, not quotations.</strong> The model applies 2026 shell/core benchmarks and JLL&apos;s stated potential AI tech fit-out of up to $25M per MW. Land, a new power plant, grid upgrades, financing, taxes, and major fiber routes can add billions. Hardware generation and redundancy design can also move the total sharply.</div>
          <div className="reality-check"><span>PUBLIC-PROJECT CHECK</span><p>Google announced about <strong>$15B</strong> for a gigawatt-scale Vizag AI hub that also includes energy and subsea connectivity. OpenAI&apos;s broader Stargate commitment is <strong>$500B for 10 GW</strong>. These programs are not directly comparable, but they show why a single “cost per GW” can be misleading.</p></div>
        </section>

        <section className="guide-section">
          <div className="section-heading"><span>03</span><div><p>INSIDE THE CAMPUS</p><h2>What does it actually contain?</h2></div></div>
          <div className="systems-flow" aria-label="Data center infrastructure flow">
            <span>Utility grid</span><ArrowRight /><span>Substation + UPS</span><ArrowRight /><span>AI racks</span><ArrowRight /><span>Cooling + heat rejection</span>
          </div>
          <div className="component-grid">
            {components.map(({ icon: Icon, title, text }) => <div className="component-card" key={title}><Icon size={19} /><h3>{title}</h3><p>{text}</p></div>)}
          </div>
        </section>

        <section className="source-panel">
          <div><p>SOURCE NOTES</p><h2>Benchmarks behind the guide</h2></div>
          <ul>
            <li><a href="https://www.jll.com/content/dam/jllcom/en/global/documents/reports/research-reports/26-research-global-data-center-outlook-new.pdf" target="_blank" rel="noreferrer">JLL 2026 Global Data Center Outlook <ExternalLink size={13} /></a><span>$11.3M/MW average shell/core forecast; AI fit-out up to $25M/MW.</span></li>
            <li><a href="https://reports.turnerandtownsend.com/data-centre-construction-cost-index-2025/data-centre-cost-trends" target="_blank" rel="noreferrer">Turner &amp; Townsend Cost Index <ExternalLink size={13} /></a><span>Liquid-cooled AI builds carry an observed 7–10% premium in the US.</span></li>
            <li><a href="https://www.energy.gov/sites/default/files/2024-07/best-practice-guide-data-center-design.pdf" target="_blank" rel="noreferrer">US DOE Design Guide <ExternalLink size={13} /></a><span>Power distribution, UPS, generators, cooling, controls, and efficiency.</span></li>
            <li><a href="https://blog.google/intl/en-in/company-news/our-first-ai-hub-in-india-powered-by-a-15-billion-investment/" target="_blank" rel="noreferrer">Google Vizag AI Hub <ExternalLink size={13} /></a><span>$15B full-stack, gigawatt-scale program including energy and connectivity.</span></li>
            <li><a href="https://openai.com/index/five-new-stargate-sites/" target="_blank" rel="noreferrer">OpenAI Stargate Expansion <ExternalLink size={13} /></a><span>$500B, 10 GW program commitment.</span></li>
          </ul>
        </section>
      </article>
    </main>
  );
}
