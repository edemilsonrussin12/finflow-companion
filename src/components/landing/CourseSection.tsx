import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useInView } from '@/hooks/useInView';
import { BookOpen, Brain, PiggyBank, TrendingUp, ArrowRight, Play } from 'lucide-react';

const modules = [
  {
    icon: Brain,
    title: 'Mentalidade Financeira',
    description: 'Desenvolva a mentalidade de quem constrói riqueza',
    lessons: 6,
    status: 'Gratuito',
  },
  {
    icon: PiggyBank,
    title: 'Controle Inteligente de Gastos',
    description: 'Domine suas finanças com métodos práticos',
    lessons: 4,
    status: 'Premium',
  },
  {
    icon: TrendingUp,
    title: 'Construção de Patrimônio',
    description: 'Aprenda a acumular e proteger seu dinheiro',
    lessons: 4,
    status: 'Premium',
  },
  {
    icon: BookOpen,
    title: 'Estratégias de Crescimento',
    description: 'Técnicas avançadas para multiplicar seu patrimônio',
    lessons: 4,
    status: 'Premium',
  },
];

export default function CourseSection() {
  const { ref, inView } = useInView();

  return (
    <section className="py-20 px-6 bg-gradient-to-b from-background to-primary/5">
      <div ref={ref} className={`max-w-6xl mx-auto transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gold/20 text-gold px-4 py-2 rounded-full text-sm font-medium mb-4">
            <BookOpen size={16} />
            Curso Exclusivo
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Engenharia da{' '}
            <span className="bg-gradient-to-r from-gold to-primary bg-clip-text text-transparent">
              Riqueza
            </span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Aprenda e aplique conceitos financeiros diretamente dentro do aplicativo. 
            Educação financeira prática que transforma sua vida.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {modules.map((mod, i) => (
            <div 
              key={i}
              className="glass p-6 rounded-2xl hover-scale group"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${mod.status === 'Gratuito' ? 'bg-emerald/20 text-emerald' : 'bg-gold/20 text-gold'}`}>
                  <mod.icon size={24} />
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  mod.status === 'Gratuito' 
                    ? 'bg-emerald/20 text-emerald' 
                    : 'bg-gold/20 text-gold'
                }`}>
                  {mod.status}
                </span>
              </div>
              <h3 className="text-lg font-semibold mb-2">{mod.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{mod.description}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Play size={14} />
                  {mod.lessons} aulas
                </span>
                <ArrowRight size={18} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link to="/cadastro">
            <Button size="lg" className="fab-glow">
              Começar a aprender
              <ArrowRight className="ml-2" size={18} />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
