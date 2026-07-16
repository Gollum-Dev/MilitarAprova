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

// 5. Create Mercado Pago Checkout Preference
app.post("/api/payments/create-preference", async (req, res) => {
  const { email, courseId } = req.body;
  if (!email || !courseId) {
    return res.status(400).json({ error: "E-mail e Course ID são obrigatórios." });
  }

  try {
    // Fetch course details to get title and price
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
      return res.status(404).json({ error: "Curso não encontrado." });
    }

    const price = parseFloat(course.price || 297.00);
    const title = course.title;

    // If MP token is not set, simulate payment creation (for offline development)
    const mpToken = process.env.MP_ACCESS_TOKEN;
    if (!mpToken) {
      console.warn("MP_ACCESS_TOKEN is not set. Creating a mock preference.");
      const mockPreferenceId = `mock-pref-${Math.random().toString(36).substring(7)}`;
      
      const { error: insertError } = await supabase
        .from('payments')
        .insert([{
          student_email: email,
          course_id: courseId,
          status: 'pending',
          amount: price,
          preference_id: mockPreferenceId
        }]);

      if (insertError) {
        console.error("Error inserting mock payment:", insertError);
        return res.status(500).json({ error: `Erro ao salvar transação temporária: ${insertError.message || JSON.stringify(insertError)}` });
      }

      const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;
      return res.json({
        init_point: `${appUrl}/?mock_payment=true&preference_id=${mockPreferenceId}&course_id=${courseId}&email=${encodeURIComponent(email)}`,
        preferenceId: mockPreferenceId
      });
    }

    // Call Mercado Pago API to create preference
    const response = await fetch("https://api.mercadopago.com/v1/preferences", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${mpToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        items: [
          {
            id: courseId,
            title: title,
            quantity: 1,
            unit_price: price,
            currency_id: "BRL"
          }
        ],
        payer: {
          email: email
        },
        back_urls: {
          success: `${process.env.APP_URL || 'http://localhost:3000'}/?payment_status=success`,
          pending: `${process.env.APP_URL || 'http://localhost:3000'}/?payment_status=pending`,
          failure: `${process.env.APP_URL || 'http://localhost:3000'}/?payment_status=failure`
        },
        auto_return: "approved",
        notification_url: `${process.env.APP_URL || 'http://localhost:3000'}/api/payments/webhook`
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Mercado Pago API error:", errText);
      return res.status(500).json({ error: "Erro ao criar preferência no Mercado Pago." });
    }

    const prefData = await response.json() as any;

    const { error: insertError } = await supabase
      .from('payments')
      .insert([{
        student_email: email,
        course_id: courseId,
        status: 'pending',
        amount: price,
        preference_id: prefData.id
      }]);

    if (insertError) {
      console.error("Error inserting payment record:", insertError);
      return res.status(500).json({ error: `Erro ao salvar transação de pagamento: ${insertError.message || JSON.stringify(insertError)}` });
    }

    res.json({
      init_point: prefData.init_point,
      preferenceId: prefData.id
    });
  } catch (err: any) {
    console.error("Error creating payment preference:", err);
    res.status(500).json({ error: err.message || "Erro interno do servidor." });
  }
});

// 6. Mercado Pago Webhook Notification Receiver
app.post("/api/payments/webhook", async (req, res) => {
  const paymentId = req.body?.data?.id || req.query?.id;
  const action = req.body?.action || req.query?.topic;

  console.log(`Mercado Pago Webhook received. Payment ID: ${paymentId}, Action/Topic: ${action}`);

  if (!paymentId) {
    return res.status(200).send("No payment ID provided");
  }

  try {
    const mpToken = process.env.MP_ACCESS_TOKEN;
    if (!mpToken) {
      console.warn("MP_ACCESS_TOKEN is not set. Webhook received but cannot verify payment.");
      return res.status(200).send("No token configured");
    }

    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        "Authorization": `Bearer ${mpToken}`
      }
    });

    if (!response.ok) {
      console.error(`Failed to fetch payment details from Mercado Pago: ${response.statusText}`);
      return res.status(200).send("Failed to fetch payment details");
    }

    const paymentDetails = await response.json() as any;
    const preferenceId = paymentDetails.preference_id;
    const status = paymentDetails.status;

    console.log(`Payment Details - Preference ID: ${preferenceId}, Status: ${status}`);

    if (preferenceId) {
      const { data: paymentRecord, error: updateError } = await supabase
        .from('payments')
        .update({ status: status, payment_id: String(paymentId), updated_at: new Date().toISOString() })
        .eq('preference_id', preferenceId)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating payment status in database:", updateError);
      } else if (paymentRecord && status === "approved") {
        const email = paymentRecord.student_email;
        const courseId = paymentRecord.course_id;

        const { data: student, error: studentError } = await supabase
          .from('students')
          .select('*')
          .eq('email', email)
          .single();

        if (studentError || !student) {
          console.log(`Student not found for email ${email}. Creating a new student account...`);
          const newStudent = {
            name: email.split('@')[0],
            email: email,
            password: 'google-oauth-login',
            phone: '',
            cpf: '',
            status: 'Ativo',
            allowed_courses: [courseId]
          };
          const { error: createError } = await supabase
            .from('students')
            .insert([newStudent]);
          if (createError) {
            console.error("Error creating student on webhook:", createError);
          } else {
            console.log(`Successfully created student account and unlocked course ${courseId} for ${email}`);
          }
        } else {
          let allowed = student.allowed_courses || [];
          if (!allowed.includes(courseId)) {
            allowed.push(courseId);
            const { error: saveError } = await supabase
              .from('students')
              .update({ allowed_courses: allowed })
              .eq('id', student.id);

            if (saveError) {
              console.error("Error updating student allowed courses:", saveError);
            } else {
              console.log(`Successfully unlocked course ${courseId} for student ${email}`);
            }
          }
        }
      }
    }

    res.status(200).send("OK");
  } catch (err: any) {
    console.error("Error in Webhook handler:", err);
    res.status(200).send("Internal processing error");
  }
});

// 7. Mock Payment Confirmation (for local development/testing without API keys)
app.post("/api/payments/mock-confirm", async (req, res) => {
  const { preferenceId, courseId, email } = req.body;
  if (!preferenceId || !courseId || !email) {
    return res.status(400).json({ error: "Parâmetros inválidos." });
  }

  try {
    const { error: updateError } = await supabase
      .from('payments')
      .update({ status: 'approved', updated_at: new Date().toISOString() })
      .eq('preference_id', preferenceId);

    if (updateError) console.error("Error updating mock payment:", updateError);

    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('email', email)
      .single();

    if (studentError || !student) {
      const newStudent = {
        name: email.split('@')[0],
        email: email,
        password: 'google-oauth-login',
        phone: '',
        cpf: '',
        status: 'Ativo',
        allowed_courses: [courseId]
      };
      const { error: createError } = await supabase
        .from('students')
        .insert([newStudent]);
      if (createError) {
        return res.status(500).json({ error: "Erro ao criar estudante no modo simulado." });
      }
    } else {
      let allowed = student.allowed_courses || [];
      if (!allowed.includes(courseId)) {
        allowed.push(courseId);
        const { error: saveError } = await supabase
          .from('students')
          .update({ allowed_courses: allowed })
          .eq('id', student.id);

        if (saveError) {
          return res.status(500).json({ error: "Erro ao atualizar permissões do estudante." });
        }
      }
    }

    res.json({ success: true, message: "Curso liberado com sucesso (Modo Simulado)!" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
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
