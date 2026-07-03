import React, { useState, useEffect } from "react";
import { ShieldAlert, LogOut, Users, BookOpen, LineChart, PlusCircle, Settings, Edit, Trash2, X, Save, Video, Headphones, FileText, HelpCircle, Layers, FileCheck, FolderTree, ListTree } from "lucide-react";
import CourseEditor, { CourseData } from "./CourseEditor";
import { MateriasManager } from "./MateriasManager";
import { fetchAdminCourses, createAdminCourse, updateAdminCourse, deleteAdminCourse, generateNewCourseId } from "../lib/api";

interface AdminDashboardProps {
  onLogout: () => void;
  userName: string;
}

export default function AdminDashboard({ onLogout, userName }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"cursos" | "usuarios" | "metricas" | "config">("cursos");
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [institutions, setInstitutions] = useState(["CBMMG", "PMMG", "PMESP", "CBMERJ"]);
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | number | null>(null);
  const [editingCourseMode, setEditingCourseMode] = useState<'basic' | 'curriculum'>('basic');
  const [newCourseTitle, setNewCourseTitle] = useState("");
  const [newCourseInstitution, setNewCourseInstitution] = useState("");
  const [newCourseYear, setNewCourseYear] = useState("");

  useEffect(() => {
    async function loadCourses() {
      setLoading(true);
      try {
        const data = await fetchAdminCourses();
        const mapped = data.map((c: any) => ({
          id: c.id,
          title: c.title,
          institution: c.institution || '',
          year: c.year || '',
          status: c.status || 'Rascunho',
          disciplines: c.disciplines_json || []
        }));
        setCourses(mapped);
      } catch (err) {
        console.error("Erro ao carregar cursos:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCourses();
  }, []);

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseTitle) return;
    
    try {
      const newId = await generateNewCourseId(newCourseTitle);
      const newCourseData = {
        id: newId,
        title: newCourseTitle,
        institution: newCourseInstitution || "N/A",
        year: newCourseYear || new Date().getFullYear().toString(),
        status: "Rascunho",
        disciplines_json: [],
        subtitle: "Descrição do curso",
        hours: 0,
        lessons: 0,
        disciplines_count: 0
      };

      await createAdminCourse(newCourseData);
      
      setCourses([...courses, {
        id: newId,
        title: newCourseTitle,
        institution: newCourseData.institution,
        year: newCourseData.year,
        status: newCourseData.status,
        disciplines: []
      }]);
      
      setNewCourseTitle("");
      setNewCourseInstitution("");
      setNewCourseYear("");
      setIsCreatingCourse(false);
    } catch (err) {
      console.error("Erro ao criar curso:", err);
      alert("Erro ao criar curso. Verifique o console.");
    }
  };

  const menuItems = [
    { id: "cursos", label: "Gerenciar Cursos", icon: BookOpen },
    { id: "materias", label: "Gerenciar Matérias", icon: Layers },
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
            <div className="w-8 h-8 rounded bg-gradient-to-tr from-emerald-600 to-emerald-800 border border-emerald-400/20 flex items-center justify-center shrink-0 shadow-sm">
              <ShieldAlert className="w-4 h-4 text-white" />
            </div>
            <div className="overflow-hidden">
              <h1 className="text-xs font-sans font-bold text-slate-800 tracking-wide uppercase truncate">
                Cabo Véio
              </h1>
              <p className="text-[9px] text-emerald-700 font-mono font-bold tracking-wider uppercase truncate">
                Painel Administrativo
              </p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-emerald-700 flex items-center justify-center text-white font-mono font-bold text-sm shadow-sm">
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
                onClick={() => {
                  setActiveTab(item.id);
                  setEditingCourseId(null);
                }}
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
            mode={editingCourseMode}
            onSave={async (updatedCourse, closeEditor = true) => {
              try {
                await updateAdminCourse(updatedCourse.id.toString(), {
                  title: updatedCourse.title,
                  institution: updatedCourse.institution,
                  year: updatedCourse.year,
                  status: updatedCourse.status,
                  disciplines_json: updatedCourse.disciplines || []
                });
                setCourses(courses.map(c => c.id === updatedCourse.id ? updatedCourse : c));
                if (closeEditor) {
                  setEditingCourseId(null);
                }
              } catch (err) {
                console.error("Erro ao atualizar curso:", err);
                alert("Erro ao salvar curso. Verifique o console.");
              }
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
                        className="group px-5 py-2.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-100 hover:border-indigo-600 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md flex items-center space-x-2 relative overflow-hidden whitespace-nowrap shrink-0"
                      >
                        <PlusCircle className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />
                        <span>Novo Curso</span>
                      </button>
                    </div>
                    
                    {loading ? (
                      <div className="flex justify-center items-center py-20">
                        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                      </div>
                    ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {courses.map(course => {
                        let qtdDisciplinas = 0;
                        let qtdEixos = 0;
                        let qtdConteudos = 0;
                        let qtdVideos = 0, qtdAudios = 0, qtdPdfs = 0, qtdQuestoes = 0, qtdFlashcards = 0, qtdResumos = 0;

                        if (course.disciplines) {
                          qtdDisciplinas = course.disciplines.length;
                          course.disciplines.forEach(d => {
                            qtdEixos += d.areas?.length || 0;
                            d.areas?.forEach(a => {
                              qtdConteudos += a.contents?.length || 0;
                              a.contents?.forEach(c => {
                                c.resources?.forEach(r => {
                                  if (r.type === 'video') qtdVideos++;
                                  else if (r.type === 'audio') qtdAudios++;
                                  else if (r.type === 'pdf') qtdPdfs++;
                                  else if (r.type === 'question') qtdQuestoes++;
                                  else if (r.type === 'flashcard') qtdFlashcards++;
                                  else if (r.type === 'summary') qtdResumos++;
                                });
                              });
                            });
                          });
                        }

                        return (
                          <div key={course.id} className="glass-panel p-5 rounded-2xl border border-slate-200/60 flex flex-col justify-between h-auto group hover:border-indigo-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden bg-gradient-to-br from-white to-slate-50">
                            {/* Decorative accent */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-full -z-10 group-hover:bg-indigo-500/10 transition-colors"></div>
                            
                            <div>
                              <div className="flex justify-between items-start mb-3">
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
                                  <BookOpen className="w-5 h-5" />
                                </div>
                                <span className={`text-[9px] font-mono font-bold px-2.5 py-1 rounded-full border shadow-sm ${course.status === 'Publicado' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                  {course.status}
                                </span>
                              </div>
                              <h4 className="text-base font-display font-bold text-slate-800 line-clamp-2 leading-tight mb-1 group-hover:text-indigo-700 transition-colors">{course.title}</h4>
                              <p className="text-[11px] text-slate-500 font-mono mb-4">{course.institution} • {course.year}</p>
                              
                              {/* Structure Stats */}
                              <div className="grid grid-cols-3 gap-2 mb-4 p-2.5 bg-slate-100/50 rounded-xl border border-slate-100">
                                <div className="flex flex-col items-center justify-center text-center">
                                  <span className="text-lg font-display font-bold text-slate-700">{qtdDisciplinas}</span>
                                  <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400">Disciplinas</span>
                                </div>
                                <div className="flex flex-col items-center justify-center text-center border-l border-r border-slate-200/60">
                                  <span className="text-lg font-display font-bold text-slate-700">{qtdEixos}</span>
                                  <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400">Eixos</span>
                                </div>
                                <div className="flex flex-col items-center justify-center text-center">
                                  <span className="text-lg font-display font-bold text-slate-700">{qtdConteudos}</span>
                                  <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400">Conteúdos</span>
                                </div>
                              </div>

                              {/* Resources Badges */}
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {qtdVideos > 0 && <span className="inline-flex items-center space-x-1 bg-rose-50 text-rose-600 px-2 py-0.5 rounded text-[10px] font-bold border border-rose-100"><Video className="w-3 h-3"/> <span>{qtdVideos}</span></span>}
                                {qtdAudios > 0 && <span className="inline-flex items-center space-x-1 bg-purple-50 text-purple-600 px-2 py-0.5 rounded text-[10px] font-bold border border-purple-100"><Headphones className="w-3 h-3"/> <span>{qtdAudios}</span></span>}
                                {qtdPdfs > 0 && <span className="inline-flex items-center space-x-1 bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[10px] font-bold border border-blue-100"><FileText className="w-3 h-3"/> <span>{qtdPdfs}</span></span>}
                                {qtdResumos > 0 && <span className="inline-flex items-center space-x-1 bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-100"><FileCheck className="w-3 h-3"/> <span>{qtdResumos}</span></span>}
                                {qtdFlashcards > 0 && <span className="inline-flex items-center space-x-1 bg-amber-50 text-amber-600 px-2 py-0.5 rounded text-[10px] font-bold border border-amber-100"><Layers className="w-3 h-3"/> <span>{qtdFlashcards}</span></span>}
                                {qtdQuestoes > 0 && <span className="inline-flex items-center space-x-1 bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded text-[10px] font-bold border border-indigo-100"><HelpCircle className="w-3 h-3"/> <span>{qtdQuestoes}</span></span>}
                                {(qtdVideos + qtdAudios + qtdPdfs + qtdResumos + qtdFlashcards + qtdQuestoes === 0) && (
                                  <span className="text-[10px] text-slate-400 italic">Nenhum recurso cadastrado</span>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100/80 pt-3 mt-4 relative z-10">
                              <button 
                                onClick={() => { setEditingCourseMode('basic'); setEditingCourseId(course.id); }}
                                className="px-3 py-1.5 text-[10px] uppercase font-bold text-indigo-600 hover:text-white hover:bg-indigo-600 rounded transition-colors flex items-center space-x-1 cursor-pointer"
                              >
                                <Edit className="w-3 h-3" />
                                <span>Editar</span>
                              </button>
                              <button 
                                onClick={() => { setEditingCourseMode('curriculum'); setEditingCourseId(course.id); }}
                                className="px-3 py-1.5 text-[10px] uppercase font-bold text-emerald-600 hover:text-white hover:bg-emerald-600 rounded transition-colors flex items-center space-x-1 cursor-pointer"
                              >
                                <Layers className="w-3 h-3" />
                                <span>Editar Matéria</span>
                              </button>
                              <button 
                                onClick={async () => {
                                  if (window.confirm("Tem certeza que deseja excluir este curso?")) {
                                    try {
                                      await deleteAdminCourse(course.id.toString());
                                      setCourses(courses.filter(c => c.id !== course.id));
                                    } catch (err) {
                                      console.error("Erro ao excluir curso:", err);
                                      alert("Erro ao excluir curso. Verifique o console.");
                                    }
                                  }
                                }}
                                className="px-3 py-1.5 text-[10px] uppercase font-bold text-rose-500 hover:text-white hover:bg-rose-500 rounded transition-colors flex items-center space-x-1 cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    )}
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

            {activeTab === "materias" && (
              <MateriasManager />
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
