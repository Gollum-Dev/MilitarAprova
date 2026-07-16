export interface Question {
  id: string;
  banca: string;
  year: number;
  discipline: string;
  subject: string;
  text: string;
  alternatives: {
    letter: 'A' | 'B' | 'C' | 'D';
    text: string;
  }[];
  correct: 'A' | 'B' | 'C' | 'D';
  explanation: string;
}

export interface LawArticle {
  id: string;
  title: string;
  category: string;
  citation: string;
  content: string;
  relatedQuestions: string[]; // IDs of related questions
}

export interface CourseModule {
  id: string;
  title: string;
  description: string;
  lessonsCount: number;
  pdfsCount: number;
  questionsCount: number;
  progress: number;
  rawDiscipline?: any;
}

export interface Course {
  id: string;
  title: string;
  subtitle: string;
  hours: number;
  lessons: number;
  disciplinesCount: number;
  cover_url?: string;
  description?: string;
  modules: CourseModule[];
}

export const COURSES: Course[] = [
  {
    id: "cho-cbmmg-2027",
    title: "CURSO OFICIAL PREMIUM - CHO CBMMG 2027",
    subtitle: "Curso de Habilitação de Oficiais Bombeiros Militares. Prepare-se com rigor militar e suporte tecnológico de ponta.",
    hours: 480,
    lessons: 120,
    disciplinesCount: 14,
    modules: [
      {
        id: "mod-01",
        title: "Módulo 01: Direito Constitucional",
        description: "Fundamentos da constituição, direitos e garantias fundamentais e a segurança pública na CF/88.",
        lessonsCount: 12,
        pdfsCount: 8,
        questionsCount: 45,
        progress: 75
      },
      {
        id: "mod-02",
        title: "Módulo 02: Direito Administrativo",
        description: "Atos administrativos, poderes da administração, agentes públicos e responsabilidade civil do Estado.",
        lessonsCount: 15,
        pdfsCount: 10,
        questionsCount: 60,
        progress: 40
      },
      {
        id: "mod-03",
        title: "Módulo 03: Direito Penal Militar",
        description: "Crimes militares em tempo de paz e em tempo de guerra, aplicação da lei penal militar e penas.",
        lessonsCount: 20,
        pdfsCount: 12,
        questionsCount: 80,
        progress: 25
      },
      {
        id: "mod-04",
        title: "Módulo 04: Regulamento Disciplinar",
        description: "CEDM (Código de Ética e Disciplina dos Militares de MG), transgressões disciplinares e rito do PAD.",
        lessonsCount: 10,
        pdfsCount: 5,
        questionsCount: 30,
        progress: 10
      }
    ]
  },
  {
    id: "cfo-cbmmg-2027",
    title: "CURSO PREPARATÓRIO ELITE - CFO CBMMG 2027",
    subtitle: "Curso de Formação de Oficiais. Prepare-se para a liderança e comando com conteúdo profundo e simulados de alto rendimento.",
    hours: 600,
    lessons: 180,
    disciplinesCount: 18,
    modules: [
      {
        id: "mod-cfo-01",
        title: "Módulo 01: Física e Química do Fogo",
        description: "Dinâmica de incêndios, propagação de calor e propriedades químicas dos materiais combustíveis.",
        lessonsCount: 25,
        pdfsCount: 15,
        questionsCount: 90,
        progress: 15
      },
      {
        id: "mod-cfo-02",
        title: "Módulo 02: Tática de Combate a Incêndio",
        description: "Estratégias de extinção de chamas, resgate em estruturas colapsadas e salvamento veicular.",
        lessonsCount: 30,
        pdfsCount: 20,
        questionsCount: 110,
        progress: 0
      }
    ]
  },
  {
    id: "eap-cbmmg-2026",
    title: "EXAME DE APTIDÃO PROFISSIONAL - EAP CBMMG 2026",
    subtitle: "Revisão focada e intensiva para promoção de praças e oficiais, abordando atualizações doutrinárias e regulamentos vigentes.",
    hours: 150,
    lessons: 40,
    disciplinesCount: 6,
    modules: [
      {
        id: "mod-eap-01",
        title: "Módulo 01: Legislação Institucional Aplicada",
        description: "Regulamento de promoção de praças, estatuto militar e prerrogativas da carreira de segurança.",
        lessonsCount: 12,
        pdfsCount: 6,
        questionsCount: 40,
        progress: 90
      }
    ]
  }
];

export const QUESTIONS: Question[] = [
  {
    id: "Q-28491",
    banca: "CRS/PMMG",
    year: 2023,
    discipline: "Direito Constitucional",
    subject: "Forças Armadas e Segurança Pública",
    text: "No que tange aos direitos, deveres e regramento constitucional dos militares dos Estados, Distrito Federal e Territórios, bem como à organização das Forças Armadas, assinale a alternativa CORRETA em conformidade com a Constituição Federal de 1988:",
    alternatives: [
      {
        letter: "A",
        text: "As Forças Armadas são constituídas pela Marinha, pelo Exército, pela Aeronáutica e pelas Forças Auxiliares, sendo estas últimas organizadas sob comando da união em tempo de paz."
      },
      {
        letter: "B",
        text: "Ao militar são proibidas a sindicalização e a greve, sendo-lhe, contudo, permitido o alistamento eleitoral e a filiação a partidos políticos enquanto estiver em serviço ativo."
      },
      {
        letter: "C",
        text: "O militar em serviço ativo que aceitar cargo público civil permanente será transferido para a reserva, nos termos da lei, mantendo o direito à promoção por antiguidade."
      },
      {
        letter: "D",
        text: "O oficial da Polícia Militar só perderá o posto e a patente se for julgado indigno do oficialato ou com ele incompatível, por decisão de tribunal militar de caráter permanente ou de tribunal de justiça comum."
      }
    ],
    correct: "D",
    explanation: "O Art. 142, § 3º, VI da CF/88, aplicável aos militares dos Estados por força do Art. 42, § 1º, estabelece que o oficial só perderá o posto e a patente se for julgado indigno do oficialato ou com ele incompatível, por decisão de tribunal militar de caráter permanente em tempo de paz ou de tribunal especial em tempo de guerra. O Art. 42, § 2º dita que o tribunal militar estadual ou o Tribunal de Justiça apreciará a indignidade."
  },
  {
    id: "Q-19042",
    banca: "CRS/PMMG",
    year: 2024,
    discipline: "Regulamento Disciplinar",
    subject: "CEDM - Lei Estadual 14.310/02",
    text: "O Código de Ética e Disciplina dos Militares de Minas Gerais (Lei Estadual nº 14.310/2002) regulamenta a conduta militar. Diante das disposições contidas na referida lei, assinale a opção que indica uma transgressão disciplinar classificada como GRAVE:",
    alternatives: [
      {
        letter: "A",
        text: "Deixar de apresentar-se, logo que ciente, à autoridade competente quando convocado para depor ou prestar esclarecimentos em inquérito administrativo."
      },
      {
        letter: "B",
        text: "Faltar ao serviço para o qual esteja nominalmente escalado ou abandonar o posto ou serviço para o qual tenha sido designado, sem justa causa."
      },
      {
        letter: "C",
        text: "Apresentar-se para o serviço sem o fardamento regulamentar previsto para a atividade, ou com fardamento desalinhado ou incompleto."
      },
      {
        letter: "D",
        text: "Deixar de prestar a devida continência militar a superior hierárquico ou de responder à continência de subordinado, por mera desatenção."
      }
    ],
    correct: "B",
    explanation: "Faltar ou abandonar o posto/serviço sem justa causa é uma transgressão de natureza GRAVE (Art. 13 do CEDM). As demais alternativas tratam de transgressões médias ou leves, ou configuram condutas de menor potencial ofensivo disciplinar."
  },
  {
    id: "Q-32405",
    banca: "CRS/PMMG",
    year: 2023,
    discipline: "Direito Administrativo",
    subject: "Atos Administrativos",
    text: "O ato administrativo consiste na declaração do Estado ou de quem o represente, que produz efeitos jurídicos imediatos. Dentre os elementos ou requisitos de validade do ato administrativo, assinale a alternativa que descreve CORRETAMENTE o elemento da 'Competência':",
    alternatives: [
      {
        letter: "A",
        text: "É o efeito jurídico imediato que o ato produz na ordem jurídica, devendo sempre ser lícito e moral."
      },
      {
        letter: "B",
        text: "Consiste no poder outorgado por lei ao agente público para o desempenho de suas atribuições, sendo este um requisito intransferível e inderrogável por acordo das partes."
      },
      {
        letter: "C",
        text: "Representa a motivação de fato e de direito que autorizou a expedição e o conteúdo do ato público administrativo."
      },
      {
        letter: "D",
        text: "Trata-se do procedimento externo exigido por lei para a perfeita exteriorização da vontade do administrador."
      }
    ],
    correct: "B",
    explanation: "A competência (ou sujeito) é o poder outorgado pela lei ao agente público para o exercício de suas funções. Apresenta como características a irrenunciabilidade, a intransferibilidade e a inderrogabilidade (salvo os casos legais de delegação e avocação)."
  },
  {
    id: "Q-45019",
    banca: "CRS/PMMG",
    year: 2022,
    discipline: "Direito Penal Militar",
    subject: "Crimes Contra a Autoridade ou Disciplina",
    text: "De acordo com o Código Penal Militar (Decreto-Lei nº 1.001/1969), o crime de Recusa de Obediência (Art. 163) configura crime de extrema gravidade para o serviço de caserna. Assinale a conduta típica que caracteriza esse crime:",
    alternatives: [
      {
        letter: "A",
        text: "Deixar de cumprir ordem recebida de superior hierárquico sobre assunto de serviço ou dever imposto em lei, regulamento ou instrução."
      },
      {
        letter: "B",
        text: "Recusar obediência a ordem do superior sobre assunto de serviço, ou de dever imposto por lei, regulamento ou instrução."
      },
      {
        letter: "C",
        text: "Promover a reunião de militares ou nela tomar parte, para discutir ato de superior ou assunto disciplinar interno."
      },
      {
        letter: "D",
        text: "Opor-se à execução de ato legal, mediante violência ou ameaça a superior ou sentinela."
      }
    ],
    correct: "B",
    explanation: "O crime de Recusa de Obediência (Art. 163 do CPM) tem como núcleo 'recusar obediência a ordem do superior sobre assunto de serviço, ou de dever imposto sob preceito de lei, regulamento ou instrução'. Deixar de cumprir ordem (sem recusa expressa) tipifica o crime de Deserção de Dever ou Prevaricação/Descumprimento de Serviço do Art. 196 ou outro tipo penal específico."
  },
  {
    id: "Q-11482",
    banca: "CRS/PMMG",
    year: 2024,
    discipline: "Direito Constitucional",
    subject: "Remédios Constitucionais",
    text: "Os remédios constitucionais são garantias fundamentais destinadas a assegurar o exercício de direitos individuais violados por atos de autoridade. No contexto das atividades policiais e do controle de legalidade, assinale a afirmativa CORRETA referente ao Mandado de Segurança Coletivo:",
    alternatives: [
      {
        letter: "A",
        text: "Pode ser impetrado por qualquer cidadão em pleno gozo de seus direitos políticos, visando anular ato lesivo ao patrimônio público."
      },
      {
        letter: "B",
        text: "Pode ser impetrado por partido político com representação no Congresso Nacional, ou por organização sindical, entidade de classe ou associação legalmente constituída e em funcionamento há pelo menos um ano, em defesa dos interesses de seus membros ou associados."
      },
      {
        letter: "C",
        text: "Consiste na ação judicial cabível sempre que a falta de norma regulamentadora torne inviável o exercício dos direitos e liberdades constitucionais."
      },
      {
        letter: "D",
        text: "É o remédio cabível para assegurar o conhecimento de informações relativas à pessoa do impetrante, constantes de registros ou bancos de dados governamentais."
      }
    ],
    correct: "B",
    explanation: "O Art. 5º, LXX da CF/88 estabelece que o mandado de segurança coletivo pode ser impetrado por: a) partido político com representação no Congresso Nacional; b) organização sindical, entidade de classe ou associação legalmente constituída e em funcionamento há pelo menos um ano, em defesa dos interesses de seus membros ou associados."
  }
];

export const LEIS_ARTICLES: LawArticle[] = [
  {
    id: "lei-01",
    title: "Artigo 142 da Constituição Federal (Das Forças Armadas)",
    category: "Constituição da República Federativa do Brasil de 1988",
    citation: "Art. 142, CF/88",
    content: "As Forças Armadas, constituídas pela Marinha, pelo Exército e pela Aeronáutica, são instituições nacionais permanentes e regulares, organizadas com base na hierarquia e na disciplina, sob a autoridade suprema do Presidente da República, e destinam-se à defesa da Pátria, à garantia dos poderes constitucionais e, por iniciativa de qualquer destes, da lei e da ordem.\n\n§ 1º Lei complementar estabelecerá as normas gerais a serem adotadas na organização, no preparo e no emprego das Forças Armadas.\n\n§ 2º Não caberá habeas corpus em relação a punições disciplinares militares.",
    relatedQuestions: ["Q-28491"]
  },
  {
    id: "lei-02",
    title: "Artigo 144 da Constituição Federal (Da Segurança Pública)",
    category: "Constituição da República Federativa do Brasil de 1988",
    citation: "Art. 144, CF/88",
    content: "A segurança pública, dever do Estado, direito e responsabilidade de todos, é exercida para a preservação da ordem pública e da incolumidade das pessoas e do patrimônio, através dos seguintes órgãos:\nI - polícia federal;\nII - polícia rodoviária federal;\nIII - polícia ferroviária federal;\nIV - polícias civis;\nV - polícias militares e corpos de bombeiros militares.\n\n§ 5º Às polícias militares cabem a polícia ostensiva e a preservação da ordem pública; aos corpos de bombeiros militares, além das atribuições definidas em lei, incumbe a execução de atividades de defesa civil.",
    relatedQuestions: ["Q-28491", "Q-11482"]
  },
  {
    id: "lei-03",
    title: "Artigo 13 do CEDM (Classificação das Transgressões)",
    category: "Regulamento Disciplinar",
    citation: "Art. 13, Lei Estadual 14.310/02",
    content: "As transgressões disciplinares são classificadas em graves, médias e leves, conforme sua gravidade e repercussão no serviço ou na imagem das Instituições Militares Estaduais.\n\nSão transgressões de natureza GRAVE:\n- Faltar ao serviço para o qual esteja nominalmente escalado ou abandonar o posto ou serviço sem justa causa;\n- Praticar ato de violência física ou moral contra superior, igual ou subordinado;\n- Utilizar-se do cargo ou da função militar para obter proveito pessoal ou para terceiros, em descumprimento dos deveres éticos.",
    relatedQuestions: ["Q-19042"]
  },
  {
    id: "lei-04",
    title: "Artigo 163 do Código Penal Militar (Recusa de Obediência)",
    category: "Penal Militar",
    citation: "Art. 163, Dec-Lei 1.001/69",
    content: "Recusar obediência a ordem do superior sobre assunto de serviço, ou de dever imposto sob preceito de lei, regulamento ou instrução:\n\nPena - detenção, de um a dois anos, se o fato não constitui crime mais grave.\n\nEste crime protege a autoridade e a disciplina na caserna, sendo classificado como crime de mera conduta, consumando-se no exato momento da recusa manifesta pelo militar subordinado diante de ordem legal e clara de superior.",
    relatedQuestions: ["Q-45019"]
  },
  {
    id: "lei-05",
    title: "Artigo 5º da Constituição Federal (Direitos e Deveres Individuais e Coletivos)",
    category: "Constituição da República Federativa do Brasil de 1988",
    citation: "Art. 5º, CF/88",
    content: "Todos são iguais perante a lei, sem distinção de qualquer natureza, garantindo-se aos brasileiros e aos estrangeiros residentes no País a inviolabilidade do direito à vida, à liberdade, à igualdade, à segurança e à propriedade, nos termos seguintes:\n\nLXX - o mandado de segurança coletivo pode ser impetrado por:\na) partido político com representação no Congresso Nacional;\nb) organização sindical, entidade de classe ou associação legalmente constituída e em funcionamento há pelo menos um ano, em defesa dos interesses de seus membros ou associados.",
    relatedQuestions: ["Q-11482"]
  }
];

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  date?: string;
}

export const BADGES: Badge[] = [
  {
    id: "badge-1",
    title: "Grito de Guerra",
    description: "Alistou-se na caserna do Cabo Véio.",
    icon: "ShieldAlert",
    unlocked: true,
    date: "14/05/2026"
  },
  {
    id: "badge-2",
    title: "Sob Pressão",
    description: "Resolveu 100 questões com aproveitamento superior a 80%.",
    icon: "Flame",
    unlocked: true,
    date: "22/05/2026"
  },
  {
    id: "badge-3",
    title: "Inabalável",
    description: "Manteve 10 dias seguidos de estudos ativos na plataforma.",
    icon: "CalendarCheck",
    unlocked: true,
    date: "05/06/2026"
  },
  {
    id: "badge-4",
    title: "Selo de Honra (Top 1%)",
    description: "Atingiu nota média de 9.2 em três simulados seguidos de nível oficial.",
    icon: "Award",
    unlocked: true,
    date: "18/06/2026"
  },
  {
    id: "badge-5",
    title: "Especialista em CFD/CEDM",
    description: "Gabaritou um micro-simulado focado do Tutor IA sobre Ética Militar.",
    icon: "Compass",
    unlocked: false
  },
  {
    id: "badge-6",
    title: "General do Tópico",
    description: "Pesquisou e resolveu todas as questões correlatas de 5 Leis Inteligentes.",
    icon: "Crown",
    unlocked: false
  }
];

export interface SimulatorProgress {
  title: string;
  avgGrade: number;
  cohortGrade: number;
  history: {
    name: string;
    grade: number;
  }[];
}

export const SIMULATOR_PROGRESS: SimulatorProgress = {
  title: "Evolução Estratégica - Seu progresso nos últimos 5 simulados",
  avgGrade: 8.4,
  cohortGrade: 7.1,
  history: [
    { name: "Simulado 01", grade: 7.2 },
    { name: "Simulado 02", grade: 8.0 },
    { name: "Simulado 03", grade: 7.5 },
    { name: "Simulado 04", grade: 8.8 },
    { name: "Simulado 05", grade: 9.2 }
  ]
};

export interface MockSimulator {
  id: string;
  title: string;
  description: string;
  questionsCount: number;
  duration: string;
  status: "aberto" | "finalizado" | "recomendado" | "bloqueado";
  grade?: number;
  estGain?: string;
  questions?: Question[];
  course_ids?: string[];
}

export const MOCK_SIMULATORS: MockSimulator[] = [
  {
    id: "sim-01",
    title: "CHO CBMMG Simulado Geral 01",
    description: "Foco em Legislação Institucional, Direito Penal Militar e Atividades de Defesa Civil.",
    questionsCount: 50,
    duration: "02h 00m",
    status: "aberto"
  },
  {
    id: "sim-02",
    title: "CFO CBMMG Simulado Especial 04",
    description: "Simulado geral abrangendo todas as matérias e exigências regulamentares do CBMMG.",
    questionsCount: 40,
    duration: "01h 40m",
    status: "finalizado",
    grade: 7.8
  },
  {
    id: "sim-03",
    title: "Simulado Adaptativo de Reforço (TUTOR IA)",
    description: "Gerado dinamicamente com base em suas fraquezas recentes de Direito Administrativo e Constitucional do Bombeiro Militar.",
    questionsCount: 5,
    duration: "45m",
    status: "recomendado",
    estGain: "+0.5 na Nota Geral",
    questions: QUESTIONS // Default adaptive set
  },
  {
    id: "sim-04",
    title: "Simulado de Ranking Geral CBMMG (Oficiais)",
    description: "Competição aberta para todos os candidatos bombeiros com ranking estadual ao vivo.",
    questionsCount: 50,
    duration: "02h 30m",
    status: "bloqueado"
  }
];
