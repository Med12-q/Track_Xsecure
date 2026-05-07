import { useState, useEffect, useRef, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mic, Send, Volume2, VolumeX, Bot, User, Loader2, X, Cpu } from "lucide-react";

declare global { interface Window { SpeechRecognition: any; webkitSpeechRecognition: any; } }

interface Msg { id: string; role: "ai" | "user"; text: string; ts: Date; }

const KB: [string[], string][] = [
  [["qui t'a créé","créateur","développeur","who made","varnox","∇"], "Je suis VARNOX, développé par ∇ΔΓΗΘΞ ϷΓΙΜΝΝΝΝ ΤΝCϮ ΘFFΙCΙΔL — ingénieur spécialisé en cybersécurité avancée, géolocalisation de précision militaire et intelligence artificielle embarquée.\n\nContact : wa.me/+224669288332 · t.me/Varnox_Or_novark"],
  [["track_x","cette plateforme","c'est quoi","what is","fonctionnalités"], "TRACK_X SECURE v2.0 — Plateforme SaaS de géolocalisation avancée.\n\n🌐 Géolocalisation IP — MaxMind GeoIP2, WHOIS, BGP\n🖥 Fingerprinting Système — Browser, OS, GPU, WebRTC\n📍 Carte Live — Leaflet CartoDB Dark\n📋 Historique — Log persistant 30 entrées\n🛡 Threat Level — Score de menace temps réel\n🤖 IA VARNOX — Assistant vocal & textuel"],
  [["localiser","locate","trouver","tracker","ip tracker"], "Pour localiser une IP :\n\n① Onglet «Adresse IP» → saisissez n'importe quelle IPv4/IPv6\n② Ou onglet «Mon IP» → auto-détection de votre IP publique\n③ Cliquez «Lancer l'analyse» → résultats en <5s\n\nDonnées retournées : Pays, Ville, GPS, ISP, ASN, Mobile, Proxy, Hébergeur, Threat Level."],
  [["ip-api","maxmind","whois","api","source de données"], "Sources de données utilisées :\n\n• ip-api.com → géolocalisation en temps réel\n• MaxMind GeoIP2 → base de données certifiée\n• ARIN / RIPE / APNIC / LACNIC → registres WHOIS\n• BGP.he.net → analyse de routage AS Path\n• OpenStreetMap + CartoDB → cartes interactives"],
  [["fingerprint","système","browser","navigateur","os","gpu","webrtc"], "Le module Fingerprinting collecte automatiquement :\n\n🖥 Navigateur (nom + version)\n💻 Système d'exploitation\n📐 Résolution écran + viewport\n🎮 GPU / Renderer WebGL\n🔋 Niveau de batterie\n📡 Type de connexion + débit\n⚡ Empreinte Canvas unique\n🔍 Fuite IP WebRTC locale"],
  [["threat","menace","vpn","proxy","tor","sécurité"], "Calcul du niveau de menace :\n\n🟢 FAIBLE → IP résidentielle classique\n🟡 MOYEN  → Hébergeur / Data Center détecté\n🟠 ÉLEVÉ  → Proxy transparent identifié\n🔴 CRITIQUE → VPN / Tor / Proxy + DC combiné\n\nLa détection utilise les flags mobile, proxy et hosting de ip-api.com."],
  [["historique","history","log","export","csv"], "L'historique conserve les 30 dernières localisations en mémoire locale (localStorage).\n\nChaque entrée contient : Timestamp · IP · Ville · Pays · ISP · Niveau de menace.\n\nExport possible en CSV via le bouton de téléchargement. Cliquez sur une entrée pour recentrer la carte."],
  [["précision","accuracy","exact","coordonnées"], "Niveaux de précision :\n\n🛰 GPS natif → ±2-10 mètres\n📡 Wi-Fi triangulation → ±10-50 mètres\n🗼 Cell Tower → ±100-1000 mètres\n🌐 IP GeoIP2 → ±500m - 50km (selon pays)\n\nLa précision IP dépend de la granularité des données WHOIS du FAI."],
  [["carte","map","leaflet","openstreetmap"], "La carte utilise les tuiles CartoDB Dark Matter (OpenStreetMap) avec :\n\n• Marqueur animé avec effet de ping triple\n• Animation flyTo fluide entre les localisations\n• Zoom automatique adaptatif\n• Popup avec nom de la ville\n• Lien direct vers Google Maps pour navigation"],
  [["contact","joindre","whatsapp","telegram","support"], "Contactez VARNOX PRIME OFFICIAL :\n\n📱 WhatsApp → wa.me/+224669288332\n✈ Telegram → t.me/Varnox_Or_novark\n\nDisponible 24h/24 pour support technique et partenariats."],
  [["bonjour","salut","hello","bonsoir","hey","hi"], "Bonjour. Système VARNOX opérationnel.\n\nJe suis l'IA officielle de TRACK_X SECURE v2.0.\n\nJe peux vous assister sur :\n• La géolocalisation IP avancée\n• Le fingerprinting système\n• La cybersécurité et détection VPN\n• L'utilisation de la plateforme\n\nTapez 'aide' pour voir toutes les commandes."],
  [["merci","thanks","parfait","super","excellent"], "Je vous en prie. TRACK_X SECURE est conçu pour vous servir au plus haut niveau.\n\nN'hésitez pas si vous avez d'autres questions."],
  [["aide","help","commandes","que sais-tu"], "Commandes disponibles :\n\n🌐 'localiser' → guide géolocalisation IP\n🖥 'fingerprint' → infos système détectées\n🛡 'threat' → calcul niveau de menace\n📋 'historique' → gestion du log\n🗺 'carte' → fonctionnalités carte\n📡 'précision' → niveaux de précision\n📞 'contact' → coordonnées développeur\n🤖 'track_x' → présentation plateforme"],
];

function getResponse(input: string): string {
  const n = input.toLowerCase().trim();
  for (const [keys, resp] of KB) if (keys.some(k => n.includes(k))) return resp;
  return "Requête non reconnue. Essayez : 'localiser', 'fingerprint', 'threat', 'carte', 'précision', ou tapez 'aide' pour la liste complète des commandes.\n\nVARNOX PRIME OFFICIAL — Système opérationnel 24/7.";
}

interface Props { onClose?: () => void; }

export function AiAssistant({ onClose }: Props) {
  const [msgs, setMsgs] = useState<Msg[]>([{
    id: "0", role: "ai", ts: new Date(),
    text: "Bienvenue sur TRACK_X SECURE v2.0.\n\nJe suis VARNOX, l'assistant IA officiel de VARNOX PRIME OFFICIAL.\n\nJe peux vous assister sur la géolocalisation, la cybersécurité, le fingerprinting système et l'utilisation de la plateforme.\n\nTapez 'aide' pour voir toutes les commandes disponibles.",
  }]);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voiceOn, setVoiceOn] = useState(true);
  const [thinking, setThinking] = useState(false);
  const recogRef = useRef<any>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) {
      const r = new SR(); r.lang = "fr-FR"; r.continuous = false; r.interimResults = false;
      r.onresult = (e: any) => { const t = e.results[0][0].transcript; setListening(false); sendMsg(t); };
      r.onerror = r.onend = () => setListening(false);
      recogRef.current = r;
    }
    return () => { recogRef.current?.stop(); window.speechSynthesis?.cancel(); };
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, thinking]);

  const speak = useCallback((text: string) => {
    if (!voiceOn) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/[🌐🖥📍📋🛡🤖🔋📡⚡🔍📱✈🛰🗼🟢🟡🟠🔴①②③④]/g, ""));
    const voices = window.speechSynthesis.getVoices();
    const fr = voices.find(v => v.lang.startsWith("fr") && v.name.toLowerCase().includes("google")) || voices.find(v => v.lang.startsWith("fr"));
    if (fr) u.voice = fr; u.rate = 1.05;
    u.onstart = () => setSpeaking(true); u.onend = u.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
  }, [voiceOn]);

  const sendMsg = useCallback((text: string) => {
    const t = text.trim(); if (!t) return;
    setMsgs(p => [...p, { id: Date.now().toString(), role: "user", text: t, ts: new Date() }]);
    setInput(""); setThinking(true);
    setTimeout(() => {
      const resp = getResponse(t);
      setMsgs(p => [...p, { id: (Date.now() + 1).toString(), role: "ai", text: resp, ts: new Date() }]);
      setThinking(false); speak(resp);
    }, Math.max(500, Math.min(1600, 250 + t.length * 15)));
  }, [speak]);

  const toggleMic = () => {
    if (!recogRef.current) return;
    if (listening) { recogRef.current.stop(); return; }
    window.speechSynthesis.cancel(); setSpeaking(false);
    try { recogRef.current.start(); setListening(true); } catch {}
  };

  const fmt = (d: Date) => d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const statusColor = listening ? "#ff0033" : speaking ? "#00e5ff" : thinking ? "#ffcc00" : "#00ff88";
  const statusLabel = listening ? "ÉCOUTE" : speaking ? "PARLE" : thinking ? "ANALYSE" : "EN LIGNE";

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 flex-shrink-0 pb-3"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="relative w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ border: `1px solid ${statusColor}30`, background: `${statusColor}08`, transition: "all 0.3s" }}>
          <Cpu className="w-4 h-4 transition-colors" style={{ color: statusColor }} />
          <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full" style={{ background: statusColor, border: "2px solid #040404", animation: "pulse-dot 2s ease-in-out infinite" }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span style={{ fontFamily: "'Orbitron'", fontSize: "13px", fontWeight: 800, letterSpacing: "0.15em", color: "#00e5ff" }}>VARNOX</span>
            <span style={{ fontFamily: "'Orbitron'", fontSize: "8px", fontWeight: 700, letterSpacing: "0.1em", color: statusColor, border: `1px solid ${statusColor}35`, padding: "1px 6px", borderRadius: "3px", background: `${statusColor}0a` }}>{statusLabel}</span>
          </div>
          <p style={{ fontFamily: "'JetBrains Mono'", fontSize: "9px", color: "rgba(255,255,255,0.18)", marginTop: "1px" }}>Assistant IA — TRACK_X SECURE v2.0</p>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <button onClick={() => { setVoiceOn(v => !v); window.speechSynthesis.cancel(); setSpeaking(false); }}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
            style={{ border: "1px solid rgba(255,255,255,0.06)", color: voiceOn ? "rgba(0,229,255,0.5)" : "rgba(255,255,255,0.15)" }}>
            {voiceOn ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
          {onClose && (
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
              style={{ border: "1px solid rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.2)" }}>
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 py-3">
        <div className="space-y-3 pr-1">
          {msgs.map(m => (
            <div key={m.id} className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ border: m.role === "ai" ? "1px solid rgba(0,229,255,0.15)" : "1px solid rgba(255,255,255,0.06)", background: m.role === "ai" ? "rgba(0,229,255,0.05)" : "rgba(255,255,255,0.02)" }}>
                {m.role === "ai" ? <Bot className="w-3 h-3" style={{ color: "#00e5ff" }} /> : <User className="w-3 h-3" style={{ color: "rgba(255,255,255,0.3)" }} />}
              </div>
              <div className={`max-w-[82%] flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
                {m.role === "ai" ? <div className="bubble-ai">{m.text}</div> : <div className="bubble-user">{m.text}</div>}
                <span style={{ fontFamily: "'JetBrains Mono'", fontSize: "9px", color: "rgba(255,255,255,0.1)", marginTop: "3px", paddingInline: "4px" }}>{fmt(m.ts)}</span>
              </div>
            </div>
          ))}
          {thinking && (
            <div className="flex gap-2">
              <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ border: "1px solid rgba(0,229,255,0.15)", background: "rgba(0,229,255,0.05)" }}>
                <Bot className="w-3 h-3" style={{ color: "#00e5ff" }} />
              </div>
              <div className="bubble-ai flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" style={{ color: "rgba(0,229,255,0.4)" }} />
                <span style={{ fontFamily: "'JetBrains Mono'", fontSize: "11px", color: "rgba(255,255,255,0.2)" }}>Traitement...</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <form onSubmit={e => { e.preventDefault(); sendMsg(input); }}
        className="flex items-center gap-2 pt-3 flex-shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <button type="button" onClick={toggleMic}
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
          style={{ border: listening ? "1px solid rgba(255,0,51,0.4)" : "1px solid rgba(255,255,255,0.06)", background: listening ? "rgba(255,0,51,0.08)" : "transparent", color: listening ? "#ff0033" : "rgba(255,255,255,0.2)" }}>
          {listening ? <div className="flex items-end gap-0.5 h-4">{[1,2,3,4,5].map(i => <span key={i} className={`vbar vbar-${i}`} style={{ height: "100%" }} />)}</div> : <Mic className="w-3.5 h-3.5" />}
        </button>
        <input value={input} onChange={e => setInput(e.target.value)} disabled={listening}
          placeholder="Posez votre question à VARNOX..."
          className="flex-1 px-3 py-2 rounded-lg text-sm outline-none transition-all"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(0,229,255,0.08)", color: "#aaa", fontFamily: "'Rajdhani'", fontWeight: 500, fontSize: "14px" }}
          onFocus={e => e.target.style.borderColor = "rgba(0,229,255,0.25)"}
          onBlur={e => e.target.style.borderColor = "rgba(0,229,255,0.08)"} />
        <button type="submit" disabled={!input.trim() || thinking}
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
          style={{ border: "1px solid rgba(0,229,255,0.2)", background: "rgba(0,229,255,0.06)", color: "#00e5ff", opacity: input.trim() && !thinking ? 1 : 0.2 }}>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
