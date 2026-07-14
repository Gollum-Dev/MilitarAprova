import React, { useState, useEffect } from "react";
import { User, Mail, Phone, Hash, Calendar, Shield, Award, Briefcase, Save, Edit2, CheckCircle2, Lock, AlertCircle } from "lucide-react";

export default function ConfiguracoesScreen() {
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    cpf: "",
    dataNascimento: ""
  });
  const [passwordData, setPasswordData] = useState({
    senhaAtual: "",
    novaSenha: "",
    confirmarSenha: ""
  });
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("aluno_perfil");
    if (saved) {
      setFormData(JSON.parse(saved));
    } else {
      // Default mockup data if empty
      setFormData({
        nome: "Soldado Silva",
        email: "silva.militar@exemplo.com",
        telefone: "(31) 99999-9999",
        cpf: "123.456.789-00",
        dataNascimento: "1995-05-10"
      });
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
    if (passwordError) setPasswordError("");
  };

  const handleSave = () => {
    if (passwordData.senhaAtual || passwordData.novaSenha || passwordData.confirmarSenha) {
      if (!passwordData.senhaAtual) {
        setPasswordError("Você precisa informar a senha atual para alterá-la.");
        return;
      }
      if (!passwordData.novaSenha || !passwordData.confirmarSenha) {
        setPasswordError("Preencha a nova senha e confirme para alterá-la.");
        return;
      }
      if (passwordData.novaSenha !== passwordData.confirmarSenha) {
        setPasswordError("As novas senhas não coincidem.");
        return;
      }
      if (passwordData.novaSenha.length < 6) {
        setPasswordError("A nova senha deve ter pelo menos 6 caracteres.");
        return;
      }
    }

    localStorage.setItem("aluno_perfil", JSON.stringify(formData));
    
    // Reset password fields after save
    setPasswordData({ senhaAtual: "", novaSenha: "", confirmarSenha: "" });
    setPasswordError("");
    setIsEditing(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const inputClass = `w-full px-4 py-2 rounded-xl border text-sm font-sans transition-all focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none ${
    isEditing 
      ? "bg-white border-slate-200 text-slate-800" 
      : "bg-slate-50 border-transparent text-slate-600 font-medium cursor-default"
  }`;

  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 space-y-8 shadow-sm border border-slate-200/60 animate-smooth-fade w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-lg md:text-xl font-display font-bold text-slate-800 tracking-tight">Dados Pessoais do Aluno</h2>
          <p className="text-xs md:text-sm text-slate-500 font-sans mt-1">Consulte ou edite as informações do seu cadastro na plataforma.</p>
        </div>
        
        <div className="flex items-center space-x-3 shrink-0">
          {showSuccess && (
            <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg animate-smooth-fade">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              Salvo com sucesso
            </span>
          )}
          
          {!isEditing ? (
            <button 
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2 px-5 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs uppercase tracking-wide rounded-xl transition-all cursor-pointer border border-blue-200/50"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Editar Dados</span>
            </button>
          ) : (
            <button 
              onClick={handleSave}
              className="flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wide rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Salvar Alterações</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nome Completo */}
        <div className="space-y-2">
          <label className="flex items-center text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
            <User className="w-3.5 h-3.5 mr-1.5 opacity-70" /> Nome Completo
          </label>
          <input 
            type="text" 
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            readOnly={!isEditing}
            className={inputClass}
            placeholder="Seu nome completo"
          />
        </div>

        {/* E-mail */}
        <div className="space-y-2">
          <label className="flex items-center text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
            <Mail className="w-3.5 h-3.5 mr-1.5 opacity-70" /> E-mail
          </label>
          <input 
            type="email" 
            name="email"
            value={formData.email}
            onChange={handleChange}
            readOnly={!isEditing}
            className={inputClass}
            placeholder="seu.email@exemplo.com"
          />
        </div>

        {/* CPF */}
        <div className="space-y-2">
          <label className="flex items-center text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
            <Hash className="w-3.5 h-3.5 mr-1.5 opacity-70" /> CPF
          </label>
          <input 
            type="text" 
            name="cpf"
            value={formData.cpf}
            onChange={handleChange}
            readOnly={!isEditing}
            className={inputClass}
            placeholder="000.000.000-00"
          />
        </div>

        {/* Telefone */}
        <div className="space-y-2">
          <label className="flex items-center text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
            <Phone className="w-3.5 h-3.5 mr-1.5 opacity-70" /> Telefone / Celular
          </label>
          <input 
            type="text" 
            name="telefone"
            value={formData.telefone}
            onChange={handleChange}
            readOnly={!isEditing}
            className={inputClass}
            placeholder="(00) 90000-0000"
          />
        </div>

        {/* Data de Nascimento */}
        <div className="space-y-2">
          <label className="flex items-center text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
            <Calendar className="w-3.5 h-3.5 mr-1.5 opacity-70" /> Data de Nascimento
          </label>
          <input 
            type="date" 
            name="dataNascimento"
            value={formData.dataNascimento}
            onChange={handleChange}
            readOnly={!isEditing}
            className={inputClass}
          />
        </div>

      </div>

      {/* Alteração de Senha (Visível apenas na edição) */}
      {isEditing && (
        <div className="mt-8 pt-8 border-t border-slate-100">
          <div className="mb-6">
            <h3 className="text-sm font-display font-bold text-slate-800 flex items-center">
              <Lock className="w-4 h-4 mr-2 text-slate-500" />
              Segurança e Senha
            </h3>
            <p className="text-xs text-slate-500 mt-1">Preencha apenas se desejar alterar sua senha atual.</p>
          </div>

          <div className="space-y-6">
            {/* Senha Atual */}
            <div className="space-y-2 max-w-sm">
              <label className="flex items-center text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                Senha Atual
              </label>
              <input 
                type="password" 
                name="senhaAtual"
                value={passwordData.senhaAtual}
                onChange={handlePasswordChange}
                className={inputClass}
                placeholder="Digite sua senha atual"
              />
            </div>

            {/* Novas Senhas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                  Nova Senha
                </label>
                <input 
                  type="password" 
                  name="novaSenha"
                  value={passwordData.novaSenha}
                  onChange={handlePasswordChange}
                  className={inputClass}
                  placeholder="Mínimo de 6 caracteres"
                />
              </div>
              
              <div className="space-y-2">
                <label className="flex items-center text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                  Confirmar Nova Senha
                </label>
                <input 
                  type="password" 
                  name="confirmarSenha"
                  value={passwordData.confirmarSenha}
                  onChange={handlePasswordChange}
                  className={inputClass}
                  placeholder="Digite a senha novamente"
                />
              </div>
            </div>
          </div>

          {passwordError && (
            <div className="mt-4 flex items-center text-xs font-bold text-rose-600 bg-rose-50 px-4 py-2.5 rounded-xl border border-rose-100">
              <AlertCircle className="w-4 h-4 mr-2" />
              {passwordError}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
