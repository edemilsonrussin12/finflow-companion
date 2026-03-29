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
  { icon: AlertTriangle, text: 'Messy finances with no clear overview' },
  { icon: Layers, text: 'Manual spreadsheets that waste your time' },
  { icon: FileText, text: 'Difficulty creating professional budgets' },
  { icon: Target, text: 'Lack of organization in income & expenses' },
  { icon: DollarSign, text: 'No easy way to track real profit' },
];

const benefits = [
  { icon: Wallet, title: 'Track Income & Expenses', desc: 'Log every transaction and see where your money goes in real time.' },
  { icon: FileText, title: 'Professional Budgets', desc: 'Create clean, organized quotes and send them to clients in minutes.' },
  { icon: LayoutDashboard, title: 'Financial Dashboard', desc: 'See your full financial picture at a glance with intuitive charts.' },
  { icon: BarChart3, title: 'Reports & Analytics', desc: 'Detailed monthly and yearly reports to guide smarter decisions.' },
  { icon: Smartphone, title: 'Mobile & Desktop', desc: 'Access your finances from any device, anywhere, anytime.' },
  { icon: Zap, title: 'Simple & Fast', desc: 'Clean interface designed for speed — no learning curve.' },
];

const features = [
  { icon: Wallet, title: 'Financial Control', desc: 'Manage income, expenses, and cash flow effortlessly.' },
  { icon: LayoutDashboard, title: 'Dashboard', desc: 'Visual overview of your financial health with key metrics.' },
  { icon: LineChart, title: 'Reports', desc: 'Automatic reports with graphs, categories, and trends.' },
  { icon: Target, title: 'Planning', desc: 'Set goals, simulate scenarios, and plan your financial growth.' },
  { icon: Receipt, title: 'Professional Budgets', desc: 'Create, send, and track quotes for clients with ease.' },
];

const budgetBenefits = [
  { icon: Zap, text: 'Create budgets quickly' },
  { icon: DollarSign, text: 'Add services and prices' },
  { icon: FileText, text: 'Professional layout' },
  { icon: Send, text: 'Send to clients' },
  { icon: CreditCard, text: 'Track payments' },
  { icon: PieChart, text: 'Integrated with financial control' },
];

const steps = [
  { step: '01', title: 'Create Account', desc: 'Sign up in seconds — free, no credit card required.' },
  { step: '02', title: 'Add Finances', desc: 'Log your income and expenses to build your financial picture.' },
  { step: '03', title: 'Create Budgets', desc: 'Generate professional quotes and send them to clients.' },
  { step: '04', title: 'Control Money', desc: 'Use dashboards, reports, and insights to stay on top.' },
];

const videos = [
  { title: 'Create Your Account', id: '' },
  { title: 'Add Expenses', id: '' },
  { title: 'Create a Budget', id: '' },
  { title: 'View Reports', id: '' },
];

const freePlan = [
  'Financial control',
  'Dashboard',
  'Basic reports',
  'Budget creation',
];

const premiumPlan = [
  'Advanced reports',
  'Unlimited budgets',
  'Business tools',
  'Priority support',
  'Annual plan',
];

/* ─── component ─── */
export default function Aterrissagem() {
  useEffect(() => {
    document.title = 'FinControlApp — Control Finances & Create Professional Budgets';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'FinControlApp helps freelancers and small business owners organize money, track expenses, and create professional budgets in one simple app.');
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
            <a href="#benefits" className="hover:text-foreground transition-colors">Benefits</a>
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#budgets" className="hover:text-foreground transition-colors">Budgets</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button variant="ghost" size="sm">Log In</Button>
            </Link>
            <Link to="/cadastro">
              <Button size="sm">Start Free</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <Section className="pt-16 pb-20 md:pt-24 md:pb-28 px-4" id="hero">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
            Control Your Finances and Create{' '}
            <span className="text-primary">Professional Budgets</span>{' '}
            in One App
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            FinControlApp helps freelancers, small business owners and individuals organize money, track expenses, plan budgets and create professional quotes — simple and fast.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/cadastro">
              <Button size="lg" className="w-full sm:w-auto text-base px-8 py-6 h-auto fab-glow font-bold">
                Start Free Now
                <ArrowRight className="ml-2" size={18} />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-8 py-6 h-auto border-primary/30 hover:bg-primary/10" onClick={scrollToHow}>
              <Play className="mr-2" size={16} />
              See How It Works
            </Button>
          </div>
          <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground pt-2">
            <span className="flex items-center gap-1"><CheckCircle size={14} className="text-emerald" /> Free plan available</span>
            <span className="flex items-center gap-1"><CheckCircle size={14} className="text-emerald" /> No credit card required</span>
            <span className="flex items-center gap-1"><Shield size={14} className="text-emerald" /> Secure platform</span>
          </div>
        </div>
      </Section>

      {/* ── PROBLEM ── */}
      <Section className="py-16 md:py-20 px-4 bg-card/40" id="problem">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-2xl md:text-3xl font-bold">Managing Money and Client Budgets Should Not Be Complicated</h2>
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
            FinControlApp Solves Everything in{' '}
            <span className="text-primary">One Place</span>
          </h2>
          <p className="text-muted-foreground">A complete platform to manage finances and create professional budgets.</p>
        </div>
      </Section>

      {/* ── BENEFITS ── */}
      <Section className="py-16 md:py-20 px-4" id="benefits">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">Main Benefits</h2>
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
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">Powerful Features</h2>
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
              Professional Budgets for{' '}
              <span className="text-primary">Freelancers & Small Business Owners</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Create professional budgets in minutes and send them to clients with a clean, organized layout.
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
                Create Your First Budget Now
                <ArrowRight className="ml-2" size={18} />
              </Button>
            </Link>
          </div>
        </div>
      </Section>

      {/* ── VIDEO / DEMO ── */}
      <Section className="py-16 md:py-20 px-4 bg-card/40" id="demo">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <h2 className="text-2xl md:text-3xl font-bold">See FinControlApp in Action</h2>
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
              <p className="text-sm font-medium">How FinControlApp Works</p>
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
              <p className="text-sm font-medium">Professional Budgets</p>
            </div>
          </div>
        </div>
      </Section>

      {/* ── SOCIAL PROOF ── */}
      <Section className="py-16 md:py-20 px-4" id="proof">
        <div className="max-w-5xl mx-auto space-y-10">
          <h2 className="text-2xl md:text-3xl font-bold text-center">Built for Real Users</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatCounter end={10000} suffix="+" label="Users" />
            <StatCounter end={99} suffix="%" label="Uptime" />
            <StatCounter end={50000} suffix="+" label="Budgets Created" />
            <StatCounter end={4} suffix=".9★" label="Rating" />
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Lucas M.', text: 'FinControlApp changed how I manage my freelance income. Highly recommend!', stars: 5 },
              { name: 'Ana S.', text: 'Creating professional budgets used to take hours. Now it takes minutes.', stars: 5 },
              { name: 'Carlos R.', text: 'Finally a finance app that actually works for small business owners.', stars: 5 },
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
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">How It Works</h2>
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
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">Simple Pricing</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Free */}
            <Card className="bg-card border-border">
              <CardContent className="p-8 space-y-5">
                <h3 className="text-xl font-bold">Free Plan</h3>
                <p className="text-3xl font-extrabold">R$ 0<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                <ul className="space-y-2">
                  {freePlan.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle size={16} className="text-emerald flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/cadastro" className="block">
                  <Button variant="outline" className="w-full">Start Free</Button>
                </Link>
              </CardContent>
            </Card>
            {/* Premium */}
            <Card className="bg-card border-primary/50 ring-1 ring-primary/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-bl-lg">POPULAR</div>
              <CardContent className="p-8 space-y-5">
                <h3 className="text-xl font-bold">Premium Plan</h3>
                <p className="text-3xl font-extrabold text-primary">R$ 19,90<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                <ul className="space-y-2">
                  {premiumPlan.map((p, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle size={16} className="text-primary flex-shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
                <Link to="/cadastro" className="block">
                  <Button className="w-full fab-glow font-bold">Get Premium</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </Section>

      {/* ── FINAL CTA ── */}
      <Section className="py-20 md:py-28 px-4 bg-gradient-to-b from-primary/10 to-background" id="cta">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-2xl md:text-4xl font-bold">Start Controlling Your Finances Today</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Join FinControlApp and organize your money and professional budgets in one platform.
          </p>
          <Link to="/cadastro">
            <Button size="lg" className="fab-glow text-base px-10 py-6 h-auto font-bold">
              Create Free Account
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
            <span>Terms</span>
            <span>Privacy</span>
            <span>Contact</span>
          </div>
          <div className="flex items-center gap-1">
            <Shield size={12} className="text-emerald" />
            <span>Secure platform · © {new Date().getFullYear()} All rights reserved</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
