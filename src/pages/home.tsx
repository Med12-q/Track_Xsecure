import { useState, useEffect, useRef, useCallback } from "react";
import { IpTracker, type IpResult } from "@/components/ip-tracker";
import { MapComponent } from "@/components/map";
import { AiAssistant } from "@/components/ai-assistant";
import { LiveClock } from "@/components/panels/LiveClock";
import { ThreatMeter, getThreatLevel } from "@/components/panels/ThreatMeter";
import { SystemInfo } from "@/components/panels/SystemInfo";
import { LocationHistory, getHistory, type HistoryEntry } from "@/components/panels/LocationHistory";
import { SiTelegram, SiWhatsapp } from "react-icons/si";
import {
  Target, Globe, Monitor, History, MessageSquare, Info,
  Menu, X, Activity, Shield, Radio, Wifi, ChevronRight,
  Server, Zap, Lock, Database, Cpu, MapPin
} from "lucide-react";

/* ══ RADAR CANVAS ══ */
function RadarMini() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    let angle = 0, raf: number;
    const dots: { x: number; y: number; age: number; max: number }[] = [];
    const draw = () => {
      const W = c.width, H = c.height, cx = W / 2, cy = H / 2, R = Math.min(W, H) * 0.45;
      ctx.clearRect(0, 0, W, H);
      [1, 0.7, 0.42].forEach(f => {
        ctx.beginPath(); ctx.arc(cx, cy, R * f, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(139,0,0,${0.08 + f * 0.05})`; ctx.lineWidth = 1; ctx.stroke();
      });
      [0, Math.PI / 2].forEach(a => {
        ctx.beginPath(); ctx.moveTo(cx + R * Math.cos(a), cy + R * Math.sin(a)); ctx.lineTo(cx - R * Math.cos(a), cy - R * Math.sin(a));
        ctx.strokeStyle = "rgba(0,229,255,0.06)"; ctx.lineWidth = 0.5; ctx.stroke();
      });
      try {
        const sg = ctx.createConicGradient(angle, cx, cy);
        sg.addColorStop(0, "rgba(0,229,255,0.14)"); sg.addColorStop(0.18, "rgba(0,229,255,0.02)");
        sg.addColorStop(0.19, "transparent"); sg.addColorStop(1, "transparent");
        ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fillStyle = sg; ctx.fill();
      } catch {}
      const ex = cx + R * Math.cos(angle), ey = cy + R * Math.sin(angle);
      const lg = ctx.createLinearGradient(cx, cy, ex, ey);
      lg.addColorStop(0, "rgba(0,229,255,0.9)"); lg.addColorStop(1, "rgba(0,229,255,0)");
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(ex, ey);
      ctx.strokeStyle = lg; ctx.lineWidth = 1.5; ctx.stroke();
      if (Math.random() < 0.035) {
        const dr = R * (0.2 + Math.random() * 0.75), da = (Math.random() - 0.5) * 0.6;
        dots.push({ x: cx + dr * Math.cos(angle + da), y: cy + dr * Math.sin(angle + da), age: 0, max: 60 + Math.random() * 70 });
      }
      dots.forEach(d => {
        d.age++; const life = 1 - d.age / d.max;
        ctx.beginPath(); ctx.arc(d.x, d.y, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,229,255,${life * 0.9})`; ctx.shadowColor = "#00e5ff"; ctx.shadowBlur = 8 * life; ctx.fill(); ctx.shadowBlur = 0;
      });
      for (let i = dots.length - 1; i >= 0; i--) if (dots[i].age >= dots[i].max) dots.splice(i, 1);
      ctx.strokeStyle = "rgba(0,229,255,0.8)"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(cx, cy, 14, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx - 20, cy); ctx.lineTo(cx + 20, cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy - 20); ctx.lineTo(cx, cy + 20); ctx.stroke();
      ctx.fillStyle = "#ff0033"; ctx.shadowColor = "#ff0033"; ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.arc(cx, cy, 2.5, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
      angle += 0.018; raf = requestAnimationFrame(draw);
    };
    const resize = () => { const s = Math.min(c.parentElement!.clientWidth, 340); c.width = s; c.height = s; };
    resize(); window.addEventListener("resize", resize); draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} style={{ maxWidth: 340, width: "100%", display: "block" }} />;
}

/* ══ PANEL WRAPPER ══ */
function Panel({ title, label, icon: Icon, accent = "cyan", children, className = "", action }: {
  title: string; label?: string; icon: any; accent?: "cyan" | "red" | "blue" | "green";
  children: React.ReactNode; className?: string; action?: React.ReactNode;
}) {
  const colors = { cyan: "#00e5ff", red: "#ff0033", blue: "#0066ff", green: "#00ff88" };
  const c = colors[accent];
  return (
    <div className={`panel panel-${accent} panel-glow-${accent} flex flex-col ${className}`}>
      <div className="panel-header flex-shrink-0">
        <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0" style={{ background: `${c}12`, border: `1px solid ${c}25` }}>
          <Icon className="w-3 h-3" style={{ color: c }} />
        </div>
        <span className="panel-label" style={{ color: `${c}88` }}>{title}</span>
        {label && (
          <span className="panel-badge" style={{ color: c, background: `${c}10`, border: `1px solid ${c}20` }}>{label}</span>
        )}
        {action && <div className="ml-auto">{action}</div>}
      </div>
      <div className="flex-1 overflow-hidden min-h-0">{children}</div>
    </div>
  );
}

/* ══ STAT CARD ══ */
function StatCard({ value, label, sub, color }: { value: string; label: string; sub?: string; color: string }) {
  return (
    <div className="panel flex flex-col items-center justify-center p-4 text-center" style={{ minHeight: 80 }}>
      <div style={{ fontFamily: "'Bebas Neue'", fontSize: "clamp(1.6rem,3vw,2.2rem)", color, letterSpacing: "0.05em", textShadow: `0 0 12px ${color}55`, lineHeight: 1 }}>{value}</div>
      <div style={{ fontFamily: "'Orbitron'", fontSize: "8px", fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: "0.2em", textTransform: "uppercase", marginTop: "4px" }}>{label}</div>
      {sub && <div style={{ fontFamily: "'JetBrains Mono'", fontSize: "9px", color: "rgba(255,255,255,0.12)", marginTop: "2px" }}>{sub}</div>}
    </div>
  );
}

/* ══ AI MODAL ══ */
function AiModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => { document.body.style.overflow = open ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [open]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-6"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(16px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col"
        style={{ background: "#070707", border: "1px solid rgba(0,229,255,0.12)", boxShadow: "0 0 80px rgba(0,229,255,0.06), 0 0 160px rgba(0,0,0,0.9)", height: "min(700px, 96dvh)" }}>
        <div className="p-5 flex-1 flex flex-col overflow-hidden">
          <AiAssistant onClose={onClose} />
        </div>
      </div>
    </div>
  );
}

/* ══ NAVBAR ITEMS ══ */
const NAV = [
  { id: "tracker",   icon: Radio,       label: "Tracker" },
  { id: "system",    icon: Monitor,     label: "Système" },
  { id: "history",   icon: History,     label: "Historique" },
  { id: "about",     icon: Info,        label: "À propos" },
];

/* ══ MAIN DASHBOARD ══ */
export default function Home() {
  const [view, setView] = useState<"tracker" | "system" | "history" | "about">("tracker");
  const [aiOpen, setAiOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [ipResult, setIpResult] = useState<IpResult | null>(null);
  const [histRefresh, setHistRefresh] = useState(0);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number; label: string } | null>(null);

  // Kill Replit badge
  useEffect(() => {
    const kill = () => {
      document.querySelectorAll('[data-replit-badge],.replit-badge,#replit-badge,[class*="replit-ui-theme"]').forEach(e => e.remove());
      document.querySelectorAll('iframe,script').forEach(e => { if ((e as HTMLElement & {src:string}).src?.includes?.('replit')) e.remove(); });
    };
    kill(); const obs = new MutationObserver(kill); obs.observe(document.body, { childList: true, subtree: true });
    return () => obs.disconnect();
  }, []);

  const handleIpResult = useCallback((r: IpResult) => {
    setIpResult(r); setHistRefresh(n => n + 1);
    setMapCenter({ lat: r.lat, lng: r.lon, label: `${r.city}, ${r.country}` });
  }, []);

  const handleHistorySelect = useCallback((e: HistoryEntry) => {
    setMapCenter({ lat: e.lat, lng: e.lon, label: `${e.city}, ${e.country}` });
    setView("tracker");
  }, []);

  const historyCount = getHistory().length;

  /* ── TOP BAR ── */
  const TopBar = () => (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center h-12"
      style={{ background: "rgba(4,4,4,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>

      {/* Logo zone (same width as sidebar) */}
      <div className="flex items-center gap-2.5 px-3 w-14 flex-shrink-0">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ border: "1px solid rgba(0,229,255,0.2)", background: "rgba(0,229,255,0.06)" }}>
          <Target className="w-4 h-4" style={{ color: "#00e5ff" }} />
        </div>
      </div>

      <div className="flex-1 flex items-center gap-3 px-2 overflow-hidden">
        <div className="hidden sm:flex items-baseline gap-1">
          <span style={{ fontFamily: "'Bebas Neue'", fontSize: "18px", letterSpacing: "0.1em", color: "#00e5ff" }}>TRACK</span>
          <span style={{ fontFamily: "'Bebas Neue'", fontSize: "18px", letterSpacing: "0.1em", color: "#ff0033" }}>_X</span>
          <span style={{ fontFamily: "'Bebas Neue'", fontSize: "18px", letterSpacing: "0.1em", color: "rgba(255,255,255,0.5)", marginLeft: "3px" }}>SECURE</span>
          <span style={{ fontFamily: "'Orbitron'", fontSize: "8px", fontWeight: 700, color: "rgba(0,229,255,0.3)", marginLeft: "8px", letterSpacing: "0.2em" }}>v2.0</span>
        </div>

        {/* Status pills */}
        <div className="flex items-center gap-2 ml-2 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full flex-shrink-0"
            style={{ border: "1px solid rgba(0,255,136,0.2)", background: "rgba(0,255,136,0.06)" }}>
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 pulse-dot" style={{ background: "#00ff88" }} />
            <span style={{ fontFamily: "'Orbitron'", fontSize: "8px", fontWeight: 700, color: "#00ff88", letterSpacing: "0.15em" }}>ONLINE</span>
          </div>
          {ipResult && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full flex-shrink-0"
              style={{ border: `1px solid ${ipResult.threatColor}30`, background: `${ipResult.threatColor}08` }}>
              <Shield className="w-2.5 h-2.5 flex-shrink-0" style={{ color: ipResult.threatColor }} />
              <span style={{ fontFamily: "'Orbitron'", fontSize: "8px", fontWeight: 700, color: ipResult.threatColor, letterSpacing: "0.12em" }}>
                MENACE {ipResult.threat}
              </span>
            </div>
          )}
          {ipResult && (
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full flex-shrink-0"
              style={{ border: "1px solid rgba(0,229,255,0.15)", background: "rgba(0,229,255,0.05)" }}>
              <Globe className="w-2.5 h-2.5 flex-shrink-0" style={{ color: "#00e5ff" }} />
              <span style={{ fontFamily: "'JetBrains Mono'", fontSize: "9px", color: "#00e5ff" }}>{ipResult.ip}</span>
            </div>
          )}
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3 pr-3 flex-shrink-0">
        <LiveClock />
        <button onClick={() => setAiOpen(true)}
          className="hidden sm:flex btn-outline-cyan items-center gap-1.5"
          style={{ padding: "5px 12px", fontSize: "9px" }}>
          <Cpu className="w-3 h-3" /> VARNOX IA
        </button>
        <button className="sm:hidden w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ border: "1px solid rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.3)" }}
          onClick={() => setMobileMenu(o => !o)}>
          {mobileMenu ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );

  /* ── LEFT SIDEBAR ── */
  const Sidebar = () => (
    <aside className="fixed left-0 top-12 bottom-0 z-40 hidden sm:flex flex-col items-center py-4 gap-2 w-14"
      style={{ background: "rgba(4,4,4,0.95)", borderRight: "1px solid rgba(255,255,255,0.05)" }}>
      {NAV.map(({ id, icon: Icon, label }) => (
        <button key={id} onClick={() => setView(id as any)}
          className={`nav-icon-btn ${view === id ? "active" : ""}`}
          title={label}>
          <Icon className="w-4 h-4" />
          {view === id && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r"
              style={{ background: "#00e5ff", boxShadow: "0 0 8px #00e5ff" }} />
          )}
        </button>
      ))}
      <div className="mt-auto flex flex-col gap-2">
        <button onClick={() => setAiOpen(true)} className="nav-icon-btn" title="Assistant IA VARNOX">
          <MessageSquare className="w-4 h-4" />
        </button>
        <a href="https://wa.me/+224669288332" target="_blank" rel="noreferrer" className="nav-icon-btn" title="WhatsApp">
          <SiWhatsapp className="w-4 h-4" style={{ color: "rgba(37,211,102,0.4)" }} />
        </a>
        <a href="https://t.me/Varnox_Or_novark" target="_blank" rel="noreferrer" className="nav-icon-btn" title="Telegram">
          <SiTelegram className="w-4 h-4" style={{ color: "rgba(34,158,217,0.4)" }} />
        </a>
      </div>
    </aside>
  );

  /* ── MOBILE MENU ── */
  const MobileMenu = () => mobileMenu ? (
    <div className="fixed inset-0 z-[150] pt-12 sm:hidden" style={{ background: "rgba(4,4,4,0.97)", backdropFilter: "blur(20px)" }}>
      <div className="flex flex-col items-center gap-3 pt-8">
        {NAV.map(({ id, icon: Icon, label }) => (
          <button key={id} onClick={() => { setView(id as any); setMobileMenu(false); }}
            className="flex items-center gap-3 w-64 px-6 py-3.5 rounded-xl transition-all"
            style={{ border: view === id ? "1px solid rgba(0,229,255,0.3)" : "1px solid rgba(255,255,255,0.06)", color: view === id ? "#00e5ff" : "rgba(255,255,255,0.3)", background: view === id ? "rgba(0,229,255,0.08)" : "transparent", fontFamily: "'Orbitron'", fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            <Icon className="w-4 h-4" />{label}
          </button>
        ))}
        <button onClick={() => { setAiOpen(true); setMobileMenu(false); }}
          className="flex items-center gap-3 w-64 px-6 py-3.5 rounded-xl transition-all mt-2"
          style={{ border: "1px solid rgba(0,229,255,0.2)", color: "#00e5ff", background: "rgba(0,229,255,0.08)", fontFamily: "'Orbitron'", fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
          <Cpu className="w-4 h-4" /> VARNOX IA
        </button>
      </div>
    </div>
  ) : null;

  /* ── TRACKER VIEW ── */
  const TrackerView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 h-full">
      {/* Left col */}
      <div className="flex flex-col gap-3">
        {/* Hero+Tracker merged */}
        <Panel title="GÉOLOCALISATION IP" label="LIVE" icon={Radio} accent="cyan">
          {/* Mini hero inside panel */}
          <div className="flex items-center gap-4 px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", background: "linear-gradient(90deg, rgba(0,229,255,0.02), transparent)" }}>
            <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
              <RadarMini />
            </div>
            <div className="min-w-0">
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: "clamp(1.5rem,4vw,2rem)", letterSpacing: "0.08em", lineHeight: 1 }}>
                <span style={{ color: "#ff0033", textShadow: "0 0 16px rgba(255,0,51,0.5)" }}>TRACK</span>
                <span style={{ color: "#ff0033", textShadow: "0 0 16px rgba(255,0,51,0.5)" }}>_X</span>
                <span style={{ color: "rgba(255,255,255,0.6)", marginLeft: "6px" }}>SECURE</span>
              </div>
              <div style={{ fontFamily: "'Orbitron'", fontSize: "9px", fontWeight: 700, color: "rgba(0,229,255,0.5)", letterSpacing: "0.35em", marginTop: "2px" }}>PLATEFORME DE GÉOLOCALISATION AVANCÉE</div>
            </div>
            <div className="ml-auto flex items-center gap-1.5 flex-shrink-0 px-2.5 py-1.5 rounded-full"
              style={{ border: "1px solid rgba(255,0,51,0.3)", background: "rgba(255,0,51,0.06)", animation: "badge-glow 2.5s ease-in-out infinite" }}>
              <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: "#ff0033" }} />
              <span style={{ fontFamily: "'Orbitron'", fontSize: "7px", fontWeight: 700, color: "#ff4455", letterSpacing: "0.1em" }}>ACTIF</span>
            </div>
          </div>
          <div className="p-4 overflow-y-auto">
            <IpTracker onResult={handleIpResult} />
          </div>
        </Panel>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3 flex-shrink-0">
          <StatCard value="ip-api" label="Source API" color="#00e5ff" />
          <StatCard value={historyCount > 0 ? String(historyCount) : "0"} label="Localisations" color="#0088ff" />
          <StatCard value="TLS" label="Chiffrement" sub="1.3" color="#00ff88" />
          <StatCard value="<5s" label="Temps réel" color="#ffcc00" />
        </div>

        {/* Result detail (if any) */}
        {ipResult && (
          <Panel title="ANALYSE RÉSEAU" label="RÉSULTAT" icon={Activity} accent="blue">
            <div className="overflow-y-auto">
              {[
                { k: "ISP / Opérateur", v: ipResult.isp },
                { k: "Organisation", v: ipResult.org },
                { k: "ASN", v: ipResult.as },
                { k: "Reverse DNS", v: ipResult.reverse },
                { k: "Fuseau horaire", v: ipResult.timezone },
                { k: "Mobile / CGNAT", v: ipResult.mobile ? "Oui" : "Non" },
                { k: "Proxy / VPN", v: ipResult.proxy ? "⚠ DÉTECTÉ" : "Non détecté", red: ipResult.proxy, green: !ipResult.proxy },
                { k: "Hébergeur / DC", v: ipResult.hosting ? "⚠ Oui" : "Non", red: ipResult.hosting },
              ].map(({ k, v, red, green }) => (
                <div key={k} className="data-row">
                  <span className="data-k">{k}</span>
                  <span className={`data-v${red ? "-red" : green ? "-green" : ""}`} title={v}>{v}</span>
                </div>
              ))}
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                <ThreatMeter level={ipResult.threat} />
              </div>
            </div>
          </Panel>
        )}
      </div>

      {/* Right col — MAP */}
      <div className="flex flex-col gap-3">
        <Panel title="CARTE INTERACTIVE" label="LIVE GPS" icon={MapPin} accent="cyan" className="flex-1" style={{ minHeight: 400 } as any}>
          {mapCenter ? (
            <div className="h-full" style={{ minHeight: 380 }}>
              <MapComponent lat={mapCenter.lat} lng={mapCenter.lng} zoom={11} label={mapCenter.label} className="h-full w-full" />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-4 py-16">
              <div className="w-20 h-20 flex items-center justify-center">
                <RadarMini />
              </div>
              <div className="text-center">
                <p style={{ fontFamily: "'Orbitron'", fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.15)", letterSpacing: "0.2em", textTransform: "uppercase" }}>
                  EN ATTENTE DE CIBLE
                </p>
                <p style={{ fontFamily: "'JetBrains Mono'", fontSize: "10px", color: "rgba(255,255,255,0.08)", marginTop: "6px" }}>
                  Lancez une localisation pour afficher la carte
                </p>
              </div>
            </div>
          )}
        </Panel>

        {/* History preview */}
        <Panel title="HISTORIQUE" label={`${historyCount} ENTRÉES`} icon={History} accent="blue"
          action={
            <button className="btn-outline-cyan" style={{ padding: "3px 8px", fontSize: "8px" }}
              onClick={() => setView("history")}>
              VOIR TOUT <ChevronRight className="w-2.5 h-2.5" />
            </button>
          }>
          <div style={{ maxHeight: 180 }}>
            <LocationHistory refreshKey={histRefresh} onSelect={handleHistorySelect} />
          </div>
        </Panel>
      </div>
    </div>
  );

  /* ── SYSTEM VIEW ── */
  const SystemView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <Panel title="FINGERPRINTING SYSTÈME" label="AUTO-DÉTECTÉ" icon={Monitor} accent="blue">
        <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 200px)" }}>
          <SystemInfo />
        </div>
      </Panel>
      <div className="flex flex-col gap-3">
        <Panel title="THREAT ASSESSMENT" label="TEMPS RÉEL" icon={Shield} accent="red">
          {ipResult ? (
            <div>
              <ThreatMeter level={ipResult.threat} />
              <div style={{ padding: "0 14px 10px" }}>
                <div className="data-row"><span className="data-k">IP analysée</span><span className="data-v-cyan">{ipResult.ip}</span></div>
                <div className="data-row"><span className="data-k">Localisation</span><span className="data-v">{ipResult.city}, {ipResult.country}</span></div>
                <div className="data-row"><span className="data-k">ISP</span><span className="data-v">{ipResult.isp}</span></div>
                <div className="data-row"><span className="data-k">Proxy/VPN</span><span className={`data-v-${ipResult.proxy ? "red" : "green"}`}>{ipResult.proxy ? "DÉTECTÉ" : "Non"}</span></div>
                <div className="data-row"><span className="data-k">Hébergeur</span><span className={`data-v-${ipResult.hosting ? "red" : "green"}`}>{ipResult.hosting ? "OUI" : "Non"}</span></div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <Shield className="w-8 h-8" style={{ color: "rgba(255,0,51,0.15)" }} />
              <p style={{ fontFamily: "'JetBrains Mono'", fontSize: "11px", color: "rgba(255,255,255,0.15)" }}>Aucune IP analysée</p>
              <button className="btn-outline-cyan mt-2" style={{ fontSize: "8px" }} onClick={() => setView("tracker")}>
                <Radio className="w-2.5 h-2.5" /> LANCER LE TRACKER
              </button>
            </div>
          )}
        </Panel>

        <Panel title="INFRASTRUCTURE" label="SÉCURITÉ" icon={Server} accent="cyan">
          <div>
            {[
              { k: "Chiffrement", v: "TLS 1.3 / AES-256", green: true },
              { k: "Architecture", v: "Zero-Knowledge", green: true },
              { k: "Stockage données", v: "LocalStorage uniquement", green: true },
              { k: "Conformité", v: "RGPD / Privacy First", green: true },
              { k: "API primaire", v: "ip-api.com (real-time)", cyan: true },
              { k: "Cartographie", v: "CartoDB Dark + Leaflet", cyan: true },
              { k: "Fingerprinting", v: "Web APIs natives", cyan: true },
              { k: "Temps de réponse", v: "< 2 secondes", cyan: true },
            ].map(({ k, v, green, cyan }) => (
              <div key={k} className="data-row">
                <span className="data-k">{k}</span>
                <span className={`data-v${green ? "-green" : cyan ? "-cyan" : ""}`}>{v}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );

  /* ── HISTORY VIEW ── */
  const HistoryView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
      <div className="lg:col-span-2">
        <Panel title="JOURNAL DE LOCALISATION" label={`${historyCount} / 30 ENTRÉES`} icon={History} accent="blue" className="h-full">
          <div style={{ height: "calc(100vh - 200px)" }}>
            <LocationHistory refreshKey={histRefresh} onSelect={handleHistorySelect} />
          </div>
        </Panel>
      </div>
      <div className="flex flex-col gap-3">
        {mapCenter ? (
          <Panel title="DERNIÈRE POSITION" icon={MapPin} accent="cyan" className="flex-1">
            <div style={{ height: 300 }}>
              <MapComponent lat={mapCenter.lat} lng={mapCenter.lng} zoom={10} label={mapCenter.label} className="h-full w-full" />
            </div>
            <div className="px-4 py-2" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
              <div className="data-row"><span className="data-k">Ville</span><span className="data-v-cyan">{mapCenter.label}</span></div>
              {ipResult && <div className="data-row"><span className="data-k">Coords</span><span className="data-v">{ipResult.lat.toFixed(4)}, {ipResult.lon.toFixed(4)}</span></div>}
            </div>
          </Panel>
        ) : (
          <Panel title="DERNIÈRE POSITION" icon={MapPin} accent="cyan">
            <div className="flex items-center justify-center py-12">
              <p style={{ fontFamily: "'JetBrains Mono'", fontSize: "11px", color: "rgba(255,255,255,0.15)" }}>Aucune position</p>
            </div>
          </Panel>
        )}
        <Panel title="STATISTIQUES" icon={Activity} accent="green">
          <div>
            <div className="data-row"><span className="data-k">Total entrées</span><span className="data-v-cyan">{historyCount}</span></div>
            <div className="data-row"><span className="data-k">Capacité</span><span className="data-v">30 entrées max</span></div>
            <div className="data-row"><span className="data-k">Stockage</span><span className="data-v-green">LocalStorage</span></div>
            <div className="data-row"><span className="data-k">Export</span><span className="data-v-cyan">CSV disponible</span></div>
          </div>
        </Panel>
      </div>
    </div>
  );

  /* ── ABOUT VIEW ── */
  const AboutView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      <div className="lg:col-span-2 flex flex-col gap-3">
        <Panel title="À PROPOS DE TRACK_X SECURE" icon={Info} accent="cyan">
          <div className="p-5">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ border: "1px solid rgba(0,229,255,0.2)", background: "rgba(0,229,255,0.06)" }}>
                <Target className="w-7 h-7" style={{ color: "#00e5ff" }} />
              </div>
              <div>
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: "2rem", letterSpacing: "0.08em", lineHeight: 1 }}>
                  <span style={{ color: "#ff0033" }}>TRACK_X</span>
                  <span style={{ color: "rgba(255,255,255,0.5)", marginLeft: "8px" }}>SECURE</span>
                </div>
                <div style={{ fontFamily: "'Orbitron'", fontSize: "9px", fontWeight: 700, color: "rgba(0,229,255,0.5)", letterSpacing: "0.25em", marginTop: "2px" }}>v2.0 — GÉOLOCALISATION AVANCÉE</div>
              </div>
            </div>
            <p style={{ fontFamily: "'Rajdhani'", fontSize: "15px", color: "rgba(255,255,255,0.4)", lineHeight: 1.7, marginBottom: "16px" }}>
              Plateforme SaaS professionnelle de géolocalisation et d'analyse réseau développée par ∇ΔΓΗΘΞ ϷΓΙΜΝΝΝΝ ΤΝCϮ ΘFFΙCΙΔL. Architecture zero-knowledge, données temps réel, fingerprinting système avancé.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Globe, label: "Géolocalisation IP", desc: "MaxMind GeoIP2 + ip-api.com" },
                { icon: Monitor, label: "Fingerprinting", desc: "Browser, OS, GPU, WebRTC" },
                { icon: Database, label: "Historique local", desc: "30 entrées — Export CSV" },
                { icon: Lock, label: "Zero-Knowledge", desc: "Aucune donnée stockée serveur" },
                { icon: Cpu, label: "IA VARNOX", desc: "Assistant vocal & textuel" },
                { icon: Zap, label: "Temps réel", desc: "< 2s de réponse garantie" },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="flex items-start gap-3 p-3 rounded-lg" style={{ border: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)" }}>
                  <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#00e5ff55" }} />
                  <div>
                    <p style={{ fontFamily: "'Orbitron'", fontSize: "9px", fontWeight: 700, color: "rgba(255,255,255,0.6)", letterSpacing: "0.08em" }}>{label}</p>
                    <p style={{ fontFamily: "'JetBrains Mono'", fontSize: "9px", color: "rgba(255,255,255,0.2)", marginTop: "2px" }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Panel>

        <Panel title="AVERTISSEMENT LÉGAL" icon={Shield} accent="red">
          <div className="p-5">
            <p style={{ fontFamily: "'JetBrains Mono'", fontSize: "11px", color: "rgba(255,100,100,0.5)", lineHeight: 1.8 }}>
              ⚠ La géolocalisation par IP est précise au niveau de la ville. Pour une précision GPS exacte, l'accès physique ou le consentement de l'utilisateur cible est requis. L'utilisation de cette plateforme à des fins illégales est strictement interdite. Toute utilisation engage la responsabilité exclusive de l'utilisateur. Usage légal et éthique uniquement.
            </p>
          </div>
        </Panel>
      </div>

      <div className="flex flex-col gap-3">
        <Panel title="DÉVELOPPEUR" icon={Cpu} accent="blue">
          <div className="p-5 space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center"
                style={{ border: "1px solid rgba(0,102,255,0.3)", background: "rgba(0,102,255,0.08)" }}>
                <span style={{ fontFamily: "'Orbitron'", fontSize: "20px", fontWeight: 900, color: "#0088ff" }}>∇</span>
              </div>
              <p style={{ fontFamily: "'Orbitron'", fontSize: "10px", fontWeight: 700, color: "rgba(0,102,255,0.8)", letterSpacing: "0.1em" }}>VARNOX PRIME OFFICIAL</p>
              <p style={{ fontFamily: "'JetBrains Mono'", fontSize: "9px", color: "rgba(255,255,255,0.2)", marginTop: "4px" }}>Cybersecurity Engineer · AI Architect</p>
            </div>
            <div className="space-y-2">
              <a href="https://wa.me/+224669288332" target="_blank" rel="noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg transition-all" style={{ border: "1px solid rgba(37,211,102,0.15)", background: "rgba(37,211,102,0.05)", textDecoration: "none" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(37,211,102,0.35)"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(37,211,102,0.15)"}>
                <SiWhatsapp className="w-5 h-5 flex-shrink-0" style={{ color: "#25d366" }} />
                <div>
                  <p style={{ fontFamily: "'Orbitron'", fontSize: "9px", fontWeight: 700, color: "#25d366" }}>WhatsApp</p>
                  <p style={{ fontFamily: "'JetBrains Mono'", fontSize: "9px", color: "rgba(255,255,255,0.2)" }}>+224 669 28 83 32</p>
                </div>
              </a>
              <a href="https://t.me/Varnox_Or_novark" target="_blank" rel="noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg transition-all" style={{ border: "1px solid rgba(34,158,217,0.15)", background: "rgba(34,158,217,0.05)", textDecoration: "none" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(34,158,217,0.35)"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(34,158,217,0.15)"}>
                <SiTelegram className="w-5 h-5 flex-shrink-0" style={{ color: "#229ED9" }} />
                <div>
                  <p style={{ fontFamily: "'Orbitron'", fontSize: "9px", fontWeight: 700, color: "#229ED9" }}>Telegram</p>
                  <p style={{ fontFamily: "'JetBrains Mono'", fontSize: "9px", color: "rgba(255,255,255,0.2)" }}>@Varnox_Or_novark</p>
                </div>
              </a>
            </div>
            <div className="pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              <p style={{ fontFamily: "'JetBrains Mono'", fontSize: "9px", color: "rgba(255,255,255,0.15)", textAlign: "center", lineHeight: 1.8 }}>
                ©2026 TRACK_X SECURE<br />powered by Varnox•Prime
              </p>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );

  return (
    <div className="grid-bg min-h-screen" style={{ background: "#040404" }}>
      <TopBar />
      <Sidebar />
      <MobileMenu />
      <AiModal open={aiOpen} onClose={() => setAiOpen(false)} />

      {/* Main content */}
      <main className="pt-12 sm:pl-14 min-h-screen">
        <div className="p-3 sm:p-4 min-h-[calc(100vh-48px)]">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-3 flex-shrink-0">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#00e5ff", animation: "pulse-dot 2s ease-in-out infinite" }} />
            <span style={{ fontFamily: "'Orbitron'", fontSize: "9px", fontWeight: 700, color: "rgba(255,255,255,0.15)", letterSpacing: "0.2em", textTransform: "uppercase" }}>
              TRACK_X SECURE · {NAV.find(n => n.id === view)?.label?.toUpperCase() || "TRACKER"}
            </span>
          </div>

          {view === "tracker"  && <TrackerView />}
          {view === "system"   && <SystemView />}
          {view === "history"  && <HistoryView />}
          {view === "about"    && <AboutView />}
        </div>
      </main>
    </div>
  );
}
