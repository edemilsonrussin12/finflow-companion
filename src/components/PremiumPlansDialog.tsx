import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Crown, Sparkles, Zap } from 'lucide-react';
import { toast } from 'sonner';

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
  const handleSelectPlan = (plan: string) => {
    toast.info(`O plano ${plan} estará disponível em breve! Fique ligado.`);
    onOpenChange(false);
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
                  <p className="text-xs text-muted-foreground">Assinatura recorrente</p>
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

              <Button className="w-full" onClick={() => handleSelectPlan('Premium Mensal')}>
                Assinar Premium Mensal
              </Button>
            </CardContent>
          </Card>

          {/* Lifetime Plan */}
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
                  <p className="text-sm font-bold text-foreground">Premium Vitalício</p>
                  <p className="text-xs text-muted-foreground">Pagamento único</p>
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
                  <span>Acesso permanente — pague uma vez</span>
                </div>
              </div>

              <Button variant="outline" className="w-full border-primary/30" onClick={() => handleSelectPlan('Premium Vitalício')}>
                Adquirir Premium Vitalício
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
