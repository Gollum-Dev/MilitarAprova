import React, { useState } from 'react';
import { Users, Clock, Calendar, CheckCircle2, PlayCircle, ShieldAlert, X, ChevronRight, BookOpen, Lock, Unlock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Student } from '../lib/student';

interface StudentMetricsManagerProps {
  students: Student[];
  loading: boolean;
  courses: any[];
  globalExams?: any[];
}

export default function StudentMetricsManager({ students, loading, courses, globalExams = [] }: StudentMetricsManagerProps) {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const formatHours = (hours?: number) => {
    if (!hours) return "00h 00m";
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Nunca acessou";
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const countStatuses = (resourceStatuses?: Record<string, string>) => {
    let estudando = 0;
    let estudado = 0;
    if (resourceStatuses) {
      Object.values(resourceStatuses).forEach(status => {
        if (status === 'estudando') estudando++;
        if (status === 'estudado') estudado++;
      });
    }
    return { estudando, estudado };
  };

  const toggleStudentStatus = async (student: Student) => {
    if (!student.id) return;
    const newStatus = student.status === 'Ativo' ? 'Inativo' : 'Ativo';
    
    if (window.confirm(`Tem certeza que deseja ${newStatus === 'Ativo' ? 'desbloquear' : 'bloquear'} o acesso de ${student.name}?`)) {
      try {
        const { error } = await supabase
          .from('students')
          .update({ status: newStatus })
          .eq('id', student.id);
        
        if (error) throw error;
        
        // Update local state temporarily for UX
        student.status = newStatus;
        setSelectedStudent({...student});
        alert(`Aluno ${newStatus === 'Ativo' ? 'desbloqueado' : 'bloqueado'} com sucesso.`);
      } catch (err) {
        console.error("Erro ao alterar status do aluno", err);
        alert("Erro ao alterar status do aluno.");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="glass-panel p-8 rounded-2xl border border-slate-200 text-center bg-white shadow-sm">
        <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-sm font-display font-bold text-slate-700 mb-2">Nenhum aluno cadastrado</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">Cadastre novos alunos na aba Usuários para ver suas estatísticas.</p>
      </div>
    );
  }

  if (selectedStudent) {
    const { estudando, estudado } = countStatuses(selectedStudent.resource_statuses);
    
    // Build a lookup map for resource names from courses
    const resourceNames: Record<string, string> = {};
    courses.forEach(course => {
      course.disciplines?.forEach((d: any) => {
        d.areas?.forEach((a: any) => {
          a.contents?.forEach((c: any) => {
            c.resources?.forEach((r: any) => {
              resourceNames[r.id.toString()] = r.title;
            });
          });
        });
      });
    });

    // Map global exams
    globalExams.forEach(exam => {
      if (exam.id && exam.title) {
        resourceNames[exam.id.toString()] = "Prova: " + exam.title;
      }
    });

    const getResourceName = (id: string) => {
      if (id === 'lei-01') return 'Legislação: Art. 1º ao 4º';
      if (id === 'lei-02') return 'Legislação: Art. 5º ao 17º';
      if (id === 'lei-05') return 'Legislação: Art. 144';
      if (id.startsWith('lei-')) return 'Legislação: ' + id;
      return resourceNames[id] || id;
    };
    
    // Group studying and completed resources
    const studyingItems = Object.entries(selectedStudent.resource_statuses || {})
      .filter(([_, status]) => status === 'estudando')
      .map(([id]) => getResourceName(id));
      
    const completedItems = (selectedStudent.completed_resources || []).map(id => getResourceName(id));

    return (
      <div className="space-y-6 animate-smooth-fade">
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setSelectedStudent(null)}
              className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-lg font-display font-bold text-slate-800">{selectedStudent.name}</h2>
              <p className="text-xs text-slate-500 font-mono">{selectedStudent.email} • CPF: {selectedStudent.cpf || 'N/D'}</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={() => toggleStudentStatus(selectedStudent)}
              className={`px-4 py-2 flex items-center space-x-2 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer shadow-sm ${
                selectedStudent.status === 'Ativo' 
                  ? 'bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100'
                  : 'bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              {selectedStudent.status === 'Ativo' ? (
                <><Lock className="w-4 h-4" /> <span>Bloquear Acesso</span></>
              ) : (
                <><Unlock className="w-4 h-4" /> <span>Desbloquear</span></>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glass-panel p-5 rounded-xl border border-slate-200/60 bg-white">
            <div className="flex items-center space-x-3 mb-2">
              <Calendar className="w-4 h-4 text-indigo-500" />
              <h4 className="text-[10px] font-bold text-slate-500 uppercase">Último Acesso</h4>
            </div>
            <p className="text-sm font-bold text-slate-800">{formatDate(selectedStudent.last_login)}</p>
          </div>
          
          <div className="glass-panel p-5 rounded-xl border border-slate-200/60 bg-white">
            <div className="flex items-center space-x-3 mb-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <h4 className="text-[10px] font-bold text-slate-500 uppercase">Tempo de Estudo</h4>
            </div>
            <p className="text-sm font-bold text-slate-800">{formatHours(selectedStudent.study_hours)}</p>
          </div>

          <div className="glass-panel p-5 rounded-xl border border-slate-200/60 bg-white">
            <div className="flex items-center space-x-3 mb-2">
              <PlayCircle className="w-4 h-4 text-blue-500" />
              <h4 className="text-[10px] font-bold text-slate-500 uppercase">Em Andamento</h4>
            </div>
            <p className="text-sm font-bold text-slate-800">{estudando} matérias</p>
          </div>

          <div className="glass-panel p-5 rounded-xl border border-slate-200/60 bg-white">
            <div className="flex items-center space-x-3 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <h4 className="text-[10px] font-bold text-slate-500 uppercase">Concluídas</h4>
            </div>
            <p className="text-sm font-bold text-slate-800">{estudado} matérias</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Estudando */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white">
            <h3 className="text-sm font-display font-bold text-slate-800 mb-4 flex items-center space-x-2">
              <PlayCircle className="w-5 h-5 text-blue-500" />
              <span>Matérias em Andamento ({studyingItems.length})</span>
            </h3>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {studyingItems.length > 0 ? studyingItems.map((id, index) => (
                <div key={index} className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-700 font-mono">
                  {id}
                </div>
              )) : (
                <p className="text-xs text-slate-400 italic">Nenhuma matéria em andamento.</p>
              )}
            </div>
          </div>

          {/* Concluidas */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white">
            <h3 className="text-sm font-display font-bold text-slate-800 mb-4 flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span>Matérias Concluídas ({completedItems.length})</span>
            </h3>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {completedItems.length > 0 ? completedItems.map((id, index) => (
                <div key={index} className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100/50 text-xs text-slate-700 font-mono">
                  {id}
                </div>
              )) : (
                <p className="text-xs text-slate-400 italic">Nenhuma matéria concluída.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-smooth-fade">
      <div className="flex justify-between items-center border-b border-slate-200 pb-4">
        <div>
          <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">
            Monitoramento
          </span>
          <h2 className="text-xs font-mono uppercase font-bold text-slate-700 tracking-tight mt-0.5">
            Estatísticas de Alunos
          </h2>
        </div>
      </div>

      <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                <th className="px-6 py-4">Aluno</th>
                <th className="px-6 py-4">Último Acesso</th>
                <th className="px-6 py-4">Tempo de Estudo</th>
                <th className="px-6 py-4">Progresso</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {students.map((student) => {
                const { estudando, estudado } = countStatuses(student.resource_statuses);
                
                return (
                  <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{student.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{student.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-slate-600">{formatDate(student.last_login)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-bold text-indigo-600">{formatHours(student.study_hours)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-3 text-xs">
                        <span className="flex items-center space-x-1 text-blue-600" title="Matérias em andamento">
                          <PlayCircle className="w-3 h-3" /> <span>{estudando}</span>
                        </span>
                        <span className="flex items-center space-x-1 text-emerald-600" title="Matérias concluídas">
                          <CheckCircle2 className="w-3 h-3" /> <span>{estudado}</span>
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border shadow-sm ${
                        student.status === 'Ativo' 
                          ? 'bg-green-50 text-green-700 border-green-200' 
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {student.status || 'Ativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button 
                        onClick={() => setSelectedStudent(student)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1 ml-auto"
                      >
                        <span>Detalhes</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
