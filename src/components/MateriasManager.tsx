import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Layers, PlusCircle, Trash2, Search, FileText, X, BookOpen, FolderTree, Video, Headphones, HelpCircle, FileCheck, Eye, Edit2, ArrowLeft, Maximize, Minimize, Presentation } from 'lucide-react';

export interface GlobalDiscipline {
  id: string;
  name: string;
}

export interface GlobalArea {
  id: string;
  name: string;
  discipline_id: string;
}

export type ResourceType = 'video' | 'audio' | 'question' | 'summary' | 'flashcard' | 'pdf' | 'slides';

export interface Resource {
  id: number;
  type: ResourceType;
  title: string;
  url: string;
}

export interface GlobalMateria {
  id: string;
  name: string;
  discipline?: string;
  area?: string;
  resources?: Resource[];
  created_at: string;
}

export interface MateriasManagerProps {
  onActiveMateriaChange?: (materia: GlobalMateria | null) => void;
}

export function MateriasManager({ onActiveMateriaChange }: MateriasManagerProps) {
  const [materias, setMaterias] = useState<GlobalMateria[]>([]);
  const [disciplines, setDisciplines] = useState<GlobalDiscipline[]>([]);
  const [areas, setAreas] = useState<GlobalArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDiscipline, setFilterDiscipline] = useState('');
  const [filterArea, setFilterArea] = useState('');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newMateriaName, setNewMateriaName] = useState('');
  
  const [selectedDisciplineId, setSelectedDisciplineId] = useState('');
  const [selectedAreaId, setSelectedAreaId] = useState('');

  // Resource Editor States
  const [activeMateriaId, setActiveMateriaId] = useState<string | null>(null);
  const [selectedResourceType, setSelectedResourceType] = useState<ResourceType>('video');
  const [editingResourceId, setEditingResourceId] = useState<number | null>(null);
  const [addingResource, setAddingResource] = useState<boolean>(false);
  const [newResourceType, setNewResourceType] = useState<ResourceType>('video');
  const [newResourceTitle, setNewResourceTitle] = useState('');
  const [newResourceUrl, setNewResourceUrl] = useState('');

  // Edit Materia Details States
  const [showEditMateriaModal, setShowEditMateriaModal] = useState(false);
  const [editingMateriaId, setEditingMateriaId] = useState<string | null>(null);
  const [editMateriaName, setEditMateriaName] = useState('');
  const [editDisciplineId, setEditDisciplineId] = useState('');
  const [editAreaId, setEditAreaId] = useState('');

  // Main Screen Creation Modals States
  const [showCreateDisciplineModal, setShowCreateDisciplineModal] = useState(false);
  const [showCreateAreaModal, setShowCreateAreaModal] = useState(false);
  const [newDisciplineName, setNewDisciplineName] = useState('');
  const [newAreaName, setNewAreaName] = useState('');
  const [newAreaDisciplineId, setNewAreaDisciplineId] = useState('');

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

  // Audio Preview States
  const [previewAudioUrl, setPreviewAudioUrl] = useState<string | null>(null);
  const [previewAudioTitle, setPreviewAudioTitle] = useState<string>("");

  // Video Preview States
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);
  const [previewVideoTitle, setPreviewVideoTitle] = useState<string>("");

  useEffect(() => {
    fetchData();
    return () => {
      onActiveMateriaChange?.(null);
    };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([
      fetchMaterias(),
      fetchDisciplines(),
      fetchAreas()
    ]);
    setLoading(false);
  };

  const fetchMaterias = async () => {
    const { data, error } = await supabase
      .from('materias')
      .select('*')
      .order('name', { ascending: true });
    if (!error) setMaterias(data || []);
  };

  const fetchDisciplines = async () => {
    const { data, error } = await supabase
      .from('global_disciplines')
      .select('*')
      .order('name', { ascending: true });
    if (!error) setDisciplines(data || []);
  };

  const fetchAreas = async () => {
    const { data, error } = await supabase
      .from('global_areas')
      .select('*')
      .order('name', { ascending: true });
    if (!error) setAreas(data || []);
  };

  const handleAddDiscipline = async (isEditMode: boolean = false) => {
    const name = window.prompt("Nome da nova Disciplina:");
    if (!name || !name.trim()) return;

    const newDisc = {
      id: "disc-" + Math.random().toString(36).substr(2, 9) + "-" + Date.now(),
      name: name.trim()
    };

    const { error } = await supabase.from('global_disciplines').insert([newDisc]);
    if (error) alert("Erro ao criar disciplina");
    else {
      await fetchDisciplines();
      if (isEditMode) {
        setEditDisciplineId(newDisc.id);
      } else {
        setSelectedDisciplineId(newDisc.id);
      }
    }
  };

  const handleDeleteDiscipline = async (isEditMode: boolean = false) => {
    const targetId = isEditMode ? editDisciplineId : selectedDisciplineId;
    if (!targetId) return;
    const disc = disciplines.find(d => d.id === targetId);
    if (!window.confirm(`Excluir a disciplina "${disc?.name}"?`)) return;

    const { error } = await supabase.from('global_disciplines').delete().eq('id', targetId);
    if (error) alert("Erro ao excluir");
    else {
      if (isEditMode) {
        setEditDisciplineId('');
        setEditAreaId('');
      } else {
        setSelectedDisciplineId('');
        setSelectedAreaId('');
      }
      await fetchDisciplines();
      await fetchAreas();
    }
  };

  const handleAddArea = async (isEditMode: boolean = false) => {
    const targetDisciplineId = isEditMode ? editDisciplineId : selectedDisciplineId;
    if (!targetDisciplineId) {
      alert("Selecione uma disciplina primeiro!");
      return;
    }
    const name = window.prompt("Nome do novo Eixo para esta Disciplina:");
    if (!name || !name.trim()) return;

    const newArea = {
      id: "area-" + Math.random().toString(36).substr(2, 9) + "-" + Date.now(),
      name: name.trim(),
      discipline_id: targetDisciplineId
    };

    const { error } = await supabase.from('global_areas').insert([newArea]);
    if (error) alert("Erro ao criar eixo");
    else {
      await fetchAreas();
      if (isEditMode) {
        setEditAreaId(newArea.id);
      } else {
        setSelectedAreaId(newArea.id);
      }
    }
  };

  const handleDeleteArea = async (isEditMode: boolean = false) => {
    const targetAreaId = isEditMode ? editAreaId : selectedAreaId;
    if (!targetAreaId) return;
    const area = areas.find(a => a.id === targetAreaId);
    if (!window.confirm(`Excluir o eixo "${area?.name}"?`)) return;

    const { error } = await supabase.from('global_areas').delete().eq('id', targetAreaId);
    if (error) alert("Erro ao excluir");
    else {
      if (isEditMode) {
        setEditAreaId('');
      } else {
        setSelectedAreaId('');
      }
      await fetchAreas();
    }
  };

  const handleSaveDisciplineFromMain = async () => {
    if (!newDisciplineName.trim()) {
      alert("Digite o nome da disciplina.");
      return;
    }

    const newDisc = {
      id: "disc-" + Math.random().toString(36).substr(2, 9) + "-" + Date.now(),
      name: newDisciplineName.trim()
    };

    const { error } = await supabase.from('global_disciplines').insert([newDisc]);
    if (error) {
      alert("Erro ao criar disciplina");
    } else {
      await fetchDisciplines();
      setNewDisciplineName('');
      setShowCreateDisciplineModal(false);
    }
  };

  const handleSaveAreaFromMain = async () => {
    if (!newAreaName.trim() || !newAreaDisciplineId) {
      alert("Selecione a disciplina e digite o nome do eixo.");
      return;
    }

    const newArea = {
      id: "area-" + Math.random().toString(36).substr(2, 9) + "-" + Date.now(),
      name: newAreaName.trim(),
      discipline_id: newAreaDisciplineId
    };

    const { error } = await supabase.from('global_areas').insert([newArea]);
    if (error) {
      alert("Erro ao criar eixo");
    } else {
      await fetchAreas();
      setNewAreaName('');
      setNewAreaDisciplineId('');
      setShowCreateAreaModal(false);
    }
  };

  const handleAddMateria = async () => {
    if (!newMateriaName.trim() || !selectedDisciplineId || !selectedAreaId) {
      alert("Selecione a Disciplina, o Eixo e digite o Nome da Matéria.");
      return;
    }

    const discName = disciplines.find(d => d.id === selectedDisciplineId)?.name;
    const areaName = areas.find(a => a.id === selectedAreaId)?.name;

    const newMateria = {
      id: "mat-" + Math.random().toString(36).substr(2, 9) + "-" + Date.now(),
      name: newMateriaName.trim(),
      discipline: discName,
      area: areaName,
      resources: []
    };

    const { error } = await supabase
      .from('materias')
      .insert([newMateria]);

    if (error) {
      alert("Erro ao criar matéria.");
    } else {
      setShowCreateModal(false);
      setNewMateriaName('');
      fetchMaterias();
    }
  };

  const handleDeleteMateria = async (id: string, name: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir a matéria "${name}"?`)) return;

    const { error } = await supabase
      .from('materias')
      .delete()
      .eq('id', id);

    if (error) {
      alert("Erro ao excluir matéria.");
    } else {
      fetchMaterias();
    }
  };

  const handleStartEditMateria = (materia: GlobalMateria) => {
    const disc = disciplines.find(d => d.name === materia.discipline);
    const area = areas.find(a => a.name === materia.area);

    setEditMateriaName(materia.name);
    setEditDisciplineId(disc ? disc.id : '');
    setEditAreaId(area ? area.id : '');
    setEditingMateriaId(materia.id);
    setShowEditMateriaModal(true);
  };

  const handleUpdateMateriaDetails = async () => {
    if (!editMateriaName.trim() || !editDisciplineId || !editAreaId || !editingMateriaId) {
      alert("Preencha todos os campos.");
      return;
    }

    const discName = disciplines.find(d => d.id === editDisciplineId)?.name;
    const areaName = areas.find(d => d.id === editAreaId)?.name;

    const { error } = await supabase
      .from('materias')
      .update({
        name: editMateriaName.trim(),
        discipline: discName,
        area: areaName
      })
      .eq('id', editingMateriaId);

    if (error) {
      alert("Erro ao atualizar matéria.");
    } else {
      setShowEditMateriaModal(false);
      setEditingMateriaId(null);
      await fetchMaterias();
      
      if (activeMateriaId === editingMateriaId) {
        const updated = {
          ...activeMateria!,
          name: editMateriaName.trim(),
          discipline: discName,
          area: areaName
        };
        onActiveMateriaChange?.(updated);
      }
    }
  };

  // --- Resource Management ---
  const handleSaveResource = async () => {
    if (!newResourceTitle.trim()) {
      alert("Preencha o título do recurso.");
      return;
    }

    const activeMateria = materias.find(m => m.id === activeMateriaId);
    if (!activeMateria) return;

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
        alert("Preencha a URL do recurso.");
        return;
      }
    }

    let updatedResources = activeMateria.resources || [];
    if (editingResourceId) {
      updatedResources = updatedResources.map(r => 
        r.id === editingResourceId ? resourcePayload : r
      );
    } else {
      updatedResources = [...updatedResources, resourcePayload];
    }

    const { error } = await supabase
      .from('materias')
      .update({ resources: updatedResources })
      .eq('id', activeMateriaId);

    if (error) {
      alert("Erro ao salvar recurso.");
    } else {
      setAddingResource(false);
      setEditingResourceId(null);
      fetchMaterias();
    }
  };

  const handleDeleteResource = async (resourceId: number) => {
    if (!window.confirm("Excluir este recurso?")) return;

    const activeMateria = materias.find(m => m.id === activeMateriaId);
    if (!activeMateria) return;

    const updatedResources = (activeMateria.resources || []).filter(r => r.id !== resourceId);

    const { error } = await supabase
      .from('materias')
      .update({ resources: updatedResources })
      .eq('id', activeMateriaId);

    if (error) {
      alert("Erro ao excluir recurso.");
    } else {
      fetchMaterias();
    }
  };

  const getResourceIcon = (type: ResourceType, className = "w-4 h-4") => {
    switch (type) {
      case 'video': return <Video className={className} />;
      case 'audio': return <Headphones className={className} />;
      case 'pdf': return <FileText className={className} />;
      case 'slides': return <Presentation className={className} />;
      case 'question': return <HelpCircle className={className} />;
      case 'summary': return <Layers className={className} />;
      case 'flashcard': return <FileCheck className={className} />;
    }
  };

  const filteredMaterias = materias.filter(m => {
    const term = searchTerm.toLowerCase();
    const matchTerm = !term || (
      m.name.toLowerCase().includes(term) ||
      (m.discipline && m.discipline.toLowerCase().includes(term)) ||
      (m.area && m.area.toLowerCase().includes(term))
    );
    const matchDisc = !filterDiscipline || m.discipline === filterDiscipline;
    const matchArea = !filterArea || m.area === filterArea;
    
    return matchTerm && matchDisc && matchArea;
  });

  const availableAreas = areas.filter(a => a.discipline_id === selectedDisciplineId);

  const activeMateria = materias.find(m => m.id === activeMateriaId);

  if (activeMateriaId && activeMateria) {
    return (
      <>
        <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center border-b border-slate-200 pb-4">
          <div>
            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">
              EDITOR DE CONTEÚDO
            </span>
            <h2 className="text-xs font-mono uppercase font-bold text-slate-700 tracking-tight mt-0.5">
              {activeMateria.name}
            </h2>
          </div>
          <button 
            onClick={() => {
              setActiveMateriaId(null);
              onActiveMateriaChange?.(null);
            }}
            className="group px-5 py-2.5 bg-gradient-to-r from-indigo-50 to-indigo-100 hover:from-indigo-600 hover:to-violet-600 text-indigo-700 hover:text-white border border-indigo-100 hover:border-transparent rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer shadow-sm hover:shadow-[0_4px_12px_rgba(99,102,241,0.25)] flex items-center space-x-2 relative overflow-hidden whitespace-nowrap shrink-0 hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
            <span>Voltar</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6">
          <div className="mb-6 flex items-center space-x-3 border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-3">
              <Layers className="w-6 h-6 text-indigo-500" />
              <div>
                <h3 className="text-xl font-display font-bold text-slate-800">{activeMateria.name}</h3>
                <p className="text-xs text-slate-500 flex items-center space-x-2 mt-1">
                  <span>{activeMateria.discipline}</span>
                  <span>•</span>
                  <span>{activeMateria.area}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/4 space-y-2">
              {(['video', 'audio', 'pdf', 'slides', 'question', 'summary', 'flashcard'] as ResourceType[]).map(type => {
                const count = (activeMateria.resources || []).filter(r => r.type === type).length;
                const isActive = selectedResourceType === type;
                return (
                  <button
                    key={type}
                    onClick={() => { 
                      setSelectedResourceType(type); 
                      setAddingResource(false); 
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
                    }`}>
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="flex-1 bg-slate-50/50 rounded-2xl border border-slate-100 p-6 space-y-6">
              <div className="flex justify-between items-center border-b border-slate-200/60 pb-4">
                <div className="flex items-center space-x-2">
                  <div className="text-indigo-600">
                    {getResourceIcon(selectedResourceType, "w-5 h-5")}
                  </div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                    {selectedResourceType === 'video' ? 'Vídeos' : selectedResourceType === 'audio' ? 'Áudios' : selectedResourceType === 'pdf' ? 'PDFs' : selectedResourceType === 'slides' ? 'Slides' : selectedResourceType === 'question' ? 'Questões' : selectedResourceType === 'summary' ? 'Resumos' : 'Flashcards'} Cadastrados
                  </h4>
                </div>
                 {!addingResource && (
                  <button
                    onClick={() => {
                      setAddingResource(true);
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

              {addingResource && (
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
                          <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5 font-sans">Pergunta / Frente do Card *</label>
                          <textarea value={flashcardQuestion} onChange={e => setFlashcardQuestion(e.target.value)} placeholder="Ex: Qual o prazo para impetrar Mandado de Segurança?" rows={3} className="w-full p-3 text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all resize-none"/>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5 font-sans">Resposta / Verso do Card *</label>
                          <textarea value={flashcardAnswer} onChange={e => setFlashcardAnswer(e.target.value)} placeholder="Ex: O prazo é de 120 dias, contados da ciência do ato impugnado." rows={3} className="w-full p-3 text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all resize-none"/>
                        </div>
                      </>
                    ) : newResourceType === 'summary' ? (
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5 font-sans">Conteúdo / Texto do Resumo *</label>
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
                    <button type="button" onClick={() => { setAddingResource(false); setEditingResourceId(null); }} className="px-5 py-2.5 text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer uppercase shadow-sm">Cancelar</button>
                    <button type="button" onClick={handleSaveResource} className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-xl transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer uppercase shadow-[0_4px_14px_rgba(99,102,241,0.3)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.4)]">{editingResourceId ? 'Salvar Alterações' : 'Cadastrar'}</button>
                  </div>
                </div>
              )}

              {(() => {
                const filteredResources = (activeMateria.resources || []).filter(r => r.type === selectedResourceType);
                if (filteredResources.length === 0) {
                  return (
                    <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-xl border border-slate-100">
                      <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3 text-slate-300">
                        {getResourceIcon(selectedResourceType, "w-6 h-6")}
                      </div>
                      <h4 className="text-slate-700 font-bold mb-1 text-sm">Sem conteúdos cadastrados</h4>
                      <p className="text-xs text-slate-500 max-w-sm">
                        Esta matéria ainda não possui {selectedResourceType === 'video' ? 'vídeos' : selectedResourceType === 'audio' ? 'áudios' : selectedResourceType === 'pdf' ? 'PDFs' : selectedResourceType === 'slides' ? 'slides' : selectedResourceType === 'question' ? 'questões' : selectedResourceType === 'summary' ? 'resumos' : 'flashcards'}. Clique em Adicionar.
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
                            onClick={() => { 
                              setAddingResource(true); 
                              setEditingResourceId(resource.id); 
                              setNewResourceType(resource.type); 
                              setNewResourceTitle(resource.title); 
                              setNewResourceUrl(resource.url || ''); 
                              if (resource.type === 'question') {
                                setQuestionText(resource.questionText || '');
                                setOptionA(resource.options?.[0]?.text || '');
                                setOptionB(resource.options?.[1]?.text || '');
                                setOptionC(resource.options?.[2]?.text || '');
                                setOptionD(resource.options?.[3]?.text || '');
                                setCorrectAnswer(resource.correctAnswer || 'A');
                                setJustification(resource.justification || '');
                              }
                              if (resource.type === 'flashcard') {
                                setFlashcardQuestion(resource.flashcardQuestion || '');
                                setFlashcardAnswer(resource.flashcardAnswer || '');
                              }
                              if (resource.type === 'summary') {
                                setSummaryText(resource.summaryText || '');
                              }
                            }} 
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-300 hover:-translate-y-0.5 active:scale-90 border border-transparent hover:border-indigo-100/60 shadow-sm hover:shadow cursor-pointer"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteResource(resource.id)} 
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all duration-300 hover:-translate-y-0.5 active:scale-90 border border-transparent hover:border-rose-100/60 shadow-sm hover:shadow cursor-pointer"
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
      </div>

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
                      className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 rounded-xl transition-all duration-300 cursor-pointer shadow-sm"
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
                  <div className="flex flex-col justify-between h-full w-full backface-hidden">
                    <span className="text-[9px] font-mono font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded uppercase tracking-wider self-center">FRENTE / PERGUNTA</span>
                    <p className="text-xs font-bold text-slate-800 leading-relaxed px-2 flex-1 flex items-center justify-center">
                      {previewFlashcard.flashcardQuestion}
                    </p>
                    <span className="text-[10px] text-slate-400 font-medium">Clique no card para ver a resposta</span>
                  </div>
                ) : (
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

      {previewPdfUrl && (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-smooth-fade ${isPdfMaximized ? 'p-0' : 'p-4'}`}>
          <div className={`bg-white shadow-xl overflow-hidden flex flex-col transition-all duration-300 ${
            isPdfMaximized 
              ? 'w-screen h-screen rounded-none' 
              : previewPdfUrl && previewPdfUrl.includes('docs.google.com/presentation')
                ? 'w-full max-w-4xl rounded-2xl h-auto'
                : 'w-full max-w-5xl h-[85vh] rounded-2xl'
          }`}>
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
              <h3 className="font-display font-bold text-slate-800 flex items-center space-x-2">
                <FileText className="w-5 h-5 text-indigo-500" />
                <span>Visualizador Seguro (Somente Leitura): {previewPdfTitle}</span>
              </h3>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setIsPdfMaximized(!isPdfMaximized)}
                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer flex items-center space-x-1.5 text-xs font-bold font-sans border-none bg-transparent"
                  title={isPdfMaximized ? "Restaurar" : "Tela Cheia"}
                >
                  {isPdfMaximized ? <Minimize className="w-4 h-4 text-indigo-600" /> : <Maximize className="w-4 h-4 text-indigo-600" />}
                  <span>{isPdfMaximized ? "Minimizar" : "Tela Cheia"}</span>
                </button>
                <button 
                  onClick={() => {
                    setPreviewPdfUrl(null);
                    setIsPdfMaximized(false);
                  }}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer border-none bg-transparent"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className={`relative overflow-hidden ${
              !isPdfMaximized && previewPdfUrl && previewPdfUrl.includes('docs.google.com/presentation')
                ? 'w-full aspect-video bg-black flex-none'
                : 'flex-1 bg-slate-100'
            }`}>
              <iframe 
                src={(() => {
                  if (!previewPdfUrl) return '';
                  if (previewPdfUrl.includes('drive.google.com')) {
                    const match = previewPdfUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
                    if (match && match[1]) {
                      return `https://drive.google.com/file/d/${match[1]}/preview`;
                    }
                  }
                  if (previewPdfUrl.includes('docs.google.com/presentation')) {
                    const match = previewPdfUrl.match(/\/presentation\/d\/([a-zA-Z0-9_-]+)/);
                    if (match && match[1]) {
                      return `https://docs.google.com/presentation/d/${match[1]}/embed?start=false&loop=false&delayms=3000`;
                    }
                  }
                  return `${previewPdfUrl}#toolbar=0&navpanes=0`;
                })()}
                className="w-full h-full border-none"
                title={previewPdfTitle}
              />
              {/* Película de proteção transparente absoluta que impede cliques nas ações superiores do Google Drive */}
              <div className="absolute top-0 right-0 left-0 h-16 bg-transparent cursor-default" />
              {/* Bloqueio da barra de controle inferior direita para Google Slides (/embed) */}
              {previewPdfUrl && previewPdfUrl.includes('docs.google.com/presentation') && (
                <div className="absolute bottom-0 right-0 w-32 h-10 bg-transparent cursor-default" />
              )}
            </div>
          </div>
        </div>
      )}

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
      </>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-display font-bold text-slate-800 flex items-center space-x-2">
              <Layers className="w-5 h-5 text-indigo-500" />
              <span>Banco Global de Matérias</span>
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Crie matérias aqui definindo a Disciplina e Eixo correspondentes.
            </p>
          </div>
          
          <div className="flex items-center flex-wrap gap-3">
            <button 
              onClick={() => {
                setNewDisciplineName('');
                setShowCreateDisciplineModal(true);
              }}
              className="group px-4 py-2 bg-white hover:bg-slate-50 text-slate-600 hover:text-indigo-600 border border-slate-200 hover:border-indigo-200 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer shadow-sm hover:shadow hover:-translate-y-0.5 active:scale-[0.98] flex items-center space-x-1.5"
            >
              <PlusCircle className="w-4 h-4 text-slate-400 group-hover:text-indigo-500" />
              <span>Nova Disciplina</span>
            </button>
            <button 
              onClick={() => {
                setNewAreaName('');
                setNewAreaDisciplineId(disciplines[0]?.id || '');
                setShowCreateAreaModal(true);
              }}
              className="group px-4 py-2 bg-white hover:bg-slate-50 text-slate-600 hover:text-indigo-600 border border-slate-200 hover:border-indigo-200 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer shadow-sm hover:shadow hover:-translate-y-0.5 active:scale-[0.98] flex items-center space-x-1.5"
            >
              <PlusCircle className="w-4 h-4 text-slate-400 group-hover:text-indigo-500" />
              <span>Novo Eixo</span>
            </button>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="group px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer shadow-[0_4px_14px_rgba(99,102,241,0.3)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.4)] flex items-center justify-center space-x-2 relative overflow-hidden whitespace-nowrap shrink-0 hover:-translate-y-0.5 active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />
              <span>Nova Matéria</span>
            </button>
          </div>
        </div>

        {/* Barra de Filtros Dedicada */}
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Buscar matéria..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
            />
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={filterDiscipline}
              onChange={(e) => { setFilterDiscipline(e.target.value); setFilterArea(''); }}
              className="py-2 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white flex-1 sm:flex-none"
            >
              <option value="">Todas Disciplinas</option>
              {disciplines.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
            </select>
            
            {filterDiscipline && (
              <select
                value={filterArea}
                onChange={(e) => setFilterArea(e.target.value)}
                className="py-2 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white flex-1 sm:flex-none"
              >
                <option value="">Todos Eixos</option>
                {areas.filter(a => {
                  const d = disciplines.find(disc => disc.name === filterDiscipline);
                  return d && a.discipline_id === d.id;
                }).map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
              </select>
            )}
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        ) : filteredMaterias.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-slate-300" />
            </div>
            <h4 className="text-slate-700 font-bold mb-2">Nenhuma matéria encontrada</h4>
            <p className="text-slate-500 text-sm max-w-sm">
              {searchTerm ? "Tente buscar com outro termo." : "Você ainda não possui matérias cadastradas no banco global. Adicione a primeira!"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredMaterias.map(materia => (
              <div key={materia.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 shrink-0">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{materia.name}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      {materia.discipline && (
                        <span className="inline-flex items-center space-x-1 text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                          <BookOpen className="w-3 h-3" />
                          <span>{materia.discipline}</span>
                        </span>
                      )}
                      {materia.area && (
                        <span className="inline-flex items-center space-x-1 text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-medium">
                          <FolderTree className="w-3 h-3" />
                          <span>{materia.area}</span>
                        </span>
                      )}
                      <span className="inline-flex items-center space-x-1 text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-medium">
                        <FileCheck className="w-3 h-3" />
                        <span>{materia.resources?.length || 0} recursos</span>
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-2">
                  <button 
                    onClick={() => {
                      setActiveMateriaId(materia.id);
                      setSelectedResourceType('video');
                      setAddingResource(false);
                      setEditingResourceId(null);
                      onActiveMateriaChange?.(materia);
                    }}
                    className="px-3.5 py-2 bg-indigo-50/80 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer hover:-translate-y-0.5 active:scale-95 border border-indigo-100/50 hover:border-transparent shadow-sm hover:shadow-[0_4px_10px_rgba(99,102,241,0.2)]"
                  >
                    Gerenciar Conteúdo
                  </button>
                  <button 
                    onClick={() => handleStartEditMateria(materia)}
                    className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-300 cursor-pointer hover:-translate-y-0.5 active:scale-95 border border-transparent hover:border-indigo-100/60 shadow-sm hover:shadow"
                    title="Editar Matéria"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteMateria(materia.id, materia.name)}
                    className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all duration-300 cursor-pointer hover:-translate-y-0.5 active:scale-95 border border-transparent hover:border-rose-100/60 shadow-sm hover:shadow"
                    title="Excluir Matéria"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Criação de Matéria */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-smooth-fade">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-display font-bold text-slate-800 flex items-center space-x-2">
                <Layers className="w-5 h-5 text-indigo-500" />
                <span>Nova Matéria Global</span>
              </h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Disciplina
                </label>
                <div className="flex items-center space-x-2">
                  <select
                    value={selectedDisciplineId}
                    onChange={(e) => {
                      setSelectedDisciplineId(e.target.value);
                      setSelectedAreaId('');
                    }}
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm bg-white"
                  >
                    <option value="" disabled>Selecione a Disciplina...</option>
                    {disciplines.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                  <button onClick={handleAddDiscipline} className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all duration-200 border border-indigo-100 cursor-pointer hover:-translate-y-0.5 active:scale-95 shadow-sm hover:shadow">
                    <PlusCircle className="w-4 h-4" />
                  </button>
                  <button onClick={handleDeleteDiscipline} disabled={!selectedDisciplineId} className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-all duration-200 border border-rose-100 cursor-pointer disabled:opacity-50 hover:-translate-y-0.5 active:scale-95 shadow-sm hover:shadow">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Eixo (Área)
                </label>
                <div className="flex items-center space-x-2">
                  <select
                    value={selectedAreaId}
                    onChange={(e) => setSelectedAreaId(e.target.value)}
                    disabled={!selectedDisciplineId}
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm bg-white disabled:bg-slate-50"
                  >
                    <option value="" disabled>Selecione o Eixo...</option>
                    {availableAreas.map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                  <button onClick={handleAddArea} disabled={!selectedDisciplineId} className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all duration-200 border border-indigo-100 cursor-pointer disabled:opacity-50 hover:-translate-y-0.5 active:scale-95 shadow-sm hover:shadow">
                    <PlusCircle className="w-4 h-4" />
                  </button>
                  <button onClick={handleDeleteArea} disabled={!selectedAreaId} className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-all duration-200 border border-rose-100 cursor-pointer disabled:opacity-50 hover:-translate-y-0.5 active:scale-95 shadow-sm hover:shadow">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nome da Matéria (Conteúdo)
                </label>
                <input 
                  type="text"
                  placeholder="Ex: Habeas Corpus"
                  value={newMateriaName}
                  onChange={e => setNewMateriaName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
                />
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end space-x-3">
              <button 
                onClick={() => setShowCreateModal(false)}
                className="px-5 py-2.5 text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer uppercase shadow-sm"
              >
                Cancelar
              </button>
              <button 
                onClick={handleAddMateria}
                className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-xl transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer uppercase shadow-[0_4px_14px_rgba(99,102,241,0.3)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.4)]"
              >
                Salvar Matéria
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição de Matéria */}
      {showEditMateriaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-smooth-fade">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-display font-bold text-slate-800 flex items-center space-x-2">
                <Edit2 className="w-5 h-5 text-indigo-500" />
                <span>Editar Informações Básicas</span>
              </h3>
              <button 
                onClick={() => setShowEditMateriaModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-all duration-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Disciplina
                </label>
                <div className="flex items-center space-x-2">
                  <select
                    value={editDisciplineId}
                    onChange={(e) => {
                      setEditDisciplineId(e.target.value);
                      setEditAreaId('');
                    }}
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm bg-white"
                  >
                    <option value="" disabled>Selecione a Disciplina...</option>
                    {disciplines.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                  <button onClick={() => handleAddDiscipline(true)} className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all duration-200 border border-indigo-100 cursor-pointer hover:-translate-y-0.5 active:scale-95 shadow-sm hover:shadow">
                    <PlusCircle className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDeleteDiscipline(true)} disabled={!editDisciplineId} className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-all duration-200 border border-rose-100 cursor-pointer disabled:opacity-50 hover:-translate-y-0.5 active:scale-95 shadow-sm hover:shadow">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Eixo (Área)
                </label>
                <div className="flex items-center space-x-2">
                  <select
                    value={editAreaId}
                    onChange={(e) => setEditAreaId(e.target.value)}
                    disabled={!editDisciplineId}
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm bg-white disabled:bg-slate-50"
                  >
                    <option value="" disabled>Selecione o Eixo...</option>
                    {areas.filter(a => a.discipline_id === editDisciplineId).map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                  <button onClick={() => handleAddArea(true)} disabled={!editDisciplineId} className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all duration-200 border border-indigo-100 cursor-pointer disabled:opacity-50 hover:-translate-y-0.5 active:scale-95 shadow-sm hover:shadow">
                    <PlusCircle className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDeleteArea(true)} disabled={!editAreaId} className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-all duration-200 border border-rose-100 cursor-pointer disabled:opacity-50 hover:-translate-y-0.5 active:scale-95 shadow-sm hover:shadow">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nome da Matéria (Conteúdo)
                </label>
                <input 
                  type="text"
                  placeholder="Ex: Habeas Corpus"
                  value={editMateriaName}
                  onChange={e => setEditMateriaName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
                />
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end space-x-3">
              <button 
                onClick={() => setShowEditMateriaModal(false)}
                className="px-5 py-2.5 text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer uppercase shadow-sm"
              >
                Cancelar
              </button>
              <button 
                onClick={handleUpdateMateriaDetails}
                className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-xl transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer uppercase shadow-[0_4px_14px_rgba(99,102,241,0.3)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.4)]"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Criação de Disciplina */}
      {showCreateDisciplineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-smooth-fade">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-display font-bold text-slate-800 flex items-center space-x-2">
                <PlusCircle className="w-5 h-5 text-indigo-500" />
                <span>Nova Disciplina</span>
              </h3>
              <button 
                onClick={() => setShowCreateDisciplineModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nome da Disciplina
                </label>
                <input 
                  type="text"
                  placeholder="Ex: Direito Constitucional"
                  value={newDisciplineName}
                  onChange={e => setNewDisciplineName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
                />
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end space-x-3">
              <button 
                onClick={() => setShowCreateDisciplineModal(false)}
                className="px-5 py-2.5 text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer uppercase shadow-sm"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveDisciplineFromMain}
                className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-xl transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer uppercase shadow-[0_4px_14px_rgba(99,102,241,0.3)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.4)]"
              >
                Salvar Disciplina
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Criação de Eixo (Área) */}
      {showCreateAreaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-smooth-fade">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-display font-bold text-slate-800 flex items-center space-x-2">
                <PlusCircle className="w-5 h-5 text-indigo-500" />
                <span>Novo Eixo (Área)</span>
              </h3>
              <button 
                onClick={() => setShowCreateAreaModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Disciplina Relacionada
                </label>
                <select
                  value={newAreaDisciplineId}
                  onChange={(e) => setNewAreaDisciplineId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm bg-white"
                >
                  <option value="" disabled>Selecione a Disciplina...</option>
                  {disciplines.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nome do Eixo (Área)
                </label>
                <input 
                  type="text"
                  placeholder="Ex: Direitos Individuais"
                  value={newAreaName}
                  onChange={e => setNewAreaName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
                />
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end space-x-3">
              <button 
                onClick={() => setShowCreateAreaModal(false)}
                className="px-5 py-2.5 text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer uppercase shadow-sm"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveAreaFromMain}
                className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-xl transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer uppercase shadow-[0_4px_14px_rgba(99,102,241,0.3)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.4)]"
              >
                Salvar Eixo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
