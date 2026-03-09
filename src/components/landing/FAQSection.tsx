import { useInView } from '@/hooks/useInView';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { HelpCircle } from 'lucide-react';

const faqs = [
  {
    question: 'O aplicativo é gratuito?',
    answer: 'Sim! O FinControl possui um plano gratuito com todas as funcionalidades básicas de controle financeiro. Também oferecemos um plano Premium com recursos avançados como simuladores, curso completo e relatórios detalhados.',
  },
  {
    question: 'Preciso entender de investimentos para usar?',
    answer: 'Não! O aplicativo foi criado para pessoas de todos os níveis. Começamos do básico e você aprende conforme usa. Nosso curso "Engenharia da Riqueza" te guia passo a passo.',
  },
  {
    question: 'Meus dados financeiros ficam seguros?',
    answer: 'Absolutamente. Utilizamos criptografia de ponta a ponta, seus dados são armazenados em servidores seguros e nunca compartilhamos suas informações com terceiros.',
  },
  {
    question: 'Posso usar mesmo sem experiência em finanças?',
    answer: 'Com certeza! O FinControl foi desenvolvido pensando em iniciantes. A interface é intuitiva e fornecemos dicas e orientações para cada funcionalidade.',
  },
  {
    question: 'Como começo a usar o aplicativo?',
    answer: 'É muito simples! Crie sua conta gratuitamente, cadastre suas primeiras receitas e despesas, e pronto. Em minutos você já terá uma visão clara da sua situação financeira.',
  },
  {
    question: 'O app funciona no celular?',
    answer: 'Sim! O FinControl é totalmente responsivo e funciona perfeitamente em qualquer dispositivo - celular, tablet ou computador.',
  },
];

export default function FAQSection() {
  const { ref, inView } = useInView();

  return (
    <section className="py-20 px-6 bg-gradient-to-b from-background to-primary/5">
      <div ref={ref} className={`max-w-3xl mx-auto transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <HelpCircle size={16} />
            FAQ
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Perguntas{' '}
            <span className="text-primary">frequentes</span>
          </h2>
          <p className="text-muted-foreground">
            Tire suas dúvidas sobre o FinControl
          </p>
        </div>

        <div className="glass rounded-3xl p-6 md:p-8">
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq, i) => (
              <AccordionItem 
                key={i} 
                value={`item-${i}`}
                className="border-b-0 bg-background/50 rounded-xl px-4 data-[state=open]:bg-primary/10"
              >
                <AccordionTrigger className="text-left hover:no-underline py-5">
                  <span className="font-medium">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
