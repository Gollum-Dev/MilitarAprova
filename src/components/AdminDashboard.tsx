import React, { useState, useEffect } from "react";
import { ShieldAlert, LogOut, Users, BookOpen, LineChart, PlusCircle, Settings, Edit, Trash2, X, Save, Video, Headphones, FileText, HelpCircle, Layers, FileCheck, FolderTree, ListTree, Eye, MessageSquare } from "lucide-react";
import CourseEditor, { CourseData } from "./CourseEditor";
import { MateriasManager } from "./MateriasManager";
import { ProvasManager } from "./ProvasManager";
import StudentMetricsManager from "./StudentMetricsManager";
import SuporteManager from "./SuporteManager";
import { supabase } from "../lib/supabase";
import { fetchAdminCourses, createAdminCourse, updateAdminCourse, deleteAdminCourse, generateNewCourseId } from "../lib/api";
import { fetchStudents, createStudent, updateStudent, deleteStudent } from "../lib/student";
import { getUnreadAdminMessagesCount } from "../lib/support";

interface AdminDashboardProps {
  onLogout: () => void;
  userName: string;
}

export default function AdminDashboard({ onLogout, userName }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"cursos" | "materias" | "provas" | "usuarios" | "metricas" | "config" | "suporte">("cursos");
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadSupport, setUnreadSupport] = useState(0);
  const [institutions, setInstitutions] = useState(["CBMMG", "PMMG", "PMESP", "CBMERJ"]);
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | number | null>(null);
  const [editingCourseMode, setEditingCourseMode] = useState<'basic' | 'curriculum'>('basic');
  const [newCourseTitle, setNewCourseTitle] = useState("");
  const [newCourseInstitution, setNewCourseInstitution] = useState("");
  const [newCourseYear, setNewCourseYear] = useState("");
  const [newCourseCoverUrl, setNewCourseCoverUrl] = useState("");
  const [newCourseDescription, setNewCourseDescription] = useState("");
  const [newCourseEndDate, setNewCourseEndDate] = useState("");
  const [activeMateria, setActiveMateria] = useState<any>(null);

  // Students Management States
  const [students, setStudents] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any | null>(null);
  
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [studentPassword, setStudentPassword] = useState("");
  const [studentPhone, setStudentPhone] = useState("");
  const [studentCpf, setStudentCpf] = useState("");
  const [studentStatus, setStudentStatus] = useState("Ativo");
  const [studentAllowedCourses, setStudentAllowedCourses] = useState<string[]>([]);

  // Exam/Prova Manager States
  const [provasFilterCourseId, setProvasFilterCourseId] = useState<string | null>(null);
  const [globalExams, setGlobalExams] = useState<any[]>([]);


  const syncAllCourseMateriasToGlobal = async (coursesList: CourseData[]) => {
    try {
      const { data: globalMaterias, error: fetchError } = await supabase
        .from('materias')
        .select('name, discipline, area');
      
      if (fetchError) {
        console.error("Erro ao buscar matérias globais para sincronismo:", fetchError);
        return;
      }
      
      const globalSet = new Set(
        (globalMaterias || []).map(m => `${m.name.trim()}|${m.discipline?.trim()}|${m.area?.trim()}`.toLowerCase())
      );
      
      const missingMaterias: any[] = [];
      const processedKeys = new Set<string>();

      coursesList.forEach(course => {
        if (Array.isArray(course.disciplines)) {
          course.disciplines.forEach(disc => {
            if (Array.isArray(disc.areas)) {
              disc.areas.forEach(area => {
                if (Array.isArray(area.contents)) {
                  area.contents.forEach(content => {
                    if (!content.name) return;
                    const key = `${content.name.trim()}|${disc.name.trim()}|${area.name.trim()}`.toLowerCase();
                    
                    if (!globalSet.has(key) && !processedKeys.has(key)) {
                      processedKeys.add(key);
                      missingMaterias.push({
                        id: "mat-" + Math.random().toString(36).substr(2, 9) + "-" + Date.now(),
                        name: content.name.trim(),
                        discipline: disc.name.trim(),
                        area: area.name.trim(),
                        resources: content.resources || []
                      });
                    }
                  });
                }
              });
            }
          });
        }
      });
      
      if (missingMaterias.length > 0) {
        console.log(`Sincronizando ${missingMaterias.length} matérias dos cursos para o banco global...`);
        const { error: insertError } = await supabase
          .from('materias')
          .insert(missingMaterias);
          
        if (insertError) {
          console.error("Erro ao inserir matérias em lote na sincronização:", insertError);
        } else {
          console.log("Sincronização concluída com sucesso!");
        }
      }
    } catch (err) {
      console.error("Erro ao rodar sincronismo de matérias:", err);
    }
  };

  useEffect(() => {
    fetchInitialData();
    checkUnreadMessages();
    const interval = setInterval(checkUnreadMessages, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, []);

  const checkUnreadMessages = async () => {
    const count = await getUnreadAdminMessagesCount();
    setUnreadSupport(count);
  };

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [data, { data: examsData }] = await Promise.all([
        fetchAdminCourses(),
        supabase.from('mock_simulators').select('id, course_ids')
      ]);
      
      if (examsData) {
        setGlobalExams(examsData);
      }
      const mapped = data.map((c: any) => ({
        id: c.id,
        title: c.title,
        institution: c.institution || '',
        year: c.year || '',
        status: c.status || 'Rascunho',
        cover_url: c.cover_url || '',
        description: c.description || '',
        end_date: c.end_date || '',
        disciplines: c.disciplines_json || []
      }));
      setCourses(mapped);
      
      // Executar sincronização de matérias ausentes
      await syncAllCourseMateriasToGlobal(mapped);

      // Atualizar as categorias da Constituição de 1988 para a nomenclatura oficial no Supabase
      await supabase
        .from('law_articles')
        .update({ category: 'Constituição da República Federativa do Brasil de 1988' })
        .in('id', ['lei-01', 'lei-02', 'lei-05']);
    } catch (err) {
      console.error("Erro ao carregar cursos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "usuarios" || activeTab === "metricas") {
      loadStudentsList();
    } else if (activeTab === "cursos") {
      // Reload exams silently to keep counters up to date
      supabase.from('mock_simulators').select('id, course_ids')
        .then(({ data }) => {
          if (data) setGlobalExams(data);
        })
        .catch(console.error);
    }
  }, [activeTab]);

  async function loadStudentsList() {
    setLoadingStudents(true);
    try {
      const data = await fetchStudents();
      setStudents(data);
    } catch (err) {
      console.error("Erro ao buscar alunos:", err);
    } finally {
      setLoadingStudents(false);
    }
  }

  const handleOpenNewStudent = () => {
    setEditingStudent(null);
    setStudentName("");
    setStudentEmail("");
    setStudentPassword("");
    setStudentPhone("");
    setStudentCpf("");
    setStudentStatus("Ativo");
    setStudentAllowedCourses([]);
    setShowStudentModal(true);
  };

  const handleOpenEditStudent = (student: any) => {
    setEditingStudent(student);
    setStudentName(student.name);
    setStudentEmail(student.email);
    setStudentPassword("");
    setStudentPhone(student.phone || "");
    setStudentCpf(student.cpf || "");
    setStudentStatus(student.status || "Ativo");
    setStudentAllowedCourses(student.allowed_courses || []);
    setShowStudentModal(true);
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !studentEmail) return;

    const payload: any = {
      name: studentName,
      email: studentEmail.trim().toLowerCase(),
      phone: studentPhone,
      cpf: studentCpf,
      status: studentStatus,
      allowed_courses: studentAllowedCourses
    };

    if (studentPassword) {
      payload.password = studentPassword;
    }

    try {
      if (editingStudent) {
        await updateStudent(editingStudent.id, payload);
        alert("Aluno atualizado com sucesso!");
      } else {
        await createStudent(payload);
        alert("Aluno cadastrado com sucesso!");
      }
      setShowStudentModal(false);
      loadStudentsList();
    } catch (err: any) {
      console.error("Erro ao salvar aluno:", err);
      alert(`Erro ao salvar aluno: ${err.message || "Erro desconhecido"}\n\n(Se o erro mencionar que a relação "students" não existe, certifique-se de executar o comando SQL de criação da tabela "students" no seu painel do Supabase).`);
    }
  };

  const handleDeleteStudentClick = async (id: string) => {
    if (window.confirm("Deseja realmente excluir este aluno e revogar todo o seu acesso?")) {
      try {
        await deleteStudent(id);
        alert("Aluno excluído com sucesso!");
        loadStudentsList();
      } catch (err) {
        console.error("Erro ao excluir aluno:", err);
        alert("Erro ao excluir aluno.");
      }
    }
  };

  const handleToggleCourseForStudent = (courseId: string) => {
    setStudentAllowedCourses(prev => 
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

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
        subtitle: newCourseDescription || "Descrição do curso",
        description: newCourseDescription || "Descrição do curso",
        cover_url: newCourseCoverUrl || "",
        end_date: newCourseEndDate || null,
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
        cover_url: newCourseData.cover_url,
        description: newCourseData.description,
        end_date: newCourseData.end_date,
        disciplines: []
      }]);
      
      setNewCourseTitle("");
      setNewCourseInstitution("");
      setNewCourseYear("");
      setNewCourseCoverUrl("");
      setNewCourseDescription("");
      setNewCourseEndDate("");
      setIsCreatingCourse(false);
    } catch (err) {
      console.error("Erro ao criar curso:", err);
      alert("Erro ao criar curso. Verifique o console.");
    }
  };

  const menuItems = [
    { id: "cursos", label: "Gerenciar Cursos", icon: BookOpen },
    { id: "materias", label: "Gerenciar Matérias", icon: Layers },
    { id: "provas", label: "Gerenciar Provas", icon: FileCheck },
    { id: "usuarios", label: "Alunos Matriculados", icon: Users },
    { id: "metricas", label: "Estatísticas de Uso", icon: LineChart },
    { id: "suporte", label: "Suporte e Contato", icon: MessageSquare },
    { id: "config", label: "Configurações da Plataforma", icon: Settings },
  ] as const;

  return (
    <div className="min-h-screen flex w-full bg-[var(--bg)] font-sans overflow-hidden animate-smooth-fade">
      {/* Sidebar Admin */}
      <aside className="w-64 glass-panel border-r border-slate-200 flex flex-col justify-between shrink-0 h-screen sticky top-0" id="admin-sidebar">
        {/* Top Brand / Logo */}
        <div className="p-5 border-b border-slate-100 space-y-2">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 overflow-hidden border border-emerald-200/50 shadow-sm bg-slate-50">
              <img src="https://pub-bc0b63de539b4cafb3fdce383cb712fa.r2.dev/Gemini_Generated_Image_6k6ayf6k6ayf6k6a.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div className="overflow-hidden">
              <h1 className="text-xs font-sans font-bold text-slate-800 tracking-wide uppercase truncate">
                Cabo Véio
              </h1>
              <p className="text-[9px] text-blue-700 font-mono font-bold tracking-wider uppercase truncate">
                Painel Administrativo
              </p>
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
                  setActiveTab(item.id as any);
                  if (item.id === "provas") {
                    setProvasFilterCourseId(null); // Clear filter when clicking sidebar
                  }
                  if (item.id === "suporte") {
                    setUnreadSupport(0); // Optimistic clear
                  }
                  setEditingCourseId(null);
                  setActiveMateria(null);
                }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-sans font-medium transition-all duration-150 cursor-pointer ${
                  isActive 
                    ? "bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600 font-bold shadow-sm" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <IconComponent className={`w-4 h-4 shrink-0 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                <span className="flex-1 text-left">{item.label}</span>
                {item.id === "suporte" && unreadSupport > 0 && (
                  <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white">{unreadSupport}</span>
                  </div>
                )}
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
                  cover_url: updatedCourse.cover_url,
                  description: updatedCourse.description,
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
            {!activeMateria && activeTab !== "provas" && activeTab !== "usuarios" && activeTab !== "metricas" && activeTab !== "suporte" && (
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
            )}

            <div className="animate-smooth-fade">
            {activeTab === "cursos" && (
              <div className="space-y-6">
                {!isCreatingCourse ? (
                  <>
                    <div className="flex justify-end items-center">
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

                        const qtdProvas = globalExams.filter(e => e.course_ids && e.course_ids.includes(course.id.toString())).length;

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
                              <div className="grid grid-cols-4 gap-1 mb-4 p-2 bg-slate-100/50 rounded-xl border border-slate-100">
                                <div className="flex flex-col items-center justify-center text-center">
                                  <span className="text-sm font-display font-bold text-slate-700">{qtdDisciplinas}</span>
                                  <span className="text-[8px] uppercase tracking-wider font-bold text-slate-400">Disciplinas</span>
                                </div>
                                <div className="flex flex-col items-center justify-center text-center border-l border-slate-200/60">
                                  <span className="text-sm font-display font-bold text-slate-700">{qtdEixos}</span>
                                  <span className="text-[8px] uppercase tracking-wider font-bold text-slate-400">Eixos</span>
                                </div>
                                <div className="flex flex-col items-center justify-center text-center border-l border-slate-200/60">
                                  <span className="text-sm font-display font-bold text-slate-700">{qtdConteudos}</span>
                                  <span className="text-[8px] uppercase tracking-wider font-bold text-slate-400">Conteúdos</span>
                                </div>
                                <div className="flex flex-col items-center justify-center text-center border-l border-slate-200/60">
                                  <span className="text-sm font-display font-bold text-indigo-600">{qtdProvas}</span>
                                  <span className="text-[8px] uppercase tracking-wider font-bold text-indigo-400">Provas</span>
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

                            <div className="flex flex-nowrap justify-end gap-1.5 border-t border-slate-100/80 pt-3 mt-4 relative z-10 overflow-x-auto pb-1 hide-scrollbar">
                              {course.cover_url && (
                                <a 
                                  href={course.cover_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="px-2 py-1.5 text-[10px] uppercase font-bold text-slate-600 hover:text-white hover:bg-slate-600 rounded transition-colors flex items-center space-x-1 cursor-pointer decoration-none whitespace-nowrap"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>Capa</span>
                                </a>
                              )}
                              <button 
                                onClick={() => { setEditingCourseMode('basic'); setEditingCourseId(course.id); }}
                                className="px-2 py-1.5 text-[10px] uppercase font-bold text-indigo-600 hover:text-white hover:bg-indigo-600 rounded transition-colors flex items-center space-x-1 cursor-pointer whitespace-nowrap"
                              >
                                <Edit className="w-3 h-3" />
                                <span>Editar</span>
                              </button>
                              <button 
                                onClick={() => { setEditingCourseMode('curriculum'); setEditingCourseId(course.id); }}
                                className="px-2 py-1.5 text-[10px] uppercase font-bold text-emerald-600 hover:text-white hover:bg-emerald-600 rounded transition-colors flex items-center space-x-1 cursor-pointer whitespace-nowrap"
                              >
                                <Layers className="w-3 h-3" />
                                <span>Matéria</span>
                              </button>
                              <button 
                                onClick={() => { 
                                  setProvasFilterCourseId(course.id.toString());
                                  setActiveTab("provas");
                                }}
                                className="px-2 py-1.5 text-[10px] uppercase font-bold text-indigo-600 hover:text-white hover:bg-indigo-600 rounded transition-colors flex items-center space-x-1 cursor-pointer whitespace-nowrap"
                              >
                                <FileCheck className="w-3 h-3" />
                                <span>Prova</span>
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
                                className="px-2 py-1.5 text-[10px] uppercase font-bold text-rose-500 hover:text-white hover:bg-rose-500 rounded transition-colors flex items-center space-x-1 cursor-pointer shrink-0"
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
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                        <div>
                          <label className="block text-xs font-sans font-bold text-slate-600 uppercase tracking-wider mb-2">Data de Encerramento</label>
                          <input 
                            type="date" 
                            value={newCourseEndDate}
                            onChange={(e) => setNewCourseEndDate(e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-sans text-slate-800"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-sans font-bold text-slate-600 uppercase tracking-wider mb-2">URL da Imagem de Capa</label>
                        <input 
                          type="url" 
                          value={newCourseCoverUrl}
                          onChange={(e) => setNewCourseCoverUrl(e.target.value)}
                          placeholder="https://exemplo.com/imagem.jpg"
                          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-sans text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-sans font-bold text-slate-600 uppercase tracking-wider mb-2">Descrição do Curso</label>
                        <textarea 
                          value={newCourseDescription}
                          onChange={(e) => setNewCourseDescription(e.target.value)}
                          placeholder="Descrição geral dos objetivos e público-alvo do curso..."
                          rows={3}
                          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-sans text-slate-800 resize-none"
                        />
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
              <MateriasManager onActiveMateriaChange={setActiveMateria} />
            )}

            {activeTab === "provas" && (
              <ProvasManager initialFilterCourseId={provasFilterCourseId} />
            )}

            {activeTab === "usuarios" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                  <div>
                    <h2 className="text-xs font-mono uppercase font-bold text-slate-700 tracking-tight mt-0.5">
                      Alunos Matriculados
                    </h2>
                  </div>
                  <button 
                    onClick={handleOpenNewStudent}
                    className="group px-5 py-2.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-100 hover:border-indigo-600 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md flex items-center space-x-2 relative overflow-hidden whitespace-nowrap shrink-0"
                  >
                    <PlusCircle className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />
                    <span>Novo Aluno</span>
                  </button>
                </div>

                {loadingStudents ? (
                  <div className="flex justify-center items-center py-20">
                    <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                  </div>
                ) : students.length === 0 ? (
                  <div className="glass-panel p-8 rounded-2xl border border-slate-200 text-center bg-white shadow-sm">
                    <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-sm font-display font-bold text-slate-700 mb-2">Nenhum aluno cadastrado</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">Cadastre novos alunos para liberar o acesso a cursos individuais da plataforma.</p>
                    <button 
                      onClick={handleOpenNewStudent}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-all"
                    >
                      Cadastrar Primeiro Aluno
                    </button>
                  </div>
                ) : (
                  <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                            <th className="px-6 py-4">Nome / Email</th>
                            <th className="px-6 py-4">CPF / Telefone</th>
                            <th className="px-6 py-4 text-center">Status</th>
                            <th className="px-6 py-4">Cursos Liberados</th>
                            <th className="px-6 py-4 text-right">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                          {students.map((student) => (
                            <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                              <td className="px-6 py-4">
                                <div className="font-bold text-slate-800">{student.name}</div>
                                <div className="text-xs text-slate-400 font-mono">{student.email}</div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-slate-600 font-mono text-xs">{student.cpf || "N/D"}</div>
                                <div className="text-xs text-slate-400 font-mono">{student.phone || "N/D"}</div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border shadow-sm ${
                                  student.status === 'Ativo' 
                                    ? 'bg-green-50 text-green-700 border-green-200' 
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}>
                                  {student.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 max-w-xs">
                                <div className="flex flex-wrap gap-1.5">
                                  {student.allowed_courses && student.allowed_courses.length > 0 ? (
                                    student.allowed_courses.map((courseId: string) => {
                                      const courseTitle = courses.find(c => c.id === courseId)?.title || courseId;
                                      return (
                                        <span key={courseId} className="inline-flex items-center bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded text-[10px] font-sans font-bold" title={courseTitle}>
                                          {courses.find(c => c.id === courseId)?.institution || 'CURSO'} - {courses.find(c => c.id === courseId)?.year || ''}
                                        </span>
                                      );
                                    })
                                  ) : (
                                    <span className="text-slate-400 text-xs italic">Nenhum curso liberado</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-right whitespace-nowrap">
                                <div className="flex justify-end space-x-2">
                                  <button 
                                    onClick={() => handleOpenEditStudent(student)}
                                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer border-none bg-transparent"
                                    title="Editar Aluno"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteStudentClick(student.id)}
                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer border-none bg-transparent"
                                    title="Excluir Aluno"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "metricas" && (
              <StudentMetricsManager 
                students={students} 
                loading={loadingStudents} 
                courses={courses}
                globalExams={globalExams}
              />
            )}

            {activeTab === "suporte" && <SuporteManager />}
            
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
      {/* Student Form Modal */}
      {showStudentModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-smooth-fade">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-display font-bold text-slate-800 flex items-center space-x-2">
                <Users className="w-5 h-5 text-indigo-500" />
                <span>{editingStudent ? 'Editar Cadastro de Aluno' : 'Cadastrar Novo Aluno'}</span>
              </h3>
              <button 
                onClick={() => setShowStudentModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer border-none bg-transparent"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleSaveStudent} className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-sans font-bold text-slate-600 uppercase tracking-wider mb-2">Nome Completo *</label>
                  <input 
                    type="text" 
                    required 
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-sm font-sans"
                    placeholder="Ex: Silva"
                  />
                </div>
                <div>
                  <label className="block text-xs font-sans font-bold text-slate-600 uppercase tracking-wider mb-2">E-mail de Login *</label>
                  <input 
                    type="email" 
                    required 
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-sm font-sans"
                    placeholder="aluno@email.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-sans font-bold text-slate-600 uppercase tracking-wider mb-2">CPF</label>
                  <input 
                    type="text" 
                    value={studentCpf}
                    onChange={(e) => setStudentCpf(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-sm font-mono"
                    placeholder="000.000.000-00"
                  />
                </div>
                <div>
                  <label className="block text-xs font-sans font-bold text-slate-600 uppercase tracking-wider mb-2">Telefone</label>
                  <input 
                    type="text" 
                    value={studentPhone}
                    onChange={(e) => setStudentPhone(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-sm font-mono"
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div>
                  <label className="block text-xs font-sans font-bold text-slate-600 uppercase tracking-wider mb-2">Status da Conta</label>
                  <select 
                    value={studentStatus}
                    onChange={(e) => setStudentStatus(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-sm font-sans"
                  >
                    <option value="Ativo">Ativo</option>
                    <option value="Inativo">Inativo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-sans font-bold text-slate-600 uppercase tracking-wider mb-2">Senha de Acesso {editingStudent && "(Deixe em branco para manter a atual)"}</label>
                <input 
                  type="password" 
                  value={studentPassword}
                  onChange={(e) => setStudentPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-sm font-mono"
                  placeholder={editingStudent ? "••••••" : "Defina a senha (mínimo 6 dígitos)"}
                  minLength={6}
                  required={!editingStudent}
                />
              </div>

              <div className="border-t border-slate-100 pt-4">
                <label className="block text-xs font-sans font-bold text-slate-700 uppercase tracking-wider mb-3">Vincular Cursos Autorizados</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[200px] overflow-y-auto p-1 bg-slate-50 rounded-xl border border-slate-100">
                  {courses.length === 0 ? (
                    <div className="col-span-2 text-center text-slate-500 text-xs py-4">Nenhum curso cadastrado para vincular.</div>
                  ) : (
                    courses.map((course) => (
                      <label key={course.id} className="flex items-center space-x-3 p-2.5 bg-white hover:bg-indigo-50/30 rounded-lg border border-slate-200/80 cursor-pointer transition-colors text-xs font-sans">
                        <input 
                          type="checkbox"
                          checked={studentAllowedCourses.includes(course.id.toString())}
                          onChange={() => handleToggleCourseForStudent(course.id.toString())}
                          className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                        />
                        <div className="overflow-hidden">
                          <div className="font-bold text-slate-700 truncate">{course.title}</div>
                          <div className="text-[10px] text-slate-400 font-mono uppercase">{course.institution} • {course.year}</div>
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex space-x-3 justify-end">
                <button 
                  type="button" 
                  onClick={() => setShowStudentModal(false)}
                  className="px-5 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-50 rounded-xl border border-slate-200 cursor-pointer uppercase transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold uppercase transition-all flex items-center space-x-1.5 cursor-pointer shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Cadastro</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      </main>
    </div>
  );
}
