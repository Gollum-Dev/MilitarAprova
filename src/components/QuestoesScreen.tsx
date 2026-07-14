import React, { useState, useEffect, useRef } from "react";
import { 
  Filter, HelpCircle, ArrowLeft, ArrowRight, CheckCircle2, XCircle, 
  Sparkles, RefreshCw, BookOpen, ThumbsUp, HelpCircle as HintIcon, ShieldCheck, ChevronDown 
} from "lucide-react";
import { Question } from "../data";
import { fetchQuestions } from "../lib/api";
import { recordQuestionAnswer, setResourceStatus, getResourceStatuses } from "../lib/progress";

interface QuestoesScreenProps {
  discipline?: string;
  rawDiscipline?: any;
}

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
    <div ref={containerRef} className={`relative inline-block shrink-0 ${isOpen ? 'z-50' : 'z-10'}`}>
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
        <div className="absolute left-0 mt-1.5 w-28 bg-white border border-slate-100 rounded-2xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)] py-1.5 z-50 animate-smooth-fade">
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

export default function QuestoesScreen({ discipline, rawDiscipline }: QuestoesScreenProps = {}) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (rawDiscipline) {
      const courseQuestions: Question[] = [];
      if (Array.isArray(rawDiscipline.areas)) {
        rawDiscipline.areas.forEach((area: any) => {
          if (Array.isArray(area.contents)) {
            area.contents.forEach((content: any) => {
              const res = content.resources || [];
              res.forEach((r: any) => {
                if (r.type === 'question' || r.type === 'questoes') {
                  let mappedAlternatives: { letter: 'A' | 'B' | 'C' | 'D'; text: string }[] = [];
                  const rawOpts = Array.isArray(r.options) && r.options.length > 0
                    ? r.options 
                    : [r.optionA, r.optionB, r.optionC, r.optionD].filter(Boolean);
                  
                  if (rawOpts.length > 0) {
                    const letters: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];
                    mappedAlternatives = rawOpts.slice(0, 4).map((opt: any, index: number) => {
                      const letter = letters[index] || 'A';
                      let text = "";
                      if (typeof opt === 'string') {
                        text = opt.replace(/^[A-D]\s*[\)-\.]\s*/i, "");
                      } else if (opt && typeof opt === 'object' && opt.text) {
                        text = opt.text;
                      } else if (opt && typeof opt === 'object' && opt.letter && opt.text) {
                        text = opt.text;
                      } else {
                        text = String(opt);
                      }
                      return { letter, text };
                    });
                  } else {
                    mappedAlternatives = [
                      { letter: 'A', text: r.optionA || "Opção A" },
                      { letter: 'B', text: r.optionB || "Opção B" },
                      { letter: 'C', text: r.optionC || "Opção C" },
                      { letter: 'D', text: r.optionD || "Opção D" }
                    ];
                  }
                  
                  courseQuestions.push({
                    id: r.id?.toString() || Math.random().toString(),
                    banca: r.banca || "Militar Aprova",
                    year: r.year ? Number(r.year) : new Date().getFullYear(),
                    discipline: discipline || 'Módulo',
                    subject: content.name,
                    text: r.questionText || r.title,
                    alternatives: mappedAlternatives,
                    correct: (r.correctAnswer || r.correct || 'A') as 'A' | 'B' | 'C' | 'D',
                    explanation: r.justification || r.explanation || ''
                  });
                }
              });
            });
          }
        });
      }
      setQuestions(courseQuestions);
      setLoading(false);
    } else {
      fetchQuestions().then(data => {
        setQuestions(data);
        setLoading(false);
      }).catch(console.error);
    }
  }, [rawDiscipline, discipline]);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [aiComment, setAiComment] = useState("");
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  
  // Dicionário de rastreamento de progresso (aberto, respondido, correto/incorreto)
  const [questionStatuses, setQuestionStatuses] = useState<{
    [questionId: string]: {
      opened: boolean;
      answered: boolean;
      correct?: boolean;
      selectedAnswer?: 'A' | 'B' | 'C' | 'D' | null;
      aiComment?: string;
    }
  }>({});

  const [resourceStatuses, setResourceStatuses] = useState(getResourceStatuses());

  const renderStatusIndicator = (resourceId: string) => {
    const status = resourceStatuses[resourceId] || 'a-estudar';
    return (
      <StatusSelector
        resourceId={resourceId}
        currentStatus={status}
        onStatusChange={(nextStatus) => {
          setResourceStatus(resourceId, nextStatus);
          setResourceStatuses(getResourceStatuses());
        }}
      />
    );
  };

  // Filters
  const [disciplineFilter, setDisciplineFilter] = useState(discipline || "Todas");
  const [subjectFilter, setSubjectFilter] = useState("Todos");

  const filteredQuestions = questions.filter(q => {
    if (disciplineFilter !== "Todas" && q.discipline !== disciplineFilter) return false;
    if (subjectFilter !== "Todos" && q.subject !== subjectFilter) return false;
    return true;
  });

  const activeQuestion = filteredQuestions[currentIndex] || null;

  // Efeito para marcar questão ativa como aberta sem causar loop de dependência
  useEffect(() => {
    if (filteredQuestions.length > 0 && currentIndex >= 0) {
      const activeQ = filteredQuestions[currentIndex];
      if (activeQ) {
        const qId = activeQ.id?.toString() || currentIndex.toString();
        
        const currentStatuses = getResourceStatuses();
        if (!currentStatuses[qId]) {
          setResourceStatus(qId, 'estudando');
        }

        setQuestionStatuses(prev => {
          if (prev[qId]?.opened) return prev;
          return {
            ...prev,
            [qId]: {
              opened: true,
              answered: prev[qId]?.answered || false,
              correct: prev[qId]?.correct,
              selectedAnswer: prev[qId]?.selectedAnswer,
              aiComment: prev[qId]?.aiComment
            }
          };
        });
      }
    }
  }, [currentIndex, filteredQuestions.length]);

  const handleSelectQuestion = (idx: number) => {
    setCurrentIndex(idx);
    const targetQ = filteredQuestions[idx];
    if (targetQ) {
      const qId = targetQ.id?.toString() || idx.toString();
      const status = questionStatuses[qId];
      if (status) {
        setSelectedAnswer(status.selectedAnswer || null);
        setIsAnswered(status.answered || false);
        setAiComment(status.aiComment || "");
      } else {
        setSelectedAnswer(null);
        setIsAnswered(false);
        setAiComment("");
      }
    }
  };

  const handleSelectAnswer = (letter: 'A' | 'B' | 'C' | 'D') => {
    if (isAnswered) return;
    setSelectedAnswer(letter);
  };

  const handleAnswerQuestion = async () => {
    if (!activeQuestion || !selectedAnswer) return;
    setIsAnswered(true);

    const isCorrect = selectedAnswer === activeQuestion.correct;
    recordQuestionAnswer(isCorrect);

    const qId = activeQuestion.id?.toString() || currentIndex.toString();
    setResourceStatus(qId, isCorrect ? 'estudado' : 'a-estudar');

    // Método auxiliar para salvar o status de resposta
    const saveStatus = (isCorrect: boolean, commentText: string) => {
      setQuestionStatuses(prev => ({
        ...prev,
        [qId]: {
          opened: true,
          answered: true,
          correct: isCorrect,
          selectedAnswer: selectedAnswer,
          aiComment: commentText
        }
      }));
    };

    if (activeQuestion.explanation && activeQuestion.explanation.trim() !== "") {
      setAiComment(activeQuestion.explanation);
      saveStatus(isCorrect, activeQuestion.explanation);
      return;
    }

    setIsGeneratingAi(true);
    try {
      const response = await fetch("/api/questoes/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: activeQuestion.id,
          questionText: activeQuestion.text,
          selectedAnswer: selectedAnswer,
          correctAnswer: activeQuestion.correct,
          explanation: activeQuestion.explanation
        })
      });
      const data = await response.json();
      
      let finalFeedback = "";
      if (data.comment) {
        finalFeedback += `${data.comment}\n\n`;
      }
      if (activeQuestion.explanation) {
        finalFeedback += `**Justificativa Oficial:**\n${activeQuestion.explanation}`;
      } else {
        finalFeedback += `**Justificativa Oficial:** Gabarito oficial confirmado como alternativa ${activeQuestion.correct}.`;
      }
      setAiComment(finalFeedback);
      saveStatus(isCorrect, finalFeedback);
    } catch (err) {
      console.error(err);
      let localFeedback = `Atenção, recruta! Você marcou a alternativa ${selectedAnswer}, mas o gabarito correto é a letra ${activeQuestion.correct}.\n\n`;
      if (activeQuestion.explanation) {
        localFeedback += `**Justificativa Oficial:**\n${activeQuestion.explanation}`;
      } else {
        localFeedback += `Estude a matéria e o regulamento para ficar bisurado!`;
      }
      setAiComment(localFeedback);
      saveStatus(isCorrect, localFeedback);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < filteredQuestions.length - 1) {
      handleSelectQuestion(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      handleSelectQuestion(currentIndex - 1);
    }
  };

  const uniqueDisciplines = ["Todas", ...new Set(questions.map(q => q.discipline))];
  const uniqueSubjects = ["Todos", ...new Set(questions.map(q => q.subject))];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" id="questoes-view-container">

      {/* Main Column */}
      {/* Main Grid Layout (Question Card on left, Playlist on right) */}
      {activeQuestion ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Question Card & AI Feedback */}
          <div className="lg:col-span-2 space-y-6">
            {/* Question Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">

              {/* Statement text */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-sm">
                <p className="text-xs md:text-sm font-semibold text-slate-800 leading-relaxed font-sans">
                  {activeQuestion.text}
                </p>
              </div>

              {/* Options List */}
              <div className="space-y-3 pt-2">
                {activeQuestion.alternatives.map((alt) => {
                  const isSelected = selectedAnswer === alt.letter;
                  const isCorrect = alt.letter === activeQuestion.correct;
                  
                  let itemStyles = "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300";
                  let badgeStyle = "border-slate-300 bg-slate-100 text-slate-600";
                  
                  if (isSelected) {
                    itemStyles = "border-indigo-500 border-l-4 border-l-indigo-600 bg-indigo-50/20 text-indigo-900 font-bold shadow-sm";
                    badgeStyle = "bg-indigo-600 border-indigo-600 text-white";
                  }
                  
                  if (isAnswered) {
                    if (isCorrect) {
                      itemStyles = "border-emerald-500 border-l-4 border-l-emerald-600 bg-emerald-50/30 text-emerald-900 font-bold";
                      badgeStyle = "bg-emerald-600 border-emerald-600 text-white";
                    } else if (isSelected) {
                      itemStyles = "border-rose-500 border-l-4 border-l-rose-600 bg-rose-50/30 text-rose-900 font-bold";
                      badgeStyle = "bg-rose-600 border-rose-600 text-white";
                    } else {
                      itemStyles = "border-slate-100 bg-slate-50/40 text-slate-400 cursor-not-allowed opacity-60";
                      badgeStyle = "border-slate-200 bg-slate-100/50 text-slate-400";
                    }
                  }

                  return (
                    <button
                      key={alt.letter}
                      disabled={isAnswered}
                      onClick={() => handleSelectAnswer(alt.letter)}
                      className={`w-full text-left p-3.5 border rounded-2xl text-xs transition-all flex items-start space-x-3 cursor-pointer hover:-translate-y-0.5 active:translate-y-0 ${itemStyles}`}
                    >
                      <span className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-mono font-bold shrink-0 transition-all ${badgeStyle}`}>
                        {alt.letter}
                      </span>
                      <span className="leading-relaxed pt-0.5 flex-1">{alt.text}</span>
                    </button>
                  );
                })}
              </div>

              {/* Question Actions */}
              <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                <div className="flex space-x-2">
                  <button
                    disabled={currentIndex === 0}
                    onClick={handlePrevious}
                    className="py-2 px-4 bg-slate-100 hover:bg-slate-200 disabled:opacity-45 border border-slate-200 text-xs font-bold text-slate-700 rounded-xl transition-all cursor-pointer shadow-sm hover:shadow"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 inline mr-1" />
                    Anterior
                  </button>
                  <button
                    disabled={currentIndex === filteredQuestions.length - 1}
                    onClick={handleNext}
                    className="py-2 px-4 bg-slate-100 hover:bg-slate-200 disabled:opacity-45 border border-slate-200 text-xs font-bold text-slate-700 rounded-xl transition-all cursor-pointer shadow-sm hover:shadow"
                  >
                    Próxima
                    <ArrowRight className="w-3.5 h-3.5 inline ml-1" />
                  </button>
                </div>

                {!isAnswered ? (
                  <button
                    id="answer-now-btn"
                    disabled={!selectedAnswer}
                    onClick={handleAnswerQuestion}
                    className="py-2 px-5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none text-white font-sans font-bold text-xs uppercase rounded-xl transition-all shadow-md cursor-pointer border-none disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
                  >
                    Responder Agora
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    disabled={currentIndex === filteredQuestions.length - 1}
                    className="py-2.5 px-6 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/50 font-sans font-bold text-xs uppercase rounded-xl transition-all shadow-sm cursor-pointer"
                  >
                    Próxima Questão
                  </button>
                )}
              </div>
            </div>

            {/* AI Comment panel if answered */}
            {isAnswered && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2 text-indigo-600">
                    <Sparkles className="w-5 h-5 animate-spin-slow" />
                    <h4 className="text-xs font-mono uppercase tracking-widest font-extrabold">PARECER DO CABO VÉIO</h4>
                  </div>
                  <div className="flex space-x-2">
                    <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                      selectedAnswer === activeQuestion.correct 
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200/50" 
                        : "bg-amber-50 text-amber-700 border border-amber-200/50"
                    }`}>
                      {selectedAnswer === activeQuestion.correct ? "MISSÃO CUMPRIDA" : "FALHA TÁTICA"}
                    </span>
                  </div>
                </div>

                {isGeneratingAi ? (
                  <div className="flex flex-col items-center justify-center py-6 space-y-2">
                    <RefreshCw className="w-5 h-5 text-indigo-600 animate-spin" />
                    <p className="text-[10px] font-mono text-slate-500 uppercase">Solicitando Parecer Oficial ao Cabo Véio...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-xs text-slate-700 leading-relaxed font-sans italic whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                      {aiComment}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Questions Playlist */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500">
                  Questões do Módulo
                </h3>
                <span className="text-xs font-mono text-indigo-600 font-bold">
                  {filteredQuestions.length} Questões
                </span>
              </div>

              <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1 pb-32">
                {filteredQuestions.map((q, idx) => {
                  const isActive = idx === currentIndex;
                  const qId = q.id?.toString() || idx.toString();
                  const status = questionStatuses[qId];
                  
                  let statusIcon = <div className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" title="Não Aberto" />;
                  let statusTitle = "Não Aberto";
                  
                  if (status) {
                    if (status.answered) {
                      if (status.correct) {
                        statusIcon = <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" title="Estudado" />;
                        statusTitle = "Estudado";
                      } else {
                        statusIcon = <XCircle className="w-4 h-4 text-rose-500 shrink-0" title="A estudar" />;
                        statusTitle = "A estudar";
                      }
                    } else if (status.opened) {
                      statusIcon = <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0 animate-pulse" title="Estudando" />;
                      statusTitle = "Estudando";
                    }
                  }

                  return (
                    <div
                      key={q.id || idx}
                      className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center ${
                        isActive
                          ? "bg-blue-50 border-blue-200/50 text-blue-700 font-bold"
                          : "bg-slate-50 border-slate-100 hover:bg-slate-100/80 text-slate-600"
                      }`}
                    >
                      <div className="flex items-center pr-2 shrink-0">
                        {renderStatusIndicator(qId)}
                      </div>
                      <div 
                        onClick={() => handleSelectQuestion(idx)}
                        className="flex-1 flex items-center min-w-0 cursor-pointer"
                      >
                        <span className="truncate flex-1">Questão {idx + 1}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-3">
          <HelpCircle className="w-12 h-12 text-slate-400 mx-auto" />
          <h4 className="text-sm font-sans font-bold text-slate-800 uppercase">Nenhuma questão encontrada</h4>
          <p className="text-xs text-slate-500">Ajuste os filtros de disciplina ou assunto no painel superior para carregar questões.</p>
        </div>
      )}
    </div>
  );
}
