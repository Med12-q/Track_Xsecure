import { useState } from "react";
import { Globe, Wifi, Search, RefreshCw, CheckCircle2, Loader2, AlertTriangle, ExternalLink, ChevronRight, Shield, Radio, MapPin } from "lucide-react";
import { getThreatLevel, ThreatMeter, type ThreatLevel } from "./panels/ThreatMeter";
import { saveToHistory } from "./panels/LocationHistory";

type Mode = "manual" | "auto";
type Phase = "idle" | "scanning" | "done" | "error";

export interface IpResult {
  ip: string; city: string; region: string; country: string; countryCode: string;
  lat: number; lon: number; isp: string; org: string; as: string;
  timezone: string; zip: string; reverse: string;
  mobile: boolean; proxy: boolean; hosting: boolean;
  threat: ThreatLevel; threatColor: string;
}

const STEPS = [
  "Initialisation du moteur de traçage réseau...",
  "Résolution DNS inverse (PTR record)...",
  "Interrogation WHOIS — ARIN · RIPE · APNIC · LACNIC...",
  "Analyse tables de routage BGP — AS Path...",
  "Géolocalisation MaxMind GeoIP2 (±1km)...",
  "Détection VPN / Proxy / Tor / Hébergeur...",
  "Agrégation données — compilation rapport final...",
];

const THREAT_COLORS: Record<ThreatLevel, string> = {
  "FAIBLE": "#00ff88", "MOYEN": "#ffcc00", "ÉLEVÉ": "#ff6600", "CRITIQUE": "#ff0033",
};

export function IpTracker({ onResult }: { onResult?: (r: IpResult) => void }) {
  const [mode, setMode] = useState<Mode>("manual");
  const [input, setInput] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [stepIdx, setStepIdx] = useState(0);
  const [pct, setPct] = useState(0);
  const [result, setResult] = useState<IpResult | null>(null);
  const [errMsg, setErrMsg] = useState("");

  const runScan = async (target: string) => {
    setPhase("scanning"); setStepIdx(0); setPct(0); setResult(null); setErrMsg("");

    let s = 0;
    const stepInterval = setInterval(() => {
      s = Math.min(s + 1, STEPS.length - 1);
      setStepIdx(s); setPct(Math.round((s / STEPS.length) * 88));
    }, 550);

    try {
      const fields = "status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,reverse,mobile,proxy,hosting,query";
      const url = target === "me"
        ? `https://ip-api.com/json/?fields=${fields}`
        : `https://ip-api.com/json/${encodeURIComponent(target)}?fields=${fields}`;
      const resp = await fetch(url);
      const d = await resp.json();
      clearInterval(stepInterval);
      if (d.status === "fail") throw new Error(d.message || "IP introuvable ou invalide");
      if (!d.lat || !d.lon) throw new Error("Données de géolocalisation indisponibles");

      const threat = getThreatLevel(d.proxy, d.hosting, d.mobile);
      const threatColor = THREAT_COLORS[threat];

      setPct(100); setStepIdx(STEPS.length - 1);
      const r: IpResult = {
        ip: d.query, city: d.city || "—", region: d.regionName || "—",
        country: d.country || "—", countryCode: d.countryCode || "—",
        lat: d.lat, lon: d.lon, isp: d.isp || "—", org: d.org || "—",
        as: d.as || "—", timezone: d.timezone || "—", zip: d.zip || "—",
        reverse: d.reverse || "Aucun", mobile: d.mobile, proxy: d.proxy, hosting: d.hosting,
        threat, threatColor,
      };

      setTimeout(() => {
        setResult(r); setPhase("done");
        saveToHistory({ ip: r.ip, city: r.city, country: r.country, countryCode: r.countryCode, isp: r.isp, lat: r.lat, lon: r.lon, threat, threatColor });
        onResult?.(r);
      }, 400);

    } catch (e: any) {
      clearInterval(stepInterval);
      setErrMsg(e.message || "Erreur de connexion réseau"); setPhase("error");
    }
  };

  const handleLocate = () => mode === "auto" ? runScan("me") : input.trim() && runScan(input.trim());
  const reset = () => { setPhase("idle"); setResult(null); setInput(""); setErrMsg(""); };

  /* ─── IDLE / ERROR ─── */
  if (phase === "idle" || phase === "error") return (
    <div className="space-y-4">
      {/* Mode tabs */}
      <div className="flex gap-1.5 p-1 rounded-lg" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)" }}>
        <button className={`btn-tab ${mode === "manual" ? "active" : ""}`} onClick={() => setMode("manual")}>
          <Globe className="w-3.5 h-3.5" /> Adresse IP
        </button>
        <button className={`btn-tab ${mode === "auto" ? "active" : ""}`} onClick={() => setMode("auto")}>
          <Wifi className="w-3.5 h-3.5" /> Mon IP
        </button>
      </div>

      {mode === "manual" ? (
        <div className="space-y-2.5">
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "rgba(0,229,255,0.3)" }} />
            <input className="tx-input" placeholder="IPv4 ou IPv6 — Ex: 8.8.8.8 · 1.1.1.1 · 2606:4700::"
              value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLocate()} />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {["8.8.8.8", "1.1.1.1", "208.67.222.222", "185.199.108.153", "104.16.0.1"].map(ip => (
              <button key={ip} onClick={() => setInput(ip)}
                className="px-2.5 py-1 rounded font-mono text-xs transition-all"
                style={{ border: "1px solid rgba(0,229,255,0.08)", color: "rgba(0,229,255,0.35)", fontSize: "10px" }}
                onMouseEnter={e => { e.currentTarget.style.color = "#00e5ff"; e.currentTarget.style.borderColor = "rgba(0,229,255,0.3)"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "rgba(0,229,255,0.35)"; e.currentTarget.style.borderColor = "rgba(0,229,255,0.08)"; }}>
                {ip}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg"
          style={{ background: "rgba(0,229,255,0.04)", border: "1px solid rgba(0,229,255,0.1)" }}>
          <div className="w-2 h-2 rounded-full flex-shrink-0 pulse-dot" style={{ background: "#00e5ff" }} />
          <p style={{ fontFamily: "'JetBrains Mono'", fontSize: "12px", color: "rgba(0,229,255,0.6)" }}>
            Détection automatique de votre adresse IP publique
          </p>
        </div>
      )}

      <button className="btn-launch w-full" onClick={handleLocate} disabled={mode === "manual" && !input.trim()}>
        <Search className="w-4 h-4" /> LANCER L'ANALYSE
        <ChevronRight className="w-4 h-4" />
      </button>

      {phase === "error" && (
        <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: "rgba(255,0,51,0.05)", border: "1px solid rgba(255,0,51,0.2)" }}>
          <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: "#ff4455" }} />
          <p style={{ fontFamily: "'JetBrains Mono'", fontSize: "11px", color: "#ff6677" }}>{errMsg}</p>
        </div>
      )}
    </div>
  );

  /* ─── SCANNING ─── */
  if (phase === "scanning") return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ border: "1px solid rgba(0,229,255,0.2)", background: "rgba(0,229,255,0.06)" }}>
          <Radio className="w-5 h-5 animate-pulse" style={{ color: "#00e5ff" }} />
        </div>
        <div className="flex-1 min-w-0">
          <p style={{ fontFamily: "'Orbitron'", fontSize: "10px", fontWeight: 700, color: "#00e5ff", letterSpacing: "0.2em", textTransform: "uppercase" }}>ANALYSE EN COURS</p>
          <p style={{ fontFamily: "'JetBrains Mono'", fontSize: "11px", color: "rgba(255,255,255,0.2)", marginTop: "2px" }}>
            {mode === "auto" ? "Détection IP publique..." : input}
          </p>
        </div>
        <span style={{ fontFamily: "'Orbitron'", fontSize: "28px", fontWeight: 900, color: "#00e5ff", flexShrink: 0, lineHeight: 1 }}>
          {pct}<span style={{ fontSize: "14px", color: "rgba(0,229,255,0.4)" }}>%</span>
        </span>
      </div>

      <div className="h-1 w-full rounded-full overflow-hidden" style={{ background: "#111" }}>
        <div className="h-full rounded-full bar-cyan transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>

      <div className="space-y-1.5">
        {STEPS.map((s, i) => (
          <div key={i} className="step-item">
            {i < stepIdx ? <CheckCircle2 className="w-3 h-3 flex-shrink-0" style={{ color: "#00ff88" }} />
              : i === stepIdx ? <Loader2 className="w-3 h-3 animate-spin flex-shrink-0" style={{ color: "#00e5ff" }} />
              : <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ border: "1px solid #1a1a1a" }} />}
            <span style={{ color: i < stepIdx ? "#00ff88" : i === stepIdx ? "#00e5ff" : "#1e1e1e", transition: "color 0.3s" }}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );

  /* ─── RESULT ─── */
  return result ? (
    <div className="space-y-4 fade-in-up">
      {/* Status badge */}
      <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
        style={{ background: `${result.threatColor}08`, border: `1px solid ${result.threatColor}25` }}>
        <div className="w-2 h-2 rounded-full flex-shrink-0 pulse-dot" style={{ background: result.threatColor }} />
        <div className="flex-1 min-w-0">
          <p style={{ fontFamily: "'Orbitron'", fontSize: "10px", fontWeight: 700, color: result.threatColor, letterSpacing: "0.15em", textTransform: "uppercase" }}>
            NŒUD LOCALISÉ — {result.countryCode} — MENACE {result.threat}
          </p>
          <p style={{ fontFamily: "'JetBrains Mono'", fontSize: "11px", color: "rgba(255,255,255,0.25)", marginTop: "1px" }}>{result.ip}</p>
        </div>
        {result.proxy && (
          <span style={{ fontFamily: "'Orbitron'", fontSize: "8px", fontWeight: 800, color: "#ff6600", border: "1px solid rgba(255,102,0,0.35)", padding: "2px 6px", borderRadius: "3px", letterSpacing: "0.1em", flexShrink: 0 }}>VPN/PROXY</span>
        )}
      </div>

      {/* Data table */}
      <div>
        {[
          { k: "Adresse IP", v: result.ip, cyan: true },
          { k: "Pays / Région", v: `${result.country} — ${result.region}` },
          { k: "Ville / Code postal", v: `${result.city} ${result.zip ? `(${result.zip})` : ""}` },
          { k: "Coordonnées GPS", v: `${result.lat.toFixed(5)}, ${result.lon.toFixed(5)}` },
          { k: "Fuseau horaire", v: result.timezone },
          { k: "ISP / Opérateur", v: result.isp },
          { k: "Organisation", v: result.org },
          { k: "ASN", v: result.as },
          { k: "Reverse DNS", v: result.reverse },
          { k: "Mobile / CGNAT", v: result.mobile ? "Oui" : "Non", green: !result.mobile },
          { k: "Proxy / VPN / Tor", v: result.proxy ? "⚠ DÉTECTÉ" : "Non détecté", red: result.proxy, green: !result.proxy },
          { k: "Hébergeur / Data Center", v: result.hosting ? "⚠ Oui" : "Non", red: result.hosting },
        ].map(({ k, v, cyan, red, green }) => (
          <div key={k} className="data-row">
            <span className="data-k">{k}</span>
            <span className={`data-v${cyan ? "-cyan" : red ? "-red" : green ? "-green" : ""}`} title={v}>{v}</span>
          </div>
        ))}
      </div>

      {/* Threat */}
      <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${result.threatColor}20`, background: `${result.threatColor}05` }}>
        <ThreatMeter level={result.threat} />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <a href={`https://www.google.com/maps?q=${result.lat},${result.lon}`} target="_blank" rel="noreferrer"
          className="btn-outline-cyan flex-1 justify-center" style={{ textDecoration: "none" }}>
          <ExternalLink className="w-3 h-3" /> Google Maps
        </a>
        <a href={`https://bgp.he.net/ip/${result.ip}`} target="_blank" rel="noreferrer"
          className="btn-outline-cyan" style={{ textDecoration: "none" }}>
          <Shield className="w-3 h-3" /> BGP
        </a>
        <button className="btn-outline-cyan" onClick={reset}>
          <RefreshCw className="w-3 h-3" />
        </button>
      </div>
    </div>
  ) : null;
}
