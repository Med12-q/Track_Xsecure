import { useState, useEffect, useRef, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mic, Send, Volume2, VolumeX, Bot, User, Cpu, Loader2 } from "lucide-react";

declare global { interface Window { SpeechRecognition: any; webkitSpeechRecognition: any; } }

interface Msg { id: string; role: "user" | "ai"; text: string; ts: Date; }

const KB: [string[], string][] = [
  [["qui t'a développé", "créateur", "développeur", "who made", "who created"], "Je suis développé par ∇ΔΓΗΘΞ ϷΓΙΜΝΝΝΝ ΤΝCϮ ΘFFΙCΙΔL — ingénieur spécialisé en cybersécurité, géolocalisation avancée et systèmes d'intelligence artificielle."],
  [["track_x", "ce site", "cette application", "c'est quoi", "what is"], "TRACK_X SECURE est une plateforme de géolocalisation d'appareils mobiles de niveau professionnel. Elle comprend 4 modules : localisation IP, tracking Google, vérification WhatsApp, et assistant IA VARNOX."],
  [["localiser", "locate", "trouver", "find", "retrouver", "comment"], "Pour localiser un appareil :\n① Module IP → traçage du nœud réseau FAI (MaxMind)\n② Module Gmail → localisation GPS précise (Find My Device)\nPrécision : de ±3m (GPS) à ±5km (IP)"],
  [["ip", "adresse ip", "géolocalisation ip", "tracer ip"], "La géolocalisation IP interroge les bases WHOIS, ARIN, RIPE et MaxMind GeoIP2 en temps réel. Elle localise le dernier routeur FAI connu. Les VPN/proxies peuvent masquer la position réelle."],
  [["google", "gmail", "find my device", "oauth"], "La localisation Google utilise OAuth2 pour accéder au service Find My Device. Elle offre une précision GPS de ±2 à 10 mètres via triangulation multi-satellites + Wi-Fi + Cell Tower."],
  [["whatsapp", "banni", "ban", "numéro", "actif", "checker"], "Le vérificateur WhatsApp valide les numéros en format E.164 international et détermine si le compte est actif, banni ou inactif via les protocoles WhatsApp Business API."],
  [["sécurité", "sécurisé", "chiffrement", "crypté", "safe", "secure"], "TRACK_X utilise TLS 1.3 + AES-256 pour toutes les communications. Architecture zero-knowledge : aucune donnée n'est stockée. Anonymat total garanti par design."],
  [["précision", "exactitude", "accuracy", "précis"], "GPS via Google ≈ ±2-10m\nTriangulation Cell Tower ≈ ±50-500m\nGéolocalisation IP ≈ ±1-50km\nTous les résultats sont actualisés en temps réel."],
  [["bonjour", "salut", "hello", "hi", "bonsoir"], "Bonjour. Système VARNOX opérationnel.\nJe suis l'assistant IA de TRACK_X SECURE.\nTapez 'aide' pour voir toutes les commandes disponibles."],
  [["merci", "thank", "thanks", "parfait", "bravo", "super"], "Je vous en prie. TRACK_X est à votre service 24/7. N'hésitez pas si vous avez d'autres questions."],
  [["aide", "help", "utiliser", "fonctionnalités", "guide", "commandes"], "Modules disponibles :\n① IP → géolocalisation réseau réelle\n② Gmail → tracking GPS précis\n③ WhatsApp → vérification statut ban\n④ VARNOX → assistant IA vocal & textuel\n\nPosez vos questions librement."],
  [["varnox", "ia", "ai", "assistant", "intelligence artificielle"], "VARNOX est l'IA embarquée de TRACK_X SECURE. Réponses textuelles et vocales. Connaissance complète des systèmes de localisation et de cybersécurité. Disponible 24/7."],
];

function getResp(input: string): string {
  const n = input.toLowerCase().trim();
  for (const [keys, resp] of KB) if (keys.some(k => n.includes(k))) return resp;
  return "Requête non reconnue. Reformulez votre question concernant la localisation, la cybersécurité ou les fonctionnalités de TRACK_X. Tapez 'aide' pour la liste complète.";
}

export function AiAssistant() {
  const [msgs, setMsgs] = useState<Msg[]>([{
    id: "0", role: "ai", ts: new Date(),
    text: "Système VARNOX initialisé et opérationnel.\n\nJe suis l'assistant IA de TRACK_X SECURE.\nPosez vos questions par écrit ou via le microphone.\n\nTapez 'aide' pour voir toutes les fonctionnalités disponibles.",
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
      recogRef.current = new SR();
      recogRef.current.continuous = false; recogRef.current.interimResults = false; recogRef.current.lang = "fr-FR";
      recogRef.current.onresult = (e: any) => { const t = e.results[0][0].transcript; setInput(t); setListening(false); send(t); };
      recogRef.current.onerror = () => setListening(false);
      recogRef.current.onend = () => setListening(false);
    }
    return () => { recogRef.current?.stop(); window.speechSynthesis?.cancel(); };
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, thinking]);

  const speak = useCallback((text: string) => {
    if (!voiceOn) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const vs = window.speechSynthesis.getVoices();
    const fr = vs.find(v => v.lang.startsWith("fr") && v.name.includes("Google")) || vs.find(v => v.lang.startsWith("fr"));
    if (fr) u.voice = fr;
    u.rate = 1.0;
    u.onstart = () => setSpeaking(true);
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
  }, [voiceOn]);

  const send = useCallback((text: string) => {
    const t = text.trim(); if (!t) return;
    setMsgs(p => [...p, { id: Date.now().toString(), role: "user", text: t, ts: new Date() }]);
    setInput(""); setThinking(true);
    setTimeout(() => {
      const r = getResp(t);
      setMsgs(p => [...p, { id: (Date.now() + 1).toString(), role: "ai", text: r, ts: new Date() }]);
      setThinking(false); speak(r);
    }, Math.min(600 + t.length * 8, 1800));
  }, [speak]);

  const toggleMic = () => {
    if (!recogRef.current) return;
    if (listening) recogRef.current.stop();
    else { window.speechSynthesis.cancel(); setSpeaking(false); try { recogRef.current.start(); setListening(true); } catch {} }
  };

  const fmt = (d: Date) => d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex flex-col" style={{ height: 560 }}>
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 flex-shrink-0" style={{ borderBottom: "1px solid #00e5ff0f" }}>
        <div className="relative w-10 h-10 rounded-lg flex items-center justify-center transition-all"
          style={{ border: `1px solid ${listening ? "#ff444440" : "#00e5ff25"}`, background: listening ? "#ff44430a" : "#00e5ff08" }}>
          <Cpu className="w-5 h-5 transition-colors" style={{ color: listening ? "#ff4444" : "#00e5ff" }} />
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2" style={{
            borderColor: "#040404",
            background: listening ? "#ff4444" : speaking ? "#00e5ff" : thinking ? "#facc15" : "#22c55e",
          }} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-tech text-sm font-bold tracking-widest" style={{ color: "#00e5ff" }}>VARNOX</span>
            <span className="font-tech text-xs px-2 py-0.5 rounded font-bold"
              style={{
                border: `1px solid ${listening ? "#ff444440" : "#00e5ff30"}`,
                color: listening ? "#ff4444" : speaking ? "#00e5ff" : thinking ? "#facc15" : "#22c55e",
              }}>
              {listening ? "ÉCOUTE" : speaking ? "PARLE" : thinking ? "RÉFLEXION" : "EN LIGNE"}
            </span>
          </div>
          <p className="text-xs font-mono mt-0.5" style={{ color: "#333" }}>Module 04 — Assistant IA TRACK_X</p>
        </div>
        <button onClick={() => { setVoiceOn(v => !v); window.speechSynthesis.cancel(); setSpeaking(false); }}
          className="ml-auto w-9 h-9 rounded-lg flex items-center justify-center transition-all"
          style={{ border: "1px solid #111", background: "transparent", color: voiceOn ? "#00e5ff88" : "#333", cursor: "pointer" }}>
          {voiceOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 py-4">
        <div className="space-y-4 pr-1">
          {msgs.map(m => (
            <div key={m.id} className={`flex gap-2.5 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ border: m.role === "ai" ? "1px solid #00e5ff25" : "1px solid #222", background: m.role === "ai" ? "#00e5ff0a" : "#0a0a0a" }}>
                {m.role === "ai" ? <Bot className="w-3.5 h-3.5" style={{ color: "#00e5ff" }} /> : <User className="w-3.5 h-3.5" style={{ color: "#555" }} />}
              </div>
              <div className={`max-w-[82%] flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
                {m.role === "ai" ? <div className="bubble-ai">{m.text}</div> : <div className="bubble-user">{m.text}</div>}
                <span className="text-xs font-mono mt-1 px-1" style={{ color: "#222" }}>{fmt(m.ts)}</span>
              </div>
            </div>
          ))}
          {thinking && (
            <div className="flex gap-2.5">
              <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ border: "1px solid #00e5ff25", background: "#00e5ff0a" }}>
                <Bot className="w-3.5 h-3.5" style={{ color: "#00e5ff" }} />
              </div>
              <div className="bubble-ai flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: "#00e5ff55" }} />
                <span style={{ color: "#333", fontSize: "12px", fontFamily: "'JetBrains Mono'" }}>Traitement en cours...</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <form onSubmit={e => { e.preventDefault(); if (input.trim()) send(input); }}
        className="flex items-center gap-2 pt-3 flex-shrink-0" style={{ borderTop: "1px solid #00e5ff0a" }}>
        <button type="button" onClick={toggleMic}
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
          style={{
            border: listening ? "1px solid #ff444440" : "1px solid #111",
            background: listening ? "#ff44430a" : "transparent",
            color: listening ? "#ff4444" : "#333", cursor: "pointer",
          }}>
          {listening ? (
            <div className="flex items-end gap-0.5 h-5">
              {[1,2,3,4,5].map(i => <span key={i} className={`w-0.5 rounded-full voice-bar-${i}`} style={{ background: "#ff4444" }} />)}
            </div>
          ) : <Mic className="w-4 h-4" />}
        </button>

        <input value={input} onChange={e => setInput(e.target.value)} disabled={listening}
          placeholder="Posez votre question à VARNOX..."
          className="flex-1 px-4 py-2.5 rounded-lg text-sm outline-none transition-all"
          style={{
            background: "#060606", border: "1px solid #00e5ff15",
            color: "#aaa", fontFamily: "'Rajdhani', sans-serif", fontWeight: 500,
          }}
          onFocus={e => e.target.style.borderColor = "#00e5ff35"}
          onBlur={e => e.target.style.borderColor = "#00e5ff15"}
        />

        <button type="submit" disabled={!input.trim() || thinking}
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
          style={{
            border: "1px solid #00e5ff30", background: "#00e5ff0a", color: "#00e5ff",
            cursor: input.trim() && !thinking ? "pointer" : "not-allowed",
            opacity: input.trim() && !thinking ? 1 : 0.3,
          }}>
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
