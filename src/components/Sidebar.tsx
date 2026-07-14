import { 
  Home, BookOpen, Tv, HelpCircle, GraduationCap, Scale, 
  MessageSquare, LineChart, Settings, LogOut, ShieldAlert, 
  Award, Bot, ArrowLeft, HelpCircle as SupportIcon, FileText, Headphones, Presentation, Compass
} from "lucide-react";
import { Course } from "../data";
import { fetchCourses } from "../lib/api";
import { useState, useEffect, useRef } from "react";

interface SidebarProps {
  currentTab: string;
  onChangeTab: (tab: string) => void;
  userRank: string;
  onLogout: () => void;
  isOfflineMode: boolean;
  selectedCourseId: string | null;
  setSelectedCourseId: (id: string | null) => void;
  selectedModuleId: string | null;
  setSelectedModuleId: (id: string | null) => void;
  selectedContentId: number | null;
  setSelectedContentId: (id: number | null) => void;
  courseActiveTab: "materias" | "simuladores" | "leis" | "tutor" | "desempenho" | "gestao";
  setCourseActiveTab: (tab: "materias" | "simuladores" | "leis" | "tutor" | "desempenho" | "gestao") => void;
  subjectActiveTab: "aulas" | "materiais" | "questoes" | "flashcards" | "audio" | "slides";
  setSubjectActiveTab: (tab: "aulas" | "materiais" | "questoes" | "flashcards" | "audio" | "slides") => void;
  allowedCourses: string[];
}

export default function Sidebar({ 
  currentTab, onChangeTab, userRank, onLogout, isOfflineMode,
  selectedCourseId, setSelectedCourseId, selectedModuleId, setSelectedModuleId,
  selectedContentId, setSelectedContentId,
  courseActiveTab, setCourseActiveTab, subjectActiveTab, setSubjectActiveTab, allowedCourses
}: SidebarProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  interface HoveredModuleInfo {
    id: string;
    top: number;
    title: string;
    rawDiscipline: any;
  }

  const [hoveredModule, setHoveredModule] = useState<HoveredModuleInfo | null>(null);
  const [sidebarModulesExpanded, setSidebarModulesExpanded] = useState(true);
  const timeoutRef = useRef<any>(null);

  const handleMouseEnter = (module: any, e: React.MouseEvent) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredModule({
      id: module.id,
      top: rect.top,
      title: module.title,
      rawDiscipline: module.rawDiscipline
    });
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setHoveredModule(null);
    }, 150);
  };
  
  const capitalizeFirstOnly = (text: string) => {
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };

  useEffect(() => {
    fetchCourses().then(setCourses).catch(console.error);
  }, []);

  // Base navigation menu items (ALWAYS visible)
  const menuItems = [
    { id: "inicio", label: "Início", icon: Home },
    { id: "cursos", label: "Meus Cursos", icon: BookOpen },
    { id: "configuracoes", label: "Configurações", icon: Settings },
  ];

  const courseSubItems = [
    { id: "materias", label: "Painel do Curso", icon: BookOpen },
    { id: "gestao", label: "Gestão de Estudo", icon: Compass },
    { id: "simuladores", label: "Simulados", icon: GraduationCap },
    { id: "tutor", label: "Tutor IA", icon: MessageSquare },
  ];

  const subjectSubItems = [
    { id: "aulas", label: "Vídeo Aulas", icon: Tv },
    { id: "audio", label: "Áudio Aula", icon: Headphones },
    { id: "materiais", label: "Material (PDFs)", icon: FileText },
    { id: "slides", label: "Slides", icon: Presentation },
    { id: "questoes", label: "Questões", icon: HelpCircle },
    { id: "flashcards", label: "Flashcards", icon: Award },
  ];

  const handleItemClick = (id: string) => {
    setSelectedCourseId(null);
    setSelectedModuleId(null);
    setSelectedContentId(null);
    onChangeTab(id);
  };

  const checkIsActive = (id: string) => {
    if (id === "cursos") {
      return currentTab === "cursos";
    }
    return currentTab === id;
  };

  const activeCourse = courses.find(c => c.id === selectedCourseId);
  const isMateriasTabActive = currentTab === "cursos" && selectedCourseId !== null && courseActiveTab === "materias";

  return (
    <aside className="w-64 glass-panel border-r border-slate-200/50 flex flex-col h-screen shrink-0 relative z-50 shadow-sm bg-white">
      {/* Brand Header */}
      <div 
        onClick={() => handleItemClick("cursos")}
        className="p-6 border-b border-slate-100 cursor-pointer hover:bg-slate-50/50 transition-colors"
        title="Voltar para Meus Cursos"
      >
        <div className="flex items-center space-x-3">
          <div className="w-16 h-16 rounded-lg flex items-center justify-center overflow-hidden border border-emerald-200/50 shadow-sm bg-slate-50">
            <img src="https://pub-bc0b63de539b4cafb3fdce383cb712fa.r2.dev/Gemini_Generated_Image_6k6ayf6k6ayf6k6a.png" alt="Cabo Véio" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="font-display font-bold text-[var(--ink)] tracking-tight leading-tight text-sm hover:text-base transition-all duration-150">
              Cabo Véio
            </h1>
            <p className="text-[10px] font-sans font-medium text-slate-400 mt-0.5 tracking-wider uppercase">
              Doutrina de Caserna
            </p>
          </div>
        </div>
      </div>

      {/* Navigation menu */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {menuItems.map(item => {
          const IconComponent = item.icon;
          const isActive = checkIsActive(item.id);
          const showCoursesAccordion = item.id === "cursos" && (currentTab === "cursos" || selectedCourseId !== null);

          if (showCoursesAccordion && allowedCourses && allowedCourses.length > 0) {
            const myCourses = courses.filter(c => allowedCourses.includes(c.id));
            return (
              <div key={item.id} className="space-y-1">
                {/* Main "Meus Cursos" Button */}
                <button
                  id={`sidebar-tab-${item.id}`}
                  onClick={() => handleItemClick(item.id)}
                  className={`group w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg font-sans font-medium transition-all duration-150 cursor-pointer text-xs uppercase hover:text-sm hover:font-bold ${
                    isActive 
                      ? "bg-slate-100/50 text-slate-900 border-l-4 border-slate-700 font-bold shadow-sm" 
                      : "text-slate-600 hover:bg-blue-50/80 hover:text-blue-700"
                  }`}
                >
                  <IconComponent className={`w-4 h-4 shrink-0 transition-colors ${isActive ? "text-slate-700" : "text-slate-400 group-hover:text-blue-600"}`} />
                  <span>{item.label.toUpperCase()}</span>
                </button>
                
                {/* Courses Accordion Level 1 */}
                {myCourses.length > 0 && (
                  <div className="pl-1.5 pr-1 py-1 space-y-2 border-l border-slate-200/50 ml-2 animate-smooth-fade">
                    {myCourses.map(course => {
                      const isCourseSelected = selectedCourseId === course.id;
                      return (
                        <div key={course.id} className="space-y-1">
                          <button
                            onClick={() => {
                              if (isCourseSelected) {
                                setSelectedCourseId(null);
                                setSelectedModuleId(null);
                                setSelectedContentId(null);
                              } else {
                                setSelectedCourseId(course.id);
                                setSelectedModuleId(null);
                                setSelectedContentId(null);
                                setCourseActiveTab("materias");
                              }
                              onChangeTab("cursos");
                            }}
                            className={`group w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg font-sans font-medium transition-all duration-150 cursor-pointer text-left text-xs hover:text-sm hover:font-bold ${
                              isCourseSelected
                                ? "bg-slate-200/60 text-slate-900 font-bold shadow-sm"
                                : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                            }`}
                          >
                            <BookOpen className="w-3.5 h-3.5 shrink-0 opacity-70" />
                            <span className="line-clamp-2 leading-tight">{(course.title || "").replace(/CURSO PREPARATÓRIO\s*|CURSO OFICIAL\s*/i, "").toUpperCase()}</span>
                          </button>

                          {/* Course Tabs Accordion Level 2 */}
                          {isCourseSelected && (
                            <div className="pl-1.5 py-1 space-y-1 border-l border-slate-200 ml-1.5 animate-smooth-fade">
                               {courseSubItems.map(subItem => {
                                 const SubIcon = subItem.icon;
                                 const isSubActive = courseActiveTab === subItem.id;
                                 const showModulesAccordion = subItem.id === "materias" && courseActiveTab === "materias" && sidebarModulesExpanded;
                                 return (
                                    <div key={subItem.id} className="space-y-1">
                                      <button
                                        onClick={() => {
                                          if (subItem.id === "materias" && isSubActive && selectedModuleId === null) {
                                            setSidebarModulesExpanded(!sidebarModulesExpanded);
                                          } else {
                                            if (subItem.id === "materias") {
                                              setSidebarModulesExpanded(true);
                                            }
                                            setSelectedModuleId(null);
                                            setSelectedContentId(null);
                                            setCourseActiveTab(subItem.id as any);
                                            onChangeTab("cursos");
                                          }
                                        }}
                                        className={`w-full flex items-center space-x-2 px-2 py-1.5 rounded-md font-sans font-medium transition-all duration-150 cursor-pointer text-left text-xs hover:text-sm hover:font-bold ${
                                          isSubActive && selectedModuleId === null
                                            ? "text-indigo-700 font-bold bg-indigo-50/50"
                                            : "text-slate-400 hover:text-slate-700"
                                        }`}
                                      >
                                        <SubIcon className="w-3 h-3 shrink-0" />
                                        <span>{subItem.label}</span>
                                      </button>

                                      {/* Subject Modules Accordion Level 3 (with Hover Flyout) */}
                                      {showModulesAccordion && course.modules && course.modules.length > 0 && (
                                        <div className="pl-2.5 py-1 space-y-1 border-l border-slate-200 ml-2 animate-smooth-fade">
                                          {course.modules.map(module => {
                                            const isModuleSelected = selectedModuleId === module.id;
                                            return (
                                              <div 
                                                key={module.id} 
                                                className="relative"
                                                onMouseEnter={(e) => handleMouseEnter(module, e)}
                                                onMouseLeave={handleMouseLeave}
                                              >
                                                <button
                                                  onClick={() => {
                                                    setSelectedModuleId(module.id);
                                                    setSelectedContentId(null);
                                                    onChangeTab("cursos");
                                                  }}
                                                  className={`group w-full flex items-center space-x-1.5 px-2 py-1.5 rounded text-xs font-sans font-medium transition-all duration-150 cursor-pointer text-left hover:bg-slate-100/50 hover:font-bold ${
                                                    isModuleSelected
                                                      ? "text-slate-800 font-bold bg-slate-100"
                                                      : "text-slate-500 hover:text-slate-700"
                                                  }`}
                                                >
                                                  <BookOpen className="w-2.5 h-2.5 shrink-0 opacity-60" />
                                                  <span className="line-clamp-2 leading-tight">{capitalizeFirstOnly((module.title || "").replace(/^Módulo \d+:\s*/, ""))}</span>
                                                </button>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>
                                 );
                               })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <button
              id={`sidebar-tab-${item.id}`}
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`group w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg font-sans font-medium transition-all duration-150 cursor-pointer text-xs uppercase hover:text-sm hover:font-bold ${
                isActive 
                  ? "bg-slate-100/50 text-slate-900 border-l-4 border-slate-700 font-bold shadow-sm" 
                  : "text-slate-600 hover:bg-blue-50/80 hover:text-blue-700"
              }`}
            >
              <IconComponent className={`w-4 h-4 shrink-0 transition-colors ${isActive ? "text-slate-700" : "text-slate-400 group-hover:text-blue-600"}`} />
              <span>{item.label.toUpperCase()}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Utility / Logout */}
      <div className="p-4 border-t border-slate-100 space-y-3">
        <div className="space-y-1">
          <button
            onClick={() => alert("Suporte técnico do Cabo Véio. Envie suas dúvidas para suporte@caboveio.com.br")}
            className="w-full flex items-center space-x-3 px-3 py-1.5 rounded text-[11px] font-sans font-medium uppercase text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer text-left"
          >
            <SupportIcon className="w-3.5 h-3.5 text-slate-400" />
            <span>SUPORTE</span>
          </button>
          
          <button
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-3 py-1.5 rounded text-[11px] font-sans font-medium uppercase text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer text-left"
          >
            <LogOut className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-500" />
            <span>SAIR</span>
          </button>
        </div>
      </div>

      {/* Flyout Menu showing subjects (materias) on hover (rendered using fixed position to prevent parent overflow clipping) */}
      {hoveredModule && (
        <div 
          className="fixed w-72 bg-white border border-slate-200 shadow-xl rounded-xl py-2 z-[9999] pl-1 pr-1 max-h-[300px] overflow-y-auto animate-in fade-in slide-in-from-left-1 duration-150"
          style={{ 
            top: Math.min(hoveredModule.top, window.innerHeight - 310), 
            left: 210 
          }}
          onMouseEnter={() => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
          }}
          onMouseLeave={handleMouseLeave}
        >
          <div className="px-3 py-1.5 border-b border-slate-100 mb-1">
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">Matérias da Disciplina</span>
          </div>
          {(() => {
            const materiasList: any[] = [];
            if (hoveredModule.rawDiscipline && Array.isArray(hoveredModule.rawDiscipline.areas)) {
              hoveredModule.rawDiscipline.areas.forEach((area: any) => {
                if (Array.isArray(area.contents)) {
                  area.contents.forEach((content: any) => {
                    materiasList.push(content);
                  });
                }
              });
            }

            if (materiasList.length === 0) {
              return <div className="text-[10px] text-slate-400 italic px-3 py-1">Nenhuma matéria disponível</div>;
            }

            return materiasList.map(materia => (
              <button
                key={materia.id}
                onClick={() => {
                  setSelectedModuleId(hoveredModule.id);
                  setSelectedContentId(materia.id);
                  setSubjectActiveTab("aulas");
                  onChangeTab("cursos");
                  setHoveredModule(null); // Close flyout on select
                }}
                className="w-full text-left px-3 py-2 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 rounded-lg text-xs font-sans transition-colors cursor-pointer border-none bg-transparent block truncate"
                title={materia.name}
              >
                {materia.name}
              </button>
            ));
          })()}
        </div>
      )}
    </aside>
  );
}
