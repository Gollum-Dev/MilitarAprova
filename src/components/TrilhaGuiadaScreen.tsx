import React, { useState, useEffect } from "react";
import { 
  Compass, Map, Calendar, RotateCw, Play, CheckCircle2, AlertCircle, BookOpen, 
  HelpCircle, Award, Sparkles, ChevronRight, CheckCircle, Clock, Settings, Undo2, ArrowRight
} from "lucide-react";
import { 
  getPlannerState, setupPlanner, completeTaskResource, 
  recalculateCalendarRoute, resetPlanner, checkAndUpdateLateTasks, TrilhaTask 
} from "../lib/studyPlanner";
import { Course } from "../data";
import { fetchCourses } from "../lib/api";

interface TrilhaGuiadaScreenProps {
  userName: string;
  allowedCourses: string[];
  onChangeTab: (tab: string) => void;
  setSelectedCourseId: (id: string | null) => void;
  setSelectedModuleId: (id: string | null) => void;
  setSelectedContentId: (id: number | null) => void;
  setCourseActiveTab: (tab: "materias" | "simuladores" | "leis" | "tutor" | "desempenho" | "gestao") => void;
  setSubjectActiveTab: (tab: "aulas" | "materiais" | "questoes" | "flashcards" | "audio" | "slides") => void;
}

export default function TrilhaGuiadaScreen({
  userName,
  allowedCourses,
  onChangeTab,
  setSelectedCourseId,
  setSelectedModuleId,
  setSelectedContentId,
  setCourseActiveTab,
  setSubjectActiveTab
}: TrilhaGuiadaScreenProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [plannerState, setPlannerState] = useState(getPlannerState());
  const [isOnboarding, setIsOnboarding] = useState(true);

  // Onboarding Form States
  const [selectedMode, setSelectedMode] = useState<'calendario' | 'ciclo'>('calendario');
  const [dailyBlocks, setDailyBlocks] = useState<number>(2);
  const [proficiencies, setProficiencies] = useState<Record<string, number>>({});
  const [activeCourseId, setActiveCourseId] = useState<string>("");

  useEffect(() => {
    fetchCourses().then(data => {
      const filtered = allowedCourses
        ? data.filter(c => allowedCourses.includes(c.id))
        : data;
      setCourses(filtered);
      if (filtered.length > 0 && !activeCourseId) {
        setActiveCourseId(filtered[0].id);
      }
    }).catch(console.error);

    // Refresh planner state
    checkAndUpdateLateTasks();
    const state = getPlannerState();
    setPlannerState(state);
    setIsOnboarding(state.study_mode === null);
  }, [allowedCourses]);

  // Sync state changes helper
  const refreshState = () => {
    setPlannerState(getPlannerState());
  };

  const handleStartOnboarding = async () => {
    if (courses.length === 0) return;
    
    // Set default proficiencies to 3 for all modules/disciplines if not set
    const initialProficiencies: Record<string, number> = { ...proficiencies };
    const activeCourse = courses.find(c => c.id === activeCourseId) || courses[0];
    
    activeCourse.modules.forEach(m => {
      if (!initialProficiencies[m.id]) {
        initialProficiencies[m.id] = 3;
      }
    });

    const updatedState = await setupPlanner(
      selectedMode,
      dailyBlocks,
      initialProficiencies,
      courses
    );

    setPlannerState(updatedState);
    setIsOnboarding(false);
  };

  const handleToggleResource = async (taskId: string, resourceId: string, currentlyCompleted: boolean) => {
    await completeTaskResource(taskId, resourceId, !currentlyCompleted);
    refreshState();
  };

  const handleRecalculate = async () => {
    await recalculateCalendarRoute();
    refreshState();
  };

  const handleReset = async () => {
    if (window.confirm("Deseja realmente resetar sua Trilha de Estudos e redefinir suas configurações?")) {
      await resetPlanner();
      setIsOnboarding(true);
      refreshState();
    }
  };

  const handleAccessResource = (task: TrilhaTask, resourceType: string) => {
    // Find the course containing this module/discipline
    let foundCourseId = "";
    let foundModuleId = "";
    
    for (const course of courses) {
      const module = course.modules.find(m => m.id === task.disciplineId);
      if (module) {
        foundCourseId = course.id;
        foundModuleId = module.id;
        break;
      }
    }

    if (foundCourseId && foundModuleId) {
      setSelectedCourseId(foundCourseId);
      setSelectedModuleId(foundModuleId);
      
      // Parse contentId as integer if needed
      const numContentId = isNaN(Number(task.contentId)) ? null : Number(task.contentId);
      setSelectedContentId(numContentId);

      // Map studyPlanner type to subjectActiveTab type
      let activeSubjectTab: "aulas" | "materiais" | "questoes" | "flashcards" | "audio" | "slides" = "materiais";
      if (resourceType === 'video') activeSubjectTab = "aulas";
      else if (resourceType === 'audio') activeSubjectTab = "audio";
      else if (resourceType === 'pdf') activeSubjectTab = "materiais";
      else if (resourceType === 'slides') activeSubjectTab = "slides";
      else if (resourceType === 'questoes') activeSubjectTab = "questoes";
      else if (resourceType === 'cards') activeSubjectTab = "flashcards";

      setCourseActiveTab("materias");
      setSubjectActiveTab(activeSubjectTab);
      onChangeTab("cursos");
    }
  };

  if (isOnboarding) {
    const activeCourse = courses.find(c => c.id === activeCourseId) || courses[0];
    return (
      <div className="space-y-6 w-full animate-smooth-fade">
        <div className="bg-gradient-to-r from-blue-950 via-indigo-900 to-blue-950 border border-indigo-700/30 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-md text-white">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center space-x-2 bg-indigo-500/20 border border-indigo-400/30 rounded-full px-3.5 py-1 text-xs font-mono font-bold text-amber-300 uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Configuração de Trilha Inteligente</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-extrabold tracking-tight">
              Monte o seu Roteiro de Estudos Personalizado
            </h2>
            <p className="text-sm text-indigo-200 max-w-2xl leading-relaxed">
              Responda a estas rápidas perguntas para que o nosso algoritmo monte a sequência lógica ideal de matérias e o cronograma diário adaptado para o seu tempo.
            </p>
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-6 md:p-8 space-y-8 bg-white border border-slate-100 shadow-sm">
          {/* Passo 1: Escolha do Curso */}
          <div className="space-y-3">
            <label className="block text-xs font-display font-bold uppercase tracking-wider text-slate-700">
              1. Qual curso você deseja planejar?
            </label>
            <div className="grid grid-cols-1 gap-3">
              {courses.map(course => (
                <button
                  key={course.id}
                  onClick={() => setActiveCourseId(course.id)}
                  className={`w-full text-left p-4 rounded-2xl border text-xs font-sans font-semibold transition-all duration-200 flex items-center justify-between cursor-pointer ${
                    activeCourseId === course.id
                      ? "border-indigo-600 bg-indigo-50/50 text-indigo-900 shadow-sm"
                      : "border-slate-100 bg-slate-50/50 hover:bg-slate-50 text-slate-600"
                  }`}
                >
                  <div className="truncate pr-4 uppercase tracking-wide">
                    {course.title}
                  </div>
                  {activeCourseId === course.id && <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* Passo 2: Formato de Estudo */}
          <div className="space-y-4">
            <label className="block text-xs font-display font-bold uppercase tracking-wider text-slate-700">
              2. Como prefere progredir na sua matéria?
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setSelectedMode('calendario')}
                className={`p-6 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between h-44 ${
                  selectedMode === 'calendario'
                    ? "border-indigo-600 bg-indigo-50/30 text-indigo-900 shadow-md ring-2 ring-indigo-600/10"
                    : "border-slate-100 hover:bg-slate-50 text-slate-600"
                }`}
              >
                <div className="flex justify-between items-start w-full">
                  <div className="p-3 bg-indigo-50 rounded-xl">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                  </div>
                  {selectedMode === 'calendario' && <CheckCircle2 className="w-5 h-5 text-indigo-600" />}
                </div>
                <div>
                  <h4 className="font-bold text-sm uppercase tracking-wide">Calendário Fixo</h4>
                  <p className="text-[11px] text-slate-400 font-mono mt-1 leading-normal">
                    Metas atreladas a dias específicos da semana. Caso atrase uma matéria, ela constará como em atraso e você poderá recalcular a rota para realocar tarefas.
                  </p>
                </div>
              </button>

              <button
                onClick={() => setSelectedMode('ciclo')}
                className={`p-6 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between h-44 ${
                  selectedMode === 'ciclo'
                    ? "border-indigo-600 bg-indigo-50/30 text-indigo-900 shadow-md ring-2 ring-indigo-600/10"
                    : "border-slate-100 hover:bg-slate-50 text-slate-600"
                }`}
              >
                <div className="flex justify-between items-start w-full">
                  <div className="p-3 bg-indigo-50 rounded-xl">
                    <Compass className="w-5 h-5 text-indigo-600" />
                  </div>
                  {selectedMode === 'ciclo' && <CheckCircle2 className="w-5 h-5 text-indigo-600" />}
                </div>
                <div>
                  <h4 className="font-bold text-sm uppercase tracking-wide">Ciclo Contínuo</h4>
                  <p className="text-[11px] text-slate-400 font-mono mt-1 leading-normal">
                    Fila sequencial e linear. Não há datas fixas. Ao terminar a matéria do dia, você simplesmente avança para a próxima. Impossibilita o status de atrasado.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Passo 3: Disponibilidade de tempo */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-xs font-display font-bold uppercase tracking-wider text-slate-700">
                3. Quantas horas disponíveis você tem para estudar por dia?
              </label>
              <span className="text-sm font-mono font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                {dailyBlocks} {dailyBlocks === 1 ? "hora / dia" : "horas / dia"}
              </span>
            </div>
            
            <div className="relative w-full pt-2 pb-1">
              <input
                type="range"
                min="1"
                max="12"
                value={dailyBlocks}
                onChange={(e) => setDailyBlocks(Number(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600 relative z-10"
              />
              <div 
                className="absolute left-0 top-[14px] h-2 bg-indigo-500 rounded-l-lg pointer-events-none z-0 transition-all duration-75"
                style={{ width: `${((dailyBlocks - 1) / 11) * 100}%` }}
              />
            </div>

            <p className="text-[10px] text-slate-400 font-mono leading-normal">
              A carga horária diária inserida será distribuída para cobrir as disciplinas do seu curso de acordo com o seu perfil de proficiência.
            </p>
          </div>

          {/* Passo 4: Nível de Proficiência por Disciplina */}
          {activeCourse && activeCourse.modules && activeCourse.modules.length > 0 && (
            <div className="space-y-4 border-t border-slate-100 pt-6">
              <label className="block text-xs font-display font-bold uppercase tracking-wider text-slate-700">
                4. Classifique seu domínio inicial por disciplina:
              </label>
              <p className="text-[10px] text-slate-400 font-mono leading-normal mb-4">
                Disciplinas com domínio menor (Iniciante) receberão um peso maior na frequência da grade para que você estude mais vezes os assuntos complexos.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeCourse.modules.map(module => {
                  const currentVal = proficiencies[module.id] || 3;
                  return (
                    <div key={module.id} className="p-4 border border-slate-100 rounded-2xl bg-slate-50/50 flex flex-col justify-between space-y-2">
                      <span className="text-[11px] font-sans font-bold text-slate-700 uppercase tracking-wide truncate block">{module.title}</span>
                      <div className="flex items-center space-x-2">
                        {[1, 2, 3, 4, 5].map((stars) => {
                          let labelText = "Intermediário";
                          if (stars === 1) labelText = "Iniciante / Dificuldade Alta";
                          else if (stars === 2) labelText = "Básico";
                          else if (stars === 4) labelText = "Bom";
                          else if (stars === 5) labelText = "Avançado / Domínio Alto";

                          return (
                            <button
                              key={stars}
                              title={labelText}
                              onClick={() => setProficiencies(prev => ({ ...prev, [module.id]: stars }))}
                              className={`w-7 h-7 rounded-lg border text-xs font-bold font-mono transition-all cursor-pointer ${
                                currentVal === stars
                                  ? "bg-indigo-600 text-white border-indigo-600 shadow"
                                  : "bg-white text-slate-400 hover:border-slate-300"
                              }`}
                            >
                              {stars}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Botão de Finalização */}
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={handleStartOnboarding}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-sans font-bold text-xs uppercase px-8 py-3 rounded-full shadow-md hover:shadow-lg transition-all flex items-center space-x-2 cursor-pointer border-none"
            >
              <span>Gerar Minha Trilha Inteligente</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard variables
  const todayStr = new Date().toISOString().split('T')[0];
  const allTasks = plannerState.trilha_tasks;
  
  // Find current active tasks
  let activeTasks: TrilhaTask[] = [];
  if (plannerState.study_mode === 'calendario') {
    activeTasks = allTasks.filter(t => t.datePlanned === todayStr && t.status !== 'Concluida');
  } else {
    // Mode: Ciclo
    const currentPos = plannerState.current_cycle_position;
    activeTasks = allTasks.filter(t => t.cycleIndex === currentPos && t.status !== 'Concluida');
    // If we've completed all tasks or active index is empty, show the last task in list
    if (activeTasks.length === 0 && allTasks.length > 0) {
      activeTasks = [allTasks[Math.min(currentPos, allTasks.length - 1)]].filter(t => t.status !== 'Concluida');
    }
  }

  // Late check for warning badge
  const lateTasksCount = allTasks.filter(t => t.status === 'Atrasada').length;

  return (
    <div className="space-y-6 w-full animate-smooth-fade">
      {/* Header Panel */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-800 to-blue-900 border border-indigo-700/30 rounded-3xl p-6 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 shadow-sm text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1.5 bg-indigo-500/20 border border-indigo-400/30 rounded-full px-3.5 py-1 text-[10px] font-mono font-bold text-amber-300 uppercase">
            <Compass className="w-3.5 h-3.5" />
            <span>Painel Central da Trilha</span>
          </div>
          <h2 className="text-2xl font-display font-extrabold tracking-tight">
            Roteiro Inteligente Diário
          </h2>
          <p className="text-xs text-indigo-200 max-w-2xl font-mono leading-relaxed">
            Seu guia adaptativo. Modo: <span className="font-bold text-white uppercase">{plannerState.study_mode === 'calendario' ? "Calendário Fixo" : "Ciclo Contínuo"}</span> | Horas Diárias: <span className="font-bold text-white">{plannerState.daily_blocks_available}h</span>
          </p>
        </div>
        <div className="flex space-x-2 shrink-0 relative z-10">
          <button
            onClick={handleReset}
            title="Redefinir Onboarding"
            className="p-2.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl transition-all cursor-pointer flex items-center text-white"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Warning alert for Late tasks */}
      {plannerState.study_mode === 'calendario' && lateTasksCount > 0 && (
        <div className="bg-rose-50 border border-rose-200/60 rounded-3xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-bounce-subtle">
          <div className="flex items-center space-x-3 text-rose-800">
            <div className="p-2 bg-rose-100 rounded-2xl text-rose-600 shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-display font-bold uppercase tracking-wider">Cronograma Desajustado</h4>
              <p className="text-[11px] text-rose-600 font-mono mt-0.5 leading-normal">
                Você possui <span className="font-bold">{lateTasksCount}</span> matérias acumuladas e atrasadas. Clique em Recalcular Rota para reorganizar seu calendário a partir de hoje.
              </p>
            </div>
          </div>
          <button
            onClick={handleRecalculate}
            className="bg-rose-600 hover:bg-rose-700 text-white font-sans font-bold text-[10px] uppercase px-5 py-2.5 rounded-full shadow-sm hover:shadow transition-all flex items-center space-x-1.5 cursor-pointer border-none"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Recalcular Rota</span>
          </button>
        </div>
      )}

      {/* Dashboard Diário layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Trilha Diária (Assuntos Ativos) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel rounded-3xl p-6 bg-white border border-slate-100 shadow-sm">
            <h3 className="text-xs font-display font-bold uppercase tracking-wider text-slate-800 mb-5 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>O que estudar hoje</span>
            </h3>

            {activeTasks.length === 0 ? (
              <div className="p-8 text-center bg-slate-50/50 border border-slate-100 rounded-3xl space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-xs uppercase tracking-wide text-slate-700">Tudo em dia!</h4>
                <p className="text-[10px] text-slate-400 font-mono">Você já concluiu todas as tarefas programadas para hoje.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {activeTasks.map((task) => {
                  const completedResCount = task.resources.filter(r => r.completed).length;
                  const progressPct = task.resources.length > 0 ? Math.round((completedResCount / task.resources.length) * 100) : 0;
                  
                  return (
                    <div key={task.id} className="border border-slate-100 rounded-3xl p-5 bg-slate-50/40 space-y-4 hover:border-slate-200 transition-all">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b border-slate-100/80 pb-3">
                        <div className="text-left">
                          <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded text-[9px] font-mono font-extrabold uppercase tracking-wider">
                            {task.disciplineName}
                          </span>
                          <h4 className="text-sm font-sans font-bold text-slate-800 mt-1 uppercase tracking-tight">
                            {task.contentName}
                          </h4>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5 uppercase tracking-tighter">
                            Eixo: {task.moduleTitle}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-mono font-bold text-slate-400">
                            Progresso: {completedResCount}/{task.resources.length}
                          </span>
                          <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${progressPct}%` }} />
                          </div>
                        </div>
                      </div>

                      {/* Fluxo: Absorção, Prática, Revisão */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        
                        {/* Absorção (Teoria) */}
                        <div className="p-4 bg-white border border-slate-100 rounded-2xl flex flex-col justify-between space-y-3">
                          <div>
                            <div className="flex justify-between items-center">
                              <span className="text-[9px] font-mono font-extrabold uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                                Absorção
                              </span>
                              <span className="text-[9px] font-mono text-slate-400 font-bold uppercase">Teoria</span>
                            </div>
                            <h5 className="text-[11px] font-sans font-bold text-slate-700 mt-2 leading-tight">
                              Videoaulas e Apostilas em PDF
                            </h5>
                          </div>
                          
                          <div className="space-y-1.5 pt-2">
                            {task.resources.filter(r => ['video', 'audio', 'pdf', 'slides'].includes(r.type)).map(res => (
                              <div key={res.id} className="flex items-center justify-between p-2 hover:bg-slate-50/50 rounded-lg border border-slate-100">
                                <button
                                  onClick={() => handleAccessResource(task, res.type)}
                                  className="flex items-center space-x-1.5 text-[10px] text-slate-600 font-medium hover:text-indigo-600 cursor-pointer border-none bg-transparent max-w-[80%]"
                                >
                                  <Play className="w-3 h-3 text-indigo-500 shrink-0" />
                                  <span className="truncate text-left" title={res.title}>{res.title}</span>
                                </button>
                                <button
                                  onClick={() => handleToggleResource(task.id, res.id, res.completed)}
                                  className={`w-4 h-4 rounded-full border cursor-pointer flex items-center justify-center transition-all ${
                                    res.completed 
                                      ? "bg-emerald-500 border-emerald-500 text-white" 
                                      : "border-slate-200 hover:border-slate-400"
                                  }`}
                                >
                                  {res.completed && <CheckCircle className="w-3 h-3 text-white" />}
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Prática Imediata */}
                        <div className="p-4 bg-white border border-slate-100 rounded-2xl flex flex-col justify-between space-y-3">
                          <div>
                            <div className="flex justify-between items-center">
                              <span className="text-[9px] font-mono font-extrabold uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                                Prática
                              </span>
                              <span className="text-[9px] font-mono text-slate-400 font-bold uppercase">Questões</span>
                            </div>
                            <h5 className="text-[11px] font-sans font-bold text-slate-700 mt-2 leading-tight">
                              Praticar com Questões CRS
                            </h5>
                          </div>
                          
                          <div className="space-y-1.5 pt-2">
                            {task.resources.filter(r => ['questoes', 'question'].includes(r.type)).map(res => (
                              <div key={res.id} className="flex items-center justify-between p-2 hover:bg-slate-50/50 rounded-lg border border-slate-100">
                                <button
                                  onClick={() => handleAccessResource(task, 'questoes')}
                                  className="flex items-center space-x-1.5 text-[10px] text-slate-600 font-medium hover:text-emerald-600 cursor-pointer border-none bg-transparent max-w-[80%]"
                                >
                                  <HelpCircle className="w-3 h-3 text-emerald-500 shrink-0" />
                                  <span className="truncate text-left" title={res.title}>{res.title}</span>
                                </button>
                                <button
                                  onClick={() => handleToggleResource(task.id, res.id, res.completed)}
                                  className={`w-4 h-4 rounded-full border cursor-pointer flex items-center justify-center transition-all ${
                                    res.completed 
                                      ? "bg-emerald-500 border-emerald-500 text-white" 
                                      : "border-slate-200 hover:border-slate-400"
                                  }`}
                                >
                                  {res.completed && <CheckCircle className="w-3 h-3 text-white" />}
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Revisão Espaçada */}
                        <div className="p-4 bg-white border border-slate-100 rounded-2xl flex flex-col justify-between space-y-3">
                          <div>
                            <div className="flex justify-between items-center">
                              <span className="text-[9px] font-mono font-extrabold uppercase text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                                Revisão
                              </span>
                              <span className="text-[9px] font-mono text-slate-400 font-bold uppercase">Flashcards</span>
                            </div>
                            <h5 className="text-[11px] font-sans font-bold text-slate-700 mt-2 leading-tight">
                              Revisão de Fixação
                            </h5>
                          </div>
                          
                          <div className="space-y-1.5 pt-2">
                            {task.resources.filter(r => ['cards', 'flashcard'].includes(r.type)).map(res => (
                              <div key={res.id} className="flex items-center justify-between p-2 hover:bg-slate-50/50 rounded-lg border border-slate-100">
                                <button
                                  onClick={() => handleAccessResource(task, 'cards')}
                                  className="flex items-center space-x-1.5 text-[10px] text-slate-600 font-medium hover:text-rose-600 cursor-pointer border-none bg-transparent max-w-[80%]"
                                >
                                  <Award className="w-3 h-3 text-rose-500 shrink-0" />
                                  <span className="truncate text-left" title={res.title}>{res.title}</span>
                                </button>
                                <button
                                  onClick={() => handleToggleResource(task.id, res.id, res.completed)}
                                  className={`w-4 h-4 rounded-full border cursor-pointer flex items-center justify-center transition-all ${
                                    res.completed 
                                      ? "bg-emerald-500 border-emerald-500 text-white" 
                                      : "border-slate-200 hover:border-slate-400"
                                  }`}
                                >
                                  {res.completed && <CheckCircle className="w-3 h-3 text-white" />}
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Calendário / Fila do Ciclo */}
        <div className="space-y-6">
          <div className="glass-panel rounded-3xl p-6 bg-white border border-slate-100 shadow-sm flex flex-col justify-between min-h-[300px]">
            <div>
              <h3 className="text-xs font-display font-bold uppercase tracking-wider text-slate-800 mb-5 flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span>{plannerState.study_mode === 'calendario' ? "Próximos Dias" : "Próximos Assuntos da Fila"}</span>
              </h3>

              {plannerState.study_mode === 'calendario' ? (
                // Calendário list view
                <div className="space-y-3.5">
                  {allTasks.filter(t => t.datePlanned && t.datePlanned >= todayStr && t.status !== 'Concluida').slice(0, 5).map((task, idx) => {
                    const isToday = task.datePlanned === todayStr;
                    let badgeColor = "bg-slate-100 text-slate-600 border-slate-200";
                    if (isToday) badgeColor = "bg-indigo-50 border-indigo-100 text-indigo-700 font-extrabold";

                    return (
                      <div key={idx} className={`p-3 border border-slate-100 rounded-2xl flex items-center justify-between transition-all ${isToday ? "bg-indigo-50/20 border-indigo-200/50 shadow-sm" : "bg-slate-50/30"}`}>
                        <div className="min-w-0 text-left">
                          <h4 className="text-xs font-sans font-bold text-slate-700 truncate" title={task.contentName}>
                            {task.contentName}
                          </h4>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate uppercase">
                            {task.disciplineName}
                          </p>
                        </div>
                        <div className="shrink-0 ml-2">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-mono border ${badgeColor}`}>
                            {task.datePlanned?.split('-').reverse().slice(0, 2).join('/')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                // Ciclo Queue list view
                <div className="space-y-3.5">
                  {allTasks.filter(t => (t.cycleIndex ?? 0) > plannerState.current_cycle_position && t.status !== 'Concluida').slice(0, 5).map((task, idx) => {
                    return (
                      <div key={idx} className="p-3 border border-slate-100 rounded-2xl bg-slate-50/30 flex items-center justify-between transition-all hover:bg-slate-50">
                        <div className="min-w-0 text-left">
                          <h4 className="text-xs font-sans font-bold text-slate-700 truncate" title={task.contentName}>
                            {task.contentName}
                          </h4>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate uppercase">
                            {task.disciplineName}
                          </p>
                        </div>
                        <div className="shrink-0 ml-2 flex items-center space-x-1">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-mono">
                            Fila #{idx + 1}
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 pt-4 mt-6 text-center">
              <span className="text-[10px] font-mono text-slate-400 leading-normal">
                A grade se adapta de acordo com o seu desempenho nos simulados globais e respostas da plataforma.
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
