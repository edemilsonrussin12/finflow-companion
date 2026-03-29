import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useInView } from '@/hooks/useInView';
import { useCountUp } from '@/hooks/useCountUp';
import {
  ArrowRight,
  CheckCircle,
  Wallet,
  BarChart3,
  FileText,
  TrendingUp,
  Smartphone,
  Zap,
  Shield,
  Users,
  Play,
  Star,
  DollarSign,
  PieChart,
  Target,
  Clock,
  Send,
  CreditCard,
  AlertTriangle,
  Layers,
  LayoutDashboard,
  LineChart,
  Receipt,
  ChevronRight,
} from 'lucide-react';

/* ─── tiny helpers ─── */
function Section({ children, className = '', id }: { children: React.ReactNode; className?: string; id?: string }) {
  const { ref, inView } = useInView();
  return (
    <section
      id={id}
      ref={ref}
      className={`transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} ${className}`}
    >
      {children}
    </section>
  );
}

function StatCounter({ end, label, suffix = '' }: { end: number; label: string; suffix?: string }) {
  const { ref, inView } = useInView();
  const count = useCountUp(end, 2000, inView);
  return (
    <div ref={ref} className="text-center">
      <p className="text-3xl md:text-4xl font-extrabold text-primary">
        {count.toLocaleString('pt-BR')}{suffix}
      </p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

/* ─── data ─── */
const problems = [
  { icon: AlertTriangle, text: 'Finanças desorganizadas sem visão clara' },
  { icon: Layers, text: 'Planilhas manuais que desperdiçam seu tempo' },
  { icon: FileText, text: 'Dificuldade para criar orçamentos profissionais' },
  { icon: Target, text: 'Falta de organização nas receitas e despesas' },
  { icon: DollarSign, text: 'Sem forma fácil de acompanhar o lucro real' },
];

const benefits = [
  { icon: Wallet, title: 'Controle de Receitas e Despesas', desc: 'Registre cada transação e veja para onde vai seu dinheiro em tempo real.' },
  { icon: FileText, title: 'Orçamentos Profissionais', desc: 'Crie orçamentos organizados e envie para clientes em minutos.' },
  { icon: LayoutDashboard, title: 'Painel Financeiro', desc: 'Veja toda sua situação financeira de forma rápida com gráficos intuitivos.' },
  { icon: BarChart3, title: 'Relatórios e Análises', desc: 'Relatórios mensais e anuais detalhados para decisões mais inteligentes.' },
  { icon: Smartphone, title: 'Celular e Computador', desc: 'Acesse suas finanças de qualquer dispositivo, em qualquer lugar.' },
  { icon: Zap, title: 'Simples e Rápido', desc: 'Interface limpa pensada para agilidade — sem curva de aprendizado.' },
];

const features = [
  { icon: Wallet, title: 'Controle Financeiro', desc: 'Gerencie receitas, despesas e fluxo de caixa com facilidade.' },
  { icon: LayoutDashboard, title: 'Dashboard', desc: 'Visão geral da sua saúde financeira com métricas importantes.' },
  { icon: LineChart, title: 'Relatórios', desc: 'Relatórios automáticos com gráficos, categorias e tendências.' },
  { icon: Target, title: 'Planejamento', desc: 'Defina metas, simule cenários e planeje seu crescimento financeiro.' },
  { icon: Receipt, title: 'Orçamentos Profissionais', desc: 'Crie, envie e acompanhe orçamentos para clientes com facilidade.' },
];

const budgetBenefits = [
  { icon: Zap, text: 'Crie orçamentos rapidamente' },
  { icon: DollarSign, text: 'Adicione serviços e preços' },
  { icon: FileText, text: 'Layout profissional' },
  { icon: Send, text: 'Envie para clientes' },
  { icon: CreditCard, text: 'Acompanhe pagamentos' },
  { icon: PieChart, text: 'Integrado ao controle financeiro' },
];

const steps = [
  { step: '01', title: 'Crie sua Conta', desc: 'Cadastre-se em segundos — grátis, sem cartão de crédito.' },
  { step: '02', title: 'Adicione Finanças', desc: 'Registre receitas e despesas para montar seu panorama financeiro.' },
  { step: '03', title: 'Crie Orçamentos', desc: 'Gere orçamentos profissionais e envie para seus clientes.' },
  { step: '04', title: 'Controle seu Dinheiro', desc: 'Use dashboards, relatórios e insights para manter o controle.' },
];

const freePlan = [
  'Controle financeiro',
  'Dashboard',
  'Relatórios básicos',
  'Criação de orçamentos',
];

const premiumPlan = [
  'Relatórios avançados',
  'Orçamentos ilimitados',
  'Ferramentas empresariais',
  'Suporte prioritário',
  'Plano anual',
];

/* ─── component ─── */
export default function Aterrissagem() {
  useEffect(() => {
    document.title = 'FinControlApp — Controle Financeiro e Orçamentos Profissionais';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'O FinControlApp ajuda autônomos e pequenos empresários a organizar dinheiro, acompanhar gastos e criar orçamentos profissionais em um app simples.');
  }, []);

  const howRef = useRef<HTMLElement | null>(null);
  const scrollToHow = () => howRef.current?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ── Sticky Nav ── */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-8 h-14">
          <span className="text-lg font-bold tracking-tight text-primary">FinControlApp</span>
          <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#benefits" className="hover:text-foreground transition-colors">Benefícios</a>
            <a href="#features" className="hover:text-foreground transition-colors">Funcionalidades</a>
            <a href="#budgets" className="hover:text-foreground transition-colors">Orçamentos</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Planos</a>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button variant="ghost" size="sm">Entrar</Button>
            </Link>
            <Link to="/cadastro">
              <Button size="sm">Começar Grátis</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <Section className="pt-16 pb-20 md:pt-24 md:pb-28 px-4" id="hero">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
            Controle suas Finanças e Crie{' '}
            <span className="text-primary">Orçamentos Profissionais</span>{' '}
            em Um Só App
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            O FinControlApp ajuda autônomos, pequenos empresários e pessoas físicas a organizar dinheiro, acompanhar gastos, planejar orçamentos e criar propostas profissionais — de forma simples e rápida.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/cadastro">
              <Button size="lg" className="w-full sm:w-auto text-base px-8 py-6 h-auto fab-glow font-bold">
                Começar Grátis Agora
                <ArrowRight className="ml-2" size={18} />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-8 py-6 h-auto border-primary/30 hover:bg-primary/10" onClick={scrollToHow}>
              <Play className="mr-2" size={16} />
              Veja Como Funciona
            </Button>
          </div>
          <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground pt-2">
            <span className="flex items-center gap-1"><CheckCircle size={14} className="text-emerald" /> Plano gratuito disponível</span>
            <span className="flex items-center gap-1"><CheckCircle size={14} className="text-emerald" /> Sem cartão de crédito</span>
            <span className="flex items-center gap-1"><Shield size={14} className="text-emerald" /> Plataforma segura</span>
          </div>
        </div>
      </Section>

      {/* ── PROBLEM ── */}
      <Section className="py-16 md:py-20 px-4 bg-card/40" id="problem">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-2xl md:text-3xl font-bold">Gerenciar Dinheiro e Orçamentos Não Deveria Ser Complicado</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {problems.map((p, i) => (
              <div key={i} className="flex items-center gap-3 glass rounded-xl p-4 text-left">
                <p.icon size={20} className="text-expense flex-shrink-0" />
                <span className="text-sm">{p.text}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── SOLUTION ── */}
      <Section className="py-16 md:py-20 px-4" id="solution">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <h2 className="text-2xl md:text-3xl font-bold">
            FinControlApp Resolve Tudo em{' '}
            <span className="text-primary">Um Só Lugar</span>
          </h2>
          <p className="text-muted-foreground">Uma plataforma completa para gerenciar finanças e criar orçamentos profissionais.</p>
        </div>
      </Section>

      {/* ── BENEFITS ── */}
      <Section className="py-16 md:py-20 px-4" id="benefits">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">Principais Benefícios</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b, i) => (
              <Card key={i} className="bg-card border-border hover:border-primary/40 transition-colors">
                <CardContent className="p-6 space-y-3">
                  <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center">
                    <b.icon size={22} className="text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">{b.title}</h3>
                  <p className="text-sm text-muted-foreground">{b.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Section>

      {/* ── FEATURES ── */}
      <Section className="py-16 md:py-20 px-4 bg-card/40" id="features">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">Funcionalidades Poderosas</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="glass rounded-2xl p-6 space-y-3 hover:border-primary/30 border border-transparent transition-colors">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <f.icon size={22} className="text-primary-foreground" />
                </div>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── PROFESSIONAL BUDGETS ── */}
      <Section className="py-16 md:py-20 px-4" id="budgets">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 space-y-3">
            <h2 className="text-2xl md:text-3xl font-bold">
              Orçamentos Profissionais para{' '}
              <span className="text-primary">Autônomos e Pequenos Empresários</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Crie orçamentos profissionais em minutos e envie para clientes com um layout limpo e organizado.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {budgetBenefits.map((b, i) => (
              <div key={i} className="flex items-center gap-3 glass rounded-xl p-4">
                <b.icon size={18} className="text-primary flex-shrink-0" />
                <span className="text-sm font-medium">{b.text}</span>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link to="/cadastro">
              <Button size="lg" className="fab-glow font-bold text-base px-8 py-6 h-auto">
                Crie Seu Primeiro Orçamento Agora
                <ArrowRight className="ml-2" size={18} />
              </Button>
            </Link>
          </div>
        </div>
      </Section>

      {/* ── VIDEO / DEMO ── */}
      <Section className="py-16 md:py-20 px-4 bg-card/40" id="demo">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <h2 className="text-2xl md:text-3xl font-bold">Veja o FinControlApp em Ação</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="glass rounded-2xl overflow-hidden aspect-video">
                <video
                  className="w-full h-full object-cover"
                  controls
                  preload="metadata"
                  playsInline
                  poster=""
                >
                  <source src="/videos/funcionamento-geral.mp4" type="video/mp4" />
                </video>
              </div>
              <p className="text-sm font-medium">Como o FinControlApp Funciona</p>
            </div>
            <div className="space-y-3">
              <div className="glass rounded-2xl overflow-hidden aspect-video">
                <video
                  className="w-full h-full object-cover"
                  controls
                  preload="metadata"
                  playsInline
                  poster=""
                >
                  <source src="/videos/orcamentos.mp4" type="video/mp4" />
                </video>
              </div>
              <p className="text-sm font-medium">Orçamentos Profissionais</p>
            </div>
          </div>
        </div>
      </Section>

      {/* ── SOCIAL PROOF ── */}
      <Section className="py-16 md:py-20 px-4" id="proof">
        <div className="max-w-5xl mx-auto space-y-10">
          <h2 className="text-2xl md:text-3xl font-bold text-center">Feito para Usuários Reais</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatCounter end={10000} suffix="+" label="Usuários" />
            <StatCounter end={99} suffix="%" label="Disponibilidade" />
            <StatCounter end={50000} suffix="+" label="Orçamentos Criados" />
            <StatCounter end={4} suffix=".9★" label="Avaliação" />
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Lucas M.', text: 'O FinControlApp mudou a forma como gerencio minha renda como autônomo. Recomendo demais!', stars: 5 },
              { name: 'Ana S.', text: 'Criar orçamentos profissionais levava horas. Agora leva minutos.', stars: 5 },
              { name: 'Carlos R.', text: 'Finalmente um app financeiro que realmente funciona para pequenos empresários.', stars: 5 },
            ].map((t, i) => (
              <Card key={i} className="bg-card border-border">
                <CardContent className="p-6 space-y-3">
                  <div className="flex gap-0.5">
                    {Array.from({ length: t.stars }).map((_, j) => (
                      <Star key={j} size={14} className="text-gold fill-gold" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">"{t.text}"</p>
                  <p className="text-xs font-semibold">{t.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Section>

      {/* ── HOW IT WORKS ── */}
      <Section className="py-16 md:py-20 px-4 bg-card/40" id="how">
        <div className="max-w-5xl mx-auto" ref={(el) => { howRef.current = el; }}>
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">Como Funciona</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <div key={i} className="glass rounded-2xl p-6 text-center space-y-3 relative">
                <span className="text-4xl font-extrabold text-primary/20">{s.step}</span>
                <h3 className="font-semibold">{s.title}</h3>
                <p className="text-xs text-muted-foreground">{s.desc}</p>
                {i < steps.length - 1 && (
                  <ChevronRight size={20} className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 text-primary/40" />
                )}
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── PRICING ── */}
      <Section className="py-16 md:py-20 px-4" id="pricing">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">Planos Simples</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Gratuito */}
            <Card className="bg-card border-border">
              <CardContent className="p-8 space-y-5">
                <h3 className="text-xl font-bold">Plano Gratuito</h3>
                <p className="text-3xl font-extrabold">R$ 0<span className="text-sm font-normal text-muted-foreground">/mês</span></p>
                <ul className="space-y-2">
                  {freePlan.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle size={16} className="text-emerald flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/cadastro" className="block">
                  <Button variant="outline" className="w-full">Começar Grátis</Button>
                </Link>
              </CardContent>
            </Card>
            {/* Premium */}
            <Card className="bg-card border-primary/50 ring-1 ring-primary/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-bl-lg">POPULAR</div>
              <CardContent className="p-8 space-y-5">
                <h3 className="text-xl font-bold">Plano Premium</h3>
                <p className="text-3xl font-extrabold text-primary">R$ 19,90<span className="text-sm font-normal text-muted-foreground">/mês</span></p>
                <ul className="space-y-2">
                  {premiumPlan.map((p, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle size={16} className="text-primary flex-shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
                <Link to="/cadastro" className="block">
                  <Button className="w-full fab-glow font-bold">Assinar Premium</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </Section>

      {/* ── FINAL CTA ── */}
      <Section className="py-20 md:py-28 px-4 bg-gradient-to-b from-primary/10 to-background" id="cta">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-2xl md:text-4xl font-bold">Comece a Controlar suas Finanças Hoje</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Junte-se ao FinControlApp e organize seu dinheiro e orçamentos profissionais em uma só plataforma.
          </p>
          <Link to="/cadastro">
            <Button size="lg" className="fab-glow text-base px-10 py-6 h-auto font-bold">
              Criar Conta Grátis
              <ArrowRight className="ml-2" size={18} />
            </Button>
          </Link>
        </div>
      </Section>

      {/* ── FOOTER ── */}
      <footer className="py-10 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <span className="font-bold text-foreground text-sm">FinControlApp</span>
          <div className="flex gap-4">
            <span>Termos</span>
            <span>Privacidade</span>
            <span>Contato</span>
          </div>
          <div className="flex items-center gap-1">
            <Shield size={12} className="text-emerald" />
            <span>Plataforma segura · © {new Date().getFullYear()} Todos os direitos reservados</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
