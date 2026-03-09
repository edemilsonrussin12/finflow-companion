import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { useInView } from '@/hooks/useInView';

const questions = [
  {
    id: 1,
    text: "Você sabe para onde vai seu dinheiro todo mês?",
    options: [
      { label: "Sim, controlo tudo", score: 2 },
      { label: "Às vezes acompanho", score: 1 },
      { label: "Não tenho controle", score: 0 },
    ]
  },
  {
    id: 2,
    text: "Você possui reserva financeira de emergência?",
    options: [
      { label: "Sim, mais de 3 meses de gastos", score: 2 },
      { label: "Estou construindo", score: 1 },
      { label: "Ainda não tenho", score: 0 },
    ]
  },
  {
    id: 3,
    text: "Você investe parte da sua renda mensalmente?",
    options: [
      { label: "Sim, regularmente", score: 2 },
      { label: "Quero começar em breve", score: 1 },
      { label: "Ainda não invisto", score: 0 },
    ]
  },
  {
    id: 4,
    text: "Como estão suas dívidas no momento?",
    options: [
      { label: "Sem dívidas ou bem controladas", score: 2 },
      { label: "Tenho algumas, gerenciáveis", score: 1 },
      { label: "Estou endividado", score: 0 },
    ]
  },
];

function getResult(score: number) {
  const max = questions.length * 2;
  const pct = (score / max) * 100;
  
  if (pct >= 75) return {
    level: "Excelente",
    score: Math.round(80 + (pct - 75)),
    color: "text-emerald",
    message: "Você tem ótima disciplina financeira! O FinControl vai turbinar seu crescimento.",
    icon: TrendingUp,
  };
  if (pct >= 50) return {
    level: "Boa",
    score: Math.round(55 + pct / 2),
    color: "text-primary",
    message: "Você está no caminho certo! Com organização certa você pode ir muito mais longe.",
    icon: CheckCircle,
  };
  return {
    level: "Precisa melhorar",
    score: Math.round(pct / 2 + 20),
    color: "text-gold",
    message: "Boa notícia: é possível virar o jogo! O FinControl foi feito para te ajudar nessa.",
    icon: AlertCircle,
  };
}

export default function FinancialHealthQuiz() {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<ReturnType<typeof getResult> | null>(null);
  const { ref, inView } = useInView();

  const handleAnswer = (score: number) => {
    const newAnswers = [...answers, score];
    
    if (newAnswers.length === questions.length) {
      const total = newAnswers.reduce((a, b) => a + b, 0);
      setResult(getResult(total));
      setAnswers(newAnswers);
    } else {
      setAnswers(newAnswers);
      setCurrentQ(currentQ + 1);
    }
  };

  const reset = () => {
    setCurrentQ(0);
    setAnswers([]);
    setResult(null);
  };

  const progress = (answers.length / questions.length) * 100;

  return (
    <section className="py-20 px-6">
      <div ref={ref} className={`max-w-2xl mx-auto transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            Teste gratuito
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Descubra sua saúde financeira{' '}
            <span className="text-emerald">em 30 segundos</span>
          </h2>
          <p className="text-muted-foreground">
            Responda 4 perguntas simples e veja como está sua situação financeira
          </p>
        </div>

        <div className="glass rounded-3xl p-8">
          {!result ? (
            <>
              {/* Progress bar */}
              <div className="mb-8">
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                  <span>Pergunta {currentQ + 1} de {questions.length}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-emerald rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Question */}
              <div key={currentQ} className="animate-fade-in">
                <h3 className="text-xl font-semibold mb-6 text-center">
                  {questions[currentQ].text}
                </h3>

                {/* Options */}
                <div className="space-y-3">
                  {questions[currentQ].options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => handleAnswer(opt.score)}
                      className="w-full text-left p-4 rounded-xl border border-border hover:border-primary hover:bg-primary/10 transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full border-2 border-border group-hover:border-primary flex items-center justify-center text-sm font-bold transition-colors">
                          {String.fromCharCode(65 + i)}
                        </div>
                        <span>{opt.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* Result */
            <div className="text-center space-y-6 animate-fade-in">
              <div className="relative w-36 h-36 mx-auto">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="hsl(var(--muted))" strokeWidth="8" fill="none" />
                  <circle
                    cx="50" cy="50" r="40"
                    stroke="hsl(var(--emerald))"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${result.score * 2.51} 251`}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className={`text-3xl font-bold ${result.color}`}>{result.score}</div>
                  <div className="text-xs text-muted-foreground">{result.level}</div>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-2">Saúde Financeira: {result.level}</h3>
                <p className="text-muted-foreground max-w-md mx-auto">{result.message}</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/cadastro">
                  <Button size="lg" className="fab-glow">
                    Ver meu painel completo
                    <ArrowRight className="ml-2" size={18} />
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={reset}>
                  Refazer teste
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}