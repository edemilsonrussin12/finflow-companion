import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { usePremiumStatus } from '@/hooks/usePremiumStatus';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const { isPremium, loading, recheck } = usePremiumStatus();
  const [pollCount, setPollCount] = useState(0);

  // Poll for premium activation (webhook may take a few seconds)
  useEffect(() => {
    if (isPremium || pollCount >= 10) return;

    const timer = setTimeout(async () => {
      await recheck();
      setPollCount(prev => prev + 1);
    }, 3000);

    return () => clearTimeout(timer);
  }, [isPremium, pollCount, recheck]);

  const activated = isPremium;
  const stillWaiting = !isPremium && pollCount < 10 && !loading;
  const timedOut = !isPremium && pollCount >= 10;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="glass rounded-2xl p-8 max-w-md w-full text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8 text-emerald-400" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Pagamento confirmado!</h1>

        {loading || stillWaiting ? (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Ativando seu acesso Premium...</span>
            </div>
            <p className="text-xs text-muted-foreground">Isso pode levar alguns segundos.</p>
          </div>
        ) : activated ? (
          <p className="text-muted-foreground">
            Seu acesso Premium foi ativado com sucesso! Aproveite todos os recursos do FinControl.
          </p>
        ) : timedOut ? (
          <p className="text-muted-foreground">
            Seu pagamento foi confirmado. O acesso Premium será ativado em instantes.
            Você pode voltar ao Dashboard e atualizar a página.
          </p>
        ) : null}

        <Button onClick={() => navigate('/')} className="w-full">
          Ir para o Dashboard
        </Button>
      </div>
    </div>
  );
}
