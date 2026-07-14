import { useState, useEffect, useRef } from "react";
import { Clock, CheckCircle, BarChart3, Bot, ChevronRight, Award, Zap, ChevronDown } from "lucide-react";
import { fetchCourses } from "../lib/api";
import { getStudentStats, StudentStats, getCompletedResourceIds, getResourceCompletionDates } from "../lib/progress";

interface DashboardHomeProps {
  onChangeTab: (tab: string) => void;
  onGenerateCustomSimulator: (subject: string) => void;
  userName: string;
  allowedCourses?: string[];
  setSelectedCourseId: (id: string | null) => void;
  setSelectedModuleId: (id: string | null) => void;
  setSelectedContentId: (id: number | null) => void;
}

const CustomDropdown = ({ 
  value, 
  options, 
  onChange, 
  colorClasses 
}: { 
  value: string; 
  options: { value: string; label: string }[]; 
  onChange: (val: string) => void;
  colorClasses: { bg: string; text: string; border: string; hoverBorder: string; activeBg: string; activeDot: string };
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClose = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("click", handleClose);
    return () => document.removeEventListener("click", handleClose);
  }, [isOpen]);

  const activeOption = options.find(o => o.value === value) || options[0];

  return (
    <div ref={containerRef} className={`relative inline-block text-left shrink-0 ${isOpen ? 'z-50' : 'z-10'}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between space-x-2 text-[10px] uppercase font-mono font-bold ${colorClasses.bg} ${colorClasses.text} border ${colorClasses.border} rounded-xl pl-4 pr-3 py-2 ${colorClasses.hoverBorder} transition-all duration-200 shadow-sm cursor-pointer min-w-[120px] outline-none border-none`}
      >
        <span className="truncate pr-1 text-left">{activeOption.label}</span>
        <ChevronDown className={`w-3.5 h-3.5 shrink-0 ${isOpen ? 'rotate-180' : ''} transition-transform duration-300 opacity-60`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-48 bg-white border border-slate-100 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] py-1 z-50 animate-smooth-fade max-h-64 overflow-y-auto">
          {options.map((opt) => {
            const isActive = opt.value === value;
            return (
              <button
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-1.5 text-[10px] font-mono uppercase font-bold flex items-center space-x-2 border-none bg-transparent cursor-pointer transition-colors ${
                  isActive 
                    ? `${colorClasses.activeBg} ${colorClasses.text}` 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isActive ? colorClasses.activeDot : "bg-transparent"}`} />
                <span className="truncate">{opt.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default function DashboardHome({ 
  onChangeTab, onGenerateCustomSimulator, userName, allowedCourses,
  setSelectedCourseId, setSelectedModuleId, setSelectedContentId
}: DashboardHomeProps) {
  const [stats, setStats] = useState<StudentStats>({
    studyHours: 12.5,
    questionsAnswered: 18,
    questionsCorrect: 14,
    precision: 77,
    progressPercent: 5,
    patent: "SOLDADO"
  });
  
  const [nextLesson, setNextLesson] = useState({
    moduleTitle: "Carregando...",
    subjectTitle: "Selecione uma matéria para estudar",
    lessonTitle: "Acesse a aba Meus Cursos"
  });

  const [coursesProgress, setCoursesProgress] = useState<{ id: string; title: string; progress: number }[]>([]);

  const [dailyStats, setDailyStats] = useState([
    { label: "VÍDEO", count: 0, highlighted: false },
    { label: "ÁUDIO", count: 0, highlighted: false },
    { label: "PDF", count: 0, highlighted: false },
    { label: "SLIDES", count: 0, highlighted: false },
    { label: "QUESTÕES", count: 0, highlighted: false },
    { label: "CARDS", count: 0, highlighted: false }
  ]);

  const [trendFilter, setTrendFilter] = useState<"total" | "video" | "audio" | "pdf" | "slides" | "questoes" | "cards">("total");
  const [trendTimeRange, setTrendTimeRange] = useState<"7d" | "30d" | "6m" | "1y">("7d");
  const [trendData, setTrendData] = useState<any[]>([]);
  const [loadedCourses, setLoadedCourses] = useState<any[]>([]);
  const [subjectRanking, setSubjectRanking] = useState<{title: string, percent: number, completed: number, total: number}[]>([]);
  const [recentStudies, setRecentStudies] = useState<any[]>([]);

  useEffect(() => {
    console.log("DashboardHome: Carregando cursos e histórico...");
    fetchCourses().then(data => {
      console.log("DashboardHome: Cursos retornados:", data);
      const filtered = allowedCourses
        ? data.filter(c => allowedCourses.includes(c.id))
        : data;
      
      setLoadedCourses(filtered);
      console.log("DashboardHome: Cursos filtrados para o aluno:", filtered);
      let totalRes = 0;

      // Calculate progress individually per course
      const completedResources = getCompletedResourceIds();
      const completionDates = getResourceCompletionDates();
      const today = new Date().toISOString().split('T')[0];
      
      let videoCount = 0, audioCount = 0, pdfCount = 0, slidesCount = 0, questionsCount = 0, flashcardsCount = 0;
      const sStats: Record<string, { total: number, completed: number }> = {};
      
      const progressList = filtered.map(course => {
        let total = 0;
        let completedCount = 0;

        course.modules.forEach(m => {
          const rawDisc = m.rawDiscipline;
          if (rawDisc && Array.isArray(rawDisc.areas)) {
            rawDisc.areas.forEach((area: any) => {
              if (Array.isArray(area.contents)) {
                area.contents.forEach((content: any) => {
                  if (Array.isArray(content.resources)) {
                    content.resources.forEach((res: any) => {
                      total++;
                      if (res.id && completedResources.includes(res.id.toString())) {
                        completedCount++;
                        
                        // For Daily Stats
                        if (completionDates[res.id.toString()] === today) {
                          if (res.type === 'video') videoCount++;
                          else if (res.type === 'audio') audioCount++;
                          else if (res.type === 'pdf') pdfCount++;
                          else if (res.type === 'slides') slidesCount++;
                          else if (res.type === 'questoes' || res.type === 'question') questionsCount++;
                          else if (res.type === 'cards' || res.type === 'flashcard' || res.type === 'flashcards') flashcardsCount++;
                        }
                      }
                      
                      // For Subject Ranking
                      if (!sStats[m.title]) {
                        sStats[m.title] = { total: 0, completed: 0 };
                      }
                      sStats[m.title].total++;
                      if (res.id && completedResources.includes(res.id.toString())) {
                        sStats[m.title].completed++;
                      }
                    });
                  }
                });
              }
            });
          } else {
            total += (m.lessonsCount || 0) + (m.pdfsCount || 0) + (m.questionsCount || 0);
          }
        });

        const progressPercent = total === 0 ? 35 : Math.max(5, Math.round((completedCount / total) * 100));
        return {
          id: course.id,
          title: (course.title || "").replace(/CURSO PREPARATÓRIO\s*|CURSO OFICIAL\s*|PREPARATÓRIO ELITE\s*/gi, "").trim(),
          progress: progressPercent
        };
      });
      setCoursesProgress(progressList);

      // Extract recently completed resources (last studied subjects)
      const completedList: { title: string; type: string; date: string; materiaName: string }[] = [];
      filtered.forEach(course => {
        course.modules.forEach(m => {
          const rawDisc = m.rawDiscipline;
          if (rawDisc && Array.isArray(rawDisc.areas)) {
            rawDisc.areas.forEach((area: any) => {
              if (Array.isArray(area.contents)) {
                area.contents.forEach((content: any) => {
                  if (Array.isArray(content.resources)) {
                    content.resources.forEach((res: any) => {
                      const resId = res.id?.toString();
                      if (resId && completionDates[resId]) {
                        completedList.push({
                          title: res.title || "Material",
                          type: res.type || "pdf",
                          date: completionDates[resId],
                          materiaName: content.name || m.title || ""
                        });
                      }
                    });
                  }
                });
              }
            });
          }
        });
      });

      const latestCompleted = completedList
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 3);
      setRecentStudies(latestCompleted);

      const ranking = Object.keys(sStats).map(title => ({
        title,
        percent: sStats[title].total > 0 ? Math.round((sStats[title].completed / sStats[title].total) * 100) : 0,
        completed: sStats[title].completed,
        total: sStats[title].total
      })).filter(r => r.total > 0).sort((a, b) => b.completed - a.completed);
      setSubjectRanking(ranking);

      // Calcular produtividade diária por tipo de matéria e tendência de 7 dias
      setDailyStats([
        { label: "VÍDEO", count: videoCount, highlighted: videoCount > 0, from: "from-indigo-400", to: "to-indigo-500", text: "text-indigo-400" },
        { label: "ÁUDIO", count: audioCount, highlighted: audioCount > 0, from: "from-emerald-400", to: "to-emerald-500", text: "text-emerald-400" },
        { label: "PDF", count: pdfCount, highlighted: pdfCount > 0, from: "from-blue-400", to: "to-blue-500", text: "text-blue-400" },
        { label: "SLIDES", count: slidesCount, highlighted: slidesCount > 0, from: "from-amber-400", to: "to-amber-500", text: "text-amber-400" },
        { label: "QUESTÕES", count: questionsCount, highlighted: questionsCount > 0, from: "from-violet-400", to: "to-violet-500", text: "text-violet-400" },
        { label: "CARDS", count: flashcardsCount, highlighted: flashcardsCount > 0, from: "from-rose-400", to: "to-rose-500", text: "text-rose-400" }
      ]);

      // Load last accessed course/module/materia
      const lastCourseId = localStorage.getItem("militar_last_course_id");
      const lastModuleId = localStorage.getItem("militar_last_module_id");
      const lastContentIdStr = localStorage.getItem("militar_last_content_id");
      console.log("DashboardHome: Histórico no localStorage:", { lastCourseId, lastModuleId, lastContentIdStr });

      let found = false;

      if (lastCourseId && lastModuleId && filtered.length > 0) {
        const course = filtered.find(c => c.id === lastCourseId);
        const mod = course?.modules.find(m => m.id === lastModuleId);
        
        if (mod) {
          let moduleTitle = mod.title;
          let subjectTitle = mod.title;
          let lessonTitle = localStorage.getItem("militar_last_resource_title") || "Aulas Disponíveis";

          const rawDisc = mod.rawDiscipline;
          if (rawDisc && Array.isArray(rawDisc.areas) && lastContentIdStr) {
            let foundContent: any = null;
            rawDisc.areas.forEach((area: any) => {
              if (Array.isArray(area.contents)) {
                const matched = area.contents.find((content: any) => content.id?.toString() === lastContentIdStr);
                if (matched) foundContent = matched;
              }
            });

            if (foundContent) {
              subjectTitle = foundContent.name;
              if (!localStorage.getItem("militar_last_resource_title") && Array.isArray(foundContent.resources) && foundContent.resources.length > 0) {
                lessonTitle = foundContent.resources[0].title;
              }
            }
          }

          console.log("DashboardHome: Definindo última aula assistida (histórico):", { moduleTitle, subjectTitle, lessonTitle });
          setNextLesson({
            moduleTitle,
            subjectTitle,
            lessonTitle
          });
          found = true;
        }
      }

      // Fallback if no history or content not found
      if (!found && filtered.length > 0 && filtered[0].modules.length > 0) {
        const mod = filtered[0].modules[0];
        let firstModuleTitle = mod.title;
        let firstSubjectTitle = mod.title;
        let firstLessonTitle = "Aulas Disponíveis";

        const rawDisc = mod.rawDiscipline;
        if (rawDisc && Array.isArray(rawDisc.areas) && rawDisc.areas.length > 0) {
          const area = rawDisc.areas[0];
          if (Array.isArray(area.contents) && area.contents.length > 0) {
            const content = area.contents[0];
            firstSubjectTitle = content.name;
            if (Array.isArray(content.resources) && content.resources.length > 0) {
              firstLessonTitle = content.resources[0].title;
            }
          }
        }

        console.log("DashboardHome: Definindo última aula assistida (fallback):", { firstModuleTitle, firstSubjectTitle, firstLessonTitle });
        setNextLesson({
          moduleTitle: firstModuleTitle,
          subjectTitle: firstSubjectTitle,
          lessonTitle: firstLessonTitle
        });
      }

      // Sum all resources in all modules for stats
      filtered.forEach(course => {
        course.modules.forEach(m => {
          const rawDisc = m.rawDiscipline;
          if (rawDisc && Array.isArray(rawDisc.areas)) {
            rawDisc.areas.forEach((area: any) => {
              if (Array.isArray(area.contents)) {
                area.contents.forEach((content: any) => {
                  if (Array.isArray(content.resources)) {
                    totalRes += content.resources.length;
                  }
                });
              }
            });
          } else {
            totalRes += (m.lessonsCount || 0) + (m.pdfsCount || 0) + (m.questionsCount || 0);
          }
        });
      });

      setStats(getStudentStats(totalRes));
    }).catch(console.error);
  }, [allowedCourses]);

  useEffect(() => {
    if (loadedCourses.length === 0) return;

    const completionDates = getResourceCompletionDates();
    let dataPoints: { dateKey: string; label: string }[] = [];
    const now = new Date();
    
    if (trendTimeRange === '7d') {
      dataPoints = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(now);
        d.setDate(d.getDate() - (6 - i));
        return {
          dateKey: d.toISOString().split('T')[0],
          label: `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`
        };
      });
    } else if (trendTimeRange === '30d') {
      dataPoints = Array.from({ length: 30 }).map((_, i) => {
        const d = new Date(now);
        d.setDate(d.getDate() - (29 - i));
        return {
          dateKey: d.toISOString().split('T')[0],
          label: `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`
        };
      });
    } else if (trendTimeRange === '6m') {
      dataPoints = Array.from({ length: 6 }).map((_, i) => {
        const d = new Date(now);
        d.setMonth(d.getMonth() - (5 - i));
        const monthStr = (d.getMonth() + 1).toString().padStart(2, '0');
        const yearStr = d.getFullYear().toString();
        return {
          dateKey: `${yearStr}-${monthStr}`,
          label: `${monthStr}/${yearStr.slice(-2)}`
        };
      });
    } else if (trendTimeRange === '1y') {
      dataPoints = Array.from({ length: 12 }).map((_, i) => {
        const d = new Date(now);
        d.setMonth(d.getMonth() - (11 - i));
        const monthStr = (d.getMonth() + 1).toString().padStart(2, '0');
        const yearStr = d.getFullYear().toString();
        return {
          dateKey: `${yearStr}-${monthStr}`,
          label: `${monthStr}/${yearStr.slice(-2)}`
        };
      });
    }

    const trendCounts: Record<string, { total: number, video: number, audio: number, pdf: number, slides: number, questoes: number, cards: number }> = {};
    dataPoints.forEach(pt => {
      trendCounts[pt.dateKey] = { total: 0, video: 0, audio: 0, pdf: 0, slides: 0, questoes: 0, cards: 0 };
    });

    loadedCourses.forEach(course => {
      if (Array.isArray(course.modules)) {
        course.modules.forEach(mod => {
          if (mod.rawDiscipline && Array.isArray(mod.rawDiscipline.areas)) {
            mod.rawDiscipline.areas.forEach((area: any) => {
              if (Array.isArray(area.contents)) {
                area.contents.forEach((content: any) => {
                  if (Array.isArray(content.resources)) {
                    content.resources.forEach((r: any) => {
                      const rId = r.id?.toString();
                      if (rId && completionDates[rId]) {
                        const cDate = completionDates[rId];
                        let matchKey = cDate;
                        if (trendTimeRange === '6m' || trendTimeRange === '1y') {
                          matchKey = cDate.substring(0, 7);
                        }
                        
                        if (trendCounts[matchKey]) {
                          trendCounts[matchKey].total++;
                          if (r.type === 'video') trendCounts[matchKey].video++;
                          else if (r.type === 'audio') trendCounts[matchKey].audio++;
                          else if (r.type === 'pdf') trendCounts[matchKey].pdf++;
                          else if (r.type === 'slides') trendCounts[matchKey].slides++;
                          else if (r.type === 'question' || r.type === 'questoes') trendCounts[matchKey].questoes++;
                          else if (r.type === 'flashcard' || r.type === 'flashcards' || r.type === 'award') trendCounts[matchKey].cards++;
                        }
                      }
                    });
                  }
                });
              }
            });
          }
        });
      }
    });

    const trendArray = dataPoints.map(pt => ({
      date: pt.dateKey,
      label: pt.label,
      ...trendCounts[pt.dateKey]
    }));
    setTrendData(trendArray);
  }, [loadedCourses, trendTimeRange]);

  const handleResumeStudies = () => {
    const lastCourseId = localStorage.getItem("militar_last_course_id");
    const lastModuleId = localStorage.getItem("militar_last_module_id");
    const lastContentIdStr = localStorage.getItem("militar_last_content_id");

    if (lastCourseId && lastModuleId && lastContentIdStr) {
      setSelectedCourseId(lastCourseId);
      setSelectedModuleId(lastModuleId);
      setSelectedContentId(parseInt(lastContentIdStr));
      onChangeTab("cursos");
    } else if (allowedCourses && allowedCourses.length > 0) {
      setSelectedCourseId(allowedCourses[0]);
      setSelectedModuleId(null);
      setSelectedContentId(null);
      onChangeTab("cursos");
    } else {
      onChangeTab("cursos");
    }
  };

  const colorMap: Record<string, { stroke: string; stop: string; text: string; bg: string; border: string; hoverBorder: string; activeBg: string; activeDot: string }> = {
    total: { stroke: "#4f46e5", stop: "#6366f1", text: "text-indigo-700", bg: "bg-indigo-50", border: "border-indigo-100", hoverBorder: "hover:border-indigo-300", activeBg: "bg-indigo-50/60", activeDot: "bg-indigo-600" },
    video: { stroke: "#4f46e5", stop: "#6366f1", text: "text-indigo-700", bg: "bg-indigo-50", border: "border-indigo-100", hoverBorder: "hover:border-indigo-300", activeBg: "bg-indigo-50/60", activeDot: "bg-indigo-600" },
    audio: { stroke: "#059669", stop: "#10b981", text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-100", hoverBorder: "hover:border-emerald-300", activeBg: "bg-emerald-50/60", activeDot: "bg-emerald-600" },
    pdf: { stroke: "#2563eb", stop: "#3b82f6", text: "text-blue-700", bg: "bg-blue-50", border: "border-blue-100", hoverBorder: "hover:border-blue-300", activeBg: "bg-blue-50/60", activeDot: "bg-blue-600" },
    slides: { stroke: "#d97706", stop: "#f59e0b", text: "text-amber-700", bg: "bg-amber-50", border: "border-amber-100", hoverBorder: "hover:border-amber-300", activeBg: "bg-amber-50/60", activeDot: "bg-amber-600" },
    questoes: { stroke: "#7c3aed", stop: "#8b5cf6", text: "text-violet-700", bg: "bg-violet-50", border: "border-violet-100", hoverBorder: "hover:border-violet-300", activeBg: "bg-violet-50/60", activeDot: "bg-violet-600" },
    cards: { stroke: "#e11d48", stop: "#f43f5e", text: "text-rose-700", bg: "bg-rose-50", border: "border-rose-100", hoverBorder: "hover:border-rose-300", activeBg: "bg-rose-50/60", activeDot: "bg-rose-600" }
  };
  const activeColor = colorMap[trendFilter] || colorMap.total;

  const timeRangeOptions = [
    { value: "7d", label: "Últimos 7 Dias" },
    { value: "30d", label: "Últimos 30 Dias" },
    { value: "6m", label: "6 Meses" },
    { value: "1y", label: "1 Ano" }
  ];

  const filterOptions = [
    { value: "total", label: "Todas Matérias" },
    { value: "video", label: "Vídeos" },
    { value: "audio", label: "Áudios" },
    { value: "pdf", label: "PDFs" },
    { value: "slides", label: "Slides" },
    { value: "questoes", label: "Questões" },
    { value: "cards", label: "Flashcards" }
  ];

  return (
    <div className="space-y-6" id="dashboard-home-view">
      {/* Welcome Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-800 to-blue-900 border border-indigo-700/30 rounded-2xl p-6 md:p-8 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-white tracking-tight">
            Bem-vindo de volta, <span className="text-amber-300">{userName.split(' ')[0]}</span>.
          </h2>
          <p className="text-sm text-indigo-200 mt-1 max-w-3xl truncate md:whitespace-nowrap">
            Acompanhe abaixo o resumo detalhado da progressão dos seus cursos e a evolução da sua produtividade.
          </p>
        </div>
      </div>

      {/* Bento Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column Stack */}
        <div className="space-y-6 flex flex-col">
          {/* Card 1: Progresso do Curso */}
          <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:border-slate-300 transition-all h-[310px]">
            <div>
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xs font-display font-bold uppercase tracking-wider text-slate-800">
                  Progresso dos Cursos Matriculados
                </h3>
              </div>
              
              {/* Custom Progress Bar per Course */}
              <div className="space-y-4 mb-6">
                {coursesProgress.length === 0 ? (
                  <div className="text-xs text-slate-400 italic">Carregando progresso dos cursos...</div>
                ) : (
                  coursesProgress.map(cProgress => (
                    <div key={cProgress.id} className="space-y-1.5 bg-slate-50/50 p-3 rounded-xl border border-slate-100/80">
                      <div className="flex justify-between items-center text-[11px] font-sans font-bold text-slate-700">
                        <span className="truncate max-w-[80%] uppercase tracking-wide">{cProgress.title}</span>
                        <span className="text-indigo-600 font-extrabold text-xs">{cProgress.progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200/50 rounded-full overflow-hidden shadow-inner">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-sm" style={{ width: `${cProgress.progress}%` }}></div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Ranking de Matérias */}
              {subjectRanking.length > 0 && (
                <div className="border-t border-slate-100 pt-5 mt-auto">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Mais Estudadas */}
                    <div>
                      <h4 className="text-[10px] font-mono text-emerald-600 font-bold uppercase mb-2">Mais Estudadas (Atividades)</h4>
                      <div className="space-y-2.5">
                        {subjectRanking.slice(0, 3).map((sub, idx) => (
                          <div key={`most-${idx}`} className="flex flex-col space-y-1 text-[11px]">
                            <div className="flex justify-between items-center">
                              <span className="truncate max-w-[80%] text-slate-600 font-medium" title={sub.title}>{idx + 1}. {sub.title}</span>
                              <span className="font-mono font-bold text-emerald-600 text-[10px]">{sub.percent}%</span>
                            </div>
                            <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${sub.percent}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Menos Estudadas */}
                    <div>
                      <h4 className="text-[10px] font-mono text-rose-500 font-bold uppercase mb-2">Menos Estudadas</h4>
                      <div className="space-y-2.5">
                        {subjectRanking.slice().reverse().slice(0, 3).map((sub, idx) => (
                          <div key={`least-${idx}`} className="flex flex-col space-y-1 text-[11px]">
                            <div className="flex justify-between items-center">
                              <span className="truncate max-w-[80%] text-slate-600 font-medium" title={sub.title}>{idx + 1}. {sub.title}</span>
                              <span className="font-mono font-bold text-rose-500 text-[10px]">{sub.percent}%</span>
                            </div>
                            <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-rose-400 rounded-full" style={{ width: `${sub.percent}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Card 5: Últimas Matérias Concluídas (Recent Studies) */}
          <div className="glass-panel rounded-2xl p-5 shadow-sm hover:border-slate-300 transition-all h-[310px] flex flex-col justify-between overflow-hidden">
            <div>
              <h3 className="text-xs font-display font-bold uppercase tracking-wider text-slate-800 mb-3">
                Últimas Matérias Concluídas
              </h3>
              {recentStudies.length === 0 ? (
                <div className="text-slate-400 text-xs italic py-8 text-center bg-slate-50/50 border border-slate-100 rounded-xl">
                  Nenhuma matéria concluída recentemente.
                </div>
              ) : (
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {recentStudies.map((study, idx) => {
                    let typeColor = "bg-blue-50 text-blue-600 border-blue-100";
                    let typeLabel = "PDF";
                    if (study.type === 'video') {
                      typeColor = "bg-indigo-50 text-indigo-600 border-indigo-100";
                      typeLabel = "VÍDEO";
                    } else if (study.type === 'audio') {
                      typeColor = "bg-emerald-50 text-emerald-600 border-emerald-100";
                      typeLabel = "ÁUDIO";
                    } else if (study.type === 'slides') {
                      typeColor = "bg-amber-50 text-amber-600 border-amber-100";
                      typeLabel = "SLIDE";
                    } else if (study.type === 'questoes' || study.type === 'question') {
                      typeColor = "bg-violet-50 text-violet-600 border-violet-100";
                      typeLabel = "QUESTÃO";
                    } else if (study.type === 'cards' || study.type === 'flashcard') {
                      typeColor = "bg-rose-50 text-rose-600 border-rose-100";
                      typeLabel = "CARD";
                    }

                    return (
                      <div key={idx} className="flex items-center justify-between p-2 px-3 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center space-x-3 min-w-0">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-extrabold uppercase border ${typeColor}`}>
                            {typeLabel}
                          </span>
                          <div className="truncate text-left">
                            <h4 className="text-[11px] font-sans font-bold text-slate-700 truncate" title={study.title}>
                              {study.title}
                            </h4>
                            <p className="text-[9px] text-slate-400 font-mono truncate">
                              {study.materiaName}
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0 ml-2">
                          <span className="text-[8px] font-mono font-extrabold text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-wider">
                            {study.date.split('-').reverse().join('/')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column Stack */}
        <div className="space-y-6 flex flex-col">
          {/* Card 3: Produtividade Diária */}
          <div className="glass-panel rounded-2xl p-6 shadow-sm hover:border-slate-300 transition-all h-[310px] flex flex-col justify-between">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="text-xs font-display font-bold uppercase tracking-wider text-slate-800">
                  Produtividade Diária
                </h3>
                <p className="text-[10px] text-slate-400 font-mono">Matérias estudadas hoje por tipo</p>
              </div>
              <div className="flex bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                <button className="px-2.5 py-1 text-[9px] font-mono bg-white text-indigo-600 rounded-md font-bold uppercase shadow-sm border-none">
                  Hoje
                </button>
              </div>
            </div>

            {/* Styled Bars */}
            <div className="flex items-end justify-between h-36 pt-4 px-2 bg-slate-50 rounded-xl border border-slate-100 relative">
              {/* Grid background lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none py-2 px-1 text-[8px] font-mono text-slate-300">
                {(() => {
                  const maxCount = Math.max(...dailyStats.map(d => d.count), 4);
                  return (
                    <>
                      <div className="border-b border-slate-200/50 w-full text-right pr-1">{maxCount}</div>
                      <div className="border-b border-slate-200/50 w-full text-right pr-1">{Math.ceil(maxCount * 0.75)}</div>
                      <div className="border-b border-slate-200/50 w-full text-right pr-1">{Math.ceil(maxCount * 0.5)}</div>
                      <div className="border-b border-slate-200/50 w-full text-right pr-1">{Math.ceil(maxCount * 0.25)}</div>
                    </>
                  );
                })()}
              </div>

              {(() => {
                const maxCount = Math.max(...dailyStats.map(d => d.count), 4);
                return dailyStats.map((d, index) => {
                  const heightPercent = `${(d.count / maxCount) * 100}%`;
                  return (
                    <div key={index} className="flex flex-col items-center w-12 z-10 group relative">
                      {/* Tooltip on hover */}
                      <div className={`absolute top-[-30px] bg-slate-900 ${d.text || "text-emerald-400"} text-[10px] font-mono py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-sm whitespace-nowrap`}>
                        {d.count} concluídos
                      </div>
                      
                      {/* Bar */}
                      <div className="w-5 rounded-t-sm transition-all duration-300 relative overflow-hidden" style={{ height: heightPercent, minHeight: d.count > 0 ? '4px' : '0' }}>
                        <div className={`absolute inset-0 ${
                          d.highlighted 
                            ? `bg-gradient-to-t ${d.from} ${d.to} shadow-sm` 
                            : "bg-slate-200"
                        }`} />
                      </div>
                      {/* Label */}
                      <span className="text-[9px] font-mono mt-2 text-slate-400 uppercase tracking-tighter">{d.label}</span>
                    </div>
                  );
                });
              })()}
            </div>

            <div className="flex justify-between items-center mt-4 text-[11px] font-mono">
              <span className="text-slate-500">Total Estudado Hoje:</span>
              <span className="text-emerald-600 font-bold uppercase">
                {dailyStats.reduce((sum, item) => sum + item.count, 0)} materiais
              </span>
            </div>
          </div>

          {/* Card 4: Tendência de Produtividade */}
          <div className="glass-panel rounded-2xl p-6 shadow-sm hover:border-slate-300 transition-all h-[310px] flex flex-col justify-between">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-5 space-y-4 md:space-y-0">
              <div>
                <h3 className="text-xs font-display font-bold uppercase tracking-wider text-slate-800">
                  Tendência de Produtividade
                </h3>
                <p className="text-[10px] text-slate-400 font-mono">Acompanhe seu ritmo de estudos</p>
              </div>
              <div className="flex space-x-3 relative z-30">
                <CustomDropdown
                  value={trendTimeRange}
                  options={timeRangeOptions}
                  onChange={(val) => setTrendTimeRange(val as any)}
                  colorClasses={{ bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200", hoverBorder: "hover:border-slate-300", activeBg: "bg-slate-100", activeDot: "bg-slate-600" }}
                />
                <CustomDropdown
                  value={trendFilter}
                  options={filterOptions}
                  onChange={(val) => setTrendFilter(val as any)}
                  colorClasses={activeColor}
                />
              </div>
            </div>

            <div className="h-44 pt-4 pb-8 relative w-full bg-slate-50 rounded-xl border border-slate-100 overflow-hidden px-4">
              {(() => {
                if (trendData.length === 0) return null;
                
                const values = trendData.map(d => d[trendFilter]);
                const maxVal = Math.max(...values, 4);
                const paddingY = 20; // top padding for chart
                
                // Define function to map data to coordinates
                // Height of drawing area is e.g. 120
                const H = 120;
                const W = 1000; // viewBox width
                const step = W / (trendData.length - 1);
                
                const points = trendData.map((d, i) => {
                  const x = i * step;
                  const y = H - ((d[trendFilter] / maxVal) * H) + paddingY;
                  return `${x},${y}`;
                }).join(" ");
                
                return (
                  <div className="w-full h-full relative">
                    {/* Grid Lines */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none py-4 px-1 text-[9px] font-mono text-slate-300">
                      <div className="border-b border-slate-200/50 w-full text-right pr-2">{maxVal}</div>
                      <div className="border-b border-slate-200/50 w-full text-right pr-2">{Math.ceil(maxVal * 0.75)}</div>
                      <div className="border-b border-slate-200/50 w-full text-right pr-2">{Math.ceil(maxVal * 0.5)}</div>
                      <div className="border-b border-slate-200/50 w-full text-right pr-2">{Math.ceil(maxVal * 0.25)}</div>
                      <div className="border-b border-slate-200/50 w-full text-right pr-2">0</div>
                    </div>
                    
                    {/* SVG Chart */}
                    <svg viewBox={`0 0 ${W} ${H + paddingY + 10}`} className="w-full h-[88%] -translate-y-2 overflow-visible relative z-10" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={activeColor.stop} stopOpacity="0.5" />
                          <stop offset="100%" stopColor={activeColor.stop} stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <polyline
                        fill="none"
                        stroke={activeColor.stroke}
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={points}
                        className="drop-shadow-md transition-all duration-500"
                      />
                      <polyline
                        fill="url(#lineGrad)"
                        className="transition-all duration-500"
                        points={`0,${H + paddingY} ${points} ${W},${H + paddingY}`}
                      />
                      {trendData.map((d, i) => {
                         const x = i * step;
                         const y = H - ((d[trendFilter] / maxVal) * H) + paddingY;
                         return (
                           <g key={i} className="group cursor-pointer">
                             <circle cx={x} cy={y} r="5" fill="#fff" stroke={activeColor.stroke} strokeWidth="2.5" className="transition-all duration-500 group-hover:r-[7px]" />
                             <text x={x} y={y - 12} fontSize="12" fill="#475569" textAnchor="middle" className="font-mono font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                               {d[trendFilter]}
                             </text>
                           </g>
                         );
                      })}
                    </svg>
                    
                    {/* X-Axis Labels */}
                    <div className="absolute bottom-2 left-0 w-full px-4 h-4 relative">
                      {trendData.map((d, i) => {
                        // Hide some labels if there are too many (e.g. 30 days) to prevent crowding
                        const showLabel = trendData.length <= 12 || (i % Math.ceil(trendData.length / 8)) === 0 || i === trendData.length - 1;
                        if (!showLabel) return <span key={i} className="w-0 overflow-hidden"></span>;
                        
                        let transformVal = 'translateX(-50%)';
                        if (i === 0) transformVal = 'none';
                        else if (i === trendData.length - 1) transformVal = 'translateX(-100%)';
  
                        return (
                          <span 
                            key={i} 
                            className="text-[9px] font-mono text-slate-400 uppercase" 
                            style={{ 
                              left: `${(i / (trendData.length - 1)) * 100}%`, 
                              position: 'absolute', 
                              transform: transformVal 
                            }}
                          >
                            {d.label}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
