import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { MapComponent } from "./map";
import { Search, Globe, Server, Activity, Terminal } from "lucide-react";
import { toast } from "sonner";

export function IpTracker() {
  const [ip, setIp] = useState("");
  const [status, setStatus] = useState<"idle" | "scanning" | "found">("idle");
  const [progress, setProgress] = useState(0);
  const [data, setData] = useState<any>(null);

  const fetchIpData = async (targetIp: string) => {
    try {
      const response = await fetch(`https://ipapi.co/${targetIp}/json/`);
      const result = await response.json();
      if (result.error) {
        throw new Error(result.reason || "IP non trouvée");
      }
      return result;
    } catch (err) {
      throw err;
    }
  };

  const handleLocate = async () => {
    if (!ip) return;
    
    setStatus("scanning");
    setProgress(0);
    setData(null);

    // Fake scanning delay for dramatic effect
    const interval = setInterval(() => {
      setProgress(p => Math.min(p + 15, 90));
    }, 200);

    try {
      const result = await fetchIpData(ip);
      clearInterval(interval);
      setProgress(100);
      
      setTimeout(() => {
        setData(result);
        setStatus("found");
      }, 500);

    } catch (error: any) {
      clearInterval(interval);
      setStatus("idle");
      toast.error(`Erreur: ${error.message}`);
    }
  };

  return (
    <Card className="border-secondary/20 bg-card/50 backdrop-blur-sm relative overflow-hidden">
      <div className="absolute inset-0 data-bg opacity-10 pointer-events-none" />
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Terminal className="w-6 h-6 text-secondary" />
          Localisation via Adresse IP
        </CardTitle>
        <CardDescription className="text-muted-foreground font-mono">
          ANALYSE DES NOEUDS RÉSEAU • ROUTAGE GLOBAL
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 relative z-10">
        
        {status === "idle" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ip" className="font-mono text-secondary uppercase text-xs">CIBLE IP (IPv4 / IPv6)</Label>
              <div className="flex gap-2">
                <Input 
                  id="ip" 
                  placeholder="Ex: 8.8.8.8" 
                  value={ip}
                  onChange={(e) => setIp(e.target.value)}
                  className="font-mono bg-background/50 border-secondary/30 focus-visible:ring-secondary flex-1"
                />
                <Button 
                  variant="secondary"
                  className="font-mono font-bold" 
                  onClick={handleLocate}
                  disabled={!ip}
                >
                  <Search className="w-4 h-4 mr-2" />
                  TRACER
                </Button>
              </div>
            </div>
            <div className="text-xs text-muted-foreground font-mono bg-background/30 p-3 rounded border border-border">
              INFO: Le traçage IP permet de localiser le dernier routeur FAI connu de la cible. Précision variable selon l'opérateur et l'utilisation de VPN/Proxy.
            </div>
          </div>
        )}

        {status === "scanning" && (
          <div className="space-y-6 py-8 text-center font-mono">
            <div className="flex justify-center mb-4">
              <Server className="w-12 h-12 text-secondary animate-pulse" />
            </div>
            <div className="space-y-2 text-left">
              <div className="flex justify-between text-xs text-secondary">
                <span>ANALYSE DES PAQUETS RÉSEAU</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-1 bg-secondary/20 [&>div]:bg-secondary" />
              <p className="text-xs text-muted-foreground animate-pulse">Décodage des sauts de routage...</p>
            </div>
          </div>
        )}

        {status === "found" && data && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-sm">
              <div className="space-y-3 bg-background/50 p-4 rounded border border-secondary/30">
                <h4 className="text-secondary font-bold border-b border-secondary/20 pb-2 mb-3 flex items-center gap-2">
                  <Globe className="w-4 h-4" /> DONNÉES GÉOGRAPHIQUES
                </h4>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">VILLE</span>
                  <span className="text-foreground">{data.city || 'Inconnue'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">RÉGION</span>
                  <span className="text-foreground">{data.region || 'Inconnue'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">PAYS</span>
                  <span className="text-foreground">{data.country_name || 'Inconnu'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">FUSEAU</span>
                  <span className="text-foreground">{data.timezone || 'Inconnu'}</span>
                </div>
              </div>
              
              <div className="space-y-3 bg-background/50 p-4 rounded border border-secondary/30">
                <h4 className="text-secondary font-bold border-b border-secondary/20 pb-2 mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4" /> DONNÉES RÉSEAU
                </h4>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">IP CIBLE</span>
                  <span className="text-secondary font-bold">{data.ip}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">FAI</span>
                  <span className="text-foreground text-right w-2/3 truncate" title={data.org}>{data.org || 'Inconnu'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">LATITUDE</span>
                  <span className="text-foreground">{data.latitude}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">LONGITUDE</span>
                  <span className="text-foreground">{data.longitude}</span>
                </div>
              </div>
            </div>

            {data.latitude && data.longitude && (
              <div className="rounded-lg overflow-hidden border-2 border-secondary/30 relative">
                 <div className="absolute top-2 left-2 z-10 bg-background/80 backdrop-blur px-2 py-1 rounded text-xs font-mono text-secondary border border-secondary/50 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-secondary pulse-pin"></span>
                  NODE LOCALISÉ
                </div>
                <MapComponent latitude={data.latitude} longitude={data.longitude} zoom={12} />
              </div>
            )}

            <Button variant="outline" className="w-full font-mono border-secondary/50 text-secondary hover:bg-secondary/10" onClick={() => setStatus("idle")}>
              NOUVELLE RECHERCHE IP
            </Button>
          </div>
        )}

      </CardContent>
    </Card>
  );
}
