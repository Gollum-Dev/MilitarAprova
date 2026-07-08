import React, { useState, useEffect } from "react";
import { 
  Play, Pause, Volume2, Maximize, FileText, CheckCircle, 
  Lock, ArrowRight, Sparkles, BookOpen, Send, Bot, ShieldAlert,
  ArrowLeft, XCircle, Minimize, X, Presentation, Video, Headphones, ChevronDown
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { recordQuestionAnswer, markResourceComplete, getResourceStatuses, setResourceStatus } from "../lib/progress";
import PdfSlidesViewer from "./PdfSlidesViewer";

// Custom Premium Status Selector
const StatusSelector = ({ 
  resourceId, 
  currentStatus, 
  onStatusChange 
}: { 
  resourceId: string; 
  currentStatus: 'a-estudar' | 'estudando' | 'estudado'; 
  onStatusChange: (status: 'a-estudar' | 'estudando' | 'estudado') => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClose = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("click", handleClose);
    return () => document.removeEventListener("click", handleClose);
  }, [isOpen]);

  let colorClass = "bg-rose-50/70 border-rose-200/50 text-rose-700 hover:bg-rose-50";
  let dotColor = "bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.5)]";
  let label = "A Estudar";

  if (currentStatus === 'estudando') {
    colorClass = "bg-amber-50/70 border-amber-200/50 text-amber-700 hover:bg-amber-50";
    dotColor = "bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.5)]";
    label = "Estudando";
  } else if (currentStatus === 'estudado') {
    colorClass = "bg-emerald-50/70 border-emerald-200/50 text-emerald-700 hover:bg-emerald-50";
    dotColor = "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]";
    label = "Estudado";
  }

  const handleSelect = (status: 'a-estudar' | 'estudando' | 'estudado', e: React.MouseEvent) => {
    e.stopPropagation();
    onStatusChange(status);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative inline-block shrink-0 z-30">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`flex items-center space-x-1.5 text-[9.5px] font-sans font-extrabold uppercase rounded-full px-3 py-1.5 border cursor-pointer transition-all duration-200 shadow-sm ${colorClass}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
        <span className="tracking-wider">{label}</span>
        <ChevronDown className="w-3.5 h-3.5 opacity-60" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-28 bg-white border border-slate-100 rounded-2xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)] py-1.5 z-50 animate-smooth-fade">
          <button
            onClick={(e) => handleSelect('a-estudar', e)}
            className="w-full text-left px-2.5 py-1.5 hover:bg-slate-50 text-[10px] font-sans text-slate-700 flex items-center space-x-2 border-none bg-transparent cursor-pointer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span className="font-bold uppercase tracking-wider text-[9px]">A Estudar</span>
          </button>
          <button
            onClick={(e) => handleSelect('estudando', e)}
            className="w-full text-left px-2.5 py-1.5 hover:bg-slate-50 text-[10px] font-sans text-slate-700 flex items-center space-x-2 border-none bg-transparent cursor-pointer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span className="font-bold uppercase tracking-wider text-[9px]">Estudando</span>
          </button>
          <button
            onClick={(e) => handleSelect('estudado', e)}
            className="w-full text-left px-2.5 py-1.5 hover:bg-slate-50 text-[10px] font-sans text-slate-700 flex items-center space-x-2 border-none bg-transparent cursor-pointer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="font-bold uppercase tracking-wider text-[9px]">Estudado</span>
          </button>
        </div>
      )}
    </div>
  );
};

interface AulasScreenProps {
  onAskTutor: (question: string) => void;
  disciplineName?: string;
  rawDiscipline?: any;
  selectedContentId?: number | null;
}

export default function AulasScreen({ onAskTutor, disciplineName, rawDiscipline, selectedContentId }: AulasScreenProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<"resumo" | "pdf" | "questoes" | "flashcards" | "audios" | "slides">("resumo");
  const [chatInput, setChatInput] = useState("");

  const [resourceStatuses, setResourceStatuses] = useState<Record<string, 'a-estudar' | 'estudando' | 'estudado'>>({});

  useEffect(() => {
    setResourceStatuses(getResourceStatuses());
  }, []);

  const renderStatusIndicator = (resourceId: string) => {
    const currentStatus = resourceStatuses[resourceId] || 'a-estudar';
    return (
      <StatusSelector
        resourceId={resourceId}
        currentStatus={currentStatus}
        onStatusChange={(nextStatus) => {
          setResourceStatus(resourceId, nextStatus);
          setResourceStatuses(getResourceStatuses());
        }}
      />
    );
  };

  const displayDiscipline = disciplineName || "Legislação Militar";

  const [questions, setQuestions] = useState<any[]>([]);
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [summaries, setSummaries] = useState<any[]>([]);
  const [pdfs, setPdfs] = useState<any[]>([]);
  const [audios, setAudios] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [slides, setSlides] = useState<any[]>([]);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);

  useEffect(() => {
    if (videos.length > 0 && videos[activeVideoIndex]) {
      const vid = videos[activeVideoIndex];
      if (vid.id) {
        markResourceComplete(vid.id.toString());
      }
      localStorage.setItem("militar_last_resource_title", vid.title);
    }
  }, [activeVideoIndex, videos]);

  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isQuestionAnswered, setIsQuestionAnswered] = useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [questionStatuses, setQuestionStatuses] = useState<{
    [questionId: string]: {
      opened: boolean;
      answered: boolean;
      correct?: boolean;
      selectedOption?: string;
    }
  }>({});

  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [isFlashcardFlipped, setIsFlashcardFlipped] = useState(false);
  const [flashcardStatuses, setFlashcardStatuses] = useState<{
    [cardId: string]: {
      opened: boolean;
      answered: boolean;
      rating?: "easy" | "medium" | "hard";
    }
  }>({});

  const [activeSummaryIndex, setActiveSummaryIndex] = useState(0);

  const [viewingPdfUrl, setViewingPdfUrl] = useState<string | null>(null);
  const [viewingPdfTitle, setViewingPdfTitle] = useState<string>("");
  const [isPdfMaximized, setIsPdfMaximized] = useState(false);
  const [viewingPdfType, setViewingPdfType] = useState<"pdf" | "slides" | null>(null);

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
                  if (selectedContentId !== undefined && selectedContentId !== null && content.id !== selectedContentId) {
                    return;
                  }
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
        setActiveVideoIndex(0); // Reset index on load
        setCurrentQuestionIndex(0); // Reset other indices too
        setCurrentFlashcardIndex(0);
        setActiveSummaryIndex(0);
      } catch (err) {
        console.error("Erro ao carregar recursos da matéria:", err);
      } finally {
        setLoadingQuestions(false);
      }
    }
    loadResources();
  }, [displayDiscipline, rawDiscipline, selectedContentId]);

  // Efeito para marcar questão ativa como aberta sem causar loop de dependência
  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex >= 0) {
      const activeQ = questions[currentQuestionIndex];
      if (activeQ) {
        localStorage.setItem("militar_last_resource_title", `Questão ${currentQuestionIndex + 1} de ${questions.length}`);
        const qId = activeQ.id?.toString() || currentQuestionIndex.toString();
        setQuestionStatuses(prev => {
          if (prev[qId]?.opened) return prev;
          return {
            ...prev,
            [qId]: {
              opened: true,
              answered: prev[qId]?.answered || false,
              correct: prev[qId]?.correct,
              selectedOption: prev[qId]?.selectedOption
            }
          };
        });
      }
    }
  }, [currentQuestionIndex, questions.length]);

  // Efeito para marcar flashcard ativo como aberto sem causar loop de dependência
  useEffect(() => {
    if (flashcards.length > 0 && currentFlashcardIndex >= 0) {
      const activeCard = flashcards[currentFlashcardIndex];
      if (activeCard) {
        const cardId = activeCard.id?.toString() || currentFlashcardIndex.toString();
        setFlashcardStatuses(prev => {
          if (prev[cardId]?.opened) return prev;
          return {
            ...prev,
            [cardId]: {
              opened: true,
              answered: prev[cardId]?.answered || false,
              rating: prev[cardId]?.rating
            }
          };
        });
      }
    }
  }, [currentFlashcardIndex, flashcards.length]);

  const activeQuestion = questions[currentQuestionIndex] || null;
  const activeFlashcard = flashcards[currentFlashcardIndex] || null;
  const activeSummary = summaries[activeSummaryIndex] || null;

  const handleSelectOption = (letter: string) => {
    if (isQuestionAnswered) return;
    setSelectedOption(letter);
  };

  const handleVerifyAnswer = () => {
    if (!selectedOption || !activeQuestion) return;
    setIsQuestionAnswered(true);
    const isCorrect = selectedOption === activeQuestion.correctAnswer;
    recordQuestionAnswer(isCorrect);

    // Salvar estado da resposta no dicionário global de progresso
    const qId = activeQuestion.id?.toString() || currentQuestionIndex.toString();
    setQuestionStatuses(prev => ({
      ...prev,
      [qId]: {
        opened: true,
        answered: true,
        correct: isCorrect,
        selectedOption: selectedOption
      }
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      const nextIdx = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIdx);
      const nextQ = questions[nextIdx];
      const qId = nextQ.id?.toString() || nextIdx.toString();
      const status = questionStatuses[qId];
      if (status) {
        setSelectedOption(status.selectedOption || null);
        setIsQuestionAnswered(status.answered || false);
      } else {
        setSelectedOption(null);
        setIsQuestionAnswered(false);
      }
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      const prevIdx = currentQuestionIndex - 1;
      setCurrentQuestionIndex(prevIdx);
      const prevQ = questions[prevIdx];
      const qId = prevQ.id?.toString() || prevIdx.toString();
      const status = questionStatuses[qId];
      if (status) {
        setSelectedOption(status.selectedOption || null);
        setIsQuestionAnswered(status.answered || false);
      } else {
        setSelectedOption(null);
        setIsQuestionAnswered(false);
      }
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
      <div className="lg:col-span-2 space-y-4">
        {/* Dynamic Video Player / Lesson selector */}
        {activeTab === "questoes" && activeQuestion ? (
          /* Render Active Question Card in place of Video Player */
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md space-y-6">
            {/* Metadata bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono text-slate-500 border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2">
                <span className="bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded text-[10px]">Questão {currentQuestionIndex + 1} de {questions.length}</span>
                <span>•</span>
                <span className="font-semibold text-slate-700">{activeQuestion.banca || "Militar Aprova"}</span>
              </div>
              <span className="text-indigo-600 font-bold uppercase tracking-wider text-[10px]">
                {activeQuestion.materiaName}
              </span>
            </div>

            {/* Question Text */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-sm">
              <p className="text-xs md:text-sm font-semibold text-slate-800 leading-relaxed font-sans">
                {activeQuestion.questionText}
              </p>
            </div>

            {/* Options List */}
            <div className="space-y-3">
              {(activeQuestion.options || []).map((opt: any) => {
                const isSelected = selectedOption === opt.letter;
                const isCorrect = opt.letter === activeQuestion.correctAnswer;
                
                let optionStyle = "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300";
                let badgeStyle = "border-slate-300 bg-slate-100 text-slate-600";
                
                if (isSelected) {
                  optionStyle = "border-indigo-500 border-l-4 border-l-indigo-600 bg-indigo-50/20 text-indigo-900 font-bold shadow-sm";
                  badgeStyle = "bg-indigo-600 border-indigo-600 text-white";
                }
                
                if (isQuestionAnswered) {
                  if (isCorrect) {
                    optionStyle = "border-emerald-500 border-l-4 border-l-emerald-600 bg-emerald-50/30 text-emerald-900 font-bold";
                    badgeStyle = "bg-emerald-600 border-emerald-600 text-white";
                  } else if (isSelected) {
                    optionStyle = "border-rose-500 border-l-4 border-l-rose-600 bg-rose-50/30 text-rose-900 font-bold";
                    badgeStyle = "bg-rose-600 border-rose-600 text-white";
                  } else {
                    optionStyle = "border-slate-100 bg-slate-50/40 text-slate-400 cursor-not-allowed opacity-60";
                    badgeStyle = "border-slate-200 bg-slate-100/50 text-slate-400";
                  }
                }

                return (
                  <button
                    key={opt.letter}
                    disabled={isQuestionAnswered}
                    onClick={() => handleSelectOption(opt.letter)}
                    className={`w-full text-left p-3.5 border rounded-2xl text-xs transition-all flex items-start space-x-3 cursor-pointer hover:-translate-y-0.5 active:translate-y-0 ${optionStyle}`}
                  >
                    <span className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-mono font-bold shrink-0 transition-all ${badgeStyle}`}>
                      {opt.letter}
                    </span>
                    <span className="leading-relaxed pt-0.5 flex-1">{opt.text}</span>
                  </button>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-200">
              <div className="flex space-x-2">
                <button
                  disabled={currentQuestionIndex === 0}
                  onClick={handlePrevQuestion}
                  className="py-2 px-4 bg-slate-100 hover:bg-slate-200 disabled:opacity-45 border border-slate-200 text-xs font-bold text-slate-700 rounded-xl transition-all cursor-pointer shadow-sm hover:shadow"
                >
                  <ArrowLeft className="w-3.5 h-3.5 inline mr-1" />
                  Anterior
                </button>
                <button
                  disabled={currentQuestionIndex === questions.length - 1}
                  onClick={handleNextQuestion}
                  className="py-2 px-4 bg-slate-100 hover:bg-slate-200 disabled:opacity-45 border border-slate-200 text-xs font-bold text-slate-700 rounded-xl transition-all cursor-pointer shadow-sm hover:shadow"
                >
                  Próxima
                  <ArrowRight className="w-3.5 h-3.5 inline ml-1" />
                </button>
              </div>

              {!isQuestionAnswered ? (
                <button
                  disabled={!selectedOption}
                  onClick={handleVerifyAnswer}
                  className="py-2 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white disabled:text-slate-400 font-sans font-bold text-xs uppercase rounded-xl transition-all shadow-md cursor-pointer border-none active:scale-[0.98]"
                >
                  Responder
                </button>
              ) : (
                <div className="flex items-center space-x-3">
                  {selectedOption === activeQuestion.correctAnswer ? (
                    <span className="text-xs font-bold text-emerald-600 flex items-center space-x-1.5 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                      <CheckCircle className="w-4 h-4" />
                      <span>Acertou!</span>
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-rose-600 flex items-center space-x-1.5 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100">
                      <XCircle className="w-4 h-4" />
                      <span>Errou (Gabarito: {activeQuestion.correctAnswer})</span>
                    </span>
                  )}
                  {currentQuestionIndex < questions.length - 1 && (
                    <button
                      onClick={handleNextQuestion}
                      className="py-2 px-5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/50 font-sans font-bold text-xs uppercase rounded-xl transition-all cursor-pointer shadow-sm"
                    >
                      Avançar
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : activeTab === "slides" && slides.length > 0 ? (
          /* Render Active Slide inline in place of Video Player */
          <div className="w-full h-[550px] rounded-2xl overflow-hidden shadow-lg border border-slate-800">
            <PdfSlidesViewer
              pdfUrl={slides[activeSlideIndex]?.url || ""}
              title={slides[activeSlideIndex]?.title || ""}
              inline={true}
              initialMode="slides"
              hideModeToggle={false}
            />
          </div>
        ) : videos.length === 0 ? (
          /* Mock Video Player */
          <div id="mock-video-player" className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg relative aspect-video flex flex-col justify-between group">
            {/* Top Info Overlay */}
            <div className="bg-gradient-to-b from-black/80 to-transparent p-4 flex justify-between items-center z-10 opacity-0 group-hover:opacity-100 transition-opacity">
              <div>
                <span className="text-[9px] font-mono text-amber-400 uppercase tracking-wider font-semibold">
                  Módulo 01 • {playlist[activeVideoIndex]?.title?.split(':')[0] || 'Aula 01'}
                </span>
                <h3 className="text-sm font-sans font-bold text-gray-100">
                  {displayDiscipline}
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
                    {playlist[activeVideoIndex]?.title?.toUpperCase() || 'AULA 01'}
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
                  <Maximize 
                    className="w-4 h-4 cursor-pointer hover:text-white" 
                    onClick={() => {
                      const elem = document.getElementById('mock-video-player');
                      if (elem) {
                        if (document.fullscreenElement) {
                          document.exitFullscreen().catch(err => console.log(err));
                        } else {
                          elem.requestFullscreen().catch(err => console.log(err));
                        }
                      }
                    }}
                  />
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
                  const video = videos[activeVideoIndex];
                  if (!video || !video.url) return '';
                  
                  const url = video.url;
                  if (url.includes('drive.google.com')) {
                    const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
                    if (match && match[1]) {
                      return `https://drive.google.com/file/d/${match[1]}/preview`;
                    }
                  }
                  return url;
                })()}
                className="w-full h-full border-none"
                title={videos[activeVideoIndex]?.title || 'Vídeo'}
                allow="autoplay; fullscreen"
                allowFullScreen
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
        <div className="bg-slate-50/80 backdrop-blur-md border border-slate-200/80 rounded-xl p-1.5 flex space-x-1 shadow-inner relative z-10">
          <button
            onClick={() => setActiveTab("resumo")}
            className={`flex-1 py-2 text-[11px] font-sans font-bold uppercase tracking-wide rounded-lg transition-all cursor-pointer ${
              activeTab === "resumo" ? "bg-white text-indigo-700 shadow-md ring-1 ring-indigo-100" : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/50"
            }`}
          >
            Resumo IA
          </button>
          <button
            onClick={() => setActiveTab("pdf")}
            className={`flex-1 py-2 text-[11px] font-sans font-bold uppercase tracking-wide rounded-lg transition-all cursor-pointer ${
              activeTab === "pdf" ? "bg-white text-indigo-700 shadow-md ring-1 ring-indigo-100" : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/50"
            }`}
          >
            Materiais PDF
          </button>
          <button
            onClick={() => setActiveTab("questoes")}
            className={`flex-1 py-2 text-[11px] font-sans font-bold uppercase tracking-wide rounded-lg transition-all cursor-pointer ${
              activeTab === "questoes" ? "bg-white text-indigo-700 shadow-md ring-1 ring-indigo-100" : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/50"
            }`}
          >
            Questões
          </button>
          <button
            onClick={() => setActiveTab("flashcards")}
            className={`flex-1 py-2 text-[11px] font-sans font-bold uppercase tracking-wide rounded-lg transition-all cursor-pointer ${
              activeTab === "flashcards" ? "bg-white text-indigo-700 shadow-md ring-1 ring-indigo-100" : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/50"
            }`}
          >
            Flashcards
          </button>
          <button
            onClick={() => setActiveTab("audios")}
            className={`flex-1 py-2 text-[11px] font-sans font-bold uppercase tracking-wide rounded-lg transition-all cursor-pointer ${
              activeTab === "audios" ? "bg-white text-indigo-700 shadow-md ring-1 ring-indigo-100" : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/50"
            }`}
          >
            Áudios
          </button>
          <button
            onClick={() => setActiveTab("slides")}
            className={`flex-1 py-2 text-[11px] font-sans font-bold uppercase tracking-wide rounded-lg transition-all cursor-pointer ${
              activeTab === "slides" ? "bg-white text-indigo-700 shadow-md ring-1 ring-indigo-100" : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/50"
            }`}
          >
            Slides
          </button>
        </div>

        {/* Tab Content Display */}
        <div className="bg-gradient-to-br from-white to-slate-50/50 border border-slate-200/80 rounded-2xl p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] relative overflow-hidden">
          {/* Subtle decoration */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
          
          {activeTab === "resumo" && (
            <div className="space-y-3 relative z-10">
              <div className="flex justify-between items-center pb-2.5 border-b border-slate-100/80">
                <div className="flex items-center space-x-2 text-indigo-600">
                  <Sparkles className="w-4 h-4" />
                  <h4 className="text-xs font-sans font-bold uppercase tracking-wider text-slate-700">
                    {summaries.length > 0 ? "Resumos Cadastrados" : "Resumo Estruturado pela Inteligência Artificial"}
                  </h4>
                </div>
                {summaries.length > 1 && (
                  <select
                    value={activeSummaryIndex}
                    onChange={(e) => setActiveSummaryIndex(Number(e.target.value))}
                    className="p-1.5 text-[10px] font-bold text-slate-600 bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all shadow-sm"
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
                <div className="space-y-3 pt-1">
                  {summaries.length === 1 && (
                    <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-full inline-block">
                      Módulo: {activeSummary.materiaName}
                    </span>
                  )}
                  <div className="bg-white border border-indigo-100/50 rounded-xl p-5 text-xs text-slate-600 leading-relaxed font-sans whitespace-pre-wrap shadow-sm relative overflow-hidden group">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-400 to-indigo-600 opacity-80"></div>
                    <strong className="block text-slate-800 text-[13px] font-bold mb-2 pb-1.5 font-display tracking-wide group-hover:text-indigo-900 transition-colors">{activeSummary.title}</strong>
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
                        {renderStatusIndicator(pdf.id.toString())}
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
                          setViewingPdfType("pdf");
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
                Gabarito Comentado e Doutrina
              </h4>
              
              {isQuestionAnswered ? (
                activeQuestion && (activeQuestion.justification || activeQuestion.explanation) ? (
                  <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-700 leading-relaxed animate-smooth-fade space-y-2.5">
                    <div className="flex items-center space-x-2 text-indigo-600 font-bold uppercase tracking-wider text-[9px] font-mono border-b border-slate-200 pb-1.5">
                      <Sparkles className="w-4 h-4 text-indigo-500" />
                      <span>Relatório de Gabarito Comentado</span>
                    </div>
                    <p className="font-sans text-slate-600 leading-relaxed">{activeQuestion.justification || activeQuestion.explanation}</p>
                  </div>
                ) : (
                  <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200/60">
                    <p className="text-xs text-slate-500 font-medium">Nenhum comentário doutrinário cadastrado para esta questão ainda.</p>
                  </div>
                )
              ) : (
                <div className="p-8 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  <HelpCircle className="w-8 h-8 text-indigo-500 mx-auto mb-2 animate-pulse" />
                  <p className="text-xs text-slate-500 font-medium">Selecione uma alternativa acima e clique em <strong>Responder</strong> para liberar o Gabarito Comentado.</p>
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
                    <span className="text-indigo-600 font-bold uppercase">{activeFlashcard?.materiaName || "Geral"}</span>
                  </div>

                  {/* 3D Flipping Card Section */}
                  <div className="flex flex-col items-center justify-center py-6" style={{ perspective: '1000px' }}>
                    <div 
                      onClick={() => setIsFlashcardFlipped(!isFlashcardFlipped)}
                      className="w-full max-w-md h-60 cursor-pointer select-none relative transition-transform duration-700"
                      style={{
                        transform: isFlashcardFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                        transformStyle: 'preserve-3d',
                      }}
                    >
                      {/* Lado da Pergunta (Front) */}
                      <div 
                        className="absolute inset-0 w-full h-full bg-indigo-50 border border-indigo-200 rounded-2xl p-6 flex flex-col justify-between items-center text-center shadow-md backface-hidden"
                        style={{ backfaceVisibility: 'hidden' }}
                      >
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-100/30 via-indigo-50/0 to-indigo-50/0 pointer-events-none rounded-2xl" />
                        <div className="absolute top-3 left-3 flex items-center space-x-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
                          <span className="text-[8px] font-mono text-indigo-600 font-bold uppercase tracking-wider">Pergunta Tática</span>
                        </div>
                        
                        <div className="flex-1 flex items-center justify-center pt-4">
                          <p className="text-xs md:text-sm font-sans font-extrabold text-indigo-950 leading-relaxed px-4">
                            {activeFlashcard?.flashcardQuestion}
                          </p>
                        </div>
                        
                        <span className="text-[10px] text-indigo-700 font-sans font-bold bg-indigo-100/80 border border-indigo-200/60 px-3 py-1 rounded-full hover:bg-indigo-100 transition-colors">
                          Clique para revelar a resposta
                        </span>
                      </div>

                      {/* Lado da Resposta (Back) */}
                      <div 
                        className="absolute inset-0 w-full h-full bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex flex-col justify-between items-center text-center shadow-md backface-hidden"
                        style={{ 
                          backfaceVisibility: 'hidden',
                          transform: 'rotateY(180deg)'
                        }}
                      >
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-100/20 via-emerald-50/0 to-emerald-50/0 pointer-events-none rounded-2xl" />
                        <div className="absolute top-3 left-3 flex items-center space-x-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                          <span className="text-[8px] font-mono text-emerald-600 font-bold uppercase tracking-wider">Resposta / Doutrina</span>
                        </div>
                        
                        <div className="flex-1 flex items-center justify-center overflow-y-auto pt-6 pb-2 max-h-[130px] custom-scrollbar">
                          <p className="text-xs font-sans font-extrabold text-emerald-950 leading-relaxed px-4 italic">
                            {activeFlashcard?.flashcardAnswer}
                          </p>
                        </div>
                        
                        <span className="text-[10px] text-emerald-700 font-sans font-bold bg-emerald-100/80 border border-emerald-200/60 px-3 py-1 rounded-full">
                          Clique para ver a pergunta
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-slate-200">
                    <div className="flex space-x-2 w-full sm:w-auto justify-center">
                      <button
                        disabled={currentFlashcardIndex === 0}
                        onClick={handlePrevFlashcard}
                        className="py-2 px-4 bg-slate-100 hover:bg-slate-200 disabled:opacity-45 border border-slate-200 text-xs font-bold text-slate-700 rounded-xl transition-all cursor-pointer shadow-sm hover:shadow"
                      >
                        <ArrowLeft className="w-3.5 h-3.5 inline mr-1" />
                        Anterior
                      </button>
                      <button
                        disabled={currentFlashcardIndex === flashcards.length - 1}
                        onClick={handleNextFlashcard}
                        className="py-2 px-4 bg-slate-100 hover:bg-slate-200 disabled:opacity-45 border border-slate-200 text-xs font-bold text-slate-700 rounded-xl transition-all cursor-pointer shadow-sm hover:shadow"
                      >
                        Próximo
                        <ArrowRight className="w-3.5 h-3.5 inline ml-1" />
                      </button>
                    </div>

                    {/* Dificuldade de Revisão Espaçada (ativa quando revelado) */}
                    {isFlashcardFlipped ? (
                      <div className="flex space-x-1.5 w-full sm:w-auto justify-center animate-smooth-fade">
                        <button
                          onClick={() => {
                            alert("Combatente! Esse cartão foi marcado para revisão em 1 dia.");
                            setIsFlashcardFlipped(false);
                            if (activeFlashcard) {
                              const cardId = activeFlashcard.id?.toString() || currentFlashcardIndex.toString();
                              setResourceStatus(cardId, 'a-estudar');
                              setFlashcardStatuses(prev => ({
                                ...prev,
                                [cardId]: { opened: true, answered: true, rating: "hard" }
                              }));
                            }
                            if (currentFlashcardIndex < flashcards.length - 1) {
                              handleNextFlashcard();
                            }
                          }}
                          className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-[10px] font-sans font-bold uppercase rounded-lg cursor-pointer"
                        >
                          Difícil
                        </button>
                        <button
                          onClick={() => {
                            alert("Combatente! Esse cartão foi marcado para revisão em 4 dias.");
                            setIsFlashcardFlipped(false);
                            if (activeFlashcard) {
                              const cardId = activeFlashcard.id?.toString() || currentFlashcardIndex.toString();
                              setResourceStatus(cardId, 'estudando');
                              setFlashcardStatuses(prev => ({
                                ...prev,
                                [cardId]: { opened: true, answered: true, rating: "medium" }
                              }));
                            }
                            if (currentFlashcardIndex < flashcards.length - 1) {
                              handleNextFlashcard();
                            }
                          }}
                          className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 text-[10px] font-sans font-bold uppercase rounded-lg cursor-pointer"
                        >
                          Médio
                        </button>
                        <button
                          onClick={() => {
                            alert("Combatente! Esse cartão foi marcado para revisão em 7 dias.");
                            setIsFlashcardFlipped(false);
                            if (activeFlashcard) {
                              const cardId = activeFlashcard.id?.toString() || currentFlashcardIndex.toString();
                              setResourceStatus(cardId, 'estudado');
                              setFlashcardStatuses(prev => ({
                                ...prev,
                                [cardId]: { opened: true, answered: true, rating: "easy" }
                              }));
                            }
                            if (currentFlashcardIndex < flashcards.length - 1) {
                              handleNextFlashcard();
                            }
                          }}
                          className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[10px] font-sans font-bold uppercase rounded-lg cursor-pointer"
                        >
                          Fácil
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setIsFlashcardFlipped(true)}
                        className="w-full sm:w-auto py-2 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-sans font-bold text-xs uppercase rounded-xl transition-all shadow-md cursor-pointer border-none"
                      >
                        Ver Resposta
                      </button>
                    )}
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
                  {audios.map((audio) => {
                    const isActive = viewingAudioUrl === audio.url;
                    return (
                      <div 
                        key={audio.id} 
                        className={`p-4 rounded-xl flex items-center justify-between border transition-all ${
                          isActive 
                            ? "bg-indigo-50/40 border-indigo-200 text-indigo-900 shadow-sm" 
                            : "bg-slate-50 border-slate-200/60 hover:border-slate-350"
                        }`}
                      >
                        <div className="flex items-center space-x-3 overflow-hidden">
                          {renderStatusIndicator(audio.id.toString())}
                          <Volume2 className={`w-8 h-8 shrink-0 ${isActive ? "text-indigo-600 animate-pulse" : "text-indigo-500"}`} />
                          <div className="truncate pr-2">
                            <h5 className={`text-xs font-sans font-bold truncate ${isActive ? "text-indigo-900" : "text-slate-800"}`}>{audio.title}</h5>
                            <p className="text-[10px] text-slate-500 font-mono truncate">{audio.materiaName}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setViewingAudioUrl(audio.url);
                            setViewingAudioTitle(audio.title);
                          }}
                          className={`text-[10px] uppercase font-bold cursor-pointer font-sans bg-transparent border-none shrink-0 transition-colors ${
                            isActive ? "text-indigo-700 font-extrabold" : "text-indigo-600 hover:text-indigo-700"
                          }`}
                        >
                          {isActive ? "Ouvindo" : "Ouvir"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === "slides" && (
            <div className="space-y-4">
              <h4 className="text-sm font-sans font-bold text-slate-800 uppercase tracking-wider mb-2">
                Slides e Apresentação Visual
              </h4>
              <p className="text-xs text-slate-500">
                Acompanhe o material visual de apoio da aula ativa no painel do player acima. Use a playlist lateral à direita para alternar entre as apresentações.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Playlist & Tutor IA Support panel */}
      <div className="space-y-6">
        {/* Playlist Panel */}
        {/* Playlist Panel */}
        {/* Playlist Panel */}
        {activeTab === "questoes" ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500">
                Questões Disponíveis
              </h3>
              <span className="text-xs font-mono text-indigo-600 font-bold">
                {questions.length} Questões
              </span>
            </div>

            <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
              {questions.length === 0 ? (
                <div className="text-xs text-slate-400 italic py-2 text-center">Nenhuma questão.</div>
              ) : (
                questions.map((q, idx) => {
                  const isActive = idx === currentQuestionIndex;
                  const qId = q.id?.toString() || idx.toString();
                  const status = questionStatuses[qId];
                  
                  let statusIcon = <div className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" title="Não Aberto" />;
                  let statusTitle = "Não Aberto";
                  
                  if (status) {
                    if (status.answered) {
                      if (status.correct) {
                        statusIcon = <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" title="Acertou" />;
                        statusTitle = "Correta";
                      } else {
                        statusIcon = <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" title="Errou" />;
                        statusTitle = "Incorreta";
                      }
                    } else if (status.opened) {
                      statusIcon = <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 animate-pulse" title="Visualizada" />;
                      statusTitle = "Visualizada";
                    }
                  }

                  return (
                    <button
                      key={q.id || idx}
                      onClick={() => {
                        setCurrentQuestionIndex(idx);
                        const targetStatus = questionStatuses[qId];
                        if (targetStatus) {
                          setSelectedOption(targetStatus.selectedOption || null);
                          setIsQuestionAnswered(targetStatus.answered || false);
                        } else {
                          setSelectedOption(null);
                          setIsQuestionAnswered(false);
                        }
                      }}
                      className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between cursor-pointer ${
                        isActive
                          ? "bg-indigo-50 border-indigo-200/50 text-indigo-700 font-bold"
                          : "bg-slate-50 border-slate-100 hover:bg-slate-100/80 text-slate-600"
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 truncate">
                        {statusIcon}
                        <span className="truncate">Questão {idx + 1}</span>
                      </div>
                      <span className="text-[9px] font-mono text-slate-400 shrink-0 uppercase">{statusTitle}</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        ) : activeTab === "slides" ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500">
                Apresentações de Slides
              </h3>
              <span className="text-xs font-mono text-indigo-600 font-bold">
                {slides.length} Apresentações
              </span>
            </div>

            <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
              {slides.length === 0 ? (
                <div className="text-xs text-slate-400 italic py-2 text-center">Nenhum slide disponível.</div>
              ) : (
                slides.map((slide, idx) => {
                  const isActive = idx === activeSlideIndex;
                  return (
                    <div
                      key={slide.id || idx}
                      className={`w-full p-3 rounded-xl border text-xs transition-all flex items-center justify-between ${
                        isActive
                          ? "bg-indigo-50 border-indigo-200/50 text-indigo-700 font-bold"
                          : "bg-slate-50 border-slate-100 hover:bg-slate-100/80 text-slate-600"
                      }`}
                    >
                      {/* Left: status indicator */}
                      <div className="flex items-center pr-2 shrink-0 z-20">
                        {renderStatusIndicator(slide.id.toString())}
                      </div>

                      {/* Right: clickable slide selection area */}
                      <div
                        onClick={() => setActiveSlideIndex(idx)}
                        className="flex-1 flex items-center justify-between cursor-pointer overflow-hidden min-w-0"
                      >
                        <div className="flex items-center space-x-2 truncate">
                          <Presentation className={`w-4 h-4 shrink-0 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                          <span className="text-xs truncate pr-1">{slide.title}</span>
                        </div>
                        <span className="text-[9px] font-mono text-slate-400 shrink-0 uppercase">Ver</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : activeTab === "flashcards" ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500">
                Lista de Flashcards
              </h3>
              <span className="text-xs font-mono text-indigo-600 font-bold">
                {flashcards.length} Cartões
              </span>
            </div>

            <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
              {flashcards.length === 0 ? (
                <div className="text-xs text-slate-400 italic py-2 text-center">Nenhum cartão.</div>
              ) : (
                flashcards.map((card, idx) => {
                  const isActive = idx === currentFlashcardIndex;
                  const cardId = card.id?.toString() || idx.toString();
                  const status = flashcardStatuses[cardId];
                  
                  let statusIcon = <div className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" title="Não Aberto" />;
                  let statusTitle = "Não Aberto";
                  
                  if (status) {
                    if (status.answered) {
                      if (status.rating === "easy") {
                        statusIcon = <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" title="Fácil" />;
                        statusTitle = "Fácil";
                      } else if (status.rating === "medium") {
                        statusIcon = <CheckCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" title="Médio" />;
                        statusTitle = "Médio";
                      } else {
                        statusIcon = <CheckCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" title="Difícil" />;
                        statusTitle = "Difícil";
                      }
                    } else if (status.opened) {
                      statusIcon = <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 animate-pulse" title="Visualizado" />;
                      statusTitle = "Visualizado";
                    }
                  }

                  return (
                    <button
                      key={card.id || idx}
                      onClick={() => {
                        setCurrentFlashcardIndex(idx);
                        setIsFlashcardFlipped(false);
                      }}
                      className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between cursor-pointer ${
                        isActive
                          ? "bg-indigo-50 border-indigo-200/50 text-indigo-700 font-bold"
                          : "bg-slate-50 border-slate-100 hover:bg-slate-100/80 text-slate-600"
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 truncate">
                        {statusIcon}
                        <span className="text-xs truncate pr-1">Card {idx + 1}</span>
                      </div>
                      <span className="text-[9px] font-mono text-slate-400 shrink-0 uppercase">{statusTitle}</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        ) : (
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
                  : playlist.map((item, idx) => ({
                      ...item,
                      active: idx === activeVideoIndex,
                      onClick: () => {
                        if (!item.locked) {
                          setActiveVideoIndex(idx);
                          setIsPlaying(false);
                        } else {
                          alert("Aula bloqueada. Cadastre seus próprios vídeos na aba administrativa.");
                        }
                      }
                    }));

                return activePlaylist.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-lg flex items-center border transition-all ${
                      item.active 
                        ? "bg-indigo-50 border-indigo-200/50 text-indigo-700 font-bold" 
                        : item.locked 
                          ? "bg-slate-50/50 border-slate-100 text-slate-400 cursor-not-allowed" 
                          : "bg-slate-50 border-slate-100 hover:bg-slate-100/85 text-slate-600"
                    }`}
                  >
                    {/* Left: status selector */}
                    <div className="flex items-center pr-2 shrink-0 z-20">
                      {item.locked ? (
                        <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                      ) : (
                        renderStatusIndicator(item.id.toString())
                      )}
                    </div>

                    {/* Right: clickable video selection area */}
                    <div
                      onClick={!item.locked ? item.onClick : undefined}
                      className="flex-1 flex items-center justify-between cursor-pointer overflow-hidden min-w-0"
                    >
                      <span className="text-xs font-sans truncate pr-2">{item.title}</span>
                      <span className="text-[10px] font-mono text-slate-400 shrink-0">{item.duration}</span>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        )}

        {/* Tutor IA Question Panel */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 mb-2 flex items-center space-x-1.5">
            <Bot className="w-4 h-4 text-indigo-600" />
            <span>Tutor IA Online</span>
          </h3>
          <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">
            Tem dúvida sobre o conteúdo desta aula? Pergunte ao Cabo Véio:
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
        <PdfSlidesViewer
          pdfUrl={viewingPdfUrl}
          title={viewingPdfTitle}
          onClose={() => {
            setViewingPdfUrl(null);
            setIsPdfMaximized(false);
            setViewingPdfType(null);
          }}
          isMaximized={isPdfMaximized}
          onToggleMaximize={() => setIsPdfMaximized(!isPdfMaximized)}
          initialMode={viewingPdfType === "slides" ? "slides" : "scroll"}
          hideModeToggle={viewingPdfType === "pdf"}
        />
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
