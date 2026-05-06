import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { MapComponent } from "./map";
import { Search, Globe, Server, Activity, RotateCcw, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
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
  currency?: string;
  languages?: string;
}

const SCAN_STEPS = [
  "Résolution de l'adresse IP cible...",
  "Interrogation des serveurs WHOIS...",
  "Analyse des tables de routage BGP...",
  "Géolocalisation via base MaxMind...",
  "Extraction des métadonnées réseau...",
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
      setProgress(p => Math.min(p + 3, 85));
    }, 120);

    const stepInterval = setInterval(() => {
      step++;
      if (step < SCAN_STEPS.length) setStepIdx(step);
      else clearInterval(stepInterval);
    }, 900);

    try {
      const res = await fetch(`https://ipapi.co/${encodeURIComponent(target)}/json/`);
      const result = await res.json();

      clearInterval(progressInterval);
      clearInterval(stepInterval);

      if (result.error) throw new Error(result.reason || "Adresse IP introuvable");

      setProgress(100);
      setStepIdx(SCAN_STEPS.length - 1);

      setTimeout(() => {
        setData(result as IpData);
        setPhase("result");
      }, 600);
    } catch (err: any) {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
      setPhase("form");
      toast.error(err.message || "Erreur lors de la localisation");
    }
  };

  if (phase === "form") {
    return (
      <div className="space-y-6">
        <div className="flex items-start gap-3 pb-5 border-b border-border">
          <div className="p-2.5 rounded-lg bg-secondary/10 border border-secondary/20 mt-0.5">
            <Globe className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Localisation via Adresse IP</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Géolocalisation réseau réelle — Base MaxMind + WHOIS
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider font-mono">
              Adresse IP cible (IPv4 ou IPv6)
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Server className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Ex: 8.8.8.8 ou 2001:4860:4860::8888"
                  value={ip}
                  onChange={e => setIp(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleLocate()}
                  className="pl-9 font-mono h-11 bg-card border-border focus-visible:ring-secondary/50 focus-visible:border-secondary/50"
                  data-testid="input-ip-address"
                />
              </div>
              <Button
                onClick={handleLocate}
                disabled={!ip.trim()}
                className="h-11 px-5 bg-secondary text-secondary-foreground hover:bg-secondary/90 font-medium gap-2"
                data-testid="button-locate-ip"
              >
                <Search className="w-4 h-4" />
                Tracer
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs font-mono text-muted-foreground">
            {["8.8.8.8", "1.1.1.1", "208.67.222.222"].map(ex => (
              <button
                key={ex}
                onClick={() => setIp(ex)}
                className="px-2.5 py-2 rounded-md border border-border/60 bg-card/40 hover:bg-card hover:border-secondary/40 hover:text-foreground transition-colors text-center"
              >
                {ex}
              </button>
            ))}
          </div>

          <div className="p-3.5 rounded-lg bg-muted/30 border border-border/60 flex gap-2.5">
            <AlertCircle className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              La localisation IP retrace le dernier routeur FAI connu. La précision varie selon l'opérateur (ville/région). Les VPN et proxies peuvent altérer le résultat.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "scanning") {
    return (
      <div className="space-y-6 py-2">
        <div className="flex items-start gap-3 pb-5 border-b border-border">
          <div className="p-2.5 rounded-lg bg-secondary/10 border border-secondary/20">
            <Globe className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Analyse en cours</h2>
            <p className="text-sm text-muted-foreground font-mono">{ip}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground font-mono">Interrogation des serveurs</span>
            <span className="font-mono font-medium text-secondary">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-1.5 bg-muted [&>div]:bg-secondary" />
        </div>

        <div className="space-y-2.5">
          {SCAN_STEPS.map((step, i) => (
            <div key={i} className="flex items-center gap-2.5 text-sm font-mono">
              {i < stepIdx ? (
                <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0" />
              ) : i === stepIdx ? (
                <Loader2 className="w-4 h-4 text-secondary animate-spin flex-shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-border/50 flex-shrink-0" />
              )}
              <span className={i <= stepIdx ? "text-foreground" : "text-muted-foreground/40"}>
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    data && (
      <div className="space-y-5 fade-up">
        <div className="flex items-center gap-3 pb-5 border-b border-border">
          <div className="p-2.5 rounded-lg bg-secondary/10 border border-secondary/20">
            <Activity className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-secondary">Noeud localisé</h2>
            <p className="text-sm text-muted-foreground font-mono">{data.ip}</p>
          </div>
          <div className="ml-auto px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-xs font-mono text-secondary font-medium">
            {data.country_code}
          </div>
        </div>

        <div className="rounded-xl overflow-hidden border border-border" style={{ height: 300 }}>
          <MapComponent
            latitude={data.latitude}
            longitude={data.longitude}
            zoom={11}
            label={`${data.city}, ${data.country_name}`}
            className="h-full w-full"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Adresse IP", value: data.ip, accent: "text-secondary" },
            { label: "Ville", value: data.city || "—", accent: "text-foreground" },
            { label: "Région", value: data.region || "—", accent: "text-foreground" },
            { label: "Pays", value: data.country_name || "—", accent: "text-foreground" },
            { label: "Fournisseur (FAI)", value: data.org || "—", accent: "text-foreground" },
            { label: "Fuseau horaire", value: data.timezone || "—", accent: "text-foreground" },
            { label: "Latitude", value: String(data.latitude), accent: "text-primary" },
            { label: "Longitude", value: String(data.longitude), accent: "text-primary" },
          ].map(({ label, value, accent }) => (
            <div key={label} className="px-3 py-2.5 rounded-lg bg-muted/30 border border-border/60">
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-0.5">{label}</p>
              <p className={`text-sm font-medium ${accent} font-mono truncate`} title={value}>{value}</p>
            </div>
          ))}
        </div>

        <Button variant="outline" className="w-full gap-2" onClick={() => { setPhase("form"); setIp(""); }}>
          <RotateCcw className="w-4 h-4" />
          Nouvelle recherche IP
        </Button>
      </div>
    )
  );
}
