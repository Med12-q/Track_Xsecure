import { useState } from "react";
import { MapComponent } from "./map";
import { Search, Globe, Server, Activity, RotateCcw, CheckCircle2, Loader2, AlertTriangle, Wifi, Shield } from "lucide-react";
import { toast } from "sonner";

type Phase = "form" | "scanning" | "result";

interface IpData {
  ip: string; city: string; region: string; country_name: string;
  country_code: string; latitude: number; longitude: number;
  org: string; timezone: string; asn: string;
}

const STEPS = [
  "Initialisation du module de traçage...",
  "Résolution DNS et reverse lookup...",
  "Interrogation des registres ARIN/RIPE/LACNIC...",
  "Analyse des tables de routage BGP...",
  "Géolocalisation via base MaxMind GeoIP2...",
  "Détection VPN / Proxy / Tor exit node...",
  "Extraction complète des métadonnées réseau...",
];

export function IpTracker() {
  const [ip, setIp] = useState("");
  const [phase, setPhase] = useState<Phase>("form");
  const [progress, setProgress] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const [data, setData] = useState<IpData | null>(null);

  const locate = async () => {
    const t = ip.trim(); if (!t) return;
    setPhase("scanning"); setProgress(0); setStepIdx(0); setData(null);

    let step = 0;
    const pInt = setInterval(() => setProgress(p => Math.min(p + 1.8, 88)), 90);
    const sInt = setInterval(() => { step++; if (step < STEPS.length) setStepIdx(step); else clearInterval(sInt); }, 750);

    try {
      const r = await fetch(`https://ipapi.co/${encodeURIComponent(t)}/json/`);
      const d = await r.json();
      clearInterval(pInt); clearInterval(sInt);
      if (d.error) throw new Error(d.reason || "IP introuvable");
      setProgress(100); setStepIdx(STEPS.length - 1);
      setTimeout(() => { setData(d); setPhase("result"); }, 600);
    } catch (e: any) {
      clearInterval(pInt); clearInterval(sInt);
      setPhase("form"); toast.error(e.message);
    }
  };

  if (phase === "form") return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-lg border border-neon-cyan flex items-center justify-center"
          style={{ background: "hsl(190 100% 50% / 0.06)" }}>
          <Globe className="w-5 h-5 text-neon-cyan" style={{ color: "#00e5ff" }} />
        </div>
        <div>
          <p className="section-number mb-1">Module 01 — Géolocalisation Réseau</p>
          <h3 className="font-tech text-white text-sm font-bold tracking-wider uppercase">
            Traçage par Adresse IP
          </h3>
          <p className="text-xs mt-1" style={{ color: "#555", fontFamily: "'JetBrains Mono'" }}>
            IPv4 · IPv6 · WHOIS · MaxMind GeoIP2 · BGP Routing
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <label className="section-number block">Cible — Adresse IP</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Server className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#00e5ff44" }} />
            <input className="neon-input pl-9" placeholder="Ex: 8.8.8.8 ou 2001:4860::" value={ip}
              onChange={e => setIp(e.target.value)} onKeyDown={e => e.key === "Enter" && locate()} />
          </div>
          <button className="btn-cyan" onClick={locate} disabled={!ip.trim()}>
            <Search className="w-3.5 h-3.5" /> TRACER
          </button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {["8.8.8.8", "1.1.1.1", "208.67.222.222", "185.199.108.153"].map(ex => (
          <button key={ex} onClick={() => setIp(ex)}
            className="px-3 py-1.5 rounded text-xs font-mono transition-all"
            style={{ border: "1px solid #00e5ff15", background: "#00e5ff08", color: "#00e5ff55" }}
            onMouseEnter={e => { (e.target as HTMLElement).style.color = "#00e5ff"; (e.target as HTMLElement).style.borderColor = "#00e5ff40"; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.color = "#00e5ff55"; (e.target as HTMLElement).style.borderColor = "#00e5ff15"; }}>
            {ex}
          </button>
        ))}
      </div>

      <div className="flex gap-3 p-4 rounded-lg" style={{ background: "#080808", border: "1px solid #111" }}>
        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#00e5ff33" }} />
        <p className="text-xs leading-relaxed" style={{ color: "#444", fontFamily: "'JetBrains Mono'" }}>
          Géolocalisation basée sur les registres WHOIS et la base MaxMind GeoIP2. Précision : ville / région. Les VPN et proxies peuvent altérer le résultat. Usage légal uniquement.
        </p>
      </div>
    </div>
  );

  if (phase === "scanning") return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ border: "1px solid #00e5ff33", background: "#00e5ff08" }}>
          <Globe className="w-5 h-5 animate-pulse" style={{ color: "#00e5ff" }} />
        </div>
        <div className="flex-1">
          <p className="font-tech text-xs font-bold tracking-widest uppercase" style={{ color: "#00e5ff" }}>
            ANALYSE EN COURS
          </p>
          <p className="text-xs font-mono mt-0.5" style={{ color: "#555" }}>{ip}</p>
        </div>
        <span className="font-display text-3xl" style={{ color: "#00e5ff" }}>{Math.round(progress)}<span className="text-base" style={{ color: "#00e5ff66" }}>%</span></span>
      </div>

      <div className="h-0.5 w-full rounded-full overflow-hidden" style={{ background: "#111" }}>
        <div className="h-full rounded-full progress-bar transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      <div className="space-y-1.5">
        {STEPS.map((s, i) => (
          <div key={i} className="step-item">
            {i < stepIdx ? <CheckCircle2 className="w-3.5 h-3.5 step-done flex-shrink-0" />
              : i === stepIdx ? <Loader2 className="w-3.5 h-3.5 step-active animate-spin flex-shrink-0" />
              : <div className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ border: "1px solid #1a1a1a" }} />}
            <span className={i < stepIdx ? "step-done" : i === stepIdx ? "step-active" : "step-pending"}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return data ? (
    <div className="space-y-5 fade-up">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ border: "1px solid #00e5ff33", background: "#00e5ff08" }}>
          <Activity className="w-5 h-5" style={{ color: "#00e5ff" }} />
        </div>
        <div>
          <p className="font-tech text-sm font-bold tracking-wider uppercase" style={{ color: "#00e5ff" }}>NŒUD LOCALISÉ</p>
          <p className="text-xs font-mono mt-0.5" style={{ color: "#555" }}>{data.ip}</p>
        </div>
        <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded" style={{ border: "1px solid #00e5ff25", background: "#00e5ff08" }}>
          <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: "#00e5ff" }} />
          <span className="font-tech text-xs font-bold" style={{ color: "#00e5ff" }}>LIVE — {data.country_code}</span>
        </div>
      </div>

      <div className="rounded-lg overflow-hidden" style={{ height: 280, border: "1px solid #00e5ff20" }}>
        <MapComponent latitude={data.latitude} longitude={data.longitude} zoom={11}
          label={`${data.city}, ${data.country_name}`} className="h-full w-full" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-0.5 rounded-lg overflow-hidden" style={{ border: "1px solid #111" }}>
        {[
          { label: "Adresse IP", value: data.ip, cyan: true },
          { label: "Pays", value: data.country_name || "—" },
          { label: "Ville", value: data.city || "—" },
          { label: "Région", value: data.region || "—" },
          { label: "Fournisseur ISP", value: data.org || "—" },
          { label: "Fuseau horaire", value: data.timezone || "—" },
          { label: "Latitude", value: String(data.latitude) },
          { label: "Longitude", value: String(data.longitude) },
        ].map(({ label, value, cyan }) => (
          <div key={label} className="data-row px-4" style={{ background: "#060606" }}>
            <span className="data-label">{label}</span>
            <span className={cyan ? "data-value-cyan" : "data-value"} style={{ maxWidth: "55%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={value}>{value}</span>
          </div>
        ))}
      </div>

      <button className="btn-cyan w-full justify-center" onClick={() => { setPhase("form"); setIp(""); }}>
        <RotateCcw className="w-3.5 h-3.5" /> NOUVELLE RECHERCHE
      </button>
    </div>
  ) : null;
}
