import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import { Question, LawArticle } from "./src/data";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.VITE_SUPABASE_ANON_KEY || 'placeholder'
);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client Lazily/Safely
let ai: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;

if (apiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini Client successfully initialized on backend.");
  } catch (err) {
    console.error("Failed to initialize Gemini Client:", err);
  }
} else {
  console.warn("GEMINI_API_KEY is not set. Running in offline/mock fallback mode.");
}

// Helper to interact with Gemini
async function askCaboVeio(prompt: string, contextHistory: { role: 'user' | 'model'; parts: { text: string }[] }[] = []): Promise<string> {
  if (!ai) {
    return `[MODO SIMULADO] Olá, combatente! O Tutor IA está operando no modo local.

Aqui está uma resposta pré-programada de suporte para a sua pergunta:
"Foco total na disciplina e hierarquia para o CHO CBMMG! Lembre-se de estudar os artigos 13 e 14 do CEDM, bem como o Artigo 142 da Constituição Federal aplicados aos bombeiros. A jurisprudência tática do CBMMG costuma cobrar a literalidade com questões de aplicação prática e prevenção/combate."

(Para habilitar o suporte real de Inteligência Artificial com o modelo Gemini 3.5, configure sua GEMINI_API_KEY no painel de Secrets do AI Studio!)`;
  }

  try {
    const contents = [
      ...contextHistory.map(c => ({
        role: c.role,
        parts: [{ text: c.parts[0].text }]
      })),
      { role: 'user' as const, parts: [{ text: prompt }] }
    ];

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: "Você é o Cabo Véio, um militar veterano calejado, extremamente experiente, com décadas de caserna, que conhece tudo sobre a rotina militar, regulamentos oficiais e macetes de sobrevivência nas Forças Militares. Seu estilo de fala é direto, de caserna, firme e objetivo. Chame o aluno de 'combatente' ou pelo sobrenome militar apropriado. Responda de forma curta, sucinta, simples e prática, indo direto ao ponto da dúvida. Use termos militares leves de forma natural e fundamente brevemente nos artigos legais aplicáveis.",
        temperature: 0.7,
      }
    });

    return response.text || "Sem resposta do Tutor IA.";
  } catch (err: any) {
    console.error("Gemini API Error in askCaboVeio:", err);
    return `Combatente, houve uma falha de comunicação com o centro de inteligência (Gemini API: ${err.message || err}). Mas não desanime! Continue estudando os materiais indicados na doutrina.`;
  }
}

// API Routes

app.get("/api/health", async (req, res) => {
  let dbStatus = "desconectado";
  let dbError = null;
  try {
    const { data, error } = await supabase.from('law_articles').select('id').limit(1);
    if (error) {
      dbStatus = "erro";
      dbError = error.message;
    } else {
      dbStatus = "conectado";
    }
  } catch (err: any) {
    dbStatus = "erro";
    dbError = err.message || err;
  }

  res.json({
    status: "ok",
    offlineMode: !process.env.GEMINI_API_KEY,
    database: {
      status: dbStatus,
      error: dbError,
      url: process.env.VITE_SUPABASE_URL ? `${process.env.VITE_SUPABASE_URL.substring(0, 25)}...` : 'ausente'
    }
  });
});

// 1. Chat with the IA Tutor (Cabo Véio)
app.post("/api/tutor/chat", async (req, res) => {
  const { message, history } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Mensagem é obrigatória." });
  }

  const responseText = await askCaboVeio(message, history || []);
  res.json({ text: responseText });
});

// 2. Leis Inteligentes Search and Synthesis
app.post("/api/leis/search", async (req, res) => {
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: "Termo de busca é obrigatório." });
  }

  const qLower = query.toLowerCase();
  
  // Fetch laws from Supabase
  const { data: allLaws } = await supabase.from('law_articles').select('*');
  const matchedLaws = (allLaws || []).filter(
    (law: any) => law.title.toLowerCase().includes(qLower) || 
           law.content.toLowerCase().includes(qLower) || 
           law.citation.toLowerCase().includes(qLower) ||
           law.category.toLowerCase().includes(qLower)
  );

  // Fetch questions from Supabase
  const { data: allQuestions } = await supabase.from('questions').select('*');
  const matchedQuestions = (allQuestions || []).filter(
    (q: any) => q.discipline.toLowerCase().includes(qLower) ||
         q.subject.toLowerCase().includes(qLower) ||
         q.text.toLowerCase().includes(qLower)
  );

  let synthesis = "";
  if (ai) {
    try {
      const lawsContext = matchedLaws.map(l => `[${l.citation}] ${l.title}:\n${l.content}`).join("\n\n");
      const prompt = `Como Cabo Véio, faça uma síntese ultra direta, curta e objetiva sobre o termo de pesquisa "${query}".
Seja extremamente sucinto e vá direto aos artigos aplicáveis listados a seguir, explicando em poucas linhas:
${lawsContext || "Nenhuma lei correspondente direta encontrada. Discorra de forma muito breve e direta sobre as regras desse tema no âmbito militar."}

Destaque o que cai na prova em poucas frases curtas.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          temperature: 0.4,
        }
      });
      synthesis = response.text || "";
    } catch (err: any) {
      console.error("Gemini Error during law synthesis:", err);
      synthesis = `Erro ao sintetizar via IA (${err.message || err}). Encontrados ${matchedLaws.length} artigos locais correspondentes.`;
    }
  } else {
    synthesis = `[SÍNTESE LOCAL] Termo pesquisado: "${query}". 
    Temos ${matchedLaws.length} artigos jurídicos correspondentes e ${matchedQuestions.length} questões relacionadas. No modo de demonstração local, você pode ler o conteúdo direto de cada artigo abaixo. Configure a chave de API para obter resumos estruturados por IA.`;
  }

  res.json({
    laws: matchedLaws,
    questions: matchedQuestions,
    synthesis
  });
});

// 3. Generate adaptive micro-simulado
app.post("/api/simulados/generate", async (req, res) => {
  const { focusSubject } = req.body; // e.g., "Improbidade Administrativa" or "CEDM Art. 13"
  const subject = focusSubject || "Legislação Militar Geral";

  if (!ai) {
    // Return standard simulated test questions
    const { data } = await supabase.from('questions').select('*').limit(3);
    const fallbackQuestions = data || [];
    return res.json({
      title: `Simulado Adaptativo IA: ${subject}`,
      description: "Gerado com o banco de dados tático local para o CHO CBMMG.",
      questions: fallbackQuestions,
      isAiGenerated: false
    });
  }

  try {
    const prompt = `Gere um simulado contendo EXATAMENTE 3 questões inéditas de múltipla escolha focadas no assunto "${subject}" aplicadas ao concurso CHO CBMMG.
Para cada questão, forneça:
1. ID de controle (ex: Q-IA-01, Q-IA-02, Q-IA-03)
2. Disciplina e Assunto
3. Um enunciado bem elaborado de nível difícil, simulando a banca do CBMMG.
4. Quatro alternativas (A, B, C, D) sendo apenas uma correta.
5. Indicação clara da alternativa correta.
6. Uma justificativa detalhada e militar mencionando a fundamentação legal aplicável.

Retorne obrigatoriamente um objeto JSON com a seguinte estrutura estrita:
{
  "title": "Simulado Adaptativo de Reforço - ${subject}",
  "description": "Treinamento intensivo gerado dinamicamente pela IA focado nas suas falhas do tema ${subject}.",
  "questions": [
    {
      "id": "string",
      "banca": "CBMMG (IA)",
      "year": 2026,
      "discipline": "string",
      "subject": "string",
      "text": "string",
      "alternatives": [
        { "letter": "A", "text": "string" },
        { "letter": "B", "text": "string" },
        { "letter": "C", "text": "string" },
        { "letter": "D", "text": "string" }
      ],
      "correct": "A" | "B" | "C" | "D",
      "explanation": "string"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.5,
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    res.json({
      ...parsedData,
      isAiGenerated: true
    });
  } catch (err: any) {
    console.error("Gemini simulation generator failed:", err);
    // Return standard mock as fallback
    res.json({
      title: `Simulado Adaptativo: ${subject} (Fallback)`,
      description: `Erro ao gerar via IA (${err.message || err}). Carregamos questões do banco tático local do CHO CBMMG.`,
      questions: [],
      isAiGenerated: false
    });
  }
});

// Proxy to bypass CORS / Cloudflare blocking on PDFs and Slides
app.get("/api/proxy/pdf", async (req, res) => {
  const url = req.query.url as string;
  if (!url) {
    return res.status(400).send("URL is required");
  }

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": new URL(url).origin
      }
    });

    if (!response.ok) {
      return res.status(response.status).send(`Failed to fetch PDF: ${response.statusText}`);
    }

    const contentType = response.headers.get("content-type") || "application/pdf";
    res.setHeader("Content-Type", contentType);
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    res.send(buffer);
  } catch (err: any) {
    console.error("Error in PDF proxy:", err);
    res.status(500).send(`Proxy error: ${err.message}`);
  }
});

// 4. Question Explanation / Comment by IA
app.post("/api/questoes/feedback", async (req, res) => {
  const { questionId, questionText, selectedAnswer, correctAnswer } = req.body;

  if (!questionText) {
    return res.status(400).json({ error: "Texto da questão é obrigatório." });
  }

  const isCorrect = selectedAnswer === correctAnswer;

  if (!ai) {
    return res.json({
      comment: `[Análise do Cabo Véio]
Você escolheu a alternativa ${selectedAnswer}. A resposta correta é ${correctAnswer}.
${isCorrect ? "Excelente trabalho, combatente! Você demonstrou atenção aos preceitos legais e doutrina oficial dos bombeiros. Mantenha essa precisão nos seus estudos!" : "Atenção, combatente! Errar na preparação é oportunidade de aprendizado. Lembre-se de revisar minuciosamente os artigos aplicáveis e a literalidade da lei."}

(Dica: Ative a chave de API Gemini nos Secrets para obter uma análise individualizada e macetes mnemônicos detalhados sobre esta questão!)`
    });
  }

  try {
    const prompt = `Analise o desempenho do aluno Silva na seguinte questão de concurso militar:
Enunciado: "${questionText}"
Gabarito Oficial: ${correctAnswer}
Resposta do Aluno: ${selectedAnswer}
O aluno acertou? ${isCorrect ? "SIM" : "NÃO"}

Como Cabo Véio, veterano e instrutor militar, comente a questão de forma extremamente curta, direta e objetiva.
Explique em no máximo 3 frases curtas por que a alternativa ${correctAnswer} está correta e por que a resposta do aluno (${selectedAnswer}) está ${isCorrect ? "correta" : "incorreta"}.
Dê um mnemônico ou macete rápido de 1 linha.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        temperature: 0.6,
      }
    });

    res.json({
      comment: response.text || "Sem comentários adicionais da IA."
    });
  } catch (err: any) {
    console.error("Gemini failed to generate question comment:", err);
    res.json({
      comment: `Erro de conexão com o Cabo Véio IA (${err.message || err}). Lembre-se que o gabarito oficial é a alternativa ${correctAnswer}.`
    });
  }
});

// Serve frontend assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", async () => {
    console.log(`Cabo Véio Server listening on port ${PORT}`);
    
    // Test Supabase connection on startup
    try {
      const { data, error } = await supabase.from('law_articles').select('id').limit(1);
      if (error) {
        console.warn("⚠️ Supabase Connection Warning:", error.message);
      } else {
        console.log("✅ Supabase Database Connection Successful!");
      }
    } catch (err: any) {
      console.error("❌ Unexpected error during Supabase connection test:", err.message || err);
    }
  });
}

startServer();
