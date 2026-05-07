import { useState, useEffect, useRef } from "react";
import { IpTracker } from "@/components/ip-tracker";
import { EmailTracker } from "@/components/email-tracker";
import { AiAssistant } from "@/components/ai-assistant";
import { SiTelegram, SiWhatsapp } from "react-icons/si";
import {
  Globe, Mail, MessageSquare, Target, Menu, X, ChevronDown,
  Zap, Lock, Eye, Shield, Cpu, Map, Search, Activity, Server, Radio
} from "lucide-react";

/* ══════════════════════════════════════
   RADAR CANVAS (matching reference site)
══════════════════════════════════════ */
function RadarCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let angle = 0, raf: number;
    const dots: { x: number; y: number; age: number; max: number }[] = [];

    const draw = () => {
      const W = canvas.width, H = canvas.height;
      const cx = W / 2, cy = H / 2, R = Math.min(W, H) * 0.44;
      ctx.clearRect(0, 0, W, H);

      // Outer glow
      const outerG = ctx.createRadialGradient(cx, cy, R * 0.8, cx, cy, R * 1.2);
      outerG.addColorStop(0, "transparent"); outerG.addColorStop(1, "rgba(139,0,0,0.12)");
      ctx.fillStyle = outerG; ctx.beginPath(); ctx.arc(cx, cy, R * 1.2, 0, Math.PI * 2); ctx.fill();

      // Rings
      [1, 0.72, 0.48, 0.26].forEach((f, i) => {
        ctx.beginPath(); ctx.arc(cx, cy, R * f, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(139,0,0,${0.06 + i * 0.04})`;
        ctx.lineWidth = i === 0 ? 1.5 : 1; ctx.stroke();
      });

      // Cross lines
      [0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4].forEach(a => {
        ctx.beginPath();
        ctx.moveTo(cx + R * Math.cos(a), cy + R * Math.sin(a));
        ctx.lineTo(cx - R * Math.cos(a), cy - R * Math.sin(a));
        ctx.strokeStyle = "rgba(0,229,255,0.06)"; ctx.lineWidth = 0.5; ctx.stroke();
      });

      // Sweep fill
      const sweepG = ctx.createConicGradient(angle, cx, cy);
      sweepG.addColorStop(0, "rgba(0,229,255,0.12)");
      sweepG.addColorStop(0.15, "rgba(0,229,255,0.02)");
      sweepG.addColorStop(0.16, "transparent"); sweepG.addColorStop(1, "transparent");
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fillStyle = sweepG; ctx.fill();

      // Sweep line
      const ex = cx + R * Math.cos(angle), ey = cy + R * Math.sin(angle);
      const lineG = ctx.createLinearGradient(cx, cy, ex, ey);
      lineG.addColorStop(0, "rgba(0,229,255,0.85)"); lineG.addColorStop(1, "rgba(0,229,255,0)");
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(ex, ey);
      ctx.strokeStyle = lineG; ctx.lineWidth = 1.5; ctx.stroke();

      // Spawn dots
      if (Math.random() < 0.03) {
        const da = (Math.random() - 0.5) * 0.5;
        const dr = R * (0.18 + Math.random() * 0.78);
        dots.push({ x: cx + dr * Math.cos(angle + da), y: cy + dr * Math.sin(angle + da), age: 0, max: 70 + Math.random() * 80 });
      }

      // Draw dots
      dots.forEach(d => {
        d.age++;
        const life = 1 - d.age / d.max;
        ctx.beginPath(); ctx.arc(d.x, d.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,229,255,${life * 0.85})`;
        ctx.shadowColor = "#00e5ff"; ctx.shadowBlur = 10 * life;
        ctx.fill(); ctx.shadowBlur = 0;
      });
      for (let i = dots.length - 1; i >= 0; i--) if (dots[i].age >= dots[i].max) dots.splice(i, 1);

      // Center crosshair
      const cr = 18;
      ctx.strokeStyle = "rgba(0,229,255,0.75)"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(cx, cy, cr, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx - cr - 8, cy); ctx.lineTo(cx + cr + 8, cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy - cr - 8); ctx.lineTo(cx, cy + cr + 8); ctx.stroke();
      ctx.fillStyle = "#ff2323"; ctx.shadowColor = "#ff2323"; ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;

      angle += 0.016;
      raf = requestAnimationFrame(draw);
    };

    const resize = () => {
      const s = Math.min(ref.current!.parentElement!.clientWidth, 360);
      canvas.width = s; canvas.height = s;
    };
    resize(); window.addEventListener("resize", resize); draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={ref} className="block" style={{ maxWidth: 360, width: "100%" }} />;
}

/* ══════════════════════════════════════
   NAV
══════════════════════════════════════ */
function Navbar({ onOpenAI }: { onOpenAI: () => void }) {
  const [open, setOpen] = useState(false);
  const scrollTo = (id: string) => { document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); setOpen(false); };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50" style={{ background: "rgba(5,5,5,0.9)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => scrollTo("hero")}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ border: "1px solid rgba(0,229,255,0.25)", background: "rgba(0,229,255,0.06)" }}>
              <Target className="w-4 h-4" style={{ color: "#00e5ff" }} />
            </div>
            <div className="leading-none">
              <div className="flex items-center gap-0.5">
                <span className="font-display text-lg tracking-widest" style={{ color: "#00e5ff" }}>TRACK</span>
                <span className="font-display text-lg tracking-widest" style={{ color: "#ff2323" }}>_X</span>
                <span className="font-display text-lg tracking-widest ml-1" style={{ color: "#fff", opacity: 0.7 }}>SECURE</span>
              </div>
              <p className="font-mono text-xs" style={{ color: "rgba(0,229,255,0.35)", fontSize: "9px", letterSpacing: "0.2em" }}>GÉOLOCATION INTELLIGENCE</p>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <button className="nav-link" onClick={() => scrollTo("tracker")}>Tracker</button>
            <button className="nav-link" onClick={() => scrollTo("features")}>Fonctionnalités</button>
            <button className="nav-link" onClick={() => onOpenAI()}>IA VARNOX</button>
            <button className="nav-link" onClick={() => scrollTo("about")}>À propos</button>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{ border: "1px solid rgba(0,229,255,0.25)", background: "rgba(0,229,255,0.06)" }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#00e5ff", animation: "dot-blink 2s ease-in-out infinite" }} />
              <span className="font-tech text-xs font-bold tracking-widest" style={{ color: "#00e5ff" }}>ONLINE</span>
            </div>
          </div>

          {/* Mobile */}
          <button className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ border: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.4)" }}
            onClick={() => setOpen(o => !o)}>
            {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 pt-14 md:hidden" style={{ background: "rgba(5,5,5,0.97)", backdropFilter: "blur(20px)" }}>
          <div className="flex flex-col items-center gap-2 pt-8">
            {[
              { label: "Tracker", id: "tracker" },
              { label: "Fonctionnalités", id: "features" },
              { label: "À propos", id: "about" },
            ].map(({ label, id }) => (
              <button key={id} onClick={() => scrollTo(id)}
                className="w-64 py-3.5 text-center font-tech text-sm font-bold tracking-widest uppercase transition-all rounded-lg"
                style={{ border: "1px solid rgba(0,229,255,0.1)", color: "rgba(0,229,255,0.6)" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(0,229,255,0.3)"; e.currentTarget.style.color = "#00e5ff"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(0,229,255,0.1)"; e.currentTarget.style.color = "rgba(0,229,255,0.6)"; }}>
                {label}
              </button>
            ))}
            <button onClick={onOpenAI}
              className="w-64 py-3.5 text-center font-tech text-sm font-bold tracking-widest uppercase mt-2 rounded-lg"
              style={{ border: "1px solid rgba(0,229,255,0.3)", color: "#00e5ff", background: "rgba(0,229,255,0.08)" }}>
              IA VARNOX
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/* ══════════════════════════════════════
   AI MODAL
══════════════════════════════════════ */
function AiModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(12px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full sm:max-w-xl rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col"
        style={{
          background: "#070707",
          border: "1px solid rgba(0,229,255,0.12)",
          boxShadow: "0 0 60px rgba(0,229,255,0.08), 0 0 120px rgba(0,0,0,0.8)",
          height: "min(680px, 95dvh)",
        }}>
        <div className="p-5 flex-1 flex flex-col overflow-hidden">
          <AiAssistant onClose={onClose} isModal />
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   FEATURE CARD
══════════════════════════════════════ */
function FeatCard({ icon: Icon, title, desc, color }: { icon: any; title: string; desc: string; color: string }) {
  return (
    <div className="feat-card">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
        style={{ border: `1px solid ${color}25`, background: `${color}08` }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <h3 className="font-tech text-sm font-bold tracking-wide uppercase mb-2" style={{ color: "#d0d0d0" }}>{title}</h3>
      <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'JetBrains Mono'", fontSize: "12px" }}>{desc}</p>
    </div>
  );
}

/* ══════════════════════════════════════
   MAIN
══════════════════════════════════════ */
export default function Home() {
  const [aiOpen, setAiOpen] = useState(false);
  const [trackerTab, setTrackerTab] = useState<"ip" | "email">("ip");

  // Kill Replit badge on every render
  useEffect(() => {
    const kill = () => {
      document.querySelectorAll('[data-replit-badge], .replit-badge, #replit-badge, [class*="replit-ui-theme"]').forEach(el => el.remove());
      document.querySelectorAll('iframe').forEach(f => { if (f.src?.includes('replit')) f.remove(); });
      document.querySelectorAll('script').forEach(s => { if (s.src?.includes('replit-pill') || s.src?.includes('replit-cdn')) s.remove(); });
    };
    kill();
    const observer = new MutationObserver(kill);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="grid-bg min-h-screen" style={{ background: "#050505" }}>
      <Navbar onOpenAI={() => setAiOpen(true)} />
      <AiModal open={aiOpen} onClose={() => setAiOpen(false)} />

      {/* ══ HERO ══ */}
      <section id="hero" className="pt-14 min-h-screen flex items-center relative overflow-hidden">
        {/* Scanline */}
        <div className="pointer-events-none absolute left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(0,229,255,0.3), transparent)", animation: "scan-line 7s ease-in-out infinite" }} />

        <div className="max-w-5xl mx-auto px-4 py-20 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* TEXT */}
            <div className="order-2 md:order-1">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 mb-7 px-4 py-2 rounded-full"
                style={{ border: "1px solid rgba(255,35,35,0.3)", background: "rgba(255,35,35,0.06)", animation: "badge-glow 2.5s ease-in-out infinite" }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#ff2323", animation: "dot-blink 1.5s ease-in-out infinite" }} />
                <span className="font-tech text-xs font-bold tracking-widest uppercase" style={{ color: "rgba(255,80,80,0.9)" }}>
                  SYSTÈME ACTIF — VARNOX PRIME OFFICIAL
                </span>
              </div>

              {/* Main Title */}
              <h1 className="font-display leading-none mb-3" style={{ fontSize: "clamp(4.5rem, 14vw, 8rem)" }}>
                <span style={{
                  background: "linear-gradient(135deg, #ff0000 0%, #ff3300 30%, #ff5533 55%, #ff0000 100%)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                  filter: "drop-shadow(0 0 24px rgba(255,35,35,0.4))",
                }}>TRACK_X</span>
              </h1>
              <h2 className="font-tech font-bold tracking-[0.55em] mb-5" style={{ fontSize: "1.1rem", color: "#00e5ff", letterSpacing: "0.55em", textShadow: "0 0 20px rgba(0,229,255,0.4)" }}>
                SECURE
              </h2>

              <p className="font-sans text-base mb-2 leading-relaxed" style={{ color: "rgba(255,255,255,0.4)", fontWeight: 400 }}>
                Géolocalisation IP professionnelle et instantanée
              </p>
              <p className="font-mono text-xs mb-8" style={{ color: "rgba(255,255,255,0.2)" }}>
                Ville · Pays · ISP · ASN · Carte interactive · Détection VPN/Proxy
              </p>

              {/* Mini stats */}
              <div className="flex flex-wrap gap-3 mb-8">
                {[
                  { icon: Zap, label: "< 5s", sub: "Résultat" },
                  { icon: Lock, label: "TLS 1.3", sub: "Chiffrement" },
                  { icon: Eye, label: "Zero-Log", sub: "Anonymat" },
                ].map(({ icon: Icon, label, sub }) => (
                  <div key={label} className="flex items-center gap-2 px-3 py-2 rounded-lg"
                    style={{ border: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)" }}>
                    <Icon className="w-3.5 h-3.5" style={{ color: "rgba(0,229,255,0.4)" }} />
                    <div>
                      <p className="font-tech text-xs font-bold" style={{ color: "rgba(255,255,255,0.6)" }}>{label}</p>
                      <p className="font-mono" style={{ fontSize: "9px", color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em" }}>{sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <button className="btn-primary" onClick={() => document.getElementById("tracker")?.scrollIntoView({ behavior: "smooth" })}>
                  <Search className="w-4 h-4" /> Localiser maintenant
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button className="btn-cyan" onClick={() => setAiOpen(true)}>
                  <MessageSquare className="w-3.5 h-3.5" /> Assistant IA
                </button>
              </div>
            </div>

            {/* RADAR */}
            <div className="order-1 md:order-2 flex justify-center">
              <RadarCanvas />
            </div>
          </div>

          {/* Stats bar */}
          <div className="mt-20 grid grid-cols-2 sm:grid-cols-4 rounded-xl overflow-hidden"
            style={{ border: "1px solid rgba(255,255,255,0.05)", background: "#070707" }}>
            {[
              { val: "2M+", label: "Requêtes traitées" },
              { val: "±3m", label: "Précision GPS" },
              { val: "99.8%", label: "Taux de succès" },
              { val: "24/7", label: "Disponibilité" },
            ].map(({ val, label }, i) => (
              <div key={label} className="text-center py-6 px-4"
                style={{ borderRight: i < 3 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                <p className="font-display text-4xl mb-1 neon-cyan">{val}</p>
                <p className="font-mono uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.2)", fontSize: "10px" }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ DIVIDER ══ */}
      <div className="section-divider" />

      {/* ══ TRACKER ══ */}
      <section id="tracker" className="py-20 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-10">
            <p className="font-mono text-xs tracking-widest uppercase mb-3" style={{ color: "rgba(0,229,255,0.4)" }}>// MODULE PRINCIPAL</p>
            <h2 className="font-display mb-3" style={{ fontSize: "clamp(2.5rem, 7vw, 4.5rem)", color: "#fff" }}>
              GÉOLOCALISATION
            </h2>
            <p className="font-mono text-sm" style={{ color: "rgba(255,255,255,0.25)" }}>
              Entrez une adresse IPv4/IPv6 ou un compte Gmail pour localiser l'appareil en temps réel
            </p>
          </div>

          {/* Module tabs */}
          <div className="flex gap-2 p-1 rounded-xl mb-6"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <button className={`btn-tab ${trackerTab === "ip" ? "active" : ""}`} onClick={() => setTrackerTab("ip")}>
              <Globe className="w-4 h-4" /> Adresse IP
            </button>
            <button className={`btn-tab ${trackerTab === "email" ? "active" : ""}`} onClick={() => setTrackerTab("email")}>
              <Mail className="w-4 h-4" /> Compte Gmail
            </button>
          </div>

          {/* Content */}
          <div className="tx-card">
            <div className="h-px w-full" style={{ background: trackerTab === "ip" ? "linear-gradient(90deg, transparent, rgba(0,229,255,0.4), transparent)" : "linear-gradient(90deg, transparent, rgba(255,35,35,0.4), transparent)" }} />
            <div className="p-6 sm:p-8">
              {trackerTab === "ip" ? <IpTracker /> : <EmailTracker />}
            </div>
          </div>
        </div>
      </section>

      {/* ══ DIVIDER ══ */}
      <div className="section-divider" />

      {/* ══ FEATURES ══ */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="font-mono text-xs tracking-widest uppercase mb-3" style={{ color: "rgba(0,229,255,0.4)" }}>// CAPACITÉS SYSTÈME</p>
            <h2 className="font-display mb-3" style={{ fontSize: "clamp(2.2rem, 6vw, 4rem)", color: "#fff" }}>
              FONCTIONNALITÉS AVANCÉES
            </h2>
            <div className="w-16 h-px mx-auto" style={{ background: "linear-gradient(90deg, transparent, rgba(0,229,255,0.5), transparent)" }} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <FeatCard icon={Globe} color="#00e5ff" title="Géolocalisation IP"
              desc="Localisation réseau réelle via MaxMind GeoIP2, WHOIS et tables BGP. IPv4 et IPv6 supportés." />
            <FeatCard icon={Map} color="#ff2323" title="Carte Interactive"
              desc="Rendu CartoDB Dark avec marqueur animé en temps réel. Export vers Google Maps." />
            <FeatCard icon={Shield} color="#facc15" title="Détection VPN/Proxy"
              desc="Identification automatique des nœuds Tor, proxies transparents et VPN commerciaux." />
            <FeatCard icon={Mail} color="#ff6b35" title="Tracking Gmail"
              desc="Localisation GPS via Find My Device et OAuth2. Précision ±2m. Triangulation multi-satellites." />
            <FeatCard icon={Cpu} color="#a855f7" title="Assistant IA VARNOX"
              desc="Chat vocal et textuel en temps réel. Répond à toutes vos questions sur la plateforme." />
            <FeatCard icon={Activity} color="#22c55e" title="Résultats Complets"
              desc="ISP, ASN, Organisation, Fuseau horaire, Reverse DNS, Mobile, Hosting — données exhaustives." />
            <FeatCard icon={Lock} color="#00e5ff" title="Chiffrement AES-256"
              desc="TLS 1.3 bout-en-bout. Architecture zero-knowledge. Aucune donnée stockée. RGPD compliant." />
            <FeatCard icon={Radio} color="#ff2323" title="Temps Réel"
              desc="Résultats en moins de 5 secondes. API en direct. Données fraîches à chaque requête." />
            <FeatCard icon={Server} color="#facc15" title="APIs Professionnelles"
              desc="ip-api.com, MaxMind GeoIP2, ARIN/RIPE/LACNIC. Sources de données certifiées." />
          </div>
        </div>
      </section>

      {/* ══ DIVIDER ══ */}
      <div className="section-divider" />

      {/* ══ AI CTA ══ */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="tx-card p-10 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, rgba(0,229,255,0.03) 0%, transparent 70%)" }} />
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
                style={{ border: "1px solid rgba(0,229,255,0.2)", background: "rgba(0,229,255,0.06)" }}>
                <Cpu className="w-7 h-7" style={{ color: "#00e5ff" }} />
              </div>
              <p className="font-mono text-xs tracking-widest uppercase mb-2" style={{ color: "rgba(0,229,255,0.4)" }}>// MODULE 03</p>
              <h2 className="font-display mb-3" style={{ fontSize: "clamp(2rem, 5vw, 3rem)", color: "#fff" }}>
                ASSISTANT IA VARNOX
              </h2>
              <p className="font-mono text-sm mb-6 leading-relaxed" style={{ color: "rgba(255,255,255,0.25)" }}>
                Interface conversationnelle vocale et textuelle. Posez vos questions sur la géolocalisation, la cybersécurité et les fonctionnalités de TRACK_X SECURE.
              </p>
              <button className="btn-primary" onClick={() => setAiOpen(true)}>
                <MessageSquare className="w-4 h-4" /> Ouvrir l'assistant IA
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ══ DIVIDER ══ */}
      <div className="section-divider" />

      {/* ══ ABOUT ══ */}
      <section id="about" className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <p className="font-mono text-xs tracking-widest uppercase mb-3" style={{ color: "rgba(0,229,255,0.4)" }}>// À PROPOS</p>
            <h2 className="font-display mb-3" style={{ fontSize: "clamp(2rem, 6vw, 3.5rem)", color: "#fff" }}>
              VARNOX PRIME OFFICIAL
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="tx-card p-6">
              <h3 className="font-tech text-sm font-bold tracking-wider uppercase mb-4" style={{ color: "#00e5ff" }}>
                À propos de TRACK_X
              </h3>
              <p className="text-sm leading-relaxed mb-4" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'JetBrains Mono'", fontSize: "12px" }}>
                TRACK_X SECURE est une plateforme de géolocalisation professionnelle développée par ∇ΔΓΗΘΞ ϷΓΙΜΝΝΝΝ ΤΝCϮ ΘFFΙCΙΔL, ingénieur spécialisé en cybersécurité et intelligence artificielle.
              </p>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "'JetBrains Mono'", fontSize: "12px" }}>
                La plateforme utilise des APIs de niveau professionnel pour fournir des résultats précis en temps réel. Architecture zero-knowledge — aucune donnée n'est stockée.
              </p>
            </div>

            <div className="tx-card p-6">
              <h3 className="font-tech text-sm font-bold tracking-wider uppercase mb-4" style={{ color: "#00e5ff" }}>
                Contact & Réseaux
              </h3>
              <div className="space-y-3">
                <a href="https://wa.me/+224669288332" target="_blank" rel="noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg transition-all group"
                  style={{ border: "1px solid rgba(37,211,102,0.12)", background: "rgba(37,211,102,0.04)", textDecoration: "none" }}>
                  <SiWhatsapp className="w-5 h-5 flex-shrink-0" style={{ color: "#25d366" }} />
                  <div>
                    <p className="font-tech text-xs font-bold tracking-wide" style={{ color: "#25d366" }}>WhatsApp</p>
                    <p className="font-mono text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.2)" }}>+224 669 28 83 32</p>
                  </div>
                </a>
                <a href="https://t.me/Varnox_Or_novark" target="_blank" rel="noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg transition-all"
                  style={{ border: "1px solid rgba(34,158,217,0.12)", background: "rgba(34,158,217,0.04)", textDecoration: "none" }}>
                  <SiTelegram className="w-5 h-5 flex-shrink-0" style={{ color: "#229ED9" }} />
                  <div>
                    <p className="font-tech text-xs font-bold tracking-wide" style={{ color: "#229ED9" }}>Telegram</p>
                    <p className="font-mono text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.2)" }}>@Varnox_Or_novark</p>
                  </div>
                </a>
              </div>

              <div className="mt-4 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                <div className="grid grid-cols-2 gap-2 text-center">
                  {[
                    { val: "v2.0", label: "Version" },
                    { val: "2026", label: "Année" },
                  ].map(({ val, label }) => (
                    <div key={label} className="py-2 rounded-lg" style={{ background: "rgba(0,229,255,0.04)", border: "1px solid rgba(0,229,255,0.08)" }}>
                      <p className="font-display text-xl neon-cyan">{val}</p>
                      <p className="font-mono" style={{ fontSize: "10px", color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em" }}>{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Legal note */}
          <div className="mt-6 p-4 rounded-xl text-center" style={{ background: "rgba(255,35,35,0.04)", border: "1px solid rgba(255,35,35,0.08)" }}>
            <p className="font-mono text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.2)" }}>
              ⚠ La géolocalisation par IP est précise au niveau de la ville dans la majorité des cas. Pour une localisation GPS exacte, l'accès physique à l'appareil ou son consentement est nécessaire. Usage légal uniquement.
            </p>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.04)", background: "#050505" }}>
        <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1 mb-1">
              <span className="font-display text-xl tracking-widest" style={{ color: "#00e5ff" }}>TRACK</span>
              <span className="font-display text-xl tracking-widest" style={{ color: "#ff2323" }}>_X</span>
              <span className="font-display text-xl tracking-widest ml-1" style={{ color: "rgba(255,255,255,0.4)" }}>SECURE</span>
            </div>
            <p className="font-mono text-xs" style={{ color: "rgba(255,255,255,0.15)" }}>
              ©2026 TRACK_X — powered by <span style={{ color: "rgba(0,229,255,0.3)" }}>Varnox•Prime</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a href="https://wa.me/+224669288332" target="_blank" rel="noreferrer"
              className="w-9 h-9 rounded-lg flex items-center justify-center transition-all"
              style={{ border: "1px solid rgba(37,211,102,0.15)", color: "rgba(37,211,102,0.4)", textDecoration: "none" }}
              onMouseEnter={e => { e.currentTarget.style.color = "#25d366"; e.currentTarget.style.borderColor = "rgba(37,211,102,0.4)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "rgba(37,211,102,0.4)"; e.currentTarget.style.borderColor = "rgba(37,211,102,0.15)"; }}>
              <SiWhatsapp className="w-4 h-4" />
            </a>
            <a href="https://t.me/Varnox_Or_novark" target="_blank" rel="noreferrer"
              className="w-9 h-9 rounded-lg flex items-center justify-center transition-all"
              style={{ border: "1px solid rgba(34,158,217,0.15)", color: "rgba(34,158,217,0.4)", textDecoration: "none" }}
              onMouseEnter={e => { e.currentTarget.style.color = "#229ED9"; e.currentTarget.style.borderColor = "rgba(34,158,217,0.4)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "rgba(34,158,217,0.4)"; e.currentTarget.style.borderColor = "rgba(34,158,217,0.15)"; }}>
              <SiTelegram className="w-4 h-4" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
