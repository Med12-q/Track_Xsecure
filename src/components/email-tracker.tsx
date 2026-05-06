import { useState } from "react";
import { MapComponent } from "./map";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Search, Smartphone, Wifi, Battery, MapPin, RotateCcw, Mail, KeyRound, CheckCircle2, Loader2 } from "lucide-react";

const SCAN_STEPS = [
  "Connexion OAuth2 aux serveurs Google...",
  "Validation des identifiants de compte...",
  "Accès au service Find My Device...",
  "Extraction des journaux de position (72h)...",
  "Triangulation GPS + Wi-Fi + Cellulaire...",
  "Résolution des coordonnées exactes...",
  "Chiffrement et livraison du résultat...",
];

const CITIES = [
  { lat: 48.8566, lng: 2.3522, city: "Paris, France" },
  { lat: 9.5370, lng: -13.6773, city: "Conakry, Guinée" },
  { lat: 5.3600, lng: -4.0083, city: "Abidjan, Côte d'Ivoire" },
  { lat: 14.6928, lng: -17.4467, city: "Dakar, Sénégal" },
  { lat: 12.3645, lng: -1.5338, city: "Ouagadougou, Burkina" },
];

const DEVICES = ["Samsung Galaxy S24 Ultra", "iPhone 15 Pro Max", "Google Pixel 8 Pro", "OnePlus 12", "Xiaomi 14 Ultra"];

export function EmailTracker() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [phase, setPhase] = useState<"form" | "scanning" | "result">("form");
  const [stepIdx, setStepIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [location, setLocation] = useState<{ lat: number; lng: number; city: string } | null>(null);

  const handleScan = () => {
    if (!email || code.length !== 6) return;
    setPhase("scanning");
    setStepIdx(0);
    setProgress(0);

    let s = 0;
    const run = () => {
      if (s >= SCAN_STEPS.length) {
        const pick = CITIES[Math.floor(Math.random() * CITIES.length)];
        setLocation({ lat: pick.lat + (Math.random() * 0.04 - 0.02), lng: pick.lng + (Math.random() * 0.04 - 0.02), city: pick.city });
        setProgress(100);
        setPhase("result");
        return;
      }
      setStepIdx(s);
      setProgress(Math.round((s / SCAN_STEPS.length) * 95));
      s++;
      setTimeout(run, 700 + Math.random() * 600);
    };
    setTimeout(run, 300);
  };

  const battery = Math.floor(Math.random() * 60) + 5;
  const device = DEVICES[email.length % DEVICES.length];

  if (phase === "form") return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 pb-4 border-b border-cyan-500/15">
        <div className="w-9 h-9 rounded-lg border border-red-500/30 bg-red-500/5 flex items-center justify-center">
          <Mail className="w-4 h-4 text-red-400" />
        </div>
        <div>
          <h2 className="font-display font-bold text-base tracking-wider text-white">TRACKING GOOGLE</h2>
          <p className="text-xs font-mono text-gray-600">Protocole G-Track v5.1 — Find My Device</p>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-mono text-red-500/60 uppercase tracking-widest flex items-center gap-1">
          <Mail className="w-3 h-3" /> Adresse Gmail cible
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500/40" />
          <input
            type="email"
            placeholder="exemple@gmail.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-lg text-sm border border-red-500/20 bg-black/60 text-red-300 font-mono placeholder:text-red-900/60 focus:outline-none focus:border-red-500/50 focus:shadow-[0_0_12px_hsl(0_85%_55%/0.15)] transition-all"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-mono text-red-500/60 uppercase tracking-widest flex items-center gap-1">
          <KeyRound className="w-3 h-3" /> Code de vérification Google (6 chiffres)
        </label>
        <InputOTP maxLength={6} value={code} onChange={setCode}>
          <InputOTPGroup className="gap-1.5 w-full justify-between">
            {[0,1,2,3,4,5].map(i => (
              <InputOTPSlot key={i} index={i}
                className="flex-1 h-11 text-lg font-mono bg-black/60 border-red-500/20 text-red-300 rounded-lg focus-within:border-red-500/60 focus-within:shadow-[0_0_8px_hsl(0_85%_55%/0.2)]" />
            ))}
          </InputOTPGroup>
        </InputOTP>
        <p className="text-[10px] font-mono text-gray-700">Entrez le code reçu par SMS ou via Google Authenticator</p>
      </div>

      <button
        onClick={handleScan}
        disabled={!email || code.length !== 6}
        className="w-full py-3 rounded-lg border border-red-500/40 bg-red-500/10 text-red-400 font-display font-bold tracking-widest uppercase hover:bg-red-500/20 hover:shadow-[0_0_20px_hsl(0_85%_55%/0.25)] disabled:opacity-25 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
      >
        <Search className="w-4 h-4" />
        LANCER LA LOCALISATION
      </button>
    </div>
  );

  if (phase === "scanning") return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 pb-4 border-b border-red-500/15">
        <div className="w-9 h-9 rounded-lg border border-red-500/30 bg-red-500/5 flex items-center justify-center">
          <Mail className="w-4 h-4 text-red-400 animate-pulse" />
        </div>
        <div>
          <h2 className="font-display font-bold text-base tracking-wider text-white">LOCALISATION EN COURS</h2>
          <p className="text-xs font-mono text-red-400/60 truncate max-w-[180px]">{email}</p>
        </div>
        <div className="ml-auto text-lg font-display font-bold text-red-400">{progress}%</div>
      </div>

      <div className="h-0.5 w-full bg-white/5 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-500"
          style={{ width: `${progress}%`, boxShadow: "0 0 12px hsl(0 85% 55% / 0.6)" }} />
      </div>

      <div className="space-y-2.5">
        {SCAN_STEPS.map((step, i) => (
          <div key={i} className="flex items-center gap-2.5 text-xs font-mono">
            {i < stepIdx ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
            ) : i === stepIdx ? (
              <Loader2 className="w-3.5 h-3.5 text-red-400 animate-spin flex-shrink-0" />
            ) : (
              <div className="w-3.5 h-3.5 rounded-full border border-white/10 flex-shrink-0" />
            )}
            <span className={i <= stepIdx ? "text-gray-300" : "text-gray-700"}>{step}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return location ? (
    <div className="space-y-4 fade-up">
      <div className="flex items-center gap-3 pb-4 border-b border-red-500/15">
        <div className="w-9 h-9 rounded-lg border border-red-500/30 bg-red-500/5 flex items-center justify-center">
          <MapPin className="w-4 h-4 text-red-400" />
        </div>
        <div>
          <h2 className="font-display font-bold text-base tracking-wider text-red-400">APPAREIL LOCALISÉ</h2>
          <p className="text-xs font-mono text-gray-600">{location.city}</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 pulse-dot" />
          <span className="text-[10px] font-mono text-red-400 font-bold">LIVE</span>
        </div>
      </div>

      <div className="rounded-lg overflow-hidden border border-red-500/20" style={{ height: 260 }}>
        <MapComponent latitude={location.lat} longitude={location.lng} zoom={14} label={location.city} className="h-full w-full" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        {[
          { icon: MapPin, label: "Coordonnées", value: `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`, highlight: true },
          { icon: MapPin, label: "Ville", value: location.city },
          { icon: Smartphone, label: "Appareil", value: device },
          { icon: Wifi, label: "Réseau", value: "5G NR" },
          { icon: Battery, label: "Batterie", value: `${battery}%`, danger: battery < 20 },
          { icon: CheckCircle2, label: "Précision", value: `±${Math.floor(Math.random() * 6) + 2}m` },
        ].map(({ icon: Icon, label, value, highlight, danger }) => (
          <div key={label} className="px-3 py-2.5 rounded-lg bg-black/40 border border-white/6">
            <p className="text-[9px] font-mono text-gray-700 uppercase tracking-widest mb-1">{label}</p>
            <p className={`text-sm font-mono font-medium truncate ${highlight ? "text-red-400" : danger ? "text-red-500" : "text-gray-300"}`} title={value}>
              {value}
            </p>
          </div>
        ))}
      </div>

      <button onClick={() => { setPhase("form"); setCode(""); }}
        className="w-full py-2.5 rounded-lg border border-white/10 bg-white/3 text-gray-500 text-xs font-display font-bold tracking-wider uppercase hover:border-red-500/30 hover:text-red-400 transition-all flex items-center justify-center gap-2">
        <RotateCcw className="w-3.5 h-3.5" />
        NOUVELLE RECHERCHE
      </button>
    </div>
  ) : null;
}
