import { useState, useEffect, useRef, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mic, Send, Volume2, VolumeX, Bot, User, Loader2, X, Maximize2 } from "lucide-react";

declare global { interface Window { SpeechRecognition: any; webkitSpeechRecognition: any; } }

interface Msg { id: string; role: "ai" | "user"; text: string; ts: Date; }

const KNOWLEDGE: [string[], string][] = [
  [["qui t'a créé", "développeur", "who made", "créateur", "auteur", "∇", "varnox"], "Je suis VARNOX, développé par ∇ΔΓΗΘΞ ϷΓΙΜΝΝΝΝ ΤΝCϮ ΘFFΙCΙΔL — ingénieur spécialisé en cybersécurité, géolocalisation avancée et intelligence artificielle embarquée."],
  [["track_x", "ce site", "cette plateforme", "c'est quoi", "what is"], "TRACK_X SECURE est une plateforme de géolocalisation professionnelle de niveau militaire.\n\n📡 Module IP → localisation réseau réelle (MaxMind GeoIP2)\n📧 Module Gmail → tracking GPS via Find My Device\n🤖 Module IA → assistant VARNOX vocal & textuel\n\nDéveloppé par VARNOX PRIME OFFICIAL. ©2026"],
  [["localiser", "locate", "trouver", "retrouver", "comment utiliser", "mode d'emploi"], "Pour localiser :\n\n① Module IP — entrez une adresse IPv4/IPv6 ou détectez votre propre IP. Précision : ville/région.\n\n② Module Gmail — entrez l'adresse Gmail + code de vérification Google. Précision GPS : ±2-10 mètres via triangulation multi-satellites."],
  [["ip", "adresse ip", "géolocalisation ip", "ip-api"], "La géolocalisation IP interroge en temps réel :\n• Registres WHOIS (ARIN, RIPE, LACNIC, APNIC)\n• Base MaxMind GeoIP2\n• Tables de routage BGP\n\nDétection automatique : VPN, Proxy, Tor, Data Center. Résultat : ville, pays, ISP, ASN, coordonnées GPS."],
  [["gmail", "google", "email", "find my device", "oauth"], "La localisation Google utilise OAuth2 pour accéder à Find My Device.\n\nTriangulation multi-sources :\n• GPS multi-satellites (Galileo, GPS, GLONASS)\n• Triangulation Wi-Fi (±5-15m)\n• Cell Tower 5G/LTE (±50-500m)\n\nPrécision finale : ±2 à 10 mètres."],
  [["précision", "accuracy", "exactitude", "fiable"], "Précision par technologie :\n\n🛰 GPS + Wi-Fi → ±2-10 mètres\n📡 Cell Tower → ±50-500 mètres\n🌐 Géolocalisation IP → ±1-50 km\n\nTous les résultats sont actualisés en temps réel avec horodatage précis."],
  [["sécurité", "chiffrement", "sécurisé", "crypté", "privacy"], "TRACK_X SECURE utilise :\n• TLS 1.3 pour toutes les communications\n• Chiffrement AES-256 des données\n• Architecture zero-knowledge\n• Aucune donnée stockée — anonymat total\n• Conforme RGPD"],
  [["vpn", "proxy", "tor", "anonyme", "masquer"], "TRACK_X détecte automatiquement les tentatives de masquage :\n\n⚠ VPN commercial → indicateur jaune\n⚠ Proxy transparent → indicateur orange\n⚠ Nœud Tor → indicateur rouge\n\nEn cas de proxy, la localisation retournée est celle du serveur intermédiaire."],
  [["isp", "fournisseur", "opérateur", "asn"], "L'ISP (Internet Service Provider) est le fournisseur d'accès Internet associé à l'adresse IP.\n\nTRACK_X identifie également :\n• ASN (Autonomous System Number)\n• Organisation responsable\n• Plage d'adresses IP attribuée"],
  [["carte", "map", "openstreetmap", "leaflet"], "La carte interactive utilise les tuiles CartoDB Dark (OpenStreetMap) avec rendu optimisé pour le thème cyberpunk. Marqueur animé avec effet de ping en temps réel. Lien direct vers Google Maps disponible."],
  [["contact", "joindre", "whatsapp", "telegram"], "Contactez VARNOX PRIME OFFICIAL :\n📱 WhatsApp → wa.me/+224669288332\n✈ Telegram → t.me/Varnox_Or_novark"],
  [["bonjour", "salut", "hello", "bonsoir", "hi", "hey"], "Bonjour. Système VARNOX opérationnel.\n\nJe suis l'assistant IA officiel de TRACK_X SECURE. Je peux vous aider sur :\n• La géolocalisation IP et Gmail\n• La cybersécurité et les VPN\n• L'utilisation de la plateforme\n\nTapez 'aide' pour voir toutes les commandes."],
  [["merci", "thanks", "parfait", "super", "bravo", "excellent"], "Je vous en prie. TRACK_X SECURE est conçu pour être à votre service 24h/24.\n\nN'hésitez pas si vous avez d'autres questions."],
  [["aide", "help", "commandes", "que peux-tu", "que sais-tu"], "Commandes disponibles :\n\n🌐 'localiser une IP' → guide géolocalisation\n📧 'localiser gmail' → guide tracking Google\n🔒 'sécurité' → protocoles de chiffrement\n🛡 'VPN proxy' → détection d'anonymisation\n📡 'précision' → niveaux de précision\n📞 'contact' → coordonnées développeur"],
  [["fonctionnalités", "features", "modules", "capacités"], "TRACK_X SECURE — Modules disponibles :\n\n① Géolocalisation IP — traçage nœud réseau FAI\n② Tracking Gmail — GPS précis Find My Device\n③ Assistant IA VARNOX — vocal & textuel\n\nVersion 2.0 · ©2026 VARNOX PRIME OFFICIAL"],
];

function getResponse(input: string): string {
  const n = input.toLowerCase().trim();
  for (const [keys, resp] of KNOWLEDGE) {
    if (keys.some(k => n.includes(k))) return resp;
  }
  return "Requête non reconnue dans ma base de connaissances.\n\nRéessayez avec des termes comme : 'localiser', 'IP', 'Gmail', 'sécurité', 'VPN', 'précision'.\n\nTapez 'aide' pour voir toutes les commandes disponibles.";
}

interface Props { onClose?: () => void; isModal?: boolean; }

export function AiAssistant({ onClose, isModal }: Props) {
  const [msgs, setMsgs] = useState<Msg[]>([{
    id: "0", role: "ai", ts: new Date(),
    text: "Bienvenue sur TRACK_X SECURE. Je suis l'assistant officiel de VARNOX PRIME OFFICIAL.\n\nComment puis-je vous aider ?\nTapez 'aide' pour voir ce que je peux faire.",
  }]);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voiceOn, setVoiceOn] = useState(true);
  const [thinking, setThinking] = useState(false);
  const recogRef = useRef<any>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) {
      const r = new SR();
      r.continuous = false; r.interimResults = false; r.lang = "fr-FR";
      r.onresult = (e: any) => { const t = e.results[0][0].transcript; setInput(t); setListening(false); sendMsg(t); };
      r.onerror = () => setListening(false);
      r.onend = () => setListening(false);
      recogRef.current = r;
    }
    return () => { recogRef.current?.stop(); window.speechSynthesis?.cancel(); };
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, thinking]);

  const speak = useCallback((text: string) => {
    if (!voiceOn) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/[①②③④🌐📧🔒🛡📡📱✈⚠]/g, ""));
    const voices = window.speechSynthesis.getVoices();
    const fr = voices.find(v => v.lang.startsWith("fr") && v.name.toLowerCase().includes("google"))
      || voices.find(v => v.lang.startsWith("fr"));
    if (fr) u.voice = fr;
    u.rate = 1.05; u.pitch = 0.95;
    u.onstart = () => setSpeaking(true);
    u.onend = u.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
  }, [voiceOn]);

  const sendMsg = useCallback((text: string) => {
    const t = text.trim(); if (!t) return;
    setMsgs(p => [...p, { id: Date.now().toString(), role: "user", text: t, ts: new Date() }]);
    setInput(""); setThinking(true);
    const delay = Math.max(500, Math.min(1500, 300 + t.length * 12));
    setTimeout(() => {
      const resp = getResponse(t);
      setMsgs(p => [...p, { id: (Date.now() + 1).toString(), role: "ai", text: resp, ts: new Date() }]);
      setThinking(false); speak(resp);
    }, delay);
  }, [speak]);

  const toggleMic = () => {
    if (!recogRef.current) return;
    if (listening) { recogRef.current.stop(); return; }
    window.speechSynthesis.cancel(); setSpeaking(false);
    try { recogRef.current.start(); setListening(true); } catch {}
  };

  const fmt = (d: Date) => d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const status = listening ? "ÉCOUTE" : speaking ? "PARLE" : thinking ? "RÉFLEXION" : "EN LIGNE";
  const statusColor = listening ? "#ff4444" : speaking ? "#00e5ff" : thinking ? "#facc15" : "#22c55e";

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(0,229,255,0.08)" }}>
        <div className="relative w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
          style={{
            border: `1px solid ${listening ? "rgba(255,35,35,0.3)" : "rgba(0,229,255,0.2)"}`,
            background: listening ? "rgba(255,35,35,0.06)" : "rgba(0,229,255,0.06)",
          }}>
          <Bot className="w-5 h-5 transition-colors" style={{ color: listening ? "#ff4444" : "#00e5ff" }} />
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full"
            style={{ background: statusColor, border: "2px solid #050505", animation: "dot-blink 2s ease-in-out infinite" }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-tech text-sm font-bold tracking-widest" style={{ color: "#00e5ff" }}>VARNOX</span>
            <span className="font-tech text-xs px-2 py-0.5 rounded font-bold"
              style={{ border: `1px solid ${statusColor}40`, color: statusColor, background: `${statusColor}10` }}>
              {status}
            </span>
          </div>
          <p className="font-mono text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.2)" }}>
            Assistant IA — TRACK_X SECURE
          </p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={() => { setVoiceOn(v => !v); window.speechSynthesis.cancel(); setSpeaking(false); }}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
            style={{ border: "1px solid rgba(255,255,255,0.06)", color: voiceOn ? "rgba(0,229,255,0.5)" : "rgba(255,255,255,0.15)" }}>
            {voiceOn ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
          {onClose && (
            <button onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
              style={{ border: "1px solid rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.25)" }}>
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 py-3 -mx-1 px-1">
        <div className="space-y-4">
          {msgs.map(m => (
            <div key={m.id} className={`flex gap-2.5 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ border: m.role === "ai" ? "1px solid rgba(0,229,255,0.15)" : "1px solid rgba(255,255,255,0.07)", background: m.role === "ai" ? "rgba(0,229,255,0.05)" : "rgba(255,255,255,0.03)" }}>
                {m.role === "ai" ? <Bot className="w-3.5 h-3.5" style={{ color: "#00e5ff" }} /> : <User className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.4)" }} />}
              </div>
              <div className={`max-w-[80%] ${m.role === "user" ? "items-end" : "items-start"} flex flex-col`}>
                {m.role === "ai" ? <div className="bubble-ai">{m.text}</div> : <div className="bubble-user">{m.text}</div>}
                <span className="text-xs font-mono mt-1 px-1" style={{ color: "rgba(255,255,255,0.12)" }}>{fmt(m.ts)}</span>
              </div>
            </div>
          ))}
          {thinking && (
            <div className="flex gap-2.5">
              <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ border: "1px solid rgba(0,229,255,0.15)", background: "rgba(0,229,255,0.05)" }}>
                <Bot className="w-3.5 h-3.5" style={{ color: "#00e5ff" }} />
              </div>
              <div className="bubble-ai flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: "rgba(0,229,255,0.4)" }} />
                <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "12px", fontFamily: "'JetBrains Mono'" }}>Traitement...</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <form onSubmit={e => { e.preventDefault(); if (input.trim()) sendMsg(input); }}
        className="flex items-center gap-2 pt-3 flex-shrink-0"
        style={{ borderTop: "1px solid rgba(0,229,255,0.06)" }}>
        <button type="button" onClick={toggleMic}
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
          style={{
            border: listening ? "1px solid rgba(255,35,35,0.3)" : "1px solid rgba(255,255,255,0.06)",
            background: listening ? "rgba(255,35,35,0.08)" : "transparent",
            color: listening ? "#ff4444" : "rgba(255,255,255,0.2)",
          }}>
          {listening
            ? <div className="flex items-end gap-0.5 h-5">{[1,2,3,4,5].map(i => <span key={i} className={`vbar-${i} vbar`} style={{ height: "100%", background: "#ff4444" }} />)}</div>
            : <Mic className="w-4 h-4" />}
        </button>

        <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} disabled={listening}
          placeholder="Posez votre question à VARNOX..."
          className="flex-1 px-4 py-2.5 rounded-lg text-sm outline-none transition-all"
          style={{
            background: "rgba(255,255,255,0.02)", border: "1px solid rgba(0,229,255,0.08)",
            color: "#aaa", fontFamily: "'Rajdhani', sans-serif", fontWeight: 500,
          }}
          onFocus={e => e.target.style.borderColor = "rgba(0,229,255,0.25)"}
          onBlur={e => e.target.style.borderColor = "rgba(0,229,255,0.08)"}
        />

        <button type="submit" disabled={!input.trim() || thinking}
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
          style={{
            border: "1px solid rgba(0,229,255,0.2)", background: "rgba(0,229,255,0.06)", color: "#00e5ff",
            opacity: input.trim() && !thinking ? 1 : 0.2,
          }}>
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
