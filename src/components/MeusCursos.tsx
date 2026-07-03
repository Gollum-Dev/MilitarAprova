import React, { useState, useEffect } from "react";
import { 
  BookOpen, FileText, HelpCircle, ChevronRight, Bot, ArrowRight, 
  Award, Trophy, PlayCircle, ArrowLeft, GraduationCap, Video, Layers, Sparkles, Scale, LineChart, Headphones, Play, Pause, Volume2
} from "lucide-react";
import { CourseModule, Course } from "../data";
import { fetchCourses } from "../lib/api";
import AulasScreen from "./AulasScreen";
import QuestoesScreen from "./QuestoesScreen";
import SimuladoresScreen from "./SimuladoresScreen";
import LeisInteligentesScreen from "./LeisInteligentesScreen";
import TutorIAScreen from "./TutorIAScreen";
import DesempenhoScreen from "./DesempenhoScreen";

interface MeusCursosProps {
  onChangeTab: (tab: string) => void;
  onAskTutor: (question: string) => void;
  selectedCourseId: string | null;
  setSelectedCourseId: (id: string | null) => void;
  selectedModuleId: string | null;
  setSelectedModuleId: (id: string | null) => void;
  courseActiveTab: "materias" | "simuladores" | "leis" | "tutor" | "desempenho";
  setCourseActiveTab: (tab: "materias" | "simuladores" | "leis" | "tutor" | "desempenho") => void;
  subjectActiveTab: "aulas" | "materiais" | "questoes" | "flashcards" | "audio";
  setSubjectActiveTab: (tab: "aulas" | "materiais" | "questoes" | "flashcards" | "audio") => void;
  tutorInitialPrompt: string;
  onClearTutorPrompt: () => void;
}

export default function MeusCursos({ 
  onChangeTab, onAskTutor, 
  selectedCourseId, setSelectedCourseId, selectedModuleId, setSelectedModuleId,
  courseActiveTab, setCourseActiveTab, subjectActiveTab, setSubjectActiveTab,
  tutorInitialPrompt, onClearTutorPrompt
}: MeusCursosProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickQuestion, setQuickQuestion] = useState("");
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);

  useEffect(() => {
    fetchCourses().then(data => {
      setCourses(data);
      setLoading(false);
    }).catch(console.error);
  }, []);

  const selectedCourse = courses.find(c => c.id === selectedCourseId) || null;
  const selectedModule = selectedCourse?.modules.find(m => m.id === selectedModuleId) || null;


  const handleAskQuick = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickQuestion.trim()) {
      onAskTutor(quickQuestion);
    }
  };

  const suggestionChips = [
    "Como funciona o rito do PAD no CEDM?",
    "Resuma o Artigo 142 da CF/88.",
    "O que tipifica o crime de recusa de obediência?",
    "O que são Atos Administrativos discricionários?"
  ];

  // Helper mock flashcards for each module
  const getModuleFlashcards = (moduleTitle: string) => {
    if (moduleTitle.includes("Constitucional")) {
      return [
        { q: "Qual a destinação constitucional das Forças Armadas?", a: "Defesa da Pátria, garantia dos poderes constitucionais e da lei e da ordem (Art. 142)." },
        { q: "Cabe Habeas Corpus contra punições disciplinares militares?", a: "Não cabe Habeas Corpus em relação a punições disciplinares militares (Art. 142, § 2º)." }
      ];
    } else if (moduleTitle.includes("Administrativo")) {
      return [
        { q: "Quais são os atributos do ato administrativo?", a: "Presunção de legitimidade, imperatividade, autoexecutoriedade e tipicidade (Mnemônico PATI)." },
        { q: "O que caracteriza a competência administrativa?", a: "Poder legal outorgado ao agente. É irrenunciável, intransferível e inderrogável." }
      ];
    } else if (moduleTitle.includes("Penal Militar")) {
      return [
        { q: "Qual a diferença de Motim e Revolta?", a: "Ambos exigem reunião de militares agindo em grupo. A Revolta exige que estejam armados." },
        { q: "O crime de Recusa de Obediência exige o que?", a: "Recusa expressa em obedecer a ordem de superior sobre assunto de serviço (Art. 163 do CPM)." }
      ];
    } else {
      return [
        { q: "Qual o prazo para conclusão do PAD segundo o CEDM?", a: "O rito sumário ordinário costuma fixar 30 dias prorrogáveis por mais 15 dias." },
        { q: "Quais são as sanções disciplinares do CEDM?", a: "Advertência, repreensão, prestação de serviço, suspensão e demissão." }
      ];
    }
  };

  const currentFlashcards = selectedModule ? getModuleFlashcards(selectedModule.title) : [];

  // View 1: List of all courses
  if (!selectedCourseId) {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      );
    }
    return (
      <div className="space-y-6" id="meus-cursos-list-view">
        <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-display font-extrabold uppercase tracking-wider text-slate-800">
              Meus Cursos Acadêmicos
            </h2>
            <p className="text-xs text-slate-500">Selecione uma especialização para iniciar a preparação tática.</p>
          </div>
          <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 border border-indigo-200/50 px-2.5 py-1 rounded">
            {courses.length} CURSOS ATIVOS
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div 
              key={course.id}
              className="glass-panel hover:border-indigo-400 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              {/* Premium Gradient Header */}
              <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-5 text-white relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
                <span className="text-[9px] font-mono uppercase tracking-widest text-indigo-300 font-bold bg-indigo-500/20 px-2 py-0.5 rounded border border-indigo-500/30">
                  Acesso Liberado
                </span>
                <h3 className="text-sm font-sans font-bold tracking-tight mt-3 line-clamp-1 group-hover:text-indigo-200 transition-colors">
                  {course.title}
                </h3>
              </div>

              {/* Card Stats/Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {course.subtitle}
                </p>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-slate-400">Progresso de Estudo</span>
                    <span className="text-indigo-600 font-bold">35%</span>
                  </div>
                  <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full" style={{ width: "35%" }} />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-center text-[10px] font-mono text-slate-500">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-800 text-xs">{course.hours}h</span>
                    <span>Carga</span>
                  </div>
                  <div className="flex flex-col border-x border-slate-100">
                    <span className="font-bold text-slate-800 text-xs">{course.lessons}</span>
                    <span>Aulas</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-800 text-xs">{course.modules.length}</span>
                    <span>Matérias</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedCourseId(course.id);
                    setCourseActiveTab("materias");
                  }}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-sans font-bold uppercase transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm border-none mt-2 active:scale-95"
                >
                  <span>Estudar Agora</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // View 2: Course Dashboard (Matérias, Simuladores, Leis, Tutor IA, Desempenho)
  if (selectedCourse && !selectedModuleId) {
    return (
      <div className="space-y-6" id="meus-cursos-detail-view">
        {/* Render course content based on active sidebar tab */}
        <div className="mt-2">
          {courseActiveTab === "materias" && (
            <div className="space-y-6">
              {/* Banner */}
              <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 shadow-sm">
                <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
                <div className="space-y-2">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-white bg-white/10 border border-white/20 px-2.5 py-1 rounded">
                    Diretrizes Doutrinárias
                  </span>
                  <h2 className="text-xl md:text-2xl font-sans font-bold text-white tracking-tight mt-1">
                    Módulos Acadêmicos do Curso
                  </h2>
                  <p className="text-xs text-indigo-200 max-w-xl">
                    Selecione uma matéria na lista abaixo ou utilize a barra lateral para acessar ferramentas integradas como Simuladores, Tutor IA e Desempenho.
                  </p>
                </div>
              </div>

              {/* Modules list */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-3">
                  {selectedCourse.modules.map((mod) => (
                    <div 
                      key={mod.id}
                      className="glass-panel hover:border-indigo-300 rounded-xl p-5 flex flex-col justify-between shadow-sm hover:shadow transition-all group"
                    >
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0 pb-3 border-b border-slate-100 mb-3">
                        <div>
                          <h4 className="text-sm font-sans font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                            {mod.title}
                          </h4>
                          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                            {mod.description}
                          </p>
                        </div>
                        <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded border border-indigo-200/50 shrink-0">
                          {mod.progress}% Concluído
                        </span>
                      </div>

                      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-3 md:space-y-0 pt-1">
                        <div className="flex space-x-4 text-[10px] font-mono text-slate-500">
                          <span className="flex items-center space-x-1.5">
                            <PlayCircle className="w-3.5 h-3.5 text-slate-400" />
                            <span>{mod.lessonsCount} Aulas</span>
                          </span>
                          <span className="flex items-center space-x-1.5">
                            <FileText className="w-3.5 h-3.5 text-slate-400" />
                            <span>{mod.pdfsCount} PDFs</span>
                          </span>
                          <span className="flex items-center space-x-1.5">
                            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                            <span>{mod.questionsCount} Questões</span>
                          </span>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedModuleId(mod.id);
                            setSubjectActiveTab("aulas");
                          }}
                          className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-xs font-sans font-bold text-white rounded-lg transition-colors flex items-center justify-center space-x-1 cursor-pointer border-none shadow-sm"
                        >
                          <span>Estudar Matéria</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Right sidebar stats */}
                <div className="space-y-6">
                  <div className="glass-panel rounded-2xl p-5 shadow-sm">
                    <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 mb-4 flex items-center space-x-1.5">
                      <Trophy className="w-4 h-4 text-amber-500" />
                      <span>Estatísticas de Liderança</span>
                    </h3>

                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Horas acumuladas:</span>
                        <span className="text-slate-800 font-mono font-bold">{selectedCourse.hours} horas</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Aulas recomendadas:</span>
                        <span className="text-slate-800 font-mono font-bold">{selectedCourse.lessons}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Disciplinas integradas:</span>
                        <span className="text-slate-800 font-mono font-bold">{selectedCourse.disciplinesCount}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick AI Tutor */}
                  <div className="glass-panel rounded-2xl p-5 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
                    <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 mb-2 flex items-center space-x-1.5">
                      <Bot className="w-4 h-4 text-indigo-600" />
                      <span>Rádio Major Aranha</span>
                    </h3>
                    <form onSubmit={handleAskQuick} className="space-y-3">
                      <input
                        id="quick-ask-input"
                        type="text"
                        value={quickQuestion}
                        onChange={(e) => setQuickQuestion(e.target.value)}
                        placeholder="Perguntar sobre ética ou regulamentos..."
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-600"
                      />
                      <button
                        type="submit"
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-sans font-bold uppercase rounded-lg transition-colors cursor-pointer border-none shadow-sm"
                      >
                        Consultar IA
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}

          {courseActiveTab === "simuladores" && (
            <SimuladoresScreen onAskTutor={onAskTutor} />
          )}

          {courseActiveTab === "leis" && (
            <LeisInteligentesScreen />
          )}

          {courseActiveTab === "tutor" && (
            <TutorIAScreen 
              initialPrompt={tutorInitialPrompt || quickQuestion}
              onClearInitialPrompt={() => {
                onClearTutorPrompt();
                setQuickQuestion("");
              }}
            />
          )}

          {courseActiveTab === "desempenho" && (
            <DesempenhoScreen 
              onStartRecoveryTraining={(subject) => {
                setCourseActiveTab("materias");
                // Pre-select first module
                if (selectedCourse.modules.length > 0) {
                  setSelectedModuleId(selectedCourse.modules[0].id);
                }
              }}
            />
          )}
        </div>
      </div>
    );
  }

  // View 3: Subject/Module Study Dashboard (Aulas, Materiais, Questões, Flashcards)
  if (selectedCourse && selectedModule) {
    const cleanDisciplineName = selectedModule.title.replace(/^Módulo \d+:\s*/, "");

    return (
      <div className="space-y-6" id="meus-cursos-subject-dashboard">
        {/* Tab Content rendering directly controlled by Sidebar subjectActiveTab */}
        <div className="mt-2">
          {subjectActiveTab === "aulas" && (
            <AulasScreen 
              onAskTutor={onAskTutor} 
              disciplineName={cleanDisciplineName}
            />
          )}

          {subjectActiveTab === "audio" && (
            <div className="glass-panel rounded-2xl p-6 shadow-sm space-y-6 animate-smooth-fade">
              <h3 className="text-sm font-display font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2 flex items-center space-x-1.5">
                <Headphones className="w-4.5 h-4.5 text-indigo-600" />
                <span>Áudio Aulas - {cleanDisciplineName}</span>
              </h3>
              
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/3 bg-slate-900 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden group">
                  <div className="absolute inset-0 bg-indigo-500/10 blur-xl pointer-events-none group-hover:bg-indigo-500/20 transition-all"></div>
                  <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-indigo-700 flex items-center justify-center shadow-2xl mb-4 relative z-10">
                    <Headphones className="w-10 h-10 text-white" />
                  </div>
                  <h4 className="text-sm font-display font-bold text-white z-10 truncate w-full px-2">{cleanDisciplineName}</h4>
                  <p className="text-[10px] font-mono text-slate-400 mt-1 z-10">Escute no trânsito ou na academia</p>
                  
                  <div className="mt-6 flex items-center space-x-4 z-10">
                    <button className="w-12 h-12 rounded-full bg-white text-indigo-900 flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-md">
                      <Play className="w-5 h-5 fill-current ml-1" />
                    </button>
                  </div>
                  
                  <div className="w-full mt-4 flex items-center space-x-2 z-10">
                    <span className="text-[10px] text-slate-400 font-mono">00:00</span>
                    <div className="h-1 flex-1 bg-slate-700 rounded-full overflow-hidden relative">
                      <div className="absolute left-0 top-0 h-full bg-indigo-500 w-1/3"></div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">45:30</span>
                  </div>
                </div>
                
                <div className="w-full md:w-2/3 space-y-3">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-slate-500 mb-2">
                    Faixas Disponíveis
                  </h4>
                  
                  {[1, 2, 3, 4, 5].map((track) => (
                    <div key={track} className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl flex items-center justify-between hover:bg-slate-100 transition-colors cursor-pointer group">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                          <Play className="w-3.5 h-3.5 text-indigo-600 fill-current" />
                        </div>
                        <div>
                          <h5 className="text-xs font-sans font-bold text-slate-800">Faixa {track < 10 ? `0${track}` : track}: Revisão Tática</h5>
                          <p className="text-[10px] text-slate-500 font-mono">Parte {track} da Doutrina Oficial</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Volume2 className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span className="text-[10px] font-mono text-slate-400">{15 + track}:00</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {subjectActiveTab === "materiais" && (
            <div className="glass-panel rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-display font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2 flex items-center space-x-1.5">
                <FileText className="w-4.5 h-4.5 text-indigo-600" />
                <span>Biblioteca de Materiais de {cleanDisciplineName}</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-8 h-8 text-indigo-500 shrink-0" />
                    <div>
                      <h5 className="text-xs font-sans font-bold text-slate-800">Doutrina Oficial Integrada - {cleanDisciplineName}</h5>
                      <p className="text-[10px] text-slate-500 font-mono">PDF • 4.5 MB</p>
                    </div>
                  </div>
                  <button
                    onClick={() => alert("Download do PDF da Doutrina iniciado.")}
                    className="text-[10px] text-indigo-600 hover:text-indigo-700 uppercase font-bold cursor-pointer bg-transparent border-none font-sans"
                  >
                    Baixar
                  </button>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-8 h-8 text-indigo-500 shrink-0" />
                    <div>
                      <h5 className="text-xs font-sans font-bold text-slate-800">Resumo Esquemático & Mnemônicos</h5>
                      <p className="text-[10px] text-slate-500 font-mono">PDF • 2.1 MB</p>
                    </div>
                  </div>
                  <button
                    onClick={() => alert("Download do PDF de Resumos iniciado.")}
                    className="text-[10px] text-indigo-600 hover:text-indigo-700 uppercase font-bold cursor-pointer bg-transparent border-none font-sans"
                  >
                    Baixar
                  </button>
                </div>
              </div>
            </div>
          )}

          {subjectActiveTab === "questoes" && (
            <QuestoesScreen 
              discipline={cleanDisciplineName}
            />
          )}

          {subjectActiveTab === "flashcards" && (
            <div className="max-w-xl mx-auto space-y-6">
              <div className="text-center">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Cartão {currentFlashcardIndex + 1} de {currentFlashcards.length}</span>
                <h3 className="text-base font-sans font-bold uppercase tracking-wider text-slate-800 mt-1">Memorização Espaçada Inteligente</h3>
              </div>

              {currentFlashcards.length > 0 ? (
                <div className="space-y-4">
                  {/* Flappable Card */}
                  <div 
                    onClick={() => setFlashcardFlipped(!flashcardFlipped)}
                    className="glass-panel border-2 border-dashed border-indigo-200 hover:border-indigo-400 rounded-2xl p-10 min-h-[180px] flex flex-col justify-center items-center text-center cursor-pointer shadow-sm transition-all"
                  >
                    {!flashcardFlipped ? (
                      <div className="space-y-3">
                        <span className="text-[9px] font-mono text-indigo-600 uppercase font-extrabold bg-indigo-50 px-2 py-0.5 rounded">FRENTE</span>
                        <p className="text-base font-sans font-bold text-slate-800">
                          {currentFlashcards[currentFlashcardIndex].q}
                        </p>
                        <span className="text-[10px] text-slate-400 block font-mono">Clique para revelar resposta</span>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <span className="text-[9px] font-mono text-emerald-600 uppercase font-extrabold bg-emerald-50 px-2 py-0.5 rounded">VERSO</span>
                        <p className="text-sm font-sans text-slate-700 leading-relaxed font-semibold italic">
                          {currentFlashcards[currentFlashcardIndex].a}
                        </p>
                        <span className="text-[10px] text-slate-400 block font-mono">Clique para ver a pergunta</span>
                      </div>
                    )}
                  </div>

                  {/* Controls */}
                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => {
                        setFlashcardFlipped(false);
                        setCurrentFlashcardIndex(prev => (prev > 0 ? prev - 1 : currentFlashcards.length - 1));
                      }}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-sans font-bold uppercase rounded-lg transition-colors cursor-pointer border-none"
                    >
                      Anterior
                    </button>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          alert("Combatente! Esse cartão foi marcado para revisão em 1 dia.");
                          setFlashcardFlipped(false);
                          setCurrentFlashcardIndex(prev => (prev < currentFlashcards.length - 1 ? prev + 1 : 0));
                        }}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-sans font-bold uppercase rounded-lg border-none cursor-pointer"
                      >
                        Difícil
                      </button>
                      <button
                        onClick={() => {
                          alert("Combatente! Esse cartão foi marcado para revisão em 4 dias.");
                          setFlashcardFlipped(false);
                          setCurrentFlashcardIndex(prev => (prev < currentFlashcards.length - 1 ? prev + 1 : 0));
                        }}
                        className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 text-[10px] font-sans font-bold uppercase rounded-lg border-none cursor-pointer"
                      >
                        Médio
                      </button>
                      <button
                        onClick={() => {
                          alert("Combatente! Esse cartão foi marcado para revisão em 7 dias.");
                          setFlashcardFlipped(false);
                          setCurrentFlashcardIndex(prev => (prev < currentFlashcards.length - 1 ? prev + 1 : 0));
                        }}
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-sans font-bold uppercase rounded-lg border-none cursor-pointer"
                      >
                        Fácil
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        setFlashcardFlipped(false);
                        setCurrentFlashcardIndex(prev => (prev < currentFlashcards.length - 1 ? prev + 1 : 0));
                      }}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-sans font-bold uppercase rounded-lg transition-colors cursor-pointer border-none"
                    >
                      Próximo
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400">Nenhum flashcard disponível para este módulo.</div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
