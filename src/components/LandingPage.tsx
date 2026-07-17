import React, { useState, useEffect } from "react";
import { 
  ShieldAlert, Award, ArrowRight, Target, Tv, BookOpen, 
  ChevronRight, CheckCircle, X, Sparkles, BarChart3, TrendingUp, 
  Activity, Map, Bot, FileText, Headphones, MonitorPlay, 
  Library, Clock, Phone, Mail, MessageCircle
} from "lucide-react";
import { fetchCourses } from "../lib/api";
import { sendSupportMessage, getAdminSettings } from "../lib/support";
import { Course } from "../data";
import MockSimulado from "./MockSimulado";

interface LandingPageProps {
  onNavigateToLogin: (courseId?: string) => void;
}

export default function LandingPage({ onNavigateToLogin }: LandingPageProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [buyerEmail, setBuyerEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [isSendingContact, setIsSendingContact] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showMockTest, setShowMockTest] = useState(false);

  const [adminPhone, setAdminPhone] = useState("(31) 99999-9999");
  const [adminEmail, setAdminEmail] = useState("contato@caboveio.com.br");

  useEffect(() => {
    fetchCourses()
      .then((data) => {
        setCourses(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao carregar cursos na LandingPage:", err);
        setLoading(false);
      });

    getAdminSettings().then(settings => {
      if (settings) {
        if (settings.support_phone) setAdminPhone(settings.support_phone);
        if (settings.support_email) setAdminEmail(settings.support_email);
      }
    });
  }, []);

  const handleBuyClick = (course: Course) => {
    onNavigateToLogin(course.id);
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) return;

    setIsSendingContact(true);
    try {
      const fullMessage = `Novo Contato (Site Aberto)\nNome: ${contactName}\nContato: ${contactEmail}\n\nMensagem:\n${contactMessage}`;
      const fakeUserId = `LEAD_${contactEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
      
      await sendSupportMessage(fakeUserId, fullMessage, 'student');
      
      alert("Sua mensagem foi enviada com sucesso! Nossa equipe entrará em contato em breve.");
      setContactName("");
      setContactEmail("");
      setContactMessage("");
    } catch (err) {
      console.error(err);
      alert("Houve um erro ao enviar sua mensagem. Tente novamente ou use o WhatsApp.");
    } finally {
      setIsSendingContact(false);
    }
  };

  const handleEmailFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactMessage) return;
    
    // Build mailto link
    const subject = encodeURIComponent(`Contato pelo Site - ${contactName}`);
    const body = encodeURIComponent(contactMessage);
    window.location.href = `mailto:${adminEmail}?subject=${subject}&body=${body}`;
    
    // Reset and close
    setContactName("");
    setContactMessage("");
    setShowEmailForm(false);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerEmail || !selectedCourse) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/payments/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: buyerEmail, courseId: selectedCourse.id })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Erro ao gerar link de pagamento.");
      }

      const data = await response.json();
      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        throw new Error("Checkout link não foi retornado.");
      }
    } catch (err: any) {
      console.error(err);
      alert(`Falha ao iniciar pagamento: ${err.message || err}`);
      setIsSubmitting(false);
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] font-sans overflow-x-hidden animate-smooth-fade flex flex-col">      
      {/* HEADER (Topbar) Premium */}
      <header className="w-full fixed top-4 left-0 z-50 flex justify-center px-4 transition-all duration-300 animate-smooth-fade">
        <div className="max-w-7xl w-full bg-white/80 hover:bg-white/95 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_rgba(30,58,138,0.08)] rounded-full h-16 flex items-center justify-between px-3 md:px-6 transition-all duration-300">
          
          {/* Logo Premium */}
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <div className="w-10 h-10 rounded-full overflow-hidden border border-indigo-300/40 shadow-lg shadow-indigo-600/20 group-hover:shadow-indigo-500/40 transition-all duration-300 group-hover:scale-105">
              <img src="https://pub-bc0b63de539b4cafb3fdce383cb712fa.r2.dev/Gemini_Generated_Image_6k6ayf6k6ayf6k6a.png" alt="Logo Cabo Véio" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg md:text-xl font-display font-black text-slate-800 tracking-tight group-hover:text-indigo-700 transition-colors">
                Cabo Véio
              </h1>
              <p className="text-[8px] md:text-[9px] text-slate-500 font-mono tracking-widest uppercase font-bold">
                Doutrina & Bizus
              </p>
            </div>
          </div>

          {/* Navigation Tabs (Desktop) Premium */}
          <nav className="hidden md:flex flex-1 mx-6 lg:mx-12 items-center justify-between space-x-1 bg-slate-100/60 p-1.5 rounded-full border border-slate-200/60 shadow-inner">
            <button 
              onClick={() => scrollToSection("cursos")} 
              className="flex-1 w-full py-2 rounded-full text-[10px] lg:text-[11px] font-sans font-bold text-slate-600 hover:text-indigo-700 hover:bg-white hover:shadow-sm transition-all duration-300 border-none cursor-pointer uppercase tracking-wider text-center"
            >
              Cursos
            </button>
            <button 
              onClick={() => scrollToSection("painel")} 
              className="flex-1 w-full py-2 rounded-full text-[10px] lg:text-[11px] font-sans font-bold text-slate-600 hover:text-indigo-700 hover:bg-white hover:shadow-sm transition-all duration-300 border-none cursor-pointer uppercase tracking-wider text-center"
            >
              Controle
            </button>
            <button 
              onClick={() => scrollToSection("recursos")} 
              className="flex-1 w-full py-2 rounded-full text-[10px] lg:text-[11px] font-sans font-bold text-slate-600 hover:text-indigo-700 hover:bg-white hover:shadow-sm transition-all duration-300 border-none cursor-pointer uppercase tracking-wider text-center"
            >
              Inovação
            </button>
            <button 
              onClick={() => scrollToSection("gestao")} 
              className="flex-1 w-full py-2 rounded-full text-[10px] lg:text-[11px] font-sans font-bold text-slate-600 hover:text-indigo-700 hover:bg-white hover:shadow-sm transition-all duration-300 border-none cursor-pointer uppercase tracking-wider text-center"
            >
              Gestão
            </button>
            <button 
              onClick={() => scrollToSection("treino")} 
              className="flex-1 w-full py-2 rounded-full text-[10px] lg:text-[11px] font-sans font-bold text-slate-600 hover:text-indigo-700 hover:bg-white hover:shadow-sm transition-all duration-300 border-none cursor-pointer uppercase tracking-wider text-center"
            >
              Treino
            </button>
            <button 
              onClick={() => scrollToSection("porque")} 
              className="flex-1 w-full py-2 rounded-full text-[10px] lg:text-[11px] font-sans font-bold text-slate-600 hover:text-indigo-700 hover:bg-white hover:shadow-sm transition-all duration-300 border-none cursor-pointer uppercase tracking-wider text-center"
            >
              Por Que
            </button>
            <button 
              onClick={() => scrollToSection("contato")} 
              className="flex-1 w-full py-2 rounded-full text-[10px] lg:text-[11px] font-sans font-bold text-slate-600 hover:text-indigo-700 hover:bg-white hover:shadow-sm transition-all duration-300 border-none cursor-pointer uppercase tracking-wider text-center"
            >
              Contato
            </button>
          </nav>

          {/* Login Button Premium */}
          <div className="flex items-center">
            <button 
              onClick={() => onNavigateToLogin()}
              className="px-5 md:px-6 py-2 md:py-2.5 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/30 text-white font-sans font-black text-[10px] md:text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-2 border-none active:scale-[0.98]"
            >
              <span>Acessar</span>
              <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative w-full pt-32 pb-20 md:pt-40 md:pb-32 flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-blue-950 z-0">
          <div className="absolute inset-0 bg-blue-900/60 mix-blend-multiply z-10" />
          <img 
            src="/Cabo_Veio_Logo.png" 
            alt="Cabo Véio Tactical Background" 
            className="absolute inset-0 w-full h-full object-cover z-0 opacity-85"
          />
        </div>
        
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none z-10" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none z-10" />

        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-20 flex flex-col items-center text-center">

          <h2 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-white tracking-tight leading-tight mb-6 drop-shadow-2xl max-w-4xl">
            Cabo Véio: Revolucione a Sua Forma de <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-indigo-400">Aprender</span>
          </h2>

          <p className="text-lg md:text-xl font-sans max-w-2xl mx-auto mb-10 drop-shadow-md leading-relaxed text-slate-100">
            A plataforma de estudos mais completa do mercado. Inteligência Artificial, trilhas personalizadas e gestão total do seu progresso para garantir a sua aprovação e aprendizado.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center w-full space-y-4 sm:space-y-0 sm:space-x-6">
            <button 
              onClick={() => onNavigateToLogin()}
              className="w-full sm:w-auto px-8 py-5 bg-white text-indigo-900 hover:bg-slate-100 rounded-xl text-sm font-sans font-black uppercase tracking-wider transition-all shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:shadow-[0_0_40px_rgba(255,255,255,0.5)] flex items-center justify-center space-x-3 active:scale-95 cursor-pointer border-none whitespace-nowrap"
            >
              <span>Criar Minha Conta e Testar a Plataforma</span>
              <ArrowRight className="w-5 h-5 text-indigo-600 shrink-0" />
            </button>
          </div>
        </div>
      </section>

      {/* CATALOGUE SECTION */}
      <section id="cursos" className="py-24 bg-slate-50 relative z-20 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-1.5 bg-indigo-50/50 border border-indigo-100 rounded-full px-3 py-1 text-[10px] font-mono font-bold text-indigo-600 uppercase mb-3">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>Nossos Cursos Disponíveis</span>
            </div>
            <h3 className="text-3xl md:text-4xl font-display font-bold text-slate-800 tracking-tight mb-4">
              Matricule-se e Inicie Seus Estudos
            </h3>
            <p className="text-slate-500 font-sans max-w-4xl mx-auto text-base leading-relaxed">
              Acesso ilimitado a aulas em vídeo e áudio, materiais didáticos e resumos em PDF, slides dos professores, flashcards inteligentes, banco de questões comentadas, simulados inéditos e provas anteriores.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {courses.map((course) => (
                <div 
                  key={course.id} 
                  className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                >
                  {/* Cover */}
                  <div className="relative aspect-video w-full bg-slate-200 overflow-hidden">
                    {course.cover_url ? (
                      <img src={course.cover_url} alt={course.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-800 to-blue-950 text-white p-6 text-center">
                        <ShieldAlert className="w-10 h-10 text-cyan-400 mb-2" />
                        <span className="font-sans font-black text-xs uppercase tracking-wider">{course.title}</span>
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-indigo-600 text-white text-[10px] font-mono font-bold px-3 py-1 rounded-full shadow-sm">
                      R$ {course.id === 'cho-cbmmg-2027' ? '497' : course.id === 'cfo-cbmmg-2027' ? '597' : '297'}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                    <div className="space-y-3">
                      <h4 className="text-base font-sans font-black text-slate-800 leading-snug">
                        {course.title}
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed font-sans line-clamp-3">
                        {course.subtitle || course.description || "Curso preparatório focado no edital oficial do Corpo de Bombeiros Militar."}
                      </p>
                    </div>

                    <div className="space-y-4">
                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-2 border-t border-b border-slate-200/60 py-3.5 text-center">
                        <div>
                          <span className="text-[10px] font-mono text-slate-400 uppercase block">Carga</span>
                          <span className="text-xs font-sans font-extrabold text-slate-700">{course.hours}h</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-mono text-slate-400 uppercase block">Aulas</span>
                          <span className="text-xs font-sans font-extrabold text-slate-700">{course.lessons}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-mono text-slate-400 uppercase block">Matérias</span>
                          <span className="text-xs font-sans font-extrabold text-slate-700">{course.disciplinesCount || 10}</span>
                        </div>
                      </div>

                      {/* Features list */}
                      <ul className="space-y-2 text-[11px] font-sans font-bold text-slate-600 list-none p-0 m-0">
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span>Aulas em Áudio e Vídeo ilimitadas</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span>Resumos Estratégicos & Simulados Inéditos</span>
                        </li>
                      </ul>
                    </div>

                    {/* Buy Button */}
                    <button 
                      onClick={() => handleBuyClick(course)}
                      className="w-full py-3.5 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/30 text-white rounded-xl text-xs font-sans font-black uppercase tracking-widest transition-all cursor-pointer border-none flex items-center justify-center space-x-1.5 active:scale-[0.98]"
                    >
                      <span>Matricular-se Agora</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* DASHBOARD SECTION */}
      <section id="painel" className="py-24 bg-white relative z-20 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-1.5 bg-indigo-50/50 border border-indigo-100 rounded-full px-3 py-1 text-[10px] font-mono font-bold text-indigo-600 uppercase mb-3">
              <BarChart3 className="w-3.5 h-3.5 animate-pulse" />
              <span>Painel do Aluno</span>
            </div>
            <h3 className="text-3xl md:text-4xl font-display font-bold text-slate-800 tracking-tight mb-4">
              Assuma o Controle dos Seus Estudos
            </h3>
            <p className="text-slate-500 font-sans max-w-2xl mx-auto text-base leading-relaxed">
              Nós criamos um Ecossistema de Aprendizado onde você nunca estuda no escuro. Acompanhe cada passo da sua jornada com métricas claras e precisas.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="glass-panel p-5 rounded-2xl border border-slate-200/60 hover:shadow-lg transition-all bg-slate-50/50">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 text-indigo-600">
                <Target className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-2">Progresso dos Cursos</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                Saiba exatamente qual a porcentagem de conclusão de cada curso matriculado.
              </p>
            </div>
            <div className="glass-panel p-5 rounded-2xl border border-slate-200/60 hover:shadow-lg transition-all bg-slate-50/50">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 text-indigo-600">
                <Activity className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-2">Produtividade Diária</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                Visualize seu ritmo de estudos dia a dia e mantenha a motivação em alta.
              </p>
            </div>
            <div className="glass-panel p-5 rounded-2xl border border-slate-200/60 hover:shadow-lg transition-all bg-slate-50/50">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 text-indigo-600">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-2">Últimas Matérias</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                Tenha um histórico claro do que já foi vencido no edital ou cronograma.
              </p>
            </div>
            <div className="glass-panel p-5 rounded-2xl border border-slate-200/60 hover:shadow-lg transition-all bg-slate-50/50">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 text-indigo-600">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-2">Tendência</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                Nosso sistema analisa seu ritmo e mostra se sua produtividade está subindo, caindo ou estável, ajudando você a ajustar sua rotina.
              </p>
            </div>
            <div className="glass-panel p-5 rounded-2xl border border-slate-200/60 hover:shadow-lg transition-all bg-slate-50/50">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 text-indigo-600">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-2">Gestão de Progresso</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                Controle total e visual das matérias já estudadas e das que ainda faltam. O poder dos dados a favor da sua organização.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TECH & INNOVATION SECTION */}
      <section id="recursos" className="py-24 bg-slate-900 relative z-20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-600/20 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute left-0 bottom-0 w-96 h-96 bg-cyan-600/20 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-display font-bold text-white tracking-tight mb-4">
              Inovação e Tecnologia a Favor da Sua Aprovação
            </h3>
            <p className="text-slate-300 font-sans max-w-5xl mx-auto text-base leading-relaxed">
              Esqueça os métodos tradicionais e engessados. Aqui, a tecnologia trabalha para otimizar o seu tempo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 p-8 rounded-3xl hover:border-indigo-500/50 transition-all group">
              <div className="w-14 h-14 bg-indigo-500/20 border border-indigo-500/30 rounded-2xl flex items-center justify-center mb-6 text-indigo-400 group-hover:scale-110 transition-transform">
                <Map className="w-7 h-7" />
              </div>
              <h4 className="text-xl font-bold text-white mb-3">Trilhas Inteligentes</h4>
              <p className="text-slate-400 font-sans leading-relaxed text-sm">
                Não sabe por onde começar? Nossas Trilhas Inteligentes organizam o conteúdo de forma lógica e estratégica, criando o caminho mais rápido e eficiente para o seu domínio da matéria. Otimize seu tempo e estude o que realmente importa.
              </p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 p-8 rounded-3xl hover:border-cyan-500/50 transition-all group">
              <div className="w-14 h-14 bg-cyan-500/20 border border-cyan-500/30 rounded-2xl flex items-center justify-center mb-6 text-cyan-400 group-hover:scale-110 transition-transform">
                <Bot className="w-7 h-7" />
              </div>
              <h4 className="text-xl font-bold text-white mb-3">Tutor IA Exclusivo</h4>
              <p className="text-slate-400 font-sans leading-relaxed text-sm">
                Nunca mais fique com dúvidas! Cada curso possui um Tutor de Inteligência Artificial disponível 24 horas por dia, 7 dias por semana. Ele responde suas perguntas na hora, explica conceitos complexos e ajuda você a destravar em qualquer assunto.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* STUDY FORMATS SECTION */}
      <section id="gestao" className="py-24 bg-white relative z-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-display font-bold text-slate-800 tracking-tight mb-4">
              Gestão de Estudo: Tudo o que Você Precisa em um Só Lugar
            </h3>
            <p className="text-slate-500 font-sans max-w-5xl mx-auto text-base leading-relaxed">
              Cada matéria foi desenhada para atender a todos os perfis de aprendizagem. Você escolhe como prefere consumir o conteúdo:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { icon: MonitorPlay, title: "Aulas em Vídeo", desc: "Explicações claras com os melhores professores." },
              { icon: Headphones, title: "Áudios", desc: "Estude no trânsito, na academia ou onde quiser." },
              { icon: FileText, title: "PDFs e Resumos", desc: "Material escrito completo e direto ao ponto para leitura e revisão rápida." },
              { icon: Tv, title: "Slides das Aulas", desc: "Acompanhe o raciocínio do professor passo a passo." },
              { icon: Library, title: "Cards (Flashcards)", desc: "Memorize conceitos e leis com o método de repetição espaçada." },
            ].map((item, idx) => (
              <div key={idx} className="glass-panel p-6 rounded-2xl border border-slate-100 flex flex-col items-center text-center bg-slate-50/30 hover:-translate-y-2 transition-transform">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">{item.title}</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed font-sans">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRACTICE SECTION */}
      <section id="treino" className="py-24 bg-slate-50 relative z-20 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 space-y-6">
              <div className="inline-flex items-center space-x-1.5 bg-cyan-50 border border-cyan-100 rounded-full px-3 py-1 text-[10px] font-mono font-bold text-cyan-700 uppercase">
                <Target className="w-3.5 h-3.5" />
                <span>Simuladores e Questões</span>
              </div>
              <h3 className="text-3xl md:text-4xl font-display font-bold text-slate-800 tracking-tight text-justify">
                Prática Levada a Sério: Treino Difícil, Jogo Fácil
              </h3>
              <p className="text-slate-600 font-sans text-base leading-relaxed text-justify">
                A teoria é fundamental, mas é a prática que garante o resultado. Nosso sistema de questões é robusto e feito para testar seus limites:
              </p>
              <blockquote className="border-l-4 border-indigo-500 pl-4 italic text-slate-500 my-4 text-sm font-sans text-justify">
                "O segredo da aprovação está na resolução de questões e na familiaridade com a prova."
              </blockquote>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-800 text-sm font-sans block mb-1">Banco de Questões</strong>
                    <span className="text-xs text-slate-500 font-sans leading-relaxed text-justify block">Filtre questões por matéria, assunto e nível de dificuldade.</span>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-800 text-sm font-sans block mb-1">Simulados Inéditos</strong>
                    <span className="text-xs text-slate-500 font-sans leading-relaxed text-justify block">Teste seus conhecimentos em um ambiente que simula o dia real do exame, com controle de tempo.</span>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-800 text-sm font-sans block mb-1">Provas Anteriores</strong>
                    <span className="text-xs text-slate-500 font-sans leading-relaxed text-justify block">Acesse o acervo completo das provas passadas para entender o padrão da banca examinadora.</span>
                  </div>
                </li>
              </ul>
            </div>
            
            <div className="lg:w-1/2 w-full">
              <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl" />
                <div className="relative z-10 flex flex-col items-center justify-center space-y-6">
                  <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
                    <Award className="w-10 h-10" />
                  </div>
                  <div className="text-center">
                    <h4 className="text-lg font-bold text-slate-800">Pronto para o Desafio?</h4>
                    <p className="text-xs text-slate-500 mt-2 font-sans">Simule as condições reais do seu concurso agora mesmo.</p>
                  </div>
                  <button onClick={() => setShowMockTest(true)} className="w-full py-3.5 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/30 text-white rounded-xl font-sans font-black uppercase tracking-widest text-xs transition-all border-none flex items-center justify-center active:scale-[0.98]">
                    Iniciar Simulado
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMPARISON TABLE */}
      <section id="porque" className="py-24 bg-white relative z-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-display font-bold text-slate-800 tracking-tight">
              Por Que Escolher o Cabo Véio?
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr>
                  <th className="p-4 border-b-2 border-slate-200 font-bold text-slate-800 text-sm uppercase tracking-wider">Funcionalidade</th>
                  <th className="p-4 border-b-2 border-slate-200 font-bold text-slate-500 text-sm uppercase tracking-wider text-center bg-slate-50">Plataformas Comuns</th>
                  <th className="p-4 border-b-2 border-indigo-500 font-bold text-indigo-700 text-sm uppercase tracking-wider text-center bg-indigo-50 rounded-t-xl">Cabo Véio</th>
                </tr>
              </thead>
              <tbody className="text-sm font-sans">
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-4 font-semibold text-slate-700">Painel de Desempenho e Tendências</td>
                  <td className="p-4 text-center text-slate-500 bg-slate-50/50">Básico / Inexistente</td>
                  <td className="p-4 text-center font-bold text-indigo-700 bg-indigo-50/30">Completo e Analítico</td>
                </tr>
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-4 font-semibold text-slate-700">Trilhas Inteligentes</td>
                  <td className="p-4 text-center text-slate-500 bg-slate-50/50">Não</td>
                  <td className="p-4 text-center font-bold text-indigo-700 bg-indigo-50/30">Sim</td>
                </tr>
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-4 font-semibold text-slate-700">Tutor de Inteligência Artificial</td>
                  <td className="p-4 text-center text-slate-500 bg-slate-50/50">Não</td>
                  <td className="p-4 text-center font-bold text-indigo-700 bg-indigo-50/30">Sim (Em todos os cursos)</td>
                </tr>
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-4 font-semibold text-slate-700">Flashcards (Cards) Integrados</td>
                  <td className="p-4 text-center text-slate-500 bg-slate-50/50">Não</td>
                  <td className="p-4 text-center font-bold text-indigo-700 bg-indigo-50/30">Sim</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-4 font-semibold text-slate-700 rounded-bl-xl">Múltiplos Formatos (Áudio, Vídeo, PDF)</td>
                  <td className="p-4 text-center text-slate-500 bg-slate-50/50">Apenas Vídeo e PDF</td>
                  <td className="p-4 text-center font-bold text-indigo-700 bg-indigo-50/30 rounded-br-xl">Sim (Para todos os perfis)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contato" className="py-24 bg-slate-50 relative z-20 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-display font-bold text-slate-800 tracking-tight mb-4">
              Fale com a Nossa Equipe
            </h3>
            <p className="text-slate-500 font-sans max-w-5xl mx-auto text-base leading-relaxed">
              Ficou com alguma dúvida ou precisa de suporte? Nossa equipe está pronta para ajudar você a alcançar sua aprovação.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {/* WhatsApp */}
            <a href={`https://wa.me/55${adminPhone.replace(/\D/g, '')}?text=Ol%C3%A1!%20Vim%20pelo%20site%20e%20gostaria%20de%20tirar%20uma%20d%C3%BAvida.`} target="_blank" rel="noopener noreferrer" className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:-translate-y-2 hover:shadow-lg transition-all flex flex-col items-center text-center group cursor-pointer no-underline">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                <Phone className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-slate-800 text-lg uppercase mb-2">WhatsApp</h4>
              <p className="text-slate-500 text-sm font-sans">
                {adminPhone}
              </p>
            </a>

            {/* E-mail */}
            <button onClick={() => {
              if (showEmailForm) {
                setShowEmailForm(false);
              } else {
                setShowEmailForm(true);
                setShowContactForm(false);
                setTimeout(() => { document.getElementById('email-form')?.scrollIntoView({behavior: 'smooth'}) }, 100); 
              }
            }} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:-translate-y-2 hover:shadow-lg transition-all flex flex-col items-center text-center group cursor-pointer border-none outline-none">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:-rotate-3 transition-transform">
                <Mail className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-slate-800 text-lg uppercase mb-2">E-mail</h4>
              <p className="text-slate-500 text-sm font-sans">
                {adminEmail}
              </p>
            </button>

            {/* Mensagem Direta */}
            <button onClick={() => { 
              if (showContactForm) {
                setShowContactForm(false);
              } else {
                setShowContactForm(true); 
                setShowEmailForm(false);
                setTimeout(() => { document.getElementById('mensagem-direta-form')?.scrollIntoView({behavior: 'smooth'}) }, 100); 
              }
            }} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:-translate-y-2 hover:shadow-lg transition-all flex flex-col items-center text-center group cursor-pointer border-none outline-none">
              <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <MessageCircle className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-slate-800 text-lg uppercase mb-2">Mensagem</h4>
              <p className="text-slate-500 text-sm font-sans">
                Fale conosco por aqui
              </p>
            </button>
          </div>

          {showContactForm && (
            <div id="mensagem-direta-form" className="w-full mx-auto bg-white p-8 md:p-10 rounded-3xl border border-slate-200 shadow-xl relative overflow-hidden animate-smooth-fade">
              <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-50 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-50 rounded-full blur-3xl" />
              
              <h4 className="font-bold text-slate-800 text-xl mb-6 relative z-10 text-center">Envie uma Mensagem Direta</h4>
              <form onSubmit={handleContactSubmit} className="space-y-5 relative z-10">
                <div>
                  <label className="block text-[11px] font-sans font-bold text-slate-600 uppercase tracking-wider mb-2">Seu Nome / Posto</label>
                  <input type="text" required value={contactName} onChange={e => setContactName(e.target.value)} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-sans text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-colors" placeholder="Ex: Cb Silva" />
                </div>
                <div>
                  <label className="block text-[11px] font-sans font-bold text-slate-600 uppercase tracking-wider mb-2">E-mail ou Telefone</label>
                  <input type="text" required value={contactEmail} onChange={e => setContactEmail(e.target.value)} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-sans text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-colors" placeholder="Para podermos responder..." />
                </div>
                <div>
                  <label className="block text-[11px] font-sans font-bold text-slate-600 uppercase tracking-wider mb-2">Sua Dúvida ou Mensagem</label>
                  <textarea required value={contactMessage} onChange={e => setContactMessage(e.target.value)} rows={4} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-sans text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-colors resize-none" placeholder="Como podemos te ajudar na sua aprovação?"></textarea>
                </div>
                <button type="submit" disabled={isSendingContact} className="w-full py-4 bg-indigo-600 hover:bg-indigo-800 text-white rounded-xl font-sans font-bold text-sm uppercase tracking-wider transition-all cursor-pointer border-none shadow-lg shadow-indigo-600/30 disabled:opacity-70 disabled:cursor-not-allowed mt-2">
                  {isSendingContact ? "Enviando..." : "Enviar Mensagem"}
                </button>
              </form>
            </div>
          )}

          {showEmailForm && (
            <div id="email-form" className="w-full mx-auto bg-white p-8 md:p-10 rounded-3xl border border-slate-200 shadow-xl relative overflow-hidden animate-smooth-fade">
              <div className="absolute top-0 left-0 w-48 h-48 bg-blue-50 rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-0 w-48 h-48 bg-indigo-50 rounded-full blur-3xl" />
              
              <h4 className="font-bold text-slate-800 text-xl mb-6 relative z-10 text-center">Escrever E-mail</h4>
              <p className="text-slate-500 text-sm text-center mb-6 relative z-10 max-w-2xl mx-auto">
                Preencha os campos abaixo. Ao clicar em enviar, o seu aplicativo de e-mail padrão será aberto com a mensagem pronta para envio.
              </p>
              <form onSubmit={handleEmailFormSubmit} className="space-y-5 relative z-10">
                <div>
                  <label className="block text-[11px] font-sans font-bold text-slate-600 uppercase tracking-wider mb-2">Seu Nome / Posto</label>
                  <input type="text" required value={contactName} onChange={e => setContactName(e.target.value)} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-sans text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-colors" placeholder="Ex: Cb Silva" />
                </div>
                <div>
                  <label className="block text-[11px] font-sans font-bold text-slate-600 uppercase tracking-wider mb-2">Mensagem</label>
                  <textarea required value={contactMessage} onChange={e => setContactMessage(e.target.value)} rows={5} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-sans text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-colors resize-none" placeholder="O que você gostaria de nos dizer?"></textarea>
                </div>
                <button type="submit" className="w-full py-4 bg-blue-600 hover:bg-blue-800 text-white rounded-xl font-sans font-bold text-sm uppercase tracking-wider transition-all cursor-pointer border-none shadow-lg shadow-blue-600/30 mt-2">
                  Abrir no Aplicativo de E-mail
                </button>
              </form>
            </div>
          )}
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="py-24 bg-gradient-to-b from-indigo-900 to-slate-900 relative z-20 text-center">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight mb-6">
            Pronto para mudar sua forma de estudar?
          </h2>
          <p className="text-lg text-indigo-200 font-sans mb-10 max-w-2xl mx-auto">
            Junte-se aos alunos que já estão estudando com alta performance, foco e tecnologia de ponta.
          </p>
          <button 
            onClick={() => onNavigateToLogin()}
            className="px-8 py-5 bg-white text-indigo-900 hover:bg-slate-100 rounded-xl text-sm font-sans font-black uppercase tracking-wider transition-all shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:shadow-[0_0_40px_rgba(255,255,255,0.5)] flex items-center justify-center mx-auto space-x-3 active:scale-95 cursor-pointer border-none"
          >
            <span>Criar Minha Conta e Testar a Plataforma</span>
            <ArrowRight className="w-5 h-5 text-indigo-600" />
          </button>
        </div>
      </section>

      {/* Email Collection Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-smooth-fade">
          <div className="bg-white border border-slate-100 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-smooth-zoom p-6 space-y-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[9px] font-mono font-black text-indigo-500 uppercase tracking-widest block">Inscrição Rápida</span>
                <h3 className="text-lg font-sans font-black text-slate-850">
                  Matricular-se no curso
                </h3>
              </div>
              <button 
                onClick={() => {
                  setSelectedCourse(null);
                  setBuyerEmail("");
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-500 p-2 rounded-full border-none cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h4 className="text-xs font-sans font-bold text-slate-700">{selectedCourse.title}</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-sans">
              Para prosseguir ao pagamento e liberar seu acesso de aluno, insira o seu e-mail abaixo.
            </p>

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-[10px] font-sans font-bold text-slate-600 uppercase tracking-wider">E-mail do Aluno</label>
                <input 
                  type="email" 
                  required
                  placeholder="exemplo@gmail.com"
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-sans text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-800 text-white rounded-xl font-sans font-bold text-xs uppercase tracking-wider transition-all cursor-pointer border-none flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white text-white"></div>
                    <span>Processando checkout...</span>
                  </>
                ) : (
                  <>
                    <span>Ir para o Pagamento Seguro</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="w-full bg-slate-900 border-t border-slate-800 py-12 mt-auto relative z-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
          <div className="flex items-center space-x-3 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <ShieldAlert className="w-6 h-6 text-white" />
            <div>
              <h1 className="text-sm font-display font-bold text-white tracking-tight">
                Cabo Véio
              </h1>
              <p className="text-[8px] text-slate-400 font-mono tracking-wider uppercase">
                Doutrina e Bizus de Caserna
              </p>
            </div>
          </div>
          
          <div className="flex space-x-6">
            <a href="#" className="text-xs font-sans text-slate-400 hover:text-white transition-colors">Termos de Uso</a>
            <a href="#" className="text-xs font-sans text-slate-400 hover:text-white transition-colors">Privacidade</a>
            <a href="#" className="text-xs font-sans text-slate-400 hover:text-white transition-colors">Fale Conosco</a>
          </div>
          
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
            © 2024 Cabo Véio. Todos os direitos reservados.
          </div>
        </div>
      </footer>

      {/* FLOATING WHATSAPP BUTTON */}
      <a 
        href={`https://wa.me/55${adminPhone.replace(/\D/g, '')}?text=Ol%C3%A1!%20Vim%20pelo%20site%20e%20gostaria%20de%20tirar%20uma%20d%C3%BAvida.`} 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/40 hover:shadow-green-500/60 transition-all hover:scale-110 active:scale-95 group animate-smooth-fade"
        title="Fale conosco no WhatsApp"
      >
        <MessageCircle className="w-7 h-7 text-white" />
        {/* Ping Animation */}
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-white"></span>
        </span>
      </a>

      {showMockTest && (
        <MockSimulado 
          onClose={() => setShowMockTest(false)} 
          onNavigateToLogin={onNavigateToLogin} 
        />
      )}
    </div>
  );
}
