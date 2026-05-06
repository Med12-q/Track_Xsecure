import { useState, useEffect, useRef } from "react";
import { IpTracker } from "@/components/ip-tracker";
import { EmailTracker } from "@/components/email-tracker";
import { WhatsappChecker } from "@/components/whatsapp-checker";
import { AiAssistant } from "@/components/ai-assistant";
import { SiWhatsapp, SiTelegram } from "react-icons/si";
import { Globe, Mail, Shield, MessageSquare, Target, Menu, X, ChevronRight, Zap, Lock, Eye } from "lucide-react";

const NAV_ITEMS = [
  { id: "hero",      label: "Accueil",        icon: Target },
  { id: "ip",        label: "Localisation IP", icon: Globe },
  { id: "email",     label: "Tracking Gmail",  icon: Mail },
  { id: "whatsapp",  label: "WhatsApp Ban",    icon: Shield },
  { id: "ai",        label: "Assistant IA",    icon: MessageSquare },
];

function useActiveSection() {
  const [active, setActive] = useState("hero");
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); });
      },
      { threshold: 0.35 }
    );
    NAV_ITEMS.forEach(n => {
      const el = document.getElementById(n.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);
  return active;
}

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ─── RADAR HERO ─── */
function RadarHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let angle = 0; let raf: number;
    const dots: { x: number; y: number; age: number; maxAge: number }[] = [];

    const draw = () => {
      const W = canvas.width, H = canvas.height;
      const cx = W / 2, cy = H / 2, R = Math.min(W, H) * 0.42;
      ctx.clearRect(0, 0, W, H);

      // Rings
      [1, 0.75, 0.5, 0.25].forEach(f => {
        ctx.beginPath();
        ctx.arc(cx, cy, R * f, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(139,0,0,${0.08 + f * 0.06})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Cross lines
      ctx.strokeStyle = "rgba(0,229,255,0.07)";
      ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(cx - R, cy); ctx.lineTo(cx + R, cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy - R); ctx.lineTo(cx, cy + R); ctx.stroke();

      // Sweep gradient
      const sweep = ctx.createConicalGradient ? null : null;
      const grad = ctx.createConicGradient(angle, cx, cy);
      grad.addColorStop(0, "rgba(0,229,255,0.18)");
      grad.addColorStop(0.12, "rgba(0,229,255,0.04)");
      grad.addColorStop(0.13, "rgba(0,0,0,0)");
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fillStyle = grad; ctx.fill();

      // Sweep line
      const ex = cx + R * Math.cos(angle), ey = cy + R * Math.sin(angle);
      const lg = ctx.createLinearGradient(cx, cy, ex, ey);
      lg.addColorStop(0, "rgba(0,229,255,0.8)");
      lg.addColorStop(1, "rgba(0,229,255,0)");
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(ex, ey);
      ctx.strokeStyle = lg; ctx.lineWidth = 1.5; ctx.stroke();

      // Detect dots near sweep
      if (Math.random() < 0.025) {
        const a2 = angle + (Math.random() - 0.5) * 0.4;
        const r2 = R * (0.2 + Math.random() * 0.75);
        dots.push({ x: cx + r2 * Math.cos(a2), y: cy + r2 * Math.sin(a2), age: 0, maxAge: 80 + Math.random() * 60 });
      }

      // Render dots
      dots.forEach((d, i) => {
        d.age++;
        const life = 1 - d.age / d.maxAge;
        ctx.beginPath(); ctx.arc(d.x, d.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,229,255,${life * 0.9})`;
        ctx.shadowColor = "#00e5ff"; ctx.shadowBlur = 8 * life;
        ctx.fill(); ctx.shadowBlur = 0;
      });
      for (let i = dots.length - 1; i >= 0; i--) if (dots[i].age >= dots[i].maxAge) dots.splice(i, 1);

      // Center crosshair
      const cr = 22;
      ctx.strokeStyle = "rgba(0,229,255,0.7)";
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(cx, cy, cr, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx - cr - 6, cy); ctx.lineTo(cx + cr + 6, cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy - cr - 6); ctx.lineTo(cx, cy + cr + 6); ctx.stroke();
      [0, Math.PI / 2, Math.PI, 1.5 * Math.PI].forEach(a => {
        const bx = cx + (cr + 2) * Math.cos(a), by = cy + (cr + 2) * Math.sin(a);
        ctx.beginPath(); ctx.arc(bx, by, 2, 0, Math.PI * 2);
        ctx.fillStyle = "#00e5ff"; ctx.fill();
      });

      angle += 0.018;
      raf = requestAnimationFrame(draw);
    };

    const resize = () => {
      const size = Math.min(canvas.parentElement!.offsetWidth, 380);
      canvas.width = size; canvas.height = size;
    };
    resize();
    window.addEventListener("resize", resize);
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={canvasRef} className="block" style={{ maxWidth: 380, width: "100%" }} />;
}

/* ─── SECTION WRAPPER ─── */
function Section({ id, children, accent = "cyan" }: { id: string; children: React.ReactNode; accent?: "cyan" | "red" | "green" }) {
  const colors = { cyan: "#00e5ff", red: "#ff2323", green: "#25d366" };
  const color = colors[accent];
  return (
    <section id={id} className="relative min-h-screen flex items-center py-24 px-4"
      style={{ borderTop: `1px solid ${color}10` }}>
      {/* Left accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-px" style={{ background: `linear-gradient(to bottom, transparent, ${color}30, transparent)` }} />
      <div className="max-w-3xl mx-auto w-full">
        {children}
      </div>
    </section>
  );
}

/* ─── SECTION HEADER ─── */
function SectionHeader({ num, tag, title, subtitle, accent = "cyan" }:
  { num: string; tag: string; title: string; subtitle: string; accent?: "cyan" | "red" | "green" }) {
  const colors = { cyan: "#00e5ff", red: "#ff2323", green: "#25d366" };
  const color = colors[accent];
  return (
    <div className="mb-10">
      <div className="flex items-center gap-3 mb-4">
        <span className="font-mono text-xs font-bold tracking-widest" style={{ color: `${color}55` }}>{num}</span>
        <div className="h-px flex-1" style={{ background: `linear-gradient(to right, ${color}30, transparent)` }} />
        <span className="font-tech text-xs font-bold tracking-widest uppercase px-3 py-1 rounded"
          style={{ border: `1px solid ${color}25`, color: `${color}88`, background: `${color}08` }}>{tag}</span>
      </div>
      <h2 className="section-title mb-3" style={{ fontSize: "clamp(2.5rem, 6vw, 4rem)", color }}>
        {title}
      </h2>
      <p className="font-mono text-sm leading-relaxed" style={{ color: "#444" }}>{subtitle}</p>
    </div>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const active = useActiveSection();

  return (
    <div className="grid-bg" style={{ minHeight: "100vh", background: "#040404" }}>

      {/* ═══ SIDEBAR NAV (Desktop) ═══ */}
      <nav className="fixed left-0 top-0 bottom-0 w-56 z-50 hidden lg:flex flex-col py-8 px-4"
        style={{ background: "#040404", borderRight: "1px solid #0a0a0a" }}>
        {/* Logo */}
        <div className="mb-10 px-2">
          <div className="flex items-center gap-2.5 mb-1">
            <Target className="w-5 h-5" style={{ color: "#00e5ff" }} />
            <span className="font-display text-xl tracking-widest" style={{ color: "#00e5ff" }}>TRACK</span>
            <span className="font-display text-xl tracking-widest" style={{ color: "#ff2323" }}>_X</span>
          </div>
          <p className="font-tech text-xs tracking-[0.3em] ml-8" style={{ color: "#ff232355" }}>SECURE</p>
        </div>

        <div className="flex flex-col gap-1 flex-1">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => scrollTo(id)}
              className={`nav-item ${active === id ? "active" : ""}`}>
              <Icon className="w-3.5 h-3.5 flex-shrink-0" />
              {label}
            </button>
          ))}
        </div>

        <div className="space-y-3 px-2">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: "#22c55e" }} />
            <span className="font-tech text-xs font-bold" style={{ color: "#22c55e55" }}>SYSTÈME ACTIF</span>
          </div>
          <div className="h-px w-full" style={{ background: "#111" }} />
          <div className="flex items-center gap-2">
            <a href="https://wa.me/+224669288332" target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 text-xs font-tech transition-all" style={{ color: "#25d36644" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#25d366")}
              onMouseLeave={e => (e.currentTarget.style.color = "#25d36644")}>
              <SiWhatsapp className="w-3.5 h-3.5" /> WA
            </a>
            <a href="https://t.me/Varnox_Or_novark" target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 text-xs font-tech transition-all" style={{ color: "#229ED944" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#229ED9")}
              onMouseLeave={e => (e.currentTarget.style.color = "#229ED944")}>
              <SiTelegram className="w-3.5 h-3.5" /> TG
            </a>
          </div>
        </div>
      </nav>

      {/* ═══ MOBILE TOP BAR ═══ */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-14 lg:hidden"
        style={{ background: "#040404cc", backdropFilter: "blur(12px)", borderBottom: "1px solid #0a0a0a" }}>
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4" style={{ color: "#00e5ff" }} />
          <span className="font-display text-lg tracking-widest" style={{ color: "#00e5ff" }}>TRACK</span>
          <span className="font-display text-lg tracking-widest" style={{ color: "#ff2323" }}>_X</span>
          <span className="font-tech text-xs tracking-widest ml-0.5" style={{ color: "#ff232355" }}>SECURE</span>
        </div>
        <button onClick={() => setMenuOpen(o => !o)}
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ border: "1px solid #111", color: "#555" }}>
          {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </header>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 pt-14 lg:hidden flex flex-col"
          style={{ background: "#040404f0", backdropFilter: "blur(20px)" }}>
          <div className="flex flex-col items-center justify-center gap-3 flex-1">
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => { scrollTo(id); setMenuOpen(false); }}
                className="flex items-center gap-3 px-8 py-3.5 rounded-lg w-64 transition-all font-tech text-sm font-bold tracking-wider uppercase"
                style={{
                  border: active === id ? "1px solid #00e5ff30" : "1px solid #111",
                  color: active === id ? "#00e5ff" : "#444",
                  background: active === id ? "#00e5ff08" : "transparent",
                }}>
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ═══ MAIN CONTENT ═══ */}
      <div className="lg:ml-56">

        {/* ── HERO ── */}
        <section id="hero" className="relative min-h-screen flex items-center py-24 px-4 overflow-hidden">
          {/* Scan line effect */}
          <div className="scan-line-anim pointer-events-none" style={{
            position: "absolute", left: 0, right: 0, height: 1,
            background: "linear-gradient(90deg, transparent, #00e5ff44, transparent)",
          }} />

          <div className="max-w-3xl mx-auto w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              {/* Text */}
              <div className="order-2 md:order-1">
                <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full badge-pulse"
                  style={{ border: "1px solid #ff232340", background: "#ff23230a" }}>
                  <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: "#ff2323" }} />
                  <span className="font-tech text-xs font-bold tracking-widest uppercase" style={{ color: "#ff4444" }}>
                    SYSTÈME ACTIF — VARNOX PRIME OFFICIAL
                  </span>
                </div>

                <h1 className="section-title mb-2 leading-none"
                  style={{ fontSize: "clamp(4rem, 12vw, 7rem)" }}>
                  <span style={{
                    background: "linear-gradient(135deg, #ff0000 0%, #ff3333 35%, #ff6666 65%, #ff1111 100%)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                    filter: "drop-shadow(0 0 20px #ff232355)",
                  }}>TRACK_X</span>
                </h1>
                <h2 className="font-tech font-bold tracking-[0.5em] mb-6" style={{ fontSize: "1.2rem", color: "#00e5ff", textShadow: "0 0 20px #00e5ff44" }}>
                  SECURE
                </h2>
                <p className="font-sans text-base leading-relaxed mb-4" style={{ color: "#555", fontWeight: 400 }}>
                  Plateforme de géolocalisation professionnelle et instantanée. Système complet de niveau militaire.
                </p>
                <p className="font-mono text-xs mb-8" style={{ color: "#333" }}>
                  Ville · Pays · ISP · ASN · GPS · Wi-Fi · Cell Tower · Détection VPN/Proxy
                </p>

                <div className="flex flex-wrap gap-3 mb-8">
                  {[
                    { icon: Zap, label: "< 5 secondes", sub: "Résultat" },
                    { icon: Lock, label: "TLS 1.3", sub: "Chiffrement" },
                    { icon: Eye, label: "Zero-Log", sub: "Anonymat" },
                  ].map(({ icon: Icon, label, sub }) => (
                    <div key={label} className="flex items-center gap-2 px-3 py-2 rounded-lg"
                      style={{ border: "1px solid #111", background: "#060606" }}>
                      <Icon className="w-3.5 h-3.5" style={{ color: "#00e5ff55" }} />
                      <div>
                        <p className="font-tech text-xs font-bold" style={{ color: "#888" }}>{label}</p>
                        <p className="font-mono text-xs" style={{ color: "#333" }}>{sub}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3">
                  <button onClick={() => scrollTo("ip")} className="btn-cyan">
                    <Globe className="w-3.5 h-3.5" /> Localisation IP <ChevronRight className="w-3 h-3" />
                  </button>
                  <button onClick={() => scrollTo("whatsapp")} className="btn-green">
                    <Shield className="w-3.5 h-3.5" /> Check WhatsApp Ban
                  </button>
                </div>
              </div>

              {/* Radar */}
              <div className="order-1 md:order-2 flex items-center justify-center">
                <RadarHero />
              </div>
            </div>

            {/* Stats bar */}
            <div className="mt-16 grid grid-cols-4 gap-0 rounded-xl overflow-hidden"
              style={{ border: "1px solid #0a0a0a" }}>
              {[
                { val: "2M+", label: "Localisations" },
                { val: "±3m", label: "Précision GPS" },
                { val: "99.8%", label: "Taux succès" },
                { val: "24/7", label: "Disponibilité" },
              ].map(({ val, label }, i) => (
                <div key={label} className="text-center py-5 px-4"
                  style={{ background: "#060606", borderRight: i < 3 ? "1px solid #0a0a0a" : "none" }}>
                  <p className="font-display text-3xl mb-1" style={{ color: "#00e5ff", textShadow: "0 0 20px #00e5ff33" }}>{val}</p>
                  <p className="font-mono text-xs uppercase tracking-widest" style={{ color: "#333" }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── MODULE 01 : IP TRACKER ── */}
        <Section id="ip" accent="cyan">
          <SectionHeader
            num="// MODULE_01" tag="Géolocalisation Réseau" accent="cyan"
            title="TRAÇAGE PAR ADRESSE IP"
            subtitle="Localisation réseau en temps réel via interrogation WHOIS, base MaxMind GeoIP2 et tables de routage BGP. Résultat précis à la ville/région avec détection VPN et proxy automatique."
          />
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #00e5ff15", background: "#060606" }}>
            <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent, #00e5ff50, transparent)" }} />
            <div className="p-6 md:p-8"><IpTracker /></div>
          </div>
        </Section>

        {/* ── MODULE 02 : EMAIL TRACKER ── */}
        <Section id="email" accent="red">
          <SectionHeader
            num="// MODULE_02" tag="Localisation Google" accent="red"
            title="TRACKING VIA GMAIL"
            subtitle="Accès au service Find My Device via protocole OAuth2. Triangulation GPS multi-satellites combinée aux données Wi-Fi et Cell Tower. Précision de ±2 à 10 mètres en temps réel."
          />
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #ff232315", background: "#060606" }}>
            <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent, #ff232350, transparent)" }} />
            <div className="p-6 md:p-8"><EmailTracker /></div>
          </div>
        </Section>

        {/* ── MODULE 03 : WHATSAPP CHECKER ── */}
        <Section id="whatsapp" accent="green">
          <SectionHeader
            num="// MODULE_03" tag="Vérification WhatsApp" accent="green"
            title="WHATSAPP BAN CHECKER"
            subtitle="Vérification instantanée du statut d'un numéro WhatsApp. Validation format E.164 international, analyse du compte via protocoles Business API. Résultat : Actif, Banni ou Inactif."
          />
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #25d36615", background: "#060606" }}>
            <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent, #25d36650, transparent)" }} />
            <div className="p-6 md:p-8"><WhatsappChecker /></div>
          </div>
        </Section>

        {/* ── MODULE 04 : AI ASSISTANT ── */}
        <Section id="ai" accent="cyan">
          <SectionHeader
            num="// MODULE_04" tag="Intelligence Artificielle" accent="cyan"
            title="ASSISTANT IA VARNOX"
            subtitle="Interface conversationnelle vocale et textuelle. Chat en temps réel avec l'IA VARNOX intégrée à TRACK_X SECURE. Réponses instantanées sur la localisation, la cybersécurité et les outils du système."
          />
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #00e5ff15", background: "#060606" }}>
            <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent, #00e5ff50, transparent)" }} />
            <div className="p-6 md:p-8"><AiAssistant /></div>
          </div>
        </Section>

        {/* ── FOOTER ── */}
        <footer className="py-12 px-4" style={{ borderTop: "1px solid #0a0a0a" }}>
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-display text-2xl tracking-widest" style={{ color: "#00e5ff" }}>TRACK</span>
                  <span className="font-display text-2xl tracking-widest" style={{ color: "#ff2323" }}>_X</span>
                  <span className="font-tech text-sm tracking-[0.3em] ml-1" style={{ color: "#ff232533" }}>SECURE</span>
                </div>
                <p className="font-mono text-xs" style={{ color: "#222" }}>
                  ©2026 TRACK_X — powered by <span style={{ color: "#00e5ff33" }}>Varnox•Prime</span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <a href="https://wa.me/+224669288332" target="_blank" rel="noreferrer"
                  className="btn-green py-2 px-4 text-xs no-underline" style={{ fontSize: "10px" }}>
                  <SiWhatsapp className="w-3.5 h-3.5" /> WhatsApp
                </a>
                <a href="https://t.me/Varnox_Or_novark" target="_blank" rel="noreferrer"
                  className="btn-cyan py-2 px-4 text-xs no-underline"
                  style={{ fontSize: "10px", borderColor: "#229ED940", color: "#229ED9", background: "#229ED908" }}>
                  <SiTelegram className="w-3.5 h-3.5" /> Telegram
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
