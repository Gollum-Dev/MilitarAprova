import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import LoginScreen from "./components/LoginScreen";
import LandingPage from "./components/LandingPage";
import Sidebar from "./components/Sidebar";
import DashboardHome from "./components/DashboardHome";
import MeusCursos from "./components/MeusCursos";
import AdminDashboard from "./components/AdminDashboard";
import ConfiguracoesScreen from "./components/ConfiguracoesScreen";
import DesempenhoScreen from "./components/DesempenhoScreen";
import TrilhaGuiadaScreen from "./components/TrilhaGuiadaScreen";
import { fetchCourses } from "./lib/api";
import { getStudentStats, StudentStats, initializeProgress, incrementStudyHours } from "./lib/progress";
import { initializePlanner } from "./lib/studyPlanner";
import { supabase } from "./lib/supabase";

export default function App() {
  const [authView, setAuthView] = useState<"landing" | "login" | "app">("landing");
  const [userRole, setUserRole] = useState<"aluno" | "admin">("aluno");
  const [userName, setUserName] = useState("Silva");
  const [allowedCourses, setAllowedCourses] = useState<string[]>([]);
  const [currentTab, setCurrentTab] = useState("inicio");
  const [userRank, setUserRank] = useState("SOLDADO");
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  useEffect(() => {
    if (authView === "app" && userRole === "aluno") {
      const timer = setInterval(() => {
        incrementStudyHours(10 / 3600);
      }, 10000);

      const rankTimer = setInterval(() => {
        const stats = getStudentStats(0);
        const questionsAnswered = stats.questionsAnswered;
        let patent = "SOLDADO";
        if (questionsAnswered >= 50) patent = "CABO";
        if (questionsAnswered >= 100) patent = "SARGENTO";
        if (questionsAnswered >= 200) patent = "SUBTENENTE";
        if (questionsAnswered >= 500) patent = "SEGUNDO TENENTE";
        if (questionsAnswered >= 1000) patent = "PRIMEIRO TENENTE";
        setUserRank(patent);
      }, 2000);

      return () => {
        clearInterval(timer);
        clearInterval(rankTimer);
      };
    }
  }, [authView, userRole]);
  const [tutorInitialPrompt, setTutorInitialPrompt] = useState("");

  // Lifted navigation states for context-aware sidebar
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [selectedContentId, setSelectedContentId] = useState<number | null>(null);
  const [courseActiveTab, setCourseActiveTab] = useState<"materias" | "simuladores" | "leis" | "tutor" | "desempenho" | "gestao" | "trilha">("materias");
  const [subjectActiveTab, setSubjectActiveTab] = useState<"aulas" | "materiais" | "questoes" | "flashcards" | "audio" | "slides">("aulas");

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

  useEffect(() => {
    if (selectedCourseId) {
      localStorage.setItem("militar_last_course_id", selectedCourseId);
    }
    if (selectedModuleId) {
      localStorage.setItem("militar_last_module_id", selectedModuleId);
    }
    if (selectedContentId !== null && selectedContentId !== undefined) {
      localStorage.setItem("militar_last_content_id", selectedContentId.toString());
    }
  }, [selectedCourseId, selectedModuleId, selectedContentId]);

  const handleSupabaseUser = async (user: any) => {
    const userEmail = user.email?.toLowerCase().trim();
    if (!userEmail) return;

    if (userEmail === "admin@teste.com" || userEmail.endsWith("@admin.com")) {
      handleLoginSuccess("Administrador", "admin", []);
      return;
    }

    try {
      const { data: student, error } = await supabase
        .from('students')
        .select('*')
        .eq('email', userEmail)
        .single();

      if (error || !student) {
        const newStudent = {
          name: user.user_metadata?.full_name || user.user_metadata?.name || userEmail.split('@')[0],
          email: userEmail,
          password: 'google-oauth-login',
          phone: '',
          cpf: '',
          status: 'Ativo',
          allowed_courses: ["cho-cbmmg-2027", "cfo-cbmmg-2027", "eap-cbmmg-2026"]
        };

        const { data: inserted, error: insertError } = await supabase
          .from('students')
          .insert([newStudent])
          .select()
          .single();

        if (!insertError && inserted) {
          initializeProgress(inserted);
          initializePlanner(inserted);
          handleLoginSuccess(inserted.name, "aluno", inserted.allowed_courses || []);
        } else {
          console.error("Erro ao criar estudante via Google Auth:", insertError);
          initializeProgress(newStudent);
          initializePlanner(newStudent);
          handleLoginSuccess(newStudent.name, "aluno", newStudent.allowed_courses);
        }
      } else {
        if (student.status === 'Inativo') {
          alert("Sua conta de aluno está inativa. Entre em contato com o administrador.");
          await supabase.auth.signOut();
          return;
        }
        initializeProgress(student);
        initializePlanner(student);
        handleLoginSuccess(student.name, "aluno", student.allowed_courses || []);
      }
    } catch (err) {
      console.error("Erro ao processar login social:", err);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        handleSupabaseUser(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        handleSupabaseUser(session.user);
      } else if (_event === 'SIGNED_OUT') {
        setAuthView("landing");
        setCurrentTab("inicio");
        setSelectedCourseId(null);
        setSelectedModuleId(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLoginSuccess = (name: string, role: "aluno" | "admin" = "aluno", allowedCoursesList: string[] = []) => {
    setUserName(name);
    setUserRole(role);
    setAllowedCourses(allowedCoursesList);
    setAuthView("app");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
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
            userName={userName}
            allowedCourses={allowedCourses}
            setSelectedCourseId={setSelectedCourseId}
            setSelectedModuleId={setSelectedModuleId}
            setSelectedContentId={setSelectedContentId}
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
            selectedContentId={selectedContentId}
            setSelectedContentId={setSelectedContentId}
            courseActiveTab={courseActiveTab}
            setCourseActiveTab={setCourseActiveTab}
            subjectActiveTab={subjectActiveTab}
            setSubjectActiveTab={setSubjectActiveTab}
            tutorInitialPrompt={tutorInitialPrompt}
            onClearTutorPrompt={() => setTutorInitialPrompt("")}
            allowedCourses={allowedCourses}
            userName={userName}
          />
        );
      case "trilha":
        return (
          <TrilhaGuiadaScreen 
            userName={userName}
            allowedCourses={allowedCourses}
            onChangeTab={setCurrentTab}
            setSelectedCourseId={setSelectedCourseId}
            setSelectedModuleId={setSelectedModuleId}
            setSelectedContentId={setSelectedContentId}
            setCourseActiveTab={setCourseActiveTab}
            setSubjectActiveTab={setSubjectActiveTab}
          />
        );
      case "configuracoes":
        return <ConfiguracoesScreen />;
      default:
        return (
          <DashboardHome 
            onChangeTab={setCurrentTab} 
            onGenerateCustomSimulator={handleGenerateCustomSimulator} 
            userName={userName}
            allowedCourses={allowedCourses}
            setSelectedCourseId={setSelectedCourseId}
            setSelectedModuleId={setSelectedModuleId}
            setSelectedContentId={setSelectedContentId}
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
        selectedContentId={selectedContentId}
        setSelectedContentId={setSelectedContentId}
        courseActiveTab={courseActiveTab}
        setCourseActiveTab={setCourseActiveTab}
        subjectActiveTab={subjectActiveTab}
        setSubjectActiveTab={setSubjectActiveTab}
        allowedCourses={allowedCourses}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto h-screen p-6 md:p-8 scrollbar-thin scrollbar-thumb-slate-200">
        <div className="max-w-7xl mx-auto space-y-6">


          {/* Dynamic screen content */}
          <div className="animate-smooth-fade">
            {renderActiveTabContent()}
          </div>
        </div>
      </main>
    </div>
  );
}
