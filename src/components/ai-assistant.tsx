import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mic, MicOff, Send, Volume2, VolumeX, Bot, User, Cpu } from "lucide-react";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface Message {
  id: string;
  role: "user" | "ai";
  text: string;
  timestamp: Date;
}

const KB: [string[], string][] = [
  [["qui t'a développé", "qui es ton créateur", "who made you", "ton développeur", "développeur", "créateur"], "Je suis développé par ∇ΔΓΗΘΞ ϷΓΙΜΝΝΝΝ ΤΝCϮ ΘFFΙCΙΔL, ingénieur en cybersécurité et expert en systèmes de géolocalisation avancés."],
  [["track_x", "trackx", "ce site", "cette application", "c'est quoi", "what is"], "TRACK_X SECURE est une plateforme professionnelle de géolocalisation d'appareils mobiles. Elle permet la localisation via compte Google (Find My Device) et via adresse IP, avec une précision GPS optimisée."],
  [["localiser", "locate", "trouver", "retrouver", "find"], "Pour localiser un appareil : utilisez l'onglet 'Email Google' pour une précision GPS maximale (nécessite identifiants + code), ou l'onglet 'IP' pour tracer l'adresse réseau de la cible. Le vérificateur WhatsApp valide également le statut d'un numéro."],
  [["ip", "adresse ip", "géolocalisation ip"], "La géolocalisation IP interroge les bases WHOIS et MaxMind pour localiser le routeur FAI de la cible. Précision : ville/région. Les VPN et proxies peuvent masquer la position réelle."],
  [["google", "gmail", "find my device"], "La localisation via compte Google utilise le protocole OAuth2 pour accéder au service Find My Device. Elle offre une précision GPS de ±2 à 10 mètres selon la qualité du signal."],
  [["whatsapp", "banni", "ban", "numéro whatsapp"], "Le vérificateur WhatsApp analyse le statut d'un numéro de téléphone (format E.164 international). Il détermine si le compte est actif, banni, ou inactif via les protocoles de validation."],
  [["sécurité", "sécurisé", "chiffrement", "crypté", "sécurise"], "TRACK_X SECURE utilise un chiffrement TLS 1.3 pour toutes les communications. Aucune donnée personnelle n'est stockée sur nos serveurs. Les requêtes sont anonymisées via zero-knowledge architecture."],
  [["précision", "exactitude", "précis"], "La précision dépend de la méthode : GPS via Google ≈ ±3m, triangulation cellulaire ≈ ±50m, géolocalisation IP ≈ ±5km. Les résultats sont mis à jour en temps réel."],
  [["bonjour", "salut", "hello", "hi", "bonsoir"], "Bonjour. Je suis VARNOX, l'assistant IA intégré à TRACK_X SECURE. Comment puis-je vous assister aujourd'hui ?"],
  [["merci", "thank", "thanks", "parfait", "excellent"], "Je vous en prie. N'hésitez pas si vous avez d'autres questions concernant nos outils de localisation ou de cybersécurité."],
  [["aide", "help", "comment utiliser", "tutoriel", "guide"], "Voici les fonctionnalités disponibles :\n1. Email Google → localisation GPS précise\n2. Adresse IP → géolocalisation réseau\n3. Vérificateur WhatsApp → statut du numéro\n4. Moi, VARNOX → assistance vocale et textuelle 24/7"],
];

function getResponse(input: string): string {
  const normalized = input.toLowerCase().trim();
  for (const [keys, response] of KB) {
    if (keys.some(k => normalized.includes(k))) return response;
  }
  return "Je n'ai pas trouvé de réponse précise pour cette requête dans ma base de connaissances. Reformulez votre question concernant la localisation, la cybersécurité ou l'utilisation de TRACK_X SECURE.";
}

export function AiAssistant() {
  const [messages, setMessages] = useState<Message[]>([{
    id: "init",
    role: "ai",
    text: "Bonjour, je suis VARNOX — l'assistant IA de TRACK_X SECURE. Posez-moi vos questions par écrit ou en vocal. Je peux vous aider à utiliser les outils de localisation, vous informer sur la cybersécurité, ou simplement discuter.",
    timestamp: new Date(),
  }]);
  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isThinking, setIsThinking] = useState(false);
  const recognitionRef = useRef<any>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
    return () => {
      recognitionRef.current?.stop();
      window.speechSynthesis?.cancel();
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  const speak = useCallback((text: string) => {
    if (!voiceEnabled) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const fr = voices.find(v => v.lang.startsWith("fr") && v.name.includes("Google")) ||
               voices.find(v => v.lang.startsWith("fr"));
    if (fr) utt.voice = fr;
    utt.rate = 1.0;
    utt.pitch = 1.0;
    utt.onstart = () => setIsSpeaking(true);
    utt.onend = () => setIsSpeaking(false);
    utt.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utt);
  }, [voiceEnabled]);

  const sendMessage = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", text: trimmed, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setIsThinking(true);

    const delay = 600 + trimmed.length * 8;
    setTimeout(() => {
      const response = getResponse(trimmed);
      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: "ai", text: response, timestamp: new Date() };
      setMessages(prev => [...prev, aiMsg]);
      setIsThinking(false);
      speak(response);
    }, Math.min(delay, 2200));
  }, [speak]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (inputText.trim()) sendMessage(inputText);
  };

  const toggleMic = () => {
    if (!recognitionRef.current) {
      sendMessage("microphone non supporté");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      try { recognitionRef.current.start(); setIsListening(true); } catch {}
    }
  };

  const fmt = (d: Date) => d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex flex-col h-[600px]">
      <div className="flex items-center gap-3 pb-4 border-b border-border flex-shrink-0">
        <div className="relative">
          <div className={`p-2.5 rounded-xl border transition-all duration-300 ${
            isListening ? "bg-destructive/10 border-destructive/40" :
            isSpeaking ? "bg-primary/10 border-primary/40" :
            isThinking ? "bg-secondary/10 border-secondary/40" :
            "bg-muted/40 border-border"
          }`}>
            <Cpu className={`w-5 h-5 transition-colors duration-300 ${
              isListening ? "text-destructive" :
              isSpeaking ? "text-primary" :
              isThinking ? "text-secondary" :
              "text-muted-foreground"
            }`} />
          </div>
          <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-background ${
            isListening ? "bg-destructive" :
            isSpeaking ? "bg-primary pulse-dot" :
            isThinking ? "bg-secondary pulse-dot" :
            "bg-green-500"
          }`} />
        </div>
        <div>
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            VARNOX
            <span className="text-[10px] font-mono text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full border border-border/60">
              {isListening ? "ÉCOUTE..." : isSpeaking ? "PARLE..." : isThinking ? "RÉFLEXION..." : "EN LIGNE"}
            </span>
          </h2>
          <p className="text-xs text-muted-foreground">Assistant IA — TRACK_X SECURE</p>
        </div>
        <button
          onClick={() => { setVoiceEnabled(v => !v); window.speechSynthesis.cancel(); setIsSpeaking(false); }}
          className="ml-auto p-2 rounded-lg border border-border/60 bg-card/40 hover:bg-card transition-colors text-muted-foreground hover:text-foreground"
          title={voiceEnabled ? "Désactiver la voix" : "Activer la voix"}
        >
          {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>

      <ScrollArea className="flex-1 py-4">
        <div className="space-y-4 pr-2">
          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border ${
                msg.role === "ai"
                  ? "bg-primary/10 border-primary/20 text-primary"
                  : "bg-muted border-border text-muted-foreground"
              }`}>
                {msg.role === "ai" ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
              </div>
              <div className={`max-w-[80%] space-y-1 ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col`}>
                <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "ai"
                    ? "bg-card border border-border/80 text-foreground rounded-tl-sm"
                    : "bg-primary text-primary-foreground rounded-tr-sm"
                }`}>
                  {msg.text}
                </div>
                <span className="text-[10px] text-muted-foreground/60 font-mono px-1">
                  {fmt(msg.timestamp)}
                </span>
              </div>
            </div>
          ))}

          {isThinking && (
            <div className="flex gap-2.5">
              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 bg-primary/10 border border-primary/20 text-primary">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-card border border-border/80">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-4 border-t border-border flex-shrink-0">
        <button
          type="button"
          onClick={toggleMic}
          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border transition-all duration-200 ${
            isListening
              ? "bg-destructive/15 border-destructive/40 text-destructive"
              : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
          }`}
          title={isListening ? "Arrêter l'écoute" : "Parler"}
        >
          {isListening ? (
            <div className="flex items-end gap-0.5 h-4">
              <span className="w-0.5 bg-destructive rounded-full voice-bar-1" />
              <span className="w-0.5 bg-destructive rounded-full voice-bar-2" />
              <span className="w-0.5 bg-destructive rounded-full voice-bar-3" />
              <span className="w-0.5 bg-destructive rounded-full voice-bar-4" />
              <span className="w-0.5 bg-destructive rounded-full voice-bar-5" />
            </div>
          ) : (
            <Mic className="w-4 h-4" />
          )}
        </button>

        <Input
          ref={inputRef}
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          placeholder="Posez votre question à VARNOX..."
          className="flex-1 h-10 bg-card border-border focus-visible:ring-primary/40 focus-visible:border-primary/50 font-sans text-sm"
          disabled={isListening}
          data-testid="input-ai-message"
        />

        <Button
          type="submit"
          size="icon"
          className="w-10 h-10 flex-shrink-0"
          disabled={!inputText.trim() || isThinking}
          data-testid="button-send-message"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
