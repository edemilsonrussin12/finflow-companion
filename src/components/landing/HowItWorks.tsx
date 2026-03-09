import { useInView } from '@/hooks/useInView';
import { ListChecks, HeartPulse, TrendingUp } from 'lucide-react';

const steps = [
  {
    icon: ListChecks,
    step: '01',
    title: 'Organize suas finanças',
    description: 'Cadastre suas receitas, despesas e investimentos de forma simples e rápida.',
    color: 'from-primary to-primary/50',
  },
  {
    icon: HeartPulse,
    step: '02',
    title: 'Entenda sua saúde financeira',
    description: 'Receba um score personalizado e descubra onde você pode melhorar.',
    color: 'from-emerald to-emerald/50',
  },
  {
    icon: TrendingUp,
    step: '03',
    title: 'Cresça com decisões inteligentes',
    description: 'Use insights e simuladores para construir seu patrimônio com confiança.',
    color: 'from-gold to-gold/50',
  },
];

export default function HowItWorks() {
  const { ref, inView } = useInView();

  return (
    <section className="py-20 px-6">
      <div ref={ref} className={`max-w-5xl mx-auto transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            Simples e eficiente
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Como <span className="text-primary">funciona</span>
          </h2>
          <p className="text-muted-foreground">
            Três passos simples para transformar sua vida financeira
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((item, i) => (
            <div 
              key={i}
              className="relative glass p-8 rounded-3xl text-center hover-scale"
              style={{ animationDelay: `${i * 150}ms` }}
            >
              {/* Step number */}
              <div className={`absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center text-sm font-bold shadow-lg`}>
                {item.step}
              </div>
              
              {/* Icon */}
              <div className={`w-16 h-16 mx-auto mt-4 mb-6 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center`}>
                <item.icon size={32} className="text-white" />
              </div>
              
              <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.description}</p>

              {/* Connector line (hidden on last item) */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-muted to-transparent" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
