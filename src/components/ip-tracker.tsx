import { useState } from "react";
import { MapComponent } from "./map";
import { Globe, Wifi, Search, RefreshCw, CheckCircle2, Loader2, AlertTriangle, ExternalLink, ChevronRight } from "lucide-react";

type Mode = "manual" | "auto";
type Phase = "idle" | "scanning" | "done" | "error";

interface IpResult {
  ip: string; city: string; region: string; country: string; countryCode: string;
  lat: number; lon: number; isp: string; org: string; as: string; timezone: string;
  zip: string; reverse?: string; mobile?: boolean; proxy?: boolean; hosting?: boolean;
}

const STEPS = [
  "Initialisation protocole de traçage...",
  "Résolution DNS et reverse lookup...",
  "Interrogation registres WHOIS / ARIN / RIPE...",
  "Analyse des tables de routage BGP...",
  "Géolocalisation via base MaxMind GeoIP2...",
  "Détection VPN / Proxy / Tor exit node...",
  "Extraction complète — compilation résultats...",
];

export function IpTracker() {
  const [mode, setMode] = useState<Mode>("manual");
  const [input, setInput] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [step, setStep] = useState(0);
  const [pct, setPct] = useState(0);
  const [result, setResult] = useState<IpResult | null>(null);
  const [errMsg, setErrMsg] = useState("");

  const runScan = async (target: string) => {
    setPhase("scanning"); setStep(0); setPct(0); setResult(null); setErrMsg("");

    let s = 0;
    const stepTimer = setInterval(() => {
      s = Math.min(s + 1, STEPS.length - 1);
      setStep(s);
      setPct(Math.round((s / STEPS.length) * 90));
    }, 600);

    try {
      // Use ip-api.com which returns mobile, proxy, hosting flags — more complete
      const url = target === "me"
        ? "https://ip-api.com/json/?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,reverse,mobile,proxy,hosting,query"
        : `https://ip-api.com/json/${encodeURIComponent(target)}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,reverse,mobile,proxy,hosting,query`;

      const resp = await fetch(url);
      const d = await resp.json();

      clearInterval(stepTimer);

      if (d.status === "fail") throw new Error(d.message || "IP introuvable ou invalide");
      if (!d.lat || !d.lon) throw new Error("Données de localisation indisponibles");

      setPct(100); setStep(STEPS.length - 1);

      const r: IpResult = {
        ip: d.query, city: d.city || "—", region: d.regionName || d.region || "—",
        country: d.country || "—", countryCode: d.countryCode || "",
        lat: d.lat, lon: d.lon,
        isp: d.isp || "—", org: d.org || "—", as: d.as || "—",
        timezone: d.timezone || "—", zip: d.zip || "—",
        reverse: d.reverse, mobile: d.mobile, proxy: d.proxy, hosting: d.hosting,
      };

      setTimeout(() => { setResult(r); setPhase("done"); }, 400);

    } catch (e: any) {
      clearInterval(stepTimer);
      setErrMsg(e.message || "Erreur de connexion");
      setPhase("error");
    }
  };

  const handleLocate = () => {
    if (mode === "auto") { runScan("me"); return; }
    const t = input.trim();
    if (!t) return;
    runScan(t);
  };

  const reset = () => { setPhase("idle"); setResult(null); setInput(""); setErrMsg(""); setPct(0); setStep(0); };

  /* ── IDLE ── */
  if (phase === "idle" || phase === "error") return (
    <div className="space-y-5">
      {/* Tabs */}
      <div className="flex gap-2 p-1 rounded-lg" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <button className={`btn-tab ${mode === "manual" ? "active" : ""}`} onClick={() => setMode("manual")}>
          <Globe className="w-3.5 h-3.5" /> Adresse IP
        </button>
        <button className={`btn-tab ${mode === "auto" ? "active" : ""}`} onClick={() => setMode("auto")}>
          <Wifi className="w-3.5 h-3.5" /> Mon IP
        </button>
      </div>

      {mode === "manual" ? (
        <div className="space-y-3">
          <div className="relative">
            <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(0,229,255,0.3)" }} />
            <input className="tx-input" placeholder="Ex: 0.0.0.0 · 1.1.1.1 · 2001:4860:4860::8888"
              value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLocate()} />
          </div>
          <div className="flex flex-wrap gap-2">
            {["8.8.8.8", "1.1.1.1", "208.67.222.222"].map(ip => (
              <button key={ip} onClick={() => setInput(ip)}
                className="px-3 py-1.5 rounded-md font-mono text-xs transition-all"
                style={{ border: "1px solid rgba(0,229,255,0.1)", color: "rgba(0,229,255,0.4)", background: "transparent" }}
                onMouseEnter={e => { (e.currentTarget.style.color = "#00e5ff"); (e.currentTarget.style.borderColor = "rgba(0,229,255,0.3)"); }}
                onMouseLeave={e => { (e.currentTarget.style.color = "rgba(0,229,255,0.4)"); (e.currentTarget.style.borderColor = "rgba(0,229,255,0.1)"); }}>
                {ip}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 p-4 rounded-lg" style={{ background: "rgba(0,229,255,0.04)", border: "1px solid rgba(0,229,255,0.1)" }}>
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#00e5ff", animation: "dot-blink 1.5s ease-in-out infinite" }} />
          <p className="font-mono text-sm" style={{ color: "rgba(0,229,255,0.7)" }}>
            Détecte et localise automatiquement votre adresse IP publique
          </p>
        </div>
      )}

      <button className="btn-primary w-full" onClick={handleLocate} disabled={mode === "manual" && !input.trim()}>
        <Search className="w-4 h-4" /> Localiser maintenant <ChevronRight className="w-4 h-4" />
      </button>

      {phase === "error" && (
        <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: "rgba(255,35,35,0.06)", border: "1px solid rgba(255,35,35,0.2)" }}>
          <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: "#ff4444" }} />
          <p className="font-mono text-sm" style={{ color: "#ff6666" }}>{errMsg}</p>
        </div>
      )}

      <div className="flex items-start gap-3 p-4 rounded-lg" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "rgba(0,229,255,0.25)" }} />
        <p className="text-xs leading-relaxed font-mono" style={{ color: "rgba(255,255,255,0.2)" }}>
          Géolocalisation basée sur les registres WHOIS et la base MaxMind GeoIP2. Précision à la ville/région. Les VPN et proxies peuvent masquer la position réelle.
        </p>
      </div>
    </div>
  );

  /* ── SCANNING ── */
  if (phase === "scanning") return (
    <div className="space-y-6 py-2">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ border: "1px solid rgba(0,229,255,0.2)", background: "rgba(0,229,255,0.06)" }}>
          <Globe className="w-5 h-5 animate-pulse" style={{ color: "#00e5ff" }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-tech text-xs font-bold tracking-widest uppercase" style={{ color: "#00e5ff" }}>LOCALISATION EN COURS</p>
          <p className="font-mono text-xs truncate mt-0.5" style={{ color: "rgba(255,255,255,0.25)" }}>
            {mode === "auto" ? "Détection automatique de votre IP..." : input}
          </p>
        </div>
        <span className="font-display text-4xl flex-shrink-0" style={{ color: "#00e5ff", lineHeight: 1 }}>
          {pct}<span className="text-xl" style={{ color: "rgba(0,229,255,0.4)" }}>%</span>
        </span>
      </div>

      <div className="h-0.5 w-full rounded-full overflow-hidden" style={{ background: "#111" }}>
        <div className="h-full rounded-full progress-cyan transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>

      <div className="space-y-2">
        {STEPS.map((s, i) => (
          <div key={i} className="step-row">
            {i < step
              ? <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#4ade80" }} />
              : i === step
              ? <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" style={{ color: "#00e5ff" }} />
              : <div className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ border: "1px solid #1a1a1a" }} />}
            <span style={{ color: i < step ? "#4ade80" : i === step ? "#00e5ff" : "#1e1e1e", transition: "color 0.3s" }}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );

  /* ── RESULT ── */
  return result ? (
    <div className="space-y-5 fade-up">
      {/* Status bar */}
      <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: "rgba(0,229,255,0.05)", border: "1px solid rgba(0,229,255,0.15)" }}>
        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#00e5ff", animation: "dot-blink 1.5s ease-in-out infinite" }} />
        <div className="flex-1 min-w-0">
          <p className="font-tech text-xs font-bold tracking-widest uppercase" style={{ color: "#00e5ff" }}>NŒUD LOCALISÉ — {result.countryCode}</p>
          <p className="font-mono text-xs truncate mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>{result.ip}</p>
        </div>
        {result.proxy && (
          <span className="px-2 py-1 rounded font-tech text-xs font-bold" style={{ border: "1px solid rgba(255,165,0,0.4)", color: "#ffa500", background: "rgba(255,165,0,0.08)" }}>VPN/PROXY</span>
        )}
      </div>

      {/* Map */}
      <div className="rounded-xl overflow-hidden" style={{ height: 260, border: "1px solid rgba(0,229,255,0.12)" }}>
        <MapComponent lat={result.lat} lng={result.lon} zoom={11}
          label={`${result.city}, ${result.country}`} className="h-full w-full" />
      </div>

      {/* Data grid */}
      <div className="tx-card">
        <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent, rgba(0,229,255,0.3), transparent)" }} />
        {[
          { k: "Adresse IP", v: result.ip, cyan: true },
          { k: "Pays", v: `${result.country} (${result.countryCode})` },
          { k: "Région", v: result.region },
          { k: "Ville", v: result.city },
          { k: "Code postal", v: result.zip || "—" },
          { k: "Coordonnées GPS", v: `${result.lat.toFixed(5)}, ${result.lon.toFixed(5)}` },
          { k: "Fuseau horaire", v: result.timezone },
          { k: "ISP / Opérateur", v: result.isp },
          { k: "Organisation", v: result.org },
          { k: "ASN", v: result.as || "—" },
          ...(result.reverse ? [{ k: "Reverse DNS", v: result.reverse }] : []),
          { k: "Mobile", v: result.mobile ? "Oui" : "Non" },
          { k: "Proxy / VPN / Tor", v: result.proxy ? "⚠ Détecté" : "Non détecté", warn: result.proxy },
          { k: "Hébergement / DC", v: result.hosting ? "Oui" : "Non" },
        ].map(({ k, v, cyan, warn }) => (
          <div key={k} className="data-table-row">
            <span className="data-key">{k}</span>
            <span className={cyan ? "data-val-cyan" : warn ? "data-val-red" : "data-val"} title={v}>{v}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <a href={`https://www.google.com/maps?q=${result.lat},${result.lon}`} target="_blank" rel="noreferrer"
          className="btn-cyan flex-1" style={{ textDecoration: "none" }}>
          <ExternalLink className="w-3.5 h-3.5" /> Google Maps
        </a>
        <button className="btn-cyan" onClick={reset}>
          <RefreshCw className="w-3.5 h-3.5" /> Nouvelle recherche
        </button>
      </div>
    </div>
  ) : null;
}
