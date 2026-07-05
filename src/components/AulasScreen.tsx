import React, { useState, useEffect } from "react";
import { 
  Play, Pause, Volume2, Maximize, FileText, CheckCircle, 
  Lock, ArrowRight, Sparkles, BookOpen, Send, Bot, ShieldAlert,
  ArrowLeft, XCircle, Minimize, X, Presentation
} from "lucide-react";
import { supabase } from "../lib/supabase";

interface AulasScreenProps {
  onAskTutor: (question: string) => void;
  disciplineName?: string;
  rawDiscipline?: any;
}

export default function AulasScreen({ onAskTutor, disciplineName, rawDiscipline }: AulasScreenProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<"resumo" | "pdf" | "questoes" | "flashcards" | "audios" | "slides">("resumo");
  const [chatInput, setChatInput] = useState("");

  const displayDiscipline = disciplineName || "Legislação Militar";

  const [questions, setQuestions] = useState<any[]>([]);
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [summaries, setSummaries] = useState<any[]>([]);
  const [pdfs, setPdfs] = useState<any[]>([]);
  const [audios, setAudios] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [slides, setSlides] = useState<any[]>([]);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isQuestionAnswered, setIsQuestionAnswered] = useState(false);

  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [isFlashcardFlipped, setIsFlashcardFlipped] = useState(false);

  const [activeSummaryIndex, setActiveSummaryIndex] = useState(0);

  const [viewingPdfUrl, setViewingPdfUrl] = useState<string | null>(null);
  const [viewingPdfTitle, setViewingPdfTitle] = useState<string>("");
  const [isPdfMaximized, setIsPdfMaximized] = useState(false);

  const [viewingAudioUrl, setViewingAudioUrl] = useState<string | null>(null);
  const [viewingAudioTitle, setViewingAudioTitle] = useState<string>("");

  useEffect(() => {
    async function loadResources() {
      try {
        setLoadingQuestions(true);
        
        let loadedQuestions: any[] = [];
        let loadedFlashcards: any[] = [];
        let loadedSummaries: any[] = [];
        let loadedPdfs: any[] = [];
        let loadedAudios: any[] = [];
        let loadedVideos: any[] = [];
        let loadedSlides: any[] = [];

        if (rawDiscipline) {
          if (Array.isArray(rawDiscipline.areas)) {
            rawDiscipline.areas.forEach((area: any) => {
              if (Array.isArray(area.contents)) {
                area.contents.forEach((content: any) => {
                  const res = content.resources || [];
                  res.forEach((r: any) => {
                    if (r.type === 'question' || r.type === 'questoes') {
                      loadedQuestions.push({
                        ...r,
                        questionText: r.questionText || r.title,
                        materiaName: content.name
                      });
                    } else if (r.type === 'flashcard') {
                      loadedFlashcards.push({
                        ...r,
                        materiaName: content.name
                      });
                    } else if (r.type === 'summary') {
                      loadedSummaries.push({
                        ...r,
                        materiaName: content.name
                      });
                    } else if (r.type === 'pdf') {
                      loadedPdfs.push({
                        ...r,
                        materiaName: content.name
                      });
                    } else if (r.type === 'audio') {
                      loadedAudios.push({
                        ...r,
                        materiaName: content.name
                      });
                    } else if (r.type === 'video') {
                      loadedVideos.push({
                        ...r,
                        materiaName: content.name
                      });
                    } else if (r.type === 'slides') {
                      loadedSlides.push({
                        ...r,
                        materiaName: content.name
                      });
                    }
                  });
                });
              }
            });
          }
        } else {
          const { data, error } = await supabase
            .from('materias')
            .eq('discipline', displayDiscipline);
            
          if (error) throw error;
          
          if (data) {
            data.forEach((m: any) => {
              const res = m.resources || [];
              res.forEach((r: any) => {
                if (r.type === 'question' && r.questionText) {
                  loadedQuestions.push({
                    ...r,
                    materiaName: m.name
                  });
                } else if (r.type === 'flashcard' && r.flashcardQuestion) {
                  loadedFlashcards.push({
                    ...r,
                    materiaName: m.name
                  });
                } else if (r.type === 'summary' && r.summaryText) {
                  loadedSummaries.push({
                    ...r,
                    materiaName: m.name
                  });
                } else if (r.type === 'pdf' && r.url) {
                  loadedPdfs.push({
                    ...r,
                    materiaName: m.name
                  });
                } else if (r.type === 'audio' && r.url) {
                  loadedAudios.push({
                    ...r,
                    materiaName: m.name
                  });
                } else if (r.type === 'video' && r.url) {
                  loadedVideos.push({
                    ...r,
                    materiaName: m.name
                  });
                } else if (r.type === 'slides' && r.url) {
                  loadedSlides.push({
                    ...r,
                    materiaName: m.name
                  });
                }
              });
            });
          }
        }

        setQuestions(loadedQuestions);
        setFlashcards(loadedFlashcards);
        setSummaries(loadedSummaries);
        setPdfs(loadedPdfs);
        setAudios(loadedAudios);
        setVideos(loadedVideos);
        setSlides(loadedSlides);
      } catch (err) {
        console.error("Erro ao carregar recursos da matéria:", err);
      } finally {
        setLoadingQuestions(false);
      }
    }
    loadResources();
  }, [displayDiscipline, rawDiscipline]);

  const activeQuestion = questions[currentQuestionIndex] || null;
  const activeFlashcard = flashcards[currentFlashcardIndex] || null;
  const activeSummary = summaries[activeSummaryIndex] || null;

  const handleSelectOption = (letter: string) => {
    if (isQuestionAnswered) return;
    setSelectedOption(letter);
  };

  const handleVerifyAnswer = () => {
    if (!selectedOption) return;
    setIsQuestionAnswered(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsQuestionAnswered(false);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setSelectedOption(null);
      setIsQuestionAnswered(false);
    }
  };

  const handleNextFlashcard = () => {
    if (currentFlashcardIndex < flashcards.length - 1) {
      setCurrentFlashcardIndex(prev => prev + 1);
      setIsFlashcardFlipped(false);
    }
  };

  const handlePrevFlashcard = () => {
    if (currentFlashcardIndex > 0) {
      setCurrentFlashcardIndex(prev => prev - 1);
      setIsFlashcardFlipped(false);
    }
  };

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
        {/* Dynamic Video Player / Lesson selector */}
        {videos.length === 0 ? (
          /* Mock Video Player */
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
        ) : (
          /* Secure Real Video Player & Playlist Selector */
          <div className="space-y-4">
            <div className="bg-black border border-slate-800 rounded-2xl overflow-hidden shadow-lg relative aspect-video">
              <iframe
                src={(() => {
                  const url = videos[activeVideoIndex].url;
                  if (url.includes('drive.google.com')) {
                    const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
                    if (match && match[1]) {
                      return `https://drive.google.com/file/d/${match[1]}/preview`;
                    }
                  }
                  return url;
                })()}
                className="w-full h-full border-none"
                title={videos[activeVideoIndex].title}
                allow="autoplay"
              />
              {/* Película de proteção transparente absoluta que impede cliques nas ações superiores do Google Drive */}
              <div className="absolute top-0 right-0 left-0 h-16 bg-transparent cursor-default" />
            </div>

            {videos.length > 1 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-between">
                <div className="flex items-center space-x-2 text-indigo-600 shrink-0">
                  <Video className="w-4 h-4 animate-pulse" />
                  <span className="text-xs font-bold font-sans uppercase">Aulas Disponíveis nesta Matéria:</span>
                </div>
                <select
                  value={activeVideoIndex}
                  onChange={(e) => setActiveVideoIndex(Number(e.target.value))}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-700 font-bold focus:outline-none focus:border-indigo-500 cursor-pointer max-w-[240px] truncate"
                >
                  {videos.map((v, idx) => (
                    <option key={v.id} value={idx}>{v.title}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

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
          <button
            onClick={() => setActiveTab("audios")}
            className={`flex-1 py-2 text-xs font-sans font-bold uppercase rounded-lg transition-all cursor-pointer ${
              activeTab === "audios" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Áudios
          </button>
          <button
            onClick={() => setActiveTab("slides")}
            className={`flex-1 py-2 text-xs font-sans font-bold uppercase rounded-lg transition-all cursor-pointer ${
              activeTab === "slides" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Slides
          </button>
        </div>

        {/* Tab Content Display */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 min-h-[250px] shadow-sm">
          {activeTab === "resumo" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2 text-indigo-600">
                  <Sparkles className="w-5 h-5" />
                  <h4 className="text-sm font-sans font-bold uppercase tracking-wider">
                    {summaries.length > 0 ? "Resumos Cadastrados" : "Resumo Estruturado pela Inteligência Artificial"}
                  </h4>
                </div>
                {summaries.length > 1 && (
                  <select
                    value={activeSummaryIndex}
                    onChange={(e) => setActiveSummaryIndex(Number(e.target.value))}
                    className="p-1.5 text-[11px] font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-400 transition-all bg-white"
                  >
                    {summaries.map((sum, index) => (
                      <option key={sum.id} value={index}>
                        {sum.title}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {summaries.length > 0 ? (
                <div className="space-y-4">
                  {summaries.length === 1 && (
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                      Resumo da Matéria: {activeSummary.materiaName}
                    </span>
                  )}
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 text-xs text-slate-700 leading-relaxed font-sans whitespace-pre-wrap">
                    <strong className="block text-slate-800 text-sm font-bold mb-3 border-b border-slate-200/60 pb-1.5 uppercase font-display tracking-wide">{activeSummary.title}</strong>
                    {activeSummary.summaryText}
                  </div>
                </div>
              ) : (
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
              )}
            </div>
          )}

          {activeTab === "pdf" && (
            <div className="space-y-4">
              <h4 className="text-sm font-sans font-bold text-slate-800 uppercase tracking-wider mb-2">
                Arquivos e Referências do Módulo
              </h4>
              
              {loadingQuestions ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : pdfs.length === 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Mock PDF 1 */}
                  <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-8 h-8 text-indigo-500 shrink-0" />
                      <div>
                        <h5 className="text-xs font-sans font-bold text-slate-800">Doutrina Oficial: Aula 05</h5>
                        <p className="text-[10px] text-slate-500 font-mono">PDF • Visualização Segura</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setViewingPdfUrl("https://arxiv.org/pdf/2304.12210.pdf");
                        setViewingPdfTitle("Doutrina Oficial: Aula 05");
                      }}
                      className="text-[10px] text-indigo-600 hover:text-indigo-700 uppercase font-bold cursor-pointer font-sans bg-transparent border-none"
                    >
                      Visualizar
                    </button>
                  </div>

                  {/* Mock PDF 2 */}
                  <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-8 h-8 text-amber-500 shrink-0" />
                      <div>
                        <h5 className="text-xs font-sans font-bold text-slate-800">Mapeamento Mnemônico</h5>
                        <p className="text-[10px] text-slate-500 font-mono">PDF • Visualização Segura</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setViewingPdfUrl("https://arxiv.org/pdf/2304.12210.pdf");
                        setViewingPdfTitle("Mapeamento Mnemônico");
                      }}
                      className="text-[10px] text-indigo-600 hover:text-indigo-700 uppercase font-bold cursor-pointer font-sans bg-transparent border-none"
                    >
                      Visualizar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pdfs.map((pdf) => (
                    <div key={pdf.id} className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl flex items-center justify-between">
                      <div className="flex items-center space-x-3 overflow-hidden">
                        <FileText className="w-8 h-8 text-indigo-500 shrink-0" />
                        <div className="truncate pr-2">
                          <h5 className="text-xs font-sans font-bold text-slate-800 truncate">{pdf.title}</h5>
                          <p className="text-[10px] text-slate-500 font-mono truncate">{pdf.materiaName}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setViewingPdfUrl(pdf.url);
                          setViewingPdfTitle(pdf.title);
                        }}
                        className="text-[10px] text-indigo-600 hover:text-indigo-700 uppercase font-bold cursor-pointer font-sans bg-transparent border-none shrink-0"
                      >
                        Visualizar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "questoes" && (
            <div className="space-y-4">
              <h4 className="text-sm font-sans font-bold text-slate-800 uppercase tracking-wider mb-2">
                Questões Práticas de Fixação
              </h4>
              
              {loadingQuestions ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : questions.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200/60">
                  <p className="text-xs text-slate-500 font-medium">Nenhuma questão cadastrada para esta matéria ainda.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Question Header */}
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 border-b border-slate-100 pb-2">
                    <span>Questão {currentQuestionIndex + 1} de {questions.length}</span>
                    <span className="text-indigo-600 font-bold uppercase">{activeQuestion.materiaName}</span>
                  </div>

                  {/* Question Text */}
                  <p className="text-xs font-bold text-slate-800 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                    {activeQuestion.questionText}
                  </p>

                  {/* Options List */}
                  <div className="space-y-2">
                    {(activeQuestion.options || []).map((opt: any) => {
                      const isSelected = selectedOption === opt.letter;
                      const isCorrect = opt.letter === activeQuestion.correctAnswer;
                      
                      let optionStyle = "border-slate-200 bg-white text-slate-700 hover:bg-slate-50";
                      
                      if (isSelected) {
                        optionStyle = "border-indigo-500 bg-indigo-50/30 text-indigo-900 font-medium";
                      }
                      
                      if (isQuestionAnswered) {
                        if (isCorrect) {
                          optionStyle = "border-emerald-500 bg-emerald-50 text-emerald-800 font-medium";
                        } else if (isSelected) {
                          optionStyle = "border-rose-500 bg-rose-50 text-rose-800 font-medium";
                        } else {
                          optionStyle = "border-slate-100 bg-slate-50/40 text-slate-400 cursor-not-allowed";
                        }
                      }

                      return (
                        <button
                          key={opt.letter}
                          disabled={isQuestionAnswered}
                          onClick={() => handleSelectOption(opt.letter)}
                          className={`w-full text-left p-3 border rounded-xl text-xs transition-all flex items-start space-x-3 cursor-pointer ${optionStyle}`}
                        >
                          <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-[9px] font-mono font-bold shrink-0 ${
                            isSelected 
                              ? "bg-indigo-600 border-indigo-600 text-white" 
                              : "border-slate-300 bg-slate-100 text-slate-600"
                          }`}>
                            {opt.letter}
                          </span>
                          <span className="leading-relaxed">{opt.text}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Justification / Explanation */}
                  {isQuestionAnswered && activeQuestion.justification && (
                    <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-900 leading-relaxed animate-smooth-fade space-y-1.5">
                      <div className="flex items-center space-x-1.5 text-indigo-950 font-bold uppercase tracking-wider text-[9px] font-mono">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Justificativa / Explicação:</span>
                      </div>
                      <p className="font-sans text-slate-700">{activeQuestion.justification}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                    <div className="flex space-x-2">
                      <button
                        disabled={currentQuestionIndex === 0}
                        onClick={handlePrevQuestion}
                        className="py-1.5 px-3 bg-white hover:bg-slate-50 disabled:opacity-45 border border-slate-200 text-xs text-slate-600 rounded-lg transition-colors cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5 inline mr-1" />
                        Anterior
                      </button>
                      <button
                        disabled={currentQuestionIndex === questions.length - 1}
                        onClick={handleNextQuestion}
                        className="py-1.5 px-3 bg-white hover:bg-slate-50 disabled:opacity-45 border border-slate-200 text-xs text-slate-600 rounded-lg transition-colors cursor-pointer"
                      >
                        Próxima
                        <ArrowRight className="w-3.5 h-3.5 inline ml-1" />
                      </button>
                    </div>

                    {!isQuestionAnswered ? (
                      <button
                        disabled={!selectedOption}
                        onClick={handleVerifyAnswer}
                        className="py-2 px-5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white disabled:text-slate-400 font-sans font-bold text-xs uppercase rounded-lg transition-all shadow-sm cursor-pointer border-none"
                      >
                        Responder
                      </button>
                    ) : (
                      <div className="flex items-center space-x-2">
                        {selectedOption === activeQuestion.correctAnswer ? (
                          <span className="text-xs font-bold text-emerald-600 flex items-center space-x-1">
                            <CheckCircle className="w-4 h-4" />
                            <span>Acertou!</span>
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-rose-600 flex items-center space-x-1">
                            <XCircle className="w-4 h-4" />
                            <span>Errou (Gabarito: {activeQuestion.correctAnswer})</span>
                          </span>
                        )}
                        {currentQuestionIndex < questions.length - 1 && (
                          <button
                            onClick={handleNextQuestion}
                            className="py-1.5 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/50 font-sans font-bold text-xs uppercase rounded-lg transition-all cursor-pointer"
                          >
                            Avançar
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
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

              {loadingQuestions ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : flashcards.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200/60">
                  <p className="text-xs text-slate-500 font-medium">Nenhum flashcard cadastrado para esta matéria ainda.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Flashcard Header */}
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 border-b border-slate-100 pb-2">
                    <span>Card {currentFlashcardIndex + 1} de {flashcards.length}</span>
                    <span className="text-indigo-600 font-bold uppercase">{activeFlashcard.materiaName}</span>
                  </div>

                  {/* 3D Flipping Card Section */}
                  <div className="flex flex-col items-center justify-center py-6 perspective-1000">
                    <div 
                      onClick={() => setIsFlashcardFlipped(!isFlashcardFlipped)}
                      className="w-full max-w-md h-52 bg-white border border-slate-200 rounded-2xl shadow-md p-6 flex flex-col justify-between items-center text-center cursor-pointer select-none transition-transform duration-500 transform hover:shadow-lg relative"
                      style={{
                        transform: isFlashcardFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                        transformStyle: 'preserve-3d',
                        transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      {!isFlashcardFlipped ? (
                        /* Front Side */
                        <div className="flex flex-col justify-between h-full w-full backface-hidden">
                          <span className="text-[9px] font-mono font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded uppercase tracking-wider self-center">PERGUNTA</span>
                          <p className="text-xs font-bold text-slate-800 leading-relaxed px-4 flex-1 flex items-center justify-center">
                            {activeFlashcard.flashcardQuestion}
                          </p>
                          <span className="text-[10px] text-slate-400 font-medium">Clique no card para virar e ver a resposta</span>
                        </div>
                      ) : (
                        /* Back Side */
                        <div className="flex flex-col justify-between h-full w-full backface-hidden" style={{ transform: 'rotateY(180deg)' }}>
                          <span className="text-[9px] font-mono font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded uppercase tracking-wider self-center">RESPOSTA</span>
                          <p className="text-xs font-bold text-slate-700 leading-relaxed px-4 flex-1 flex items-center justify-center overflow-y-auto">
                            {activeFlashcard.flashcardAnswer}
                          </p>
                          <span className="text-[10px] text-slate-400 font-medium">Clique no card para voltar para a pergunta</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                    <div className="flex space-x-2">
                      <button
                        disabled={currentFlashcardIndex === 0}
                        onClick={handlePrevFlashcard}
                        className="py-1.5 px-3 bg-white hover:bg-slate-50 disabled:opacity-45 border border-slate-200 text-xs text-slate-600 rounded-lg transition-colors cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5 inline mr-1" />
                        Anterior
                      </button>
                      <button
                        disabled={currentFlashcardIndex === flashcards.length - 1}
                        onClick={handleNextFlashcard}
                        className="py-1.5 px-3 bg-white hover:bg-slate-50 disabled:opacity-45 border border-slate-200 text-xs text-slate-600 rounded-lg transition-colors cursor-pointer"
                      >
                        Próximo
                        <ArrowRight className="w-3.5 h-3.5 inline ml-1" />
                      </button>
                    </div>

                    <button
                      onClick={() => setIsFlashcardFlipped(!isFlashcardFlipped)}
                      className="py-2 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-sans font-bold text-xs uppercase rounded-lg transition-all shadow-sm cursor-pointer border-none"
                    >
                      {isFlashcardFlipped ? 'Ver Pergunta' : 'Ver Resposta'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "audios" && (
            <div className="space-y-4">
              <h4 className="text-sm font-sans font-bold text-slate-800 uppercase tracking-wider mb-2">
                Áudios de Estudo
              </h4>
              <p className="text-xs text-slate-500">
                Ouça as aulas gravadas em áudio de forma segura diretamente no portal.
              </p>

              {loadingQuestions ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : audios.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200/60">
                  <p className="text-xs text-slate-500 font-medium">Nenhum áudio de estudo cadastrado para esta matéria ainda.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {audios.map((audio) => (
                    <div key={audio.id} className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl flex items-center justify-between">
                      <div className="flex items-center space-x-3 overflow-hidden">
                        <Volume2 className="w-8 h-8 text-indigo-500 shrink-0" />
                        <div className="truncate pr-2">
                          <h5 className="text-xs font-sans font-bold text-slate-800 truncate">{audio.title}</h5>
                          <p className="text-[10px] text-slate-500 font-mono truncate">{audio.materiaName}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setViewingAudioUrl(audio.url);
                          setViewingAudioTitle(audio.title);
                        }}
                        className="text-[10px] text-indigo-600 hover:text-indigo-700 uppercase font-bold cursor-pointer font-sans bg-transparent border-none shrink-0"
                      >
                        Ouvir
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "slides" && (
            <div className="space-y-4">
              <h4 className="text-sm font-sans font-bold text-slate-800 uppercase tracking-wider mb-2">
                Slides e Apresentações
              </h4>
              <p className="text-xs text-slate-500">
                Acompanhe os slides e materiais visuais das aulas diretamente na plataforma.
              </p>

              {loadingQuestions ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : slides.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200/60">
                  <p className="text-xs text-slate-500 font-medium">Nenhum slide cadastrado para esta matéria ainda.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {slides.map((slide) => (
                    <div key={slide.id} className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl flex items-center justify-between">
                      <div className="flex items-center space-x-3 overflow-hidden">
                        <Presentation className="w-8 h-8 text-indigo-500 shrink-0" />
                        <div className="truncate pr-2">
                          <h5 className="text-xs font-sans font-bold text-slate-800 truncate">{slide.title}</h5>
                          <p className="text-[10px] text-slate-500 font-mono truncate">{slide.materiaName}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setViewingPdfUrl(slide.url);
                          setViewingPdfTitle(slide.title);
                        }}
                        className="text-[10px] text-indigo-600 hover:text-indigo-700 uppercase font-bold cursor-pointer font-sans bg-transparent border-none shrink-0"
                      >
                        Visualizar
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
            <span className="text-xs font-mono text-indigo-600 font-bold">
              {videos.length > 0 ? `${activeVideoIndex + 1} / ${videos.length} Vídeo(s)` : "5 / 8 Aulas"}
            </span>
          </div>

          <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
            {(() => {
              const activePlaylist = videos.length > 0
                ? videos.map((v, idx) => ({
                    id: v.id || idx,
                    title: v.title,
                    duration: "Assistir",
                    active: idx === activeVideoIndex,
                    completed: false,
                    locked: false,
                    onClick: () => setActiveVideoIndex(idx)
                  }))
                : playlist.map((item) => ({
                    ...item,
                    onClick: () => {
                      if (!item.locked) {
                        alert("Esta é uma aula demonstrativa da plataforma.");
                      } else {
                        alert("Aula bloqueada. Cadastre seus próprios vídeos na aba administrativa.");
                      }
                    }
                  }));

              return activePlaylist.map((item) => (
                <div
                  key={item.id}
                  onClick={item.onClick}
                  className={`p-3 rounded-lg flex items-center justify-between border transition-all cursor-pointer ${
                    item.active 
                      ? "bg-indigo-50 border-indigo-200/50 text-indigo-700 font-bold" 
                      : item.locked 
                        ? "bg-slate-50/50 border-slate-100 text-slate-400 cursor-not-allowed" 
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
              ));
            })()}
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

      {viewingPdfUrl && (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-smooth-fade ${isPdfMaximized ? 'p-0' : 'p-4'}`}>
          <div className={`bg-white shadow-xl overflow-hidden flex flex-col transition-all duration-300 ${
            isPdfMaximized 
              ? 'w-screen h-screen rounded-none' 
              : viewingPdfUrl && viewingPdfUrl.includes('docs.google.com/presentation')
                ? 'w-full max-w-3xl rounded-2xl h-auto'
                : 'w-full max-w-5xl h-[85vh] rounded-2xl'
          }`}>
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
              <h3 className="font-display font-bold text-slate-800 flex items-center space-x-2">
                <FileText className="w-5 h-5 text-indigo-500" />
                <span>Visualizador Seguro (Somente Leitura): {viewingPdfTitle}</span>
              </h3>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setIsPdfMaximized(!isPdfMaximized)}
                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer flex items-center space-x-1.5 text-xs font-bold font-sans border-none bg-transparent"
                  title={isPdfMaximized ? "Restaurar" : "Tela Cheia"}
                >
                  {isPdfMaximized ? <Minimize className="w-4 h-4 text-indigo-600" /> : <Maximize className="w-4 h-4 text-indigo-600" />}
                  <span>{isPdfMaximized ? "Minimizar" : "Tela Cheia"}</span>
                </button>
                <button 
                  onClick={() => {
                    setViewingPdfUrl(null);
                    setIsPdfMaximized(false);
                  }}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer border-none bg-transparent"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className={`relative overflow-hidden ${
              !isPdfMaximized && viewingPdfUrl && viewingPdfUrl.includes('docs.google.com/presentation')
                ? 'w-full aspect-video bg-black flex-none'
                : 'flex-1 bg-slate-100'
            }`}>
              <iframe 
                src={(() => {
                  if (!viewingPdfUrl) return '';
                  if (viewingPdfUrl.includes('drive.google.com')) {
                    const match = viewingPdfUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
                    if (match && match[1]) {
                      return `https://drive.google.com/file/d/${match[1]}/preview`;
                    }
                  }
                  if (viewingPdfUrl.includes('docs.google.com/presentation')) {
                    const match = viewingPdfUrl.match(/\/presentation\/d\/([a-zA-Z0-9_-]+)/);
                    if (match && match[1]) {
                      return `https://docs.google.com/presentation/d/${match[1]}/embed?start=false&loop=false&delayms=3000`;
                    }
                  }
                  return `${viewingPdfUrl}#toolbar=0&navpanes=0`;
                })()}
                className="w-full h-full border-none"
                title={viewingPdfTitle}
              />
              {/* Película de proteção transparente absoluta que impede cliques nas ações superiores do Google Drive (fazer cópia, imprimir, abrir no Drive, download) */}
              <div className="absolute top-0 right-0 left-0 h-16 bg-transparent cursor-default" />
              {/* Bloqueio da barra de controle inferior direita para Google Slides (/embed) */}
              {viewingPdfUrl && viewingPdfUrl.includes('docs.google.com/presentation') && (
                <div className="absolute bottom-0 right-0 w-32 h-10 bg-transparent cursor-default" />
              )}
            </div>
          </div>
        </div>
      )}
      {viewingAudioUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-smooth-fade">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
              <h3 className="font-display font-bold text-slate-800 flex items-center space-x-2">
                <Volume2 className="w-5 h-5 text-indigo-500" />
                <span>Player de Áudio Seguro: {viewingAudioTitle}</span>
              </h3>
              <button 
                onClick={() => setViewingAudioUrl(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer border-none bg-transparent"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-8 bg-slate-50 flex flex-col items-center justify-center min-h-[160px]">
              {viewingAudioUrl && viewingAudioUrl.includes('drive.google.com') ? (
                <div className="w-full h-14 relative overflow-hidden rounded-xl border border-slate-200 shadow-sm bg-white">
                  <iframe 
                    src={(() => {
                      const match = viewingAudioUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
                      if (match && match[1]) {
                        return `https://drive.google.com/file/d/${match[1]}/preview`;
                      }
                      return viewingAudioUrl;
                    })()}
                    className="w-full h-full border-none"
                    title={viewingAudioTitle}
                  />
                  {/* Bloqueio físico transparente sobre o botão de pop-out/open in new window no canto superior/direito */}
                  <div className="absolute top-0 right-0 w-16 h-full bg-transparent cursor-default" />
                </div>
              ) : (
                <div className="w-full flex flex-col items-center justify-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <Headphones className="w-8 h-8 text-indigo-500 mb-2" />
                  <audio 
                    src={viewingAudioUrl || ""} 
                    controls 
                    autoPlay 
                    className="w-full"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
