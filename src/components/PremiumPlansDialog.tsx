import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Crown, Sparkles, Zap, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface PremiumPlansDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
}

const benefits = [
  'Acesso a todos os módulos do curso',
  'Conteúdos futuros inclusos',
  'Funcionalidades financeiras avançadas',
];

export default function PremiumPlansDialog({ open, onOpenChange, title, description }: PremiumPlansDialogProps) {
  const { user } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSelectPlan = async (plan: 'monthly' | 'annual', label: string) => {
    if (!user) {
      toast.error('Faça login para assinar um plano.');
      return;
    }

    setLoadingPlan(plan);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { user_id: user.id, plan },
      });

      if (error || !data?.init_point) {
        throw new Error(error?.message || 'Erro ao criar sessão de pagamento');
      }

      window.location.href = data.init_point;
    } catch (err: any) {
      console.error('Checkout error:', err);
      toast.error(err.message || 'Erro ao processar pagamento. Tente novamente.');
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Crown className="h-5 w-5 text-primary" />
            {title || 'Desbloqueie o Acesso Premium'}
          </DialogTitle>
          <DialogDescription>
            {description || 'Escolha o plano ideal para continuar sua jornada financeira.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Monthly Plan */}
          <Card className="border-primary/30 relative overflow-hidden">
            <div className="absolute top-0 right-0">
              <Badge className="rounded-none rounded-bl-lg text-[10px]">Popular</Badge>
            </div>
            <CardContent className="pt-5 pb-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Premium Mensal</p>
                  <p className="text-xs text-muted-foreground">R$ 19,90/mês</p>
                </div>
              </div>

              <div className="space-y-2">
                {benefits.map((b, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>{b}</span>
                  </div>
                ))}
              </div>

              <Button
                className="w-full"
                disabled={loadingPlan === 'monthly'}
                onClick={() => handleSelectPlan('monthly', 'Premium Mensal')}
              >
                {loadingPlan === 'monthly' ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processando...</>
                ) : (
                  'Assinar Premium Mensal'
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Annual Plan */}
          <Card className="border-accent/30 relative overflow-hidden">
            <div className="absolute top-0 right-0">
              <Badge variant="secondary" className="rounded-none rounded-bl-lg text-[10px]">Melhor valor</Badge>
            </div>
            <CardContent className="pt-5 pb-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-accent/20 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Premium Anual</p>
                  <p className="text-xs text-muted-foreground">R$ 167,00/ano <span className="text-primary">(~R$ 13,92/mês)</span></p>
                </div>
              </div>

              <div className="space-y-2">
                {benefits.map((b, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>{b}</span>
                  </div>
                ))}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>Economia de 30% em relação ao mensal</span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full border-primary/30"
                disabled={loadingPlan === 'annual'}
                onClick={() => handleSelectPlan('annual', 'Premium Anual')}
              >
                {loadingPlan === 'annual' ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processando...</>
                ) : (
                  'Assinar Premium Anual'
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Free plan info */}
          <div className="text-center pt-1">
            <p className="text-[11px] text-muted-foreground">
              Plano Gratuito: acesso ao Módulo 1 e funções básicas do app.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
