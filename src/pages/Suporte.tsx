import { MessageCircle, Headphones, HelpCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const WHATSAPP_URL = 'https://wa.me/5516997578462?text=Olá%20preciso%20de%20ajuda%20com%20minha%20assinatura';

export default function Suporte() {
  return (
    <div className="space-y-6 pb-24">
      <div>
        <h1 className="text-xl font-bold text-foreground">Suporte</h1>
        <p className="text-sm text-muted-foreground">Estamos aqui para ajudar</p>
      </div>

      <Card className="border-primary/20 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-emerald-500 to-primary" />
        <CardContent className="pt-6 space-y-4">
          <div className="mx-auto w-14 h-14 rounded-full bg-emerald-500/15 flex items-center justify-center">
            <Headphones className="h-7 w-7 text-emerald-400" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-lg font-bold text-foreground">Fale com nosso suporte</h2>
            <p className="text-sm text-muted-foreground">
              Precisa de ajuda com pagamento, assinatura ou acesso ao app? Fale com nosso suporte pelo WhatsApp.
            </p>
          </div>
          <Button
            className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
            size="lg"
            onClick={() => window.open(WHATSAPP_URL, '_blank')}
          >
            <MessageCircle className="h-5 w-5" />
            Falar no WhatsApp
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-primary" />
          Dúvidas frequentes
        </h3>
        {[
          { q: 'Como ativar meu plano Premium?', a: 'Acesse "Minha Assinatura" no menu e escolha seu plano.' },
          { q: 'Meu pagamento foi aprovado mas o Premium não ativou', a: 'Aguarde alguns minutos ou entre em contato pelo WhatsApp.' },
          { q: 'Como cancelar minha assinatura?', a: 'Acesse "Minha Assinatura" e clique em cancelar.' },
        ].map((faq, i) => (
          <Card key={i} className="border-border/50">
            <CardContent className="py-3 px-4">
              <p className="text-xs font-medium text-foreground">{faq.q}</p>
              <p className="text-xs text-muted-foreground mt-1">{faq.a}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
