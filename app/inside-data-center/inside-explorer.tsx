"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Activity, Cable, Cpu, Droplets, Gauge, Network, Server, ShieldCheck, Zap } from "lucide-react";

const systems = [
  { id:"cooling", x:17, y:26, icon:Droplets, tag:"THERMAL LOOP", title:"Direct-to-chip liquid cooling", metric:"Closed warm-water loop", text:"Cold plates sit directly on GPUs and CPUs. Pumps move coolant through manifolds and heat exchangers, carrying dense rack heat away far more effectively than room air alone." },
  { id:"gpu", x:18, y:57, icon:Gauge, tag:"ACCELERATOR LAYER", title:"GPU accelerator trays", metric:"60–120+ kW per AI rack", text:"GPUs perform the parallel matrix calculations used to train and run AI models. A rack can contain dozens of accelerators linked so they behave like one large computer." },
  { id:"power", x:50, y:14, icon:Zap, tag:"POWER PATH", title:"Overhead busway & rack PDU", metric:"415/480 V distribution", text:"Busways carry conditioned electricity above the aisle. Rack power distribution units then meter and deliver it to every server while redundant paths limit downtime." },
  { id:"network", x:83, y:18, icon:Network, tag:"NETWORK FABRIC", title:"Top-of-rack switching", metric:"400–800 Gb/s links", text:"High-speed switches and optical fiber let thousands of accelerators exchange model data with extremely low latency. Network congestion can leave expensive GPUs idle." },
  { id:"cpu", x:82, y:51, icon:Cpu, tag:"HOST COMPUTE", title:"CPU, memory & storage hosts", metric:"Feeds and coordinates GPUs", text:"CPUs prepare data, schedule work, manage memory, and run operating services. Local flash and shared storage continuously feed datasets and save model checkpoints." },
  { id:"safety", x:68, y:28, icon:ShieldCheck, tag:"FACILITY CONTROL", title:"Sensors & fire protection", metric:"Monitored 24/7", text:"Temperature, pressure, smoke, leak, and electrical sensors feed the operations system. Zoned fire detection and suppression protect equipment without flooding the hall." },
] as const;

const flow = [
  { icon:Zap, title:"Utility power", text:"Grid or on-site generation" },
  { icon:Activity, title:"UPS & switchgear", text:"Condition and protect" },
  { icon:Server, title:"Compute racks", text:"CPU + GPU processing" },
  { icon:Cable, title:"Network fabric", text:"Move model data" },
  { icon:Droplets, title:"Cooling plant", text:"Reject captured heat" },
] as const;

export default function InsideExplorer() {
  const [selectedId, setSelectedId] = useState("gpu");
  const visualRef = useRef<HTMLDivElement>(null);
  const selected = systems.find((system) => system.id === selectedId) ?? systems[1];
  const SelectedIcon = selected.icon;

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!visualRef.current || event.pointerType === "touch") return;
    const rect = visualRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - .5) * -10;
    const y = ((event.clientY - rect.top) / rect.height - .5) * -7;
    visualRef.current.style.setProperty("--pan-x", `${x}px`);
    visualRef.current.style.setProperty("--pan-y", `${y}px`);
  };

  const resetPan = () => {
    visualRef.current?.style.setProperty("--pan-x", "0px");
    visualRef.current?.style.setProperty("--pan-y", "0px");
  };

  return (
    <div className="inside-content">
      <section className="inside-hero">
        <p><Server size={14} /> Interactive facility tour</p>
        <h1>Step inside the<br /><em>AI factory.</em></h1>
        <div><p>Select a glowing point to follow power, data, and cooling through a modern AI data hall. Every control works with mouse, keyboard, or touch.</p><span>6 SYSTEMS<br />ONE COMPUTE FLOOR</span></div>
      </section>

      <p className="mobile-swipe">Swipe sideways, then tap a marker to explore →</p>
      <div className="inside-stage-scroll">
        <section className="inside-visual" ref={visualRef} onPointerMove={handlePointerMove} onPointerLeave={resetPan} aria-label="Interactive AI data center interior">
          <Image className="inside-photo" src="/inside/ai-data-center-interior.png" alt="Photorealistic AI data center aisle with liquid-cooled server racks, overhead power, and network cabling" fill priority sizes="(max-width: 600px) 900px, 100vw" />
          <div className="inside-scan" aria-hidden="true" />
          {systems.map(({ id, x, y, title, icon:Icon }) => <button key={id} className={`inside-hotspot ${selectedId === id ? "active" : ""}`} style={{left:`${x}%`,top:`${y}%`}} onClick={() => setSelectedId(id)} aria-label={`Explore ${title}`} aria-pressed={selectedId === id}><span><Icon size={15} /></span><small>{title}</small></button>)}
          <aside className="inside-detail" aria-live="polite">
            <div className="inside-detail-icon"><SelectedIcon size={19} /></div>
            <div><span>{selected.tag}</span><h2>{selected.title}</h2><strong>{selected.metric}</strong><p>{selected.text}</p></div>
          </aside>
          <div className="visual-legend"><span><i /> SELECTED</span><span><i /> EXPLORE POINT</span></div>
        </section>
      </div>

      <section className="inside-systems">
        <div className="inside-section-head"><span>01</span><div><p>COMPONENT INDEX</p><h2>Choose a system</h2></div></div>
        <div className="system-cards">{systems.map(({id,icon:Icon,title,tag}) => <button key={id} className={selectedId === id ? "active" : ""} onClick={() => setSelectedId(id)}><Icon size={18} /><span>{tag}</span><strong>{title}</strong></button>)}</div>
      </section>

      <section className="inside-flow">
        <div className="inside-section-head"><span>02</span><div><p>LIVE INFRASTRUCTURE FLOW</p><h2>From electricity to intelligence</h2></div></div>
        <div className="flow-line" aria-label="Data center power and heat flow">
          <div className="flow-pulse" aria-hidden="true" />
          {flow.map(({icon:Icon,title,text}, index) => <div className="flow-node" key={title}><span><Icon size={18} /></span><strong>{title}</strong><small>{text}</small>{index < flow.length - 1 && <i aria-hidden="true">→</i>}</div>)}
        </div>
      </section>

      <section className="inside-truth"><ShieldCheck size={18} /><div><strong>Realistic educational visualization</strong><p>The generated interior is representative rather than a photo of one named facility. Component descriptions follow publicly documented AI data center designs, including liquid-cooled GPU racks, high-speed networking, UPS power paths, and continuous facility monitoring.</p></div></section>
    </div>
  );
}
