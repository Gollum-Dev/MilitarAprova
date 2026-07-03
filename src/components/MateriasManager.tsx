import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Layers, PlusCircle, Trash2, Search, FileText, X, BookOpen, FolderTree, Video, Headphones, HelpCircle, FileCheck, Eye, Edit2, ArrowLeft } from 'lucide-react';

export interface GlobalDiscipline {
  id: string;
  name: string;
}

export interface GlobalArea {
  id: string;
  name: string;
  discipline_id: string;
}

export type ResourceType = 'video' | 'audio' | 'question' | 'summary' | 'flashcard' | 'pdf';

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

export function MateriasManager() {
  const [materias, setMaterias] = useState<GlobalMateria[]>([]);
  const [disciplines, setDisciplines] = useState<GlobalDiscipline[]>([]);
  const [areas, setAreas] = useState<GlobalArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newMateriaName, setNewMateriaName] = useState('');
  
  const [selectedDisciplineId, setSelectedDisciplineId] = useState('');
  const [selectedAreaId, setSelectedAreaId] = useState('');

  // Resource Editor States
  const [activeMateriaId, setActiveMateriaId] = useState<string | null>(null);
  const [editingResourceId, setEditingResourceId] = useState<number | null>(null);
  const [addingResource, setAddingResource] = useState<boolean>(false);
  const [newResourceType, setNewResourceType] = useState<ResourceType>('video');
  const [newResourceTitle, setNewResourceTitle] = useState('');
  const [newResourceUrl, setNewResourceUrl] = useState('');

  useEffect(() => {
    fetchData();
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

  const handleAddDiscipline = async () => {
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
      setSelectedDisciplineId(newDisc.id);
    }
  };

  const handleDeleteDiscipline = async () => {
    if (!selectedDisciplineId) return;
    const disc = disciplines.find(d => d.id === selectedDisciplineId);
    if (!window.confirm(`Excluir a disciplina "${disc?.name}"?`)) return;

    const { error } = await supabase.from('global_disciplines').delete().eq('id', selectedDisciplineId);
    if (error) alert("Erro ao excluir");
    else {
      setSelectedDisciplineId('');
      setSelectedAreaId('');
      await fetchDisciplines();
      await fetchAreas();
    }
  };

  const handleAddArea = async () => {
    if (!selectedDisciplineId) {
      alert("Selecione uma disciplina primeiro!");
      return;
    }
    const name = window.prompt("Nome do novo Eixo para esta Disciplina:");
    if (!name || !name.trim()) return;

    const newArea = {
      id: "area-" + Math.random().toString(36).substr(2, 9) + "-" + Date.now(),
      name: name.trim(),
      discipline_id: selectedDisciplineId
    };

    const { error } = await supabase.from('global_areas').insert([newArea]);
    if (error) alert("Erro ao criar eixo");
    else {
      await fetchAreas();
      setSelectedAreaId(newArea.id);
    }
  };

  const handleDeleteArea = async () => {
    if (!selectedAreaId) return;
    const area = areas.find(a => a.id === selectedAreaId);
    if (!window.confirm(`Excluir o eixo "${area?.name}"?`)) return;

    const { error } = await supabase.from('global_areas').delete().eq('id', selectedAreaId);
    if (error) alert("Erro ao excluir");
    else {
      setSelectedAreaId('');
      await fetchAreas();
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

  // --- Resource Management ---
  const handleSaveResource = async () => {
    if (!newResourceTitle.trim() || !newResourceUrl.trim()) {
      alert("Preencha título e URL do recurso.");
      return;
    }

    const activeMateria = materias.find(m => m.id === activeMateriaId);
    if (!activeMateria) return;

    let updatedResources = activeMateria.resources || [];
    if (editingResourceId) {
      updatedResources = updatedResources.map(r => 
        r.id === editingResourceId ? { ...r, type: newResourceType, title: newResourceTitle, url: newResourceUrl } : r
      );
    } else {
      updatedResources = [...updatedResources, {
        id: Date.now(),
        type: newResourceType,
        title: newResourceTitle,
        url: newResourceUrl
      }];
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
      case 'question': return <HelpCircle className={className} />;
      case 'summary': return <Layers className={className} />;
      case 'flashcard': return <FileCheck className={className} />;
    }
  };

  const filteredMaterias = materias.filter(m => {
    const term = searchTerm.toLowerCase();
    return (
      m.name.toLowerCase().includes(term) ||
      (m.discipline && m.discipline.toLowerCase().includes(term)) ||
      (m.area && m.area.toLowerCase().includes(term))
    );
  });

  const availableAreas = areas.filter(a => a.discipline_id === selectedDisciplineId);

  const activeMateria = materias.find(m => m.id === activeMateriaId);

  if (activeMateriaId && activeMateria) {
    return (
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
            onClick={() => setActiveMateriaId(null)}
            className="group px-5 py-2.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-100 hover:border-indigo-600 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md flex items-center space-x-2 relative overflow-hidden whitespace-nowrap shrink-0"
          >
            <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
            <span>Voltar</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6">
          <div className="mb-6 flex items-center space-x-2 border-b border-slate-100 pb-4">
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

          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/4 space-y-2">
              {(['video', 'audio', 'pdf', 'question', 'summary', 'flashcard'] as ResourceType[]).map(type => {
                const count = (activeMateria.resources || []).filter(r => r.type === type).length;
                return (
                  <button
                    key={type}
                    onClick={() => { setAddingResource(true); setNewResourceType(type); setEditingResourceId(null); setNewResourceTitle(''); setNewResourceUrl(''); }}
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-colors text-slate-600 group"
                  >
                    <div className="flex items-center space-x-3">
                      {getResourceIcon(type, "w-4 h-4")}
                      <span className="text-xs font-bold uppercase">{type === 'video' ? 'Vídeo' : type === 'audio' ? 'Áudio' : type === 'pdf' ? 'PDF' : type === 'question' ? 'Questões' : type === 'summary' ? 'Resumo' : 'Flashcard'}</span>
                    </div>
                    {count > 0 ? (
                      <span className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-700 text-[10px] font-bold flex items-center justify-center">
                        {count}
                      </span>
                    ) : (
                      <PlusCircle className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </button>
                )
              })}
            </div>

            <div className="flex-1 bg-slate-50/50 rounded-2xl border border-slate-100 p-6">
              {addingResource ? (
                <div className="bg-white p-5 rounded-xl border border-indigo-200 shadow-sm animate-smooth-fade space-y-4">
                  <div className="flex items-center space-x-2 border-b border-slate-100 pb-3 mb-3">
                    <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 border border-indigo-100">
                      {getResourceIcon(newResourceType, "w-5 h-5")}
                    </div>
                    <h6 className="text-sm font-bold text-indigo-800 uppercase tracking-wider">
                      {editingResourceId ? 'Editar' : 'Cadastrar Novo'} {newResourceType}
                    </h6>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Título do Recurso *</label>
                      <input type="text" value={newResourceTitle} onChange={e => setNewResourceTitle(e.target.value)} placeholder="Ex: Aula 01 - Introdução" className="w-full p-3 text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all"/>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Link (URL) *</label>
                      <input type="url" value={newResourceUrl} onChange={e => setNewResourceUrl(e.target.value)} placeholder="https://..." className="w-full p-3 text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all"/>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                    <button type="button" onClick={() => { setAddingResource(false); setEditingResourceId(null); }} className="px-5 py-2.5 text-xs font-bold text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer uppercase">Cancelar</button>
                    <button type="button" onClick={handleSaveResource} className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer uppercase shadow-sm">{editingResourceId ? 'Salvar Alterações' : 'Cadastrar'}</button>
                  </div>
                </div>
              ) : (
                <>
                  {(!activeMateria.resources || activeMateria.resources.length === 0) ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="w-16 h-16 bg-white rounded-full shadow-sm border border-slate-100 flex items-center justify-center mb-4 text-slate-300">
                        <FolderTree className="w-8 h-8" />
                      </div>
                      <h4 className="text-slate-700 font-bold mb-2">Sem recursos</h4>
                      <p className="text-sm text-slate-500 max-w-sm">
                        Esta matéria ainda não possui conteúdos. Clique nas opções ao lado para adicionar.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {(activeMateria.resources).map(resource => (
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
                            <a href={resource.url} target="_blank" rel="noreferrer" className="p-2 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-100 rounded-lg transition-colors">
                              <Eye className="w-4 h-4" />
                            </a>
                            <button onClick={() => { setAddingResource(true); setEditingResourceId(resource.id); setNewResourceType(resource.type); setNewResourceTitle(resource.title); setNewResourceUrl(resource.url); }} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDeleteResource(resource.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-100 rounded-lg transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center border-b border-slate-200 pb-4">
        <div>
          <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">
            VISÃO DO GESTOR
          </span>
          <h2 className="text-xs font-mono uppercase font-bold text-slate-700 tracking-tight mt-0.5">
            Gerenciar Matérias
          </h2>
        </div>
      </div>

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
          
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Buscar matéria..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-64"
              />
            </div>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="group px-5 py-2.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-100 hover:border-indigo-600 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md flex items-center space-x-2 relative overflow-hidden whitespace-nowrap shrink-0"
            >
              <PlusCircle className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />
              <span>Nova Matéria</span>
            </button>
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
                    onClick={() => setActiveMateriaId(materia.id)}
                    className="px-3 py-1.5 bg-indigo-100 text-indigo-700 hover:bg-indigo-600 hover:text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Gerenciar Conteúdo
                  </button>
                  <button 
                    onClick={() => handleDeleteMateria(materia.id, materia.name)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
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
                  <button onClick={handleAddDiscipline} className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-colors border border-indigo-100 cursor-pointer">
                    <PlusCircle className="w-4 h-4" />
                  </button>
                  <button onClick={handleDeleteDiscipline} disabled={!selectedDisciplineId} className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-colors border border-rose-100 cursor-pointer disabled:opacity-50">
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
                  <button onClick={handleAddArea} disabled={!selectedDisciplineId} className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-colors border border-indigo-100 cursor-pointer disabled:opacity-50">
                    <PlusCircle className="w-4 h-4" />
                  </button>
                  <button onClick={handleDeleteArea} disabled={!selectedAreaId} className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-colors border border-rose-100 cursor-pointer disabled:opacity-50">
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
                className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                onClick={handleAddMateria}
                className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm cursor-pointer"
              >
                Salvar Matéria
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
