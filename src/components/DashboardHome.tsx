import { Clock, CheckCircle, BarChart3, Bot, ChevronRight, Award, Zap } from "lucide-react";

interface DashboardHomeProps {
  onChangeTab: (tab: string) => void;
  onGenerateCustomSimulator: (subject: string) => void;
}

export default function DashboardHome({ onChangeTab, onGenerateCustomSimulator }: DashboardHomeProps) {
  const weeklyData = [
    { label: "Sem. 01", grade: 7.2 },
    { label: "Sem. 02", grade: 8.0 },
    { label: "Sem. 03", grade: 7.5 },
    { label: "Sem. 04", grade: 8.8 },
    { label: "Sem. 05", grade: 8.4 },
    { label: "Sem. 06", grade: 9.2, highlighted: true }
  ];

  return (
    <div className="space-y-6" id="dashboard-home-view">
      {/* Welcome Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div>
          <div className="flex items-center space-x-2.5 mb-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
            </span>
            <span className="text-[10px] font-mono uppercase tracking-wider text-white font-bold bg-white/10 border border-white/20 px-2.5 py-0.5 rounded-full">
              Missão em andamento
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-white tracking-tight">
            Bem-vindo de volta, <span className="text-amber-300">Silva</span>.
          </h2>
          <p className="text-sm text-indigo-200 mt-1 max-w-xl">
            Sua preparação para o <strong className="text-white">CHO CBMMG</strong> está em ritmo acelerado. Mantenha a disciplina tática.
          </p>
        </div>
        <button
          onClick={() => onChangeTab("cursos")}
          className="px-5 py-2.5 bg-white hover:bg-slate-50 text-indigo-950 rounded-lg text-xs font-sans font-bold uppercase transition-colors flex items-center space-x-2 active:scale-95 cursor-pointer shadow-sm border-none"
        >
          <span>Ir para Meus Cursos</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Bento Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Progresso do Curso */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:border-slate-300 transition-all">
          <div>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-sm font-display font-bold uppercase tracking-wider text-slate-800">
                Progresso do Curso - CHO CBMMG
              </h3>
              <span className="text-2xl font-display font-extrabold text-indigo-600">75%</span>
            </div>
            
            {/* Custom Progress Bar */}
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-6">
              <div className="h-full bg-indigo-600 rounded-full" style={{ width: "75%" }}></div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-5">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 text-slate-500 mb-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[10px] font-mono uppercase">Estudado</span>
                </div>
                <p className="text-lg font-sans font-bold text-slate-800">124h</p>
              </div>
              <div className="text-center border-x border-slate-100 px-2">
                <div className="flex items-center justify-center space-x-1 text-slate-500 mb-1">
                  <CheckCircle className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[10px] font-mono uppercase">Questões</span>
                </div>
                <p className="text-lg font-sans font-bold text-slate-800">2.480</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 text-amber-700 mb-1">
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-[10px] font-mono uppercase font-bold">Acertos</span>
                </div>
                <p className="text-lg font-sans font-bold text-amber-600 bg-amber-50 rounded px-1.5 py-0.5 inline-block">82%</p>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <button
              onClick={() => onChangeTab("cursos")}
              className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-sans text-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              Ver Grade Curricular Completa
            </button>
          </div>
        </div>

        {/* Card 2: Continue Estudando */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:border-slate-300 transition-all">
          <div>
            <h3 className="text-sm font-display font-bold uppercase tracking-wider text-slate-800 mb-3">
              Continue Estudando
            </h3>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mb-4">
              <span className="text-[10px] font-mono text-amber-700 bg-amber-50 border border-amber-200/50 px-2 py-0.5 rounded uppercase tracking-wider">
                Módulo 04: Regulamento Disciplinar
              </span>
              <h4 className="text-sm font-sans font-bold text-slate-800 mt-2.5">
                CEDM e Normas de Conduta no CBMMG
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Próxima aula: <span className="text-slate-800 font-semibold">Regulamento Disciplinar em Detalhe - Deveres e Ética</span>
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <button
              id="retomar-estudos-btn"
              onClick={() => onChangeTab("aulas")}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white border border-transparent text-xs font-sans font-bold uppercase rounded-lg transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-sm"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>RETOMAR ESTUDOS</span>
            </button>
          </div>
        </div>

        {/* Card 3: Evolução de Desempenho (Bespoke Chart) */}
        <div className="glass-panel rounded-2xl p-6 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h3 className="text-sm font-display font-bold uppercase tracking-wider text-slate-800">
                Evolução de Desempenho
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">Notas nos simulados semanais</p>
            </div>
            <div className="flex bg-slate-100 rounded-lg p-0.5 border border-slate-200">
              <button className="px-2.5 py-1 text-[9px] font-mono bg-white text-indigo-600 rounded-md font-bold uppercase shadow-sm">
                Mensal
              </button>
              <button className="px-2.5 py-1 text-[9px] font-mono text-slate-500 rounded-md uppercase hover:text-slate-800 transition-colors">
                Semestral
              </button>
            </div>
          </div>

          {/* Styled Bars */}
          <div className="flex items-end justify-between h-40 pt-4 px-2 bg-slate-50 rounded-xl border border-slate-100 relative">
            {/* Grid background lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none py-2 px-1 text-[8px] font-mono text-slate-300">
              <div className="border-b border-slate-200/50 w-full text-right pr-1">10.0</div>
              <div className="border-b border-slate-200/50 w-full text-right pr-1">7.5</div>
              <div className="border-b border-slate-200/50 w-full text-right pr-1">5.0</div>
              <div className="border-b border-slate-200/50 w-full text-right pr-1">2.5</div>
            </div>

            {weeklyData.map((d, index) => {
              const heightPercent = `${(d.grade / 10) * 100}%`;
              return (
                <div key={index} className="flex flex-col items-center w-12 z-10 group relative">
                  {/* Tooltip on hover */}
                  <div className="absolute top-[-30px] bg-slate-900 text-amber-400 text-[10px] font-mono py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-sm">
                    Nota {d.grade}
                  </div>
                  
                  {/* Bar */}
                  <div className="w-5 rounded-t-sm transition-all duration-300 relative overflow-hidden" style={{ height: heightPercent }}>
                    <div className={`absolute inset-0 ${
                      d.highlighted 
                        ? "bg-gradient-to-t from-amber-400 to-amber-500 shadow-sm" 
                        : "bg-gradient-to-t from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700"
                    }`} />
                  </div>
                  {/* Label */}
                  <span className="text-[9px] font-mono mt-2 text-slate-400 uppercase">{d.label}</span>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center mt-4 text-[11px] font-mono">
            <span className="text-slate-500">Último Simulado (Semana 06):</span>
            <span className="text-indigo-600 font-bold uppercase">Nota 9.2 (Excelente)</span>
          </div>
        </div>

        {/* Card 4: Insight do Tutor IA */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:border-slate-300 transition-all relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
          <div>
            <div className="flex items-center space-x-2 text-indigo-600 mb-3">
              <Bot className="w-5 h-5" />
              <h3 className="text-sm font-display font-bold uppercase tracking-wider">
                Insight do Tutor IA
              </h3>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-xs text-slate-600 leading-relaxed italic relative">
              <span className="absolute top-1 left-2 text-3xl text-slate-200 select-none">“</span>
              <p className="pl-4 relative z-10">
                Silva, notei que você errou 3 questões de <span className="text-slate-800 font-semibold not-italic">Direito Administrativo sobre Atos Administrativos</span>. Que tal fazermos um micro-simulado tático e adaptativo focado nesse tema hoje para mitigar essa falha?
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-5">
            <button
              onClick={() => onGenerateCustomSimulator("Atos Administrativos")}
              className="py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-sans font-bold uppercase transition-colors flex items-center justify-center space-x-1 cursor-pointer shadow-sm border-none"
            >
              <span>ACEITAR SUGESTÃO</span>
            </button>
            <button
              onClick={() => alert("Insight arquivado. Continuaremos com o cronograma previsto.")}
              className="py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-sans text-slate-500 hover:text-slate-700 rounded-lg transition-colors cursor-pointer uppercase"
            >
              AGENDAR PARA DEPOIS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
