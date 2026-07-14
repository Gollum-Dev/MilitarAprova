import React, { useState, useEffect } from "react";
import { 
  BookOpen, FileText, HelpCircle, ChevronRight, Bot, ArrowRight, 
  Award, Trophy, PlayCircle, ArrowLeft, GraduationCap, Video, Layers, Sparkles, Scale, LineChart, Headphones, Play, Pause, Volume2, Eye, X, Presentation, CheckCircle, XCircle, Filter, ChevronDown
} from "lucide-react";
import { CourseModule, Course } from "../data";
import { fetchCourses } from "../lib/api";
import { markResourceComplete, getCompletedResourceIds, getResourceStatuses, setResourceStatus } from "../lib/progress";
import AulasScreen from "./AulasScreen";
import QuestoesScreen from "./QuestoesScreen";
import SimuladoresScreen from "./SimuladoresScreen";
import LeisInteligentesScreen from "./LeisInteligentesScreen";
import TutorIAScreen from "./TutorIAScreen";
import DesempenhoScreen from "./DesempenhoScreen";
import GestaoEstudoScreen from "./GestaoEstudoScreen";
import PdfSlidesViewer from "./PdfSlidesViewer";

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
    <div ref={containerRef} className={`relative inline-block shrink-0 ${isOpen ? 'z-50' : 'z-10'}`}>
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
        <div className="absolute left-0 mt-1.5 w-28 bg-white border border-slate-100 rounded-2xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)] py-1.5 z-50 animate-smooth-fade">
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
    <div ref={containerRef} className={`relative inline-block text-left shrink-0 ${isOpen ? 'z-50' : 'z-10'}`}>
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

interface MeusCursosProps {
  onChangeTab: (tab: string) => void;
  onAskTutor: (question: string) => void;
  selectedCourseId: string | null;
  setSelectedCourseId: (id: string | null) => void;
  selectedModuleId: string | null;
  setSelectedModuleId: (id: string | null) => void;
  selectedContentId: number | null;
  setSelectedContentId: (id: number | null) => void;
  courseActiveTab: "materias" | "simuladores" | "leis" | "tutor" | "desempenho" | "gestao";
  setCourseActiveTab: (tab: "materias" | "simuladores" | "leis" | "tutor" | "desempenho" | "gestao") => void;
  subjectActiveTab: "aulas" | "materiais" | "questoes" | "flashcards" | "audio" | "slides";
  setSubjectActiveTab: (tab: "aulas" | "materiais" | "questoes" | "flashcards" | "audio" | "slides") => void;
  tutorInitialPrompt: string;
  onClearTutorPrompt: () => void;
  allowedCourses?: string[];
  userName: string;
}

export default function MeusCursos({ 
  onChangeTab, onAskTutor, 
  selectedCourseId, setSelectedCourseId, selectedModuleId, setSelectedModuleId,
  selectedContentId, setSelectedContentId,
  courseActiveTab, setCourseActiveTab, subjectActiveTab, setSubjectActiveTab,
  tutorInitialPrompt, onClearTutorPrompt, allowedCourses, userName
}: MeusCursosProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [resourceStatuses, setResourceStatuses] = useState<Record<string, 'a-estudar' | 'estudando' | 'estudado'>>({});
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [activePdfIndex, setActivePdfIndex] = useState(0);

  const capitalizeFirstOnly = (text: string) => {
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };

  useEffect(() => {
    setResourceStatuses(getResourceStatuses());
  }, []);

  useEffect(() => {
    setActiveVideoIndex(0);
    setActivePdfIndex(0);
  }, [selectedContentId]);

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
  const [quickQuestion, setQuickQuestion] = useState("");
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [flashcardStatuses, setFlashcardStatuses] = useState<{
    [cardId: string]: {
      opened: boolean;
      answered: boolean;
      rating?: "easy" | "medium" | "hard";
    }
  }>({});
  const [flashcardDisciplineFilter, setFlashcardDisciplineFilter] = useState("Todas");
  const [flashcardSubjectFilter, setFlashcardSubjectFilter] = useState("Todos");

  // Audio Player States & Ref
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [currentPlayingAudio, setCurrentPlayingAudio] = useState<any | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState("00:00");
  const [audioDuration, setAudioDuration] = useState("00:00");

  // Secure PDF Viewer States
  const [viewingPdfUrl, setViewingPdfUrl] = useState<string | null>(null);
  const [viewingPdfTitle, setViewingPdfTitle] = useState<string>("");
  const [isPdfMaximized, setIsPdfMaximized] = useState(false);
  const [viewingPdfType, setViewingPdfType] = useState<"pdf" | "slides" | null>(null);
  const [expandedDisciplines, setExpandedDisciplines] = useState<Record<string, boolean>>({});

  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return "00:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };



  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      if (audio.duration) {
        setAudioProgress((audio.currentTime / audio.duration) * 100);
        setAudioCurrentTime(formatTime(audio.currentTime));
      }
    };

    const handleLoadedMetadata = () => {
      setAudioDuration(formatTime(audio.duration));
    };

    const handleEnded = () => {
      setIsAudioPlaying(false);
      setAudioProgress(0);
      setAudioCurrentTime("00:00");
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      if (currentPlayingAudio?.url) {
        if (!currentPlayingAudio.url.includes('drive.google.com')) {
          audioRef.current.src = currentPlayingAudio.url;
          audioRef.current.play()
            .then(() => setIsAudioPlaying(true))
            .catch(err => console.error("Erro ao reproduzir áudio:", err));
        } else {
          audioRef.current.pause();
          setIsAudioPlaying(true); // Mock tocando para o Drive
        }
      } else {
        audioRef.current.pause();
        setIsAudioPlaying(false);
      }
    }
  }, [currentPlayingAudio]);

  // Finaliza o áudio se o aluno sair da aba de áudio, mudar de módulo ou mudar de aba principal
  useEffect(() => {
    if (subjectActiveTab !== "audio" || courseActiveTab !== "materias" || !selectedModuleId) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsAudioPlaying(false);
      setCurrentPlayingAudio(null);
    }
  }, [subjectActiveTab, courseActiveTab, selectedModuleId, selectedCourseId]);

  const handlePlayPauseAudio = () => {
    if (currentPlayingAudio) {
      if (currentPlayingAudio.url.includes('drive.google.com')) {
        setIsAudioPlaying(!isAudioPlaying);
      } else if (audioRef.current) {
        if (isAudioPlaying) {
          audioRef.current.pause();
          setIsAudioPlaying(false);
        } else {
          audioRef.current.play()
            .then(() => setIsAudioPlaying(true))
            .catch(err => console.error("Erro ao reproduzir áudio:", err));
        }
      }
    }
  };

  useEffect(() => {
    fetchCourses().then(data => {
      const filtered = allowedCourses
        ? data.filter(c => allowedCourses.includes(c.id))
        : data;
      setCourses(filtered);
      setLoading(false);
    }).catch(console.error);
  }, [allowedCourses]);

  const completedResources = getCompletedResourceIds();

  const calculateCourseProgress = (course: Course) => {
    let total = 0;
    let completedCount = 0;

    course.modules.forEach(m => {
      const rawDisc = m.rawDiscipline;
      if (rawDisc && Array.isArray(rawDisc.areas)) {
        rawDisc.areas.forEach((area: any) => {
          if (Array.isArray(area.contents)) {
            area.contents.forEach((content: any) => {
              if (Array.isArray(content.resources)) {
                content.resources.forEach((res: any) => {
                  total++;
                  if (res.id && completedResources.includes(res.id.toString())) {
                    completedCount++;
                  }
                });
              }
            });
          }
        });
      }
    });

    if (total === 0) return 35; // Fallback para não ficar zerado caso não haja recursos ainda
    return Math.max(5, Math.round((completedCount / total) * 100));
  };

  const calculateModuleProgress = (module: CourseModule) => {
    let total = 0;
    let completedCount = 0;

    const rawDisc = module.rawDiscipline;
    if (rawDisc && Array.isArray(rawDisc.areas)) {
      rawDisc.areas.forEach((area: any) => {
        if (Array.isArray(area.contents)) {
          area.contents.forEach((content: any) => {
            if (Array.isArray(content.resources)) {
              content.resources.forEach((res: any) => {
                total++;
                if (res.id && completedResources.includes(res.id.toString())) {
                  completedCount++;
                }
              });
            }
          });
        }
      });
    }

    if (total === 0) return 0;
    return Math.round((completedCount / total) * 100);
  };

  const renderMateriaCard = (content: any, mod: any) => {
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

    const totalResources = videoCount + audioCount + pdfCount + slidesCount + questionsCount + flashcardsCount;
    const completedCount = videoCompleted + audioCompleted + pdfCompleted + slidesCompleted + questionsCompleted + flashcardsCompleted;
    const percent = totalResources > 0 ? Math.round((completedCount / totalResources) * 100) : 0;

    let barColor = "bg-slate-200";
    let bgTagColor = "bg-slate-100 text-slate-600";
    if (percent > 0) {
      if (percent < 30) {
        barColor = "bg-gradient-to-r from-rose-400 to-rose-600";
        bgTagColor = "bg-rose-50 text-rose-700 border-rose-100/50 shadow-xs shadow-rose-500/5";
      } else if (percent < 80) {
        barColor = "bg-gradient-to-r from-amber-400 to-amber-600";
        bgTagColor = "bg-amber-50 text-amber-700 border-amber-100/50 shadow-xs shadow-amber-500/5";
      } else {
        barColor = "bg-gradient-to-r from-emerald-400 to-emerald-600";
        bgTagColor = "bg-emerald-50 text-emerald-700 border-emerald-100/50 shadow-xs shadow-emerald-500/5";
      }
    }

    const handleAccess = (tab: "aulas" | "audio" | "materiais" | "slides" | "questoes" | "flashcards") => {
      setSelectedModuleId(mod.id);
      setSelectedContentId(content.id);
      setSubjectActiveTab(tab);
    };

    return (
      <div 
        key={content.id}
        className="p-5 bg-slate-50/70 hover:bg-white border border-slate-200/80 rounded-2xl hover:border-indigo-400/30 hover:shadow-lg hover:shadow-indigo-500/5 hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between space-y-4 relative group overflow-hidden"
      >
        {/* Soft Background Gradient Glow on Hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/0 to-indigo-50/0 group-hover:from-indigo-50/10 group-hover:to-violet-50/5 pointer-events-none transition-all duration-300" />

        {/* Subject Info */}
        <div className="flex justify-between items-start gap-3 relative z-10">
          <div 
            className="space-y-1.5 min-w-0 cursor-pointer flex-1"
            onClick={() => handleAccess("aulas")}
          >
            <h5 className="text-xs font-sans font-bold text-slate-800 hover:text-indigo-600 transition-colors flex items-start gap-2 leading-snug">
              <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center border border-indigo-100/50 shrink-0 mt-0.5 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all duration-300">
                <BookOpen className="w-3.5 h-3.5" />
              </div>
              <span className="truncate-2-lines">{content.name}</span>
            </h5>
          </div>
          <span className={`text-[10px] font-mono font-black border px-2.5 py-0.5 rounded-full shrink-0 ${bgTagColor}`}>
            {percent}%
          </span>
        </div>

        {/* Custom progress bar */}
        <div className="space-y-2 relative z-10">
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200/50">
            <div 
              className={`h-1.5 rounded-full transition-all duration-500 ${barColor}`} 
              style={{ width: `${percent}%` }}
            />
          </div>
          
          <div className="flex justify-between items-center text-[9px] font-mono text-slate-400">
            <span className="font-bold">Progresso Geral</span>
            <span className="font-bold text-slate-600">{completedCount} de {totalResources} concluídos</span>
          </div>
        </div>

        {/* Access Buttons */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 w-full relative z-10">
          <button
            onClick={() => handleAccess("aulas")}
            disabled={videoCount === 0}
            className={`flex items-center justify-center space-x-1 px-1 py-2 rounded-xl border text-[10px] font-sans font-black transition-all duration-200 cursor-pointer shadow-xs w-full ${
              videoCount > 0
                ? "bg-indigo-50/50 border-indigo-100/60 text-indigo-600 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 active:scale-95"
                : "bg-slate-50/50 border-slate-100 text-slate-300 cursor-not-allowed opacity-30"
            }`}
            title={videoCount > 0 ? `Ver Video Aulas (${videoCompleted}/${videoCount})` : "Sem vídeo aulas"}
          >
            <Video className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Vídeo</span>
            {videoCount > 0 && <span className="ml-1 px-1 bg-indigo-100/80 text-indigo-700 rounded text-[8px] font-mono group-hover:bg-white/20 group-hover:text-white">{videoCompleted}/{videoCount}</span>}
          </button>

          <button
            onClick={() => handleAccess("audio")}
            disabled={audioCount === 0}
            className={`flex items-center justify-center space-x-1 px-1 py-2 rounded-xl border text-[10px] font-sans font-black transition-all duration-200 cursor-pointer shadow-xs w-full ${
              audioCount > 0
                ? "bg-emerald-50/50 border-emerald-100/60 text-emerald-600 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 active:scale-95"
                : "bg-slate-50/50 border-slate-100 text-slate-300 cursor-not-allowed opacity-30"
            }`}
            title={audioCount > 0 ? `Ouvir Áudio Aula (${audioCompleted}/${audioCount})` : "Sem áudio aula"}
          >
            <Headphones className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Áudio</span>
            {audioCount > 0 && <span className="ml-1 px-1 bg-emerald-100/80 text-emerald-700 rounded text-[8px] font-mono group-hover:bg-white/20 group-hover:text-white">{audioCompleted}/{audioCount}</span>}
          </button>

          <button
            onClick={() => handleAccess("materiais")}
            disabled={pdfCount === 0}
            className={`flex items-center justify-center space-x-1 px-1 py-2 rounded-xl border text-[10px] font-sans font-black transition-all duration-200 cursor-pointer shadow-xs w-full ${
              pdfCount > 0
                ? "bg-blue-50/50 border-blue-100/60 text-blue-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 active:scale-95"
                : "bg-slate-50/50 border-slate-100 text-slate-300 cursor-not-allowed opacity-30"
            }`}
            title={pdfCount > 0 ? `Ler Materiais PDF (${pdfCompleted}/${pdfCount})` : "Sem materiais PDF"}
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">PDF</span>
            {pdfCount > 0 && <span className="ml-1 px-1 bg-blue-100/80 text-blue-700 rounded text-[8px] font-mono group-hover:bg-white/20 group-hover:text-white">{pdfCompleted}/{pdfCount}</span>}
          </button>

          <button
            onClick={() => handleAccess("slides")}
            disabled={slidesCount === 0}
            className={`flex items-center justify-center space-x-1 px-1 py-2 rounded-xl border text-[10px] font-sans font-black transition-all duration-200 cursor-pointer shadow-xs w-full ${
              slidesCount > 0
                ? "bg-amber-50/50 border-amber-100/60 text-amber-600 hover:bg-amber-600 hover:text-white hover:border-amber-600 active:scale-95"
                : "bg-slate-50/50 border-slate-100 text-slate-300 cursor-not-allowed opacity-30"
            }`}
            title={slidesCount > 0 ? `Ver Slides (${slidesCompleted}/${slidesCount})` : "Sem slides"}
          >
            <Presentation className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Slides</span>
            {slidesCount > 0 && <span className="ml-1 px-1 bg-amber-100/80 text-amber-700 rounded text-[8px] font-mono group-hover:bg-white/20 group-hover:text-white">{slidesCompleted}/{slidesCount}</span>}
          </button>

          <button
            onClick={() => handleAccess("questoes")}
            disabled={questionsCount === 0}
            className={`flex items-center justify-center space-x-1 px-1 py-2 rounded-xl border text-[10px] font-sans font-black transition-all duration-200 cursor-pointer shadow-xs w-full ${
              questionsCount > 0
                ? "bg-violet-50/50 border-violet-100/60 text-violet-600 hover:bg-violet-600 hover:text-white hover:border-violet-600 active:scale-95"
                : "bg-slate-50/50 border-slate-100 text-slate-300 cursor-not-allowed opacity-30"
            }`}
            title={questionsCount > 0 ? `Resolver Questões (${questionsCompleted}/${questionsCount})` : "Sem questões"}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Questões</span>
            {questionsCount > 0 && <span className="ml-1 px-1 bg-violet-100/80 text-violet-700 rounded text-[8px] font-mono group-hover:bg-white/20 group-hover:text-white">{questionsCompleted}/{questionsCount}</span>}
          </button>

          <button
            onClick={() => handleAccess("flashcards")}
            disabled={flashcardsCount === 0}
            className={`flex items-center justify-center space-x-1 px-1 py-2 rounded-xl border text-[10px] font-sans font-black transition-all duration-200 cursor-pointer shadow-xs w-full ${
              flashcardsCount > 0
                ? "bg-rose-50/50 border-rose-100/60 text-rose-600 hover:bg-rose-600 hover:text-white hover:border-rose-600 active:scale-95"
                : "bg-slate-50/50 border-slate-100 text-slate-300 cursor-not-allowed opacity-30"
            }`}
            title={flashcardsCount > 0 ? `Estudar Flashcards (${flashcardsCompleted}/${flashcardsCount})` : "Sem flashcards"}
          >
            <Award className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cards</span>
            {flashcardsCount > 0 && <span className="ml-1 px-1 bg-rose-100/80 text-rose-700 rounded text-[8px] font-mono group-hover:bg-white/20 group-hover:text-white">{flashcardsCompleted}/{flashcardsCount}</span>}
          </button>
        </div>
      </div>
    );
  };

  const selectedCourse = courses.find(c => c.id === selectedCourseId) || null;
  const selectedModule = selectedCourse?.modules.find(m => m.id === selectedModuleId) || null;


  const handleAskQuick = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickQuestion.trim()) {
      onAskTutor(quickQuestion);
    }
  };

  const suggestionChips = [
    "Como funciona o rito do PAD no CEDM?",
    "Resuma o Artigo 142 da CF/88.",
    "O que tipifica o crime de recusa de obediência?",
    "O que são Atos Administrativos discricionários?"
  ];

  // Helper mock flashcards for each module
  const getModuleFlashcards = (moduleTitle: string) => {
    if (moduleTitle.includes("Constitucional")) {
      return [
        { q: "Qual a destinação constitucional das Forças Armadas?", a: "Defesa da Pátria, garantia dos poderes constitucionais e da lei e da ordem (Art. 142).", discipline: "Direito Constitucional", subject: "Forças Armadas" },
        { q: "Cabe Habeas Corpus contra punições disciplinares militares?", a: "Não cabe Habeas Corpus em relação a punições disciplinares militares (Art. 142, § 2º).", discipline: "Direito Constitucional", subject: "Punições Disciplinares" }
      ];
    } else if (moduleTitle.includes("Administrativo")) {
      return [
        { q: "Quais são os atributos do ato administrativo?", a: "Presunção de legitimidade, imperatividade, autoexecutoriedade e tipicidade (Mnemônico PATI).", discipline: "Direito Administrativo", subject: "Atributos do Ato" },
        { q: "O que caracteriza a competência administrativa?", a: "Poder legal outorgado ao agente. É irrenunciável, intransferível e inderrogável.", discipline: "Direito Administrativo", subject: "Competência" }
      ];
    } else if (moduleTitle.includes("Penal Militar")) {
      return [
        { q: "Qual a diferença de Motim e Revolta?", a: "Ambos exigem reunião de militares agindo em grupo. A Revolta exige que estejam armados.", discipline: "Direito Penal Militar", subject: "Motim e Revolta" },
        { q: "O crime de Recusa de Obediência exige o que?", a: "Recusa expressa em obedecer a ordem de superior sobre assunto de serviço (Art. 163 do CPM).", discipline: "Direito Penal Militar", subject: "Recusa de Obediência" }
      ];
    } else {
      return [
        { q: "Qual o prazo para conclusão do PAD segundo o CEDM?", a: "O rito sumário ordinário costuma fixar 30 dias prorrogáveis por mais 15 dias.", discipline: "Legislação Militar", subject: "PAD / CEDM" },
        { q: "Quais são as sanções disciplinares do CEDM?", a: "Advertência, repreensão, prestação de serviço, suspensão e demissão.", discipline: "Legislação Militar", subject: "Sanções Disciplinares" }
      ];
    }
  };

  // Extract custom flashcards if they exist
  let courseFlashcards: any[] = [];
  if (selectedModule && selectedModule.rawDiscipline && Array.isArray(selectedModule.rawDiscipline.areas)) {
    selectedModule.rawDiscipline.areas.forEach((area: any) => {
      if (Array.isArray(area.contents)) {
        area.contents.forEach((content: any) => {
          if (selectedContentId !== null && content.id !== selectedContentId) {
            return;
          }
          if (Array.isArray(content.resources)) {
            content.resources.forEach((res: any) => {
              if (res.type === 'flashcard') {
                courseFlashcards.push({
                  id: res.id?.toString() || Math.random().toString(),
                  q: res.flashcardQuestion || res.title || "Pergunta do Cartão",
                  a: res.flashcardAnswer || res.description || "Resposta",
                  discipline: content.materiaName || (selectedModule.title || "").replace(/^Módulo \d+:\s*/, ""),
                  subject: content.name || "Geral"
                });
              }
            });
          }
        });
      }
    });
  }

  const currentFlashcards = courseFlashcards.length > 0 
    ? courseFlashcards 
    : (selectedModule ? getModuleFlashcards(selectedModule.title) : []);

  const uniqueFlashcardDisciplines = ["Todas", ...new Set(currentFlashcards.map(c => c.discipline || "Geral"))];
  const uniqueFlashcardSubjects = ["Todos", ...new Set(currentFlashcards.map(c => c.subject || "Geral"))];

  const filteredFlashcards = currentFlashcards.filter(c => {
    if (flashcardDisciplineFilter !== "Todas" && c.discipline !== flashcardDisciplineFilter) return false;
    if (flashcardSubjectFilter !== "Todos" && c.subject !== flashcardSubjectFilter) return false;
    return true;
  });

  // Efeito para marcar flashcard ativo como aberto sem causar loop de dependência em MeusCursos.tsx
  useEffect(() => {
    if (filteredFlashcards.length > 0 && currentFlashcardIndex >= 0) {
      const activeCard = filteredFlashcards[currentFlashcardIndex];
      if (activeCard) {
        const cardId = activeCard.id?.toString() || currentFlashcardIndex.toString();
        setFlashcardStatuses(prev => {
          if (prev[cardId]?.opened) return prev;
          return {
            ...prev,
            [cardId]: {
              opened: true,
              answered: prev[cardId]?.answered || false,
              rating: prev[cardId]?.rating
            }
          };
        });
      }
    }
  }, [currentFlashcardIndex, filteredFlashcards.length]);

  // View 1: List of all courses
  if (!selectedCourseId) {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }
    return (
      <div className="space-y-6" id="meus-cursos-list-view">


        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div 
              key={course.id}
              onClick={() => {
                setSelectedCourseId(course.id);
                setCourseActiveTab("materias");
              }}
              className="bg-blue-50/60 backdrop-blur-md border border-blue-100 hover:border-blue-400/60 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group relative cursor-pointer aspect-video flex items-center justify-center"
            >
              {course.cover_url ? (
                <img 
                  src={course.cover_url} 
                  alt={course.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="flex flex-col items-center justify-center space-y-3 p-6 text-center w-full h-full bg-gradient-to-br from-slate-50 to-blue-50/30">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-sans font-bold text-slate-700 group-hover:text-blue-700 transition-colors line-clamp-2 px-2">
                    {course.title}
                  </span>
                  <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest bg-white/60 px-2 py-0.5 rounded backdrop-blur-sm border border-slate-200/50">
                    Sem Capa
                  </span>
                </div>
              )}
              
              {/* Overlay with subtle gradient on hover to indicate it's clickable */}
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 via-blue-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                <h3 className="text-white text-sm font-sans font-extrabold mb-1 drop-shadow-md line-clamp-1 translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                  {course.title}
                </h3>
                <span className="text-blue-200 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center space-x-1.5 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <span>Estudar Agora</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const renderCourseDetailViewContent = () => {
    return (
      <div className="mt-2">
        {courseActiveTab === "materias" && (
          <div className="space-y-6">
            {/* Modules list grouped by Eixos Temáticos */}
            <div className="space-y-8">
              {selectedCourse.modules.map((mod) => {
                const rawDisc = mod.rawDiscipline;
                if (rawDisc && Array.isArray(rawDisc.areas)) {
                  const isExpanded = !!expandedDisciplines[mod.id];
                  return (
                    <div key={mod.id} className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-6 shadow-xs transition-all">
                      <div 
                        className="flex justify-between items-center pb-3 border-b border-slate-200/60 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setExpandedDisciplines(prev => ({ ...prev, [mod.id]: !prev[mod.id] }))}
                      >
                        <div className="space-y-1">
                          <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Disciplina</span>
                          <h3 className="text-sm font-sans font-black text-slate-800 flex items-center space-x-2">
                             <span>{(mod.title || "").includes(':') ? `${(mod.title || "").split(':')[0]}: ${capitalizeFirstOnly((mod.title || "").split(':').slice(1).join(':').trim())}` : capitalizeFirstOnly(mod.title || "")}</span>
                          </h3>
                        </div>
                        <div className="text-slate-400">
                          {isExpanded ? <ChevronDown className="w-5 h-5 transition-transform" /> : <ChevronRight className="w-5 h-5 transition-transform" />}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="space-y-6 animate-smooth-fade">
                          {rawDisc.areas.map((area: any) => (
                            <div key={area.id} className="space-y-4">
                              <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
                                <h4 className="text-xs font-mono font-bold text-slate-600 tracking-wider">
                                  {capitalizeFirstOnly(area.name)}
                                </h4>
                              </div>
                              
                              {/* Matérias Grid (3 por linha) */}
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {Array.isArray(area.contents) && area.contents.map((content: any) => renderMateriaCard(content, mod))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                // Fallback para o caso de o módulo não ter a estrutura de disciplinas_json carregada
                return (
                  <div 
                    key={mod.id}
                    className="glass-panel hover:border-blue-300 rounded-xl p-5 flex flex-col justify-between shadow-sm hover:shadow transition-all group"
                  >
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0 pb-3 border-b border-slate-100 mb-3">
                        <div>
                          <h4 className="text-sm font-sans font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                            {mod.title}
                          </h4>
                          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                            {mod.description}
                          </p>
                        </div>
                        <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-200/50 shrink-0">
                          {calculateModuleProgress(mod)}% Concluído
                        </span>
                      </div>

                      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-3 md:space-y-0 pt-1">
                        <div className="flex space-x-4 text-[10px] font-mono text-slate-500">
                          <span className="flex items-center space-x-1.5">
                            <PlayCircle className="w-3.5 h-3.5 text-slate-400" />
                            <span>{mod.lessonsCount} Aulas</span>
                          </span>
                          <span className="flex items-center space-x-1.5">
                            <FileText className="w-3.5 h-3.5 text-slate-400" />
                            <span>{mod.pdfsCount} PDFs</span>
                          </span>
                          <span className="flex items-center space-x-1.5">
                            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                            <span>{mod.questionsCount} Questões</span>
                          </span>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedModuleId(mod.id);
                            setSubjectActiveTab("aulas");
                          }}
                          className="group/btn h-8 px-2 rounded-full bg-slate-50 border border-slate-200 text-slate-400 hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all duration-300 flex items-center shadow-sm group-hover:bg-blue-50 group-hover:border-blue-200 group-hover:text-blue-600 cursor-pointer overflow-hidden"
                        >
                          <ChevronRight className="w-4 h-4 shrink-0" />
                          <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover/btn:max-w-[150px] group-hover/btn:ml-1.5 transition-all duration-500 font-sans font-bold text-[10px] uppercase">
                            Acessar Matéria
                          </span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {courseActiveTab === "simuladores" && (
            <SimuladoresScreen onAskTutor={onAskTutor} />
          )}

          {courseActiveTab === "leis" && (
            <LeisInteligentesScreen />
          )}

          {courseActiveTab === "tutor" && (
            <TutorIAScreen 
              initialPrompt={tutorInitialPrompt || quickQuestion}
              onClearInitialPrompt={() => {
                onClearTutorPrompt();
                setQuickQuestion("");
              }}
            />
          )}

          {courseActiveTab === "desempenho" && (
            <DesempenhoScreen 
              userName={userName}
              allowedCourses={allowedCourses}
              onNavigateToSubject={(courseId, moduleId, contentId) => {
                setSelectedCourseId(courseId);
                setSelectedModuleId(moduleId);
                setSelectedContentId(contentId);
                setCourseActiveTab("materias");
                setSubjectActiveTab("aulas");
              }}
              onStartRecoveryTraining={(subject) => {
                setCourseActiveTab("materias");
                // Pre-select first module
                if (selectedCourse.modules.length > 0) {
                  setSelectedModuleId(selectedCourse.modules[0].id);
                }
              }}
            />
          )}

          {courseActiveTab === "gestao" && (
            <GestaoEstudoScreen 
              selectedCourse={selectedCourse}
              onNavigateToSubject={(moduleId, contentId) => {
                setSelectedModuleId(moduleId);
                setSelectedContentId(contentId);
                setCourseActiveTab("materias");
                setSubjectActiveTab("aulas");
              }}
            />
          )}
        </div>
      );
    }

  // View 2: Course Dashboard (Matérias, Simuladores, Leis, Tutor IA, Desempenho)
  if (selectedCourse && !selectedModuleId) {
    return (
      <div className="space-y-6" id="meus-cursos-detail-view">
        {renderCourseDetailViewContent()}
      </div>
    );
  }

  // View 3: Subject/Module Study Dashboard (Aulas, Materiais, Questões, Flashcards)
  if (selectedCourse && selectedModule) {
    const cleanDisciplineName = (selectedModule.title || "").replace(/^Módulo \d+:\s*/, "");

    // If no specific materia/content is selected, show list of Eixos and Materias
    if (selectedContentId === null) {
      return (
        <div className="space-y-6 animate-smooth-fade" id="meus-cursos-materia-selection">
          {/* Header with Back button */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => {
                  setSelectedModuleId(null);
                  setSelectedContentId(null);
                }}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors cursor-pointer border-none flex items-center justify-center bg-transparent"
                title="Voltar ao Painel do Curso"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h4 className="text-sm font-sans font-extrabold text-slate-800 uppercase tracking-wide">
                  {cleanDisciplineName}
                </h4>
                <p className="text-[10px] font-mono text-slate-500">
                  Selecione um Eixo Temático e uma Matéria para Iniciar os Estudos
                </p>
              </div>
            </div>
          </div>

          {/* Eixos Temáticos & Materias Grid */}
          <div className="space-y-6">
            {selectedModule.rawDiscipline && Array.isArray(selectedModule.rawDiscipline.areas) && selectedModule.rawDiscipline.areas.length > 0 ? (
              selectedModule.rawDiscipline.areas.map((area: any) => (
                <div key={area.id} className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-xs">
                  <div className="border-b border-slate-100 pb-2.5">
                    <h3 className="text-xs font-mono font-extrabold text-indigo-600 uppercase tracking-wider">
                      {area.name}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.isArray(area.contents) && area.contents.map((content: any) => renderMateriaCard(content, selectedModule))}
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-400 italic">
                Nenhuma matéria cadastrada para esta disciplina.
              </div>
            )}
          </div>
        </div>
      );
    }

    let activeContentId = selectedContentId;

    const rawDisc = selectedModule.rawDiscipline;
    const courseVideos: any[] = [];
    const courseAudios: any[] = [];
    const coursePdfs: any[] = [];
    const courseSlides: any[] = [];
    
    if (rawDisc && Array.isArray(rawDisc.areas)) {
      rawDisc.areas.forEach((area: any) => {
        if (Array.isArray(area.contents)) {
          area.contents.forEach((content: any) => {
            if (activeContentId !== null && content.id !== activeContentId) {
              return;
            }
            if (Array.isArray(content.resources)) {
              content.resources.forEach((res: any) => {
                if (res.type === 'audio') {
                  courseAudios.push({ ...res, materiaName: content.name });
                } else if (res.type === 'pdf') {
                  coursePdfs.push({ ...res, materiaName: content.name });
                } else if (res.type === 'slides') {
                  courseSlides.push({ ...res, materiaName: content.name });
                } else if (res.type === 'video') {
                  courseVideos.push({ ...res, materiaName: content.name });
                }
              });
            }
          });
        }
      });
    }

    let activeEixoName = "";
    let activeMateriaName = "";
    if (selectedModule.rawDiscipline && Array.isArray(selectedModule.rawDiscipline.areas)) {
      for (const area of selectedModule.rawDiscipline.areas) {
        if (Array.isArray(area.contents)) {
          const matchingMateria = area.contents.find((c: any) => c.id === selectedContentId);
          if (matchingMateria) {
            activeEixoName = area.name || "";
            activeMateriaName = matchingMateria.name || "";
            break;
          }
        }
      }
    }

    return (
      <div className="space-y-6" id="meus-cursos-subject-dashboard">
        {/* Header containing back button, discipline title, and tab selector */}
        <div className="bg-white border border-slate-200/80 rounded-2xl py-3 px-6 flex flex-col items-start gap-3 shadow-sm">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => {
                setSelectedContentId(null);
              }}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors cursor-pointer border-none flex items-center justify-center bg-transparent"
              title="Voltar para a Lista de Matérias"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500 uppercase tracking-wider">
                <span>{cleanDisciplineName}</span>
                {activeEixoName && (
                  <>
                    <span className="text-slate-300">/</span>
                    <span className="text-slate-600 font-bold">{activeEixoName}</span>
                  </>
                )}
                <span className="text-slate-300 ml-1 mr-1">|</span>
              </div>
              <h4 className="text-sm font-sans font-black text-slate-800 uppercase tracking-wide">
                {activeMateriaName || cleanDisciplineName}
              </h4>
            </div>
          </div>

          <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-slate-100 pt-3">
            {/* Tab Selector Inside Header */}
            <div className="flex flex-wrap items-center bg-slate-100/80 p-1 rounded-xl border border-slate-200/50 gap-1.5 shadow-inner">
              <button
                onClick={() => setSubjectActiveTab("aulas")}
                className={`flex items-center space-x-1.5 px-3 py-1.5 text-[10px] font-sans font-black uppercase rounded-lg transition-all duration-300 cursor-pointer border-none ${
                  subjectActiveTab === "aulas" 
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20 scale-105" 
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 bg-transparent"
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>Vídeos/Aulas</span>
              </button>

              <button
                onClick={() => setSubjectActiveTab("audio")}
                className={`flex items-center space-x-1.5 px-3 py-1.5 text-[10px] font-sans font-black uppercase rounded-lg transition-all duration-300 cursor-pointer border-none ${
                  subjectActiveTab === "audio" 
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20 scale-105" 
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 bg-transparent"
                }`}
              >
                <Headphones className="w-3.5 h-3.5" />
                <span>Áudios</span>
              </button>

              <button
                onClick={() => setSubjectActiveTab("materiais")}
                className={`flex items-center space-x-1.5 px-3 py-1.5 text-[10px] font-sans font-black uppercase rounded-lg transition-all duration-300 cursor-pointer border-none ${
                  subjectActiveTab === "materiais" 
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-105" 
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 bg-transparent"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>PDFs</span>
              </button>

              <button
                onClick={() => setSubjectActiveTab("slides")}
                className={`flex items-center space-x-1.5 px-3 py-1.5 text-[10px] font-sans font-black uppercase rounded-lg transition-all duration-300 cursor-pointer border-none ${
                  subjectActiveTab === "slides" 
                    ? "bg-amber-600 text-white shadow-md shadow-amber-500/20 scale-105" 
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 bg-transparent"
                }`}
              >
                <Presentation className="w-3.5 h-3.5" />
                <span>Slides</span>
              </button>

              <button
                onClick={() => setSubjectActiveTab("questoes")}
                className={`flex items-center space-x-1.5 px-3 py-1.5 text-[10px] font-sans font-black uppercase rounded-lg transition-all duration-300 cursor-pointer border-none ${
                  subjectActiveTab === "questoes" 
                    ? "bg-violet-600 text-white shadow-md shadow-violet-500/20 scale-105" 
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 bg-transparent"
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Questões</span>
              </button>

              <button
                onClick={() => setSubjectActiveTab("flashcards")}
                className={`flex items-center space-x-1.5 px-3 py-1.5 text-[10px] font-sans font-black uppercase rounded-lg transition-all duration-300 cursor-pointer border-none ${
                  subjectActiveTab === "flashcards" 
                    ? "bg-rose-600 text-white shadow-md shadow-rose-500/20 scale-105" 
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 bg-transparent"
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Cards</span>
              </button>
            </div>

            {/* Video Selector Dropdown & Status Selector if tab is 'aulas' */}
            {subjectActiveTab === "aulas" && courseVideos.length > 0 && (
              <div className="flex items-center space-x-3 bg-slate-50 p-1.5 px-3 rounded-xl border border-slate-200/60 shadow-xs shrink-0 self-start sm:self-center">
                {courseVideos[activeVideoIndex]?.id && renderStatusIndicator(courseVideos[activeVideoIndex].id.toString())}
                {courseVideos.length > 1 && (
                  <VideoSelector
                    videos={courseVideos}
                    activeVideoIndex={activeVideoIndex}
                    onSelectVideo={(idx) => setActiveVideoIndex(idx)}
                  />
                )}
              </div>
            )}

            {/* PDF Selector Dropdown & Status Selector if tab is 'materiais' */}
            {subjectActiveTab === "materiais" && coursePdfs.length > 0 && (
              <div className="flex items-center space-x-3 bg-slate-50 p-1.5 px-3 rounded-xl border border-slate-200/60 shadow-xs shrink-0 self-start sm:self-center">
                {coursePdfs[activePdfIndex]?.id && renderStatusIndicator(coursePdfs[activePdfIndex].id.toString())}
                {coursePdfs.length > 1 && (
                  <VideoSelector
                    videos={coursePdfs}
                    activeVideoIndex={activePdfIndex}
                    onSelectVideo={(idx) => setActivePdfIndex(idx)}
                  />
                )}
              </div>
            )}

            {/* Slides Selector Dropdown & Status Selector if tab is 'slides' */}
            {subjectActiveTab === "slides" && courseSlides.length > 0 && (
              <div className="flex items-center space-x-3 bg-slate-50 p-1.5 px-3 rounded-xl border border-slate-200/60 shadow-xs shrink-0 self-start sm:self-center">
                {courseSlides[activeSlideIndex]?.id && renderStatusIndicator(courseSlides[activeSlideIndex].id.toString())}
                {courseSlides.length > 1 && (
                  <VideoSelector
                    videos={courseSlides}
                    activeVideoIndex={activeSlideIndex}
                    onSelectVideo={(idx) => setActiveSlideIndex(idx)}
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Content area replacing the dashboard view */}
        <div className="mt-2">
          {subjectActiveTab === "aulas" && (
            <AulasScreen 
              onAskTutor={onAskTutor} 
              disciplineName={cleanDisciplineName}
              rawDiscipline={selectedModule.rawDiscipline}
              selectedContentId={activeContentId}
              videos={courseVideos}
              activeVideoIndex={activeVideoIndex}
              setActiveVideoIndex={setActiveVideoIndex}
            />
          )}

          {subjectActiveTab === "audio" && (
            <div className="glass-panel rounded-2xl p-6 shadow-sm space-y-6 animate-smooth-fade">

              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/3 bg-blue-50 border border-blue-100 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden group">
                  <div className="absolute inset-0 bg-blue-500/10 blur-xl pointer-events-none group-hover:bg-blue-500/20 transition-all"></div>
                  <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500 to-blue-700 flex items-center justify-center shadow-2xl mb-4 relative z-10">
                    {isAudioPlaying ? (
                      <Volume2 className="w-10 h-10 text-white animate-bounce" />
                    ) : (
                      <Headphones className="w-10 h-10 text-white" />
                    )}
                  </div>
                  <h4 className="text-sm font-display font-bold text-blue-900 z-10 truncate w-full px-2">
                    {currentPlayingAudio ? currentPlayingAudio.title : "Nenhum áudio em execução"}
                  </h4>
                  <p className="text-[10px] font-mono text-blue-600 mt-1 z-10">
                    {currentPlayingAudio ? (currentPlayingAudio.materiaName || "Áudio Aula") : "Selecione uma faixa ao lado"}
                  </p>
                  
                  {currentPlayingAudio?.url && currentPlayingAudio.url.includes('drive.google.com') ? (
                    <div className="w-full h-14 relative overflow-hidden rounded-xl border border-slate-700 shadow-sm bg-white mt-6 z-10">
                      <iframe 
                        src={(() => {
                          const match = currentPlayingAudio.url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
                          if (match && match[1]) {
                            return `https://drive.google.com/file/d/${match[1]}/preview`;
                          }
                          return currentPlayingAudio.url;
                        })()}
                        className="w-full h-full border-none"
                        title={currentPlayingAudio.title}
                      />
                      {/* Bloqueio de cliques na barra do Drive */}
                      <div className="absolute top-0 right-0 w-16 h-full bg-transparent cursor-default" />
                    </div>
                  ) : (
                    <>
                      <div className="mt-6 flex items-center space-x-4 z-10">
                        <button 
                          onClick={handlePlayPauseAudio}
                          disabled={!currentPlayingAudio}
                          className="w-12 h-12 rounded-full bg-white text-blue-900 flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer shadow-md border-none"
                        >
                          {isAudioPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
                        </button>
                      </div>
                      
                      <div className="w-full mt-4 flex items-center space-x-2 z-10">
                        <span className="text-[10px] text-blue-700 font-mono">{audioCurrentTime}</span>
                        <div className="h-1 flex-1 bg-blue-200 rounded-full overflow-hidden relative">
                          <div className="absolute left-0 top-0 h-full bg-blue-500" style={{ width: `${audioProgress}%` }}></div>
                        </div>
                        <span className="text-[10px] text-blue-700 font-mono">{audioDuration}</span>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="w-full md:w-2/3 space-y-3">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-slate-500 mb-2">
                    Faixas Disponíveis
                  </h4>
                  
                  {courseAudios.length === 0 ? (
                    <div className="text-slate-400 text-xs italic py-4 text-center">Nenhum áudio cadastrado para esta matéria.</div>
                  ) : (
                    courseAudios.map((audio, index) => {
                      const isCurrent = currentPlayingAudio?.url === audio.url;
                      return (
                        <div 
                          key={audio.id || index} 
                          className={`relative p-3 border rounded-xl flex items-center justify-between hover:bg-slate-100 transition-colors group ${
                            isCurrent 
                              ? 'bg-blue-50 border-blue-200 text-blue-700 font-bold' 
                              : 'bg-slate-50 border-slate-200/60 text-slate-600'
                          }`}
                          style={{ zIndex: 50 - index }}
                        >
                          {/* Left: status indicator */}
                          <div className="flex items-center pr-2 shrink-0">
                            {renderStatusIndicator(audio.id?.toString() || `audio-${index}`)}
                          </div>

                          {/* Right: clickable audio selection area */}
                          <div
                            onClick={() => {
                              if (isCurrent) {
                                handlePlayPauseAudio();
                              } else {
                                setCurrentPlayingAudio(audio);
                                markResourceComplete(audio.id?.toString() || `audio-${index}`);
                              }
                            }}
                            className="flex-1 flex items-center justify-between cursor-pointer min-w-0"
                          >
                            <div className="flex items-center space-x-3 truncate">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                                isCurrent ? 'bg-blue-200' : 'bg-blue-100 group-hover:bg-blue-200'
                              }`}>
                                {isCurrent && isAudioPlaying ? (
                                  <Pause className="w-3.5 h-3.5 text-blue-700 fill-current" />
                                ) : (
                                  <Play className="w-3.5 h-3.5 text-blue-600 fill-current ml-0.5" />
                                )}
                              </div>
                              <div className="truncate text-left">
                                <h5 className="text-xs font-sans font-bold truncate">{audio.title}</h5>
                                <p className="text-[10px] text-slate-500 font-mono truncate">{audio.materiaName || "Áudio Aula"}</p>
                              </div>
                            </div>
                            <div className="flex items-center pl-2 shrink-0">
                              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">
                                {isCurrent && isAudioPlaying ? 'Tocando' : 'Ouvir'}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {subjectActiveTab === "materiais" && (
            <div className="w-full" id="materiais-view-container">
              <div className="w-full space-y-4">
                {coursePdfs.length === 0 ? (
                  <div className="glass-panel rounded-2xl p-8 text-center text-slate-400 text-xs italic">
                    Nenhum PDF cadastrado para esta matéria.
                  </div>
                ) : (
                  <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-lg border border-blue-100 bg-blue-50/20">
                    <PdfSlidesViewer
                      pdfUrl={coursePdfs[activePdfIndex]?.url || ""}
                      title={coursePdfs[activePdfIndex]?.title || ""}
                      inline={true}
                      initialMode="slides"
                      hideModeToggle={false}
                      hideHeader={true}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {subjectActiveTab === "slides" && (
            <div className="w-full" id="slides-view-container">
              <div className="w-full space-y-4">
                {courseSlides.length === 0 ? (
                  <div className="glass-panel rounded-2xl p-8 text-center text-slate-400 text-xs italic">
                    Nenhum slide cadastrado para esta matéria.
                  </div>
                ) : (
                  <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-lg border border-blue-100 bg-blue-50/20">
                    <PdfSlidesViewer
                      pdfUrl={courseSlides[activeSlideIndex]?.url || ""}
                      title={courseSlides[activeSlideIndex]?.title || ""}
                      inline={true}
                      initialMode="slides"
                      hideModeToggle={false}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {subjectActiveTab === "questoes" && (
            <QuestoesScreen 
              discipline={cleanDisciplineName}
              rawDiscipline={selectedModule.rawDiscipline}
            />
          )}

          {subjectActiveTab === "flashcards" && (
            <div className="space-y-6">


              {/* Grid Layout (Card on left, Playlist on right) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="flashcards-view-container">
                {/* Left Column: Active Flashcard */}
                <div className="lg:col-span-2 space-y-6">
                  {filteredFlashcards.length > 0 && filteredFlashcards[currentFlashcardIndex] ? (
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
                      
                      {/* Flappable Card */}
                      <div className="flex flex-col items-center justify-center py-4" style={{ perspective: '1000px' }}>
                        <div 
                          onClick={() => setFlashcardFlipped(!flashcardFlipped)}
                          className="w-full max-w-2xl h-80 cursor-pointer select-none relative transition-transform duration-700"
                          style={{
                            transform: flashcardFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                            transformStyle: 'preserve-3d',
                          }}
                        >
                          {/* Lado da Pergunta (Front) */}
                          <div 
                            className="absolute inset-0 w-full h-full bg-blue-50 border border-blue-200 rounded-2xl p-6 flex flex-col justify-between items-center text-center shadow-md backface-hidden"
                            style={{ backfaceVisibility: 'hidden' }}
                          >
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-100/30 via-blue-50/0 to-blue-50/0 pointer-events-none rounded-2xl" />
                            <div className="absolute top-3 left-3 flex items-center space-x-1.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                              <span className="text-[8px] font-mono text-blue-600 font-bold uppercase tracking-wider">Pergunta Tática</span>
                            </div>
                            
                            <div className="flex-1 flex items-center justify-center pt-4">
                              <p className="text-sm md:text-base font-sans font-extrabold text-blue-950 leading-relaxed px-4">
                                {filteredFlashcards[currentFlashcardIndex]?.q}
                              </p>
                            </div>
                            
                            <span className="text-[10px] text-blue-700 font-sans font-bold bg-blue-100/80 border border-blue-200/60 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors">
                              Clique para revelar a resposta
                            </span>
                          </div>

                          {/* Lado da Resposta (Back) */}
                          <div 
                            className="absolute inset-0 w-full h-full bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex flex-col justify-between items-center text-center shadow-md backface-hidden"
                            style={{ 
                              backfaceVisibility: 'hidden',
                              transform: 'rotateY(180deg)'
                            }}
                          >
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-100/20 via-emerald-50/0 to-emerald-50/0 pointer-events-none rounded-2xl" />
                            <div className="absolute top-3 left-3 flex items-center space-x-1.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                              <span className="text-[8px] font-mono text-emerald-600 font-bold uppercase tracking-wider">Resposta / Doutrina</span>
                            </div>
                            
                            <div className="flex-1 flex items-center justify-center overflow-y-auto pt-6 pb-2 max-h-[220px] custom-scrollbar">
                              <p className="text-sm md:text-base font-sans font-extrabold text-emerald-950 leading-relaxed px-4 italic">
                                {filteredFlashcards[currentFlashcardIndex]?.a}
                              </p>
                            </div>
                            
                            <span className="text-[10px] text-emerald-700 font-sans font-bold bg-emerald-100/80 border border-emerald-200/60 px-3 py-1 rounded-full">
                              Clique para ver a pergunta
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-slate-200">
                        <div className="flex space-x-2 w-full sm:w-auto justify-center">
                          <button
                            disabled={currentFlashcardIndex === 0}
                            onClick={() => {
                              setFlashcardFlipped(false);
                              setCurrentFlashcardIndex(prev => Math.max(0, prev - 1));
                            }}
                            className="py-2 px-4 bg-slate-100 hover:bg-slate-200 disabled:opacity-45 text-xs font-bold text-slate-700 rounded-xl transition-all cursor-pointer shadow-sm hover:shadow"
                          >
                            <ArrowLeft className="w-3.5 h-3.5 inline mr-1" />
                            Anterior
                          </button>
                          <button
                            disabled={currentFlashcardIndex === filteredFlashcards.length - 1}
                            onClick={() => {
                              setFlashcardFlipped(false);
                              setCurrentFlashcardIndex(prev => Math.min(filteredFlashcards.length - 1, prev + 1));
                            }}
                            className="py-2 px-4 bg-slate-100 hover:bg-slate-200 disabled:opacity-45 text-xs font-bold text-slate-700 rounded-xl transition-all cursor-pointer shadow-sm hover:shadow"
                          >
                            Próximo
                            <ArrowRight className="w-3.5 h-3.5 inline ml-1" />
                          </button>
                        </div>

                        {/* Anki Review Dificulty Buttons */}
                        {flashcardFlipped ? (
                          <div className="flex space-x-1.5 w-full sm:w-auto justify-center animate-smooth-fade">
                            <button
                              onClick={() => {
                                alert("Combatente! Esse cartão foi marcado para revisão em 1 dia.");
                                setFlashcardFlipped(false);
                                const activeCard = filteredFlashcards[currentFlashcardIndex];
                                if (activeCard) {
                                  const cardId = activeCard.id?.toString() || currentFlashcardIndex.toString();
                                  setFlashcardStatuses(prev => ({
                                    ...prev,
                                    [cardId]: { opened: true, answered: true, rating: "hard" }
                                  }));
                                }
                                if (currentFlashcardIndex < filteredFlashcards.length - 1) {
                                  setCurrentFlashcardIndex(prev => prev + 1);
                                }
                              }}
                              className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-[10px] font-sans font-bold uppercase rounded-lg cursor-pointer"
                            >
                              Difícil
                            </button>
                            <button
                              onClick={() => {
                                alert("Combatente! Esse cartão foi marcado para revisão em 4 dias.");
                                setFlashcardFlipped(false);
                                const activeCard = filteredFlashcards[currentFlashcardIndex];
                                if (activeCard) {
                                  const cardId = activeCard.id?.toString() || currentFlashcardIndex.toString();
                                  setFlashcardStatuses(prev => ({
                                    ...prev,
                                    [cardId]: { opened: true, answered: true, rating: "medium" }
                                  }));
                                }
                                if (currentFlashcardIndex < filteredFlashcards.length - 1) {
                                  setCurrentFlashcardIndex(prev => prev + 1);
                                }
                              }}
                              className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 text-[10px] font-sans font-bold uppercase rounded-lg cursor-pointer"
                            >
                              Médio
                            </button>
                            <button
                              onClick={() => {
                                alert("Combatente! Esse cartão foi marcado para revisão em 7 dias.");
                                setFlashcardFlipped(false);
                                const activeCard = filteredFlashcards[currentFlashcardIndex];
                                if (activeCard) {
                                  const cardId = activeCard.id?.toString() || currentFlashcardIndex.toString();
                                  setFlashcardStatuses(prev => ({
                                    ...prev,
                                    [cardId]: { opened: true, answered: true, rating: "easy" }
                                  }));
                                }
                                if (currentFlashcardIndex < filteredFlashcards.length - 1) {
                                  setCurrentFlashcardIndex(prev => prev + 1);
                                }
                              }}
                              className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[10px] font-sans font-bold uppercase rounded-lg cursor-pointer"
                            >
                              Fácil
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setFlashcardFlipped(true)}
                            className="w-full sm:w-auto py-2 px-5 bg-blue-600 hover:bg-blue-700 text-white font-sans font-bold text-xs uppercase rounded-xl transition-all shadow-md cursor-pointer border-none"
                          >
                            Ver Resposta
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-3">
                      <HelpCircle className="w-12 h-12 text-slate-400 mx-auto" />
                      <h4 className="text-sm font-sans font-bold text-slate-800 uppercase">Nenhum cartão encontrado</h4>
                      <p className="text-xs text-slate-500">Ajuste os filtros de disciplina ou assunto no painel superior para carregar os flashcards.</p>
                    </div>
                  )}
                </div>

                {/* Right Column: Flashcards Playlist */}
                <div className="space-y-6">
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                      <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500">
                        Flashcards do Módulo
                      </h3>
                      <span className="text-xs font-mono text-blue-600 font-bold">
                        {filteredFlashcards.length} Cartões
                      </span>
                    </div>

                    <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1 pb-32">
                      {filteredFlashcards.length === 0 ? (
                        <div className="text-xs text-slate-400 italic py-2 text-center">Nenhum cartão disponível.</div>
                      ) : (
                        filteredFlashcards.map((card, idx) => {
                          const isActive = idx === currentFlashcardIndex;
                          const cardId = card.id?.toString() || idx.toString();
                          const status = flashcardStatuses[cardId];
                          
                          let statusIcon = <div className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" title="Não Aberto" />;
                          let statusTitle = "Não Aberto";
                          
                          if (status) {
                            if (status.answered) {
                              if (status.rating === "easy") {
                                statusIcon = <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" title="Fácil" />;
                                statusTitle = "Fácil";
                              } else if (status.rating === "medium") {
                                statusIcon = <CheckCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" title="Médio" />;
                                statusTitle = "Médio";
                              } else {
                                statusIcon = <CheckCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" title="Difícil" />;
                                statusTitle = "Difícil";
                              }
                            } else if (status.opened) {
                              statusIcon = <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 animate-pulse" title="Visualizado" />;
                              statusTitle = "Visualizado";
                            }
                          }

                          return (
                            <div
                              key={card.id || idx}
                              className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center ${
                                isActive
                                  ? "bg-blue-50 border-blue-200/50 text-blue-700 font-bold"
                                  : "bg-slate-50 border-slate-100 hover:bg-slate-100/80 text-slate-600"
                              }`}
                            >
                              <div className="flex items-center pr-2 shrink-0">
                                {renderStatusIndicator(cardId)}
                              </div>
                              <div 
                                onClick={() => {
                                  setCurrentFlashcardIndex(idx);
                                  setFlashcardFlipped(false);
                                }}
                                className="flex-1 flex items-center min-w-0 cursor-pointer"
                              >
                                <span className="text-xs truncate pr-1 flex-1">Card {idx + 1}</span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Secure PDF Viewer Overlay */}
        {viewingPdfUrl && (
          <PdfSlidesViewer
            pdfUrl={viewingPdfUrl}
            title={viewingPdfTitle}
            onClose={() => {
              setViewingPdfUrl(null);
              setIsPdfMaximized(false);
              setViewingPdfType(null);
            }}
            isMaximized={isPdfMaximized}
            onToggleMaximize={() => setIsPdfMaximized(!isPdfMaximized)}
            initialMode={viewingPdfType === "slides" ? "slides" : "scroll"}
            hideModeToggle={viewingPdfType === "pdf"}
          />
        )}
      </div>
    );
  }

  return null;
}
