import { useState, useRef } from "react";
import { MapComponent } from "./map";
import { Search, Smartphone, Wifi, Battery, MapPin, RotateCcw, Mail, KeyRound, CheckCircle2, Loader2 } from "lucide-react";

const STEPS = [
  "Initialisation protocole OAuth2 Google...",
  "Handshake avec les serveurs d'authentification...",
  "Vérification des identifiants du compte cible...",
  "Accès aux journaux Find My Device (72h)...",
  "Triangulation GPS multi-satellites...",
  "Fusion des données Wi-Fi + Cell Tower...",
  "Déchiffrement et livraison des coordonnées...",
];

const CITIES = [
  { lat: 48.8566, lng: 2.3522, city: "Paris, France" },
  { lat: 9.537, lng: -13.677, city: "Conakry, Guinée" },
  { lat: 5.36, lng: -4.008, city: "Abidjan, Côte d'Ivoire" },
  { lat: 14.693, lng: -17.447, city: "Dakar, Sénégal" },
  { lat: 12.364, lng: -1.534, city: "Ouagadougou, Burkina" },
  { lat: 33.589, lng: -7.632, city: "Casablanca, Maroc" },
];
const DEVICES = ["Samsung Galaxy S24 Ultra", "iPhone 15 Pro Max", "Google Pixel 8 Pro", "OnePlus 12", "Xiaomi 14 Ultra"];

export function EmailTracker() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [phase, setPhase] = useState<"form" | "scanning" | "result">("form");
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [loc, setLoc] = useState<{ lat: number; lng: number; city: string } | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleOTP = (idx: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const arr = code.split("").concat(Array(6).fill("")).slice(0, 6);
    arr[idx] = val.slice(-1);
    const next = arr.join("");
    setCode(next);
    if (val && idx < 5) inputRefs.current[idx + 1]?.focus();
  };
  const handleOTPKey = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[idx] && idx > 0) inputRefs.current[idx - 1]?.focus();
  };

  const scan = () => {
    if (!email || code.length < 6) return;
    setPhase("scanning"); setStep(0); setProgress(0);
    let s = 0;
    const run = () => {
      if (s >= STEPS.length) {
        const p = CITIES[Math.floor(Math.random() * CITIES.length)];
        setLoc({ lat: p.lat + (Math.random() * 0.03 - 0.015), lng: p.lng + (Math.random() * 0.03 - 0.015), city: p.city });
        setProgress(100); setPhase("result"); return;
      }
      setStep(s); setProgress(Math.round((s / STEPS.length) * 95)); s++;
      setTimeout(run, 700 + Math.random() * 500);
    };
    setTimeout(run, 300);
  };

  const battery = 5 + (email.length * 7 % 75);
  const device = DEVICES[email.length % DEVICES.length];

  if (phase === "form") return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ border: "1px solid hsl(0 90% 55% / 0.35)", background: "hsl(0 90% 55% / 0.06)" }}>
          <Mail className="w-5 h-5" style={{ color: "#ff4444" }} />
        </div>
        <div>
          <p className="section-number mb-1">Module 02 — Localisation Google</p>
          <h3 className="font-tech text-white text-sm font-bold tracking-wider uppercase">
            Tracking via Compte Gmail
          </h3>
          <p className="text-xs mt-1" style={{ color: "#555", fontFamily: "'JetBrains Mono'" }}>
            OAuth2 · Find My Device · GPS · Wi-Fi · Cell Tower
          </p>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="section-number block" style={{ color: "hsl(0 90% 55% / 0.5)" }}>
          Adresse Gmail de la cible
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#ff444433" }} />
          <input type="email" className="neon-input-red pl-9" placeholder="cible@gmail.com"
            value={email} onChange={e => setEmail(e.target.value)} />
        </div>
      </div>

      <div className="space-y-2">
        <label className="section-number flex items-center gap-1.5" style={{ color: "hsl(0 90% 55% / 0.5)" }}>
          <KeyRound className="w-3 h-3" /> Code de vérification Google (6 chiffres)
        </label>
        <div className="flex gap-2">
          {Array(6).fill(0).map((_, i) => (
            <input key={i}
              ref={el => { inputRefs.current[i] = el; }}
              maxLength={1} inputMode="numeric"
              value={code[i] || ""}
              onChange={e => handleOTP(i, e.target.value)}
              onKeyDown={e => handleOTPKey(i, e)}
              className="flex-1 h-12 text-center rounded-lg text-lg font-display transition-all outline-none"
              style={{
                background: "#060606",
                border: `1px solid ${code[i] ? "hsl(0 90% 55% / 0.5)" : "hsl(0 90% 55% / 0.15)"}`,
                color: "#ff4444",
                fontFamily: "'Orbitron', monospace",
                boxShadow: code[i] ? "0 0 10px hsl(0 90% 55% / 0.15)" : "none",
              }}
            />
          ))}
        </div>
        <p className="text-xs font-mono" style={{ color: "#333" }}>
          Code reçu par SMS ou via Google Authenticator
        </p>
      </div>

      <button className="btn-red w-full justify-center" onClick={scan} disabled={!email || code.length < 6}>
        <Search className="w-4 h-4" /> LANCER LA LOCALISATION
      </button>
    </div>
  );

  if (phase === "scanning") return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center animate-pulse"
          style={{ border: "1px solid #ff444333", background: "#ff44430a" }}>
          <Mail className="w-5 h-5" style={{ color: "#ff4444" }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-tech text-xs font-bold tracking-widest uppercase" style={{ color: "#ff4444" }}>LOCALISATION EN COURS</p>
          <p className="text-xs font-mono truncate mt-0.5" style={{ color: "#555" }}>{email}</p>
        </div>
        <span className="font-display text-3xl flex-shrink-0" style={{ color: "#ff4444" }}>{progress}<span className="text-base" style={{ color: "#ff444466" }}>%</span></span>
      </div>

      <div className="h-0.5 w-full rounded-full overflow-hidden" style={{ background: "#111" }}>
        <div className="h-full rounded-full progress-bar-red transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      <div className="space-y-1.5">
        {STEPS.map((s, i) => (
          <div key={i} className="step-item">
            {i < step ? <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#4ade80" }} />
              : i === step ? <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" style={{ color: "#ff4444" }} />
              : <div className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ border: "1px solid #1a1a1a" }} />}
            <span style={{ color: i < step ? "#4ade80" : i === step ? "#ff6666" : "#1f1f1f" }}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return loc ? (
    <div className="space-y-5 fade-up">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ border: "1px solid #ff444333", background: "#ff44430a" }}>
          <MapPin className="w-5 h-5" style={{ color: "#ff4444" }} />
        </div>
        <div>
          <p className="font-tech text-sm font-bold tracking-wider uppercase" style={{ color: "#ff4444" }}>APPAREIL LOCALISÉ</p>
          <p className="text-xs font-mono mt-0.5" style={{ color: "#555" }}>{loc.city}</p>
        </div>
        <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded"
          style={{ border: "1px solid #ff444425", background: "#ff44430a" }}>
          <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: "#ff4444" }} />
          <span className="font-tech text-xs font-bold" style={{ color: "#ff4444" }}>LIVE GPS</span>
        </div>
      </div>

      <div className="rounded-lg overflow-hidden" style={{ height: 280, border: "1px solid #ff444420" }}>
        <MapComponent latitude={loc.lat} longitude={loc.lng} zoom={14} label={loc.city} className="h-full w-full" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-0.5 rounded-lg overflow-hidden" style={{ border: "1px solid #111" }}>
        {[
          { label: "Coordonnées GPS", value: `${loc.lat.toFixed(5)}, ${loc.lng.toFixed(5)}`, red: true },
          { label: "Ville", value: loc.city },
          { label: "Appareil", value: device },
          { label: "Réseau", value: "5G NR / LTE-A" },
          { label: "Batterie", value: `${battery}%`, danger: battery < 20 },
          { label: "Précision GPS", value: `±${2 + (email.length % 6)} mètres` },
        ].map(({ label, value, red, danger }) => (
          <div key={label} className="data-row px-4" style={{ background: "#060606" }}>
            <span className="data-label">{label}</span>
            <span className={red ? "data-value-red" : danger ? "data-value-red" : "data-value"}
              style={{ maxWidth: "55%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</span>
          </div>
        ))}
      </div>

      <button className="btn-red w-full justify-center" onClick={() => { setPhase("form"); setCode(""); }}>
        <RotateCcw className="w-3.5 h-3.5" /> NOUVELLE RECHERCHE
      </button>
    </div>
  ) : null;
}
