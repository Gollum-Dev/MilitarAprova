import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ShieldAlert, Award, ArrowLeft } from "lucide-react";

interface LoginScreenProps {
  onLoginSuccess: (name: string, role: "aluno" | "admin") => void;
  onBackToLanding?: () => void;
}

export default function LoginScreen({ onLoginSuccess, onBackToLanding }: LoginScreenProps) {
  const [email, setEmail] = useState("seu@email.com");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const role = email.toLowerCase().includes("admin") ? "admin" : "aluno";
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess(email.split("@")[0] || "Silva", role);
    }, 800);
  };

  return (
    <div className="min-h-screen flex w-full bg-[var(--bg)] overflow-hidden animate-smooth-fade relative" id="login-container">
      {/* Botão Voltar */}
      {onBackToLanding && (
        <button 
          onClick={onBackToLanding}
          className="absolute top-6 left-6 z-50 flex items-center space-x-2 px-4 py-2 bg-slate-900/40 hover:bg-slate-900/60 backdrop-blur-md text-white rounded-full text-xs font-sans font-bold uppercase tracking-wider transition-all shadow-lg border border-white/10 lg:bg-white/10 lg:hover:bg-white/20 lg:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Início</span>
        </button>
      )}

      {/* Left side Image (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[55%] relative bg-emerald-950 items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-emerald-900/60 mix-blend-multiply z-10" />
        <img 
          src="/login-bg-premium.png" 
          alt="Cabo Véio Tactical Background" 
          className="absolute inset-0 w-full h-full object-cover z-0 opacity-90"
        />
        {/* Decorative elements over image */}
        <div className="relative z-20 text-center px-12 mt-[-10%]">
           <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-800 border border-amber-400/20 flex items-center justify-center shadow-2xl mb-8">
             <div className="relative">
               <ShieldAlert className="w-12 h-12 text-white" />
               <div className="absolute inset-0 flex items-center justify-center opacity-40">
                 <Award className="w-6 h-6 text-white" />
               </div>
             </div>
           </div>
           <h2 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight mb-6 drop-shadow-lg">
             A Doutrina que Aprova
           </h2>
           <p className="text-emerald-100/90 text-lg md:text-xl font-sans max-w-xl mx-auto drop-shadow-md leading-relaxed">
             A plataforma tática definitiva para a sua aprovação.
           </p>
        </div>
      </div>

      {/* Right side Login Form */}
      <div className="w-full lg:w-[45%] flex flex-col justify-between p-6 md:p-12 relative overflow-y-auto">
        {/* Background radial glow specific to right side */}
        <div className="absolute top-[-10%] right-[-20%] w-[500px] h-[500px] rounded-full bg-indigo-500/5 blur-[100px] pointer-events-none" />

        {/* Header / Logo (Visible mostly on mobile, but kept small on desktop) */}
        <div className="w-full flex justify-center pt-4 lg:hidden z-10">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-800 border border-amber-400/20 flex items-center justify-center shadow-sm">
              <div className="relative">
                <ShieldAlert className="w-9 h-9 text-white" />
                <div className="absolute inset-0 flex items-center justify-center opacity-40">
                  <Award className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-800 tracking-tight">
              Cabo Véio
            </h1>
            <p className="text-xs md:text-sm text-slate-500 font-mono tracking-wider uppercase">
              Doutrina e Bizus de Caserna
            </p>
          </div>
        </div>

        {/* Main Login Card */}
        <div className="w-full max-w-md mx-auto my-auto glass-panel rounded-2xl p-6 md:p-8 shadow-md z-10 animate-smooth-zoom" id="login-card">
          <div className="hidden lg:block mb-6 text-center">
             <h1 className="text-2xl font-display font-bold text-slate-800 tracking-tight">
              Acesso Restrito
             </h1>
             <p className="text-xs text-slate-500 font-mono tracking-wider uppercase mt-1">
              Identifique-se para prosseguir
             </p>
          </div>
          
          <h2 className="text-lg font-display font-bold text-slate-800 text-center mb-6 border-b border-slate-100 pb-3 uppercase tracking-wider lg:hidden">
            Acesso à Central de Comando
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email input */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-slate-600">
                Identificação (Email)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-emerald-700/70" />
                </div>
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700 transition-all"
                />
              </div>
            </div>

            {/* Password input */}
            <div className="flex flex-col space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-mono uppercase tracking-wider text-slate-600">
                  Código de Acesso (Senha)
                </label>
                <button
                  type="button"
                  className="text-xs font-sans text-slate-500 hover:text-emerald-700 transition-colors cursor-pointer"
                  onClick={() => alert("Função para redefinir senha em ambiente de desenvolvimento. Utilize seu código militar cadastrado.")}
                >
                  ESQUECI MINHA SENHA
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-emerald-700/70" />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-emerald-700 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              id="login-submit"
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-700/50 text-white font-sans font-bold text-sm uppercase rounded-lg shadow-sm transition-all cursor-pointer flex items-center justify-center space-x-2 border border-transparent active:scale-[0.98]"
            >
              {isLoading ? (
                <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <span>ENTRAR EM MISSÃO</span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center justify-between">
            <span className="w-1/5 border-b border-slate-200"></span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">OU ACESSE COM</span>
            <span className="w-1/5 border-b border-slate-200"></span>
          </div>

          {/* Google Login button */}
          <button
            id="google-login"
            type="button"
            onClick={() => onLoginSuccess("Silva")}
            className="w-full py-2.5 px-4 bg-white/80 border border-slate-200 hover:bg-white text-slate-600 hover:text-slate-800 rounded-lg text-sm font-sans flex items-center justify-center space-x-3 transition-colors cursor-pointer shadow-sm backdrop-blur-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.87-2.6-3.3-4.53-6.16-4.53z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Acessar via Conta do Google</span>
          </button>

          {/* Bottom register link */}
          <div className="mt-6 text-center text-sm">
            <p className="text-slate-500">
              Ainda não possui conta?{" "}
              <button
                onClick={() => alert("O cadastro militar de novos usuários é restrito ou exige credencial homologada pela Escola de Formação.")}
                className="text-emerald-700 hover:underline font-sans font-semibold transition-all cursor-pointer"
              >
                Criar conta
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="w-full text-center py-4 text-xs font-sans text-slate-500 border-t border-slate-200/80 z-10 mt-auto">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0 max-w-6xl mx-auto px-4">
            <span>© 2024 Cabo Véio. Todos os direitos reservados.</span>
            <div className="flex space-x-4">
              <button className="hover:text-slate-800 uppercase transition-colors cursor-pointer border-none bg-transparent">Termos</button>
              <button className="hover:text-slate-800 uppercase transition-colors cursor-pointer border-none bg-transparent">Privacidade</button>
              <button className="hover:text-slate-800 uppercase transition-colors cursor-pointer border-none bg-transparent">Contato</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
