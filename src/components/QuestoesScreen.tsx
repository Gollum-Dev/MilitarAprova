import { useState, useEffect } from "react";
import { 
  Filter, HelpCircle, ArrowLeft, ArrowRight, CheckCircle2, XCircle, 
  Sparkles, RefreshCw, BookOpen, ThumbsUp, HelpCircle as HintIcon, ShieldCheck 
} from "lucide-react";
import { Question } from "../data";
import { fetchQuestions } from "../lib/api";
import { recordQuestionAnswer } from "../lib/progress";

interface QuestoesScreenProps {
  discipline?: string;
  rawDiscipline?: any;
}

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

  // Filters
  const [disciplineFilter, setDisciplineFilter] = useState(discipline || "Todas");
  const [subjectFilter, setSubjectFilter] = useState("Todos");

  const filteredQuestions = questions.filter(q => {
    if (disciplineFilter !== "Todas" && q.discipline !== disciplineFilter) return false;
    if (subjectFilter !== "Todos" && q.subject !== subjectFilter) return false;
    return true;
  });

  const activeQuestion = filteredQuestions[currentIndex] || null;

  const handleSelectAnswer = (letter: 'A' | 'B' | 'C' | 'D') => {
    if (isAnswered) return;
    setSelectedAnswer(letter);
  };

  const handleAnswerQuestion = async () => {
    if (!activeQuestion || !selectedAnswer) return;
    setIsAnswered(true);

    const isCorrect = selectedAnswer === activeQuestion.correct;
    recordQuestionAnswer(isCorrect);

    if (activeQuestion.explanation && activeQuestion.explanation.trim() !== "") {
      setAiComment(activeQuestion.explanation);
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
    } catch (err) {
      console.error(err);
      let localFeedback = `Atenção, recruta! Você marcou a alternativa ${selectedAnswer}, mas o gabarito correto é a letra ${activeQuestion.correct}.\n\n`;
      if (activeQuestion.explanation) {
        localFeedback += `**Justificativa Oficial:**\n${activeQuestion.explanation}`;
      } else {
        localFeedback += `Estude a matéria e o regulamento para ficar bisurado!`;
      }
      setAiComment(localFeedback);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < filteredQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setAiComment("");
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setAiComment("");
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
      {/* Filtering Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap gap-4 items-center justify-between shadow-sm">
        <div className="flex items-center space-x-2 text-slate-700">
          <Filter className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-mono uppercase tracking-wider font-bold">Painel de Filtragem</span>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          {/* Discipline Selector */}
          {!discipline && (
            <div className="flex flex-col space-y-1">
              <label className="text-[10px] font-mono uppercase text-slate-500 font-semibold">Disciplina</label>
              <select
                value={disciplineFilter}
                onChange={(e) => {
                  setDisciplineFilter(e.target.value);
                  setCurrentIndex(0);
                  setSelectedAnswer(null);
                  setIsAnswered(false);
                  setAiComment("");
                }}
                className="bg-slate-50 border border-slate-200 text-xs text-slate-700 rounded px-3 py-1.5 focus:outline-none focus:border-indigo-600"
              >
                {uniqueDisciplines.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          )}

          {/* Subject Selector */}
          <div className="flex flex-col space-y-1">
            <label className="text-[10px] font-mono uppercase text-slate-500 font-semibold">Assunto</label>
            <select
              value={subjectFilter}
              onChange={(e) => {
                setSubjectFilter(e.target.value);
                setCurrentIndex(0);
                setSelectedAnswer(null);
                setIsAnswered(false);
                setAiComment("");
              }}
              className="bg-slate-50 border border-slate-200 text-xs text-slate-700 rounded px-3 py-1.5 focus:outline-none focus:border-indigo-600"
            >
              {uniqueSubjects.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Column */}
      {activeQuestion ? (
        <div className="space-y-6">
          {/* Question Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
            {/* Metadata bar */}
            <div className="flex justify-between items-center text-xs font-mono text-slate-500 border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-3">
                <span className="text-indigo-600 font-bold">{activeQuestion.id}</span>
                <span>•</span>
                <span>Banca: {activeQuestion.banca}</span>
                <span>•</span>
                <span>Ano: {activeQuestion.year}</span>
              </div>
              <span className="text-slate-400 uppercase tracking-wider text-[10px]">
                {activeQuestion.discipline} • {activeQuestion.subject}
              </span>
            </div>

            {/* Statement text */}
            <div className="space-y-2">
              <p className="text-sm text-slate-800 font-sans leading-relaxed">
                {activeQuestion.text}
              </p>
            </div>

            {/* Options List */}
            <div className="space-y-2.5 pt-2">
              {activeQuestion.alternatives.map((alt) => {
                const isSelected = selectedAnswer === alt.letter;
                const isCorrect = alt.letter === activeQuestion.correct;
                
                let itemStyles = "border-slate-200 bg-white text-slate-700 hover:bg-slate-50/50 hover:border-slate-300";
                
                if (isSelected) {
                  itemStyles = "border-indigo-500 bg-indigo-50/30 text-indigo-900 font-medium";
                }
                
                if (isAnswered) {
                  if (isCorrect) {
                    itemStyles = "border-emerald-500 bg-emerald-50 text-emerald-800";
                  } else if (isSelected) {
                    itemStyles = "border-rose-500 bg-rose-50 text-rose-800";
                  } else {
                    itemStyles = "border-slate-100 bg-slate-50/20 text-slate-400 cursor-not-allowed";
                  }
                }

                return (
                  <button
                    key={alt.letter}
                    disabled={isAnswered}
                    onClick={() => handleSelectAnswer(alt.letter)}
                    className={`w-full text-left p-3.5 border rounded-xl text-xs transition-all flex items-start space-x-3.5 cursor-pointer ${itemStyles}`}
                  >
                    <span className={`w-5.5 h-5.5 rounded-full border flex items-center justify-center text-[10px] font-mono font-bold shrink-0 ${
                      isSelected 
                        ? "bg-indigo-600 border-indigo-600 text-white" 
                        : "border-slate-300 bg-slate-100 text-slate-600"
                    }`}>
                      {alt.letter}
                    </span>
                    <span className="leading-normal">{alt.text}</span>
                  </button>
                );
              })}
            </div>

            {/* Question Actions */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
              <div className="flex space-x-2">
                <button
                  disabled={currentIndex === 0}
                  onClick={handlePrevious}
                  className="py-2 px-4 bg-white hover:bg-slate-50 disabled:opacity-45 border border-slate-200 text-xs font-sans text-slate-600 rounded-lg transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 inline mr-1" />
                  Anterior
                </button>
                <button
                  disabled={currentIndex === filteredQuestions.length - 1}
                  onClick={handleNext}
                  className="py-2 px-4 bg-white hover:bg-slate-50 disabled:opacity-45 border border-slate-200 text-xs font-sans text-slate-600 rounded-lg transition-colors cursor-pointer"
                >
                  Próxima
                  <ArrowRight className="w-4 h-4 inline ml-1" />
                </button>
              </div>

              {!isAnswered ? (
                <button
                  id="answer-now-btn"
                  disabled={!selectedAnswer}
                  onClick={handleAnswerQuestion}
                  className="py-2.5 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white disabled:text-slate-400 font-sans font-bold text-xs uppercase rounded-lg transition-all shadow-sm cursor-pointer active:scale-95 border-none"
                >
                  Responder Agora
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  disabled={currentIndex === filteredQuestions.length - 1}
                  className="py-2.5 px-6 bg-indigo-50 hover:bg-indigo-100 disabled:opacity-50 text-indigo-700 border border-indigo-200/50 font-sans font-bold text-xs uppercase rounded-lg transition-all cursor-pointer"
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
