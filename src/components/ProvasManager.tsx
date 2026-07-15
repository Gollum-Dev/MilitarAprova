import React, { useState, useEffect } from "react";
import { FileCheck, PlusCircle, Search, Edit, Trash2, X, Save, HelpCircle } from "lucide-react";
import { supabase } from "../lib/supabase";

export function ProvasManager({ initialFilterCourseId }: { initialFilterCourseId?: string | null }) {
  const [exams, setExams] = useState<any[]>([]);
  const [filterCourseId, setFilterCourseId] = useState<string | null>(initialFilterCourseId || null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingExam, setEditingExam] = useState<any | null>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("02h 00m");
  const [status, setStatus] = useState<"aberto" | "recomendado" | "finalizado" | "bloqueado">("aberto");
  const [courseIds, setCourseIds] = useState<string[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);

  // Courses list
  const [courses, setCourses] = useState<any[]>([]);

  // Question Form Fields
  const [eqText, setEqText] = useState("");
  const [eqOptA, setEqOptA] = useState("");
  const [eqOptB, setEqOptB] = useState("");
  const [eqOptC, setEqOptC] = useState("");
  const [eqOptD, setEqOptD] = useState("");
  const [eqCorrect, setEqCorrect] = useState("A");
  const [eqExplanation, setEqExplanation] = useState("");

  const fetchExams = async () => {
    setLoading(true);
    try {
      const [examsResponse, coursesResponse] = await Promise.all([
        supabase.from('mock_simulators').select('*').order('created_at', { ascending: false }),
        supabase.from('courses').select('id, title')
      ]);
      
      if (!examsResponse.error && examsResponse.data) {
        setExams(examsResponse.data);
      }
      
      if (!coursesResponse.error && coursesResponse.data) {
        setCourses(coursesResponse.data);
      }
    } catch (err) {
      console.error("Erro ao buscar dados:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  useEffect(() => {
    setFilterCourseId(initialFilterCourseId || null);
  }, [initialFilterCourseId]);

  const handleCreateNew = () => {
    setEditingExam(null);
    setTitle("");
    setDescription("");
    setDuration("02h 00m");
    setStatus("aberto");
    setCourseIds([]);
    setQuestions([]);
    setShowForm(true);
  };

  const handleEdit = (exam: any) => {
    setEditingExam(exam);
    setTitle(exam.title);
    setDescription(exam.description || "");
    setDuration(exam.duration || "02h 00m");
    setStatus(exam.status || "aberto");
    setCourseIds(exam.course_ids || []);
    setQuestions(exam.questions || []);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta prova?")) return;
    try {
      const { error } = await supabase.from('mock_simulators').delete().eq('id', id);
      if (error) throw error;
      fetchExams();
    } catch (err) {
      console.error("Erro ao deletar prova", err);
      alert("Erro ao excluir prova.");
    }
  };

  const handleSaveExam = async () => {
    if (!title.trim()) {
      alert("Título da prova é obrigatório.");
      return;
    }

    try {
      if (editingExam) {
        const { error } = await supabase
          .from('mock_simulators')
          .update({
            title,
            description,
            duration,
            status,
            course_ids: courseIds,
            questions_count: questions.length,
            questions
          })
          .eq('id', editingExam.id);
        if (error) throw error;
      } else {
        const newId = "sim-" + Math.random().toString(36).substr(2, 9);
        const { error } = await supabase
          .from('mock_simulators')
          .insert([{
            id: newId,
            title,
            description,
            duration,
            status,
            course_ids: courseIds,
            questions_count: questions.length,
            questions
          }]);
        if (error) throw error;
      }
      setShowForm(false);
      fetchExams();
    } catch (err) {
      console.error("Erro ao salvar prova", err);
      alert("Erro ao salvar prova: " + (err.message || JSON.stringify(err)));
    }
  };

  const handleAddQuestion = () => {
    if (!eqText.trim()) {
      alert("Escreva o enunciado da questão.");
      return;
    }
    if (!eqOptA.trim() || !eqOptB.trim() || !eqOptC.trim() || !eqOptD.trim()) {
      alert("Preencha todas as alternativas A, B, C e D.");
      return;
    }

    const newQ = {
      id: "q-" + Math.random().toString(36).substr(2, 9),
      text: eqText.trim(),
      alternatives: [
        { letter: "A", text: eqOptA.trim() },
        { letter: "B", text: eqOptB.trim() },
        { letter: "C", text: eqOptC.trim() },
        { letter: "D", text: eqOptD.trim() }
      ],
      correct: eqCorrect,
      explanation: eqExplanation.trim()
    };

    setQuestions([...questions, newQ]);
    
    // Reset Q Form
    setEqText("");
    setEqOptA("");
    setEqOptB("");
    setEqOptC("");
    setEqOptD("");
    setEqCorrect("A");
    setEqExplanation("");
  };

  const handleDeleteQuestion = (qId: string) => {
    setQuestions(questions.filter(q => q.id !== qId));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-slate-200 pb-4">
        <div>
          <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">
            GERENCIADOR DE
          </span>
          <h2 className="text-xs font-mono uppercase font-bold text-slate-700 tracking-tight mt-0.5">
            Provas e Simulados
          </h2>
        </div>
        <button
          onClick={handleCreateNew}
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Nova Prova</span>
        </button>
      </div>

      {showForm ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
            <h3 className="text-sm font-bold text-slate-800">
              {editingExam ? "Editar Prova" : "Criar Nova Prova"}
            </h3>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-6 space-y-8">
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2">
                Dados Gerais
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Título da Prova</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-sm border-slate-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 p-2 border"
                    placeholder="Ex: Simulado Geral 01"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full text-sm border-slate-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 p-2 border"
                  >
                    <option value="aberto">Aberto</option>
                    <option value="recomendado">Recomendado</option>
                    <option value="finalizado">Finalizado (Correção)</option>
                    <option value="bloqueado">Bloqueado (Breve)</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-2">Vincular a Cursos (Opcional)</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto border border-slate-200 rounded-lg p-3 bg-slate-50">
                    {courses.map(c => (
                      <label key={c.id} className="flex items-center space-x-2 text-sm text-slate-700 cursor-pointer hover:bg-slate-100 p-1 rounded transition-colors">
                        <input
                          type="checkbox"
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                          checked={courseIds.includes(c.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setCourseIds([...courseIds, c.id]);
                            } else {
                              setCourseIds(courseIds.filter(id => id !== c.id));
                            }
                          }}
                        />
                        <span>{c.title}</span>
                      </label>
                    ))}
                    {courses.length === 0 && (
                      <span className="text-xs text-slate-400">Nenhum curso disponível.</span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Se nenhum curso for selecionado, a prova será Global.</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Descrição Curta</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full text-sm border-slate-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 p-2 border"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Duração Estimada</label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full text-sm border-slate-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 p-2 border"
                    placeholder="04h 00m"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Questões Cadastradas ({questions.length})
                </h4>
              </div>
              
              <div className="space-y-3">
                {questions.map((q, idx) => (
                  <div key={q.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm relative group">
                    <button 
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="font-bold text-slate-700 mb-2">Q{idx + 1}. {q.text}</div>
                    <div className="space-y-1 ml-2 text-xs">
                      {q.alternatives.map((alt: any) => (
                        <div key={alt.letter} className={q.correct === alt.letter ? "font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded" : "text-slate-600 px-2 py-0.5"}>
                          {alt.letter}) {alt.text}
                        </div>
                      ))}
                    </div>
                    {q.explanation && (
                      <div className="mt-2 bg-indigo-50/50 p-2 rounded text-indigo-800 text-xs italic border border-indigo-100">
                        <span className="font-bold">Justificativa:</span> {q.explanation}
                      </div>
                    )}
                  </div>
                ))}
                {questions.length === 0 && (
                  <div className="text-center py-6 text-slate-400 text-sm">
                    Nenhuma questão cadastrada nesta prova ainda.
                  </div>
                )}
              </div>

              {/* Add Question Form */}
              <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-xl mt-4">
                <h5 className="text-xs font-bold text-indigo-800 mb-3 flex items-center">
                  <HelpCircle className="w-4 h-4 mr-1" />
                  Adicionar Nova Questão
                </h5>
                <div className="space-y-3">
                  <div>
                    <textarea
                      value={eqText}
                      onChange={(e) => setEqText(e.target.value)}
                      placeholder="Enunciado da questão..."
                      rows={2}
                      className="w-full text-sm border-slate-200 rounded-lg p-2 border focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex space-x-2">
                      <span className="font-bold text-slate-500 mt-2">A)</span>
                      <input type="text" value={eqOptA} onChange={(e) => setEqOptA(e.target.value)} className="flex-1 text-sm border-slate-200 rounded p-1.5 border" />
                    </div>
                    <div className="flex space-x-2">
                      <span className="font-bold text-slate-500 mt-2">B)</span>
                      <input type="text" value={eqOptB} onChange={(e) => setEqOptB(e.target.value)} className="flex-1 text-sm border-slate-200 rounded p-1.5 border" />
                    </div>
                    <div className="flex space-x-2">
                      <span className="font-bold text-slate-500 mt-2">C)</span>
                      <input type="text" value={eqOptC} onChange={(e) => setEqOptC(e.target.value)} className="flex-1 text-sm border-slate-200 rounded p-1.5 border" />
                    </div>
                    <div className="flex space-x-2">
                      <span className="font-bold text-slate-500 mt-2">D)</span>
                      <input type="text" value={eqOptD} onChange={(e) => setEqOptD(e.target.value)} className="flex-1 text-sm border-slate-200 rounded p-1.5 border" />
                    </div>
                  </div>
                  <div>
                    <textarea
                      value={eqExplanation}
                      onChange={(e) => setEqExplanation(e.target.value)}
                      placeholder="Justificativa da resposta correta (opcional)..."
                      rows={2}
                      className="w-full text-sm border-slate-200 rounded-lg p-2 border focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center space-x-2">
                      <label className="text-xs font-bold text-slate-700">Alternativa Correta:</label>
                      <select value={eqCorrect} onChange={(e) => setEqCorrect(e.target.value)} className="text-sm border-slate-200 rounded p-1.5 border">
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                      </select>
                    </div>
                    <button onClick={handleAddQuestion} className="bg-slate-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-700 transition-colors">
                      Adicionar à Prova
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="pt-6 border-t border-slate-200 flex justify-end space-x-3">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50">
                Cancelar
              </button>
              <button onClick={handleSaveExam} className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg text-sm font-bold transition-colors">
                <Save className="w-4 h-4" />
                <span>Salvar Prova Completa</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex space-x-3 items-center">
              <div className="relative w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input 
                  type="text" 
                  placeholder="Buscar provas..." 
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>
              <div className="relative">
                <select
                  value={filterCourseId || ""}
                  onChange={(e) => setFilterCourseId(e.target.value || null)}
                  className="w-48 pl-3 pr-4 py-2 border border-slate-200 rounded-lg text-xs focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white"
                >
                  <option value="">Todos os Cursos</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="text-xs text-slate-500 bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 font-semibold uppercase">ID</th>
                  <th className="px-4 py-3 font-semibold uppercase">Título</th>
                  <th className="px-4 py-3 font-semibold uppercase">Questões</th>
                  <th className="px-4 py-3 font-semibold uppercase">Status</th>
                  <th className="px-4 py-3 font-semibold uppercase text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                      Carregando provas...
                    </td>
                  </tr>
                ) : exams.filter(e => !filterCourseId || (e.course_ids && e.course_ids.includes(filterCourseId))).length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                      Nenhuma prova encontrada para os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  exams.filter(e => !filterCourseId || (e.course_ids && e.course_ids.includes(filterCourseId))).map(exam => (
                    <tr key={exam.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-[10px] text-slate-400">
                        {exam.id}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-700">{exam.title}</div>
                        <div className="text-xs text-slate-400">{exam.description}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded font-mono text-xs font-bold">
                          {exam.questions_count || 0}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                          exam.status === 'aberto' ? 'bg-emerald-100 text-emerald-700' :
                          exam.status === 'recomendado' ? 'bg-amber-100 text-amber-700' :
                          exam.status === 'finalizado' ? 'bg-blue-100 text-blue-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {exam.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end space-x-2">
                          <button 
                            onClick={() => handleEdit(exam)}
                            className="p-1.5 bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100 transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(exam.id)}
                            className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
