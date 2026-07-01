import React, { useState } from "react";
import { BookOpen, X, Save, PlusCircle, Trash2, ChevronDown, ChevronUp, Video, Headphones, FileText, HelpCircle, Layers, FileCheck, Eye, Edit2, ArrowLeft, FolderOpen, ChevronRight } from "lucide-react";

export type ResourceType = 'video' | 'audio' | 'question' | 'summary' | 'flashcard' | 'pdf';

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
  disciplines?: Discipline[];
}

interface CourseEditorProps {
  course: CourseData;
  institutions: string[];
  onSave: (updatedCourse: CourseData) => void;
  onCancel: () => void;
}

export default function CourseEditor({ course, institutions, onSave, onCancel }: CourseEditorProps) {
  const [title, setTitle] = useState(course.title);
  const [institution, setInstitution] = useState(course.institution);
  const [year, setYear] = useState(course.year);
  const [disciplines, setDisciplines] = useState<Discipline[]>(course.disciplines || []);
  
  // UI States (Focus Navigation)
  const [activeDisciplineId, setActiveDisciplineId] = useState<number | null>(null);
  const [activeAreaId, setActiveAreaId] = useState<number | null>(null);
  const [activeContentId, setActiveContentId] = useState<number | null>(null);
  
  // Resource Form & Tab States
  const [activeResourceTab, setActiveResourceTab] = useState<{ [contentId: number]: ResourceType | null }>({});
  const [addingResourceToContent, setAddingResourceToContent] = useState<number | null>(null);
  const [editingResourceId, setEditingResourceId] = useState<number | null>(null);
  const [newResourceType, setNewResourceType] = useState<ResourceType>('video');
  const [newResourceTitle, setNewResourceTitle] = useState("");
  const [newResourceUrl, setNewResourceUrl] = useState("");

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

  const handleEditResource = (contentId: number, resource: Resource) => {
    setAddingResourceToContent(contentId);
    setEditingResourceId(resource.id);
    setNewResourceType(resource.type);
    setNewResourceTitle(resource.title);
    setNewResourceUrl(resource.url);
  };

  const handleAddDiscipline = () => {
    const name = window.prompt("Nome da nova Disciplina (Ex: Direito Constitucional):");
    if (name && name.trim()) {
      const newId = Date.now();
      setDisciplines([...disciplines, { id: newId, name: name.trim(), areas: [] }]);
      setActiveDisciplineId(newId);
      setActiveAreaId(null);
      setActiveContentId(null);
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

  const handleAddContent = (disciplineId: number, areaId: number) => {
    const name = window.prompt("Nome da nova Matéria / Conteúdo (Ex: Compreensão de Textos):");
    if (name && name.trim()) {
      setDisciplines(disciplines.map(d => {
        if (d.id === disciplineId) {
          return {
            ...d,
            areas: d.areas.map(a => {
              if (a.id === areaId) {
                return {
                  ...a,
                  contents: [...a.contents, { id: Date.now(), name: name.trim(), resources: [] }]
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

  const handleSaveResource = (disciplineId: number, areaId: number, contentId: number) => {
    if (!newResourceTitle.trim() || !newResourceUrl.trim()) {
      alert("Por favor, preencha o Título e o Link para salvar o recurso.");
      return;
    }

    setDisciplines(disciplines.map(d => {
      if (d.id === disciplineId) {
        return {
          ...d,
          areas: d.areas.map(a => {
            if (a.id === areaId) {
              return {
                ...a,
                contents: a.contents.map(c => {
                  if (c.id === contentId) {
                    let updatedResources = c.resources || [];
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
    }));

    setAddingResourceToContent(null);
    setEditingResourceId(null);
    setNewResourceTitle("");
    setNewResourceUrl("");
    setNewResourceType('video');
  };

  const handleDeleteResource = (disciplineId: number, areaId: number, contentId: number, resourceId: number) => {
    if (window.confirm("Excluir este recurso?")) {
      setDisciplines(disciplines.map(d => {
        if (d.id === disciplineId) {
          return {
            ...d,
            areas: d.areas.map(a => {
              if (a.id === areaId) {
                return {
                  ...a,
                  contents: a.contents.map(c => {
                    if (c.id === contentId) {
                      return {
                        ...c,
                        resources: (c.resources || []).filter(r => r.id !== resourceId)
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
      }));
    }
  };

  const getResourceIcon = (type: ResourceType, className = "w-4 h-4") => {
    switch(type) {
      case 'video': return <Video className={className} />;
      case 'audio': return <Headphones className={className} />;
      case 'pdf': return <FileText className={className} />;
      case 'summary': return <FileCheck className={className} />;
      case 'flashcard': return <Layers className={className} />;
      case 'question': return <HelpCircle className={className} />;
      default: return <FileText className={className} />;
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...course,
      title,
      institution,
      year,
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
            placeholder="Digite o nome do curso..."
            className="w-full bg-transparent border-none outline-none focus:ring-0 p-0 m-0"
            form="course-editor-form"
          />
        </h3>
        <button 
          onClick={onCancel}
          className="px-4 py-2 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para Lista</span>
        </button>
      </div>
      
      {/* Body */}
      <div className="relative z-0">
        <form id="course-editor-form" onSubmit={handleSave} className="space-y-8 max-w-7xl w-full mx-auto pb-10">

          {/* Estrutura Curricular */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-sm font-bold font-sans text-slate-800 uppercase tracking-wider">Grade Curricular</h4>
            </div>

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
                  </div>

                  {/* Level 0: Disciplinas */}
                  {!activeDiscipline && (
                    <div>
                      <div className="flex justify-end mb-4">
                        <button 
                          type="button"
                          onClick={handleAddDiscipline}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-sans font-bold uppercase tracking-wider transition-colors shadow-sm flex items-center space-x-2 cursor-pointer"
                        >
                          <PlusCircle className="w-4 h-4" />
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
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-sans font-bold uppercase tracking-wider transition-colors shadow-sm flex items-center space-x-2 cursor-pointer"
                        >
                          <PlusCircle className="w-4 h-4" />
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
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-sans font-bold uppercase tracking-wider transition-colors shadow-sm flex items-center space-x-2 cursor-pointer"
                        >
                          <PlusCircle className="w-4 h-4" />
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
                                  onClick={() => setActiveContentId(content.id)}
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
                      <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                          <FileText className="w-5 h-5" />
                        </div>
                        <h5 className="font-display font-bold text-slate-800 text-lg">Conteúdos de {activeContent.name}</h5>
                      </div>
                      
                      {/* Tabs Buttons */}
                      <div className="flex flex-wrap items-center gap-1.5 mb-4 border-b border-slate-100 pb-3">
                        <button type="button" onClick={() => toggleResourceTab(activeContent.id, 'video')} className={`px-2.5 py-1.5 text-[9px] font-bold uppercase rounded-md flex items-center space-x-1 cursor-pointer transition-colors border ${activeResourceTab[activeContent.id] === 'video' ? 'bg-rose-100 text-rose-700 border-rose-300' : 'text-rose-600 bg-rose-50 hover:bg-rose-100 border-rose-100'}`}><Video className="w-3 h-3" /><span>Vídeo</span></button>
                        <button type="button" onClick={() => toggleResourceTab(activeContent.id, 'audio')} className={`px-2.5 py-1.5 text-[9px] font-bold uppercase rounded-md flex items-center space-x-1 cursor-pointer transition-colors border ${activeResourceTab[activeContent.id] === 'audio' ? 'bg-purple-100 text-purple-700 border-purple-300' : 'text-purple-600 bg-purple-50 hover:bg-purple-100 border-purple-100'}`}><Headphones className="w-3 h-3" /><span>Áudio</span></button>
                        <button type="button" onClick={() => toggleResourceTab(activeContent.id, 'pdf')} className={`px-2.5 py-1.5 text-[9px] font-bold uppercase rounded-md flex items-center space-x-1 cursor-pointer transition-colors border ${activeResourceTab[activeContent.id] === 'pdf' ? 'bg-blue-100 text-blue-700 border-blue-300' : 'text-blue-600 bg-blue-50 hover:bg-blue-100 border-blue-100'}`}><FileText className="w-3 h-3" /><span>PDF</span></button>
                        <button type="button" onClick={() => toggleResourceTab(activeContent.id, 'summary')} className={`px-2.5 py-1.5 text-[9px] font-bold uppercase rounded-md flex items-center space-x-1 cursor-pointer transition-colors border ${activeResourceTab[activeContent.id] === 'summary' ? 'bg-emerald-100 text-emerald-700 border-emerald-300' : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border-emerald-100'}`}><FileCheck className="w-3 h-3" /><span>Resumo</span></button>
                        <button type="button" onClick={() => toggleResourceTab(activeContent.id, 'flashcard')} className={`px-2.5 py-1.5 text-[9px] font-bold uppercase rounded-md flex items-center space-x-1 cursor-pointer transition-colors border ${activeResourceTab[activeContent.id] === 'flashcard' ? 'bg-amber-100 text-amber-700 border-amber-300' : 'text-amber-600 bg-amber-50 hover:bg-amber-100 border-amber-100'}`}><Layers className="w-3 h-3" /><span>Cards</span></button>
                        <button type="button" onClick={() => toggleResourceTab(activeContent.id, 'question')} className={`px-2.5 py-1.5 text-[9px] font-bold uppercase rounded-md flex items-center space-x-1 cursor-pointer transition-colors border ${activeResourceTab[activeContent.id] === 'question' ? 'bg-indigo-100 text-indigo-700 border-indigo-300' : 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border-indigo-100'}`}><HelpCircle className="w-3 h-3" /><span>Questões</span></button>
                      </div>

                      {/* Tab Content */}
                      {activeResourceTab[activeContent.id] && (() => {
                        const activeType = activeResourceTab[activeContent.id]!;
                        const filteredResources = (activeContent.resources || []).filter(r => r.type === activeType);
                        
                        return (
                          <div className="bg-slate-50/50 rounded-lg p-3 border border-slate-100 animate-smooth-fade">
                            
                            {/* Resources List */}
                            {filteredResources.length === 0 ? (
                              <div className="text-center py-4 text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-2">
                                Nenhum recurso cadastrado.
                              </div>
                            ) : (
                              <div className="space-y-1.5 mb-3">
                                {filteredResources.map(resource => (
                                  <div key={resource.id} className="flex items-center justify-between py-2 px-3 bg-white rounded-lg border border-slate-200 shadow-sm group/res">
                                    <div className="flex items-center space-x-3 flex-1 min-w-0 mr-4">
                                      <div className="p-1.5 bg-slate-50 text-slate-500 rounded border border-slate-100">
                                        {getResourceIcon(resource.type, "w-3.5 h-3.5")}
                                      </div>
                                      <span className="text-xs font-bold text-slate-700 truncate flex-1" title={resource.title}>{resource.title}</span>
                                    </div>
                                    <div className="flex items-center space-x-1 opacity-0 group-hover/res:opacity-100 transition-all">
                                      <a href={resource.url} target="_blank" rel="noreferrer" className="p-1.5 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-100 rounded-md cursor-pointer transition-colors" title="Visualizar">
                                        <Eye className="w-4 h-4" />
                                      </a>
                                      <button type="button" onClick={() => handleEditResource(activeContent.id, resource)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-100 rounded-md cursor-pointer transition-colors" title="Editar">
                                        <Edit2 className="w-4 h-4" />
                                      </button>
                                      <button type="button" onClick={() => handleDeleteResource(activeDiscipline.id, activeArea.id, activeContent.id, resource.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-100 rounded-md cursor-pointer transition-colors" title="Excluir">
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Add Resource Button (shows if form is closed) */}
                            {addingResourceToContent !== activeContent.id && (
                              <button 
                                type="button" 
                                onClick={() => handleStartAddResource(activeContent.id, activeType)}
                                className="w-full py-2.5 bg-white hover:bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors border border-dashed border-indigo-200 flex items-center justify-center space-x-1 cursor-pointer"
                              >
                                <PlusCircle className="w-3.5 h-3.5" />
                                <span>Cadastrar Novo</span>
                              </button>
                            )}

                            {/* Inline Form */}
                            {addingResourceToContent === activeContent.id && (
                              <div className="mt-2 p-4 bg-white rounded-xl border border-indigo-200 space-y-4 shadow-sm animate-smooth-fade">
                                <div className="flex items-center space-x-2 border-b border-slate-100 pb-2 mb-2">
                                  <div className="p-1.5 bg-indigo-50 rounded-md text-indigo-600 border border-indigo-100">
                                    {getResourceIcon(newResourceType, "w-4 h-4")}
                                  </div>
                                  <h6 className="text-xs font-bold text-indigo-800 uppercase tracking-wider">
                                    {editingResourceId ? 'Editar' : 'Cadastrar Novo'} {newResourceType === 'video' ? 'Vídeo Aula' : newResourceType === 'audio' ? 'Áudio Aula' : newResourceType === 'pdf' ? 'Material PDF' : newResourceType === 'summary' ? 'Resumo' : newResourceType === 'flashcard' ? 'Flashcard' : 'Questões'}
                                  </h6>
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1.5">Título do Recurso *</label>
                                    <input type="text" value={newResourceTitle} onChange={e => setNewResourceTitle(e.target.value)} placeholder="Ex: Aula 01 - Introdução" className="w-full p-2.5 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all"/>
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1.5">Link (URL) *</label>
                                    <input type="url" value={newResourceUrl} onChange={e => setNewResourceUrl(e.target.value)} placeholder="https://..." className="w-full p-2.5 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all"/>
                                  </div>
                                </div>
                                <div className="flex justify-end space-x-2 pt-2">
                                  <button type="button" onClick={() => { setAddingResourceToContent(null); setEditingResourceId(null); }} className="px-4 py-2 text-[10px] font-bold text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer uppercase">Cancelar</button>
                                  <button type="button" onClick={() => handleSaveResource(activeDiscipline.id, activeArea.id, activeContent.id)} className="px-4 py-2 text-[10px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer uppercase shadow-sm">{editingResourceId ? 'Salvar Alterações' : 'Cadastrar'}</button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}

                </div>
              );
            })()}
          </section>

        </form>
      </div>

      {/* Footer / Actions */}
      <div className="p-4 border-t border-slate-100 bg-white flex justify-end space-x-4 shrink-0 rounded-b-2xl z-10">
        <button 
          type="button"
          onClick={onCancel}
          className="px-6 py-3 text-slate-500 border border-slate-200 font-bold uppercase tracking-wider text-xs hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
        >
          Cancelar
        </button>
        <button 
          type="submit"
          form="course-editor-form"
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-sans font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer active:scale-95"
        >
          <Save className="w-4 h-4" />
          <span>Salvar Alterações</span>
        </button>
      </div>
    </div>
  );
}
