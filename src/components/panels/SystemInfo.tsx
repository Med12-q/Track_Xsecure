import { useState, useEffect } from "react";
import { Monitor, Cpu, Wifi, Battery, Globe, Fingerprint } from "lucide-react";

interface SystemData {
  browser: string; browserVersion: string; os: string;
  screen: string; viewport: string; colorDepth: string;
  language: string; timezone: string; cookiesEnabled: boolean;
  doNotTrack: boolean; gpu: string; cores: number;
  memory: string; connection: string; connectionSpeed: string;
  touchPoints: number; battery: string; batteryCharging: boolean;
  fingerprint: string; webrtcLeak: string;
}

function detectBrowser(ua: string): { name: string; version: string } {
  if (ua.includes("Edg/")) { const v = ua.match(/Edg\/([\d.]+)/)?.[1] || ""; return { name: "Microsoft Edge", version: v }; }
  if (ua.includes("OPR/") || ua.includes("Opera")) { const v = ua.match(/OPR\/([\d.]+)/)?.[1] || ""; return { name: "Opera", version: v }; }
  if (ua.includes("Firefox/")) { const v = ua.match(/Firefox\/([\d.]+)/)?.[1] || ""; return { name: "Firefox", version: v }; }
  if (ua.includes("Chrome/")) { const v = ua.match(/Chrome\/([\d.]+)/)?.[1] || ""; return { name: "Chrome", version: v }; }
  if (ua.includes("Safari/")) { const v = ua.match(/Version\/([\d.]+)/)?.[1] || ""; return { name: "Safari", version: v }; }
  return { name: "Unknown", version: "—" };
}

function detectOS(ua: string): string {
  if (ua.includes("Windows NT 10.0")) return ua.includes("Win64") ? "Windows 11/10 x64" : "Windows 10";
  if (ua.includes("Windows NT 6.1")) return "Windows 7";
  if (ua.includes("Windows")) return "Windows";
  if (ua.includes("iPhone")) return "iOS (iPhone)";
  if (ua.includes("iPad")) return "iPadOS";
  if (ua.includes("Android")) { const v = ua.match(/Android ([\d.]+)/)?.[1] || ""; return `Android ${v}`; }
  if (ua.includes("Mac OS X")) { const v = ua.match(/Mac OS X ([\d_]+)/)?.[1]?.replace(/_/g, ".") || ""; return `macOS ${v}`; }
  if (ua.includes("Linux")) return "Linux";
  return "Unknown OS";
}

function getGPU(): string {
  try {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl") || c.getContext("experimental-webgl") as WebGLRenderingContext | null;
    if (!gl) return "Non disponible";
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    if (!ext) return "WebGL (masqué)";
    return gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || "Unknown GPU";
  } catch { return "Non disponible"; }
}

function getFingerprint(): string {
  try {
    const c = document.createElement("canvas");
    const ctx = c.getContext("2d")!;
    ctx.textBaseline = "alphabetic"; ctx.font = "bold 14px 'Orbitron', Arial";
    ctx.fillStyle = "#00e5ff"; ctx.fillText("TRACK_X_FP_2026", 4, 18);
    ctx.fillStyle = "#ff0033"; ctx.fillRect(60, 4, 12, 12);
    return c.toDataURL().split("").reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0)
      .toString(16).replace("-", "").toUpperCase().padStart(8, "0").slice(-8);
  } catch { return "N/A"; }
}

function getConnectionInfo(): { type: string; speed: string } {
  const nav = navigator as any;
  const conn = nav.connection || nav.mozConnection || nav.webkitConnection;
  if (!conn) return { type: "Non détecté", speed: "—" };
  const typeMap: Record<string, string> = { "4g": "4G/LTE", "5g": "5G NR", "3g": "3G", "2g": "2G", "wifi": "Wi-Fi", "ethernet": "Ethernet", "bluetooth": "Bluetooth", "none": "Aucune" };
  const type = typeMap[conn.effectiveType || conn.type] || conn.effectiveType || conn.type || "—";
  const speed = conn.downlink ? `${conn.downlink} Mbps` : "—";
  return { type, speed };
}

export function SystemInfo() {
  const [data, setData] = useState<SystemData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ua = navigator.userAgent;
    const { name: browser, version: browserVersion } = detectBrowser(ua);
    const os = detectOS(ua);
    const gpu = getGPU();
    const fingerprint = getFingerprint();
    const conn = getConnectionInfo();
    const nav = navigator as any;

    const base: SystemData = {
      browser, browserVersion, os,
      screen: `${screen.width}×${screen.height}`,
      viewport: `${window.innerWidth}×${window.innerHeight}`,
      colorDepth: `${screen.colorDepth}-bit`,
      language: navigator.language || "—",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      cookiesEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack === "1",
      gpu, cores: navigator.hardwareConcurrency || 0,
      memory: nav.deviceMemory ? `${nav.deviceMemory} GB` : "Non divulgué",
      connection: conn.type, connectionSpeed: conn.speed,
      touchPoints: navigator.maxTouchPoints || 0,
      battery: "Détection...", batteryCharging: false,
      fingerprint, webrtcLeak: "Analyse...",
    };
    setData(base);

    // Battery API
    if (nav.getBattery) {
      nav.getBattery().then((b: any) => {
        setData(d => d ? { ...d, battery: `${Math.round(b.level * 100)}%`, batteryCharging: b.charging } : d);
      }).catch(() => setData(d => d ? { ...d, battery: "Non disponible" } : d));
    } else {
      setData(d => d ? { ...d, battery: "Non supporté" } : d);
    }

    // WebRTC leak
    try {
      const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
      pc.createDataChannel(""); pc.createOffer().then(o => pc.setLocalDescription(o));
      const found = new Set<string>();
      pc.onicecandidate = e => {
        if (!e.candidate) {
          setData(d => d ? { ...d, webrtcLeak: found.size > 0 ? [...found].join(", ") : "Aucune fuite" } : d);
          pc.close(); return;
        }
        const match = /([0-9]{1,3}\.){3}[0-9]{1,3}/.exec(e.candidate.candidate);
        if (match && !match[0].startsWith("0.")) found.add(match[0]);
      };
      setTimeout(() => {
        setData(d => d ? { ...d, webrtcLeak: found.size > 0 ? [...found].join(", ") : "Aucune fuite" } : d);
        try { pc.close(); } catch {}
      }, 3000);
    } catch { setData(d => d ? { ...d, webrtcLeak: "Non supporté" } : d); }

    setLoading(false);
  }, []);

  const rows = data ? [
    { k: "Navigateur", v: `${data.browser} ${data.browserVersion}`, icon: Globe },
    { k: "Système d'exploitation", v: data.os, icon: Monitor },
    { k: "Résolution écran", v: data.screen, icon: Monitor },
    { k: "Viewport", v: data.viewport, icon: Monitor },
    { k: "Profondeur couleurs", v: data.colorDepth, icon: Monitor },
    { k: "Langue", v: data.language, icon: Globe },
    { k: "Fuseau horaire", v: data.timezone, icon: Globe },
    { k: "Cookies", v: data.cookiesEnabled ? "Activés" : "Désactivés", icon: Globe, green: data.cookiesEnabled },
    { k: "Do Not Track", v: data.doNotTrack ? "Activé" : "Désactivé", icon: Globe },
    { k: "GPU / Renderer", v: data.gpu, icon: Cpu },
    { k: "Cœurs CPU", v: String(data.cores), icon: Cpu, mono: true },
    { k: "Mémoire RAM", v: data.memory, icon: Cpu },
    { k: "Connexion", v: data.connection, icon: Wifi },
    { k: "Débit estimé", v: data.connectionSpeed, icon: Wifi },
    { k: "Points tactiles", v: String(data.touchPoints), icon: Monitor, mono: true },
    { k: "Batterie", v: `${data.battery}${data.batteryCharging ? " ⚡" : ""}`, icon: Battery },
    { k: "Empreinte canvas", v: data.fingerprint, icon: Fingerprint, cyan: true, mono: true },
    { k: "Fuite WebRTC", v: data.webrtcLeak, icon: Wifi, red: data.webrtcLeak !== "Aucune fuite" && data.webrtcLeak !== "Analyse..." && data.webrtcLeak !== "Non supporté" },
  ] : [];

  return (
    <div>
      {loading && (
        <div className="flex items-center gap-2 p-4" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "'JetBrains Mono'", fontSize: "11px" }}>
          <div className="w-2 h-2 rounded-full" style={{ background: "#00e5ff", animation: "pulse-dot 1s ease-in-out infinite" }} />
          Collecte des données système...
        </div>
      )}
      {rows.map(({ k, v, cyan, red, green, mono }) => (
        <div key={k} className="data-row">
          <span className="data-k">{k}</span>
          <span className={`data-v${cyan ? "-cyan" : red ? "-red" : green ? "-green" : ""}`}
            style={mono ? { fontFamily: "'JetBrains Mono'", letterSpacing: "0.05em" } : undefined}
            title={v}>{v}</span>
        </div>
      ))}
    </div>
  );
}
