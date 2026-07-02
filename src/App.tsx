import React, { useState, useEffect } from "react";
import LoginScreen from "./components/LoginScreen";
import LandingPage from "./components/LandingPage";
import Sidebar from "./components/Sidebar";
import DashboardHome from "./components/DashboardHome";
import MeusCursos from "./components/MeusCursos";
import AdminDashboard from "./components/AdminDashboard";

export default function App() {
  const [authView, setAuthView] = useState<"landing" | "login" | "app">("landing");
  const [userRole, setUserRole] = useState<"aluno" | "admin">("aluno");
  const [userName, setUserName] = useState("Silva");
  const [currentTab, setCurrentTab] = useState("inicio");
  const [userRank, setUserRank] = useState("SOLDADO");
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [tutorInitialPrompt, setTutorInitialPrompt] = useState("");

  // Lifted navigation states for context-aware sidebar
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [courseActiveTab, setCourseActiveTab] = useState<"materias" | "simuladores" | "leis" | "tutor" | "desempenho">("materias");
  const [subjectActiveTab, setSubjectActiveTab] = useState<"aulas" | "materiais" | "questoes" | "flashcards" | "audio">("aulas");

  // Check health and offline status of Gemini API on load
  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => {
        if (data.offlineMode) {
          setIsOfflineMode(true);
        }
      })
      .catch((err) => {
        console.warn("Backend health check failed. Assuming local offline mode.", err);
        setIsOfflineMode(true);
      });
  }, []);

  const handleLoginSuccess = (name: string, role: "aluno" | "admin" = "aluno") => {
    setUserName(name);
    setUserRole(role);
    setAuthView("app");
  };

  const handleLogout = () => {
    setAuthView("landing");
    setCurrentTab("inicio");
    setSelectedCourseId(null);
    setSelectedModuleId(null);
  };

  const handleAskTutor = (question: string) => {
    setTutorInitialPrompt(question);
    if (selectedCourseId) {
      setCourseActiveTab("tutor");
    } else {
      setSelectedCourseId("cho-cbmmg-2027");
      setCourseActiveTab("tutor");
      setCurrentTab("cursos");
    }
  };

  const handleGenerateCustomSimulator = (subject: string) => {
    if (selectedCourseId) {
      setCourseActiveTab("simuladores");
    } else {
      setSelectedCourseId("cho-cbmmg-2027");
      setCourseActiveTab("simuladores");
      setCurrentTab("cursos");
    }
    alert(`Preparando simulação tática pela IA sobre: ${subject}. Acesse o Simulador do seu curso ativo.`);
  };

  const renderActiveTabContent = () => {
    switch (currentTab) {
      case "inicio":
        return (
          <DashboardHome 
            onChangeTab={setCurrentTab} 
            onGenerateCustomSimulator={handleGenerateCustomSimulator} 
          />
        );
      case "cursos":
        return (
          <MeusCursos 
            onChangeTab={setCurrentTab} 
            onAskTutor={handleAskTutor} 
            selectedCourseId={selectedCourseId}
            setSelectedCourseId={setSelectedCourseId}
            selectedModuleId={selectedModuleId}
            setSelectedModuleId={setSelectedModuleId}
            courseActiveTab={courseActiveTab}
            setCourseActiveTab={setCourseActiveTab}
            subjectActiveTab={subjectActiveTab}
            setSubjectActiveTab={setSubjectActiveTab}
            tutorInitialPrompt={tutorInitialPrompt}
            onClearTutorPrompt={() => setTutorInitialPrompt("")}
          />
        );
      case "configuracoes":
        return (
          <div className="glass-panel rounded-2xl p-8 space-y-6 shadow-sm animate-smooth-fade">
            <h3 className="text-base font-display font-bold uppercase tracking-wider text-[var(--ink)] border-b border-[var(--line)] pb-3">Configurações da Conta e Plataforma</h3>
            
            <div className="space-y-4 max-w-xl">
              <div className="flex justify-between items-center py-2.5 border-b border-slate-100">
                <span className="text-xs font-sans text-slate-600">Identificação Militar</span>
                <span className="text-xs font-mono text-slate-500 font-bold">SOLDADO SILVA • CBMMG</span>
              </div>
              <div className="flex justify-between items-center py-2.5 border-b border-slate-100">
                <span className="text-xs font-sans text-slate-600">Fuso Horário Militar</span>
                <span className="text-xs font-mono text-slate-500 font-bold">UTC-3 (Brasília)</span>
              </div>
              <div className="flex justify-between items-center py-2.5 border-b border-slate-100">
                <span className="text-xs font-sans text-slate-600">Nível do Modelo de IA</span>
                <span className="text-xs font-mono text-indigo-600 font-bold">GEMINI 3.5 FLASH (MÁXIMA VELOCIDADE)</span>
              </div>
            </div>
            
            <p className="text-[10px] text-slate-400 font-mono">Plataforma Cabo Véio homologada • Versão 1.4.0</p>
          </div>
        );
      default:
        return (
          <DashboardHome 
            onChangeTab={setCurrentTab} 
            onGenerateCustomSimulator={handleGenerateCustomSimulator} 
          />
        );
    }
  };

  if (authView === "landing") {
    return <LandingPage onNavigateToLogin={() => setAuthView("login")} />;
  }

  if (authView === "login") {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} onBackToLanding={() => setAuthView("landing")} />;
  }

  if (authView === "app" && userRole === "admin") {
    return <AdminDashboard onLogout={handleLogout} userName={userName} />;
  }

  return (
    <div className="min-h-screen flex animate-smooth-fade" id="app-root-container">
      {/* Sidebar navigation */}
      <Sidebar 
        currentTab={currentTab} 
        onChangeTab={setCurrentTab} 
        userRank={userRank} 
        onLogout={handleLogout}
        isOfflineMode={isOfflineMode}
        selectedCourseId={selectedCourseId}
        setSelectedCourseId={setSelectedCourseId}
        selectedModuleId={selectedModuleId}
        setSelectedModuleId={setSelectedModuleId}
        courseActiveTab={courseActiveTab}
        setCourseActiveTab={setCourseActiveTab}
        subjectActiveTab={subjectActiveTab}
        setSubjectActiveTab={setSubjectActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto h-screen p-6 md:p-8 scrollbar-thin scrollbar-thumb-slate-200">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header context info bar */}
          <div className="flex justify-between items-center border-b border-slate-200 pb-4">
            <div>
              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">
                CENTRAL DE DOUTRINA - CABO VÉIO
              </span>
              <h2 className="text-xs font-mono uppercase font-bold text-slate-700 tracking-tight mt-0.5">
                {currentTab === "inicio" && "Painel de Comando"}
                {currentTab === "cursos" && !selectedCourseId && "Meus Cursos"}
                {currentTab === "cursos" && selectedCourseId && !selectedModuleId && "Painel do Curso"}
                {currentTab === "cursos" && selectedModuleId && "Ambiente de Aprendizado"}
                {currentTab === "configuracoes" && "Configurações"}
              </h2>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono text-slate-500">
                Data do Sistema: <strong className="text-slate-700">2026</strong>
              </span>
            </div>
          </div>

          {/* Dynamic screen content */}
          <div className="animate-smooth-fade">
            {renderActiveTabContent()}
          </div>
        </div>
      </main>
    </div>
  );
}
