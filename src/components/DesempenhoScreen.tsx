import { useState } from "react";
import { 
  Trophy, Award, Clock, HelpCircle, CheckCircle2, ChevronRight, 
  Sparkles, Bot, Shield, Zap, Flame, Calendar, Crown, Compass, Swords 
} from "lucide-react";
import { Badge, BADGES } from "../data";

interface DesempenhoScreenProps {
  onStartRecoveryTraining: (subject: string) => void;
}

export default function DesempenhoScreen({ onStartRecoveryTraining }: DesempenhoScreenProps) {
  const [badges, setBadges] = useState<Badge[]>(BADGES);

  // Icon selector mapping helper
  const renderBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case "ShieldAlert": return <Shield className="w-5 h-5 text-amber-600" />;
      case "Flame": return <Flame className="w-5 h-5 text-orange-600" />;
      case "CalendarCheck": return <Calendar className="w-5 h-5 text-emerald-600" />;
      case "Award": return <Award className="w-5 h-5 text-indigo-600" />;
      case "Compass": return <Compass className="w-5 h-5 text-slate-400" />;
      case "Crown": return <Crown className="w-5 h-5 text-slate-400" />;
      default: return <Award className="w-5 h-5 text-indigo-600" />;
    }
  };

  return (
    <div className="space-y-6" id="desempenho-view-container">
      {/* Quartel General Section / Header stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Stat 1: Study hours */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center space-x-4 shadow-sm">
          <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-amber-600 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Horas de Estudo</span>
            <span className="text-xl font-sans font-black text-slate-800">248h</span>
          </div>
        </div>

        {/* Stat 2: Resolved questions */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center space-x-4 shadow-sm">
          <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-emerald-600 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Questões Resolvidas</span>
            <span className="text-xl font-sans font-black text-slate-800">4.120</span>
          </div>
        </div>

        {/* Stat 3: Precision */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center space-x-4 shadow-sm">
          <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-indigo-600 shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Precisão Geral</span>
            <span className="text-xl font-sans font-black text-indigo-600">82.4%</span>
          </div>
        </div>

        {/* Stat 4: Student Patent */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center space-x-4 shadow-sm">
          <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-purple-600 shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Patente Aluno</span>
            <span className="text-sm font-sans font-black text-slate-800 uppercase tracking-wide">Primeiro Tenente</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Honor Badges grid (Left & Center) */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-sans font-extrabold uppercase tracking-wider text-slate-800">
            Quartel General do Aluno: Conquistas de Honra
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className={`p-4 border rounded-xl flex items-start space-x-3.5 transition-all ${
                  badge.unlocked 
                    ? "bg-white border-slate-200 shadow-sm" 
                    : "bg-slate-50 border-slate-200/60 text-slate-400 opacity-70"
                }`}
              >
                <div className={`p-2.5 rounded-lg border shrink-0 ${
                  badge.unlocked 
                    ? "bg-slate-50 border-slate-200/60 shadow-[0_0_10px_rgba(79,70,229,0.05)]" 
                    : "bg-slate-100 border-slate-200"
                }`}>
                  {renderBadgeIcon(badge.icon)}
                </div>
                <div className="space-y-1 overflow-hidden">
                  <h4 className={`text-xs font-sans font-bold ${badge.unlocked ? "text-slate-800" : "text-slate-400"}`}>
                    {badge.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    {badge.description}
                  </p>
                  {badge.unlocked && badge.date && (
                    <span className="inline-block text-[9px] font-mono text-indigo-600 font-bold">
                      Conquistado em {badge.date}
                    </span>
                  )}
                  {!badge.unlocked && (
                    <span className="inline-block text-[9px] font-mono text-slate-400 uppercase tracking-wider">
                      Bloqueado
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI diagnostic column (Right) */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center space-x-2 text-indigo-600 mb-4 font-bold">
              <Bot className="w-5 h-5 shrink-0" />
              <h3 className="text-xs font-mono uppercase tracking-widest font-extrabold">Diagnóstico Tático da IA</h3>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-xs text-slate-700 leading-relaxed italic">
                “ Silva, você possui excelente retenção em Direito Constitucional, mas seu tempo médio de resposta em Direito Penal Militar está elevado e identificamos 4 lacunas graves sobre Crimes de Autoridade. Recomendo iniciarmos agora um treino adaptativo corretivo.”
              </div>

              <div className="space-y-2 border-t border-slate-100 pt-4 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-sans">Retenção Constitucional:</span>
                  <span className="font-mono text-emerald-600 font-bold">92%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-sans">Retenção Penal Militar:</span>
                  <span className="font-mono text-amber-600 font-bold">64%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-sans">Média Resposta:</span>
                  <span className="font-mono text-amber-600 font-bold">1m 45s (Lento)</span>
                </div>
              </div>

              <button
                id="recovery-training-btn"
                onClick={() => onStartRecoveryTraining("Direito Penal Militar")}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-sans font-bold uppercase transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm active:scale-95 border-none"
              >
                <Swords className="w-3.5 h-3.5" />
                <span>Treino de Recuperação</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
