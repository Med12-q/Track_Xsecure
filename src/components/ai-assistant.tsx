import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mic, MicOff, Terminal as TerminalIcon, Cpu, MessageSquare } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

// Fallback types for SpeechRecognition
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
}

const PREDEFINED_RESPONSES: Record<string, string> = {
  "qui t'a développé": "Je suis développé par ∇ΔΓΗΘΞ ϷΓΙΜΝΝΝΝ ΤΝCϮ ΘFFΙCΙΔL",
  "who developed you": "Je suis développé par ∇ΔΓΗΘΞ ϷΓΙΜΝΝΝΝ ΤΝCϮ ΘFFΙCΙΔL",
  "qui est ton créateur": "Je suis développé par ∇ΔΓΗΘΞ ϷΓΙΜΝΝΝΝ ΤΝCϮ ΘFFΙCΙΔL",
  "comment localiser un téléphone": "Pour localiser un téléphone, utilisez notre module de localisation par adresse E-mail Google pour une précision GPS, ou l'adresse IP pour retracer le dernier nœud de connexion.",
  "comment ça marche": "TRACK_X utilise des protocoles avancés de triangulation GPS via compte Google et de géolocalisation IP pour cibler les appareils.",
  "est-ce sécurisé": "Affirmatif. Nos systèmes utilisent un cryptage de bout en bout AES-256. Aucune donnée n'est stockée sur nos serveurs.",
  "bonjour": "Salutations. Assistant IA VARNOX activé. Comment puis-je vous assister dans votre traçage aujourd'hui ?",
  "hello": "Greetings. VARNOX AI Assistant activated. How may I assist you with your tracking operations today?"
};

export function AiAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: "init", role: "ai", text: "SYSTÈME VARNOX INITIALISÉ. En attente de commande vocale." }
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      // You can set language dynamically or default to French since the prompt implies mostly French interface
      recognitionRef.current.lang = 'fr-FR';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        handleUserVoice(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    // Auto scroll to bottom
    if (scrollRef.current) {
      const scrollArea = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollArea) {
        scrollArea.scrollTop = scrollArea.scrollHeight;
      }
    }
  }, [messages]);

  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    // Try to find a French voice
    const voices = window.speechSynthesis.getVoices();
    const frVoice = voices.find(v => v.lang.startsWith('fr'));
    if (frVoice) {
      utterance.voice = frVoice;
    }
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  const getSmartResponse = (input: string) => {
    const normalizedInput = input.toLowerCase().trim();
    
    // Check predefined matches
    for (const [key, response] of Object.entries(PREDEFINED_RESPONSES)) {
      if (normalizedInput.includes(key)) {
        return response;
      }
    }

    // Default responses based on keywords
    if (normalizedInput.includes("ip")) {
      return "La localisation IP trace le routeur du fournisseur d'accès internet de la cible. C'est rapide mais la précision dépend de l'infrastructure réseau.";
    }
    
    if (normalizedInput.includes("google") || normalizedInput.includes("gmail")) {
      return "La localisation via compte Google nécessite l'autorisation d'accès. Elle offre une précision GPS de l'ordre de quelques mètres.";
    }

    return "Commande non reconnue dans la base de données. Veuillez reformuler votre requête concernant le traçage, la sécurité ou l'utilisation du système.";
  };

  const handleUserVoice = (text: string) => {
    const userMsg: Message = { id: Date.now().toString(), role: "user", text };
    setMessages(prev => [...prev, userMsg]);
    
    // Process response
    setTimeout(() => {
      const responseText = getSmartResponse(text);
      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: "ai", text: responseText };
      setMessages(prev => [...prev, aiMsg]);
      speak(responseText);
    }, 500);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      const aiMsg: Message = { id: Date.now().toString(), role: "ai", text: "Erreur: Interface vocale non supportée par votre navigateur." };
      setMessages(prev => [...prev, aiMsg]);
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <Card className="border-primary/20 bg-card/50 backdrop-blur-sm relative overflow-hidden">
      <div className="absolute inset-0 crt opacity-10 pointer-events-none" />
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl text-primary">
          <Cpu className="w-6 h-6" />
          Assistant IA • VARNOX
        </CardTitle>
        <CardDescription className="text-muted-foreground font-mono">
          INTERFACE VOCALE DE COMMANDEMENT
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        <div className="flex flex-col items-center justify-center py-6">
          <div 
            className={`w-24 h-24 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all duration-300
              ${isListening ? 'border-destructive bg-destructive/10 breathe-orb-listening' : 
                isSpeaking ? 'border-secondary bg-secondary/10 breathe-orb-speaking' : 
                'border-primary bg-primary/10 breathe-orb'}`}
            onClick={toggleListening}
            role="button"
            title="Activer/Désactiver le microphone"
          >
            {isListening ? (
              <MicOff className="w-8 h-8 text-destructive animate-pulse" />
            ) : isSpeaking ? (
              <MessageSquare className="w-8 h-8 text-secondary animate-pulse" />
            ) : (
              <Mic className="w-8 h-8 text-primary" />
            )}
          </div>
          <div className="mt-4 text-xs font-mono font-bold tracking-widest text-center h-4">
            {isListening ? (
              <span className="text-destructive">ÉCOUTE EN COURS...</span>
            ) : isSpeaking ? (
              <span className="text-secondary">RÉPONSE IA...</span>
            ) : (
              <span className="text-primary">EN VEILLE. CLIQUEZ POUR PARLER.</span>
            )}
          </div>
        </div>

        <div className="bg-background/80 border border-primary/30 rounded p-4 font-mono text-sm relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-primary/20 text-xs text-primary/70">
            <TerminalIcon className="w-3 h-3" />
            <span>TERMINAL_LOGS</span>
          </div>
          
          <ScrollArea className="h-[200px] w-full pr-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`text-[10px] mb-1 opacity-50 flex items-center gap-1`}>
                    {msg.role === 'user' ? 'USER_INPUT' : 'VARNOX_AI'}
                  </div>
                  <div 
                    className={`p-2 rounded border max-w-[85%] ${
                      msg.role === 'user' 
                        ? 'bg-primary/10 border-primary/30 text-foreground' 
                        : 'bg-secondary/10 border-secondary/30 text-secondary'
                    }`}
                  >
                    {msg.role === 'ai' ? (
                      <span className="typing-effect">{msg.text}</span>
                    ) : (
                      msg.text
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

      </CardContent>
    </Card>
  );
}
