import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CourseRecommendationProps {
  score: number;
  investmentRatio: number; // investment / income
}

export default function CourseRecommendation({ score, investmentRatio }: CourseRecommendationProps) {
  const navigate = useNavigate();

  const suggestion = useMemo(() => {
    if (score < 50) {
      return {
        module: 'Fundamentos da Mentalidade Financeira',
        reason: 'Seu score financeiro indica que fortalecer sua base é o próximo passo.',
      };
    }
    if (investmentRatio < 0.05) {
      return {
        module: 'Primeiros Investimentos',
        reason: 'Seus investimentos estão baixos. Aprenda como começar a investir.',
      };
    }
    if (score < 70) {
      return {
        module: 'Controle Inteligente do Dinheiro',
        reason: 'Melhore seu controle financeiro para elevar seu score.',
      };
    }
    return null;
  }, [score, investmentRatio]);

  if (!suggestion) return null;

  return (
    <div className="glass rounded-2xl p-4 space-y-3 animate-fade-in">
      <div className="flex items-center gap-2">
        <BookOpen size={16} className="text-primary" />
        <span className="text-xs font-medium text-foreground">Aula Recomendada</span>
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">{suggestion.module}</p>
        <p className="text-[11px] text-muted-foreground mt-1">{suggestion.reason}</p>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="h-7 text-[11px] gap-1"
        onClick={() => navigate('/engenharia')}
      >
        Continuar Aprendendo
        <ArrowRight size={12} />
      </Button>
    </div>
  );
}
