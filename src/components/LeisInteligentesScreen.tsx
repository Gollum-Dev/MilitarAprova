import React, { useState } from "react";
import { 
  Scale, Search, Sparkles, RefreshCw, BookOpen, AlertCircle, ArrowRight, HelpCircle 
} from "lucide-react";
import { LawArticle } from "../data";

export default function LeisInteligentesScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [laws, setLaws] = useState<LawArticle[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [synthesis, setSynthesis] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const quickSearches = [
    "Hierarquia",
    "Artigo 5º",
    "CEDM",
    "Recusa de Obediência",
    "Atos Administrativos"
  ];

  const handleSearch = async (queryText: string) => {
    if (!queryText.trim()) return;
    setSearchQuery(queryText);
    setIsSearching(true);
    setHasSearched(true);

    try {
      const response = await fetch("/api/leis/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: queryText })
      });
      const data = await response.json();
      setLaws(data.laws || []);
      setQuestions(data.questions || []);
      setSynthesis(data.synthesis || "");
    } catch (err) {
      console.error(err);
      setSynthesis("Houve um erro ao se comunicar com a Central Jurídica. Por favor, tente novamente combatente.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchQuery);
  };

  return (
    <div className="space-y-6" id="leis-inteligentes-view">
      {/* Central Title and Search */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm text-center space-y-4 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center justify-center space-x-2 text-indigo-600">
          <Scale className="w-8 h-8 shrink-0" />
          <h2 className="text-xl md:text-2xl font-sans font-extrabold uppercase tracking-wider text-slate-800">
            Central de Comando Jurídico
          </h2>
        </div>
        <p className="text-xs text-slate-500 max-w-xl mx-auto leading-relaxed">
          Consulte artigos de lei de forma cruzada. Nossa inteligência correlaciona leis constitucionais, códigos penais e regulamentos institucionais da CBMMG com as questões de provas anteriores.
        </p>

        {/* Search Input bar */}
        <form onSubmit={handleFormSubmit} className="max-w-2xl mx-auto relative mt-3">
          <input
            id="law-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Digite uma palavra ou assunto. Exemplo: 'Hierarquia' ou 'CEDM'"
            className="w-full pl-11 pr-24 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
          />
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-5 h-5" />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="absolute inset-y-1.5 right-1.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white text-xs font-sans font-bold uppercase rounded-lg transition-colors flex items-center space-x-1 cursor-pointer border-none shadow-sm"
          >
            {isSearching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            <span>Pesquisar</span>
          </button>
        </form>

        {/* Quick searches badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs">
          <span className="text-slate-400 font-mono uppercase text-[10px]">Sugestões:</span>
          {quickSearches.map((qs) => (
            <button
              key={qs}
              onClick={() => handleSearch(qs)}
              className="px-2.5 py-1 bg-slate-50 border border-slate-200 hover:border-indigo-300 text-slate-600 hover:text-indigo-600 rounded-md transition-all cursor-pointer font-mono text-[11px]"
            >
              {qs}
            </button>
          ))}
        </div>
      </div>

      {/* Results grid */}
      {hasSearched && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Synthesized Cross Report from IA (Left & Center) */}
          <div className="lg:col-span-2 space-y-6">
            {/* IA Synthesis Banner */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 text-indigo-600 border-b border-slate-100 pb-3 font-bold">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h3 className="text-xs font-mono uppercase tracking-widest font-extrabold">
                  Parecer Sintetizado pela IA
                </h3>
              </div>

              {isSearching ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-3">
                  <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
                  <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">
                    Major Aranha está consolidando as referências e redigindo parecer...
                  </p>
                </div>
              ) : (
                <div className="text-xs text-slate-700 leading-relaxed font-sans italic whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                  {synthesis || "Nenhuma síntese disponível para a busca efetuada."}
                </div>
              )}
            </div>

            {/* Laws/Articles Matches */}
            <div className="space-y-4">
              <h3 className="text-sm font-sans font-bold uppercase tracking-wider text-slate-800">
                Artigos de Lei Correlacionados
              </h3>

              {laws.length > 0 ? (
                <div className="space-y-4">
                  {laws.map((law) => (
                    <div key={law.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <span className="text-xs font-mono font-bold text-indigo-600 uppercase tracking-wider">
                          {law.citation}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 uppercase bg-slate-100 px-2 py-0.5 rounded">
                          {law.category}
                        </span>
                      </div>
                      <h4 className="text-xs font-sans font-bold text-slate-800 uppercase">{law.title}</h4>
                      <p className="text-xs text-slate-700 leading-relaxed font-sans bg-slate-50 p-3.5 rounded-lg border border-slate-200/60 whitespace-pre-line">
                        {law.content}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-xl p-6 text-center text-slate-400 text-xs">
                  Nenhum artigo de lei correspondente no banco de dados local.
                </div>
              )}
            </div>
          </div>

          {/* Related Questions Column (Right) */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-800 mb-4 flex items-center space-x-1.5 font-bold">
                <HelpCircle className="w-4 h-4 text-indigo-600" />
                <span>Questões do Tema</span>
              </h3>

              {questions.length > 0 ? (
                <div className="space-y-3">
                  {questions.map((q) => (
                    <div key={q.id} className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="text-indigo-600 font-bold">{q.id}</span>
                        <span className="text-slate-400">{q.banca} • {q.year}</span>
                      </div>
                      <p className="text-[11px] text-slate-700 line-clamp-2 leading-relaxed">
                        {q.text}
                      </p>
                      <button
                        onClick={() => alert(`Combatente! Para resolver a questão ${q.id}, acesse a aba 'Questões' no menu principal.`)}
                        className="text-[10px] font-mono font-bold text-indigo-600 hover:text-indigo-700 hover:underline uppercase flex items-center space-x-1 cursor-pointer bg-transparent border-none p-0"
                      >
                        <span>Resolver agora</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs">
                  Nenhuma questão correlata encontrada no banco de dados local para esse termo.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
