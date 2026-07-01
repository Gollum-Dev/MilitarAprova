import { 
  Home, BookOpen, Tv, HelpCircle, GraduationCap, Scale, 
  MessageSquare, LineChart, Settings, LogOut, ShieldAlert, 
  Award, Bot, ArrowLeft, HelpCircle as SupportIcon, FileText, Headphones
} from "lucide-react";
import { COURSES } from "../data";

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
  subjectActiveTab: "aulas" | "materiais" | "questoes" | "flashcards" | "audio";
  setSubjectActiveTab: (tab: "aulas" | "materiais" | "questoes" | "flashcards" | "audio") => void;
}

export default function Sidebar({ 
  currentTab, onChangeTab, userRank, onLogout, isOfflineMode,
  selectedCourseId, setSelectedCourseId, selectedModuleId, setSelectedModuleId,
  courseActiveTab, setCourseActiveTab, subjectActiveTab, setSubjectActiveTab
}: SidebarProps) {

  const selectedCourse = COURSES.find(c => c.id === selectedCourseId) || null;
  const selectedModule = selectedCourse?.modules.find(m => m.id === selectedModuleId) || null;

  // Determine current navigation level
  const isSubjectLevel = selectedCourseId !== null && selectedModuleId !== null;
  const isCourseLevel = selectedCourseId !== null && selectedModuleId === null;

  // Build items based on level
  let sidebarHeading = "Militar Aprova IA";
  let sidebarSubtitle = "Doutrina Bombeiro Militar";
  let menuItems: { id: string; label: string; icon: any }[] = [];

  if (isSubjectLevel && selectedModule) {
    sidebarHeading = selectedModule.title.replace(/^Módulo \d+:\s*/, "");
    sidebarSubtitle = "Estudo do Módulo";
    menuItems = [
      { id: "aulas", label: "Vídeo Aulas", icon: Tv },
      { id: "audio", label: "Áudio Aula", icon: Headphones },
      { id: "materiais", label: "Material (PDFs)", icon: FileText },
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

  const handleBackAction = () => {
    if (isSubjectLevel) {
      setSelectedModuleId(null);
      setCourseActiveTab("materias");
    } else if (isCourseLevel) {
      setSelectedCourseId(null);
      onChangeTab("cursos");
    }
  };

  const checkIsActive = (id: string) => {
    if (isSubjectLevel) return subjectActiveTab === id;
    if (isCourseLevel) return courseActiveTab === id;
    return currentTab === id;
  };

  return (
    <aside className="w-64 glass-panel border-r border-slate-200 flex flex-col justify-between shrink-0 h-screen sticky top-0" id="main-sidebar">
      {/* Top Brand / Logo / Context Header */}
      <div className="p-5 border-b border-slate-100 space-y-2">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded bg-gradient-to-tr from-indigo-500 to-indigo-700 border border-amber-400/20 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-4 h-4 text-white" />
          </div>
          <div className="overflow-hidden">
            <h1 className="text-xs font-sans font-bold text-slate-800 tracking-wide uppercase truncate">
              {sidebarHeading}
            </h1>
            <p className="text-[9px] text-slate-400 font-mono tracking-wider uppercase truncate">
              {sidebarSubtitle}
            </p>
          </div>
        </div>
        
        {isOfflineMode && !isCourseLevel && !isSubjectLevel && (
          <div className="mt-1 px-2 py-0.5 bg-amber-50 border border-amber-200 rounded text-[8px] font-mono text-amber-600 text-center uppercase tracking-wider">
            Modo Local / Sem API Key
          </div>
        )}
      </div>

      {/* Context Back Action Button at top of navigation list */}
      {(isCourseLevel || isSubjectLevel) && (
        <div className="px-3 pt-3">
          <button
            onClick={handleBackAction}
            className="w-full flex items-center space-x-2 px-3 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg text-[10px] font-mono font-bold text-slate-600 hover:text-slate-800 transition-all uppercase cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isSubjectLevel ? "Voltar ao Curso" : "Voltar aos Cursos"}</span>
          </button>
        </div>
      )}

      {/* User Info / Profile Section */}
      {!isCourseLevel && !isSubjectLevel && (
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-indigo-600 border border-amber-400/20 flex items-center justify-center text-white font-mono font-bold text-sm shadow-sm">
              SD
            </div>
            <div className="overflow-hidden">
              <h3 className="text-xs font-sans font-semibold text-slate-800 uppercase truncate">
                Soldado Silva
              </h3>
              <p className="text-[10px] text-slate-500 font-mono">
                CBMMG • {userRank}
              </p>
              <span className="inline-block mt-1 text-[8px] font-sans font-extrabold text-amber-700 bg-amber-50 border border-amber-200/50 px-1.5 py-0.5 rounded uppercase tracking-wider">
                Rumo ao Oficialato
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Menu Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin scrollbar-thumb-slate-200">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = checkIsActive(item.id);
          return (
            <button
              id={`sidebar-tab-${item.id}`}
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-sans font-medium transition-all duration-150 cursor-pointer ${
                isActive 
                  ? "bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600 font-bold shadow-sm" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <IconComponent className={`w-4 h-4 shrink-0 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Utility / Logout */}
      <div className="p-4 border-t border-slate-100 space-y-3">
        <div className="space-y-1">
          <button
            onClick={() => alert("Suporte técnico do Militar Aprova IA. Envie suas dúvidas para suporte@militaraprovaia.com.br")}
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
