import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';

export default function PaymentFailure() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="glass rounded-2xl p-8 max-w-md w-full text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
          <XCircle className="h-8 w-8 text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Pagamento não aprovado</h1>
        <p className="text-muted-foreground">
          Houve um problema com o seu pagamento. Tente novamente ou escolha outro método de pagamento.
        </p>
        <div className="flex gap-3">
          <Button onClick={() => navigate('/')} variant="outline" className="flex-1">
            Voltar
          </Button>
          <Button onClick={() => navigate('/')} className="flex-1">
            Tentar novamente
          </Button>
        </div>
      </div>
    </div>
  );
}
