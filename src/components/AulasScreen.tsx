import React, { useState } from "react";
import { 
  Play, Pause, Volume2, Maximize, FileText, CheckCircle, 
  Lock, ArrowRight, Sparkles, BookOpen, Send, Bot, ShieldAlert 
} from "lucide-react";

interface AulasScreenProps {
  onAskTutor: (question: string) => void;
  disciplineName?: string;
}

export default function AulasScreen({ onAskTutor, disciplineName }: AulasScreenProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<"resumo" | "pdf" | "questoes" | "flashcards">("resumo");
  const [chatInput, setChatInput] = useState("");

  const displayDiscipline = disciplineName || "Legislação Militar";

  const playlist = [
    { id: 1, title: `Aula 01: Introdução a ${displayDiscipline}`, duration: "24m", completed: true },
    { id: 2, title: `Aula 02: Teoria Geral e Doutrina de ${displayDiscipline}`, duration: "18m", completed: true },
    { id: 3, title: `Aula 03: Elementos Essenciais - ${displayDiscipline}`, duration: "32m", completed: true },
    { id: 4, title: `Aula 04: Casos Práticos e Jurisprudência`, duration: "28m", completed: true },
    { id: 5, title: `Aula 05: Aprofundamento no Edital CHO (Ativa)`, duration: "45m", active: true },
    { id: 6, title: `Aula 06: Organização das Forças Auxiliares`, duration: "20m", locked: true },
    { id: 7, title: `Aula 07: Exercícios Resolvidos de Concurso`, duration: "35m", locked: true },
    { id: 8, title: `Aula 08: Resumos e Dicas de Prova`, duration: "40m", locked: true }
  ];

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim()) {
      onAskTutor(chatInput);
      setChatInput("");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="aulas-view-container">
      {/* Video and Tabs Column (Left & Center) */}
      <div className="lg:col-span-2 space-y-6">
        {/* Mock Video Player */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg relative aspect-video flex flex-col justify-between group">
          {/* Top Info Overlay */}
          <div className="bg-gradient-to-b from-black/80 to-transparent p-4 flex justify-between items-center z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <div>
              <span className="text-[9px] font-mono text-amber-400 uppercase tracking-wider font-semibold">
                Módulo 01 • Aula 05
              </span>
              <h3 className="text-sm font-sans font-bold text-gray-100">
                {displayDiscipline} - Tópicos e Edital CHO
              </h3>
            </div>
            <span className="text-xs font-mono text-gray-300 bg-black/60 px-2 py-0.5 rounded">
              HD 1080p
            </span>
          </div>

          {/* Central Play/Pause Overlay */}
          <div className="absolute inset-0 flex items-center justify-center z-0">
            {/* Visual simulation screen */}
            <div className="absolute inset-0 bg-slate-950/75 flex items-center justify-center">
              <div className="text-center p-6 space-y-4 max-w-md">
                <ShieldAlert className="w-16 h-16 text-emerald-600 mx-auto opacity-40 animate-pulse" />
                <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">
                  Centro de Doutrina Cabo Véio
                </p>
                <h4 className="text-lg font-sans font-bold text-gray-100">
                  AULA 05: Bases do Regulamento e Caserna
                </h4>
              </div>
            </div>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-16 h-16 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-lg transition-all transform hover:scale-110 active:scale-95 z-10 cursor-pointer border-none"
            >
              {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
            </button>
          </div>

          {/* Bottom Control Bar Overlay */}
          <div className="bg-gradient-to-t from-black/90 to-transparent p-4 space-y-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Timeline slider */}
            <div className="w-full h-1 bg-gray-800 rounded-full cursor-pointer relative">
              <div className="absolute top-0 left-0 h-full bg-indigo-600 rounded-full" style={{ width: isPlaying ? "40%" : "25%" }} />
              <div className="absolute top-[-3px] w-2.5 h-2.5 rounded-full bg-indigo-600 shadow" style={{ left: isPlaying ? "40%" : "25%" }} />
            </div>

            <div className="flex justify-between items-center text-xs font-mono text-gray-300">
              <div className="flex items-center space-x-4">
                <button onClick={() => setIsPlaying(!isPlaying)} className="hover:text-indigo-500 transition-colors cursor-pointer">
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <span className="text-[11px]">{isPlaying ? "18:24" : "11:15"} / 45:00</span>
              </div>
              <div className="flex items-center space-x-4">
                <Volume2 className="w-4 h-4 cursor-pointer hover:text-white" />
                <Maximize className="w-4 h-4 cursor-pointer hover:text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Tab Selection menu */}
        <div className="bg-slate-100 border border-slate-200 rounded-xl p-1.5 flex space-x-2">
          <button
            onClick={() => setActiveTab("resumo")}
            className={`flex-1 py-2 text-xs font-sans font-bold uppercase rounded-lg transition-all cursor-pointer ${
              activeTab === "resumo" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Resumo IA
          </button>
          <button
            onClick={() => setActiveTab("pdf")}
            className={`flex-1 py-2 text-xs font-sans font-bold uppercase rounded-lg transition-all cursor-pointer ${
              activeTab === "pdf" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Materiais PDF
          </button>
          <button
            onClick={() => setActiveTab("questoes")}
            className={`flex-1 py-2 text-xs font-sans font-bold uppercase rounded-lg transition-all cursor-pointer ${
              activeTab === "questoes" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Questões
          </button>
          <button
            onClick={() => setActiveTab("flashcards")}
            className={`flex-1 py-2 text-xs font-sans font-bold uppercase rounded-lg transition-all cursor-pointer ${
              activeTab === "flashcards" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Flashcards
          </button>
        </div>

        {/* Tab Content Display */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 min-h-[250px] shadow-sm">
          {activeTab === "resumo" && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-indigo-600 pb-3 border-b border-slate-100">
                <Sparkles className="w-5 h-5" />
                <h4 className="text-sm font-sans font-bold uppercase tracking-wider">
                  Resumo Estruturado pela Inteligência Artificial
                </h4>
              </div>
              <div className="text-xs text-slate-600 leading-relaxed space-y-4">
                <p>
                  A <strong>hierarquia e a disciplina</strong> são declaradas expressamente pela Constituição Federal de 1988 (Art. 142) como as bases cardinais das instituições militares. Elas informam toda a cadeia de comando e a conduta cotidiana na caserna.
                </p>
                <div>
                  <h5 className="font-sans font-bold text-slate-800 mb-2 uppercase text-[11px] font-mono tracking-wider">
                    Tópicos Principais Abordados:
                  </h5>
                  <ul className="list-disc list-inside space-y-2 pl-2 text-slate-600">
                    <li><strong className="text-slate-800">Definição de Hierarquia:</strong> É a ordenação da autoridade, em níveis diferentes, dentro da estrutura das forças de segurança estaduais. A ordenação se faz por postos (oficiais) ou graduações (praças).</li>
                    <li><strong className="text-slate-800">Definição de Disciplina:</strong> É o rigoroso cumprimento e a pronta observância das leis, regulamentos, diretrizes e ordens das autoridades competentes.</li>
                    <li><strong className="text-slate-800">O Dever de Obediência:</strong> A ordem legal exige pronta execução. Ordens manifestamente ilegais, contudo, não devem ser cumpridas, respondendo o superior pelos excessos cometidos.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === "pdf" && (
            <div className="space-y-4">
              <h4 className="text-sm font-sans font-bold text-slate-800 uppercase tracking-wider mb-2">
                Arquivos e Referências do Módulo
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-8 h-8 text-indigo-500 shrink-0" />
                    <div>
                      <h5 className="text-xs font-sans font-bold text-slate-800">Doutrina Oficial: Aula 05</h5>
                      <p className="text-[10px] text-slate-500 font-mono">PDF • 4.2 MB</p>
                    </div>
                  </div>
                  <button
                    onClick={() => alert("Donwload iniciado do PDF da Aula 05.")}
                    className="text-[10px] text-indigo-600 hover:text-indigo-700 uppercase font-bold cursor-pointer"
                  >
                    Baixar
                  </button>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-8 h-8 text-amber-500 shrink-0" />
                    <div>
                      <h5 className="text-xs font-sans font-bold text-slate-800">Mapeamento Mnemônico</h5>
                      <p className="text-[10px] text-slate-500 font-mono">PDF • 1.8 MB</p>
                    </div>
                  </div>
                  <button
                    onClick={() => alert("Download do mnemônico tático iniciado.")}
                    className="text-[10px] text-indigo-600 hover:text-indigo-700 uppercase font-bold cursor-pointer"
                  >
                    Baixar
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "questoes" && (
            <div className="space-y-4">
              <h4 className="text-sm font-sans font-bold text-slate-800 uppercase tracking-wider mb-2">
                Questões Recomendadas para Fixação
              </h4>
              <p className="text-xs text-slate-500">
                Sugerimos resolver a questão <strong>Q-28491</strong> relacionada a essa matéria para consolidar seu aprendizado.
              </p>
              <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0">
                <div>
                  <span className="text-[10px] font-mono text-indigo-700 bg-indigo-50 border border-indigo-200/50 px-2 py-0.5 rounded">
                    Código: Q-28491
                  </span>
                  <h5 className="text-xs font-sans font-semibold text-slate-800 mt-2">
                    Questão de Concurso: Forças Armadas e Segurança na CF/88
                  </h5>
                </div>
                <button
                  onClick={() => alert("Redirecionando para aba de Questões...")}
                  className="py-1.5 px-3 bg-indigo-600 text-white hover:bg-indigo-700 font-sans font-bold text-xs uppercase rounded transition-colors cursor-pointer border-none"
                >
                  RESOLVER QUESTÃO
                </button>
              </div>
            </div>
          )}

          {activeTab === "flashcards" && (
            <div className="space-y-4">
              <h4 className="text-sm font-sans font-bold text-slate-800 uppercase tracking-wider mb-2">
                Memorização Ativa por Flashcards (Active Recall)
              </h4>
              <p className="text-xs text-slate-500">
                Teste sua retenção mental sobre os conceitos fundamentais explicados na aula.
              </p>
              <div className="p-6 bg-slate-50 border border-slate-200/60 rounded-xl text-center max-w-md mx-auto space-y-4">
                <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">
                  Frente do Cartão (Pergunta)
                </span>
                <p className="text-sm font-sans font-bold text-slate-800">
                  Qual é a diferença fundamental entre postos e graduações na PMMG?
                </p>
                <button
                  onClick={() => alert("Resposta: Postos são de oficiais, conferidos por ato do Governador do Estado. Graduações são de praças, conferidos pelo Comandante Geral da instituição.")}
                  className="px-4 py-2 bg-indigo-50 text-indigo-700 border border-indigo-200/50 rounded-lg text-xs font-sans font-semibold uppercase hover:bg-indigo-100/60 transition-all cursor-pointer"
                >
                  REVELAR RESPOSTA
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Playlist & Tutor IA Support panel */}
      <div className="space-y-6">
        {/* Playlist Panel */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500">
              Playlist do Curso
            </h3>
            <span className="text-xs font-mono text-indigo-600 font-bold">5 / 8 Aulas</span>
          </div>

          <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
            {playlist.map((item) => (
              <div
                key={item.id}
                className={`p-3 rounded-lg flex items-center justify-between border transition-all ${
                  item.active 
                    ? "bg-indigo-50 border-indigo-200/50 text-indigo-700 font-bold" 
                    : item.locked 
                      ? "bg-slate-50/50 border-slate-100 text-slate-400" 
                      : "bg-slate-50 border-slate-100 hover:bg-slate-100/80 text-slate-600"
                }`}
              >
                <div className="flex items-center space-x-2.5 overflow-hidden">
                  {item.completed ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : item.locked ? (
                    <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <Play className={`w-4 h-4 shrink-0 ${item.active ? "text-indigo-600 fill-current" : "text-slate-400"}`} />
                  )}
                  <span className="text-xs font-sans truncate pr-1">{item.title}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 shrink-0">{item.duration}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tutor IA Question Panel */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 mb-2 flex items-center space-x-1.5">
            <Bot className="w-4 h-4 text-indigo-600" />
            <span>Tutor IA Online</span>
          </h3>
          <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">
            Tem dúvida sobre o conteúdo desta aula? Pergunte ao Major Aranha:
          </p>

          <form onSubmit={handleSendChat} className="space-y-3">
            <textarea
              id="tutor-lesson-ask"
              rows={2}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ex: Como o art. 142 da CF se aplica aos policiais militares de Minas?"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-600 resize-none"
            />
            <button
              type="submit"
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-sans font-bold uppercase rounded-lg transition-colors flex items-center justify-center space-x-1 cursor-pointer border-none shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Enviar Pergunta</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
