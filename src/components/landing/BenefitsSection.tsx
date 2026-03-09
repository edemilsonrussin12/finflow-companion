import { useInView } from '@/hooks/useInView';
import { Eye, LineChart, Brain, Landmark, CheckCircle } from 'lucide-react';

const benefits = [
  {
    icon: Eye,
    title: 'Entenda para onde vai seu dinheiro',
    description: 'Visualize todas as suas despesas categorizadas e descubra gastos invisíveis.',
  },
  {
    icon: LineChart,
    title: 'Acompanhe seu progresso financeiro',
    description: 'Veja sua evolução mês a mês com gráficos claros e métricas relevantes.',
  },
  {
    icon: Brain,
    title: 'Tome decisões financeiras melhores',
    description: 'Receba insights personalizados baseados nos seus dados reais.',
  },
  {
    icon: Landmark,
    title: 'Construa riqueza a longo prazo',
    description: 'Aprenda estratégias comprovadas para crescer seu patrimônio.',
  },
];

export default function BenefitsSection() {
  const { ref, inView } = useInView();

  return (
    <section className="py-20 px-6 bg-gradient-to-b from-primary/5 to-background">
      <div ref={ref} className={`max-w-6xl mx-auto transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Por que usar o{' '}
            <span className="text-emerald">FinControl</span>?
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Benefícios que transformam sua relação com o dinheiro
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {benefits.map((benefit, i) => (
            <div 
              key={i}
              className="glass p-6 rounded-2xl flex gap-5 hover-scale"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-emerald flex items-center justify-center">
                <benefit.icon size={28} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  {benefit.title}
                  <CheckCircle size={16} className="text-emerald" />
                </h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
