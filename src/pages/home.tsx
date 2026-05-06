import { useState } from "react";
import { EmailTracker } from "@/components/email-tracker";
import { IpTracker } from "@/components/ip-tracker";
import { AiAssistant } from "@/components/ai-assistant";
import { WhatsappChecker } from "@/components/whatsapp-checker";
import { SiWhatsapp, SiTelegram } from "react-icons/si";
import { Mail, Globe, MessageSquare, Shield, Menu, X, Target } from "lucide-react";

type Tab = "ip" | "email" | "whatsapp" | "ai";

const TABS: { id: Tab; label: string; icon: typeof Globe }[] = [
  { id: "ip", label: "Adresse IP", icon: Globe },
  { id: "email", label: "Email Google", icon: Mail },
  { id: "whatsapp", label: "WhatsApp Ban", icon: Shield },
  { id: "ai", label: "Assistant IA", icon: MessageSquare },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("ip");
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden">

      {/* ── TOP NAV ── */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-black/80 backdrop-blur border-b border-cyan-500/10">
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 flex items-center justify-center rounded-lg border border-cyan-500/40 bg-cyan-500/5">
            <Target className="w-5 h-5 text-cyan-400 crosshair-blink" />
          </div>
          <div>
            <div className="font-display text-sm font-bold tracking-widest text-white">
              TRACK<span className="text-red-500">_X</span> <span className="text-cyan-400">SECURE</span>
            </div>
            <div className="text-[9px] font-mono text-cyan-500/60 tracking-widest uppercase">
              Geolocation Intelligence
            </div>
          </div>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-display font-semibold tracking-wider uppercase transition-all duration-200 ${
                activeTab === t.id
                  ? "text-cyan-400 bg-cyan-500/10 border border-cyan-500/30"
                  : "text-gray-500 hover:text-cyan-400/70 hover:bg-white/3"
              }`}
            >
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded border border-white/10 text-gray-400"
          onClick={() => setMenuOpen(o => !o)}
        >
          {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </header>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 pt-16 bg-black/95 backdrop-blur flex flex-col items-center justify-center gap-4">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => { setActiveTab(t.id); setMenuOpen(false); }}
              className={`flex items-center gap-3 px-8 py-4 rounded-lg border text-lg font-display font-bold tracking-widest uppercase w-64 transition-all ${
                activeTab === t.id
                  ? "border-cyan-500/50 text-cyan-400 bg-cyan-500/10"
                  : "border-white/10 text-gray-400"
              }`}
            >
              <t.icon className="w-5 h-5" />
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* ── HERO ── */}
      <section className="relative pt-20 pb-8 flex flex-col items-center text-center overflow-hidden min-h-[90vh] justify-center">
        
        {/* Background radar rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="absolute w-[600px] h-[600px] rounded-full border border-red-900/20 radar-pulse" />
          <div className="absolute w-[480px] h-[480px] rounded-full border border-red-800/25 radar-pulse" style={{ animationDelay: "0.5s" }} />
          <div className="absolute w-[360px] h-[360px] rounded-full border border-red-700/20 radar-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute w-[240px] h-[240px] rounded-full border border-red-600/20 radar-pulse" style={{ animationDelay: "1.5s" }} />
        </div>

        {/* Central radar icon */}
        <div className="relative w-36 h-36 mb-8 flex items-center justify-center">
          {/* Outer spinning ring */}
          <div className="absolute inset-0 rounded-full border border-red-500/30 radar-spin-slow" />
          <div className="absolute inset-2 rounded-full border border-cyan-500/20 radar-spin-reverse" />
          
          {/* Sweep */}
          <div className="absolute inset-3 rounded-full overflow-hidden">
            <div
              className="absolute inset-0 radar-spin"
              style={{
                background: "conic-gradient(from 0deg, hsl(185 100% 50% / 0.25) 0deg, transparent 60deg, transparent 360deg)",
              }}
            />
          </div>

          {/* Ring ping */}
          <div className="absolute inset-8 rounded-full border border-cyan-400/30 animate-ping" style={{ animationDuration: "3s" }} />

          {/* Crosshair center */}
          <div className="relative w-16 h-16 flex items-center justify-center rounded-full border-2 border-cyan-400/70 bg-cyan-500/5 crosshair-blink"
            style={{ boxShadow: "0 0 20px hsl(185 100% 50% / 0.4), inset 0 0 12px hsl(185 100% 50% / 0.1)" }}>
            <Target className="w-8 h-8 text-cyan-400" />
            {/* Crosshair lines */}
            <div className="absolute top-1/2 left-0 right-0 h-px bg-cyan-400/50" />
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-cyan-400/50" />
          </div>
        </div>

        {/* Status badge */}
        <div className="mb-6 px-5 py-2 rounded-full border border-red-500/50 bg-red-950/60 badge-glow inline-flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 pulse-dot" />
          <span className="text-xs font-mono font-bold tracking-[0.2em] text-red-300 uppercase">
            SYSTÈME ACTIF — VARNOX PRIME OFFICIAL
          </span>
        </div>

        {/* Main title */}
        <h1 className="font-display font-black tracking-tighter leading-none mb-2 red-glow"
          style={{ fontSize: "clamp(3rem, 15vw, 6rem)" }}>
          <span style={{
            background: "linear-gradient(135deg, #ff1a1a 0%, #ff4444 40%, #ff6b6b 70%, #ff2222 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            TRACK_X
          </span>
        </h1>
        <h2
          className="font-display font-bold tracking-[0.5em] text-xl mb-4 cyan-glow"
          style={{ color: "hsl(185 100% 50%)" }}
        >
          SECURE
        </h2>

        <p className="text-gray-400 text-base max-w-sm mx-auto leading-relaxed font-sans px-4 mb-2">
          Géolocalisation IP professionnelle et instantanée
        </p>
        <p className="text-gray-600 text-sm font-mono mb-8">
          Ville · Pays · ISP · ASN · Carte interactive · Détection VPN/Proxy
        </p>

        {/* Stats */}
        <div className="flex items-center gap-6 text-center mb-10">
          {[
            { val: "±3m", label: "Précision" },
            { val: "< 5s", label: "Résultat" },
            { val: "99.8%", label: "Succès" },
          ].map(({ val, label }) => (
            <div key={label}>
              <div className="font-display font-bold text-lg text-cyan-400" style={{ textShadow: "0 0 10px hsl(185 100% 50% / 0.5)" }}>
                {val}
              </div>
              <div className="text-[10px] text-gray-600 font-mono uppercase tracking-widest">{label}</div>
            </div>
          ))}
        </div>

        {/* WhatsApp Ban quick-check button */}
        <button
          onClick={() => setActiveTab("whatsapp")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[#25d366]/40 bg-[#25d366]/10 text-[#25d366] text-sm font-display font-bold tracking-wider uppercase hover:bg-[#25d366]/20 transition-all duration-200 hover:shadow-[0_0_20px_hsl(142_70%_45%/0.3)]"
        >
          <Shield className="w-4 h-4" />
          Check WhatsApp Ban
        </button>
      </section>

      {/* ── TOOL PANEL ── */}
      <section className="px-3 pb-10 max-w-2xl mx-auto">
        {/* Tab bar */}
        <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded text-xs font-display font-bold tracking-wider uppercase transition-all duration-200 ${
                activeTab === t.id
                  ? "text-cyan-400 bg-cyan-500/10 border border-cyan-500/40"
                  : "text-gray-600 border border-transparent hover:border-white/10 hover:text-gray-400"
              }`}
            >
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Panel */}
        <div className="rounded-xl border border-cyan-500/15 bg-black/60 backdrop-blur-sm overflow-hidden"
          style={{ boxShadow: "0 0 40px hsl(185 100% 50% / 0.04), inset 0 0 40px hsl(185 100% 50% / 0.01)" }}>
          {/* Top accent line */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
          <div className="p-5 md:p-6">
            {activeTab === "ip" && <IpTracker />}
            {activeTab === "email" && <EmailTracker />}
            {activeTab === "whatsapp" && <WhatsappChecker />}
            {activeTab === "ai" && <AiAssistant />}
          </div>
          <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="px-4 pb-16 max-w-2xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { icon: Globe, label: "Géolocalisation IP", desc: "IPv4 & IPv6 — Base MaxMind", color: "text-cyan-400", border: "border-cyan-500/20" },
            { icon: Mail, label: "Tracking Google", desc: "OAuth2 · Find My Device", color: "text-red-400", border: "border-red-500/20" },
            { icon: Shield, label: "WhatsApp Checker", desc: "Actif / Banni / Inactif", color: "text-green-400", border: "border-green-500/20" },
            { icon: MessageSquare, label: "Assistant VARNOX", desc: "IA vocale & textuelle", color: "text-cyan-400", border: "border-cyan-500/20" },
            { icon: Target, label: "Précision GPS ±3m", desc: "Temps réel · Live tracking", color: "text-red-400", border: "border-red-500/20" },
            { icon: Shield, label: "Chiffrement TLS 1.3", desc: "Zero-knowledge · Anonymat", color: "text-cyan-400", border: "border-cyan-500/20" },
          ].map(({ icon: Icon, label, desc, color, border }) => (
            <div key={label} className={`p-4 rounded-lg bg-black/50 border ${border} backdrop-blur-sm`}>
              <Icon className={`w-4 h-4 ${color} mb-2`} />
              <p className={`font-display font-bold text-sm ${color} leading-tight`}>{label}</p>
              <p className="text-[11px] text-gray-600 font-mono mt-1">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 py-8 px-4">
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-4">
          <div className="font-display font-black text-xl tracking-widest">
            <span style={{
              background: "linear-gradient(135deg, #ff1a1a, #ff4444)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>TRACK</span>
            <span className="text-gray-600">_</span>
            <span style={{
              background: "linear-gradient(135deg, #ff1a1a, #ff4444)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>X</span>
            <span className="text-cyan-500 ml-2 text-sm font-mono font-normal tracking-widest">SECURE</span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://wa.me/+224669288332"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#25d366]/30 bg-[#25d366]/8 text-[#25d366] text-xs font-display font-bold tracking-wider uppercase hover:bg-[#25d366]/18 transition-all"
            >
              <SiWhatsapp className="w-4 h-4" />
              WhatsApp
            </a>
            <a
              href="https://t.me/Varnox_Or_novark"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#229ED9]/30 bg-[#229ED9]/8 text-[#229ED9] text-xs font-display font-bold tracking-wider uppercase hover:bg-[#229ED9]/18 transition-all"
            >
              <SiTelegram className="w-4 h-4" />
              Telegram
            </a>
          </div>

          <p className="text-xs font-mono text-gray-700 text-center">
            ©2026 TRACK_X — powered by{" "}
            <span className="text-cyan-600">Varnox•Prime</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
