import { Shield, Map, Clock, Lock, CheckCircle2, HeadphonesIcon } from "lucide-react";
import { EmailTracker } from "@/components/email-tracker";
import { IpTracker } from "@/components/ip-tracker";
import { AiAssistant } from "@/components/ai-assistant";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SiWhatsapp, SiTelegram } from "react-icons/si";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
      <div className="fixed inset-0 data-bg opacity-5 pointer-events-none z-0" />
      
      {/* Header / Hero */}
      <header className="relative z-10 border-b border-primary/20 bg-background/80 backdrop-blur-md pt-16 pb-12 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary" />
        <div className="container mx-auto px-4 text-center space-y-6">
          <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full border border-primary/30 mb-4 animate-in fade-in zoom-in duration-1000">
            <div className="w-2 h-2 rounded-full bg-secondary pulse-pin mr-2" />
            <span className="font-mono text-xs text-secondary font-bold tracking-widest">SYSTÈME ACTIF</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold font-mono tracking-tighter text-white drop-shadow-[0_0_15px_rgba(0,212,255,0.5)]">
            TRACK<span className="text-primary">_</span>X
          </h1>
          <h2 className="text-xl md:text-2xl font-mono text-primary tracking-[0.3em] font-light">
            SECURE
          </h2>
          
          <p className="text-muted-foreground font-mono max-w-2xl mx-auto text-sm md:text-base border-t border-b border-primary/10 py-3 uppercase tracking-widest">
            Localisation en temps réel • Rapide • Précise • Gratuite
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 relative z-10 space-y-24">
        
        {/* Tracking Tools Section */}
        <section id="tools" className="max-w-4xl mx-auto animate-in slide-in-from-bottom-8 duration-700 delay-200">
          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-card/50 border border-primary/20 p-1">
              <TabsTrigger value="email" className="font-mono uppercase data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                TRACKING EMAIL
              </TabsTrigger>
              <TabsTrigger value="ip" className="font-mono uppercase data-[state=active]:bg-secondary/20 data-[state=active]:text-secondary">
                TRACKING IP
              </TabsTrigger>
            </TabsList>
            <div className="relative">
              {/* Decorative corner brackets */}
              <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-primary/50" />
              <div className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-primary/50" />
              <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 border-primary/50" />
              <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-primary/50" />
              
              <TabsContent value="email" className="mt-0 outline-none">
                <EmailTracker />
              </TabsContent>
              <TabsContent value="ip" className="mt-0 outline-none">
                <IpTracker />
              </TabsContent>
            </div>
          </Tabs>
        </section>

        {/* AI Assistant Section */}
        <section className="max-w-4xl mx-auto">
           <AiAssistant />
        </section>

        {/* Features Section */}
        <section className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h3 className="text-2xl md:text-3xl font-mono text-white font-bold uppercase tracking-widest">
              Capacités du Système
            </h3>
            <div className="h-px w-24 bg-primary/50 mx-auto" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Map, title: "Précision GPS", desc: "Triangulation au mètre près via réseaux satellites et relais locaux.", color: "text-primary", border: "border-primary/30" },
              { icon: Clock, title: "Temps Réel", desc: "Rafraîchissement milliseconde des coordonnées de la cible.", color: "text-secondary", border: "border-secondary/30" },
              { icon: Lock, title: "Sécurisé & Crypté", desc: "Chiffrement AES-256 militaire. Anonymat total garanti.", color: "text-primary", border: "border-primary/30" },
              { icon: CheckCircle2, title: "100% Gratuit", desc: "Accès illimité aux modules de traçage de base.", color: "text-secondary", border: "border-secondary/30" },
              { icon: Shield, title: "Multi-Plateforme", desc: "Compatible iOS, Android, Windows, macOS, Linux.", color: "text-primary", border: "border-primary/30" },
              { icon: HeadphonesIcon, title: "Support 24/7", desc: "Assistance IA et équipe tactique disponible en continu.", color: "text-secondary", border: "border-secondary/30" }
            ].map((feature, i) => (
              <div key={i} className={`bg-card/40 border ${feature.border} p-6 rounded-lg backdrop-blur-sm hover:bg-card/60 transition-colors group cursor-default relative overflow-hidden`}>
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <feature.icon className={`w-16 h-16 ${feature.color}`} />
                </div>
                <feature.icon className={`w-8 h-8 ${feature.color} mb-4`} />
                <h4 className="font-mono font-bold text-lg mb-2">{feature.title}</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-primary/20 bg-card/80 mt-24 py-12 relative z-10">
        <div className="container mx-auto px-4 flex flex-col items-center justify-center space-y-6">
          <div className="text-2xl font-mono font-bold tracking-tighter text-white opacity-50">
            TRACK<span className="text-primary">_</span>X
          </div>
          
          <div className="flex items-center gap-6">
            <a href="https://wa.me/+224669288332" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-secondary transition-colors" title="Contact WhatsApp">
              <SiWhatsapp className="w-6 h-6" />
            </a>
            <a href="https://t.me/Varnox_Or_novark" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors" title="Contact Telegram">
              <SiTelegram className="w-6 h-6" />
            </a>
          </div>

          <div className="text-center space-y-2">
            <p className="text-xs text-muted-foreground font-mono">
              ©2026 TRACK_X
            </p>
            <p className="text-[10px] text-primary/60 font-mono tracking-widest uppercase">
              powered by Varnox•Prime
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
