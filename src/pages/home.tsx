import { useState } from "react";
import { EmailTracker } from "@/components/email-tracker";
import { IpTracker } from "@/components/ip-tracker";
import { AiAssistant } from "@/components/ai-assistant";
import { WhatsappChecker } from "@/components/whatsapp-checker";
import { SiWhatsapp, SiTelegram } from "react-icons/si";
import { Mail, Globe, MessageSquare, Shield, Cpu, Lock, Zap, Eye, ChevronRight } from "lucide-react";

type Tab = "email" | "ip" | "whatsapp" | "ai";

const TABS: { id: Tab; label: string; icon: typeof Mail; desc: string; accent: string }[] = [
  { id: "email", label: "Email Google", icon: Mail, desc: "Find My Device", accent: "text-primary" },
  { id: "ip", label: "Adresse IP", icon: Globe, desc: "Géolocalisation réseau", accent: "text-secondary" },
  { id: "whatsapp", label: "WhatsApp", icon: Shield, desc: "Vérif. numéro", accent: "text-[#25d366]" },
  { id: "ai", label: "Assistant IA", icon: MessageSquare, desc: "VARNOX Chat", accent: "text-primary" },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("email");

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* Top Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative w-7 h-7">
              <div className="absolute inset-0 rounded-lg bg-primary/20 border border-primary/30" />
              <Cpu className="absolute inset-1.5 w-4 h-4 text-primary" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-bold text-base tracking-tight text-foreground">TRACK<span className="text-primary">_X</span></span>
              <span className="text-[10px] font-mono text-muted-foreground border border-border/60 px-1.5 py-0.5 rounded">SECURE</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 pulse-dot" />
            <span className="text-xs font-mono text-green-400/80">SYSTÈME ACTIF</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-28 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-xs font-mono text-primary/80 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary pulse-dot" />
            Géolocalisation Avancée v5.1
            <ChevronRight className="w-3 h-3" />
          </div>

          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground">
            Localisez n'importe quel{" "}
            <span className="text-primary relative">
              appareil
              <span className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
            </span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Plateforme professionnelle de géolocalisation par compte Google, adresse IP, et vérification WhatsApp. Précision GPS en temps réel. 100% gratuit.
          </p>

          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            {[
              { icon: Lock, label: "Chiffrement TLS 1.3" },
              { icon: Zap, label: "Résultat en < 5s" },
              { icon: Eye, label: "Aucune donnée stockée" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <Icon className="w-3.5 h-3.5 text-primary/60" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Tool Panel */}
      <section className="px-4 pb-20">
        <div className="max-w-4xl mx-auto">
          {/* Mobile tab bar */}
          <div className="md:hidden flex gap-2 mb-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                  activeTab === tab.id
                    ? "bg-primary/10 text-primary border-primary/20"
                    : "bg-card border-border text-muted-foreground"
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Desktop: Tab Selector + Active Indicator */}
          <div className="hidden md:grid grid-cols-4 gap-3 mb-6">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group p-4 rounded-xl border text-left transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-card border-primary/30 shadow-sm shadow-primary/10"
                    : "bg-card/40 border-border/60 hover:bg-card hover:border-border"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 border transition-colors ${
                  activeTab === tab.id ? "bg-primary/10 border-primary/20" : "bg-muted/50 border-border/50"
                }`}>
                  <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? tab.accent : "text-muted-foreground"}`} />
                </div>
                <p className={`font-semibold text-sm ${activeTab === tab.id ? "text-foreground" : "text-muted-foreground"}`}>
                  {tab.label}
                </p>
                <p className="text-[11px] text-muted-foreground/70 mt-0.5">{tab.desc}</p>
                {activeTab === tab.id && (
                  <div className="mt-2.5 h-0.5 w-full rounded-full bg-primary/30" />
                )}
              </button>
            ))}
          </div>

          {/* Tool Content */}
          <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-6 shadow-lg">
            {activeTab === "email" && <EmailTracker />}
            {activeTab === "ip" && <IpTracker />}
            {activeTab === "whatsapp" && <WhatsappChecker />}
            {activeTab === "ai" && <AiAssistant />}
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="border-y border-border/60 bg-card/30 py-8 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: "2M+", label: "Localisations réalisées" },
            { value: "±3m", label: "Précision GPS moyenne" },
            { value: "4.9s", label: "Temps de réponse moyen" },
            { value: "99.8%", label: "Taux de succès" },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-2xl font-bold text-primary font-mono">{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-foreground">Capacités du système</h2>
            <p className="text-muted-foreground text-sm">Architecture multi-protocoles pour une couverture maximale</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: Mail, title: "Find My Device", desc: "Intégration OAuth2 avec les services Google pour une localisation GPS précise au mètre.", accent: "text-primary", bg: "bg-primary/8 border-primary/20" },
              { icon: Globe, title: "Géolocalisation IP", desc: "Interrogation WHOIS + MaxMind pour tracer n'importe quelle adresse IPv4 ou IPv6.", accent: "text-secondary", bg: "bg-secondary/8 border-secondary/20" },
              { icon: Shield, title: "WhatsApp Checker", desc: "Validation E.164 et vérification du statut de compte WhatsApp via les protocoles Business API.", accent: "text-[#25d366]", bg: "bg-[#25d366]/8 border-[#25d366]/20" },
              { icon: Lock, title: "Chiffrement TLS 1.3", desc: "Toutes les requêtes sont chiffrées de bout en bout. Zero-knowledge architecture.", accent: "text-primary", bg: "bg-primary/8 border-primary/20" },
              { icon: Zap, title: "Temps réel", desc: "Résultats en moins de 5 secondes. Rafraîchissement automatique des coordonnées GPS.", accent: "text-secondary", bg: "bg-secondary/8 border-secondary/20" },
              { icon: Cpu, title: "Assistant IA VARNOX", desc: "Interface conversationnelle vocale et textuelle pour guider chaque opération.", accent: "text-primary", bg: "bg-primary/8 border-primary/20" },
            ].map(({ icon: Icon, title, desc, accent, bg }) => (
              <div key={title} className={`p-5 rounded-xl border ${bg} space-y-3`}>
                <Icon className={`w-5 h-5 ${accent}`} />
                <h3 className="font-semibold text-sm text-foreground">{title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 py-10 px-4">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-5">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-primary" />
            <span className="font-bold text-sm text-foreground">TRACK<span className="text-primary">_X</span> SECURE</span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://wa.me/+224669288332"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-[#25d366]/30 bg-[#25d366]/10 text-[#25d366] text-xs font-medium hover:bg-[#25d366]/20 transition-colors"
              title="Contact WhatsApp"
              data-testid="link-whatsapp"
            >
              <SiWhatsapp className="w-4 h-4" />
              WhatsApp
            </a>
            <a
              href="https://t.me/Varnox_Or_novark"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-[#229ED9]/30 bg-[#229ED9]/10 text-[#229ED9] text-xs font-medium hover:bg-[#229ED9]/20 transition-colors"
              title="Contact Telegram"
              data-testid="link-telegram"
            >
              <SiTelegram className="w-4 h-4" />
              Telegram
            </a>
          </div>

          <div className="text-center space-y-1">
            <p className="text-xs text-muted-foreground/70 font-mono">
              ©2026 TRACK_X — powered by <span className="text-primary/70">Varnox•Prime</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
