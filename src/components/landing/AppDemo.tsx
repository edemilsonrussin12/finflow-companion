import { useInView } from '@/hooks/useInView';
import { useCountUp } from '@/hooks/useCountUp';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Wallet, PiggyBank, BarChart3, Brain } from 'lucide-react';

function AnimatedCounter({ end, prefix = '', suffix = '' }: { end: number; prefix?: string; suffix?: string }) {
  const { ref, inView } = useInView();
  const count = useCountUp(end, 2000, inView);
  
  return (
    <span ref={ref}>{prefix}{count.toLocaleString('pt-BR')}{suffix}</span>
  );
}

export default function AppDemo() {
  const { ref, inView } = useInView();

  const features = [
    {
      icon: TrendingUp,
      title: 'Score de Saúde Financeira',
      description: 'Acompanhe sua pontuação e evolua mês a mês',
      color: 'text-emerald',
    },
    {
      icon: Wallet,
      title: 'Receitas vs Despesas',
      description: 'Visualize o balanço das suas finanças',
      color: 'text-primary',
    },
    {
      icon: PiggyBank,
      title: 'Controle de Patrimônio',
      description: 'Veja sua evolução patrimonial ao longo do tempo',
      color: 'text-gold',
    },
    {
      icon: BarChart3,
      title: 'Monitoramento de Investimentos',
      description: 'Acompanhe seus investimentos em um só lugar',
      color: 'text-cyan',
    },
    {
      icon: Brain,
      title: 'Recomendações com IA',
      description: 'Insights personalizados para melhorar suas finanças',
      color: 'text-primary',
    },
  ];

  return (
    <section id="app-demo" className="py-20 px-6">
      <div ref={ref} className={`max-w-6xl mx-auto transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-emerald/20 text-emerald px-4 py-2 rounded-full text-sm font-medium mb-4">
            Demonstração do App
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Seu painel financeiro{' '}
            <span className="text-emerald">completo</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Tenha controle total das suas finanças com dashboards intuitivos e insights personalizados
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 items-center">
          {/* Dashboard Preview */}
          <div className="glass rounded-3xl p-6 space-y-6">
            {/* Score Card */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Saúde Financeira</p>
                <p className="text-3xl font-bold text-emerald">
                  <AnimatedCounter end={82} suffix="/100" />
                </p>
              </div>
              <div className="relative w-20 h-20">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="hsl(var(--muted))" strokeWidth="8" fill="none" />
                  <circle
                    cx="50" cy="50" r="40"
                    stroke="hsl(var(--emerald))"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray="205 251"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-income/10 rounded-xl p-4">
                <p className="text-xs text-muted-foreground mb-1">Receitas</p>
                <p className="text-lg font-bold text-income">
                  R$ <AnimatedCounter end={8500} />
                </p>
                <Progress value={100} className="h-1 mt-2" />
              </div>
              <div className="bg-expense/10 rounded-xl p-4">
                <p className="text-xs text-muted-foreground mb-1">Despesas</p>
                <p className="text-lg font-bold text-expense">
                  R$ <AnimatedCounter end={5200} />
                </p>
                <Progress value={61} className="h-1 mt-2" />
              </div>
            </div>

            {/* Patrimony */}
            <div className="bg-primary/10 rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-muted-foreground">Patrimônio Total</p>
                <span className="text-xs text-emerald bg-emerald/20 px-2 py-1 rounded-full">+12.5%</span>
              </div>
              <p className="text-2xl font-bold">
                R$ <AnimatedCounter end={156000} />
              </p>
              <Progress value={70} className="h-2 mt-3" />
            </div>

            {/* Monthly Investment */}
            <div className="flex justify-between items-center p-4 bg-gold/10 rounded-xl">
              <div>
                <p className="text-xs text-muted-foreground">Investindo por mês</p>
                <p className="text-lg font-bold text-gold">
                  R$ <AnimatedCounter end={2000} />
                </p>
              </div>
              <TrendingUp className="text-gold" size={24} />
            </div>
          </div>

          {/* Features List */}
          <div className="space-y-4">
            {features.map((feature, i) => (
              <div 
                key={i}
                className="glass p-5 rounded-2xl flex items-start gap-4 hover-scale"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className={`p-3 rounded-xl bg-background ${feature.color}`}>
                  <feature.icon size={24} />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
