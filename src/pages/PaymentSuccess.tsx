import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

export default function PaymentSuccess() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="glass rounded-2xl p-8 max-w-md w-full text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8 text-emerald-400" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Pagamento confirmado!</h1>
        <p className="text-muted-foreground">
          Seu acesso Premium foi ativado com sucesso. Aproveite todos os recursos do FinControl.
        </p>
        <Button onClick={() => navigate('/')} className="w-full">
          Ir para o Dashboard
        </Button>
      </div>
    </div>
  );
}
