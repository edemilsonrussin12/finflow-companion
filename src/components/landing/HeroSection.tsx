import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play, Shield, TrendingUp, Users } from 'lucide-react';
import { useInView } from '@/hooks/useInView';
import { useCountUp } from '@/hooks/useCountUp';
import { Progress } from '@/components/ui/progress';

function MiniCounter({ end, prefix = '' }: { end: number; prefix?: string }) {
  const { ref, inView } = useInView();
  const count = useCountUp(end, 2000, inView);
  return <span ref={ref}>{prefix}{count.toLocaleString('pt-BR')}</span>;
}

export default function HeroSection() {
  const scrollToDemo = () => {
    document.getElementById('app-demo')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 py-20 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald/10 rounded-full blur-3xl" />
      
      <div className="relative z-10 max-w-6xl mx-auto text-center space-y-8">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-full text-sm font-medium animate-fade-in">
          <span className="w-2 h-2 bg-emerald rounded-full animate-pulse" />
          Inteligência financeira para todos
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight animate-fade-in">
          Domine seu dinheiro e construa{' '}
          <span className="bg-gradient-to-r from-primary via-emerald to-gold bg-clip-text text-transparent">
            seu patrimônio
          </span>{' '}
          com inteligência
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '150ms' }}>
          Um aplicativo que mostra sua saúde financeira, organiza suas finanças 
          e ensina você a crescer financeiramente.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in" style={{ animationDelay: '300ms' }}>
          <Link to="/cadastro">
            <Button size="lg" className="fab-glow text-lg px-8 py-6 h-auto">
              Criar minha conta gratuita
              <ArrowRight className="ml-2" size={20} />
            </Button>
          </Link>
          <Button 
            variant="outline" 
            size="lg" 
            className="text-lg px-8 py-6 h-auto border-primary/30 hover:bg-primary/10"
            onClick={scrollToDemo}
          >
            <Play className="mr-2" size={18} />
            Ver demonstração
          </Button>
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-wrap justify-center gap-6 pt-4 animate-fade-in" style={{ animationDelay: '450ms' }}>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Shield size={18} className="text-emerald" />
            <span className="text-sm">Dados protegidos</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users size={18} className="text-primary" />
            <span className="text-sm">+10.000 usuários</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <TrendingUp size={18} className="text-gold" />
            <span className="text-sm">Resultados comprovados</span>
          </div>
        </div>

        {/* Mobile Mockup Dashboard Preview */}
        <div className="pt-8 animate-fade-in" style={{ animationDelay: '600ms' }}>
          <div className="mx-auto max-w-[320px] md:max-w-[340px]">
            {/* Phone frame */}
            <div className="relative rounded-[2.5rem] border-4 border-muted/30 bg-background p-3 shadow-2xl shadow-primary/10">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-muted/30 rounded-b-2xl" />
              
              {/* Screen content */}
              <div className="rounded-[2rem] bg-card overflow-hidden p-4 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between pt-4">
                  <div>
                    <p className="text-[10px] text-muted-foreground">Olá, Maria 👋</p>
                    <p className="text-xs font-bold">Painel Financeiro</p>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-[9px] font-bold text-primary">ML</div>
                </div>

                {/* Score */}
                <div className="flex items-center gap-3 bg-emerald/10 rounded-xl p-3">
                  <div className="relative w-12 h-12 flex-shrink-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" stroke="hsl(var(--muted))" strokeWidth="8" fill="none" />
                      <circle cx="50" cy="50" r="40" stroke="hsl(var(--emerald))" strokeWidth="8" fill="none" strokeDasharray="205 251" strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-emerald">82</div>
                  </div>
                  <div>
                    <p className="text-[9px] text-muted-foreground">Saúde Financeira</p>
                    <p className="text-xs font-bold text-emerald">Muito Boa</p>
                  </div>
                </div>

                {/* Income vs Expense */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-income/10 rounded-lg p-2">
                    <p className="text-[8px] text-muted-foreground">Receitas</p>
                    <p className="text-[11px] font-bold text-income">R$ <MiniCounter end={8500} /></p>
                    <Progress value={100} className="h-0.5 mt-1" />
                  </div>
                  <div className="bg-expense/10 rounded-lg p-2">
                    <p className="text-[8px] text-muted-foreground">Despesas</p>
                    <p className="text-[11px] font-bold text-expense">R$ <MiniCounter end={5200} /></p>
                    <Progress value={61} className="h-0.5 mt-1" />
                  </div>
                </div>

                {/* Patrimônio */}
                <div className="bg-primary/10 rounded-lg p-2">
                  <div className="flex justify-between items-center">
                    <p className="text-[8px] text-muted-foreground">Patrimônio Total</p>
                    <span className="text-[7px] text-emerald bg-emerald/20 px-1.5 py-0.5 rounded-full">+12.5%</span>
                  </div>
                  <p className="text-sm font-bold">R$ <MiniCounter end={156000} /></p>
                </div>

                {/* Investments */}
                <div className="flex justify-between items-center bg-gold/10 rounded-lg p-2">
                  <div>
                    <p className="text-[8px] text-muted-foreground">Investindo/mês</p>
                    <p className="text-[11px] font-bold text-gold">R$ <MiniCounter end={2000} /></p>
                  </div>
                  <TrendingUp className="text-gold" size={14} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center">
          <div className="w-1.5 h-3 bg-primary rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
}
