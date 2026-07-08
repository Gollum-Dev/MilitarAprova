import { 
  Home, BookOpen, Tv, HelpCircle, GraduationCap, Scale, 
  MessageSquare, LineChart, Settings, LogOut, ShieldAlert, 
  Award, Bot, ArrowLeft, HelpCircle as SupportIcon, FileText, Headphones, Presentation
} from "lucide-react";
import { Course } from "../data";
import { fetchCourses } from "../lib/api";
import { useState, useEffect } from "react";

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
  courseActiveTab: "materias" | "simuladores" | "leis" | "tutor" | "desempenho";
  setCourseActiveTab: (tab: "materias" | "simuladores" | "leis" | "tutor" | "desempenho") => void;
  subjectActiveTab: "aulas" | "materiais" | "questoes" | "flashcards" | "audio" | "slides";
  setSubjectActiveTab: (tab: "aulas" | "materiais" | "questoes" | "flashcards" | "audio" | "slides") => void;
  allowedCourses: string[];
}

export default function Sidebar({ 
  currentTab, onChangeTab, userRank, onLogout, isOfflineMode,
  selectedCourseId, setSelectedCourseId, selectedModuleId, setSelectedModuleId,
  courseActiveTab, setCourseActiveTab, subjectActiveTab, setSubjectActiveTab, allowedCourses
}: SidebarProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isHoveringCursos, setIsHoveringCursos] = useState(false);
  useEffect(() => {
    fetchCourses().then(setCourses).catch(console.error);
  }, []);

  const selectedCourse = courses.find(c => c.id === selectedCourseId) || null;
  const selectedModule = selectedCourse?.modules.find(m => m.id === selectedModuleId) || null;

  // Determine current navigation level
  const isSubjectLevel = selectedCourseId !== null && selectedModuleId !== null;
  const isCourseLevel = selectedCourseId !== null && selectedModuleId === null;

  // Build items based on level
  let sidebarHeading = "Cabo Véio";
  let sidebarSubtitle = "Doutrina de Caserna";
  let menuItems: { id: string; label: string; icon: any }[] = [];

  if (isSubjectLevel && selectedModule) {
    sidebarHeading = selectedModule.title.replace(/^Módulo \d+:\s*/, "");
    sidebarSubtitle = "Estudo do Módulo";
    menuItems = [
      { id: "aulas", label: "Vídeo Aulas", icon: Tv },
      { id: "audio", label: "Áudio Aula", icon: Headphones },
      { id: "materiais", label: "Material (PDFs)", icon: FileText },
      { id: "slides", label: "Slides", icon: Presentation },
      { id: "questoes", label: "Questões", icon: HelpCircle },
      { id: "flashcards", label: "Flashcards", icon: Award },
    ];
  } else if (isCourseLevel && selectedCourse) {
    sidebarHeading = selectedCourse.title.replace(/CURSO PREPARATÓRIO\s*|CURSO OFICIAL\s*/i, "");
    sidebarSubtitle = "Menu do Curso";
    menuItems = [
      { id: "materias", label: "Matérias", icon: BookOpen },
      { id: "simuladores", label: "Simuladores", icon: GraduationCap },
      { id: "leis", label: "Leis Inteligentes", icon: Scale },
      { id: "tutor", label: "Tutor IA", icon: MessageSquare },
      { id: "desempenho", label: "Desempenho", icon: LineChart },
    ];
  } else {
    menuItems = [
      { id: "inicio", label: "Início", icon: Home },
      { id: "cursos", label: "Meus Cursos", icon: BookOpen },
      { id: "configuracoes", label: "Configurações", icon: Settings },
    ];
  }

  const handleItemClick = (id: string) => {
    if (isSubjectLevel) {
      setSubjectActiveTab(id as any);
    } else if (isCourseLevel) {
      setCourseActiveTab(id as any);
    } else {
      onChangeTab(id);
    }
  };

  const checkIsActive = (id: string) => {
    if (isSubjectLevel) {
      return subjectActiveTab === id;
    }
    if (isCourseLevel) {
      return courseActiveTab === id;
    }
    return currentTab === id;
  };

  const handleBackToCourses = () => {
    setSelectedCourseId(null);
    setSelectedModuleId(null);
    onChangeTab("cursos");
  };

  const handleBackToModules = () => {
    setSelectedModuleId(null);
  };

  return (
    <aside className="w-64 glass-panel border-r border-slate-200/50 flex flex-col h-screen shrink-0 relative z-50">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-100">

        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center overflow-hidden border border-emerald-200/50 shadow-sm bg-slate-50">
            <img src="/Gemini_Generated_Image_bp9bitbp9bitbp9b.png" alt="Cabo Véio" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-sm font-display font-bold text-[var(--ink)] tracking-tight leading-tight">
              {sidebarHeading}
            </h1>
            <p className="text-[10px] font-sans font-medium text-slate-400 mt-0.5 tracking-wider uppercase">
              {sidebarSubtitle}
            </p>
          </div>
        </div>
      </div>

      {/* User Context Rank Badge */}
      <div className="px-6 py-3 border-b border-slate-50 bg-slate-50/50 flex items-center space-x-2">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-[10px] font-mono font-bold text-slate-500 tracking-wider uppercase">
          Hierarquia: {userRank === "Soldado" ? "Recruta" : userRank}
        </span>
      </div>

      {/* Navigation menu */}
      <nav className="flex-1 p-4 space-y-1.5">
        {menuItems.map(item => {
          const IconComponent = item.icon;
          const isActive = checkIsActive(item.id);
          
          if (item.id === "cursos" && allowedCourses && allowedCourses.length > 0) {
            const myCourses = courses.filter(c => allowedCourses.includes(c.id));
            return (
              <div 
                key={item.id} 
                className="relative group"
              >
                <button
                  id={`sidebar-tab-${item.id}`}
                  onClick={() => handleItemClick(item.id)}
                  className={`group w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-sans font-medium transition-all duration-150 cursor-pointer ${
                    isActive 
                      ? "bg-slate-100/50 text-slate-900 border-l-4 border-slate-700 font-bold shadow-sm" 
                      : "text-slate-600 hover:bg-blue-50/80 hover:text-blue-700"
                  }`}
                >
                  <IconComponent className={`w-4 h-4 shrink-0 transition-colors ${isActive ? "text-slate-700" : "text-slate-400 group-hover:text-blue-600"}`} />
                  <span>{item.label}</span>
                </button>
                
                {myCourses.length > 0 && (
                  <div className="absolute left-[80%] top-0 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[100] flex flex-col space-y-1.5 p-1.5 glass-panel rounded-xl">
                    {myCourses.map(course => (
                      <button
                        key={course.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCourseId(course.id);
                          onChangeTab("cursos");
                        }}
                        className="group w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-sans font-medium transition-all duration-150 cursor-pointer text-slate-600 hover:bg-blue-50/80 hover:text-blue-700"
                      >
                        <BookOpen className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-blue-600 transition-colors" />
                        <span className="line-clamp-1 text-left">{course.title}</span>
                      </button>
                    ))}
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
              className={`group w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-sans font-medium transition-all duration-150 cursor-pointer ${
                isActive 
                  ? "bg-slate-100/50 text-slate-900 border-l-4 border-slate-700 font-bold shadow-sm" 
                  : "text-slate-600 hover:bg-blue-50/80 hover:text-blue-700"
              }`}
            >
              <IconComponent className={`w-4 h-4 shrink-0 transition-colors ${isActive ? "text-slate-700" : "text-slate-400 group-hover:text-blue-600"}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Utility / Logout */}
      <div className="p-4 border-t border-slate-100 space-y-3">
        <div className="space-y-1">
          <button
            onClick={() => alert("Suporte técnico do Cabo Véio. Envie suas dúvidas para suporte@caboveio.com.br")}
            className="w-full flex items-center space-x-3 px-3 py-1.5 rounded text-[11px] font-sans font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer text-left"
          >
            <SupportIcon className="w-3.5 h-3.5 text-slate-400" />
            <span>Suporte</span>
          </button>
          
          <button
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-3 py-1.5 rounded text-[11px] font-sans font-medium text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer text-left"
          >
            <LogOut className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-500" />
            <span>Sair</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
