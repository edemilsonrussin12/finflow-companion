import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { XCircle, MessageCircle } from 'lucide-react';

const WHATSAPP_URL = 'https://wa.me/5516997578462?text=Olá%20preciso%20de%20ajuda%20com%20minha%20assinatura';

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
          <Button onClick={() => navigate('/minha-assinatura')} className="flex-1">
            Tentar novamente
          </Button>
        </div>
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
