import React, { useState, useEffect, useRef } from "react";
import { 
  ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw, 
  X, Maximize, Minimize, ScrollText, Presentation, Loader2, AlertCircle 
} from "lucide-react";

interface PdfSlidesViewerProps {
  pdfUrl: string;
  title: string;
  onClose?: () => void;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
  initialMode?: "slides" | "scroll";
  hideModeToggle?: boolean;
  inline?: boolean;
}

declare global {
  interface Window {
    pdfjsLib: any;
  }
}

export default function PdfSlidesViewer({ 
  pdfUrl, 
  title, 
  onClose = () => {}, 
  isMaximized = false, 
  onToggleMaximize = () => {},
  initialMode = "slides",
  hideModeToggle = false,
  inline = false
}: PdfSlidesViewerProps) {
  const [localFullscreen, setLocalFullscreen] = useState(false);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const isGoogleLink = pdfUrl.includes("docs.google.com/presentation") || pdfUrl.includes("drive.google.com");
  const [scale, setScale] = useState<number>(1.0); // Agora age como um multiplicador de zoom
  const [resizeKey, setResizeKey] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(!(isGoogleLink || initialMode === "scroll"));
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"slides" | "scroll">(isGoogleLink ? "scroll" : initialMode);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pdfDocRef = useRef<any>(null);
  const renderTaskRef = useRef<any>(null);

  // Escuta o redimensionamento da janela para ajustar os slides
  useEffect(() => {
    const handleResize = () => {
      setResizeKey(prev => prev + 1);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Load PDF.js script dynamically
  useEffect(() => {
    if (viewMode === "scroll" || isGoogleLink) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    
    const initPdfJs = async () => {
      try {
        setLoading(true);
        setError(null);

        // Inject PDF.js if not already loaded
        if (!window.pdfjsLib) {
          const script = document.createElement("script");
          script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
          script.async = true;
          document.body.appendChild(script);
          
          await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = () => reject(new Error("Erro ao carregar a biblioteca de PDF.js"));
          });
        }

        if (!window.pdfjsLib) {
          throw new Error("Biblioteca PDF.js não disponível.");
        }

        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

        // Load the document
        const loadingTask = window.pdfjsLib.getDocument({
          url: pdfUrl,
          withCredentials: false
        });

        const pdf = await loadingTask.promise;
        if (isMounted) {
          pdfDocRef.current = pdf;
          setNumPages(pdf.numPages);
          setPageNumber(1);
          setLoading(false);
        }
      } catch (err: any) {
        console.error("Erro no PDF.js:", err);
        if (isMounted) {
          setError("CORS_BLOCK");
          setLoading(false);
        }
      }
    };

    initPdfJs();

    return () => {
      isMounted = false;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [pdfUrl, viewMode]);

  // Render page when pageNumber, scale, resizeKey or viewMode changes
  useEffect(() => {
    if (viewMode === "scroll" || !pdfDocRef.current || loading) return;

    let isMounted = true;

    const renderPage = async () => {
      try {
        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
        }

        const page = await pdfDocRef.current.getPage(pageNumber);
        if (!isMounted) return;

        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const context = canvas.getContext("2d");
        if (!context) return;

        // Calcular a escala ideal para encaixar perfeitamente na tela (Fit-to-Screen)
        const containerWidth = container.clientWidth - 48; // margem interna
        const containerHeight = container.clientHeight - 48; // margem interna
        
        const unscaledViewport = page.getViewport({ scale: 1.0 });
        const scaleX = containerWidth / unscaledViewport.width;
        const scaleY = containerHeight / unscaledViewport.height;
        
        // Multiplica a escala padrão ajustada pelo zoom manual do usuário (scale)
        const renderScale = Math.min(scaleX, scaleY) * scale;
        const viewport = page.getViewport({ scale: renderScale });
        
        // Ajuste para telas de alta densidade (Retina/DPI alto)
        const outputScale = window.devicePixelRatio || 1;
        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = Math.floor(viewport.width) + "px";
        canvas.style.height = Math.floor(viewport.height) + "px";

        const transform = outputScale !== 1 
          ? [outputScale, 0, 0, outputScale, 0, 0] 
          : null;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
          transform: transform
        };

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;
        
        await renderTask.promise;
      } catch (err: any) {
        if (err.name !== "RenderingCancelledException") {
          console.error("Erro na renderização da página:", err);
        }
      }
    };

    renderPage();

    return () => {
      isMounted = false;
    };
  }, [pageNumber, scale, resizeKey, viewMode, loading, localFullscreen, isMaximized]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewMode !== "slides" || loading || !numPages) return;

      if (e.key === "ArrowRight" || e.key === "Space") {
        e.preventDefault();
        setPageNumber(prev => Math.min(prev + 1, numPages));
      } else if (e.key === "ArrowLeft" || e.key === "Backspace") {
        e.preventDefault();
        setPageNumber(prev => Math.max(prev - 1, 1));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [viewMode, loading, numPages]);

  const handleNextPage = () => {
    if (numPages && pageNumber < numPages) {
      setPageNumber(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (pageNumber > 1) {
      setPageNumber(prev => prev - 1);
    }
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.6));
  };

  const handleZoomReset = () => {
    setScale(1.2);
  };

  const getEmbedUrl = () => {
    if (pdfUrl.includes('drive.google.com')) {
      const match = pdfUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return `https://drive.google.com/file/d/${match[1]}/preview`;
      }
    }
    if (pdfUrl.includes('docs.google.com/presentation')) {
      const match = pdfUrl.match(/\/presentation\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return `https://docs.google.com/presentation/d/${match[1]}/embed?start=false&loop=false&delayms=3000`;
      }
    }
    // Retorna o PDF com parâmetros para ocultar a barra de ferramentas (bloqueando download/impressão) mas permitindo rolagem de páginas
    return `${pdfUrl}#toolbar=0&navpanes=0`;
  };

  const isCurrentlyFullscreen = inline ? localFullscreen : isMaximized;

  const wrapperClass = inline && !localFullscreen
    ? "w-full h-full bg-slate-900 border border-slate-800 shadow-lg overflow-hidden flex flex-col rounded-2xl relative"
    : `bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ${
        isCurrentlyFullscreen 
          ? 'w-screen h-screen rounded-none' 
          : pdfUrl.includes('docs.google.com/presentation')
            ? 'w-full max-w-4xl rounded-2xl h-auto'
            : 'w-full max-w-5xl h-[88vh] rounded-2xl'
      }`;

  const content = (
    <div className={wrapperClass}>
      
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/40 shrink-0">
        <div className="flex items-center space-x-3 overflow-hidden">
          <Presentation className="w-5 h-5 text-indigo-400 shrink-0" />
          <div className="truncate">
            <h3 className="font-display font-bold text-slate-100 text-sm md:text-base truncate">
              {title}
            </h3>
            <p className="text-[10px] text-indigo-300/80 font-mono">
              {viewMode === "slides" ? "Modo Apresentação (Slides)" : "Modo de Leitura Padrão"}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* View Mode Toggle */}
          {!hideModeToggle && !isGoogleLink && (
            <div className="flex bg-slate-800/80 rounded-lg p-0.5 border border-slate-700 shrink-0">
              <button
                onClick={() => {
                  setError(null);
                  setViewMode("slides");
                }}
                className={`px-2.5 py-1 rounded-md text-[10px] font-sans font-bold flex items-center space-x-1 transition-colors cursor-pointer border-none ${
                  viewMode === "slides"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200 bg-transparent"
                }`}
                title="Modo Apresentação de Slides"
              >
                <Presentation className="w-3 h-3" />
                <span className="hidden sm:inline">Apresentação</span>
              </button>
              <button
                onClick={() => setViewMode("scroll")}
                className={`px-2.5 py-1 rounded-md text-[10px] font-sans font-bold flex items-center space-x-1 transition-colors cursor-pointer border-none ${
                  viewMode === "scroll"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200 bg-transparent"
                }`}
                title="Modo Rolo / PDF Original"
              >
                <ScrollText className="w-3 h-3" />
                <span className="hidden sm:inline">Modo Leitura</span>
              </button>
            </div>
          )}

          {/* Maximize / Fullscreen Toggle */}
          <button 
            onClick={() => {
              if (inline) {
                setLocalFullscreen(!localFullscreen);
              } else {
                onToggleMaximize();
              }
            }}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer border-none bg-transparent"
            title={isCurrentlyFullscreen ? "Restaurar" : "Tela Cheia"}
          >
            {isCurrentlyFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>

          {/* Close Button for Inline Fullscreen */}
          {inline && localFullscreen && (
            <button 
              onClick={() => setLocalFullscreen(false)}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer border-none bg-transparent"
              title="Fechar Tela Cheia"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Close Button for Overlay Modal */}
          {!inline && (
            <button 
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer border-none bg-transparent"
              title="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

        {/* Content Area */}
        <div 
          ref={containerRef}
          className="flex-1 overflow-auto bg-slate-950 flex items-center justify-center relative p-4 focus:outline-none select-none"
        >
          {viewMode === "slides" ? (
            <>
              {loading && (
                <div className="flex flex-col items-center justify-center text-slate-400 space-y-3">
                  <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                  <p className="text-xs font-sans">Carregando apresentação...</p>
                </div>
              )}
              
              {!loading && !error && (
                <div className="relative shadow-2xl border border-slate-800/80 bg-white rounded-lg overflow-hidden transition-transform duration-200 max-w-full">
                  <canvas ref={canvasRef} className="block max-w-full object-contain" />
                </div>
              )}

              {!loading && error === "CORS_BLOCK" && (
                <div className="flex flex-col items-center justify-center p-6 text-center max-w-md bg-slate-900 border border-slate-800 rounded-xl space-y-4 shadow-xl">
                  <AlertCircle className="w-12 h-12 text-indigo-400" />
                  <h4 className="font-sans font-bold text-slate-200 text-sm">Bloqueio de Segurança (CORS)</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    O servidor onde o PDF está hospedado bloqueou o carregamento da apresentação interativa. Use o <strong>Modo Leitura</strong> no cabeçalho ou configure as regras de CORS no servidor.
                  </p>
                  <button
                    onClick={() => {
                      setViewMode("scroll");
                      setError(null);
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-sans font-bold rounded-lg cursor-pointer border-none shadow-md"
                  >
                    Mudar para Modo Leitura
                  </button>
                </div>
              )}

              {/* Side Navigation Arrow - Prev */}
              {!loading && pageNumber > 1 && (
                <button
                  onClick={handlePrevPage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-900/60 hover:bg-indigo-600/90 text-slate-300 hover:text-white border border-slate-800 hover:border-indigo-500 transition-all cursor-pointer backdrop-blur-sm shadow-lg hidden md:block"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}

              {/* Side Navigation Arrow - Next */}
              {!loading && numPages && pageNumber < numPages && (
                <button
                  onClick={handleNextPage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-900/60 hover:bg-indigo-600/90 text-slate-300 hover:text-white border border-slate-800 hover:border-indigo-500 transition-all cursor-pointer backdrop-blur-sm shadow-lg hidden md:block"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}
            </>
          ) : (
            <div className="w-full h-full relative">
              {error && (
                <div className="absolute top-2 left-2 right-2 bg-indigo-950/80 border border-indigo-800 text-indigo-200 px-3 py-2 rounded-lg text-xs flex items-center space-x-2 z-10">
                  <AlertCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span className="font-sans font-medium">{error}</span>
                </div>
              )}
              <iframe 
                src={getEmbedUrl()}
                className="w-full h-full border-none"
                title={title}
              />
              {/* Película de proteção transparente absoluta - ativa apenas no Google Drive para bloquear download */}
              {pdfUrl && pdfUrl.includes('drive.google.com') && (
                <div className="absolute top-0 right-0 left-0 h-16 bg-transparent cursor-default" />
              )}
              {pdfUrl && pdfUrl.includes('docs.google.com/presentation') && (
                <div className="absolute bottom-0 right-0 w-32 h-10 bg-transparent cursor-default" />
              )}
            </div>
          )}
        </div>

        {/* Footer / Control Bar */}
        {viewMode === "slides" && !loading && numPages && (
          <div className="p-3 border-t border-slate-800 bg-slate-950/60 shrink-0 flex flex-col md:flex-row items-center justify-between gap-3 text-slate-400">
            
            {/* Slide Navigation and Indicators */}
            <div className="flex items-center space-x-3">
              <button
                onClick={handlePrevPage}
                disabled={pageNumber <= 1}
                className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer text-slate-300"
                title="Slide Anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <span className="text-xs font-mono font-medium text-slate-300">
                Slide {pageNumber} de {numPages}
              </span>

              <button
                onClick={handleNextPage}
                disabled={pageNumber >= numPages}
                className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer text-slate-300"
                title="Próximo Slide"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="hidden sm:block flex-1 max-w-xs mx-6">
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${(pageNumber / numPages) * 100}%` }}
                />
              </div>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleZoomOut}
                disabled={scale <= 0.6}
                className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors cursor-pointer border-none bg-transparent"
                title="Afastar Zoom"
              >
                <ZoomIn className="w-4 h-4 scale-x-[-1]" />
              </button>
              
              <span className="text-[10px] font-mono min-w-[40px] text-center text-slate-300 font-bold">
                {Math.round(scale * 100)}%
              </span>

              <button
                onClick={handleZoomIn}
                disabled={scale >= 3.0}
                className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors cursor-pointer border-none bg-transparent"
                title="Aproximar Zoom"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <button
                onClick={handleZoomReset}
                className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors cursor-pointer border-none bg-transparent"
                title="Tamanho Padrão"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        )}
      </div>
  );

  if (inline && !localFullscreen) {
    return content;
  }

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 backdrop-blur-md animate-smooth-fade ${isCurrentlyFullscreen ? 'p-0' : 'p-4'}`}>
      {content}
    </div>
  );
}
