import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Crown, Sparkles, Zap, Loader2, Shield } from 'lucide-react';
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
  'Controle financeiro completo',
  'Planejamento de crescimento financeiro',
  'Engenharia da riqueza (todos os módulos)',
  'Simulação de patrimônio futuro',
  'Orçamentos profissionais com PDF',
  'Controle de serviços e produtos',
  'Assistente IA ilimitado',
  'Suporte direto',
  'Atualizações futuras incluídas',
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
            {description || 'Invista no controle do seu dinheiro hoje para ter tranquilidade no futuro.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Annual Plan - Best value, shown first */}
          <Card className="border-primary/40 relative overflow-hidden ring-1 ring-primary/20">
            <div className="absolute top-0 right-0">
              <Badge className="rounded-none rounded-bl-lg text-[10px] bg-primary">Melhor custo-benefício</Badge>
            </div>
            <CardContent className="pt-5 pb-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Premium Anual</p>
                  <p className="text-xs text-muted-foreground">R$ 167,00/ano <span className="text-primary font-medium">(~R$ 13,92/mês)</span></p>
                </div>
              </div>

              <div className="space-y-1.5">
                {benefits.map((b, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>{b}</span>
                  </div>
                ))}
                <div className="flex items-center gap-2 text-xs font-medium text-primary">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>Economia de 30% em relação ao mensal</span>
                </div>
              </div>

              <Button
                className="w-full"
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

          {/* Monthly Plan */}
          <Card className="border-border/50 relative overflow-hidden">
            <CardContent className="pt-5 pb-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Premium Mensal</p>
                  <p className="text-xs text-muted-foreground">R$ 19,90/mês</p>
                </div>
              </div>

              <div className="space-y-1.5">
                {benefits.slice(0, 5).map((b, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>{b}</span>
                  </div>
                ))}
                <p className="text-[10px] text-muted-foreground pl-5">+ todos os benefícios Premium</p>
              </div>

              <Button
                variant="outline"
                className="w-full border-primary/30"
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

          {/* Free plan info + trust */}
          <div className="text-center space-y-2 pt-1">
            <p className="text-[11px] text-muted-foreground">
              Plano Gratuito: acesso ao Módulo 1 e funções básicas do app.
            </p>
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground/70">
              <Shield className="h-3 w-3" />
              <span>Seus dados permanecem privados e seguros.</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
