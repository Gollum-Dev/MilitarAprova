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
}

export default function Sidebar({ 
  currentTab, onChangeTab, userRank, onLogout, isOfflineMode,
  selectedCourseId, setSelectedCourseId, selectedModuleId, setSelectedModuleId,
  courseActiveTab, setCourseActiveTab, subjectActiveTab, setSubjectActiveTab
}: SidebarProps) {
  const [courses, setCourses] = useState<Course[]>([]);
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
    <aside className="w-64 bg-[var(--panel)] border-r border-[var(--line)] flex flex-col h-screen shrink-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-100">
        {(isCourseLevel || isSubjectLevel) && (
          <button 
            onClick={isSubjectLevel ? handleBackToModules : handleBackToCourses}
            className="flex items-center space-x-1.5 text-xs text-[var(--accent)] hover:underline mb-4 font-sans font-medium cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isSubjectLevel ? "Voltar ao Curso" : "Voltar aos Cursos"}</span>
          </button>
        )}
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
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {menuItems.map(item => {
          const IconComponent = item.icon;
          const isActive = checkIsActive(item.id);
          return (
            <button
              id={`sidebar-tab-${item.id}`}
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-sans font-medium transition-all duration-150 cursor-pointer ${
                isActive 
                  ? "bg-emerald-50 text-emerald-800 border-l-4 border-emerald-700 font-bold shadow-sm" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <IconComponent className={`w-4 h-4 shrink-0 ${isActive ? "text-emerald-700" : "text-slate-400"}`} />
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
