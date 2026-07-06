import { useState, useEffect } from "react";
import { 
  Trophy, BookOpen, Clock, AlertTriangle, Play, ChevronRight, CheckCircle, 
  HelpCircle, Sparkles, RefreshCw, BarChart, FileText, ArrowLeft, Send 
} from "lucide-react";
import { Question, MockSimulator } from "../data";
import { fetchSimulators } from "../lib/api";

interface SimuladoresScreenProps {
  onAskTutor: (question: string) => void;
}

export default function SimuladoresScreen({ onAskTutor }: SimuladoresScreenProps) {
  const [simulators, setSimulators] = useState<MockSimulator[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeExam, setActiveExam] = useState<MockSimulator | null>(null);

  useEffect(() => {
    fetchSimulators().then(data => {
      setSimulators(data);
      setLoading(false);
    }).catch(console.error);
  }, []);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});
  const [isExamSubmitted, setIsExamSubmitted] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [customSubjectInput, setCustomSubjectInput] = useState("");

  const handleStartExam = (simulator: MockSimulator) => {
    setActiveExam(simulator);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setIsExamSubmitted(false);
    setAiAnalysis("");
  };

  const handleSelectAnswer = (questionId: string, answer: 'A' | 'B' | 'C' | 'D') => {
    if (isExamSubmitted) return;
    setSelectedAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmitExam = async () => {
    setIsExamSubmitted(true);
    if (!activeExam || !activeExam.questions) return;

    // Calculate score
    let scoreCount = 0;
    activeExam.questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correct) {
        scoreCount++;
      }
    });
    const finalGrade = parseFloat(((scoreCount / activeExam.questions.length) * 10).toFixed(1));

    // Update the local list to record completion
    setSimulators(prev => 
      prev.map(sim => 
        sim.id === activeExam.id 
          ? { ...sim, status: "finalizado" as const, grade: finalGrade } 
          : sim
      )
    );

    // Call API for AI Analysis
    setIsGeneratingAi(true);
    try {
      const response = await fetch("/api/questoes/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: activeExam.questions[0].id,
          questionText: `Desempenho Geral no Simulado Adaptativo: ${activeExam.title}. O aluno acertou ${scoreCount} de um total de ${activeExam.questions.length} questões. Nota Final: ${finalGrade}/10.`,
          selectedAnswer: `Nota ${finalGrade}`,
          correctAnswer: "Nota 9.0"
        })
      });
      const data = await response.json();
      setAiAnalysis(data.comment || "Análise concluída com sucesso.");
    } catch (err) {
      console.error(err);
      setAiAnalysis("Excelente esforço! Você concluiu o simulado adaptativo. Revise os gabaritos indicados para sanar as inconsistências doutrinárias.");
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleGenerateCustom = async (subject: string) => {
    setIsGeneratingAi(true);
    try {
      const response = await fetch("/api/simulados/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ focusSubject: subject })
      });
      const data = await response.json();
      
      const newSimulator: MockSimulator = {
        id: `sim-custom-${Date.now()}`,
        title: data.title || `Simulado Adaptativo: ${subject}`,
        description: data.description || "Gerado pela IA sob demanda.",
        questionsCount: data.questions?.length || 3,
        duration: "30m",
        status: "recomendado",
        questions: data.questions
      };

      setSimulators(prev => [newSimulator, ...prev]);
      handleStartExam(newSimulator);
    } catch (err) {
      console.error(err);
      alert("Houve uma falha ao contatar a IA. Usando o banco de simulados padrão.");
    } finally {
      setIsGeneratingAi(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" id="simuladores-view-container">
      {/* If taking an active exam */}
      {activeExam && activeExam.questions ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          {/* Active Exam Header */}
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <button
              onClick={() => setActiveExam(null)}
              className="flex items-center space-x-1 text-xs font-sans text-slate-500 hover:text-indigo-600 cursor-pointer transition-colors border-none bg-transparent"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar para Simuladores</span>
            </button>
            <div className="text-right">
              <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200/50 px-2.5 py-1 rounded font-bold">
                SIMULADO EM CURSO
              </span>
            </div>
          </div>

          {/* Title */}
          <div>
            <h3 className="text-base font-sans font-bold text-slate-800">{activeExam.title}</h3>
            <p className="text-xs text-slate-500 mt-1">{activeExam.description}</p>
          </div>

          {/* Question Navigator */}
          <div className="flex flex-wrap gap-1.5 bg-slate-50 p-2 rounded-xl border border-slate-200">
            {activeExam.questions.map((q, idx) => {
              const answered = selectedAnswers[q.id] !== undefined;
              const isCurrent = idx === currentQuestionIndex;
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`w-8 h-8 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    isCurrent
                      ? "bg-indigo-600 text-white shadow-sm"
                      : answered
                        ? "bg-indigo-50 text-indigo-700 border border-indigo-200/50"
                        : "bg-slate-200/60 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Current Question Body */}
          {activeExam.questions[currentQuestionIndex] && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
              <div className="flex justify-between items-center text-[11px] font-mono text-slate-500 border-b border-slate-200/80 pb-2">
                <span>QUESTÃO {currentQuestionIndex + 1} DE {activeExam.questions.length}</span>
                <span>ID: {activeExam.questions[currentQuestionIndex].id} • CRS/CBMMG</span>
              </div>

              <p className="text-xs text-slate-800 leading-relaxed font-sans">
                {activeExam.questions[currentQuestionIndex].text}
              </p>

              {/* Alternatives List */}
              <div className="space-y-2 pt-2">
                {activeExam.questions[currentQuestionIndex].alternatives.map((alt) => {
                  const isSelected = selectedAnswers[activeExam.questions[currentQuestionIndex].id] === alt.letter;
                  const isCorrect = alt.letter === activeExam.questions[currentQuestionIndex].correct;
                  
                  let itemStyles = "border-slate-200 bg-white text-slate-700 hover:bg-slate-50/50 hover:border-slate-300";
                  if (isSelected) {
                    itemStyles = "border-indigo-500 bg-indigo-50/30 text-indigo-900 font-medium";
                  }
                  if (isExamSubmitted) {
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
                      disabled={isExamSubmitted}
                      onClick={() => handleSelectAnswer(activeExam.questions[currentQuestionIndex].id, alt.letter)}
                      className={`w-full text-left p-3.5 border rounded-xl text-xs transition-all flex items-start space-x-3 cursor-pointer ${itemStyles}`}
                    >
                      <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-[11px] font-mono font-bold shrink-0 ${
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

              {/* Active feedback comment for single question when exam is submitted */}
              {isExamSubmitted && (
                <div className="bg-emerald-50/50 border border-emerald-200/60 rounded-xl p-4 mt-4 text-xs leading-relaxed text-emerald-900">
                  <h5 className="font-mono text-emerald-700 font-bold uppercase mb-1">Doutrina Correta:</h5>
                  <p>{activeExam.questions[currentQuestionIndex].explanation}</p>
                </div>
              )}
            </div>
          )}

          {/* Submit Action Block */}
          <div className="flex justify-between items-center border-t border-slate-100 pt-5">
            <div className="flex space-x-2">
              <button
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                className="py-2 px-4 bg-white hover:bg-slate-50 disabled:opacity-40 border border-slate-200 rounded-lg text-xs font-sans text-slate-600 transition-colors cursor-pointer"
              >
                Anterior
              </button>
              <button
                disabled={currentQuestionIndex === activeExam.questions.length - 1}
                onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                className="py-2 px-4 bg-white hover:bg-slate-50 disabled:opacity-40 border border-slate-200 rounded-lg text-xs font-sans text-slate-600 transition-colors cursor-pointer"
              >
                Próxima
              </button>
            </div>

            {!isExamSubmitted ? (
              <button
                onClick={handleSubmitExam}
                className="py-2.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-sans font-bold text-xs uppercase rounded-lg transition-colors shadow-sm cursor-pointer border-none"
              >
                FINALIZAR SIMULADO
              </button>
            ) : (
              <button
                onClick={() => setActiveExam(null)}
                className="py-2.5 px-6 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/50 font-sans font-bold text-xs uppercase rounded-lg transition-colors cursor-pointer"
              >
                Concluir Revisão
              </button>
            )}
          </div>

          {/* AI Comprehensive Analysis Panel if submitted */}
          {isExamSubmitted && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
              <div className="flex items-center space-x-2 text-indigo-600">
                <Sparkles className="w-5 h-5 animate-spin-slow" />
                <h4 className="text-xs font-mono uppercase tracking-widest font-bold">ANÁLISE DE COMBATE DO TUTOR IA</h4>
              </div>
              
              {isGeneratingAi ? (
                <div className="flex flex-col items-center justify-center py-6 space-y-2">
                  <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin" />
                  <p className="text-[10px] font-mono text-slate-500 uppercase">Cabo Véio está analisando seu gabarito...</p>
                </div>
              ) : (
                <div className="text-xs text-slate-700 leading-relaxed font-sans italic whitespace-pre-line">
                  {aiAnalysis}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Simulators Dashboard List */
        <div className="space-y-6">
          {/* Header Stats */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div>
              <h3 className="text-xs font-mono uppercase tracking-widest text-indigo-200">Evolução Estratégica nos Simulados</h3>
              <div className="flex items-baseline space-x-3 mt-1">
                <span className="text-2xl font-sans font-extrabold text-amber-300">Sua Nota Média 8.4/10</span>
                <span className="text-xs text-white font-mono font-semibold bg-white/10 border border-white/20 px-2.5 py-0.5 rounded-full">
                  Média da Turma: 7.1
                </span>
              </div>
              <p className="text-xs text-indigo-200 mt-1">Seu desempenho está 18% acima da média geral de concorrentes cadastrados.</p>
            </div>

            {/* AI Generator input */}
            <div className="w-full md:w-auto bg-white/10 border border-white/20 rounded-xl p-3 flex flex-col sm:flex-row items-stretch gap-2 shrink-0">
              <input
                id="simulator-custom-subject"
                type="text"
                value={customSubjectInput}
                onChange={(e) => setCustomSubjectInput(e.target.value)}
                placeholder="Tema personalizado (Ex: CEDM)"
                className="px-3 py-1.5 bg-white/15 border border-white/25 text-xs text-white placeholder-indigo-200 rounded focus:outline-none focus:border-white w-full sm:w-48"
              />
              <button
                disabled={isGeneratingAi}
                onClick={() => handleGenerateCustom(customSubjectInput || "Legislação Militar")}
                className="py-1.5 px-4 bg-white hover:bg-slate-50 disabled:bg-indigo-300 text-indigo-950 text-xs font-sans font-bold uppercase rounded flex items-center justify-center space-x-1.5 cursor-pointer whitespace-nowrap shrink-0 border-none"
              >
                {isGeneratingAi ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>Gerar Simulado IA</span>
              </button>
            </div>
          </div>

          {/* List of active mock simulators */}
          <div className="space-y-4">
            <h3 className="text-base font-sans font-bold uppercase tracking-wider text-slate-800">
              Simulados Homologados & Recomendados
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {simulators.map((sim) => (
                <div
                  key={sim.id}
                  className={`bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-sm hover:border-slate-300 transition-all ${
                    sim.status === "recomendado" ? "ring-1 ring-indigo-500/20 bg-indigo-50/10" : ""
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className={`text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded ${
                        sim.status === "aberto" 
                          ? "bg-amber-50 text-amber-700 border border-amber-200/50" 
                          : sim.status === "finalizado"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200/50"
                            : sim.status === "recomendado"
                              ? "bg-indigo-50 text-indigo-700 border border-indigo-200/50 font-bold"
                              : "bg-slate-100 text-slate-500 border border-slate-200"
                      }`}>
                        {sim.status === "aberto" ? "Em Aberto" : sim.status === "finalizado" ? "Finalizado" : sim.status === "recomendado" ? "Recomendado por IA" : "Indisponível"}
                      </span>
                      {sim.status === "finalizado" && sim.grade && (
                        <span className="text-sm font-mono font-bold text-emerald-600">
                          Nota: {sim.grade}/10
                        </span>
                      )}
                      {sim.status === "recomendado" && sim.estGain && (
                        <span className="text-[10px] font-mono text-emerald-600 uppercase font-bold">
                          {sim.estGain}
                        </span>
                      )}
                    </div>
                    
                    <h4 className="text-sm font-sans font-bold text-slate-800">{sim.title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">{sim.description}</p>
                    
                    <div className="flex space-x-4 pt-1 text-[10px] font-mono text-slate-400">
                      <span className="flex items-center space-x-1">
                        <FileText className="w-3.5 h-3.5" />
                        <span>{sim.questionsCount} Questões</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{sim.duration}</span>
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 border-t border-slate-100 pt-4">
                    {sim.status === "aberto" && (
                      <button
                        onClick={() => handleStartExam(sim)}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-sans font-bold uppercase transition-colors flex items-center justify-center space-x-1 cursor-pointer border-none shadow-sm"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>INICIAR SIMULADO</span>
                      </button>
                    )}
                    {sim.status === "finalizado" && (
                      <button
                        onClick={() => handleStartExam(sim)}
                        className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-sans font-bold uppercase transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                      >
                        <span>REVISAR DESEMPENHO</span>
                      </button>
                    )}
                    {sim.status === "recomendado" && (
                      <button
                        onClick={() => {
                          if (sim.questions) {
                            handleStartExam(sim);
                          } else {
                            handleGenerateCustom("Legislação Militar Relevante");
                          }
                        }}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-sans font-bold uppercase transition-all flex items-center justify-center space-x-1 cursor-pointer border-none shadow-sm"
                      >
                        <Sparkles className="w-3 h-3 fill-current" />
                        <span>INICIAR TREINO IA</span>
                      </button>
                    )}
                    {sim.status === "bloqueado" && (
                      <button
                        onClick={() => alert("Este simulado de ranking oficial será liberado no cronograma geral do curso em 48 horas.")}
                        className="w-full py-2 bg-slate-100 border border-slate-200 text-slate-400 rounded-lg text-xs font-sans font-bold uppercase cursor-not-allowed flex items-center justify-center space-x-1"
                      >
                        <span>NOTIFICAR-ME</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
