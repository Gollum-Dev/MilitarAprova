import React, { useState, useEffect, useRef } from "react";
import { 
  Bot, Send, Mic, Paperclip, RefreshCw, User, Award, ShieldAlert, Sparkles, MessageSquare 
} from "lucide-react";

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

interface TutorIAScreenProps {
  initialPrompt?: string;
  onClearInitialPrompt?: () => void;
}

export default function TutorIAScreen({ initialPrompt, onClearInitialPrompt }: TutorIAScreenProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg-1",
      role: "model",
      text: `Apresente-se, combatente! Sou o Major Aranha, seu tutor de Inteligência Artificial para o CHO CBMMG.
Minha diretriz é guiá-lo com absoluto rigor doutrinário e fornecer conselhos estratégicos sobre as matérias do concurso. 

Como posso ajudá-lo hoje? Você pode me perguntar sobre:
• O rito disciplinar da Lei 14.310/02 (CEDM)
• Crimes militares de deserção, motim ou recusa de obediência (CPM)
• Direitos individuais e garantias fundamentais aplicados à caserna (CF/88)
• Macetes mnemônicos para memorizar artigos extensos

Diga-me o que deseja revisar e cumpriremos a missão!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Trigger initial query if passed from other tabs
  useEffect(() => {
    if (initialPrompt) {
      handleSendMessage(initialPrompt);
      if (onClearInitialPrompt) onClearInitialPrompt();
    }
  }, [initialPrompt]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: `msg-user-${Date.now()}`,
      role: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setIsLoading(true);

    try {
      // Build history payload
      const historyPayload = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const response = await fetch("/api/tutor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: historyPayload
        })
      });

      const data = await response.json();
      
      const modelMsg: Message = {
        id: `msg-model-${Date.now()}`,
        role: "model",
        text: data.text || "Desculpe, combatente. Não compreendi o sinal de rádio. Pode repetir?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, modelMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg: Message = {
        id: `msg-err-${Date.now()}`,
        role: "model",
        text: "Houve um erro de rádio (comunicação com a API). Mantenha a guarda alta e verifique sua conexão ou se a GEMINI_API_KEY está configurada no painel de Secrets.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      handleSendMessage(inputText);
    }
  };

  const prepopulatedTopics = [
    { label: "Mnemônico de Ética Militar", prompt: "Pode me dar um macete ou mnemônico estratégico para memorizar as transgressões graves do CEDM?" },
    { label: "Análise: Art 142 CF/88", prompt: "Faça uma análise profunda para o CHO CBMMG sobre o Artigo 142 da CF/88, destacando o que mais cai." },
    { label: "Crimes CPM: Motim vs Revolta", prompt: "Qual a diferença exata para fins de prova entre o crime de Motim e o de Revolta no Código Penal Militar?" },
    { label: "Dicas de Redação CBMMG", prompt: "Quais as principais recomendações e estrutura ideal para a prova de redação do concurso do CBMMG?" }
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl flex flex-col h-[calc(100vh-140px)] shadow-sm overflow-hidden" id="tutor-chat-box">
      {/* Header Info */}
      <div className="bg-slate-50 border-b border-slate-200 p-4 flex justify-between items-center shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-indigo-700 border border-indigo-200/50 flex items-center justify-center relative">
            <Bot className="w-5.5 h-5.5 text-white" />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-slate-800">
                Estratégia IA: Major Aranha
              </h3>
              <span className="text-[9px] font-sans font-extrabold text-white bg-indigo-600 px-1.5 py-0.5 rounded uppercase">
                Oficial CBMMG
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-sans mt-0.5">
              Instrutor e Especialista em Legislação Militar • Pronto para apoiar sua missão
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            if (confirm("Confirmar a limpeza de todo o histórico de conversas com o Major Aranha?")) {
              setMessages([messages[0]]);
            }
          }}
          className="text-[10px] font-mono font-bold text-slate-500 hover:text-indigo-600 uppercase tracking-wider cursor-pointer transition-colors px-3 py-1.5 rounded border border-slate-200 hover:border-indigo-200 bg-white"
        >
          Limpar Rádio
        </button>
      </div>

      {/* Message History Panel */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50">
        {messages.map((m) => {
          const isModel = m.role === "model";
          return (
            <div
              key={m.id}
              className={`flex space-x-3 max-w-3xl ${isModel ? "mr-auto" : "ml-auto flex-row-reverse space-x-reverse"}`}
            >
              {/* Avatar indicator */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                isModel 
                  ? "bg-indigo-50 border-indigo-200/50 text-indigo-600" 
                  : "bg-slate-200 border-slate-300 text-slate-600"
              }`}>
                {isModel ? <Bot className="w-4 h-4 text-indigo-600" /> : <User className="w-4 h-4" />}
              </div>

              {/* Message box */}
              <div className="space-y-1">
                <div className={`p-4 rounded-2xl text-xs leading-relaxed shadow-sm whitespace-pre-wrap ${
                  isModel 
                    ? "bg-white border border-slate-200/80 text-slate-700 rounded-tl-none" 
                    : "bg-indigo-600 text-white rounded-tr-none"
                }`}>
                  {m.text}
                </div>
                <div className={`text-[9px] font-mono text-slate-400 ${isModel ? "text-left pl-1" : "text-right pr-1"}`}>
                  {m.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Bubble */}
        {isLoading && (
          <div className="flex space-x-3 max-w-xl mr-auto">
            <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200/50 text-indigo-600 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-bounce" />
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none text-xs text-slate-500 flex items-center space-x-2 shadow-sm">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
              <span className="font-mono uppercase text-[10px] tracking-wider">Major Aranha está redigindo parecer doutrinário...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Actionable Prep Chips */}
      {messages.length === 1 && !isLoading && (
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 shrink-0">
          <p className="text-[10px] font-mono uppercase text-slate-500 mb-2 flex items-center space-x-1 font-bold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Módulos de Consulta Rápida</span>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
            {prepopulatedTopics.map((topic, index) => (
              <button
                key={index}
                onClick={() => handleSendMessage(topic.prompt)}
                className="text-left text-[11px] text-slate-600 hover:text-indigo-600 bg-white border border-slate-200 rounded-lg p-2.5 hover:border-indigo-300 transition-all cursor-pointer truncate"
              >
                <strong>{topic.label}</strong>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input box */}
      <div className="p-4 border-t border-slate-200 bg-white shrink-0">
        <form onSubmit={handleFormSubmit} className="flex items-stretch space-x-3">
          <button
            type="button"
            onClick={() => alert("O suporte a upload de áudio e arquivos da caserna está homologado apenas em conexões criptografadas de rádio militar. Digite sua dúvida.")}
            className="p-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-500 hover:text-slate-800 rounded-xl transition-colors cursor-pointer"
            title="Anexar arquivo"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          
          <button
            type="button"
            onClick={() => handleSendMessage("O rito disciplinar previsto no Artigo 13 do CEDM")}
            className="p-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-500 hover:text-slate-800 rounded-xl transition-colors cursor-pointer"
            title="Capturar microfone"
          >
            <Mic className="w-5 h-5" />
          </button>

          <input
            id="tutor-chat-input"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Pergunte ao Major Aranha: 'Explique o rito do PAD no CEDM'..."
            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-600"
          />

          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className="px-5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white rounded-xl font-sans font-bold text-xs uppercase transition-colors flex items-center justify-center space-x-1.5 cursor-pointer border-none shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Enviar</span>
          </button>
        </form>
      </div>
    </div>
  );
}
