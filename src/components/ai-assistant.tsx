import { useState, useEffect, useRef, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mic, Send, Volume2, VolumeX, Bot, User, Cpu, Loader2 } from "lucide-react";

declare global {
  interface Window { SpeechRecognition: any; webkitSpeechRecognition: any; }
}

interface Message { id: string; role: "user" | "ai"; text: string; timestamp: Date; }

const KB: [string[], string][] = [
  [["qui t'a développé", "créateur", "développeur", "who made", "who created", "who developed"], "Je suis développé par ∇ΔΓΗΘΞ ϷΓΙΜΝΝΝΝ ΤΝCϮ ΘFFΙCΙΔL, ingénieur spécialisé en cybersécurité et systèmes de géolocalisation avancée."],
  [["track_x", "trackx", "ce site", "cette application", "c'est quoi", "what is"], "TRACK_X SECURE est une plateforme professionnelle de géolocalisation. Elle localise les appareils via compte Google (Find My Device), adresse IP (MaxMind), et vérifie les numéros WhatsApp."],
  [["localiser", "locate", "trouver", "find phone", "retrouver", "comment"], "Utilisez l'onglet 'Email Google' pour une précision GPS maximale (±3m), ou 'Adresse IP' pour tracer le nœud réseau de la cible. Le vérificateur 'WhatsApp' contrôle le statut d'un numéro."],
  [["ip", "adresse ip", "géolocalisation ip", "tracer ip"], "La géolocalisation IP interroge les bases WHOIS et MaxMind en temps réel pour localiser le routeur FAI de la cible. Précision : ville/région. Les VPN/proxies peuvent fausser le résultat."],
  [["google", "gmail", "find my device", "oauth"], "La localisation via Google utilise OAuth2 pour accéder au service Find My Device. Elle offre une précision GPS de ±2 à 10 mètres selon la qualité du signal de l'appareil."],
  [["whatsapp", "banni", "ban", "numéro whatsapp", "actif"], "Le vérificateur WhatsApp valide le numéro en format E.164 international et détermine s'il est actif, banni ou inactif via les protocoles de validation WhatsApp Business."],
  [["sécurité", "sécurisé", "chiffrement", "crypté", "safe", "secure"], "TRACK_X utilise TLS 1.3 pour toutes les communications. Architecture zero-knowledge : aucune donnée n'est stockée sur nos serveurs. Anonymat total garanti."],
  [["précision", "exactitude", "précis", "accuracy"], "GPS via Google ≈ ±3m, triangulation cellulaire ≈ ±50m, géolocalisation IP ≈ ±5km. Coordonnées mises à jour en temps réel via les protocoles de localisation."],
  [["bonjour", "salut", "hello", "hi", "bonsoir", "hey"], "Bonjour. Je suis VARNOX, l'assistant IA de TRACK_X SECURE. Je peux vous aider à utiliser les outils de localisation, ou répondre à vos questions de cybersécurité."],
  [["merci", "thank", "thanks", "parfait", "excellent", "super"], "Je vous en prie. N'hésitez pas si vous avez d'autres questions sur nos systèmes de localisation."],
  [["aide", "help", "utiliser", "tutoriel", "guide", "fonctionnalités"], "Fonctionnalités disponibles :\n① Email Google → localisation GPS précise\n② Adresse IP → géolocalisation réseau\n③ WhatsApp Ban → vérification de numéro\n④ VARNOX → assistant IA vocal et textuel 24/7"],
  [["varnox", "ia", "ai", "assistant", "intelligence"], "VARNOX est l'IA intégrée à TRACK_X SECURE. Je réponds par texte et par voix, je guide les opérations de localisation et fournis des analyses de cybersécurité en temps réel."],
];

function getResponse(input: string): string {
  const n = input.toLowerCase().trim();
  for (const [keys, resp] of KB) {
    if (keys.some(k => n.includes(k))) return resp;
  }
  return "Requête non reconnue dans ma base de données. Reformulez votre question concernant la localisation, la cybersécurité ou l'utilisation de TRACK_X SECURE. Commandes disponibles : aide, localiser, IP, WhatsApp, sécurité.";
}

export function AiAssistant() {
  const [messages, setMessages] = useState<Message[]>([{
    id: "init", role: "ai", timestamp: new Date(),
    text: "Système VARNOX initialisé. Je suis l'assistant IA de TRACK_X SECURE.\n\nPosez vos questions par écrit ou utilisez le microphone. Tapez 'aide' pour voir toutes les fonctionnalités disponibles.",
  }]);
  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isThinking, setIsThinking] = useState(false);
  const recognitionRef = useRef<any>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) {
      recognitionRef.current = new SR();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "fr-FR";
      recognitionRef.current.onresult = (e: any) => {
        const text = e.results[0][0].transcript;
        setInputText(text);
        setIsListening(false);
        sendMessage(text);
      };
      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
    return () => { recognitionRef.current?.stop(); window.speechSynthesis?.cancel(); };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  const speak = useCallback((text: string) => {
    if (!voiceEnabled) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const fr = voices.find(v => v.lang.startsWith("fr") && v.name.includes("Google")) || voices.find(v => v.lang.startsWith("fr"));
    if (fr) utt.voice = fr;
    utt.rate = 1.0;
    utt.onstart = () => setIsSpeaking(true);
    utt.onend = () => setIsSpeaking(false);
    utt.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utt);
  }, [voiceEnabled]);

  const sendMessage = useCallback((text: string) => {
    const t = text.trim();
    if (!t) return;
    setMessages(prev => [...prev, { id: Date.now().toString(), role: "user", text: t, timestamp: new Date() }]);
    setInputText("");
    setIsThinking(true);
    const delay = Math.min(600 + t.length * 10, 2000);
    setTimeout(() => {
      const resp = getResponse(t);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: "ai", text: resp, timestamp: new Date() }]);
      setIsThinking(false);
      speak(resp);
    }, delay);
  }, [speak]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (inputText.trim()) sendMessage(inputText);
  };

  const toggleMic = () => {
    if (!recognitionRef.current) return;
    if (isListening) { recognitionRef.current.stop(); }
    else {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      try { recognitionRef.current.start(); setIsListening(true); } catch {}
    }
  };

  const fmt = (d: Date) => d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  const statusColor = isListening ? "text-red-400" : isSpeaking ? "text-cyan-400" : isThinking ? "text-yellow-500" : "text-[#25d366]";
  const statusLabel = isListening ? "ÉCOUTE..." : isSpeaking ? "PARLE..." : isThinking ? "RÉFLEXION..." : "EN LIGNE";

  return (
    <div className="flex flex-col h-[560px]">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-cyan-500/15 flex-shrink-0">
        <div className={`relative w-9 h-9 rounded-lg border flex items-center justify-center transition-all duration-300 ${
          isListening ? "border-red-500/40 bg-red-500/5" :
          isSpeaking ? "border-cyan-500/40 bg-cyan-500/5" :
          "border-cyan-500/20 bg-cyan-500/3"
        }`}>
          <Cpu className={`w-4 h-4 ${statusColor} transition-colors duration-300`} />
          <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-black ${
            isListening ? "bg-red-400" : isSpeaking ? "bg-cyan-400 pulse-dot" : isThinking ? "bg-yellow-500 pulse-dot" : "bg-green-400"
          }`} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-sm tracking-widest text-white">VARNOX</span>
            <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${
              isListening ? "border-red-500/40 text-red-400" :
              isSpeaking ? "border-cyan-500/40 text-cyan-400" :
              isThinking ? "border-yellow-500/40 text-yellow-500" :
              "border-[#25d366]/30 text-[#25d366]"
            }`}>{statusLabel}</span>
          </div>
          <p className="text-[10px] font-mono text-gray-700">Assistant IA — TRACK_X SECURE</p>
        </div>
        <button onClick={() => { setVoiceEnabled(v => !v); window.speechSynthesis.cancel(); setIsSpeaking(false); }}
          className="ml-auto p-2 rounded-lg border border-white/8 bg-white/3 text-gray-600 hover:text-cyan-400 hover:border-cyan-500/30 transition-all">
          {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 py-3">
        <div className="space-y-3 pr-1">
          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border ${
                msg.role === "ai" ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400" : "bg-white/5 border-white/10 text-gray-500"
              }`}>
                {msg.role === "ai" ? <Bot className="w-3 h-3" /> : <User className="w-3 h-3" />}
              </div>
              <div className={`max-w-[82%] space-y-1 flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                <div className={`px-3 py-2 rounded-xl text-sm font-sans leading-relaxed whitespace-pre-line ${
                  msg.role === "ai"
                    ? "bg-black/60 border border-cyan-500/12 text-gray-300 rounded-tl-sm"
                    : "bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 rounded-tr-sm"
                }`}>
                  {msg.text}
                </div>
                <span className="text-[9px] font-mono text-gray-700 px-1">{fmt(msg.timestamp)}</span>
              </div>
            </div>
          ))}

          {isThinking && (
            <div className="flex gap-2">
              <div className="w-6 h-6 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot className="w-3 h-3 text-cyan-400" />
              </div>
              <div className="px-3 py-2 rounded-xl rounded-tl-sm bg-black/60 border border-cyan-500/12">
                <div className="flex items-center gap-1.5">
                  <Loader2 className="w-3 h-3 text-cyan-400/60 animate-spin" />
                  <span className="text-xs font-mono text-gray-700">Traitement...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-3 border-t border-cyan-500/10 flex-shrink-0">
        <button type="button" onClick={toggleMic}
          className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 border transition-all duration-200 ${
            isListening
              ? "bg-red-500/10 border-red-500/40 text-red-400"
              : "bg-white/3 border-white/8 text-gray-600 hover:text-cyan-400 hover:border-cyan-500/30"
          }`} title={isListening ? "Arrêter" : "Parler"}>
          {isListening ? (
            <div className="flex items-end gap-0.5 h-4">
              {[1,2,3,4,5].map(i => <span key={i} className={`w-0.5 bg-red-400 rounded-full voice-bar-${i}`} />)}
            </div>
          ) : <Mic className="w-3.5 h-3.5" />}
        </button>

        <input
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          placeholder="Posez votre question à VARNOX..."
          disabled={isListening}
          className="flex-1 px-3 py-2 rounded-lg text-sm bg-black/50 border border-cyan-500/12 text-gray-300 font-sans placeholder:text-gray-700 focus:outline-none focus:border-cyan-500/35 focus:shadow-[0_0_8px_hsl(185_100%_50%/0.08)] transition-all"
        />

        <button type="submit" disabled={!inputText.trim() || isThinking}
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 hover:shadow-[0_0_12px_hsl(185_100%_50%/0.2)] disabled:opacity-25 disabled:cursor-not-allowed transition-all">
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
