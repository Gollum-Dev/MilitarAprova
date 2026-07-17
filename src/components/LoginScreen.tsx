import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ShieldAlert, Award, ArrowLeft, User, Phone, FileText } from "lucide-react";
import { validateStudentLogin, createStudent } from "../lib/student";
import { supabase } from "../lib/supabase";
import { initializeProgress } from "../lib/progress";
import { initializePlanner } from "../lib/studyPlanner";

interface LoginScreenProps {
  onLoginSuccess: (name: string, role: "aluno" | "admin", allowedCourses: string[], email?: string) => void;
  onBackToLanding?: () => void;
  initialCourseId?: string | null;
}

export default function LoginScreen({ onLoginSuccess, onBackToLanding, initialCourseId }: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [isRegisterMode, setIsRegisterMode] = useState(initialCourseId ? true : false);
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerPhone, setRegisterPhone] = useState("");

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) {
        alert(`Erro ao conectar com a conta Google: ${error.message}`);
      }
    } catch (err: any) {
      alert(`Erro inesperado: ${err.message || err}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (isRegisterMode) {
      if (!registerName || !registerEmail || !registerPassword) {
        alert("Por favor, preencha todos os campos obrigatórios.");
        setIsLoading(false);
        return;
      }
      try {
        const { data: existingStudent } = await supabase
          .from('students')
          .select('id')
          .eq('email', registerEmail.trim().toLowerCase())
          .maybeSingle();

        if (existingStudent) {
          alert("Este e-mail já está cadastrado. Por favor, faça login.");
          setIsLoading(false);
          setIsRegisterMode(false);
          setEmail(registerEmail);
          return;
        }

        const newStudent = await createStudent({
          name: registerName,
          email: registerEmail.trim().toLowerCase(),
          password: registerPassword,
          phone: registerPhone,
          cpf: "",
          status: 'Ativo',
          allowed_courses: []
        });

        setIsLoading(false);
        if (newStudent) {
          alert("Cadastro realizado com sucesso! Bem-vindo combatente.");
          initializeProgress(newStudent);
          initializePlanner(newStudent);
          onLoginSuccess(newStudent.name, "aluno", newStudent.allowed_courses || [], newStudent.email);
        } else {
          alert("Erro ao realizar o cadastro. Tente novamente.");
        }
      } catch (err: any) {
        setIsLoading(false);
        console.error("Erro no cadastro:", err);
        alert(`Erro técnico ao realizar cadastro: ${err.message || err}`);
      }
      return;
    }

    const isEmailAdmin = email.toLowerCase() === "admin@teste.com";
    
    if (isEmailAdmin) {
      if (password === "123456") {
        setTimeout(() => {
          setIsLoading(false);
          onLoginSuccess("Administrador", "admin", [], "admin@teste.com");
        }, 800);
      } else {
        setIsLoading(false);
        alert("Senha de administrador incorreta.");
      }
    } else {
      try {
        const student = await validateStudentLogin(email, password);
        setIsLoading(false);
        if (student) {
          initializeProgress(student);
          initializePlanner(student);
          onLoginSuccess(student.name, "aluno", student.allowed_courses || [], student.email);
        } else {
          alert("Credenciais de aluno inválidas ou conta inativa. Use a senha definida pelo administrador.");
        }
      } catch (err) {
        setIsLoading(false);
        console.error("Erro no login do aluno:", err);
        alert("Erro técnico ao realizar login. Verifique sua conexão.");
      }
    }
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
      <div className="hidden lg:flex lg:w-[55%] relative bg-blue-950 items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-blue-900/60 mix-blend-multiply z-10" />
        <img 
          src="/login-bg-premium.png" 
          alt="Cabo Véio Tactical Background" 
          className="absolute inset-0 w-full h-full object-cover z-0 opacity-90"
        />
        {/* Decorative elements over image */}
        <div className="relative z-20 text-center px-12 mt-[-10%]">
           <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-500 to-indigo-800 border border-amber-400/20 flex items-center justify-center shadow-2xl mb-8">
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
            <p className="text-indigo-100/90 text-lg md:text-xl font-sans max-w-xl mx-auto drop-shadow-md leading-relaxed">
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
            <div className="w-16 h-16 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-800 border border-amber-400/20 flex items-center justify-center shadow-sm">
              <div className="relative">
                <ShieldAlert className="w-9 h-9 text-white" />
                <div className="absolute inset-0 flex items-center justify-center opacity-40">
                  <Award className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
            <div>
              <h1 className="text-lg font-display font-bold text-slate-800 tracking-tight">
                Cabo Véio
              </h1>
              <p className="text-[9px] text-slate-500 font-mono tracking-wider uppercase">
                Doutrina e Bizus de Caserna
              </p>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="w-full max-w-md mx-auto my-auto glass-panel rounded-2xl p-6 md:p-8 shadow-md z-10 animate-smooth-zoom" id="login-card">
          {initialCourseId && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl text-xs font-sans font-bold flex items-start space-x-2.5 shadow-sm">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="block font-black uppercase text-[10px] tracking-wider text-amber-700">Matrícula Requerida</span>
                <span className="leading-relaxed">Para adquirir o curso selecionado, você deve primeiro entrar na área do aluno ou realizar um cadastro.</span>
              </div>
            </div>
          )}

          {/* Tab Selector */}
          <div className="flex border-b border-slate-100 mb-6">
            <button
              type="button"
              onClick={() => setIsRegisterMode(false)}
              className={`flex-1 pb-3.5 text-xs font-sans font-extrabold uppercase tracking-wider transition-colors border-none bg-transparent cursor-pointer ${!isRegisterMode ? 'text-indigo-600 border-b-2 border-indigo-600 font-black' : 'text-slate-400 hover:text-slate-655'}`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => setIsRegisterMode(true)}
              className={`flex-1 pb-3.5 text-xs font-sans font-extrabold uppercase tracking-wider transition-colors border-none bg-transparent cursor-pointer ${isRegisterMode ? 'text-indigo-600 border-b-2 border-indigo-600 font-black' : 'text-slate-400 hover:text-slate-655'}`}
            >
              Cadastrar-se
            </button>
          </div>

          <div className="mb-6 text-center">
            <h2 className="text-xl font-display font-bold text-slate-800 tracking-tight uppercase">
              {isRegisterMode ? "Crie sua Conta de Aluno" : "Área do Aluno"}
            </h2>
            {isRegisterMode && (
              <p className="text-xs text-slate-500 mt-1 font-sans">
                Preencha os dados abaixo para criar seu acesso.
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegisterMode ? (
              <>
                {/* Nome Completo */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-sans font-bold text-slate-600 uppercase tracking-wider">Nome Completo</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      required
                      type="text"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      placeholder="Recruta Silva"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none rounded-lg text-sm transition-all font-sans text-slate-800"
                    />
                  </div>
                </div>

                {/* Email de Cadastro */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-sans font-bold text-slate-600 uppercase tracking-wider">E-mail</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      required
                      type="email"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      placeholder="aluno@email.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none rounded-lg text-sm transition-all font-sans text-slate-800"
                    />
                  </div>
                </div>

                {/* Senha de Cadastro */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-sans font-bold text-slate-600 uppercase tracking-wider">Senha</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      required
                      type={showPassword ? "text" : "password"}
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      placeholder="Defina uma senha"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none rounded-lg text-sm transition-all font-mono text-slate-800"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer border-none bg-transparent"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Telefone */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-sans font-bold text-slate-600 uppercase tracking-wider">Telefone / WhatsApp (opcional)</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={registerPhone}
                      onChange={(e) => setRegisterPhone(e.target.value)}
                      placeholder="(31) 99999-9999"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none rounded-lg text-sm transition-all font-sans text-slate-800"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Email de Login */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-sans font-bold text-slate-600 uppercase tracking-wider">Identificação (E-mail)</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      required
                      id="login-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="aluno@email.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none rounded-lg text-sm transition-all font-sans text-slate-800"
                    />
                  </div>
                </div>

                {/* Senha de Login */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="block text-[10px] font-sans font-bold text-slate-600 uppercase tracking-wider">Senha de Acesso</label>
                    <a href="#recuperar" className="text-[10px] font-sans font-bold text-indigo-600 hover:text-indigo-800 transition-colors uppercase tracking-wide">Esqueci a Senha</a>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      required
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Sua senha"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none rounded-lg text-sm transition-all font-mono text-slate-800"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer border-none bg-transparent"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Submit Button */}
            <button
              id="login-submit"
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-800 disabled:bg-indigo-600/50 text-white font-sans font-bold text-sm uppercase rounded-lg shadow-sm transition-all cursor-pointer flex items-center justify-center space-x-2 border border-transparent active:scale-[0.98]"
            >
              {isLoading ? (
                <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <span>{isRegisterMode ? "CADASTRAR E ENTRAR" : "ENTRAR"}</span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center justify-between">
            <span className="w-1/5 border-b border-slate-200"></span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">INFORMAÇÃO</span>
            <span className="w-1/5 border-b border-slate-200"></span>
          </div>

          {/* Google Login button */}
          <button
            id="google-login"
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-2.5 px-4 bg-white/80 border border-slate-200 hover:bg-white text-slate-600 hover:text-slate-800 rounded-lg text-xs font-sans flex items-center justify-center space-x-3 transition-colors cursor-pointer shadow-sm backdrop-blur-sm"
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
              {isRegisterMode ? "Já possui uma conta?" : "Ainda não possui conta?"}{" "}
              <button
                type="button"
                onClick={() => setIsRegisterMode(!isRegisterMode)}
                className="text-indigo-600 hover:underline font-sans font-semibold transition-all cursor-pointer border-none bg-transparent"
              >
                {isRegisterMode ? "Faça login" : "Criar conta"}
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
