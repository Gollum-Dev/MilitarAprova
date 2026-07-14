import { useState, useEffect } from "react";
import { 
  Trophy, Award, Clock, HelpCircle, CheckCircle2, ChevronRight, 
  Sparkles, Bot, Shield, Zap, Flame, Calendar, Crown, Compass, Swords,
  Video, Headphones, FileText, Presentation
} from "lucide-react";
import { Badge } from "../data";
import { fetchBadges, fetchCourses } from "../lib/api";
import { getStudentStats, StudentStats, getCompletedResourceIds } from "../lib/progress";

function capitalizeFirstOnly(text: string): string {
  if (!text) return "";
  const cleaned = text.trim();
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
}

interface DesempenhoScreenProps {
  userName: string;
  allowedCourses: string[];
  onStartRecoveryTraining: (subject: string) => void;
  onNavigateToSubject?: (courseId: string, moduleId: string, contentId: number) => void;
}

export default function DesempenhoScreen({ userName, allowedCourses, onStartRecoveryTraining, onNavigateToSubject }: DesempenhoScreenProps) {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<any[]>([]);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [stats, setStats] = useState<StudentStats>({
    studyHours: 12.5,
    questionsAnswered: 18,
    questionsCorrect: 14,
    precision: 77,
    progressPercent: 5,
    patent: "SOLDADO"
  });

  useEffect(() => {
    Promise.all([
      fetchBadges(),
      fetchCourses()
    ]).then(([badgeData, courseData]) => {
      setBadges(badgeData);
      
      const filteredCourses = allowedCourses
        ? courseData.filter(c => allowedCourses.includes(c.id))
        : courseData;
        
      setCourses(filteredCourses);
      setCompletedIds(getCompletedResourceIds());
      
      let count = 0;
      filteredCourses.forEach(course => {
        course.modules.forEach(m => {
          const rawDisc = m.rawDiscipline;
          if (rawDisc && Array.isArray(rawDisc.areas)) {
            rawDisc.areas.forEach((area: any) => {
              if (Array.isArray(area.contents)) {
                area.contents.forEach((content: any) => {
                  if (Array.isArray(content.resources)) {
                    count += content.resources.length;
                  }
                });
              }
            });
          }
        });
      });

      setStats(getStudentStats(count));
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  // Icon selector mapping helper
  const renderBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case "ShieldAlert": return <Shield className="w-5 h-5 text-amber-600" />;
      case "Flame": return <Flame className="w-5 h-5 text-orange-600" />;
      case "CalendarCheck": return <Calendar className="w-5 h-5 text-emerald-600" />;
      case "Award": return <Award className="w-5 h-5 text-indigo-600" />;
      case "Compass": return <Compass className="w-5 h-5 text-slate-400" />;
      case "Crown": return <Crown className="w-5 h-5 text-slate-400" />;
      default: return <Award className="w-5 h-5 text-indigo-600" />;
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
    <div className="space-y-6" id="desempenho-view-container">
      {/* Progresso Detalhado por Matéria */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        <div>
          <h3 className="text-sm font-sans font-extrabold uppercase tracking-wider text-slate-800 flex items-center space-x-2">
            <Zap className="w-5 h-5 text-indigo-500" />
            <span>Progresso Detalhado por Matéria</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Monitore seu avanço percentual e identifique onde concentrar seus esforços de estudo.
          </p>
        </div>

        <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200">
          {courses.map((course) => (
            <div key={course.id} className="space-y-4">
              <div className="bg-slate-50/80 border border-slate-100 rounded-xl px-4 py-2">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                  Curso: {course.title}
                </span>
              </div>
              
              <div className="space-y-6">
                {course.modules.map((mod: any) => {
                  const rawDisc = mod.rawDiscipline;
                  if (!rawDisc || !Array.isArray(rawDisc.areas)) return null;

                  return (
                    <div key={mod.id} className="space-y-4">
                      {/* Discipline Title */}
                      <h4 className="text-xs font-sans font-bold text-slate-700 flex items-center space-x-1.5 border-b border-slate-100 pb-1.5 mt-2">
                        <span className="w-1.5 h-3 bg-indigo-500 rounded-full" />
                        <span>{mod.title.includes(':') ? `${mod.title.split(':')[0]}: ${capitalizeFirstOnly(mod.title.split(':').slice(1).join(':').trim())}` : capitalizeFirstOnly(mod.title)}</span>
                      </h4>

                      <div className="space-y-6">
                        {rawDisc.areas.map((area: any) => {
                          if (!Array.isArray(area.contents) || area.contents.length === 0) return null;

                          return (
                            <div key={area.id} className="space-y-2.5">
                              {/* Axis Title */}
                              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block pl-1">
                                {capitalizeFirstOnly(area.name)}
                              </span>

                              {/* 3-column grid for subjects within this Axis */}
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {area.contents.map((content: any) => {
                                  const resources = content.resources || [];
                                  const total = resources.length;
                                  
                                  const completedCount = resources.filter((r: any) => 
                                    completedIds.includes(r.id?.toString())
                                  ).length;
                                  
                                  const percent = total > 0 ? Math.round((completedCount / total) * 100) : 0;
                                  
                                  let barColor = "bg-slate-200";
                                  let textColor = "text-slate-400";
                                  let bgTagColor = "bg-slate-100 text-slate-600";
                                  if (percent > 0) {
                                    if (percent < 30) {
                                      barColor = "bg-rose-500";
                                      textColor = "text-rose-600";
                                      bgTagColor = "bg-rose-50 text-rose-700 border-rose-100";
                                    } else if (percent < 80) {
                                      barColor = "bg-amber-500";
                                      textColor = "text-amber-600";
                                      bgTagColor = "bg-amber-50 text-amber-700 border-amber-100";
                                    } else {
                                      barColor = "bg-emerald-500";
                                      textColor = "text-emerald-600";
                                      bgTagColor = "bg-emerald-50 text-emerald-700 border-emerald-100";
                                    }
                                  }
                                  
                                  let videoTotal = 0, videoCompleted = 0;
                                  let audioTotal = 0, audioCompleted = 0;
                                  let pdfTotal = 0, pdfCompleted = 0;
                                  let slidesTotal = 0, slidesCompleted = 0;
                                  let questionsTotal = 0, questionsCompleted = 0;
                                  let flashcardsTotal = 0, flashcardsCompleted = 0;

                                  resources.forEach((r: any) => {
                                    const isCompleted = completedIds.includes(r.id?.toString());
                                    if (r.type === 'video') {
                                      videoTotal++;
                                      if (isCompleted) videoCompleted++;
                                    } else if (r.type === 'audio') {
                                      audioTotal++;
                                      if (isCompleted) audioCompleted++;
                                    } else if (r.type === 'pdf') {
                                      pdfTotal++;
                                      if (isCompleted) pdfCompleted++;
                                    } else if (r.type === 'slides') {
                                      slidesTotal++;
                                      if (isCompleted) slidesCompleted++;
                                    } else if (r.type === 'question' || r.type === 'questoes') {
                                      questionsTotal++;
                                      if (isCompleted) questionsCompleted++;
                                    } else if (r.type === 'flashcard' || r.type === 'flashcards' || r.type === 'award') {
                                      flashcardsTotal++;
                                      if (isCompleted) flashcardsCompleted++;
                                    }
                                  });
                                  
                                  return (
                                    <div 
                                      key={content.id} 
                                      className="p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-200 hover:shadow shadow-sm transition-all duration-300 flex flex-col justify-between space-y-4 cursor-pointer hover:bg-slate-50/40"
                                      onClick={() => onNavigateToSubject?.(course.id, mod.id, content.id)}
                                    >
                                      <div className="flex justify-between items-start gap-3">
                                        <div className="space-y-1 min-w-0">
                                          <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wide block">
                                            {mod.title.replace(/^Módulo \d+:\s*/, "")} • {area.name}
                                          </span>
                                          <h5 className="text-xs font-sans font-bold text-slate-800 leading-snug line-clamp-2">
                                            {content.name}
                                          </h5>
                                        </div>
                                        <span className={`text-[10px] font-mono font-bold border px-2 py-0.5 rounded-full shrink-0 ${bgTagColor}`}>
                                          {percent}%
                                        </span>
                                      </div>

                                      <div className="space-y-3">
                                        {/* Custom progress bar */}
                                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/50">
                                          <div 
                                            className={`h-2 rounded-full transition-all duration-500 ${barColor}`} 
                                            style={{ width: `${percent}%` }}
                                          />
                                        </div>
                                        
                                        <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                                          <span>Progresso Geral</span>
                                          <span className="font-bold text-slate-600">{completedCount} de {total} concluídos</span>
                                        </div>

                                        {/* Detailed breakdown list */}
                                        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 mt-2">
                                          {/* Videos */}
                                          <div className="flex items-center justify-between p-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[9px] font-mono">
                                            <span className="flex items-center gap-1 text-slate-500">
                                              <Video className="w-3 h-3 text-indigo-500" />
                                              <span>Vídeos</span>
                                            </span>
                                            <span className={videoCompleted === videoTotal && videoTotal > 0 ? "text-emerald-600 font-bold" : "text-slate-400"}>
                                              {videoCompleted}/{videoTotal}
                                            </span>
                                          </div>

                                          {/* Audios */}
                                          <div className="flex items-center justify-between p-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[9px] font-mono">
                                            <span className="flex items-center gap-1 text-slate-500">
                                              <Headphones className="w-3 h-3 text-emerald-500" />
                                              <span>Áudios</span>
                                            </span>
                                            <span className={audioCompleted === audioTotal && audioTotal > 0 ? "text-emerald-600 font-bold" : "text-slate-400"}>
                                              {audioCompleted}/{audioTotal}
                                            </span>
                                          </div>

                                          {/* PDFs */}
                                          <div className="flex items-center justify-between p-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[9px] font-mono">
                                            <span className="flex items-center gap-1 text-slate-500">
                                              <FileText className="w-3 h-3 text-blue-500" />
                                              <span>PDFs</span>
                                            </span>
                                            <span className={pdfCompleted === pdfTotal && pdfTotal > 0 ? "text-emerald-600 font-bold" : "text-slate-400"}>
                                              {pdfCompleted}/{pdfTotal}
                                            </span>
                                          </div>

                                          {/* Slides */}
                                          <div className="flex items-center justify-between p-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[9px] font-mono">
                                            <span className="flex items-center gap-1 text-slate-500">
                                              <Presentation className="w-3 h-3 text-amber-500" />
                                              <span>Slides</span>
                                            </span>
                                            <span className={slidesCompleted === slidesTotal && slidesTotal > 0 ? "text-emerald-600 font-bold" : "text-slate-400"}>
                                              {slidesCompleted}/{slidesTotal}
                                            </span>
                                          </div>

                                          {/* Questões */}
                                          <div className="flex items-center justify-between p-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[9px] font-mono">
                                            <span className="flex items-center gap-1 text-slate-500">
                                              <HelpCircle className="w-3 h-3 text-violet-500" />
                                              <span>Questões</span>
                                            </span>
                                            <span className={questionsCompleted === questionsTotal && questionsTotal > 0 ? "text-emerald-600 font-bold" : "text-slate-400"}>
                                              {questionsCompleted}/{questionsTotal}
                                            </span>
                                          </div>

                                          {/* Flashcards */}
                                          <div className="flex items-center justify-between p-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[9px] font-mono">
                                            <span className="flex items-center gap-1 text-slate-500">
                                              <Award className="w-3 h-3 text-rose-500" />
                                              <span>Cards</span>
                                            </span>
                                            <span className={flashcardsCompleted === flashcardsTotal && flashcardsTotal > 0 ? "text-emerald-600 font-bold" : "text-slate-400"}>
                                              {flashcardsCompleted}/{flashcardsTotal}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
