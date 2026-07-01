import React from "react";
import { ShieldAlert, Award, ArrowRight, Target, Tv, BookOpen, ChevronRight, CheckCircle } from "lucide-react";

interface LandingPageProps {
  onNavigateToLogin: () => void;
}

export default function LandingPage({ onNavigateToLogin }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[var(--bg)] font-sans overflow-x-hidden animate-smooth-fade flex flex-col">
      {/* HEADER (Topbar) */}
      <header className="w-full fixed top-0 left-0 z-50 glass-panel border-b border-white/10 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-700 border border-amber-400/20 flex items-center justify-center shadow-sm">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-slate-800 tracking-tight">
                Militar Aprova <span className="text-indigo-600">IA</span>
              </h1>
              <p className="text-[10px] text-slate-500 font-mono tracking-wider uppercase">
                Doutrina e Inteligência
              </p>
            </div>
          </div>

          {/* Navigation (Desktop) */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#cursos" className="text-sm font-sans font-semibold text-slate-600 hover:text-indigo-600 transition-colors">Nossos Cursos</a>
            <a href="#recursos" className="text-sm font-sans font-semibold text-slate-600 hover:text-indigo-600 transition-colors">Recursos IA</a>
            <a href="#depoimentos" className="text-sm font-sans font-semibold text-slate-600 hover:text-indigo-600 transition-colors">Aprovados</a>
          </nav>

          {/* Login Button */}
          <div className="flex items-center space-x-4">
            <button 
              onClick={onNavigateToLogin}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-sans font-bold uppercase tracking-wide transition-all shadow-md flex items-center space-x-2 active:scale-95 cursor-pointer"
            >
              <span>Entrar no Sistema</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative w-full pt-32 pb-20 md:pt-40 md:pb-32 flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-indigo-950 z-0">
          <div className="absolute inset-0 bg-indigo-900/60 mix-blend-multiply z-10" />
          <img 
            src="/login-bg-premium.png" 
            alt="Militar Aprova IA Tactical Background" 
            className="absolute inset-0 w-full h-full object-cover z-0 opacity-80"
          />
        </div>
        
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none z-10" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none z-10" />

        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-20 flex flex-col items-center text-center">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-6 animate-smooth-fade">
            <Award className="w-4 h-4 text-amber-400" />
            <span className="text-[10px] font-mono text-white uppercase tracking-widest font-bold">Líder em Aprovações CHO e CFS CBMMG</span>
          </div>

          <h2 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-white tracking-tight leading-tight mb-6 drop-shadow-2xl max-w-4xl">
            A Plataforma Tática Definitiva para sua <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">Aprovação</span>
          </h2>

          <p className="text-lg md:text-xl text-indigo-100 font-sans max-w-2xl mx-auto mb-10 drop-shadow-md leading-relaxed">
            Ambiente completo com inteligência artificial, vídeo aulas, áudio aulas e o maior banco de questões focadas nas carreiras militares.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center w-full space-y-4 sm:space-y-0 sm:space-x-6">
            <button 
              onClick={onNavigateToLogin}
              className="w-full sm:w-[280px] px-4 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-sans font-bold uppercase tracking-wider transition-all shadow-lg shadow-indigo-600/50 flex items-center justify-center space-x-2 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>Matricule-se Agora</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="w-full sm:w-[280px] px-4 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-sm font-sans font-bold uppercase tracking-wider backdrop-blur-md transition-all flex items-center justify-center hover:scale-105 active:scale-95 cursor-pointer">
              <span>Conhecer os Cursos</span>
            </button>
          </div>
        </div>
      </section>

      {/* CATEGORIES SECTION (Like Qbizu) */}
      <section id="recursos" className="py-20 relative bg-slate-50 z-20">
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
            <div className="glass-panel rounded-2xl p-8 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border border-slate-200/60 bg-white group cursor-pointer">
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
            <div className="glass-panel rounded-2xl p-8 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border border-slate-200/60 bg-white group cursor-pointer">
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
            <div className="glass-panel rounded-2xl p-8 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border border-slate-200/60 bg-white group cursor-pointer">
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

      {/* FOOTER */}
      <footer className="w-full bg-slate-900 border-t border-slate-800 py-12 mt-auto relative z-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
          <div className="flex items-center space-x-3 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
            <ShieldAlert className="w-6 h-6 text-white" />
            <div>
              <h1 className="text-sm font-display font-bold text-white tracking-tight">
                Militar Aprova IA
              </h1>
              <p className="text-[8px] text-slate-400 font-mono tracking-wider uppercase">
                Pesquisa e Tecnologia Educacional
              </p>
            </div>
          </div>
          
          <div className="flex space-x-6">
            <a href="#" className="text-xs font-sans text-slate-400 hover:text-white transition-colors">Termos de Uso</a>
            <a href="#" className="text-xs font-sans text-slate-400 hover:text-white transition-colors">Privacidade</a>
            <a href="#" className="text-xs font-sans text-slate-400 hover:text-white transition-colors">Fale Conosco</a>
          </div>
          
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
            © 2024 Militar Aprova. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
