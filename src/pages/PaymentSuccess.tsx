import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2, MessageCircle } from 'lucide-react';
import { usePremiumStatus } from '@/hooks/usePremiumStatus';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const WHATSAPP_URL = 'https://wa.me/5516997578462?text=Olá%20preciso%20de%20ajuda%20com%20minha%20assinatura';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { isPremium, loading, recheck } = usePremiumStatus();
  const [pollCount, setPollCount] = useState(0);
  const [activating, setActivating] = useState(false);
  const activationAttempted = useRef(false);

  useEffect(() => {
    if (!user || activationAttempted.current) return;
    activationAttempted.current = true;
    const paymentId = searchParams.get('payment_id') || searchParams.get('collection_id');
    const status = searchParams.get('status') || searchParams.get('collection_status');
    if (paymentId && (status === 'approved' || status === 'null' || !status)) {
      setActivating(true);
      supabase.functions.invoke('activate-premium', {
        body: { payment_id: paymentId, user_id: user.id },
      }).then(({ data }) => {
        if (data?.activated) recheck();
        setActivating(false);
      }).catch(() => setActivating(false));
    }
  }, [user, searchParams, recheck]);

  useEffect(() => {
    if (isPremium || pollCount >= 15 || activating) return;
    const timer = setTimeout(async () => {
      await recheck();
      setPollCount(prev => prev + 1);
    }, 2000);
    return () => clearTimeout(timer);
  }, [isPremium, pollCount, recheck, activating]);

  const activated = isPremium;
  const stillWaiting = !isPremium && (pollCount < 15 || activating) && !loading;
  const timedOut = !isPremium && pollCount >= 15 && !activating;

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
          <div className="space-y-3">
            <p className="text-muted-foreground">
              Seu pagamento foi confirmado. Se o Premium não ativou automaticamente, clique abaixo para tentar novamente.
            </p>
            <Button variant="outline" onClick={() => { setPollCount(0); activationAttempted.current = false; }}>
              Tentar ativar novamente
            </Button>
          </div>
        ) : null}

        <Button onClick={() => navigate('/')} className="w-full">
          Ir para o Dashboard
        </Button>

        <div className="pt-2 border-t border-border/50">
          <p className="text-xs text-muted-foreground mb-2">
            Problemas com pagamento ou assinatura?
          </p>
          <Button variant="ghost" size="sm" className="gap-2 text-emerald-400" onClick={() => window.open(WHATSAPP_URL, '_blank')}>
            <MessageCircle className="h-4 w-4" />
            Suporte via WhatsApp
          </Button>
        </div>
      </div>
    </div>
  );
}
