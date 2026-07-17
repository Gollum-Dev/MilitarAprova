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
      text: `Apresente-se, recruta! Sou o Cabo Véio, seu mentor de caserna e especialista na doutrina militar.
Minha missão é te passar os bizus cirúrgicos e a experiência de quem sabe fazer a máquina funcionar para garantir sua aprovação.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleSendMessage(`[Arquivo Anexado: ${file.name}] Por favor, analise este documento.`);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      handleSendMessage("[Mensagem de Áudio processada.]");
    } else {
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        handleSendMessage("Qual o bizu para a prova de legislação militar?");
      }, 3000);
    }
  };
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
        text: data.text || "Desculpe, recruta. Não compreendi o sinal de rádio. Pode repetir a mensagem?",
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



  return (
    <div className="space-y-6 animate-smooth-fade">
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-bold text-white flex items-center">
            <MessageSquare className="w-5 h-5 mr-2 text-indigo-400" />
            Tutor IA Especializado
          </h2>
          <p className="text-sm text-slate-300 mt-1 font-sans">
            Tire suas dúvidas e trace estratégias cirúrgicas com o veterano da caserna.
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl flex flex-col h-[calc(100vh-240px)] shadow-sm overflow-hidden" id="tutor-chat-box">
        {/* Header Info */}
      <div className="bg-slate-50 border-b border-slate-200 p-4 flex justify-between items-center shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full border border-indigo-200/50 flex items-center justify-center relative overflow-hidden bg-slate-100">
            <img src="https://pub-bc0b63de539b4cafb3fdce383cb712fa.r2.dev/Gemini_Generated_Image_6k6ayf6k6ayf6k6a.png" alt="Cabo Véio" className="w-full h-full object-cover" />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-indigo-500 border-2 border-white" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-slate-800">
                Doutrina: Cabo Véio
              </h3>
              <span className="text-[9px] font-sans font-extrabold text-white bg-indigo-700 px-1.5 py-0.5 rounded uppercase">
                Veterano
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-sans mt-0.5">
              Veterano da Caserna • O militar experiente que orienta os recém-chegados
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            if (confirm("Confirmar a limpeza do CHAT com o Cabo Véio?")) {
              setMessages([messages[0]]);
            }
          }}
          className="text-[10px] font-mono font-bold text-slate-500 hover:text-indigo-700 uppercase tracking-wider cursor-pointer transition-colors px-3 py-1.5 rounded border border-slate-200 hover:border-indigo-200 bg-white"
        >
          Limpar CHAT
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
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border overflow-hidden ${
                isModel 
                  ? "border-indigo-200 bg-slate-50" 
                  : "bg-slate-200 border-slate-300 text-slate-600"
              }`}>
                {isModel ? <img src="https://pub-bc0b63de539b4cafb3fdce383cb712fa.r2.dev/Gemini_Generated_Image_6k6ayf6k6ayf6k6a.png" alt="Cabo Véio" className="w-full h-full object-cover" /> : <User className="w-4 h-4" />}
              </div>

              {/* Message box */}
              <div className="space-y-1">
                <div className={`p-4 rounded-2xl text-xs leading-relaxed shadow-sm whitespace-pre-wrap ${
                  isModel 
                    ? "bg-white border border-slate-200/80 text-slate-700 rounded-tl-none" 
                    : "bg-indigo-700 text-white rounded-tr-none"
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
            <div className="w-8 h-8 rounded-full border border-indigo-200/50 flex items-center justify-center shrink-0 overflow-hidden bg-slate-50">
              <img src="https://pub-bc0b63de539b4cafb3fdce383cb712fa.r2.dev/Gemini_Generated_Image_6k6ayf6k6ayf6k6a.png" alt="Cabo Véio" className="w-full h-full object-cover animate-bounce" />
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none text-xs text-slate-500 flex items-center space-x-2 shadow-sm">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-700" />
              <span className="font-mono uppercase text-[10px] tracking-wider">O Cabo Véio está preparando o bizu...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>



      {/* Input box */}
      <div className="p-4 border-t border-slate-200 bg-white shrink-0">
        <form onSubmit={handleFormSubmit} className="flex items-stretch space-x-3">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            accept=".pdf,.doc,.docx,.txt"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-500 hover:text-slate-800 rounded-xl transition-colors cursor-pointer"
            title="Anexar arquivo"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          
          <button
            type="button"
            onClick={toggleRecording}
            className={`p-2.5 border rounded-xl transition-colors cursor-pointer ${
              isRecording 
                ? "bg-rose-100 border-rose-300 text-rose-600 animate-pulse" 
                : "bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-500 hover:text-slate-800"
            }`}
            title="Capturar microfone"
          >
            <Mic className="w-5 h-5" />
          </button>

          <input
            id="tutor-chat-input"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Pergunte ao Cabo Véio: 'Como memorizar o rito do PAD?'..."
            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-700"
          />

          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className="px-5 bg-indigo-700 hover:bg-indigo-800 disabled:bg-slate-200 text-white rounded-xl font-sans font-bold text-xs uppercase transition-colors flex items-center justify-center space-x-1.5 cursor-pointer border-none shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Enviar</span>
          </button>
        </form>
      </div>
      </div>
    </div>
  );
}
