import React, { useState } from "react";
import { BookOpen, X, Save, PlusCircle, Trash2, ChevronDown, ChevronUp, Video, Headphones, FileText, HelpCircle, Layers, FileCheck, Eye, Edit2, ArrowLeft, FolderOpen, ChevronRight, Search, Maximize, Minimize, Presentation } from "lucide-react";
import { supabase } from '../lib/supabase';
import PdfSlidesViewer from "./PdfSlidesViewer";

export type ResourceType = 'video' | 'audio' | 'question' | 'summary' | 'flashcard' | 'pdf' | 'slides';

export interface Resource {
  id: number;
  type: ResourceType;
  title: string;
  url: string;
}

export interface Content {
  id: number;
  name: string;
  resources: Resource[];
}

export interface Area {
  id: number;
  name: string;
  contents: Content[];
}

export interface Discipline {
  id: number;
  name: string;
  areas: Area[];
}

export interface CourseData {
  id: number;
  title: string;
  institution: string;
  year: string;
  status: string;
  cover_url?: string;
  description?: string;
  disciplines?: Discipline[];
}

interface CourseEditorProps {
  course: CourseData;
  institutions: string[];
  onSave: (updatedCourse: CourseData, closeEditor?: boolean) => void;
  onCancel: () => void;
  mode?: 'basic' | 'curriculum' | 'all';
}

export default function CourseEditor({ course, institutions, onSave, onCancel, mode = 'all' }: CourseEditorProps) {
  const [title, setTitle] = useState(course.title);
  const [institution, setInstitution] = useState(course.institution);
  const [year, setYear] = useState(course.year);
  const [coverUrl, setCoverUrl] = useState(course.cover_url || "");
  const [description, setDescription] = useState(course.description || "");
  const [disciplines, setDisciplines] = useState<Discipline[]>(course.disciplines || []);
  
  // Auto-save geral com debounce
  const initialMount = React.useRef(true);
  React.useEffect(() => {
    if (initialMount.current) {
      initialMount.current = false;
      return;
    }
    const timeoutId = setTimeout(() => {
      onSave({
        ...course,
        title,
        institution,
        year,
        cover_url: coverUrl,
        description,
        disciplines
      }, false); // <== IMPORTANTE: não fechar o editor no auto-save
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [title, institution, year, coverUrl, description, disciplines]);
  
  // UI States (Focus Navigation)
  const [activeDisciplineId, setActiveDisciplineId] = useState<number | null>(null);
  const [activeAreaId, setActiveAreaId] = useState<number | null>(null);
  const [activeContentId, setActiveContentId] = useState<number | null>(null);

  // States para o Modal de Matérias globais
  const [showMateriaModal, setShowMateriaModal] = useState(false);
  const [globalMaterias, setGlobalMaterias] = useState<{id: string, name: string, resources?: Resource[]}[]>([]);
  const [loadingMaterias, setLoadingMaterias] = useState(false);
  const [materiaSearchTerm, setMateriaSearchTerm] = useState('');
  const [targetEixoParaMateria, setTargetEixoParaMateria] = useState<{disciplineId: number, areaId: number} | null>(null);

  // Resource Form & Tab States
  const [selectedResourceType, setSelectedResourceType] = useState<ResourceType>('video');
  const [activeResourceTab, setActiveResourceTab] = useState<{ [contentId: number]: ResourceType | null }>({});
  const [addingResourceToContent, setAddingResourceToContent] = useState<number | null>(null);
  const [editingResourceId, setEditingResourceId] = useState<number | null>(null);
  const [newResourceType, setNewResourceType] = useState<ResourceType>('video');
  const [newResourceTitle, setNewResourceTitle] = useState("");
  const [newResourceUrl, setNewResourceUrl] = useState("");

  // Question Builder States
  const [questionText, setQuestionText] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("A");
  const [justification, setJustification] = useState("");

  // Question Preview States
  const [previewQuestion, setPreviewQuestion] = useState<any | null>(null);
  const [previewSelectedOption, setPreviewSelectedOption] = useState<string | null>(null);
  const [previewIsAnswered, setPreviewIsAnswered] = useState(false);

  // Flashcard States & Preview States
  const [flashcardQuestion, setFlashcardQuestion] = useState("");
  const [flashcardAnswer, setFlashcardAnswer] = useState("");
  const [previewFlashcard, setPreviewFlashcard] = useState<any | null>(null);
  const [isFlashcardFlipped, setIsFlashcardFlipped] = useState(false);

  // Summary States & Preview States
  const [summaryText, setSummaryText] = useState("");
  const [previewSummary, setPreviewSummary] = useState<any | null>(null);

  // PDF Preview States
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);
  const [previewPdfTitle, setPreviewPdfTitle] = useState<string>("");
  const [isPdfMaximized, setIsPdfMaximized] = useState(false);
  const [previewPdfType, setPreviewPdfType] = useState<"pdf" | "slides" | null>(null);

  // Audio Preview States
  const [previewAudioUrl, setPreviewAudioUrl] = useState<string | null>(null);
  const [previewAudioTitle, setPreviewAudioTitle] = useState<string>("");

  // Video Preview States
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);
  const [previewVideoTitle, setPreviewVideoTitle] = useState<string>("");

  const toggleResourceTab = (contentId: number, type: ResourceType) => {
    setActiveResourceTab(prev => ({
      ...prev,
      [contentId]: prev[contentId] === type ? null : type
    }));
    if (addingResourceToContent === contentId) {
      setAddingResourceToContent(null);
      setEditingResourceId(null);
    }
  };

  const handleStartAddResource = (contentId: number, type: ResourceType) => {
    setAddingResourceToContent(contentId);
    setEditingResourceId(null);
    setNewResourceType(type);
    setNewResourceTitle("");
    setNewResourceUrl("");
  };

  const handleEditResource = (contentId: number, resource: any) => {
    setAddingResourceToContent(contentId);
    setEditingResourceId(resource.id);
    setNewResourceType(resource.type);
    setNewResourceTitle(resource.title);
    setNewResourceUrl(resource.url || "");
    if (resource.type === 'question') {
      setQuestionText(resource.questionText || "");
      setOptionA(resource.options?.[0]?.text || "");
      setOptionB(resource.options?.[1]?.text || "");
      setOptionC(resource.options?.[2]?.text || "");
      setOptionD(resource.options?.[3]?.text || "");
      setCorrectAnswer(resource.correctAnswer || "A");
      setJustification(resource.justification || "");
    }
    if (resource.type === 'flashcard') {
      setFlashcardQuestion(resource.flashcardQuestion || "");
      setFlashcardAnswer(resource.flashcardAnswer || "");
    }
    if (resource.type === 'summary') {
      setSummaryText(resource.summaryText || "");
    }
  };

  const handleAddDiscipline = () => {
    const name = window.prompt("Nome da nova Disciplina (Ex: Direito Constitucional):");
    if (name && name.trim()) {
      const newId = Date.now();
      setDisciplines([...disciplines, { id: newId, name: name.trim(), areas: [] }]);
    }
  };

  const handleDeleteDiscipline = (id: number) => {
    if (window.confirm("Excluir esta disciplina e todas as suas matérias?")) {
      setDisciplines(disciplines.filter(d => d.id !== id));
      if (activeDisciplineId === id) {
        setActiveDisciplineId(null);
        setActiveAreaId(null);
      }
    }
  };

  const handleAddArea = (disciplineId: number) => {
    const name = window.prompt("Nome do novo Eixo Temático / Área (Ex: Conhecimentos Básicos):");
    if (name && name.trim()) {
      const newId = Date.now();
      setDisciplines(disciplines.map(d => {
        if (d.id === disciplineId) {
          return { ...d, areas: [...d.areas, { id: newId, name: name.trim(), contents: [] }] };
        }
        return d;
      }));
      setActiveAreaId(newId);
      setActiveContentId(null);
    }
  };

  const handleDeleteArea = (disciplineId: number, areaId: number) => {
    if (window.confirm("Excluir esta área e todos os seus conteúdos?")) {
      setDisciplines(disciplines.map(d => {
        if (d.id === disciplineId) {
          return {
            ...d,
            areas: d.areas.filter(a => a.id !== areaId)
          };
        }
        return d;
      }));
    }
  };

  const handleAddContent = async (disciplineId: number, areaId: number) => {
    const targetDiscipline = disciplines.find(d => d.id === disciplineId);
    const targetArea = targetDiscipline?.areas.find(a => a.id === areaId);

    if (!targetDiscipline || !targetArea) {
      alert("Erro interno: Disciplina ou Eixo não encontrado na estrutura atual.");
      return;
    }

    try {
      setLoadingMaterias(true);
      const { data, error } = await supabase
        .from('materias')
        .select('id, name, resources')
        .eq('discipline', targetDiscipline.name)
        .eq('area', targetArea.name)
        .order('name', { ascending: true });
        
      if (error) {
        alert(`Erro do Supabase ao buscar matérias: ${error.message}`);
        setLoadingMaterias(false);
        return;
      }
      
      if (!data || data.length === 0) {
        alert(`Nenhuma matéria cadastrada no banco global para a disciplina "${targetDiscipline.name}" no eixo "${targetArea.name}". Vá até a aba 'Gerenciar Matérias' e cadastre-as primeiro. Atenção: o nome digitado aqui deve ser exatamente igual ao cadastrado lá.`);
        setLoadingMaterias(false);
        return;
      }

      setGlobalMaterias(data);
      setTargetEixoParaMateria({ disciplineId, areaId });
      setShowMateriaModal(true);
      setLoadingMaterias(false);
    } catch (err: any) {
      alert(`Erro inesperado: ${err.message}`);
      setLoadingMaterias(false);
    }
  };

  const confirmAddMateria = (globalId: string, materiaName: string, resources: Resource[] = []) => {
    if (!targetEixoParaMateria) return;
    const { disciplineId, areaId } = targetEixoParaMateria;
    
    setDisciplines(disciplines.map(d => {
      if (d.id === disciplineId) {
        return {
          ...d,
          areas: d.areas.map(a => {
            if (a.id === areaId) {
              if (a.contents.some(c => c.name === materiaName)) {
                alert("Esta matéria já está vinculada a este eixo.");
                return a;
              }
              return {
                ...a,
                contents: [...a.contents, { id: Date.now(), globalId, name: materiaName, resources: resources || [] }]
              };
            }
            return a;
          })
        };
      }
      return d;
    }));
    setShowMateriaModal(false);
    setTargetEixoParaMateria(null);
    setMateriaSearchTerm('');
  };

  const handleDeleteContent = (disciplineId: number, areaId: number, contentId: number) => {
    if (window.confirm("Excluir esta matéria/conteúdo?")) {
      setDisciplines(disciplines.map(d => {
        if (d.id === disciplineId) {
          return {
            ...d,
            areas: d.areas.map(a => {
              if (a.id === areaId) {
                return {
                  ...a,
                  contents: a.contents.filter(c => c.id !== contentId)
                };
              }
              return a;
            })
          };
        }
        return d;
      }));
    }
  };

  const updateGlobalMateriaResources = async (globalId: string | undefined, disciplineName: string, areaName: string, materiaName: string, updatedResources: Resource[]) => {
    try {
      let query = supabase.from('materias').update({ resources: updatedResources });
      if (globalId) {
        query = query.eq('id', globalId);
      } else {
        query = query.eq('name', materiaName)
          .eq('discipline', disciplineName)
          .eq('area', areaName);
      }
      const { error } = await query;
      if (error) {
        console.error("Erro ao sincronizar matéria global:", error);
      }
    } catch (err) {
      console.error("Erro ao sincronizar matéria global:", err);
    }
  };

  const handleSaveResource = (disciplineId: number, areaId: number, contentId: number) => {
    if (!newResourceTitle.trim()) {
      alert("Por favor, preencha o Título para salvar o recurso.");
      return;
    }

    let resourcePayload: any = {
      id: editingResourceId || Date.now(),
      type: newResourceType,
      title: newResourceTitle.trim(),
      url: (newResourceType === 'question' || newResourceType === 'flashcard' || newResourceType === 'summary') ? '#' : newResourceUrl.trim()
    };

    if (newResourceType === 'question') {
      if (!questionText.trim() || !optionA.trim() || !optionB.trim() || !optionC.trim() || !optionD.trim()) {
        alert("Preencha o enunciado e as 4 opções da questão.");
        return;
      }
      resourcePayload.questionText = questionText.trim();
      resourcePayload.options = [
        { letter: 'A', text: optionA.trim() },
        { letter: 'B', text: optionB.trim() },
        { letter: 'C', text: optionC.trim() },
        { letter: 'D', text: optionD.trim() }
      ];
      resourcePayload.correctAnswer = correctAnswer;
      resourcePayload.justification = justification.trim();
    } else if (newResourceType === 'flashcard') {
      if (!flashcardQuestion.trim() || !flashcardAnswer.trim()) {
        alert("Preencha a pergunta e a resposta do flashcard.");
        return;
      }
      resourcePayload.flashcardQuestion = flashcardQuestion.trim();
      resourcePayload.flashcardAnswer = flashcardAnswer.trim();
    } else if (newResourceType === 'summary') {
      if (!summaryText.trim()) {
        alert("Preencha o texto do resumo.");
        return;
      }
      resourcePayload.summaryText = summaryText.trim();
    } else {
      if (!newResourceUrl.trim()) {
        alert("Por favor, preencha o Link.");
        return;
      }
    }

    let disciplineName = "";
    let areaName = "";
    let contentName = "";
    let globalId: string | undefined = undefined;
    let updatedResourcesList: Resource[] = [];

    const updatedDisciplines = disciplines.map(d => {
      if (d.id === disciplineId) {
        disciplineName = d.name;
        return {
          ...d,
          areas: d.areas.map(a => {
            if (a.id === areaId) {
              areaName = a.name;
              return {
                ...a,
                contents: a.contents.map(c => {
                  if (c.id === contentId) {
                    contentName = c.name;
                    globalId = (c as any).globalId;
                    let updatedResources = c.resources || [];
                    if (editingResourceId) {
                      updatedResources = updatedResources.map(r => 
                        r.id === editingResourceId ? resourcePayload : r
                      );
                    } else {
                      updatedResources = [...updatedResources, resourcePayload];
                    }
                    updatedResourcesList = updatedResources;
                    return {
                      ...c,
                      resources: updatedResources
                    };
                  }
                  return c;
                })
              };
            }
            return a;
          })
        };
      }
      return d;
    });

    setDisciplines(updatedDisciplines);

    // Sincronizar com matérias globais
    if (disciplineName && areaName && contentName) {
      updateGlobalMateriaResources(globalId, disciplineName, areaName, contentName, updatedResourcesList);
    }

    setAddingResourceToContent(null);
    setEditingResourceId(null);
    setNewResourceTitle("");
    setNewResourceUrl("");
    setNewResourceType('video');
  };

  const handleDeleteResource = (disciplineId: number, areaId: number, contentId: number, resourceId: number) => {
    if (window.confirm("Excluir este recurso?")) {
      let disciplineName = "";
      let areaName = "";
      let contentName = "";
      let globalId: string | undefined = undefined;
      let updatedResourcesList: Resource[] = [];

      const updatedDisciplines = disciplines.map(d => {
        if (d.id === disciplineId) {
          disciplineName = d.name;
          return {
            ...d,
            areas: d.areas.map(a => {
              if (a.id === areaId) {
                areaName = a.name;
                return {
                  ...a,
                  contents: a.contents.map(c => {
                    if (c.id === contentId) {
                      contentName = c.name;
                      globalId = (c as any).globalId;
                      const filtered = (c.resources || []).filter(r => r.id !== resourceId);
                      updatedResourcesList = filtered;
                      return {
                        ...c,
                        resources: filtered
                      };
                    }
                    return c;
                  })
                };
              }
              return a;
            })
          };
        }
        return d;
      });

      setDisciplines(updatedDisciplines);

      // Sincronizar com matérias globais
      if (disciplineName && areaName && contentName) {
        updateGlobalMateriaResources(globalId, disciplineName, areaName, contentName, updatedResourcesList);
      }
    }
  };

  const getResourceIcon = (type: ResourceType, className = "w-4 h-4") => {
    switch(type) {
      case 'video': return <Video className={className} />;
      case 'audio': return <Headphones className={className} />;
      case 'pdf': return <FileText className={className} />;
      case 'slides': return <Presentation className={className} />;
      case 'summary': return <FileCheck className={className} />;
      case 'flashcard': return <Layers className={className} />;
      case 'question': return <HelpCircle className={className} />;
      default: return <FileText className={className} />;
    }
  };

  const handleCancel = () => {
    const hasUnsavedChanges = 
      title !== course.title || 
      institution !== course.institution || 
      year !== course.year || 
      coverUrl !== (course.cover_url || "") ||
      description !== (course.description || "") ||
      JSON.stringify(disciplines) !== JSON.stringify(course.disciplines || []);

    if (hasUnsavedChanges) {
      if (!window.confirm("Você tem alterações não salvas. Tem certeza que deseja sair sem salvar?")) {
        return;
      }
    }
    onCancel();
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...course,
      title,
      institution,
      year,
      cover_url: coverUrl,
      description,
      disciplines
    });
  };

  return (
    <div className="animate-smooth-fade w-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-200 shrink-0">
        <h3 className="text-2xl font-display font-extrabold text-slate-800 flex flex-1 items-center space-x-3 mr-4">
          <BookOpen className="w-7 h-7 text-indigo-600 shrink-0" />
          <input 
            type="text" 
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={mode === 'curriculum'}
            placeholder="Digite o nome do curso..."
            className={`w-full bg-transparent border-none outline-none focus:ring-0 p-0 m-0 ${mode === 'curriculum' ? 'opacity-70 cursor-not-allowed' : ''}`}
            form="course-editor-form"
          />
        </h3>
        <button 
          onClick={handleCancel}
          className="group px-5 py-2.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-100 hover:border-indigo-600 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md flex items-center space-x-2 relative overflow-hidden"
        >
          <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
          <span>Voltar para Cursos</span>
        </button>
      </div>
      
      {/* Body */}
      <div className="relative z-0">
        <form id="course-editor-form" onSubmit={handleSave} className="space-y-8 max-w-7xl w-full mx-auto pb-10">

          {/* Dados Básicos (apenas se mode !== 'curriculum') */}
          {mode !== 'curriculum' && (
            <section className="bg-white p-6 rounded-2xl border border-slate-200 mb-8 shadow-sm">
              <h4 className="text-sm font-bold font-sans text-slate-800 uppercase tracking-wider mb-4">Dados Básicos</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Instituição</label>
                  <select
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="">Selecione...</option>
                    {institutions.map(inst => (
                      <option key={inst} value={inst}>{inst}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Ano</label>
                  <input
                    type="text"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    placeholder="Ex: 2024"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-6 mt-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">URL da Imagem de Capa</label>
                  <input
                    type="url"
                    value={coverUrl}
                    onChange={(e) => setCoverUrl(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    placeholder="https://exemplo.com/imagem.jpg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Descrição do Curso</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
                    placeholder="Descreva os detalhes e objetivos do curso..."
                  />
                </div>
              </div>
            </section>
          )}

          {/* Estrutura Curricular */}
          {mode !== 'basic' && (
          <section>

            {(() => {
              const activeDiscipline = disciplines.find(d => d.id === activeDisciplineId);
              const activeArea = activeDiscipline?.areas.find(a => a.id === activeAreaId);
              const activeContent = activeArea?.contents.find(c => c.id === activeContentId);

              return (
                <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                  {/* Breadcrumb Navigation */}
                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-6">
                    <span 
                      className={`flex items-center space-x-1 ${activeDiscipline ? 'hover:text-indigo-600 cursor-pointer transition-colors' : 'text-indigo-600'}`}
                      onClick={() => { setActiveDisciplineId(null); setActiveAreaId(null); setActiveContentId(null); }}
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Disciplinas</span>
                    </span>
                    {activeDiscipline && (
                      <>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                        <span 
                          className={`flex items-center space-x-1 ${activeArea ? 'hover:text-indigo-600 cursor-pointer transition-colors' : 'text-indigo-600'}`}
                          onClick={() => { setActiveAreaId(null); setActiveContentId(null); }}
                        >
                          <FolderOpen className="w-3.5 h-3.5" />
                          <span>{activeDiscipline.name}</span>
                        </span>
                      </>
                    )}
                    {activeArea && (
                      <>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                        <span 
                          className={`flex items-center space-x-1 ${activeContent ? 'hover:text-indigo-600 cursor-pointer transition-colors' : 'text-indigo-600'}`}
                          onClick={() => setActiveContentId(null)}
                        >
                          <Layers className="w-3.5 h-3.5" />
                          <span>{activeArea.name}</span>
                        </span>
                      </>
                    )}
                    {activeContent && (
                      <>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                        <span className="flex items-center space-x-1 text-indigo-600">
                          <FileText className="w-3.5 h-3.5" />
                          <span>{activeContent.name}</span>
                        </span>
                      </>
                    )}
                    {(activeDiscipline || activeArea || activeContent) && (
                      <div className="ml-auto">
                        <button
                          type="button"
                          onClick={() => {
                            if (activeContent) setActiveContentId(null);
                            else if (activeArea) setActiveAreaId(null);
                            else if (activeDiscipline) setActiveDisciplineId(null);
                          }}
                          className="group p-2 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-100 hover:border-indigo-600 rounded-lg transition-all duration-300 cursor-pointer shadow-sm hover:shadow flex items-center justify-center"
                          title="Voltar um nível"
                        >
                          <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Level 0: Disciplinas */}
                  {!activeDiscipline && (
                    <div>
                      <div className="flex justify-end mb-4">
                        <button 
                          type="button"
                          onClick={handleAddDiscipline}
                          className="group px-5 py-2.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-100 hover:border-indigo-600 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md flex items-center space-x-2 relative overflow-hidden"
                        >
                          <PlusCircle className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />
                          <span>Nova Disciplina</span>
                        </button>
                      </div>
                      {disciplines.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-white">
                          <p className="text-slate-500 font-medium">Nenhuma disciplina cadastrada.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {disciplines.map(discipline => (
                            <div key={discipline.id} className="glass-panel p-5 rounded-2xl border border-slate-200/60 flex flex-col justify-between h-auto group hover:border-indigo-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden bg-gradient-to-br from-white to-slate-50">
                              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-full -z-10 group-hover:bg-indigo-500/10 transition-colors"></div>
                              
                              <div>
                                <div className="flex justify-between items-start mb-3">
                                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
                                    <BookOpen className="w-5 h-5" />
                                  </div>
                                  <span className="text-[9px] font-mono font-bold px-2.5 py-1 rounded-full border shadow-sm bg-slate-50 text-slate-500 border-slate-200">
                                    Disciplina
                                  </span>
                                </div>
                                <h4 className="text-base font-display font-bold text-slate-800 line-clamp-2 leading-tight mb-4 group-hover:text-indigo-700 transition-colors pr-4">{discipline.name}</h4>
                                
                                <div className="grid grid-cols-2 gap-2 mb-4 p-2.5 bg-slate-100/50 rounded-xl border border-slate-100">
                                  <div className="flex flex-col items-center justify-center text-center">
                                    <span className="text-lg font-display font-bold text-slate-700">{discipline.areas.length}</span>
                                    <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400">Eixos</span>
                                  </div>
                                  <div className="flex flex-col items-center justify-center text-center border-l border-slate-200/60">
                                    <span className="text-lg font-display font-bold text-slate-700">{discipline.areas.reduce((acc, a) => acc + a.contents.length, 0)}</span>
                                    <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400">Matérias</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex justify-between space-x-2 border-t border-slate-100/80 pt-3 mt-4 relative z-10">
                                <button
                                  type="button"
                                  onClick={() => setActiveDisciplineId(discipline.id)}
                                  className="px-3 py-1.5 text-[10px] uppercase font-bold text-indigo-600 hover:text-white hover:bg-indigo-600 rounded transition-colors flex flex-1 items-center justify-center space-x-1 cursor-pointer"
                                >
                                  <span>Gerenciar Eixos</span>
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                                <button 
                                  type="button"
                                  onClick={() => handleDeleteDiscipline(discipline.id)}
                                  className="px-3 py-1.5 text-[10px] uppercase font-bold text-rose-500 hover:text-white hover:bg-rose-500 rounded transition-colors flex items-center space-x-1 cursor-pointer"
                                  title="Excluir Disciplina"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Level 1: Eixos Temáticos */}
                  {activeDiscipline && !activeArea && (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h5 className="text-sm font-bold text-slate-700 flex items-center space-x-2">
                          <FolderOpen className="w-4 h-4 text-indigo-400" />
                          <span>Eixos Temáticos em {activeDiscipline.name}</span>
                        </h5>
                        <button 
                          type="button"
                          onClick={() => handleAddArea(activeDiscipline.id)}
                          className="group px-5 py-2.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-100 hover:border-indigo-600 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md flex items-center space-x-2 relative overflow-hidden"
                        >
                          <PlusCircle className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />
                          <span>Novo Eixo</span>
                        </button>
                      </div>
                      {activeDiscipline.areas.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-white">
                          <p className="text-slate-500 font-medium">Nenhum eixo cadastrado nesta disciplina.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {activeDiscipline.areas.map(area => (
                            <div key={area.id} className="glass-panel p-5 rounded-2xl border border-slate-200/60 flex flex-col justify-between h-auto group hover:border-indigo-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden bg-gradient-to-br from-white to-slate-50">
                              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-full -z-10 group-hover:bg-indigo-500/10 transition-colors"></div>
                              
                              <div>
                                <div className="flex justify-between items-start mb-3">
                                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
                                    <FolderOpen className="w-5 h-5" />
                                  </div>
                                  <span className="text-[9px] font-mono font-bold px-2.5 py-1 rounded-full border shadow-sm bg-slate-50 text-slate-500 border-slate-200">
                                    Eixo Temático
                                  </span>
                                </div>
                                <h4 className="text-base font-display font-bold text-slate-800 line-clamp-2 leading-tight mb-4 group-hover:text-indigo-700 transition-colors pr-4">{area.name}</h4>
                                
                                <div className="grid grid-cols-1 gap-2 mb-4 p-2.5 bg-slate-100/50 rounded-xl border border-slate-100">
                                  <div className="flex flex-col items-center justify-center text-center">
                                    <span className="text-lg font-display font-bold text-slate-700">{area.contents.length}</span>
                                    <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400">Matérias / Conteúdos</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex justify-between space-x-2 border-t border-slate-100/80 pt-3 mt-4 relative z-10">
                                <button
                                  type="button"
                                  onClick={() => setActiveAreaId(area.id)}
                                  className="px-3 py-1.5 text-[10px] uppercase font-bold text-indigo-600 hover:text-white hover:bg-indigo-600 rounded transition-colors flex flex-1 items-center justify-center space-x-1 cursor-pointer"
                                >
                                  <span>Gerenciar Matérias</span>
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                                <button 
                                  type="button"
                                  onClick={() => handleDeleteArea(activeDiscipline.id, area.id)}
                                  className="px-3 py-1.5 text-[10px] uppercase font-bold text-rose-500 hover:text-white hover:bg-rose-500 rounded transition-colors flex items-center space-x-1 cursor-pointer"
                                  title="Remover Eixo"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Level 2: Matérias/Conteúdos */}
                  {activeDiscipline && activeArea && !activeContent && (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h5 className="text-sm font-bold text-slate-700 flex items-center space-x-2">
                          <Layers className="w-4 h-4 text-indigo-400" />
                          <span>Matérias de {activeArea.name}</span>
                        </h5>
                        <button 
                          type="button"
                          onClick={() => handleAddContent(activeDiscipline.id, activeArea.id)}
                          className="group px-5 py-2.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-100 hover:border-indigo-600 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md flex items-center space-x-2 relative overflow-hidden"
                        >
                          <PlusCircle className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />
                          <span>Nova Matéria</span>
                        </button>
                      </div>
                      
                      {activeArea.contents.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-white">
                          <p className="text-slate-500 font-medium">Nenhuma matéria cadastrada neste eixo.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {activeArea.contents.map(content => (
                            <div key={content.id} className="glass-panel p-5 rounded-2xl border border-slate-200/60 flex flex-col justify-between h-auto group hover:border-indigo-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden bg-gradient-to-br from-white to-slate-50">
                              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-full -z-10 group-hover:bg-indigo-500/10 transition-colors"></div>
                              
                              <div>
                                <div className="flex justify-between items-start mb-3">
                                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
                                    <Layers className="w-5 h-5" />
                                  </div>
                                  <span className="text-[9px] font-mono font-bold px-2.5 py-1 rounded-full border shadow-sm bg-slate-50 text-slate-500 border-slate-200">
                                    Matéria
                                  </span>
                                </div>
                                <h4 className="text-base font-display font-bold text-slate-800 line-clamp-2 leading-tight mb-4 group-hover:text-indigo-700 transition-colors pr-4">{content.name}</h4>
                                
                                <div className="grid grid-cols-1 gap-2 mb-4 p-2.5 bg-slate-100/50 rounded-xl border border-slate-100">
                                  <div className="flex flex-col items-center justify-center text-center">
                                    <span className="text-lg font-display font-bold text-slate-700">{content.resources ? content.resources.length : 0}</span>
                                    <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400">Recursos Cadastrados</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex justify-between space-x-2 border-t border-slate-100/80 pt-3 mt-4 relative z-10">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveContentId(content.id);
                                    setSelectedResourceType('video');
                                    setAddingResourceToContent(null);
                                    setEditingResourceId(null);
                                  }}
                                  className="px-3 py-1.5 text-[10px] uppercase font-bold text-indigo-600 hover:text-white hover:bg-indigo-600 rounded transition-colors flex flex-1 items-center justify-center space-x-1 cursor-pointer"
                                >
                                  <span>Gerenciar Conteúdos</span>
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                                <button 
                                  type="button"
                                  onClick={() => handleDeleteContent(activeDiscipline.id, activeArea.id, content.id)}
                                  className="px-3 py-1.5 text-[10px] uppercase font-bold text-rose-500 hover:text-white hover:bg-rose-500 rounded transition-colors flex items-center space-x-1 cursor-pointer"
                                  title="Remover Matéria"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                       {/* Level 3: Recursos (Abas) */}
                  {activeDiscipline && activeArea && activeContent && (
                    <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                            <Layers className="w-5 h-5" />
                          </div>
                          <div>
                            <h5 className="font-display font-bold text-slate-800 text-lg">Conteúdos de {activeContent.name}</h5>
                            <p className="text-xs text-slate-400 mt-0.5">{activeDiscipline.name} • {activeArea.name}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveContentId(null)}
                          className="group px-4 py-2 bg-gradient-to-r from-indigo-50 to-indigo-100 hover:from-indigo-600 hover:to-violet-600 text-indigo-700 hover:text-white border border-indigo-100 hover:border-transparent rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer shadow-sm hover:shadow-[0_4px_12px_rgba(99,102,241,0.25)] flex items-center space-x-1.5 hover:-translate-y-0.5 active:scale-95"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          <span>Voltar</span>
                        </button>
                      </div>

                      <div className="flex flex-col md:flex-row gap-6 mt-6">
                        {/* Left Tab Menu */}
                        <div className="w-full md:w-1/4 space-y-2">
                          {(['video', 'audio', 'pdf', 'slides', 'summary', 'flashcard', 'question'] as ResourceType[]).map(type => {
                            const count = (activeContent.resources || []).filter(r => r.type === type).length;
                            const isActive = selectedResourceType === type;
                            return (
                              <button
                                key={type}
                                type="button"
                                onClick={() => { 
                                  setSelectedResourceType(type); 
                                  setAddingResourceToContent(null); 
                                  setEditingResourceId(null); 
                                }}
                                className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all duration-300 cursor-pointer hover:-translate-y-0.5 active:scale-[0.98] ${
                                  isActive 
                                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 border-transparent text-white shadow-[0_4px_12px_rgba(99,102,241,0.25)]' 
                                    : 'border-slate-200 bg-white hover:bg-indigo-50/50 hover:border-indigo-200/60 hover:text-indigo-700 text-slate-600 shadow-sm hover:shadow-[0_2px_8px_rgba(99,102,241,0.05)]'
                                } group`}
                              >
                                <div className="flex items-center space-x-3">
                                  {getResourceIcon(type, `w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600 transition-colors'}`)}
                                  <span className="text-xs font-bold uppercase tracking-wide">
                                    {type === 'video' ? 'Vídeos' : type === 'audio' ? 'Áudios' : type === 'pdf' ? 'PDFs' : type === 'slides' ? 'Slides' : type === 'question' ? 'Questões' : type === 'summary' ? 'Resumos' : 'Flashcards'}
                                  </span>
                                </div>
                                <span className={`w-5 h-5 rounded-md text-[10px] font-bold flex items-center justify-center transition-all ${
                                  isActive ? 'bg-indigo-700/50 text-white' : 'bg-indigo-100 text-indigo-700'
                                }}`}>
                                  {count}
                                </span>
                              </button>
                            )
                          })}
                        </div>

                        {/* Right Content Pane */}
                        <div className="flex-1 bg-slate-50/50 rounded-2xl border border-slate-100 p-6 space-y-6">
                          {/* Header and Add Button */}
                          <div className="flex justify-between items-center border-b border-slate-200/60 pb-4">
                            <div className="flex items-center space-x-2">
                              <div className="text-indigo-600">
                                {getResourceIcon(selectedResourceType, "w-5 h-5")}
                              </div>
                              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                                {selectedResourceType === 'video' ? 'Vídeos' : selectedResourceType === 'audio' ? 'Áudios' : selectedResourceType === 'pdf' ? 'PDFs' : selectedResourceType === 'slides' ? 'Slides' : selectedResourceType === 'question' ? 'Questões' : selectedResourceType === 'summary' ? 'Resumos' : 'Flashcards'} Cadastrados
                              </h4>
                            </div>
                            {addingResourceToContent !== activeContent.id && (
                              <button
                                type="button"
                                onClick={() => {
                                  setAddingResourceToContent(activeContent.id);
                                  setNewResourceType(selectedResourceType);
                                  setEditingResourceId(null);
                                  setNewResourceTitle('');
                                  setNewResourceUrl('');
                                  setQuestionText('');
                                  setOptionA('');
                                  setOptionB('');
                                  setOptionC('');
                                  setOptionD('');
                                  setCorrectAnswer('A');
                                  setJustification('');
                                  setFlashcardQuestion('');
                                  setFlashcardAnswer('');
                                  setSummaryText('');
                                }}
                                className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer shadow-[0_4px_14px_rgba(99,102,241,0.3)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.4)] hover:-translate-y-0.5 active:scale-[0.98]"
                              >
                                <PlusCircle className="w-4 h-4" />
                                <span>Adicionar</span>
                              </button>
                            )}
                          </div>

                          {/* Form Container */}
                          {addingResourceToContent === activeContent.id && (
                            <div className="bg-white p-5 rounded-xl border border-indigo-200 shadow-sm animate-smooth-fade space-y-4">
                              <div className="flex items-center space-x-2 border-b border-slate-100 pb-3 mb-3">
                                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 border border-indigo-100">
                                  {getResourceIcon(newResourceType, "w-5 h-5")}
                                </div>
                                <h6 className="text-sm font-bold text-indigo-800 uppercase tracking-wider">
                                  {editingResourceId ? 'Editar' : 'Cadastrar Novo'} {selectedResourceType === 'video' ? 'Vídeo' : selectedResourceType === 'audio' ? 'Áudio' : selectedResourceType === 'pdf' ? 'PDF' : selectedResourceType === 'slides' ? 'Slides / Apresentação' : selectedResourceType === 'question' ? 'Questão' : selectedResourceType === 'summary' ? 'Resumo' : 'Flashcard'}
                                </h6>
                              </div>
                              <div className="grid grid-cols-1 gap-4">
                                <div>
                                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Título do Recurso *</label>
                                  <input type="text" value={newResourceTitle} onChange={e => setNewResourceTitle(e.target.value)} placeholder="Ex: Aula 01 - Introdução" className="w-full p-3 text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all"/>
                                </div>
                                {newResourceType === 'question' ? (
                                  <>
                                    <div>
                                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Enunciado / Pergunta *</label>
                                      <textarea value={questionText} onChange={e => setQuestionText(e.target.value)} placeholder="Ex: Qual alternativa descreve o Art. 142 da CF?" rows={3} className="w-full p-3 text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all resize-none"/>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Opção A *</label>
                                        <input type="text" value={optionA} onChange={e => setOptionA(e.target.value)} placeholder="Texto para Opção A" className="w-full p-3 text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all"/>
                                      </div>
                                      <div>
                                        <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Opção B *</label>
                                        <input type="text" value={optionB} onChange={e => setOptionB(e.target.value)} placeholder="Texto para Opção B" className="w-full p-3 text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all"/>
                                      </div>
                                      <div>
                                        <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Opção C *</label>
                                        <input type="text" value={optionC} onChange={e => setOptionC(e.target.value)} placeholder="Texto para Opção C" className="w-full p-3 text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all"/>
                                      </div>
                                      <div>
                                        <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Opção D *</label>
                                        <input type="text" value={optionD} onChange={e => setOptionD(e.target.value)} placeholder="Texto para Opção D" className="w-full p-3 text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all"/>
                                      </div>
                                    </div>
                                    <div>
                                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Alternativa Correta *</label>
                                      <select value={correctAnswer} onChange={e => setCorrectAnswer(e.target.value)} className="w-full p-3 text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all bg-white">
                                        <option value="A">Opção A</option>
                                        <option value="B">Opção B</option>
                                        <option value="C">Opção C</option>
                                        <option value="D">Opção D</option>
                                      </select>
                                    </div>
                                    <div>
                                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Justificativa / Explicação da Resposta</label>
                                      <textarea value={justification} onChange={e => setJustification(e.target.value)} placeholder="Ex: A alternativa B é a correta pois o Art. 142 da CF dispõe que..." rows={3} className="w-full p-3 text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all resize-none"/>
                                    </div>
                                  </>
                                ) : newResourceType === 'flashcard' ? (
                                  <>
                                    <div>
                                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Pergunta / Frente do Card *</label>
                                      <textarea value={flashcardQuestion} onChange={e => setFlashcardQuestion(e.target.value)} placeholder="Ex: Qual o prazo para impetrar Mandado de Segurança?" rows={3} className="w-full p-3 text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all resize-none"/>
                                    </div>
                                    <div>
                                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Resposta / Verso do Card *</label>
                                      <textarea value={flashcardAnswer} onChange={e => setFlashcardAnswer(e.target.value)} placeholder="Ex: O prazo é de 120 dias, contados da ciência do ato impugnado." rows={3} className="w-full p-3 text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all resize-none"/>
                                    </div>
                                  </>
                                ) : newResourceType === 'summary' ? (
                                  <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Conteúdo / Texto do Resumo *</label>
                                    <textarea value={summaryText} onChange={e => setSummaryText(e.target.value)} placeholder="Digite ou cole o texto do resumo aqui..." rows={8} className="w-full p-3 text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all resize-none"/>
                                  </div>
                                ) : (
                                  <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Link (URL) *</label>
                                    <input type="url" value={newResourceUrl} onChange={e => setNewResourceUrl(e.target.value)} placeholder="https://..." className="w-full p-3 text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all"/>
                                  </div>
                                )}
                              </div>
                              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                                <button type="button" onClick={() => { setAddingResourceToContent(null); setEditingResourceId(null); }} className="px-5 py-2.5 text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer uppercase shadow-sm">Cancelar</button>
                                <button type="button" onClick={() => handleSaveResource(activeDiscipline.id, activeArea.id, activeContent.id)} className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-xl transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer uppercase shadow-[0_4px_14px_rgba(99,102,241,0.3)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.4)]">{editingResourceId ? 'Salvar Alterações' : 'Cadastrar'}</button>
                              </div>
                            </div>
                          )}

                          {/* List Container */}
                          {(() => {
                            const filteredResources = (activeContent.resources || []).filter(r => r.type === selectedResourceType);
                            if (filteredResources.length === 0) {
                              return (
                                <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-xl border border-slate-100">
                                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3 text-slate-300">
                                    {getResourceIcon(selectedResourceType, "w-6 h-6")}
                                  </div>
                                  <h4 className="text-slate-700 font-bold mb-1 text-sm">Sem conteúdos cadastrados</h4>
                                  <p className="text-xs text-slate-500 max-w-sm">
                                    Esta matéria ainda não possui {selectedResourceType === 'video' ? 'vídeos' : selectedResourceType === 'audio' ? 'áudios' : selectedResourceType === 'pdf' ? 'PDFs' : selectedResourceType === 'question' ? 'questões' : selectedResourceType === 'summary' ? 'resumos' : 'flashcards'}. Clique em Adicionar.
                                  </p>
                                </div>
                              );
                            }
                            
                            return (
                              <div className="space-y-3">
                                {filteredResources.map(resource => (
                                  <div key={resource.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm group">
                                    <div className="flex items-center space-x-4 flex-1">
                                      <div className="p-2.5 bg-slate-50 text-slate-600 rounded-lg border border-slate-100">
                                        {getResourceIcon(resource.type, "w-5 h-5")}
                                      </div>
                                      <div>
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{resource.type}</span>
                                        <h4 className="text-sm font-bold text-slate-700">{resource.title}</h4>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                      {resource.type !== 'question' && resource.type !== 'flashcard' && resource.type !== 'summary' && resource.type !== 'pdf' && resource.type !== 'audio' && resource.type !== 'video' && resource.type !== 'slides' ? (
                                        <a href={resource.url} target="_blank" rel="noreferrer" className="p-2 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-all duration-200 hover:-translate-y-0.5 active:scale-90 border border-transparent hover:border-indigo-100 shadow-sm hover:shadow" title="Visualizar">
                                          <Eye className="w-4 h-4" />
                                        </a>
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            if (resource.type === 'question') {
                                              setPreviewQuestion(resource);
                                              setPreviewSelectedOption(null);
                                              setPreviewIsAnswered(false);
                                            } else if (resource.type === 'flashcard') {
                                              setPreviewFlashcard(resource);
                                              setIsFlashcardFlipped(false);
                                            } else if (resource.type === 'summary') {
                                              setPreviewSummary(resource);
                                            } else if (resource.type === 'pdf' || resource.type === 'slides') {
                                              setPreviewPdfUrl(resource.url);
                                              setPreviewPdfTitle(resource.title);
                                              setPreviewPdfType(resource.type as any);
                                            } else if (resource.type === 'audio') {
                                              setPreviewAudioUrl(resource.url);
                                              setPreviewAudioTitle(resource.title);
                                            } else if (resource.type === 'video') {
                                              setPreviewVideoUrl(resource.url);
                                              setPreviewVideoTitle(resource.title);
                                            }
                                          }}
                                          className="p-2 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-all duration-200 hover:-translate-y-0.5 active:scale-90 border border-transparent hover:border-indigo-100 shadow-sm hover:shadow cursor-pointer"
                                          title="Visualizar"
                                        >
                                          <Eye className="w-4 h-4" />
                                        </button>
                                      )}
                                      <button 
                                        type="button"
                                        onClick={() => handleEditResource(activeContent.id, resource)} 
                                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200 hover:-translate-y-0.5 active:scale-90 border border-transparent hover:border-indigo-100 shadow-sm hover:shadow cursor-pointer"
                                        title="Editar"
                                      >
                                        <Edit2 className="w-4 h-4" />
                                      </button>
                                      <button 
                                        type="button"
                                        onClick={() => handleDeleteResource(activeDiscipline.id, activeArea.id, activeContent.id, resource.id)} 
                                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all duration-200 hover:-translate-y-0.5 active:scale-90 border border-transparent hover:border-rose-100 shadow-sm hover:shadow cursor-pointer"
                                        title="Excluir"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </section>
          )}

        </form>
      </div>

      {/* Footer removido conforme solicitado */}

      {/* Modal de Seleção de Matérias */}
      {showMateriaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-smooth-fade">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-display font-bold text-slate-800 flex items-center space-x-2">
                <Layers className="w-5 h-5 text-indigo-500" />
                <span>Adicionar Matéria ao Eixo</span>
              </h3>
              <button 
                onClick={() => { setShowMateriaModal(false); setTargetEixoParaMateria(null); }}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-4 border-b border-slate-100 bg-white shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Buscar matéria..." 
                  value={materiaSearchTerm}
                  onChange={(e) => setMateriaSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
                />
              </div>
            </div>

            <div className="overflow-y-auto p-4 flex-1 bg-slate-50">
              {loadingMaterias ? (
                <div className="py-10 flex justify-center">
                  <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="space-y-2">
                  {globalMaterias.filter(m => m.name.toLowerCase().includes(materiaSearchTerm.toLowerCase())).length === 0 ? (
                    <div className="text-center py-6 text-slate-500 text-sm">
                      Nenhuma matéria encontrada.
                    </div>
                  ) : (
                    globalMaterias
                      .filter(m => m.name.toLowerCase().includes(materiaSearchTerm.toLowerCase()))
                      .map(materia => (
                        <button
                          key={materia.id}
                          onClick={() => confirmAddMateria(materia.id, materia.name, materia.resources || [])}
                          className="w-full flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all group cursor-pointer text-left"
                        >
                          <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-700">{materia.name}</span>
                          <PlusCircle className="w-4 h-4 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Teste/Pré-visualização de Questão */}
      {previewQuestion && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-smooth-fade">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-display font-bold text-slate-800 flex items-center space-x-2">
                <HelpCircle className="w-5 h-5 text-indigo-500" />
                <span>Testar Questão: {previewQuestion.title}</span>
              </h3>
              <button 
                onClick={() => {
                  setPreviewQuestion(null);
                  setPreviewSelectedOption(null);
                  setPreviewIsAnswered(false);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              <p className="text-xs font-bold text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100 leading-relaxed">
                {previewQuestion.questionText}
              </p>

              <div className="space-y-2">
                {(previewQuestion.options || []).map((opt: any) => {
                  const isSelected = previewSelectedOption === opt.letter;
                  const isCorrect = opt.letter === previewQuestion.correctAnswer;
                  
                  let optionStyle = "border-slate-200 bg-white text-slate-700 hover:bg-slate-50";
                  
                  if (isSelected) {
                    optionStyle = "border-indigo-500 bg-indigo-50/30 text-indigo-900 font-medium";
                  }
                  
                  if (previewIsAnswered) {
                    if (isCorrect) {
                      optionStyle = "border-emerald-500 bg-emerald-50 text-emerald-800 font-medium";
                    } else if (isSelected) {
                      optionStyle = "border-rose-500 bg-rose-50 text-rose-800 font-medium";
                    } else {
                      optionStyle = "border-slate-100 bg-slate-50/40 text-slate-400 cursor-not-allowed";
                    }
                  }

                  return (
                    <button
                      key={opt.letter}
                      disabled={previewIsAnswered}
                      onClick={() => {
                        if (!previewIsAnswered) setPreviewSelectedOption(opt.letter);
                      }}
                      className={`w-full text-left p-3 border rounded-xl text-xs transition-all flex items-start space-x-3 cursor-pointer ${optionStyle}`}
                    >
                      <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-[9px] font-mono font-bold shrink-0 ${
                        isSelected 
                          ? "bg-indigo-600 border-indigo-600 text-white" 
                          : "border-slate-300 bg-slate-100 text-slate-600"
                      }`}>
                        {opt.letter}
                      </span>
                      <span className="leading-relaxed">{opt.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50 flex flex-col space-y-3">
              {previewIsAnswered && previewQuestion.justification && (
                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-900 leading-relaxed animate-smooth-fade space-y-1">
                  <strong className="block text-indigo-950 font-bold uppercase tracking-wider text-[9px] font-mono">Justificativa:</strong>
                  <p>{previewQuestion.justification}</p>
                </div>
              )}
              <div className="flex justify-between items-center w-full">
                <div>
                  {previewIsAnswered && (
                    <span className={`text-xs font-bold ${previewSelectedOption === previewQuestion.correctAnswer ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {previewSelectedOption === previewQuestion.correctAnswer ? 'Resposta Correta! Parabéns.' : `Resposta Incorreta. (Gabarito: ${previewQuestion.correctAnswer})`}
                    </span>
                  )}
                </div>
                <div className="flex space-x-2">
                  {!previewIsAnswered ? (
                    <button 
                      disabled={!previewSelectedOption}
                      onClick={() => setPreviewIsAnswered(true)}
                      className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 rounded-xl transition-all duration-200 cursor-pointer shadow-sm"
                    >
                      Verificar
                    </button>
                  ) : (
                    <button 
                      onClick={() => {
                        setPreviewSelectedOption(null);
                        setPreviewIsAnswered(false);
                      }}
                      className="px-4 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all duration-200 cursor-pointer"
                    >
                      Tentar Novamente
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modal de Teste/Pré-visualização de Flashcard */}
      {previewFlashcard && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-smooth-fade">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-display font-bold text-slate-800 flex items-center space-x-2">
                <FileCheck className="w-5 h-5 text-indigo-500" />
                <span>Testar Flashcard: {previewFlashcard.title}</span>
              </h3>
              <button 
                onClick={() => setPreviewFlashcard(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-8 flex flex-col items-center justify-center min-h-[250px] bg-slate-50/50 perspective-1000">
              {/* Premium flipping card */}
              <div 
                onClick={() => setIsFlashcardFlipped(!isFlashcardFlipped)}
                className="w-full max-w-sm h-48 bg-white border border-slate-200 rounded-2xl shadow-md p-6 flex flex-col justify-between items-center text-center cursor-pointer select-none transition-transform duration-500 transform hover:shadow-lg relative"
                style={{
                  transform: isFlashcardFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  transformStyle: 'preserve-3d',
                  transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                {!isFlashcardFlipped ? (
                  /* Front Side */
                  <div className="flex flex-col justify-between h-full w-full backface-hidden">
                    <span className="text-[9px] font-mono font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded uppercase tracking-wider self-center">FRENTE / PERGUNTA</span>
                    <p className="text-xs font-bold text-slate-800 leading-relaxed px-2 flex-1 flex items-center justify-center">
                      {previewFlashcard.flashcardQuestion}
                    </p>
                    <span className="text-[10px] text-slate-400 font-medium">Clique no card para ver a resposta</span>
                  </div>
                ) : (
                  /* Back Side */
                  <div className="flex flex-col justify-between h-full w-full backface-hidden" style={{ transform: 'rotateY(180deg)' }}>
                    <span className="text-[9px] font-mono font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded uppercase tracking-wider self-center">VERSO / RESPOSTA</span>
                    <p className="text-xs font-bold text-slate-700 leading-relaxed px-2 flex-1 flex items-center justify-center overflow-y-auto">
                      {previewFlashcard.flashcardAnswer}
                    </p>
                    <span className="text-[10px] text-slate-400 font-medium">Clique no card para ver a pergunta</span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button 
                onClick={() => setIsFlashcardFlipped(!isFlashcardFlipped)}
                className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all duration-200 cursor-pointer shadow-sm"
              >
                {isFlashcardFlipped ? 'Ver Pergunta' : 'Ver Resposta'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal de Teste/Pré-visualização de Resumo */}
      {previewSummary && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-smooth-fade">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
              <h3 className="font-display font-bold text-slate-800 flex items-center space-x-2">
                <FileText className="w-5 h-5 text-indigo-500" />
                <span>Visualizar Resumo: {previewSummary.title}</span>
              </h3>
              <button 
                onClick={() => setPreviewSummary(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto bg-slate-50 flex-1">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm leading-relaxed text-xs text-slate-700 space-y-4 whitespace-pre-wrap font-sans">
                {previewSummary.summaryText}
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end shrink-0">
              <button 
                onClick={() => setPreviewSummary(null)}
                className="px-5 py-2.5 text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer uppercase shadow-sm"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Teste/Pré-visualização de PDF/Slides Seguro */}
      {previewPdfUrl && (
        <PdfSlidesViewer
          pdfUrl={previewPdfUrl}
          title={previewPdfTitle}
          onClose={() => {
            setPreviewPdfUrl(null);
            setIsPdfMaximized(false);
            setPreviewPdfType(null);
          }}
          isMaximized={isPdfMaximized}
          onToggleMaximize={() => setIsPdfMaximized(!isPdfMaximized)}
          initialMode={previewPdfType === "slides" ? "slides" : "scroll"}
          hideModeToggle={previewPdfType === "pdf"}
        />
      )}

      {/* Modal de Teste/Pré-visualização de Áudio Seguro */}
      {previewAudioUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-smooth-fade">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
              <h3 className="font-display font-bold text-slate-800 flex items-center space-x-2">
                <Headphones className="w-5 h-5 text-indigo-500" />
                <span>Player de Áudio Seguro: {previewAudioTitle}</span>
              </h3>
              <button 
                onClick={() => setPreviewAudioUrl(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer border-none bg-transparent"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-8 bg-slate-50 flex flex-col items-center justify-center min-h-[160px]">
              <div className="w-full h-14 relative overflow-hidden rounded-xl border border-slate-200 shadow-sm bg-white">
                <iframe 
                  src={(() => {
                    if (!previewAudioUrl) return '';
                    if (previewAudioUrl.includes('drive.google.com')) {
                      const match = previewAudioUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
                      if (match && match[1]) {
                        return `https://drive.google.com/file/d/${match[1]}/preview`;
                      }
                    }
                    return previewAudioUrl;
                  })()}
                  className="w-full h-full border-none"
                  title={previewAudioTitle}
                />
                {/* Bloqueio físico transparente sobre o botão de pop-out/open in new window no canto superior/direito */}
                <div className="absolute top-0 right-0 w-16 h-full bg-transparent cursor-default" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Teste/Pré-visualização de Vídeo Seguro */}
      {previewVideoUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-smooth-fade">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl h-[75vh] overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
              <h3 className="font-display font-bold text-slate-800 flex items-center space-x-2">
                <Video className="w-5 h-5 text-indigo-500" />
                <span>Player de Vídeo Seguro: {previewVideoTitle}</span>
              </h3>
              <button 
                onClick={() => setPreviewVideoUrl(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer border-none bg-transparent"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex-1 bg-black relative overflow-hidden">
              <iframe 
                src={(() => {
                  if (!previewVideoUrl) return '';
                  if (previewVideoUrl.includes('drive.google.com')) {
                    const match = previewVideoUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
                    if (match && match[1]) {
                      return `https://drive.google.com/file/d/${match[1]}/preview`;
                    }
                  }
                  return previewVideoUrl;
                })()}
                className="w-full h-full border-none"
                title={previewVideoTitle}
                allow="autoplay"
              />
              {/* Película de proteção transparente absoluta que impede cliques nas ações superiores do Google Drive */}
              <div className="absolute top-0 right-0 left-0 h-16 bg-transparent cursor-default" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
