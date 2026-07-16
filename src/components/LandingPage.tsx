import React, { useState, useEffect } from "react";
import { 
  ShieldAlert, Award, ArrowRight, Target, Tv, BookOpen, 
  ChevronRight, CheckCircle, X, Sparkles 
} from "lucide-react";
import { fetchCourses } from "../lib/api";
import { Course } from "../data";

interface LandingPageProps {
  onNavigateToLogin: (courseId?: string) => void;
}

export default function LandingPage({ onNavigateToLogin }: LandingPageProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [buyerEmail, setBuyerEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  }, []);

  const handleBuyClick = (course: Course) => {
    onNavigateToLogin(course.id);
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
      {/* HEADER (Topbar) */}
      <header className="w-full fixed top-0 left-0 z-50 glass-panel border-b border-white/10 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-800 border border-amber-400/20 flex items-center justify-center shadow-sm">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-slate-800 tracking-tight">
                Cabo Véio
              </h1>
              <p className="text-[10px] text-slate-500 font-mono tracking-wider uppercase">
                Doutrina e Bizus de Caserna
              </p>
            </div>
          </div>

          {/* Navigation (Desktop) */}
          <nav className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => scrollToSection("cursos")} 
              className="text-sm font-sans font-semibold text-slate-600 hover:text-emerald-700 transition-colors border-none bg-transparent cursor-pointer"
            >
              Nossos Cursos
            </button>
            <button 
              onClick={() => scrollToSection("recursos")} 
              className="text-sm font-sans font-semibold text-slate-600 hover:text-emerald-700 transition-colors border-none bg-transparent cursor-pointer"
            >
              Recursos Táticos
            </button>
          </nav>

          {/* Login Button */}
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => onNavigateToLogin()}
              className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-sm font-sans font-bold uppercase tracking-wide transition-all shadow-md flex items-center space-x-2 active:scale-95 cursor-pointer border-none"
            >
              <span>Entrar no Sistema</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative w-full pt-32 pb-20 md:pt-40 md:pb-32 flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-emerald-950 z-0">
          <div className="absolute inset-0 bg-emerald-900/60 mix-blend-multiply z-10" />
          <img 
            src="/login-bg-premium.png" 
            alt="Cabo Véio Tactical Background" 
            className="absolute inset-0 w-full h-full object-cover z-0 opacity-85"
          />
        </div>
        
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-700/20 rounded-full blur-[120px] pointer-events-none z-10" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none z-10" />

        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-20 flex flex-col items-center text-center">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-6 animate-smooth-fade">
            <Award className="w-4 h-4 text-amber-400" />
            <span className="text-[10px] font-mono text-white uppercase tracking-widest font-bold">Líder em Doutrina e Bizus CHO e CFS CBMMG</span>
          </div>

          <h2 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-white tracking-tight leading-tight mb-6 drop-shadow-2xl max-w-4xl">
            A experiência do <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">Cabo Véio</span> para o seu sucesso
          </h2>

          <p className="text-lg md:text-xl font-sans max-w-2xl mx-auto mb-10 drop-shadow-md leading-relaxed text-slate-100">
            O ambiente definitivo com bizus do Cabo Véio, vídeo aulas, áudio aulas e uma grande quantidade de questões focadas nas carreiras militares estaduais.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center w-full space-y-4 sm:space-y-0 sm:space-x-6">
            <button 
              onClick={() => onNavigateToLogin()}
              className="w-full sm:w-[280px] px-4 py-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-sans font-bold uppercase tracking-wider transition-all shadow-lg shadow-emerald-900/50 flex items-center justify-center space-x-2 hover:scale-105 active:scale-95 cursor-pointer border-none"
            >
              <span>Marcha para a Vitória</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button 
              onClick={() => scrollToSection("cursos")} 
              className="w-full sm:w-[280px] px-4 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-sm font-sans font-bold uppercase tracking-wider backdrop-blur-md transition-all flex items-center justify-center hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>Conhecer os Cursos</span>
            </button>
          </div>
        </div>
      </section>

      {/* CATALOGUE SECTION */}
      <section id="cursos" className="py-20 bg-white relative z-20 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-1.5 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1 text-[10px] font-mono font-bold text-emerald-700 uppercase mb-3">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>Nossos Cursos Disponíveis</span>
            </div>
            <h3 className="text-3xl md:text-4xl font-display font-bold text-slate-800 tracking-tight mb-4">
              Matricule-se e Inicie Seus Estudos
            </h3>
            <p className="text-slate-500 font-sans max-w-2xl mx-auto text-base">
              Acesso completo a vídeo-aulas, materiais didáticos em PDF, questões comentadas e simuladores com IA.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-700"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {courses.map((course) => (
                <div 
                  key={course.id} 
                  className="bg-slate-50/70 border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                >
                  {/* Cover */}
                  <div className="relative aspect-video w-full bg-slate-200 overflow-hidden">
                    {course.cover_url ? (
                      <img src={course.cover_url} alt={course.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-emerald-800 to-emerald-950 text-white p-6 text-center">
                        <ShieldAlert className="w-10 h-10 text-emerald-400 mb-2" />
                        <span className="font-sans font-black text-xs uppercase tracking-wider">{course.title}</span>
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-emerald-700 text-white text-[10px] font-mono font-bold px-3 py-1 rounded-full shadow-sm">
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
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>Aulas em Áudio e Vídeo ilimitadas</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>Resumos & Simulados com IA</span>
                        </li>
                      </ul>
                    </div>

                    {/* Buy Button */}
                    <button 
                      onClick={() => handleBuyClick(course)}
                      className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-sans font-bold uppercase tracking-wider transition-all cursor-pointer border-none flex items-center justify-center space-x-1.5 shadow-sm active:scale-98"
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

      {/* CATEGORIES SECTION (Like Qbizu) */}
      <section id="recursos" className="py-20 relative bg-slate-50 z-20 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-display font-bold text-slate-800 tracking-tight mb-4">
              A metodologia que mais aprova
            </h3>
            <p className="text-slate-500 font-sans max-w-2xl mx-auto text-lg">
              Nosso ecossistema de aprendizado foi desenhado para maximizar sua retenção e preparar você para o cenário real da prova.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Questões */}
            <div className="glass-panel rounded-2xl p-8 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border border-slate-200/60 bg-white group cursor-pointer" onClick={() => onNavigateToLogin()}>
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors duration-300">
                <Target className="w-8 h-8 text-indigo-600 group-hover:text-white transition-colors" />
              </div>
              <h4 className="text-xl font-display font-bold text-slate-800 mb-3">Questões Focadas</h4>
              <p className="text-sm text-slate-600 leading-relaxed mb-6 font-sans">
                Treinamento intensivo com milhares de questões atualizadas e comentadas por IA, filtradas exclusivamente para concursos de oficiais e sargentos.
              </p>
              <div className="flex items-center text-indigo-600 font-bold text-xs uppercase tracking-wider group-hover:translate-x-2 transition-transform">
                <span>Resolver Agora</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </div>

            {/* Aulas */}
            <div className="glass-panel rounded-2xl p-8 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border border-slate-200/60 bg-white group cursor-pointer" onClick={() => onNavigateToLogin()}>
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors duration-300">
                <Tv className="w-8 h-8 text-indigo-600 group-hover:text-white transition-colors" />
              </div>
              <h4 className="text-xl font-display font-bold text-slate-800 mb-3">Vídeo e Áudio Aulas</h4>
              <p className="text-sm text-slate-600 leading-relaxed mb-6 font-sans">
                Aprenda a doutrina militar no seu ritmo. Estude de forma visual ou escute as áudio aulas durante o serviço, no trânsito ou na academia.
              </p>
              <div className="flex items-center text-indigo-600 font-bold text-xs uppercase tracking-wider group-hover:translate-x-2 transition-transform">
                <span>Assistir Aulas</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </div>

            {/* Livros */}
            <div className="glass-panel rounded-2xl p-8 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border border-slate-200/60 bg-white group cursor-pointer" onClick={() => onNavigateToLogin()}>
              <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mb-6 group-hover:bg-amber-500 transition-colors duration-300">
                <BookOpen className="w-8 h-8 text-amber-600 group-hover:text-white transition-colors" />
              </div>
              <h4 className="text-xl font-display font-bold text-slate-800 mb-3">Manuais e Livros (PDF)</h4>
              <p className="text-sm text-slate-600 leading-relaxed mb-6 font-sans">
                Os melhores materiais digitais. Resumos estruturados por IA e todo o MABOM e legislação compilados com navegação inteligente.
              </p>
              <div className="flex items-center text-amber-600 font-bold text-xs uppercase tracking-wider group-hover:translate-x-2 transition-transform">
                <span>Acessar Biblioteca</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Email Collection Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-smooth-fade">
          <div className="bg-white border border-slate-100 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-smooth-zoom p-6 space-y-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[9px] font-mono font-black text-emerald-600 uppercase tracking-widest block">Inscrição Rápida</span>
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
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-sans text-slate-700 outline-none focus:border-emerald-600 focus:bg-white transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-sans font-bold text-xs uppercase tracking-wider transition-all cursor-pointer border-none flex items-center justify-center space-x-2 disabled:opacity-50"
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
    </div>
  );
}
