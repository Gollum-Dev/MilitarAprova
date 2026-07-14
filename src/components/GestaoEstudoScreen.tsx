import React, { useState, useEffect } from "react";
import { CheckCircle2, ChevronRight, BookOpen, Compass, ChevronDown, AlignLeft, ExternalLink, Shield, Video, Headphones, FileText, Presentation, HelpCircle, Award } from "lucide-react";
import { getResourceStatuses, getCompletedResourceIds } from "../lib/progress";

interface GestaoEstudoScreenProps {
  selectedCourse: any;
  onNavigateToSubject: (moduleId: string, contentId: number) => void;
}

export default function GestaoEstudoScreen({ selectedCourse, onNavigateToSubject }: GestaoEstudoScreenProps) {
  const [resourceStatuses, setResourceStatuses] = useState(getResourceStatuses());
  const [completedResources, setCompletedResources] = useState<string[]>([]);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [studyNotes, setStudyNotes] = useState<Record<string, string>>({});
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");

  useEffect(() => {
    // Expand the first module by default if none is expanded
    if (selectedCourse?.modules?.length > 0 && Object.keys(expandedModules).length === 0) {
      setExpandedModules({ [selectedCourse.modules[0].id]: true });
    }
    
    // Load notes from local storage
    const savedNotes = localStorage.getItem("aluno_notas_estudo");
    if (savedNotes) {
      setStudyNotes(JSON.parse(savedNotes));
    }

    setCompletedResources(getCompletedResourceIds());
  }, [selectedCourse]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const startEditingNote = (contentId: string, currentNote: string) => {
    setEditingNoteId(contentId);
    setNoteDraft(currentNote || "");
  };

  const saveNote = (contentId: string) => {
    const newNotes = { ...studyNotes, [contentId]: noteDraft };
    setStudyNotes(newNotes);
    localStorage.setItem("aluno_notas_estudo", JSON.stringify(newNotes));
    setEditingNoteId(null);
  };

  if (!selectedCourse) return null;

  return (
    <div className="space-y-6 animate-smooth-fade">
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-800 flex items-center">
            <Compass className="w-5 h-5 mr-2 text-blue-600" />
            Gestão de Estudo e Notas
          </h2>
          <p className="text-sm text-slate-500 mt-1 font-sans">
            Acompanhe seu progresso, marque matérias estudadas e registre suas anotações pessoais.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {selectedCourse.modules.map((mod: any) => {
          const isExpanded = expandedModules[mod.id];
          const rawDisc = mod.rawDiscipline;
          
          return (
            <div key={mod.id} className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden transition-all duration-300">
              {/* Module Header */}
              <div 
                className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => toggleModule(mod.id)}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-sans font-black text-slate-800">
                      {mod.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">{mod.description}</p>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                )}
              </div>

              {/* Module Content */}
              {isExpanded && rawDisc && Array.isArray(rawDisc.areas) && (
                <div className="p-6 space-y-8">
                  {rawDisc.areas.map((area: any) => (
                    <div key={area.id} className="space-y-4">
                      <h4 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2">
                        {area.name}
                      </h4>
                      
                      <div className="space-y-3">
                        {Array.isArray(area.contents) && area.contents.map((content: any) => {
                          const contentIdStr = content.id.toString();
                          const status = resourceStatuses[contentIdStr] || 'a-estudar';
                          const hasNote = studyNotes[contentIdStr] && studyNotes[contentIdStr].trim() !== "";
                          
                          let statusClasses = "bg-rose-50 text-rose-700 border-rose-200/50";
                          let statusLabel = "A Estudar";
                          
                          if (status === 'estudando') {
                            statusClasses = "bg-amber-50 text-amber-700 border-amber-200/50";
                            statusLabel = "Estudando";
                          } else if (status === 'estudado') {
                            statusClasses = "bg-emerald-50 text-emerald-700 border-emerald-200/50";
                            statusLabel = "Estudado";
                          }

                          let videoCount = 0, videoCompleted = 0;
                          let audioCount = 0, audioCompleted = 0;
                          let pdfCount = 0, pdfCompleted = 0;
                          let slidesCount = 0, slidesCompleted = 0;
                          let questionsCount = 0, questionsCompleted = 0;
                          let flashcardsCount = 0, flashcardsCompleted = 0;

                          if (Array.isArray(content.resources)) {
                            content.resources.forEach((r: any) => {
                              const isCompleted = completedResources.includes(r.id?.toString());
                              if (r.type === 'video') {
                                videoCount++;
                                if (isCompleted) videoCompleted++;
                              } else if (r.type === 'audio') {
                                audioCount++;
                                if (isCompleted) audioCompleted++;
                              } else if (r.type === 'pdf') {
                                pdfCount++;
                                if (isCompleted) pdfCompleted++;
                              } else if (r.type === 'slides') {
                                slidesCount++;
                                if (isCompleted) slidesCompleted++;
                              } else if (r.type === 'question' || r.type === 'questoes') {
                                questionsCount++;
                                if (isCompleted) questionsCompleted++;
                              } else if (r.type === 'flashcard' || r.type === 'flashcards' || r.type === 'award') {
                                flashcardsCount++;
                                if (isCompleted) flashcardsCompleted++;
                              }
                            });
                          }

                          const getColorClasses = (completed: number, total: number) => {
                            if (total === 0) return "";
                            if (completed === 0) return "bg-rose-50 border-rose-200 text-rose-700 [&>svg]:text-rose-500";
                            if (completed === total) return "bg-emerald-50 border-emerald-200 text-emerald-700 [&>svg]:text-emerald-500";
                            return "bg-amber-50 border-amber-200 text-amber-700 [&>svg]:text-amber-500";
                          };
                          return (
                            <div key={content.id} className="border border-slate-200/60 rounded-xl p-4 transition-all hover:border-blue-200 group">
                              <div className="flex flex-col md:flex-row justify-between gap-4">
                                
                                {/* Info and Navigation */}
                                <div className="flex-1">
                                  <div className="flex items-start space-x-3">
                                    <BookOpen className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                                    <div>
                                      <h5 className="text-sm font-sans font-bold text-slate-800">{content.name}</h5>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onNavigateToSubject(mod.id, content.id);
                                        }}
                                        className="text-[10px] font-bold font-mono text-blue-600 uppercase tracking-widest mt-2 hover:underline flex items-center space-x-1"
                                      >
                                        <ExternalLink className="w-3 h-3" />
                                        <span>Ir para a Matéria</span>
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                {/* Resource Badges (Moved to top right) */}
                                <div className="flex flex-wrap items-start justify-end gap-2 shrink-0 md:max-w-[50%]">
                                        {videoCount > 0 && (
                                          <span className={`flex items-center space-x-1 text-[10px] font-mono border px-1.5 py-0.5 rounded transition-colors ${getColorClasses(videoCompleted, videoCount)}`}>
                                            <Video className="w-3 h-3" />
                                            <span>{videoCompleted}/{videoCount}</span>
                                          </span>
                                        )}
                                        {audioCount > 0 && (
                                          <span className={`flex items-center space-x-1 text-[10px] font-mono border px-1.5 py-0.5 rounded transition-colors ${getColorClasses(audioCompleted, audioCount)}`}>
                                            <Headphones className="w-3 h-3" />
                                            <span>{audioCompleted}/{audioCount}</span>
                                          </span>
                                        )}
                                        {pdfCount > 0 && (
                                          <span className={`flex items-center space-x-1 text-[10px] font-mono border px-1.5 py-0.5 rounded transition-colors ${getColorClasses(pdfCompleted, pdfCount)}`}>
                                            <FileText className="w-3 h-3" />
                                            <span>{pdfCompleted}/{pdfCount}</span>
                                          </span>
                                        )}
                                        {slidesCount > 0 && (
                                          <span className={`flex items-center space-x-1 text-[10px] font-mono border px-1.5 py-0.5 rounded transition-colors ${getColorClasses(slidesCompleted, slidesCount)}`}>
                                            <Presentation className="w-3 h-3" />
                                            <span>{slidesCompleted}/{slidesCount}</span>
                                          </span>
                                        )}
                                        {questionsCount > 0 && (
                                          <span className={`flex items-center space-x-1 text-[10px] font-mono border px-1.5 py-0.5 rounded transition-colors ${getColorClasses(questionsCompleted, questionsCount)}`}>
                                            <HelpCircle className="w-3 h-3" />
                                            <span>{questionsCompleted}/{questionsCount}</span>
                                          </span>
                                        )}
                                        {flashcardsCount > 0 && (
                                          <span className={`flex items-center space-x-1 text-[10px] font-mono border px-1.5 py-0.5 rounded transition-colors ${getColorClasses(flashcardsCompleted, flashcardsCount)}`}>
                                            <Award className="w-3 h-3" />
                                            <span>{flashcardsCompleted}/{flashcardsCount}</span>
                                          </span>
                                        )}
                                </div>
                              </div>
                              
                              {/* Notes Area */}
                              <div className="mt-4 pt-4 border-t border-slate-100">
                                {editingNoteId === contentIdStr ? (
                                  <div className="space-y-2">
                                    <textarea 
                                      value={noteDraft}
                                      onChange={(e) => setNoteDraft(e.target.value)}
                                      placeholder="Digite suas anotações sobre este tópico..."
                                      className="w-full text-xs font-sans text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-3 min-h-[80px] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-y"
                                    />
                                    <div className="flex justify-end space-x-2">
                                      <button 
                                        onClick={() => setEditingNoteId(null)}
                                        className="px-3 py-1.5 text-[10px] font-bold uppercase text-slate-500 hover:bg-slate-100 rounded-md transition-colors"
                                      >
                                        Cancelar
                                      </button>
                                      <button 
                                        onClick={() => saveNote(contentIdStr)}
                                        className="px-3 py-1.5 text-[10px] font-bold uppercase text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                                      >
                                        Salvar Nota
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div 
                                    className="flex items-start space-x-2 group/note cursor-pointer"
                                    onClick={() => startEditingNote(contentIdStr, studyNotes[contentIdStr])}
                                  >
                                    <AlignLeft className={`w-4 h-4 mt-0.5 shrink-0 ${hasNote ? 'text-amber-500' : 'text-slate-300 group-hover/note:text-slate-400'}`} />
                                    <div className="flex-1">
                                      {hasNote ? (
                                        <p className="text-xs text-slate-600 font-sans italic whitespace-pre-line">{studyNotes[contentIdStr]}</p>
                                      ) : (
                                        <p className="text-xs text-slate-400 font-sans italic group-hover/note:text-slate-500">Nenhuma anotação de estudo. Clique para adicionar.</p>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>

                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
