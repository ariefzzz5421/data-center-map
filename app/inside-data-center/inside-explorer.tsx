"use client";

import { useRef, useState } from "react";
import {
  Activity,
  BatteryCharging,
  Cpu,
  Droplets,
  Fan,
  HardDrive,
  MemoryStick,
  Network,
  Pause,
  Play,
  RotateCcw,
  Router,
  Server,
  ShieldCheck,
  Zap,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import DataCenterScene, {
  type DataCenterSceneHandle,
  type SceneLayers,
  type SystemId,
  type ViewMode,
} from "./data-center-scene";

const systems = [
  { id:"grid", icon:Zap, tag:"UTILITY INTAKE", title:"Grid & transformers", metric:"132 kV → campus distribution", text:"High-voltage utility power enters the substation. Transformers step it down before switchgear distributes it safely across the campus." },
  { id:"switchgear", icon:BatteryCharging, tag:"PROTECTED POWER", title:"Switchgear, UPS & batteries", metric:"Redundant A/B power paths", text:"Switchgear isolates faults, while UPS systems bridge short interruptions and keep servers stable until backup generation or the grid recovers." },
  { id:"rack", icon:Server, tag:"COMPUTE FLOOR", title:"Liquid-cooled AI racks", metric:"60–120+ kW per dense rack", text:"Each rack combines accelerator trays, CPU hosts, memory, local storage, network switches, dual power distribution, and coolant manifolds." },
  { id:"network", icon:Network, tag:"DATA FABRIC", title:"Fiber & spine network", metric:"Up to 800 Gb/s links", text:"Top-of-rack and spine switches move model data between thousands of accelerators. The cyan pulses show an illustrative high-speed fabric path." },
  { id:"cooling", icon:Droplets, tag:"THERMAL LOOP", title:"CDU, chillers & heat rejection", metric:"Closed direct-to-chip loop", text:"Cold plates capture heat at GPUs and CPUs. Coolant distribution units and heat exchangers carry that heat to the outdoor cooling plant." },
  { id:"control", icon:Activity, tag:"FACILITY CONTROL", title:"Sensors, DCIM & safety", metric:"Monitored continuously", text:"Power, temperature, pressure, leaks, smoke, and equipment health feed the control room so operators can act before a fault spreads." },
] as const;

const rackParts = [
  { icon:Cpu, title:"GPU accelerator trays", text:"Parallel processors run the matrix calculations behind AI training and inference." },
  { icon:MemoryStick, title:"CPU & memory hosts", text:"Prepare data, schedule jobs, and coordinate the accelerators in each node." },
  { icon:HardDrive, title:"NVMe & checkpoint storage", text:"Feed datasets quickly and save model state so long training runs can recover." },
  { icon:Router, title:"Top-of-rack switch", text:"Connects servers to the low-latency spine fabric through high-speed optical links." },
  { icon:Zap, title:"Dual intelligent PDU", text:"Meters and delivers redundant A/B power to every device in the rack." },
  { icon:Droplets, title:"Coolant manifold", text:"Splits supply and return flow across cold plates mounted on high-heat chips." },
] as const;

const flow = [
  { icon:Zap, title:"Utility grid", text:"High-voltage intake" },
  { icon:BatteryCharging, title:"Protected power", text:"Switchgear + UPS" },
  { icon:Server, title:"AI compute", text:"CPU + GPU racks" },
  { icon:Network, title:"Model fabric", text:"Fiber + switching" },
  { icon:Fan, title:"Heat rejection", text:"Liquid loop + plant" },
] as const;

const viewModes: Array<{ id: ViewMode; label: string }> = [
  { id:"campus", label:"Campus map" },
  { id:"hall", label:"Data hall" },
  { id:"rack", label:"Inside rack" },
];

export default function InsideExplorer() {
  const sceneRef = useRef<DataCenterSceneHandle>(null);
  const [selectedId, setSelectedId] = useState<SystemId>("rack");
  const [viewMode, setViewMode] = useState<ViewMode>("campus");
  const [active, setActive] = useState(true);
  const [exploded, setExploded] = useState(false);
  const [layers, setLayers] = useState<SceneLayers>({ power:true, network:true, cooling:true });
  const selected = systems.find((system) => system.id === selectedId) ?? systems[2];
  const SelectedIcon = selected.icon;

  const chooseSystem = (id: SystemId, focus = true) => {
    setSelectedId(id);
    if (focus) sceneRef.current?.focus(id);
  };

  const chooseView = (mode: ViewMode) => {
    setViewMode(mode);
    sceneRef.current?.view(mode);
    if (mode === "rack") {
      setSelectedId("rack");
      setExploded(true);
    } else if (mode === "campus") {
      setExploded(false);
    }
  };

  const toggleLayer = (key: keyof SceneLayers) => {
    setLayers((current) => ({ ...current, [key]: !current[key] }));
  };

  return (
    <div className="inside-content">
      <section className="inside-hero">
        <p><Server size={14} /> Live 3D facility explorer</p>
        <h1>Step inside the<br /><em>AI factory.</em></h1>
        <div>
          <p>Rotate the campus, zoom into the data hall, and open a rack. Follow animated electricity, fiber traffic, and liquid cooling from the grid to the chips.</p>
          <span>REAL-TIME 3D<br />MOUSE + TOUCH</span>
        </div>
      </section>

      <section className="facility-stage" aria-label="Interactive data center facility model">
        <DataCenterScene
          ref={sceneRef}
          selectedId={selectedId}
          active={active}
          exploded={exploded}
          layers={layers}
          onSelect={(id) => chooseSystem(id, false)}
        />

        <div className="facility-topbar">
          <div className="view-switcher" aria-label="Scene view">
            {viewModes.map((mode) => (
              <button type="button" key={mode.id} className={viewMode === mode.id ? "active" : ""} onClick={() => chooseView(mode.id)}>
                {mode.label}
              </button>
            ))}
          </div>
          <button type="button" className={`system-state ${active ? "active" : ""}`} onClick={() => setActive((current) => !current)} aria-pressed={active}>
            {active ? <Pause size={13} /> : <Play size={13} />}
            <i /> {active ? "SYSTEM ACTIVE" : "SIMULATION PAUSED"}
          </button>
        </div>

        <div className="facility-layers" aria-label="Infrastructure layers">
          {(Object.keys(layers) as Array<keyof SceneLayers>).map((key) => (
            <button type="button" key={key} className={`${key} ${layers[key] ? "active" : ""}`} onClick={() => toggleLayer(key)} aria-pressed={layers[key]}>
              <i /> {key}
            </button>
          ))}
        </div>

        <aside className="facility-detail" aria-live="polite">
          <div className="facility-detail-icon"><SelectedIcon size={19} /></div>
          <div>
            <span>{selected.tag}</span>
            <h2>{selected.title}</h2>
            <strong>{selected.metric}</strong>
            <p>{selected.text}</p>
            {selectedId === "rack" && (
              <button type="button" onClick={() => setExploded((current) => !current)} aria-pressed={exploded}>
                {exploded ? "Close rack" : "Explode rack"} <span aria-hidden="true">↗</span>
              </button>
            )}
          </div>
        </aside>

        <div className="facility-telemetry" aria-label="Illustrative live telemetry">
          <span>SIMULATED TELEMETRY</span>
          <div><strong>{active ? "12.8" : "0.0"}</strong><small>MW IT LOAD</small></div>
          <div><strong>{active ? "1.18" : "—"}</strong><small>PUE</small></div>
          <div><strong>{active ? "96" : "0"}</strong><small>kW / RACK</small></div>
        </div>

        <div className="scene-controls" aria-label="Camera controls">
          <button type="button" onClick={() => sceneRef.current?.zoomIn()} aria-label="Zoom in"><ZoomIn size={16} /></button>
          <button type="button" onClick={() => sceneRef.current?.zoomOut()} aria-label="Zoom out"><ZoomOut size={16} /></button>
          <button type="button" onClick={() => { sceneRef.current?.reset(); setViewMode("campus"); setExploded(false); }} aria-label="Reset view"><RotateCcw size={15} /></button>
        </div>

        <p className="scene-hint">DRAG TO ORBIT · SCROLL OR PINCH TO ZOOM · TAP A SYSTEM</p>
      </section>

      <section className="inside-systems">
        <div className="inside-section-head"><span>01</span><div><p>FACILITY MAP</p><h2>Trace every critical system</h2></div></div>
        <div className="system-cards">
          {systems.map(({ id, icon:Icon, title, tag, metric }) => (
            <button type="button" key={id} className={selectedId === id ? "active" : ""} onClick={() => chooseSystem(id)}>
              <Icon size={18} />
              <span>{tag}</span>
              <strong>{title}</strong>
              <small>{metric}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="rack-anatomy">
        <div className="inside-section-head"><span>02</span><div><p>RACK CUTAWAY</p><h2>What lives inside an AI rack</h2></div></div>
        <div className="rack-anatomy-grid">
          <div className="rack-anatomy-copy">
            <span>REPRESENTATIVE HIGH-DENSITY RACK</span>
            <h3>One rack is a complete compute, power, network, and cooling system.</h3>
            <p>Use “Inside rack” above to fly closer, then explode the trays. The model is educational rather than a replica of one vendor&apos;s proprietary design.</p>
            <button type="button" onClick={() => chooseView("rack")}>Open the 3D rack <span aria-hidden="true">↗</span></button>
          </div>
          <div className="rack-parts">
            {rackParts.map(({ icon:Icon, title, text }, index) => (
              <article key={title}><span>{String(index + 1).padStart(2,"0")}</span><Icon size={17} /><div><strong>{title}</strong><p>{text}</p></div></article>
            ))}
          </div>
        </div>
      </section>

      <section className="inside-flow">
        <div className="inside-section-head"><span>03</span><div><p>ACTIVE INFRASTRUCTURE FLOW</p><h2>From electricity to intelligence</h2></div></div>
        <div className="flow-line" aria-label="Data center power, data, and heat path">
          <div className={`flow-pulse ${active ? "active" : ""}`} aria-hidden="true" />
          {flow.map(({ icon:Icon, title, text }, index) => (
            <div className="flow-node" key={title}><span><Icon size={18} /></span><strong>{title}</strong><small>{text}</small>{index < flow.length - 1 && <i aria-hidden="true">→</i>}</div>
          ))}
        </div>
      </section>

      <section className="inside-truth">
        <ShieldCheck size={18} />
        <div><strong>Real systems, representative configuration</strong><p>The architecture follows publicly documented modern AI facilities: accelerator racks, CPU and storage hosts, high-speed fabric, redundant power, and direct-to-chip liquid cooling. Scene readings are clearly simulated and do not represent one named campus.</p></div>
        <a href="https://blogs.microsoft.com/blog/2025/09/18/inside-the-worlds-most-powerful-ai-datacenter/" target="_blank" rel="noreferrer">Technical reference ↗</a>
      </section>
    </div>
  );
}
