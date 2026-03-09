import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  BarChart3, 
  TrendingUp, 
  Shield, 
  Target, 
  Wallet, 
  PieChart,
  Clock,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useInView } from '@/hooks/useInView';
import FinancialHealthQuiz from '@/components/landing/FinancialHealthQuiz';
import LeadCapture from '@/components/landing/LeadCapture';
import SocialProof from '@/components/landing/SocialProof';

function FadeInSection({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  const { ref, inView } = useInView();
  return (
    <div ref={ref} className={`transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}>
      {children}
    </div>
  );
}

export default function Aterrissagem() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-transparent to-emerald/5" />
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-emerald/10 rounded-full blur-3xl" />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6">
        <div className="max-w-6xl mx-auto text-center space-y-8 animate-fade-in">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-emerald/10 border border-emerald/20 text-emerald px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              <span className="w-2 h-2 bg-emerald rounded-full animate-pulse" />
              Inteligência financeira para todos
            </div>
            <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight">
              Transforme sua{' '}
              <span className="bg-gradient-to-r from-primary via-cyan to-emerald bg-clip-text text-transparent">
                vida financeira
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Entenda para onde vai seu dinheiro, organize suas finanças e construa riqueza com inteligência artificial
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/cadastro">
              <Button size="lg" className="fab-glow text-lg px-8 py-4 h-auto">
                Começar gratuitamente
                <ArrowRight className="ml-2" size={20} />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="text-lg px-8 py-4 h-auto glass">
              Ver demonstração
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-emerald" />
              Gratuito para começar
            </div>
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-primary" />
              100% seguro
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gold">★</span>
              +10.000 usuários
            </div>
          </div>
        </div>
      </section>

      {/* Financial Health Quiz */}
      <FinancialHealthQuiz />

      {/* Social Proof */}
      <SocialProof />

      {/* Benefits Section */}
      <section className="py-20 px-6 relative">
        <FadeInSection>
          <div className="max-w-6xl mx-auto">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl md:text-5xl font-bold">
                Por que escolher o <span className="text-emerald">FinControl</span>?
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Tecnologia avançada para simplificar sua vida financeira
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="card-income p-8 hover-scale">
                <CardContent className="space-y-4">
                  <div className="w-12 h-12 bg-income/20 rounded-2xl flex items-center justify-center">
                    <BarChart3 className="text-income" size={24} />
                  </div>
                  <h3 className="text-xl font-semibold">Controle Total</h3>
                  <p className="text-muted-foreground">
                    Veja exatamente para onde vai cada centavo do seu dinheiro com categorização automática e relatórios inteligentes
                  </p>
                </CardContent>
              </Card>

              <Card className="card-investment p-8 hover-scale">
                <CardContent className="space-y-4">
                  <div className="w-12 h-12 bg-emerald/20 rounded-2xl flex items-center justify-center">
                    <TrendingUp className="text-emerald" size={24} />
                  </div>
                  <h3 className="text-xl font-semibold">Crescimento Inteligente</h3>
                  <p className="text-muted-foreground">
                    Algoritmos que analisam seus hábitos e sugerem as melhores estratégias para fazer seu dinheiro crescer
                  </p>
                </CardContent>
              </Card>

              <Card className="card-revenue p-8 hover-scale">
                <CardContent className="space-y-4">
                  <div className="w-12 h-12 bg-gold/20 rounded-2xl flex items-center justify-center">
                    <Target className="text-gold" size={24} />
                  </div>
                  <h3 className="text-xl font-semibold">Metas Realizáveis</h3>
                  <p className="text-muted-foreground">
                    Defina objetivos financeiros e acompanhe seu progresso com planos personalizados e motivação constante
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </FadeInSection>
      </section>

      {/* Dashboard Demo Section */}
      <section className="py-20 px-6 bg-card/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-5xl font-bold">
              Dashboard que <span className="text-primary">faz a diferença</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Visualize suas finanças como nunca antes
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Dashboard Mockup */}
            <div className="relative">
              <div className="glass rounded-3xl p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Dashboard Financeiro</h3>
                  <div className="text-sm text-muted-foreground">Janeiro 2024</div>
                </div>

                {/* Balance Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="card-income p-4 rounded-xl">
                    <div className="text-sm text-income-foreground/80">Receitas</div>
                    <div className="text-2xl font-bold text-income-foreground">R$ 8.500</div>
                  </div>
                  <div className="card-expense p-4 rounded-xl">
                    <div className="text-sm text-expense-foreground/80">Despesas</div>
                    <div className="text-2xl font-bold text-expense-foreground">R$ 5.200</div>
                  </div>
                </div>

                {/* Categories */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Alimentação</span>
                    <span className="text-muted-foreground">R$ 1.200</span>
                  </div>
                  <Progress value={70} className="h-2" />
                  
                  <div className="flex items-center justify-between text-sm">
                    <span>Transporte</span>
                    <span className="text-muted-foreground">R$ 800</span>
                  </div>
                  <Progress value={45} className="h-2" />
                  
                  <div className="flex items-center justify-between text-sm">
                    <span>Lazer</span>
                    <span className="text-muted-foreground">R$ 600</span>
                  </div>
                  <Progress value={35} className="h-2" />
                </div>

                {/* Quick Stats */}
                <div className="flex justify-between text-center">
                  <div>
                    <div className="text-2xl font-bold text-emerald">R$ 3.300</div>
                    <div className="text-xs text-muted-foreground">Saldo Livre</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">15%</div>
                    <div className="text-xs text-muted-foreground">Taxa Poupança</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Features List */}
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <PieChart className="text-primary" size={20} />
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Categorização Automática</h4>
                  <p className="text-muted-foreground">
                    IA que aprende seus padrões e categoriza gastos automaticamente
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-emerald/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="text-emerald" size={20} />
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Relatórios Detalhados</h4>
                  <p className="text-muted-foreground">
                    Análises profundas sobre seus hábitos financeiros com insights acionáveis
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-gold/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clock className="text-gold" size={20} />
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Tempo Real</h4>
                  <p className="text-muted-foreground">
                    Acompanhe suas finanças em tempo real com sincronização instantânea
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Financial Health Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold">
              Sua <span className="text-emerald">Saúde Financeira</span> em números
            </h2>
            <p className="text-xl text-muted-foreground">
              Algoritmo proprietário que avalia e monitora sua situação financeira
            </p>
          </div>

          {/* Health Score Mockup */}
          <div className="flex justify-center">
            <div className="card-premium p-12 rounded-3xl">
              <div className="relative w-48 h-48 mx-auto mb-8">
                {/* Circular Progress Mockup */}
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="hsl(var(--muted))"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="hsl(var(--emerald))"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${82 * 2.51} 251`}
                    strokeLinecap="round"
                    className="animate-pulse"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-emerald">82</div>
                    <div className="text-sm text-muted-foreground">Saudável</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl font-bold">Excelente Controle Financeiro!</h3>
                <p className="text-muted-foreground">
                  Você está no caminho certo para construir riqueza de forma consistente
                </p>
                
                <div className="flex justify-center gap-8 text-sm">
                  <div className="text-center">
                    <div className="text-emerald font-semibold">Receitas</div>
                    <div className="text-muted-foreground">Estáveis</div>
                  </div>
                  <div className="text-center">
                    <div className="text-primary font-semibold">Gastos</div>
                    <div className="text-muted-foreground">Controlados</div>
                  </div>
                  <div className="text-center">
                    <div className="text-gold font-semibold">Poupança</div>
                    <div className="text-muted-foreground">Crescendo</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="glass p-6 rounded-2xl">
              <TrendingUp className="text-emerald mb-4" size={32} />
              <h4 className="font-semibold mb-2">Evolução Constante</h4>
              <p className="text-sm text-muted-foreground">
                Acompanhe a melhoria da sua saúde financeira mês a mês
              </p>
            </div>
            
            <div className="glass p-6 rounded-2xl">
              <Target className="text-primary mb-4" size={32} />
              <h4 className="font-semibold mb-2">Metas Personalizadas</h4>
              <p className="text-sm text-muted-foreground">
                Objetivos ajustados ao seu perfil e capacidade financeira
              </p>
            </div>
            
            <div className="glass p-6 rounded-2xl">
              <Wallet className="text-gold mb-4" size={32} />
              <h4 className="font-semibold mb-2">Recomendações IA</h4>
              <p className="text-sm text-muted-foreground">
                Sugestões inteligentes para otimizar seus investimentos
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-primary/10 via-cyan/10 to-emerald/10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold">
              Comece sua jornada rumo à{' '}
              <span className="bg-gradient-to-r from-primary via-cyan to-emerald bg-clip-text text-transparent">
                liberdade financeira
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Junte-se a milhares de pessoas que já transformaram suas finanças com o FinControl
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/cadastro">
              <Button size="lg" className="fab-glow text-xl px-12 py-6 h-auto">
                Criar minha conta gratuita
                <ArrowRight className="ml-3" size={24} />
              </Button>
            </Link>
          </div>

          <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <span>✓ Sem compromisso</span>
            <span>✓ Sem cartão de crédito</span>
            <span>✓ Começe em 2 minutos</span>
          </div>
        </div>
      </section>
    </div>
  );
}