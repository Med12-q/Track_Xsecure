import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { MapComponent } from "./map";
import { Search, ShieldAlert, Smartphone, Wifi, Battery, MapPin } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const steps = [
  "Connexion aux serveurs Google sécurisés...",
  "Authentification de l'appareil cible...",
  "Extraction des journaux de localisation (24h)...",
  "Triangulation GPS et Wi-Fi...",
  "Contournement des proxys de sécurité...",
  "Localisation exacte trouvée avec succès."
];

export function EmailTracker() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "scanning" | "found">("idle");
  const [progress, setProgress] = useState(0);
  const [stepText, setStepText] = useState("");
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);

  const handleLocate = () => {
    if (!email || code.length !== 6) return;
    
    setStatus("scanning");
    setProgress(0);
    
    let currentStep = 0;
    setStepText(steps[0]);

    const interval = setInterval(() => {
      setProgress(p => {
        const next = p + (100 / (steps.length * 10)); // smooth progress
        
        // Update text based on progress thresholds
        const expectedStep = Math.floor((next / 100) * steps.length);
        if (expectedStep > currentStep && expectedStep < steps.length) {
          currentStep = expectedStep;
          setStepText(steps[currentStep]);
        }

        if (next >= 100) {
          clearInterval(interval);
          setStatus("found");
          // Fake realistic coordinates (e.g. Paris)
          setLocation({ lat: 48.8566 + (Math.random() * 0.05), lng: 2.3522 + (Math.random() * 0.05) });
          return 100;
        }
        return next;
      });
    }, 50);
  };

  return (
    <Card className="border-primary/20 bg-card/50 backdrop-blur-sm relative overflow-hidden">
      <div className="absolute inset-0 data-bg opacity-20 pointer-events-none" />
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Smartphone className="w-6 h-6 text-primary" />
          Localisation via Compte Google
        </CardTitle>
        <CardDescription className="text-muted-foreground font-mono">
          SYSTÈME D'INTERCEPTION DE SIGNAUX • PROTOCOLE G-TRACK v4.2
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 relative z-10">
        
        {status === "idle" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-mono text-primary uppercase text-xs">CIBLE EMAIL (GMAIL)</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="cible@gmail.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="font-mono bg-background/50 border-primary/30 focus-visible:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-mono text-primary uppercase text-xs">CODE D'AUTORISATION SYSTÈME</Label>
              <InputOTP maxLength={6} value={code} onChange={setCode}>
                <InputOTPGroup className="gap-2 w-full justify-between">
                  {[0,1,2,3,4,5].map(i => (
                    <InputOTPSlot key={i} index={i} className="border-primary/30 font-mono bg-background/50 h-12 w-12 text-lg" />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
            <Button 
              className="w-full font-mono font-bold tracking-widest mt-4 group" 
              size="lg"
              onClick={handleLocate}
              disabled={!email || code.length !== 6}
            >
              <Search className="w-4 h-4 mr-2 group-hover:text-white" />
              LANCER LA LOCALISATION
            </Button>
          </div>
        )}

        {status === "scanning" && (
          <div className="space-y-6 py-8 text-center font-mono">
            <div className="relative w-32 h-32 mx-auto mb-8">
              <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
              <div className="absolute inset-0 rounded-full border-t-2 border-primary radar-sweep" />
              <Search className="w-10 h-10 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pulse-pin" />
            </div>
            
            <div className="space-y-2 text-left">
              <div className="flex justify-between text-xs text-primary">
                <span>PROGRESSION</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-1 bg-primary/20" />
              <p className="text-xs text-muted-foreground h-4">{stepText}</p>
            </div>
          </div>
        )}

        {status === "found" && location && (
          <div className="space-y-6 animate-in fade-in zoom-in duration-500">
            <div className="flex items-center gap-2 text-secondary bg-secondary/10 p-3 rounded border border-secondary/20 font-mono text-sm">
              <ShieldAlert className="w-5 h-5" />
              SIGNAL CAPTÉ ET DÉCRYPTÉ AVEC SUCCÈS
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-sm">
              <div className="space-y-3 bg-background/50 p-4 rounded border border-border">
                <h4 className="text-primary font-bold border-b border-primary/20 pb-2 mb-3 flex items-center gap-2">
                  <Smartphone className="w-4 h-4" /> DONNÉES APPAREIL
                </h4>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">LATITUDE</span>
                  <span className="text-foreground">{location.lat.toFixed(6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">LONGITUDE</span>
                  <span className="text-foreground">{location.lng.toFixed(6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">PRÉCISION</span>
                  <span className="text-secondary">± 4 Mètres</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">MODÈLE</span>
                  <span className="text-foreground">iPhone 14 Pro Max</span>
                </div>
              </div>
              
              <div className="space-y-3 bg-background/50 p-4 rounded border border-border">
                <h4 className="text-primary font-bold border-b border-primary/20 pb-2 mb-3 flex items-center gap-2">
                  <Wifi className="w-4 h-4" /> RÉSEAU & STATUT
                </h4>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">CONNEXION</span>
                  <span className="text-foreground">5G / LTE</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">IP DYNAMIQUE</span>
                  <span className="text-foreground">109.12.34.XX</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">BATTERIE</span>
                  <span className="text-destructive flex items-center gap-1"><Battery className="w-3 h-3"/> 14%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">DERNIÈRE SYNC</span>
                  <span className="text-foreground">À l'instant</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg overflow-hidden border-2 border-primary/30 relative">
              <div className="absolute top-2 left-2 z-10 bg-background/80 backdrop-blur px-2 py-1 rounded text-xs font-mono text-primary border border-primary/50 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-destructive pulse-pin"></span>
                LIVE TRACKING
              </div>
              <MapComponent latitude={location.lat} longitude={location.lng} zoom={15} />
            </div>

            <Button variant="outline" className="w-full font-mono" onClick={() => setStatus("idle")}>
              NOUVELLE RECHERCHE
            </Button>
          </div>
        )}

      </CardContent>
    </Card>
  );
}
