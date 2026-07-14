import React, { useState, useEffect } from "react";
import { 
  Play, Pause, Volume2, Maximize, Lock, 
  BookOpen, ShieldAlert, Video, Headphones, ChevronDown
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { markResourceComplete, getResourceStatuses, setResourceStatus } from "../lib/progress";

// Custom Premium Status Selector
const StatusSelector = ({ 
  resourceId, 
  currentStatus, 
  onStatusChange 
}: { 
  resourceId: string; 
  currentStatus: 'a-estudar' | 'estudando' | 'estudado'; 
  onStatusChange: (status: 'a-estudar' | 'estudando' | 'estudado') => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClose = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("click", handleClose);
    return () => document.removeEventListener("click", handleClose);
  }, [isOpen]);

  let colorClass = "bg-rose-50/70 border-rose-200/50 text-rose-700 hover:bg-rose-50";
  let dotColor = "bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.5)]";
  let label = "A Estudar";

  if (currentStatus === 'estudando') {
    colorClass = "bg-amber-50/70 border-amber-200/50 text-amber-700 hover:bg-amber-50";
    dotColor = "bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.5)]";
    label = "Estudando";
  } else if (currentStatus === 'estudado') {
    colorClass = "bg-emerald-50/70 border-emerald-200/50 text-emerald-700 hover:bg-emerald-50";
    dotColor = "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]";
    label = "Estudado";
  }

  const handleSelect = (status: 'a-estudar' | 'estudando' | 'estudado', e: React.MouseEvent) => {
    e.stopPropagation();
    onStatusChange(status);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative inline-block shrink-0 z-30">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`flex items-center space-x-1.5 text-[9.5px] font-sans font-extrabold uppercase rounded-full px-3 py-1.5 border cursor-pointer transition-all duration-200 shadow-sm ${colorClass}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
        <span className="tracking-wider">{label}</span>
        <ChevronDown className="w-3.5 h-3.5 opacity-60" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-28 bg-white border border-slate-100 rounded-2xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)] py-1.5 z-50 animate-smooth-fade">
          <button
            onClick={(e) => handleSelect('a-estudar', e)}
            className="w-full text-left px-2.5 py-1.5 hover:bg-slate-50 text-[10px] font-sans text-slate-700 flex items-center space-x-2 border-none bg-transparent cursor-pointer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span className="font-bold uppercase tracking-wider text-[9px]">A Estudar</span>
          </button>
          <button
            onClick={(e) => handleSelect('estudando', e)}
            className="w-full text-left px-2.5 py-1.5 hover:bg-slate-50 text-[10px] font-sans text-slate-700 flex items-center space-x-2 border-none bg-transparent cursor-pointer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span className="font-bold uppercase tracking-wider text-[9px]">Estudando</span>
          </button>
          <button
            onClick={(e) => handleSelect('estudado', e)}
            className="w-full text-left px-2.5 py-1.5 hover:bg-slate-50 text-[10px] font-sans text-slate-700 flex items-center space-x-2 border-none bg-transparent cursor-pointer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="font-bold uppercase tracking-wider text-[9px]">Estudado</span>
          </button>
        </div>
      )}
    </div>
  );
};

// Custom Premium Video Selector Dropdown
const VideoSelector = ({
  videos,
  activeVideoIndex,
  onSelectVideo
}: {
  videos: any[];
  activeVideoIndex: number;
  onSelectVideo: (index: number) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClose = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("click", handleClose);
    return () => document.removeEventListener("click", handleClose);
  }, [isOpen]);

  const activeVideo = videos[activeVideoIndex];

  return (
    <div ref={containerRef} className="relative inline-block text-left shrink-0 z-30">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between space-x-2 text-xs font-sans font-bold text-slate-700 bg-white border border-slate-200 rounded-xl px-4 py-2 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-sm cursor-pointer min-w-[180px] max-w-[280px]"
      >
        <span className="truncate pr-1 text-left">{activeVideo?.title || "Selecione a Aula"}</span>
        <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-72 bg-white border border-slate-100 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] py-2 z-50 animate-smooth-fade max-h-64 overflow-y-auto">
          {videos.map((v, idx) => {
            const isActive = idx === activeVideoIndex;
            return (
              <button
                key={v.id || idx}
                onClick={() => {
                  onSelectVideo(idx);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-xs font-sans flex items-center space-x-2 border-none bg-transparent cursor-pointer transition-colors ${
                  isActive 
                    ? "bg-indigo-50/60 text-indigo-700 font-extrabold" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-indigo-600" : "bg-transparent"}`} />
                <span className="truncate">{v.title}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

interface AulasScreenProps {
  onAskTutor: (question: string) => void;
  disciplineName?: string;
  rawDiscipline?: any;
  selectedContentId?: number | null;
  videos?: any[];
  activeVideoIndex?: number;
  setActiveVideoIndex?: (index: number) => void;
}

export default function AulasScreen({ 
  disciplineName, 
  rawDiscipline, 
  selectedContentId,
  videos: propVideos,
  activeVideoIndex: propActiveVideoIndex,
  setActiveVideoIndex: propSetActiveVideoIndex
}: AulasScreenProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [resourceStatuses, setResourceStatuses] = useState<Record<string, 'a-estudar' | 'estudando' | 'estudado'>>({});
  const [internalVideos, setInternalVideos] = useState<any[]>([]);
  const [internalActiveVideoIndex, setInternalActiveVideoIndex] = useState(0);

  const videos = propVideos !== undefined ? propVideos : internalVideos;
  const activeVideoIndex = propActiveVideoIndex !== undefined ? propActiveVideoIndex : internalActiveVideoIndex;
  const setActiveVideoIndex = propSetActiveVideoIndex !== undefined ? propSetActiveVideoIndex : setInternalActiveVideoIndex;

  useEffect(() => {
    setResourceStatuses(getResourceStatuses());
  }, []);

  const renderStatusIndicator = (resourceId: string) => {
    const currentStatus = resourceStatuses[resourceId] || 'a-estudar';
    return (
      <StatusSelector
        resourceId={resourceId}
        currentStatus={currentStatus}
        onStatusChange={(nextStatus) => {
          setResourceStatus(resourceId, nextStatus);
          setResourceStatuses(getResourceStatuses());
        }}
      />
    );
  };

  const displayDiscipline = disciplineName || "Legislação Militar";

  useEffect(() => {
    if (videos.length > 0 && videos[activeVideoIndex]) {
      const vid = videos[activeVideoIndex];
      if (vid.id) {
        markResourceComplete(vid.id.toString());
      }
      localStorage.setItem("militar_last_resource_title", vid.title);
    }
  }, [activeVideoIndex, videos]);

  useEffect(() => {
    async function loadResources() {
      try {
        let loadedVideos: any[] = [];

        if (rawDiscipline) {
          if (Array.isArray(rawDiscipline.areas)) {
            rawDiscipline.areas.forEach((area: any) => {
              if (Array.isArray(area.contents)) {
                area.contents.forEach((content: any) => {
                  if (selectedContentId !== undefined && selectedContentId !== null && content.id !== selectedContentId) {
                    return;
                  }
                  const res = content.resources || [];
                  res.forEach((r: any) => {
                    if (r.type === 'video') {
                      loadedVideos.push({
                        ...r,
                        materiaName: content.name
                      });
                    }
                  });
                });
              }
            });
          }
        } else {
          const { data, error } = await supabase
            .from('materias')
            .eq('discipline', displayDiscipline);
            
          if (error) throw error;
          
          if (data) {
            data.forEach((m: any) => {
              const res = m.resources || [];
              res.forEach((r: any) => {
                if (r.type === 'video' && r.url) {
                  loadedVideos.push({
                    ...r,
                    materiaName: m.name
                  });
                }
              });
            });
          }
        }

        setInternalVideos(loadedVideos);
        setInternalActiveVideoIndex(0); // Reset index on load
      } catch (err) {
        console.error("Erro ao carregar recursos de vídeo:", err);
      }
    }
    loadResources();
  }, [displayDiscipline, rawDiscipline, selectedContentId]);

  const playlist = [
    { id: 1, title: `Aula 01: Introdução a ${displayDiscipline}`, duration: "24m", completed: true },
    { id: 2, title: `Aula 02: Teoria Geral e Doutrina de ${displayDiscipline}`, duration: "18m", completed: true },
    { id: 3, title: `Aula 03: Elementos Essenciais - ${displayDiscipline}`, duration: "32m", completed: true },
    { id: 4, title: `Aula 04: Casos Práticos e Jurisprudência`, duration: "28m", completed: true },
    { id: 5, title: `Aula 05: Aprofundamento no Edital CHO (Ativa)`, duration: "45m", active: true },
    { id: 6, title: `Aula 06: Organização das Forças Auxiliares`, duration: "20m", locked: true },
    { id: 7, title: `Aula 07: Exercícios Resolvidos de Concurso`, duration: "35m", locked: true },
    { id: 8, title: `Aula 08: Resumos e Dicas de Prova`, duration: "40m", locked: true }
  ];

  return (
    <div className="w-full" id="aulas-view-container">
      <div className="space-y-4">
        {videos.length === 0 ? (
          /* Mock Video Player */
          <div id="mock-video-player" className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg relative aspect-video flex flex-col justify-between group">
            {/* Top Info Overlay */}
            <div className="bg-gradient-to-b from-black/80 to-transparent p-4 flex justify-between items-center z-10 opacity-0 group-hover:opacity-100 transition-opacity">
              <div>
                <span className="text-[9px] font-mono text-amber-400 uppercase tracking-wider font-semibold">
                  Módulo 01 • {playlist[activeVideoIndex]?.title?.split(':')[0] || 'Aula 01'}
                </span>
                <h3 className="text-sm font-sans font-bold text-gray-100">
                  {displayDiscipline}
                </h3>
              </div>
              <span className="text-xs font-mono text-gray-300 bg-black/60 px-2 py-0.5 rounded">
                HD 1080p
              </span>
            </div>

            {/* Central Play/Pause Overlay */}
            <div className="absolute inset-0 flex items-center justify-center z-0">
              {/* Visual simulation screen */}
              <div className="absolute inset-0 bg-slate-950/75 flex items-center justify-center">
                <div className="text-center p-6 space-y-4 max-w-md">
                  <ShieldAlert className="w-16 h-16 text-emerald-600 mx-auto opacity-40 animate-pulse" />
                  <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">
                    Centro de Doutrina Cabo Véio
                  </p>
                  <h4 className="text-lg font-sans font-bold text-gray-100">
                    {playlist[activeVideoIndex]?.title?.toUpperCase() || 'AULA 01'}
                  </h4>
                </div>
              </div>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-16 h-16 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-lg transition-all transform hover:scale-110 active:scale-95 z-10 cursor-pointer border-none"
              >
                {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
              </button>
            </div>

            {/* Bottom Control Bar Overlay */}
            <div className="bg-gradient-to-t from-black/90 to-transparent p-4 space-y-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
              {/* Timeline slider */}
              <div className="w-full h-1 bg-gray-800 rounded-full cursor-pointer relative">
                <div className="absolute top-0 left-0 h-full bg-indigo-600 rounded-full" style={{ width: isPlaying ? "40%" : "25%" }} />
                <div className="absolute top-[-3px] w-2.5 h-2.5 rounded-full bg-indigo-600 shadow" style={{ left: isPlaying ? "40%" : "25%" }} />
              </div>

              <div className="flex justify-between items-center text-xs font-mono text-gray-300">
                <div className="flex items-center space-x-4">
                  <button onClick={() => setIsPlaying(!isPlaying)} className="hover:text-indigo-500 transition-colors cursor-pointer">
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <span className="text-[11px]">{isPlaying ? "18:24" : "11:15"} / 45:00</span>
                </div>
                <div className="flex items-center space-x-4">
                  <Volume2 className="w-4 h-4 cursor-pointer hover:text-white" />
                  <Maximize 
                    className="w-4 h-4 cursor-pointer hover:text-white" 
                    onClick={() => {
                      const elem = document.getElementById('mock-video-player');
                      if (elem) {
                        if (document.fullscreenElement) {
                          document.exitFullscreen().catch(err => console.log(err));
                        } else {
                          elem.requestFullscreen().catch(err => console.log(err));
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Secure Real Video Player */
          <div className="bg-black border border-slate-800 rounded-2xl overflow-hidden shadow-lg relative aspect-video">
            <iframe
              src={(() => {
                const video = videos[activeVideoIndex];
                if (!video || !video.url) return '';
                
                const url = video.url;
                if (url.includes('drive.google.com')) {
                  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
                  if (match && match[1]) {
                    return `https://drive.google.com/file/d/${match[1]}/preview`;
                  }
                }
                return url;
              })()}
              className="w-full h-full border-none"
              title={videos[activeVideoIndex]?.title || 'Vídeo'}
              allow="autoplay; fullscreen"
              allowFullScreen
            />
            {/* Película de proteção transparente absoluta que impede cliques nas ações superiores do Google Drive */}
            <div className="absolute top-0 right-0 left-0 h-16 bg-transparent cursor-default" />
          </div>
        )}
      </div>
    </div>
  );
}
