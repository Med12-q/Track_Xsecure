import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { MapComponent } from "./map";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Search, Smartphone, Wifi, Battery, MapPin, RotateCcw, Mail, KeyRound, CheckCircle2 } from "lucide-react";

const SCAN_STEPS = [
  { label: "Connexion OAuth2 aux serveurs Google", pct: 15 },
  { label: "Authentification des identifiants", pct: 28 },
  { label: "Accès au service Find My Device", pct: 42 },
  { label: "Extraction des journaux de position (72h)", pct: 58 },
  { label: "Triangulation GPS + Wi-Fi + Cell", pct: 74 },
  { label: "Résolution des coordonnées exactes", pct: 88 },
  { label: "Chiffrement et livraison du résultat", pct: 100 },
];

const DEVICE_MODELS = [
  "Samsung Galaxy S24 Ultra",
  "iPhone 15 Pro Max",
  "Google Pixel 8 Pro",
  "OnePlus 12",
  "Xiaomi 14 Ultra",
];

const NETWORKS = ["5G NR", "LTE-A", "4G+", "5G SA"];

export function EmailTracker() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [phase, setPhase] = useState<"form" | "scanning" | "result">("form");
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [location, setLocation] = useState<{ lat: number; lng: number; city: string } | null>(null);

  const cities = [
    { lat: 48.8566, lng: 2.3522, city: "Paris, France" },
    { lat: 9.5370, lng: -13.6773, city: "Conakry, Guinée" },
    { lat: 5.3600, lng: -4.0083, city: "Abidjan, Côte d'Ivoire" },
    { lat: 14.6928, lng: -17.4467, city: "Dakar, Sénégal" },
    { lat: 6.3676, lng: 2.4252, city: "Cotonou, Bénin" },
  ];

  const handleScan = () => {
    if (!email || code.length !== 6) return;
    setPhase("scanning");
    setProgress(0);
    setCurrentStep(0);

    let step = 0;
    const run = () => {
      if (step >= SCAN_STEPS.length) {
        const pick = cities[Math.floor(Math.random() * cities.length)];
        setLocation({
          lat: pick.lat + (Math.random() * 0.04 - 0.02),
          lng: pick.lng + (Math.random() * 0.04 - 0.02),
          city: pick.city,
        });
        setPhase("result");
        return;
      }
      setCurrentStep(step);
      setProgress(SCAN_STEPS[step].pct);
      step++;
      setTimeout(run, 800 + Math.random() * 600);
    };
    setTimeout(run, 400);
  };

  const battery = Math.floor(Math.random() * 60) + 5;
  const device = DEVICE_MODELS[Math.floor(email.length % DEVICE_MODELS.length)];
  const network = NETWORKS[Math.floor(code.length % NETWORKS.length)];
  const accuracy = Math.floor(Math.random() * 8) + 2;

  if (phase === "form") {
    return (
      <div className="space-y-6">
        <div className="flex items-start gap-3 pb-5 border-b border-border">
          <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20 mt-0.5">
            <Mail className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Localisation via Compte Google</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Protocole G-Track v5.1 — Accès Find My Device
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider font-mono">
              Adresse Gmail cible
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="exemple@gmail.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="pl-9 font-mono h-11 bg-card border-border focus-visible:ring-primary/50 focus-visible:border-primary/50"
                data-testid="input-email"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider font-mono flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5" />
              Code de vérification Google (6 chiffres)
            </label>
            <InputOTP maxLength={6} value={code} onChange={setCode}>
              <InputOTPGroup className="gap-2 w-full justify-between">
                {[0,1,2,3,4,5].map(i => (
                  <InputOTPSlot
                    key={i}
                    index={i}
                    className="flex-1 h-12 text-lg font-mono bg-card border-border focus-within:border-primary/60 rounded-lg"
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
            <p className="text-xs text-muted-foreground font-mono">
              Entrez le code reçu par SMS ou via l'application Google Authenticator
            </p>
          </div>

          <Button
            className="w-full h-11 font-medium gap-2"
            onClick={handleScan}
            disabled={!email || code.length !== 6}
            data-testid="button-locate-email"
          >
            <Search className="w-4 h-4" />
            Lancer la localisation
          </Button>
        </div>
      </div>
    );
  }

  if (phase === "scanning") {
    return (
      <div className="space-y-6 py-2">
        <div className="flex items-start gap-3 pb-5 border-b border-border">
          <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20">
            <Mail className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Localisation en cours</h2>
            <p className="text-sm text-muted-foreground font-mono">{email}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground font-mono">Progression</span>
            <span className="font-mono font-medium text-primary">{progress}%</span>
          </div>
          <Progress value={progress} className="h-1.5 bg-muted" />
        </div>

        <div className="space-y-2.5">
          {SCAN_STEPS.map((step, i) => (
            <div key={i} className="flex items-center gap-2.5 text-sm font-mono">
              {i < currentStep ? (
                <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0" />
              ) : i === currentStep ? (
                <div className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-primary pulse-dot" />
                </div>
              ) : (
                <div className="w-4 h-4 rounded-full border border-border/50 flex-shrink-0" />
              )}
              <span className={i <= currentStep ? "text-foreground" : "text-muted-foreground/40"}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    location && (
      <div className="space-y-5 fade-up">
        <div className="flex items-center gap-3 pb-5 border-b border-border">
          <div className="p-2.5 rounded-lg bg-secondary/10 border border-secondary/20">
            <MapPin className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-secondary">Appareil localisé</h2>
            <p className="text-sm text-muted-foreground font-mono">{location.city}</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary/10 border border-secondary/20">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary pulse-dot" />
            <span className="text-xs font-mono text-secondary font-medium">LIVE</span>
          </div>
        </div>

        <div className="rounded-xl overflow-hidden border border-border" style={{ height: 320 }}>
          <MapComponent latitude={location.lat} longitude={location.lng} zoom={14} label={location.city} className="h-full w-full" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: MapPin, label: "Coordonnées GPS", value: `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`, accent: "text-primary" },
            { icon: MapPin, label: "Ville", value: location.city, accent: "text-primary" },
            { icon: Smartphone, label: "Appareil", value: device, accent: "text-foreground" },
            { icon: Wifi, label: "Réseau", value: network, accent: "text-foreground" },
            { icon: Battery, label: "Batterie", value: `${battery}%`, accent: battery < 20 ? "text-destructive" : "text-secondary" },
            { icon: CheckCircle2, label: "Précision GPS", value: `±${accuracy} mètres`, accent: "text-secondary" },
          ].map(({ icon: Icon, label, value, accent }) => (
            <div key={label} className="px-3 py-2.5 rounded-lg bg-muted/30 border border-border/60">
              <div className="flex items-center gap-1.5 mb-1">
                <Icon className="w-3 h-3 text-muted-foreground" />
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{label}</span>
              </div>
              <p className={`text-sm font-medium ${accent} font-mono truncate`}>{value}</p>
            </div>
          ))}
        </div>

        <Button variant="outline" className="w-full gap-2" onClick={() => { setPhase("form"); setCode(""); }}>
          <RotateCcw className="w-4 h-4" />
          Nouvelle recherche
        </Button>
      </div>
    )
  );
}
