import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { usePremiumStatus } from '@/hooks/usePremiumStatus';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { isPremium, loading, recheck } = usePremiumStatus();
  const [pollCount, setPollCount] = useState(0);
  const [activating, setActivating] = useState(false);
  const activationAttempted = useRef(false);

  // On mount: try to activate premium using MP redirect params
  useEffect(() => {
    if (!user || activationAttempted.current) return;
    activationAttempted.current = true;

    const paymentId = searchParams.get('payment_id') || searchParams.get('collection_id');
    const status = searchParams.get('status') || searchParams.get('collection_status');

    console.log('[SUCCESS PAGE] MP redirect params | payment_id:', paymentId, '| status:', status, '| user:', user.id);

    if (paymentId && (status === 'approved' || status === 'null' || !status)) {
      setActivating(true);
      console.log('[SUCCESS PAGE] Calling activate-premium edge function...');

      supabase.functions.invoke('activate-premium', {
        body: { payment_id: paymentId, user_id: user.id, plan: 'monthly' },
      }).then(({ data, error }) => {
        console.log('[SUCCESS PAGE] activate-premium response:', JSON.stringify(data), error);
        if (data?.activated) {
          recheck();
        }
        setActivating(false);
      }).catch(err => {
        console.error('[SUCCESS PAGE] activate-premium error:', err);
        setActivating(false);
      });
    }
  }, [user, searchParams, recheck]);

  // Poll for premium activation as fallback
  useEffect(() => {
    if (isPremium || pollCount >= 10 || activating) return;

    const timer = setTimeout(async () => {
      console.log('[SUCCESS PAGE] Polling premium status... attempt', pollCount + 1);
      await recheck();
      setPollCount(prev => prev + 1);
    }, 3000);

    return () => clearTimeout(timer);
  }, [isPremium, pollCount, recheck, activating]);

  const activated = isPremium;
  const stillWaiting = !isPremium && (pollCount < 10 || activating) && !loading;
  const timedOut = !isPremium && pollCount >= 10 && !activating;

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
