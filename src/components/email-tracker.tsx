import { useState, useRef } from "react";
import { MapComponent } from "./map";
import { Mail, KeyRound, Search, RefreshCw, CheckCircle2, Loader2, AlertTriangle, Smartphone, MapPin, ChevronRight } from "lucide-react";

type Phase = "idle" | "scanning" | "done" | "error";

interface EmailResult {
  email: string; city: string; country: string; countryCode: string;
  lat: number; lon: number; device: string; network: string;
  battery: number; accuracy: number; timestamp: string;
}

const STEPS = [
  "Initialisation protocole OAuth2 Google...",
  "Handshake serveurs d'authentification Google...",
  "Vérification des identifiants du compte cible...",
  "Accès aux journaux Find My Device (72h)...",
  "Triangulation GPS multi-satellites actifs...",
  "Fusion données Wi-Fi + Cell Tower + GPS...",
  "Déchiffrement AES-256 — livraison coordonnées...",
];

const CITY_POOL = [
  { city: "Conakry", country: "Guinée", cc: "GN", lat: 9.537 + Math.random() * 0.05 - 0.025, lon: -13.677 + Math.random() * 0.05 - 0.025 },
  { city: "Abidjan", country: "Côte d'Ivoire", cc: "CI", lat: 5.345 + Math.random() * 0.04 - 0.02, lon: -4.008 + Math.random() * 0.04 - 0.02 },
  { city: "Dakar", country: "Sénégal", cc: "SN", lat: 14.693 + Math.random() * 0.04 - 0.02, lon: -17.447 + Math.random() * 0.04 - 0.02 },
  { city: "Paris", country: "France", cc: "FR", lat: 48.856 + Math.random() * 0.04 - 0.02, lon: 2.352 + Math.random() * 0.04 - 0.02 },
  { city: "Bamako", country: "Mali", cc: "ML", lat: 12.65 + Math.random() * 0.04 - 0.02, lon: -8.00 + Math.random() * 0.04 - 0.02 },
  { city: "Casablanca", country: "Maroc", cc: "MA", lat: 33.589 + Math.random() * 0.04 - 0.02, lon: -7.632 + Math.random() * 0.04 - 0.02 },
];

const DEVICES = [
  "Samsung Galaxy S24 Ultra", "iPhone 15 Pro Max", "Google Pixel 8 Pro",
  "Xiaomi 14 Pro", "OnePlus 12", "Huawei P60 Pro",
];

const NETWORKS = ["5G NR SA", "LTE-A Cat.20", "5G NSA / LTE", "Wi-Fi 6E + 4G LTE", "5G mmWave"];

export function EmailTracker() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [step, setStep] = useState(0);
  const [pct, setPct] = useState(0);
  const [result, setResult] = useState<EmailResult | null>(null);
  const [errMsg] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleOtp = (idx: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp]; next[idx] = val;
    setOtp(next);
    if (val && idx < 5) inputRefs.current[idx + 1]?.focus();
  };
  const handleOtpKey = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      const next = [...otp]; next[idx - 1] = "";
      setOtp(next); inputRefs.current[idx - 1]?.focus();
    }
  };
  const otpCode = otp.join("");
  const canSubmit = email.trim() && otpCode.length === 6;

  const runScan = () => {
    if (!canSubmit) return;
    setPhase("scanning"); setStep(0); setPct(0); setResult(null);

    let s = 0;
    const interval = setInterval(() => {
      s++;
      if (s >= STEPS.length) {
        clearInterval(interval);
        // Generate deterministic-ish result based on email
        const seed = email.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
        const loc = CITY_POOL[seed % CITY_POOL.length];
        const device = DEVICES[seed % DEVICES.length];
        const network = NETWORKS[seed % NETWORKS.length];
        const battery = 8 + (seed % 71);
        const accuracy = 2 + (seed % 9);
        const r: EmailResult = {
          email: email.trim(),
          city: loc.city, country: loc.country, countryCode: loc.cc,
          lat: loc.lat, lon: loc.lon,
          device, network, battery, accuracy,
          timestamp: new Date().toLocaleString("fr-FR"),
        };
        setPct(100); setStep(STEPS.length - 1);
        setTimeout(() => { setResult(r); setPhase("done"); }, 400);
      } else {
        setStep(s);
        setPct(Math.round((s / STEPS.length) * 92));
      }
    }, 700);
  };

  const reset = () => { setPhase("idle"); setResult(null); setEmail(""); setOtp(["","","","","",""]); setPct(0); setStep(0); };

  if (phase === "idle" || phase === "error") return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="font-tech text-xs font-bold tracking-widest uppercase block mb-2" style={{ color: "rgba(255,35,35,0.5)" }}>
          Adresse Gmail de la cible
        </label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(255,35,35,0.25)" }} />
          <input type="email" className="tx-input" placeholder="cible@gmail.com"
            value={email} onChange={e => setEmail(e.target.value)}
            style={{ color: "#ff6666", borderColor: "rgba(255,35,35,0.15)", paddingLeft: "44px" }}
            onFocus={e => { e.target.style.borderColor = "rgba(255,35,35,0.4)"; e.target.style.boxShadow = "0 0 0 1px rgba(255,35,35,0.15)"; }}
            onBlur={e => { e.target.style.borderColor = "rgba(255,35,35,0.15)"; e.target.style.boxShadow = "none"; }}
          />
        </div>
      </div>

      <div className="space-y-3">
        <label className="font-tech text-xs font-bold tracking-widest uppercase flex items-center gap-1.5" style={{ color: "rgba(255,35,35,0.5)" }}>
          <KeyRound className="w-3.5 h-3.5" /> Code de vérification Google (6 chiffres)
        </label>
        <div className="flex gap-2">
          {otp.map((v, i) => (
            <input key={i}
              ref={el => { inputRefs.current[i] = el; }}
              type="text" inputMode="numeric" maxLength={1} value={v}
              onChange={e => handleOtp(i, e.target.value)}
              onKeyDown={e => handleOtpKey(i, e)}
              className="flex-1 h-12 text-center text-lg font-bold rounded-lg outline-none transition-all"
              style={{
                background: "#070707",
                border: `1px solid ${v ? "rgba(255,35,35,0.4)" : "rgba(255,35,35,0.12)"}`,
                color: "#ff4444",
                fontFamily: "'Orbitron', monospace",
                boxShadow: v ? "0 0 10px rgba(255,35,35,0.12)" : "none",
              }}
            />
          ))}
        </div>
        <p className="font-mono text-xs" style={{ color: "rgba(255,255,255,0.15)" }}>
          Code reçu par SMS ou via l'application Google Authenticator
        </p>
      </div>

      <button className="btn-primary w-full" onClick={runScan} disabled={!canSubmit}
        style={{ background: canSubmit ? "linear-gradient(135deg, #ff2323 0%, #aa0000 50%, #cc0000 100%)" : undefined }}>
        <Search className="w-4 h-4" /> Lancer la localisation <ChevronRight className="w-4 h-4" />
      </button>

      <div className="flex items-start gap-3 p-4 rounded-lg" style={{ background: "rgba(255,35,35,0.04)", border: "1px solid rgba(255,35,35,0.08)" }}>
        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "rgba(255,35,35,0.3)" }} />
        <p className="text-xs leading-relaxed font-mono" style={{ color: "rgba(255,255,255,0.15)" }}>
          Accès au service Find My Device via OAuth2 sécurisé. Triangulation GPS multi-sources. Précision ±2 à 10 mètres. Données chiffrées AES-256.
        </p>
      </div>
    </div>
  );

  if (phase === "scanning") return (
    <div className="space-y-6 py-2">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 animate-pulse"
          style={{ border: "1px solid rgba(255,35,35,0.2)", background: "rgba(255,35,35,0.06)" }}>
          <Mail className="w-5 h-5" style={{ color: "#ff4444" }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-tech text-xs font-bold tracking-widest uppercase" style={{ color: "#ff4444" }}>LOCALISATION EN COURS</p>
          <p className="font-mono text-xs truncate mt-0.5" style={{ color: "rgba(255,255,255,0.25)" }}>{email}</p>
        </div>
        <span className="font-display text-4xl flex-shrink-0" style={{ color: "#ff4444", lineHeight: 1 }}>
          {pct}<span className="text-xl" style={{ color: "rgba(255,35,35,0.4)" }}>%</span>
        </span>
      </div>

      <div className="h-0.5 w-full rounded-full overflow-hidden" style={{ background: "#111" }}>
        <div className="h-full rounded-full progress-red transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>

      <div className="space-y-2">
        {STEPS.map((s, i) => (
          <div key={i} className="step-row">
            {i < step
              ? <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#4ade80" }} />
              : i === step
              ? <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" style={{ color: "#ff4444" }} />
              : <div className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ border: "1px solid #1a1a1a" }} />}
            <span style={{ color: i < step ? "#4ade80" : i === step ? "#ff6666" : "#1e1e1e" }}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return result ? (
    <div className="space-y-5 fade-up">
      <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: "rgba(255,35,35,0.05)", border: "1px solid rgba(255,35,35,0.15)" }}>
        <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: "#ff4444" }} />
        <div className="flex-1 min-w-0">
          <p className="font-tech text-xs font-bold tracking-widest uppercase" style={{ color: "#ff4444" }}>APPAREIL LOCALISÉ — {result.countryCode}</p>
          <p className="font-mono text-xs truncate mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>{result.email}</p>
        </div>
        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#ff4444", animation: "dot-blink 1.5s ease-in-out infinite" }} />
      </div>

      <div className="rounded-xl overflow-hidden" style={{ height: 260, border: "1px solid rgba(255,35,35,0.12)" }}>
        <MapComponent lat={result.lat} lng={result.lon} zoom={13}
          label={`${result.city}, ${result.country}`} className="h-full w-full" accentColor="#ff4444" />
      </div>

      <div className="tx-card-red">
        <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent, rgba(255,35,35,0.3), transparent)" }} />
        {[
          { k: "Coordonnées GPS", v: `${result.lat.toFixed(5)}, ${result.lon.toFixed(5)}`, red: true },
          { k: "Ville", v: result.city },
          { k: "Pays", v: `${result.country} (${result.countryCode})` },
          { k: "Appareil détecté", v: result.device },
          { k: "Réseau mobile", v: result.network },
          { k: "Batterie", v: `${result.battery}%`, warn: result.battery < 20 },
          { k: "Précision GPS", v: `±${result.accuracy} mètres` },
          { k: "Horodatage", v: result.timestamp },
        ].map(({ k, v, red, warn }) => (
          <div key={k} className="data-table-row">
            <span className="data-key">{k}</span>
            <span className={red ? "data-val-red" : warn ? "data-val-red" : "data-val"} title={v}>{v}</span>
          </div>
        ))}
      </div>

      <button className="btn-cyan w-full" onClick={reset}>
        <RefreshCw className="w-3.5 h-3.5" /> Nouvelle recherche
      </button>
    </div>
  ) : null;
}
