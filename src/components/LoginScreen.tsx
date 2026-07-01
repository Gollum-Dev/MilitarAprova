import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ShieldAlert, Award } from "lucide-react";

interface LoginScreenProps {
  onLoginSuccess: (name: string) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [email, setEmail] = useState("seu@email.com");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess("Silva");
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between p-4 md:p-8 relative overflow-hidden animate-smooth-fade" id="login-container">
      {/* Background radial glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />

      {/* Header / Logo */}
      <div className="w-full flex justify-center pt-4 md:pt-8 z-10">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-700 border border-amber-400/20 flex items-center justify-center shadow-sm">
            <div className="relative">
              <ShieldAlert className="w-9 h-9 text-white" />
              <div className="absolute inset-0 flex items-center justify-center opacity-40">
                <Award className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-800 tracking-tight">
            Militar Aprova <span className="text-indigo-600">IA</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-500 font-mono tracking-wider uppercase">
            Doutrina e Inteligência Bombeiro Militar
          </p>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md mx-auto my-8 glass-panel rounded-2xl p-6 md:p-8 shadow-md z-10 animate-smooth-zoom" id="login-card">
        <h2 className="text-lg font-display font-bold text-slate-800 text-center mb-6 border-b border-slate-100 pb-3 uppercase tracking-wider">
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
                <Mail className="h-4 w-4 text-indigo-600/70" />
              </div>
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all"
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
                className="text-xs font-sans text-slate-500 hover:text-indigo-600 transition-colors"
                onClick={() => alert("Função para redefinir senha em ambiente de desenvolvimento. Utilize seu código militar cadastrado.")}
              >
                ESQUECI MINHA SENHA
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-indigo-600/70" />
              </div>
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-indigo-600 transition-colors"
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
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 text-white font-sans font-bold text-sm uppercase rounded-lg shadow-sm transition-all cursor-pointer flex items-center justify-center space-x-2 border border-transparent active:scale-[0.98]"
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
          <span className="text-xs font-mono uppercase tracking-widest text-slate-400">OU ACESSE COM</span>
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
              className="text-indigo-600 hover:underline font-sans font-semibold transition-all cursor-pointer"
            >
              Criar conta militar
            </button>
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full text-center py-4 text-xs font-sans text-slate-500 border-t border-slate-200/80 z-10">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0 max-w-6xl mx-auto px-4">
          <span>© 2024 Militar Aprova IA. Todos os direitos reservados.</span>
          <div className="flex space-x-4">
            <button className="hover:text-slate-800 uppercase transition-colors">Termos</button>
            <button className="hover:text-slate-800 uppercase transition-colors">Privacidade</button>
            <button className="hover:text-slate-800 uppercase transition-colors">Contato</button>
          </div>
        </div>
      </div>
    </div>
  );
}
