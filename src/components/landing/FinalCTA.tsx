import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useInView } from '@/hooks/useInView';
import { ArrowRight, Sparkles, CheckCircle } from 'lucide-react';

const highlights = [
  'Sem cartão de crédito',
  'Configuração em 2 minutos',
  'Cancele quando quiser',
];

export default function FinalCTA() {
  const { ref, inView } = useInView();

  return (
    <section className="py-24 px-6">
      <div ref={ref} className={`max-w-4xl mx-auto text-center transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="glass rounded-3xl p-10 md:p-16 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/10 via-transparent to-emerald/10 pointer-events-none" />
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-emerald/20 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-gold/20 text-gold px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles size={16} />
              Comece grátis hoje
            </div>

            <h2 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight">
              Comece hoje a construir sua{' '}
              <span className="bg-gradient-to-r from-primary via-emerald to-gold bg-clip-text text-transparent">
                inteligência financeira
              </span>
            </h2>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Junte-se a milhares de pessoas que já estão transformando sua relação com o dinheiro 
              e construindo um futuro financeiro mais próspero.
            </p>

            <Link to="/cadastro">
              <Button size="lg" className="fab-glow text-lg px-10 py-7 h-auto mb-8">
              Criar minha conta agora
                <ArrowRight className="ml-2" size={22} />
              </Button>
            </Link>

            <div className="flex flex-wrap justify-center gap-6">
              {highlights.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle size={16} className="text-emerald" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
