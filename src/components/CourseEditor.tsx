import React, { useState } from "react";
import { BookOpen, X, Save, PlusCircle, Trash2, ChevronDown, ChevronUp, Video, Headphones, FileText, HelpCircle, Layers, FileCheck } from "lucide-react";

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
  
  // UI States
  const [expandedDisciplines, setExpandedDisciplines] = useState<number[]>([]);
  
  // Resource Form States
  const [addingResourceToContent, setAddingResourceToContent] = useState<number | null>(null);
  const [newResourceType, setNewResourceType] = useState<ResourceType>('video');
  const [newResourceTitle, setNewResourceTitle] = useState("");
  const [newResourceUrl, setNewResourceUrl] = useState("");

  const toggleDiscipline = (id: number) => {
    setExpandedDisciplines(prev => 
      prev.includes(id) ? prev.filter(dId => dId !== id) : [...prev, id]
    );
  };

  const handleAddDiscipline = () => {
    const name = window.prompt("Nome da nova Disciplina (Ex: Direito Constitucional):");
    if (name && name.trim()) {
      const newId = Date.now();
      setDisciplines([...disciplines, { id: newId, name: name.trim(), areas: [] }]);
      setExpandedDisciplines([...expandedDisciplines, newId]);
    }
  };

  const handleDeleteDiscipline = (id: number) => {
    if (window.confirm("Excluir esta disciplina e todas as suas matérias?")) {
      setDisciplines(disciplines.filter(d => d.id !== id));
    }
  };

  const handleAddArea = (disciplineId: number) => {
    const name = window.prompt("Nome do novo Eixo Temático / Área (Ex: Conhecimentos Básicos):");
    if (name && name.trim()) {
      setDisciplines(disciplines.map(d => {
        if (d.id === disciplineId) {
          return {
            ...d,
            areas: [...d.areas, { id: Date.now(), name: name.trim(), contents: [] }]
          };
        }
        return d;
      }));
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
    if (!newResourceTitle.trim() || !newResourceUrl.trim()) return;

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
                      resources: [...(c.resources || []), {
                        id: Date.now(),
                        type: newResourceType,
                        title: newResourceTitle,
                        url: newResourceUrl
                      }]
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
    <div className="glass-panel rounded-2xl border border-slate-200 relative animate-smooth-fade flex flex-col h-[calc(100vh-120px)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0 bg-white z-10">
        <h3 className="text-xl font-display font-bold text-slate-800 flex items-center space-x-2">
          <BookOpen className="w-6 h-6 text-indigo-600" />
          <span>Editor de Curso</span>
        </h3>
        <button 
          onClick={onCancel}
          className="p-2 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-full transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-200 relative z-0">
        <form id="course-editor-form" onSubmit={handleSave} className="space-y-8 max-w-4xl mx-auto pb-10">
          
          {/* Informações Básicas */}
          <section className="bg-slate-50 p-6 rounded-xl border border-slate-100">
            <h4 className="text-sm font-bold font-sans text-slate-800 mb-4 uppercase tracking-wider">Informações Básicas</h4>
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-sans font-bold text-slate-600 uppercase tracking-wider mb-2">Nome do Curso</label>
                <input 
                  type="text" 
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-sans text-slate-800"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-sans font-bold text-slate-600 uppercase tracking-wider mb-2">Instituição</label>
                  <select 
                    required
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
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
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-sans text-slate-800"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Estrutura Curricular (Disciplinas e Matérias) */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-sm font-bold font-sans text-slate-800 uppercase tracking-wider">Grade Curricular</h4>
              <button 
                type="button"
                onClick={handleAddDiscipline}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-sans font-bold uppercase tracking-wider transition-colors shadow-sm flex items-center space-x-2 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Nova Disciplina</span>
              </button>
            </div>

            {disciplines.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <p className="text-slate-500 font-medium">Nenhuma disciplina cadastrada.</p>
                <p className="text-xs text-slate-400 mt-1">Clique no botão acima para começar a montar a estrutura do curso.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {disciplines.map((discipline, dIndex) => {
                  const isExpanded = expandedDisciplines.includes(discipline.id);
                  return (
                    <div key={discipline.id} className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                      {/* Discipline Header */}
                      <div className="flex items-center justify-between p-4 bg-slate-50 border-b border-slate-100">
                        <div 
                          className="flex items-center space-x-3 cursor-pointer flex-1"
                          onClick={() => toggleDiscipline(discipline.id)}
                        >
                          <div className="w-8 h-8 rounded bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs shrink-0">
                            {dIndex + 1}
                          </div>
                          <h5 className="font-sans font-bold text-slate-800 text-sm flex-1">{discipline.name}</h5>
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <button 
                            type="button"
                            onClick={() => handleDeleteDiscipline(discipline.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer" 
                            title="Excluir Disciplina"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Discipline Body (Areas -> Contents) */}
                      {isExpanded && (
                        <div className="p-4 bg-white">
                          <div className="pl-11 pr-4">
                            {discipline.areas.length === 0 ? (
                              <p className="text-xs text-slate-400 italic mb-3">Nenhum Eixo Temático/Área cadastrado nesta disciplina.</p>
                            ) : (
                              <div className="space-y-4 mb-4">
                                {discipline.areas.map((area, aIndex) => (
                                  <div key={area.id} className="border border-slate-100 rounded-lg p-3 bg-slate-50/50">
                                    <div className="flex justify-between items-center mb-2">
                                      <h6 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center">
                                        <span className="text-indigo-400 mr-2">EIXO {aIndex + 1}:</span>
                                        {area.name}
                                      </h6>
                                      <button 
                                        type="button"
                                        onClick={() => handleDeleteArea(discipline.id, area.id)}
                                        className="text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                                        title="Remover Eixo"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                    
                                    <ul className="space-y-1 ml-4 mt-2 border-l-2 border-slate-200 pl-3">
                                      {area.contents.length === 0 && (
                                        <li className="text-[10px] text-slate-400 italic">Sem conteúdos cadastrados.</li>
                                      )}
                                      {area.contents.map((content) => (
                                        <li key={content.id} className="py-2 hover:bg-slate-50 px-3 rounded-lg border border-transparent hover:border-slate-100 transition-colors mb-2 list-none">
                                          <div className="flex items-center justify-between group">
                                            <span className="text-[12px] text-slate-700 font-bold">
                                              {content.name}
                                            </span>
                                            <div className="flex items-center space-x-2">
                                              <button 
                                                type="button"
                                                onClick={() => setAddingResourceToContent(content.id)}
                                                className="text-[10px] font-bold text-indigo-500 hover:text-indigo-700 uppercase tracking-wider flex items-center space-x-1 cursor-pointer opacity-0 group-hover:opacity-100 transition-all"
                                              >
                                                <PlusCircle className="w-3 h-3" />
                                                <span>Recurso</span>
                                              </button>
                                              <button 
                                                type="button"
                                                onClick={() => handleDeleteContent(discipline.id, area.id, content.id)}
                                                className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                                                title="Remover Conteúdo"
                                              >
                                                <X className="w-3.5 h-3.5" />
                                              </button>
                                            </div>
                                          </div>
                                          
                                          {/* Resources List */}
                                          {content.resources && content.resources.length > 0 && (
                                            <div className="mt-2 space-y-1.5 pl-2 border-l border-slate-200">
                                              {content.resources.map(resource => (
                                                <div key={resource.id} className="flex items-center justify-between py-1 px-2 bg-white rounded border border-slate-100 group/res">
                                                  <div className="flex items-center space-x-2">
                                                    <div className="p-1 bg-indigo-50 text-indigo-500 rounded">
                                                      {getResourceIcon(resource.type, "w-3 h-3")}
                                                    </div>
                                                    <span className="text-[11px] text-slate-600 truncate max-w-[200px]" title={resource.title}>{resource.title}</span>
                                                    <a href={resource.url} target="_blank" rel="noreferrer" className="text-[9px] text-indigo-400 hover:text-indigo-600 underline">Link</a>
                                                  </div>
                                                  <button 
                                                    type="button"
                                                    onClick={() => handleDeleteResource(discipline.id, area.id, content.id, resource.id)}
                                                    className="text-slate-300 hover:text-rose-500 opacity-0 group-hover/res:opacity-100 transition-all cursor-pointer"
                                                    title="Remover Recurso"
                                                  >
                                                    <Trash2 className="w-3 h-3" />
                                                  </button>
                                                </div>
                                              ))}
                                            </div>
                                          )}

                                          {/* Inline Add Resource Form */}
                                          {addingResourceToContent === content.id && (
                                            <div className="mt-3 p-3 bg-indigo-50/50 rounded-lg border border-indigo-100 space-y-3">
                                              <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Tipo</label>
                                                  <select 
                                                    value={newResourceType} 
                                                    onChange={e => setNewResourceType(e.target.value as ResourceType)}
                                                    className="w-full p-2 text-xs bg-white border border-slate-200 rounded outline-none focus:border-indigo-400 cursor-pointer"
                                                  >
                                                    <option value="video">Vídeo Aula</option>
                                                    <option value="audio">Áudio Aula</option>
                                                    <option value="pdf">Material PDF</option>
                                                    <option value="summary">Resumo</option>
                                                    <option value="flashcard">Flashcards</option>
                                                    <option value="question">Questões</option>
                                                  </select>
                                                </div>
                                                <div>
                                                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Título</label>
                                                  <input 
                                                    type="text" 
                                                    value={newResourceTitle} 
                                                    onChange={e => setNewResourceTitle(e.target.value)}
                                                    placeholder="Ex: Aula 01 - Introdução"
                                                    className="w-full p-2 text-xs bg-white border border-slate-200 rounded outline-none focus:border-indigo-400"
                                                  />
                                                </div>
                                              </div>
                                              <div>
                                                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Link (URL)</label>
                                                <input 
                                                  type="url" 
                                                  value={newResourceUrl} 
                                                  onChange={e => setNewResourceUrl(e.target.value)}
                                                  placeholder="https://..."
                                                  className="w-full p-2 text-xs bg-white border border-slate-200 rounded outline-none focus:border-indigo-400"
                                                />
                                              </div>
                                              <div className="flex justify-end space-x-2 pt-1">
                                                <button type="button" onClick={() => setAddingResourceToContent(null)} className="px-3 py-1.5 text-[10px] font-bold text-slate-500 hover:bg-slate-200 rounded transition-colors cursor-pointer uppercase">Cancelar</button>
                                                <button type="button" onClick={() => handleSaveResource(discipline.id, area.id, content.id)} className="px-3 py-1.5 text-[10px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded transition-colors cursor-pointer uppercase">Adicionar</button>
                                              </div>
                                            </div>
                                          )}
                                        </li>
                                      ))}
                                    </ul>
                                    <button 
                                      type="button"
                                      onClick={() => handleAddContent(discipline.id, area.id)}
                                      className="text-[10px] font-bold text-indigo-500 hover:text-indigo-700 uppercase tracking-wider flex items-center space-x-1 cursor-pointer transition-colors mt-2 ml-4"
                                    >
                                      <PlusCircle className="w-3 h-3" />
                                      <span>Adicionar Matéria/Conteúdo</span>
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                            <button 
                              type="button"
                              onClick={() => handleAddArea(discipline.id)}
                              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-wider flex items-center space-x-1 cursor-pointer transition-colors mt-2"
                            >
                              <PlusCircle className="w-3 h-3" />
                              <span>Adicionar Eixo Temático</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
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
