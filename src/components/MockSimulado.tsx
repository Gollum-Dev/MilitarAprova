import React, { useState } from 'react';
import { X, CheckCircle, XCircle, ArrowRight, Award } from 'lucide-react';

interface MockSimuladoProps {
  onClose: () => void;
  onNavigateToLogin: () => void;
}

const QUESTIONS = [
  {
    id: 1,
    subject: "Estatuto dos Militares",
    text: "Segundo o Estatuto dos Militares, quais são os princípios básicos que formam a base institucional das corporações militares?",
    options: ["Honra e Coragem", "Hierarquia e Disciplina", "Bravura e Lealdade", "Ordem e Progresso"],
    correctAnswer: 1,
    explanation: "A hierarquia militar e a disciplina formam a base institucional das Forças Armadas. A autoridade e a responsabilidade crescem com o grau hierárquico."
  },
  {
    id: 2,
    subject: "Estatuto dos Militares",
    text: "O militar da ativa que, de acordo com a legislação, passar para a inatividade e continuar percebendo remuneração do Estado, ingressa na situação de:",
    options: ["Reserva Remunerada ou Reformado", "Reserva Não Remunerada", "Guarda Nacional de Inatividade", "Licenciado a Pedido"],
    correctAnswer: 0,
    explanation: "A inatividade remunerada compreende a reserva remunerada (quando o militar ainda pode ser convocado) e a reforma (quando o militar está dispensado definitivamente de prestação de serviço)."
  },
  {
    id: 3,
    subject: "Estatuto dos Militares",
    text: "A precedência entre militares da ativa do mesmo grau hierárquico, ou seja, quem tem prioridade sobre o outro, é assegurada principalmente:",
    options: ["Pela idade do militar (o mais velho)", "Pela antiguidade no posto ou graduação", "Pelo número de medalhas recebidas", "Pela nota final no curso de formação exclusivamente"],
    correctAnswer: 1,
    explanation: "A antiguidade no posto ou na graduação é o critério principal estabelecido em lei para definir a precedência entre militares de mesmo grau hierárquico."
  },
  {
    id: 4,
    subject: "Estatuto dos Militares",
    text: "Como é definida a rigorosa observância e o acatamento integral das leis, regulamentos, normas e disposições que fundamentam o organismo militar?",
    options: ["Hierarquia", "Disciplina", "Espírito de Corpo", "Patriotismo"],
    correctAnswer: 1,
    explanation: "Essa é a exata definição legal de Disciplina Militar, que exige a pronta obediência às ordens dos superiores e o acatamento às regras da corporação."
  },
  {
    id: 5,
    subject: "Estatuto dos Militares",
    text: "Qual das alternativas abaixo NÃO é considerada uma manifestação essencial do valor militar?",
    options: ["O patriotismo, traduzido pela vontade inabalável de cumprir o dever", "O civismo e o culto das tradições históricas", "A busca constante por enriquecimento pessoal e lucro", "A fé na missão elevada das instituições militares"],
    correctAnswer: 2,
    explanation: "A busca por lucro pessoal não faz parte dos valores militares descritos em lei, que focam no patriotismo, civismo, fé na missão e aprimoramento técnico-profissional."
  }
];

export default function MockSimulado({ onClose, onNavigateToLogin }: MockSimuladoProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);

  const question = QUESTIONS[currentQuestion];

  const handleSelectOption = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
  };

  const handleConfirmAnswer = () => {
    if (selectedOption === null || isAnswered) return;
    
    setIsAnswered(true);
    setUserAnswers([...userAnswers, selectedOption]);
    if (selectedOption === question.correctAnswer) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
    }
  };

  if (isFinished) {
    const percentage = (score / QUESTIONS.length) * 100;
    let feedbackMsg = "Você tem um bom potencial, mas precisa focar mais na preparação!";
    if (percentage === 100) feedbackMsg = "Excelente! Você está no caminho certo para a aprovação.";
    else if (percentage >= 60) feedbackMsg = "Muito bom! Com a nossa plataforma você gabarita na próxima.";

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-smooth-fade">
        <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl relative text-center">
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
          
          <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Award className="w-10 h-10" />
          </div>
          
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Simulado Concluído!</h2>
          <p className="text-slate-500 font-sans mb-6">Aqui está o seu resultado preliminar:</p>
          
          <div className="bg-slate-50 rounded-2xl p-6 mb-6 shrink-0">
            <div className="text-5xl font-black text-indigo-600 mb-2">{score}/{QUESTIONS.length}</div>
            <p className="text-slate-600 font-sans">{feedbackMsg}</p>
          </div>
          
          <p className="text-sm text-slate-500 font-sans mb-4 shrink-0">
            Quer ter acesso a <strong>simulados completos</strong>, métricas de desempenho e banco de questões ilimitado?
          </p>
          
          <button 
            onClick={() => { onClose(); onNavigateToLogin(); }} 
            className="w-full py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold uppercase tracking-wider text-sm transition-colors shadow-lg shadow-green-500/30 mb-3"
          >
            Quero me Matricular
          </button>
          <button onClick={onClose} className="w-full py-3 text-slate-500 hover:text-slate-700 font-sans text-sm font-semibold transition-colors">
            Voltar para a página inicial
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-smooth-fade">
      <div className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl relative flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6 shrink-0">
          <div>
            <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">Simulado Teste</div>
            <h2 className="text-lg md:text-xl font-bold text-slate-800">Questão {currentQuestion + 1} de {QUESTIONS.length}</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Question Area */}
        <div className="overflow-y-auto flex-1 pr-2 custom-scrollbar">
          <div className="inline-block px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold font-sans mb-4">
            {question.subject}
          </div>
          
          <p className="text-slate-800 font-sans text-lg leading-relaxed mb-8 text-justify">
            {question.text}
          </p>

          <div className="space-y-3 mb-6">
            {question.options.map((opt, idx) => {
              let btnClass = "w-full text-left p-4 rounded-xl border-2 font-sans transition-all ";
              
              if (!isAnswered) {
                if (selectedOption === idx) btnClass += "border-indigo-500 bg-indigo-50 text-indigo-900";
                else btnClass += "border-slate-200 hover:border-indigo-300 bg-white text-slate-700";
              } else {
                if (idx === question.correctAnswer) {
                  btnClass += "border-green-500 bg-green-50 text-green-900";
                } else if (idx === selectedOption) {
                  btnClass += "border-red-500 bg-red-50 text-red-900";
                } else {
                  btnClass += "border-slate-200 bg-slate-50 text-slate-400 opacity-50";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={isAnswered}
                  className={btnClass}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="w-8 h-8 rounded-full border border-current flex items-center justify-center font-bold shrink-0">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{opt}</span>
                    </div>
                    {isAnswered && idx === question.correctAnswer && <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />}
                    {isAnswered && idx === selectedOption && idx !== question.correctAnswer && <XCircle className="w-5 h-5 text-red-500 shrink-0" />}
                  </div>
                </button>
              );
            })}
          </div>

          {isAnswered && (
            <div className="mt-2 mb-6 p-4 bg-indigo-50/80 rounded-xl border border-indigo-100 animate-smooth-fade">
              <strong className="block mb-1 text-indigo-700 uppercase tracking-wider text-[11px] font-bold">Comentário do Professor</strong>
              <p className="text-sm text-indigo-900 font-sans leading-relaxed text-justify">
                {question.explanation}
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-100 shrink-0">
          {!isAnswered ? (
            <button 
              onClick={handleConfirmAnswer}
              disabled={selectedOption === null}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold uppercase tracking-wider text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              Confirmar Resposta
            </button>
          ) : (
            <button 
              onClick={handleNextQuestion}
              className="w-full py-4 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold uppercase tracking-wider text-sm transition-colors flex items-center justify-center space-x-2 shadow-md"
            >
              <span>{currentQuestion < QUESTIONS.length - 1 ? 'Próxima Questão' : 'Ver Resultado'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
