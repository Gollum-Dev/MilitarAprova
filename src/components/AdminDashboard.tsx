import React, { useState } from "react";
import { ShieldAlert, LogOut, Users, BookOpen, LineChart, PlusCircle, Settings, Edit, Trash2, X, Save } from "lucide-react";
import CourseEditor, { CourseData } from "./CourseEditor";

interface AdminDashboardProps {
  onLogout: () => void;
  userName: string;
}

export default function AdminDashboard({ onLogout, userName }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"cursos" | "usuarios" | "metricas" | "config">("cursos");
  const [courses, setCourses] = useState<CourseData[]>([
    { id: 1, title: "Preparatório CHO CBMMG 2027", institution: "CBMMG", year: "2027", status: "Publicado", disciplines: [] }
  ]);
  const [institutions, setInstitutions] = useState(["CBMMG", "PMMG", "PMESP", "CBMERJ"]);
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<number | null>(null);
  const [newCourseTitle, setNewCourseTitle] = useState("");
  const [newCourseInstitution, setNewCourseInstitution] = useState("");
  const [newCourseYear, setNewCourseYear] = useState("");

  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseTitle) return;
    
    setCourses([...courses, {
      id: Date.now(),
      title: newCourseTitle,
      institution: newCourseInstitution || "N/A",
      year: newCourseYear || new Date().getFullYear().toString(),
      status: "Rascunho"
    }]);
    
    setNewCourseTitle("");
    setNewCourseInstitution("");
    setNewCourseYear("");
    setIsCreatingCourse(false);
  };

  const menuItems = [
    { id: "cursos", label: "Gerenciar Cursos", icon: BookOpen },
    { id: "usuarios", label: "Alunos Matriculados", icon: Users },
    { id: "metricas", label: "Estatísticas de Uso", icon: LineChart },
    { id: "config", label: "Configurações da Plataforma", icon: Settings },
  ] as const;

  return (
    <div className="min-h-screen flex w-full bg-[var(--bg)] font-sans overflow-hidden animate-smooth-fade">
      {/* Sidebar Admin */}
      <aside className="w-64 glass-panel border-r border-slate-200 flex flex-col justify-between shrink-0 h-screen sticky top-0" id="admin-sidebar">
        {/* Top Brand / Logo */}
        <div className="p-5 border-b border-slate-100 space-y-2">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded bg-gradient-to-tr from-indigo-500 to-indigo-700 border border-indigo-400/20 flex items-center justify-center shrink-0 shadow-sm">
              <ShieldAlert className="w-4 h-4 text-white" />
            </div>
            <div className="overflow-hidden">
              <h1 className="text-xs font-sans font-bold text-slate-800 tracking-wide uppercase truncate">
                Militar Aprova IA
              </h1>
              <p className="text-[9px] text-indigo-500 font-mono font-bold tracking-wider uppercase truncate">
                Painel Administrativo
              </p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-mono font-bold text-sm shadow-sm">
              AD
            </div>
            <div className="overflow-hidden">
              <h3 className="text-xs font-sans font-semibold text-slate-800 uppercase truncate">
                {userName}
              </h3>
              <span className="inline-block mt-1 text-[8px] font-sans font-extrabold text-white bg-indigo-500 px-1.5 py-0.5 rounded uppercase tracking-wider">
                Administrador
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-sans font-medium transition-all duration-150 cursor-pointer ${
                  isActive 
                    ? "bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600 font-bold shadow-sm" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <IconComponent className={`w-4 h-4 shrink-0 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Logout */}
        <div className="p-4 border-t border-slate-100 space-y-3">
          <button
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-sans font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors cursor-pointer text-left"
          >
            <LogOut className="w-4 h-4 text-slate-400 group-hover:text-indigo-500" />
            <span>Sair do Sistema</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto h-screen p-6 md:p-8 scrollbar-thin scrollbar-thumb-slate-200 relative">
        {editingCourseId ? (
          <CourseEditor 
            course={courses.find(c => c.id === editingCourseId)!}
            institutions={institutions}
            onSave={(updatedCourse) => {
              setCourses(courses.map(c => c.id === updatedCourse.id ? updatedCourse : c));
              setEditingCourseId(null);
            }}
            onCancel={() => setEditingCourseId(null)}
          />
        ) : (
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center border-b border-slate-200 pb-4">
              <div>
                <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">
                  VISÃO DO GESTOR
                </span>
                <h2 className="text-xs font-mono uppercase font-bold text-slate-700 tracking-tight mt-0.5">
                  {menuItems.find(i => i.id === activeTab)?.label}
                </h2>
              </div>
            </div>

            <div className="animate-smooth-fade">
            {activeTab === "cursos" && (
              <div className="space-y-6">
                {!isCreatingCourse ? (
                  <>
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-display font-bold text-slate-800">Cursos Ativos</h3>
                      <button 
                        onClick={() => setIsCreatingCourse(true)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-sans font-bold uppercase tracking-wider transition-colors shadow-sm flex items-center space-x-2 cursor-pointer"
                      >
                        <PlusCircle className="w-4 h-4" />
                        <span>Novo Curso</span>
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {courses.map(course => (
                        <div key={course.id} className="glass-panel p-5 rounded-2xl border border-slate-200 flex flex-col justify-between h-48 group">
                          <div>
                            <div className="flex justify-between items-start mb-2">
                              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                <BookOpen className="w-4 h-4" />
                              </div>
                              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${course.status === 'Publicado' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                                {course.status}
                              </span>
                            </div>
                            <h4 className="text-sm font-sans font-bold text-slate-800 line-clamp-2">{course.title}</h4>
                            <p className="text-[10px] text-slate-500 font-mono mt-1">{course.institution} • {course.year}</p>
                          </div>
                          <div className="flex justify-end space-x-2 border-t border-slate-100 pt-3 mt-4">
                            <button 
                              onClick={() => setEditingCourseId(course.id)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer" title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => setCourses(courses.filter(c => c.id !== course.id))}
                              className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer" title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="glass-panel p-8 rounded-2xl border border-slate-200 relative animate-smooth-fade">
                    <button 
                      onClick={() => setIsCreatingCourse(false)}
                      className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-full transition-all cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    
                    <h3 className="text-xl font-display font-bold text-slate-800 mb-6 flex items-center space-x-2">
                      <BookOpen className="w-6 h-6 text-indigo-600" />
                      <span>Cadastrar Novo Curso</span>
                    </h3>
                    
                    <form onSubmit={handleSaveCourse} className="space-y-5 w-full mt-4">
                      <div>
                        <label className="block text-xs font-sans font-bold text-slate-600 uppercase tracking-wider mb-2">Nome do Curso</label>
                        <input 
                          type="text" 
                          required
                          value={newCourseTitle}
                          onChange={(e) => setNewCourseTitle(e.target.value)}
                          placeholder="Ex: Curso de Formação de Oficiais"
                          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-sans text-slate-800"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <label className="block text-xs font-sans font-bold text-slate-600 uppercase tracking-wider">Instituição</label>
                            <div className="flex space-x-3">
                              {newCourseInstitution && (
                                <button 
                                  type="button"
                                  onClick={() => {
                                    if (window.confirm(`Tem certeza que deseja excluir '${newCourseInstitution}' da lista?`)) {
                                      setInstitutions(institutions.filter(i => i !== newCourseInstitution));
                                      setNewCourseInstitution("");
                                    }
                                  }}
                                  className="text-[10px] font-bold text-rose-500 hover:text-rose-700 uppercase tracking-wider flex items-center space-x-1 cursor-pointer transition-colors"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>Excluir</span>
                                </button>
                              )}
                              <button 
                                type="button"
                                onClick={() => {
                                  const newInst = window.prompt("Digite o nome da nova instituição (Ex: DEPEN):");
                                  if (newInst && newInst.trim()) {
                                    const upper = newInst.trim().toUpperCase();
                                    if (!institutions.includes(upper)) {
                                      setInstitutions([...institutions, upper]);
                                    }
                                    setNewCourseInstitution(upper);
                                  }
                                }}
                                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-wider flex items-center space-x-1 cursor-pointer transition-colors"
                              >
                                <PlusCircle className="w-3 h-3" />
                                <span>Nova</span>
                              </button>
                            </div>
                          </div>
                          <select 
                            required
                            value={newCourseInstitution}
                            onChange={(e) => setNewCourseInstitution(e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-sans text-slate-800 appearance-none cursor-pointer"
                          >
                            <option value="" disabled>Selecione...</option>
                            {institutions.map(inst => (
                              <option key={inst} value={inst}>{inst}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-sans font-bold text-slate-600 uppercase tracking-wider mb-2">Ano do Concurso/Prova</label>
                          <input 
                            type="text" 
                            required
                            value={newCourseYear}
                            onChange={(e) => setNewCourseYear(e.target.value)}
                            placeholder="Ex: 2026"
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-sans text-slate-800"
                          />
                        </div>
                      </div>
                      
                      <div className="pt-6 border-t border-slate-100 flex space-x-4">
                        <button 
                          type="button"
                          onClick={() => setIsCreatingCourse(false)}
                          className="flex-1 px-6 py-3 text-slate-500 border border-slate-200 font-bold uppercase tracking-wider text-xs hover:bg-slate-50 rounded-xl transition-all cursor-pointer text-center"
                        >
                          Cancelar
                        </button>
                        <button 
                          type="submit"
                          className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-sans font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer active:scale-95"
                        >
                          <Save className="w-4 h-4" />
                          <span>Salvar Curso</span>
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}

            {activeTab === "usuarios" && (
              <div className="glass-panel p-8 rounded-2xl border border-slate-200 text-center">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-display font-bold text-slate-800 mb-2">Gestão de Alunos</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto">Esta área está sendo desenvolvida. Aqui você poderá matricular alunos, aprovar pagamentos e ver o progresso.</p>
              </div>
            )}

            {activeTab === "metricas" && (
              <div className="glass-panel p-8 rounded-2xl border border-slate-200 text-center">
                <LineChart className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-display font-bold text-slate-800 mb-2">Métricas e Relatórios</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto">Dashboard de conversão e engajamento das turmas.</p>
              </div>
            )}
            
            {activeTab === "config" && (
              <div className="glass-panel p-8 rounded-2xl border border-slate-200 text-center">
                <Settings className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-display font-bold text-slate-800 mb-2">Configurações Gerais</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto">Edite as informações da Landing Page e integração de pagamentos (Stripe/Hotmart).</p>
              </div>
            )}
          </div>
        </div>
        )}
      </main>
    </div>
  );
}
