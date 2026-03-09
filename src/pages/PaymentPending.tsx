import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';

export default function PaymentPending() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="glass rounded-2xl p-8 max-w-md w-full text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center">
          <Clock className="h-8 w-8 text-yellow-400" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Pagamento pendente</h1>
        <p className="text-muted-foreground">
          Estamos aguardando a confirmação do seu pagamento. Assim que for aprovado, seu acesso Premium será ativado automaticamente.
        </p>
        <Button onClick={() => navigate('/')} variant="outline" className="w-full">
          Voltar ao Dashboard
        </Button>
      </div>
    </div>
  );
}
