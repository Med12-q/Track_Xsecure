import { useState } from "react";
import { MapComponent } from "./map";
import { Search, Globe, Server, Activity, RotateCcw, CheckCircle2, Loader2, AlertCircle, Wifi, Shield } from "lucide-react";
import { toast } from "sonner";

type Phase = "form" | "scanning" | "result";

interface IpData {
  ip: string;
  city: string;
  region: string;
  country_name: string;
  country_code: string;
  latitude: number;
  longitude: number;
  org: string;
  timezone: string;
  asn: string;
  in_eu: boolean;
}

const SCAN_STEPS = [
  "Résolution DNS de la cible...",
  "Interrogation des serveurs WHOIS...",
  "Analyse des tables de routage BGP...",
  "Géolocalisation via base MaxMind...",
  "Extraction des métadonnées réseau...",
  "Détection VPN / Proxy / Tor...",
];

export function IpTracker() {
  const [ip, setIp] = useState("");
  const [phase, setPhase] = useState<Phase>("form");
  const [progress, setProgress] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const [data, setData] = useState<IpData | null>(null);

  const handleLocate = async () => {
    const target = ip.trim();
    if (!target) return;
    setPhase("scanning");
    setProgress(0);
    setStepIdx(0);
    setData(null);

    let step = 0;
    const progressInterval = setInterval(() => {
      setProgress(p => Math.min(p + 2, 88));
    }, 100);
    const stepInterval = setInterval(() => {
      step++;
      if (step < SCAN_STEPS.length) setStepIdx(step);
      else clearInterval(stepInterval);
    }, 800);

    try {
      const res = await fetch(`https://ipapi.co/${encodeURIComponent(target)}/json/`);
      const result = await res.json();
      clearInterval(progressInterval);
      clearInterval(stepInterval);
      if (result.error) throw new Error(result.reason || "IP introuvable");
      setProgress(100);
      setStepIdx(SCAN_STEPS.length - 1);
      setTimeout(() => { setData(result as IpData); setPhase("result"); }, 500);
    } catch (err: any) {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
      setPhase("form");
      toast.error(err.message || "Erreur de localisation");
    }
  };

  const EXAMPLES = ["8.8.8.8", "1.1.1.1", "208.67.222.222"];

  if (phase === "form") return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 pb-4 border-b border-cyan-500/15">
        <div className="w-9 h-9 rounded-lg border border-cyan-500/30 bg-cyan-500/5 flex items-center justify-center">
          <Globe className="w-4 h-4 text-cyan-400" />
        </div>
        <div>
          <h2 className="font-display font-bold text-base tracking-wider text-white">LOCALISATION IP</h2>
          <p className="text-xs font-mono text-gray-600">Géolocalisation réseau réelle — MaxMind + WHOIS</p>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-mono text-cyan-500/70 uppercase tracking-widest">
          Adresse IP cible (IPv4 / IPv6)
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Server className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-500/40" />
            <input
              className="input-neon w-full pl-9 pr-3 py-2.5 rounded-lg text-sm"
              placeholder="Ex: 8.8.8.8"
              value={ip}
              onChange={e => setIp(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLocate()}
            />
          </div>
          <button
            onClick={handleLocate}
            disabled={!ip.trim()}
            className="px-4 py-2.5 rounded-lg border border-cyan-500/40 bg-cyan-500/10 text-cyan-400 text-sm font-display font-bold tracking-wider uppercase hover:bg-cyan-500/20 hover:shadow-[0_0_20px_hsl(185_100%_50%/0.2)] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            TRACER
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        {EXAMPLES.map(ex => (
          <button key={ex} onClick={() => setIp(ex)}
            className="px-2.5 py-1.5 rounded border border-white/8 bg-white/3 text-xs font-mono text-gray-600 hover:text-cyan-400 hover:border-cyan-500/30 transition-all">
            {ex}
          </button>
        ))}
      </div>

      <div className="flex gap-2 p-3 rounded-lg bg-red-950/20 border border-red-500/15">
        <AlertCircle className="w-4 h-4 text-red-500/60 flex-shrink-0 mt-0.5" />
        <p className="text-xs font-mono text-gray-600 leading-relaxed">
          La localisation IP retrace le routeur FAI de la cible. Précision variable selon VPN/Proxy. Résultat en temps réel.
        </p>
      </div>
    </div>
  );

  if (phase === "scanning") return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 pb-4 border-b border-cyan-500/15">
        <div className="w-9 h-9 rounded-lg border border-cyan-500/30 bg-cyan-500/5 flex items-center justify-center">
          <Globe className="w-4 h-4 text-cyan-400 animate-pulse" />
        </div>
        <div>
          <h2 className="font-display font-bold text-base tracking-wider text-white">ANALYSE EN COURS</h2>
          <p className="text-xs font-mono text-cyan-400/60">{ip}</p>
        </div>
        <div className="ml-auto text-lg font-display font-bold text-cyan-400">{Math.round(progress)}%</div>
      </div>

      <div className="h-0.5 w-full bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 to-cyan-300 transition-all duration-300"
          style={{ width: `${progress}%`, boxShadow: "0 0 12px hsl(185 100% 50% / 0.7)" }}
        />
      </div>

      <div className="space-y-2.5">
        {SCAN_STEPS.map((step, i) => (
          <div key={i} className="flex items-center gap-2.5 text-xs font-mono">
            {i < stepIdx ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
            ) : i === stepIdx ? (
              <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin flex-shrink-0" />
            ) : (
              <div className="w-3.5 h-3.5 rounded-full border border-white/10 flex-shrink-0" />
            )}
            <span className={i <= stepIdx ? "text-gray-300" : "text-gray-700"}>{step}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return data ? (
    <div className="space-y-4 fade-up">
      <div className="flex items-center gap-3 pb-4 border-b border-cyan-500/15">
        <div className="w-9 h-9 rounded-lg border border-cyan-500/30 bg-cyan-500/5 flex items-center justify-center">
          <Activity className="w-4 h-4 text-cyan-400" />
        </div>
        <div>
          <h2 className="font-display font-bold text-base tracking-wider text-cyan-400">NŒUD LOCALISÉ</h2>
          <p className="text-xs font-mono text-gray-600">{data.ip}</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 pulse-dot" />
          <span className="text-[10px] font-mono text-cyan-400 font-bold">{data.country_code}</span>
        </div>
      </div>

      <div className="rounded-lg overflow-hidden border border-cyan-500/20" style={{ height: 260 }}>
        <MapComponent latitude={data.latitude} longitude={data.longitude} zoom={11}
          label={`${data.city}, ${data.country_name}`} className="h-full w-full" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        {[
          { icon: Wifi, label: "IP", value: data.ip, highlight: true },
          { icon: Globe, label: "Pays", value: data.country_name },
          { icon: Globe, label: "Ville", value: data.city || "—" },
          { icon: Globe, label: "Région", value: data.region || "—" },
          { icon: Server, label: "FAI / ASN", value: data.org || "—" },
          { icon: Activity, label: "Fuseau", value: data.timezone || "—" },
        ].map(({ icon: Icon, label, value, highlight }) => (
          <div key={label} className="px-3 py-2.5 rounded-lg bg-black/40 border border-white/6">
            <p className="text-[9px] font-mono text-gray-700 uppercase tracking-widest mb-1">{label}</p>
            <p className={`text-sm font-mono font-medium truncate ${highlight ? "text-cyan-400" : "text-gray-300"}`} title={value}>
              {value}
            </p>
          </div>
        ))}
      </div>

      <button onClick={() => { setPhase("form"); setIp(""); }}
        className="w-full py-2.5 rounded-lg border border-white/10 bg-white/3 text-gray-500 text-xs font-display font-bold tracking-wider uppercase hover:border-cyan-500/30 hover:text-cyan-400 transition-all flex items-center justify-center gap-2">
        <RotateCcw className="w-3.5 h-3.5" />
        NOUVELLE RECHERCHE IP
      </button>
    </div>
  ) : null;
}
