import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  Wallet,
  TrendingUp,
  FileText,
  Smartphone,
  Monitor,
  Sparkles,
  CheckCircle,
  Users,
  BarChart3,
  Receipt,
  Target,
} from 'lucide-react';
import logoFinControl from '@/assets/logo-fincontrol.png';

const audiences = [
  'Autônomos',
  'Prestadores de serviço',
  'Freelancers',
  'Profissionais liberais',
  'Quem quer organizar melhor o dinheiro',
];

const financialItems = [
  { icon: Wallet, text: 'Registre ganhos e despesas' },
  { icon: BarChart3, text: 'Visualize seus resultados' },
  { icon: Target, text: 'Entenda seu lucro real' },
];

const pdfFeatures = [
  'Logo personalizado',
  'Dados do cliente',
  'Descrição dos serviços',
  'Valores organizados',
];

const benefitsList = [
  { icon: Sparkles, text: 'Interface simples e intuitiva' },
  { icon: Smartphone, text: 'Funciona no celular' },
  { icon: Monitor, text: 'Funciona no computador' },
  { icon: Wallet, text: 'Organização pessoal e profissional' },
  { icon: CheckCircle, text: 'Comece gratuitamente' },
];

export default function InstagramLanding() {
  useEffect(() => {
    document.title = 'FinControl | Organize finanças pessoais e profissionais';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Organize suas finanças, acompanhe resultados e crie orçamentos profissionais com o FinControl.');
  }, []);

  const signupUrl = '/cadastro?utm_source=instagram';

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="pt-8 pb-2 px-6 text-center">
        <img src={logoFinControl} alt="FinControl" className="h-10 mx-auto mb-6" />
      </header>

      {/* Section 1 – Hero */}
      <section className="px-6 pb-6 text-center">
        <h1 className="text-2xl font-extrabold leading-tight mb-3 max-w-md mx-auto">
          Controle inteligente do seu{' '}
          <span className="text-primary">dinheiro</span> e do seu{' '}
          <span className="text-primary">trabalho</span>
        </h1>
        <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
          Organize suas finanças, acompanhe seus resultados e crie orçamentos profissionais em um único aplicativo.
        </p>
        <Link to={signupUrl}>
          <Button size="lg" className="fab-glow text-base px-8 py-6 h-auto w-full max-w-sm font-bold">
            COMEÇAR GRÁTIS
            <ArrowRight className="ml-2" size={20} />
          </Button>
        </Link>
      </section>

      {/* Section 2 – Para quem é */}
      <section className="px-6 py-8">
        <div className="glass rounded-2xl p-6 max-w-md mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <Users size={18} className="text-primary" />
            <h2 className="text-base font-bold">Ideal para</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {audiences.map((item, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-medium px-3 py-1.5 rounded-full"
              >
                <CheckCircle size={12} />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3 – Clareza financeira */}
      <section className="px-6 py-6">
        <div className="max-w-md mx-auto">
          <h2 className="text-lg font-bold text-center mb-4">Tenha clareza financeira</h2>
          <div className="space-y-3">
            {financialItems.map((item, i) => (
              <div key={i} className="glass rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-emerald flex items-center justify-center flex-shrink-0">
                  <item.icon size={18} className="text-primary-foreground" />
                </div>
                <span className="text-sm font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4 – Engenharia da riqueza */}
      <section className="px-6 py-6">
        <div className="glass rounded-2xl p-6 max-w-md mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={18} className="text-primary" />
            <h2 className="text-base font-bold">Planeje seu crescimento financeiro</h2>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Visualize como seu patrimônio pode evoluir ao longo do tempo. Tenha visão de longo prazo e mais clareza nas decisões financeiras.
          </p>
        </div>
      </section>

      {/* Section 5 – Orçamentos */}
      <section className="px-6 py-6">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-2 mb-3 justify-center">
            <FileText size={18} className="text-primary" />
            <h2 className="text-base font-bold">Orçamentos profissionais</h2>
          </div>
          <p className="text-xs text-muted-foreground text-center mb-4">
            Crie orçamentos organizados para enviar aos clientes. Documentos em PDF com:
          </p>
          <div className="grid grid-cols-2 gap-2">
            {pdfFeatures.map((feat, i) => (
              <div key={i} className="glass rounded-xl p-3 flex items-center gap-2">
                <Receipt size={14} className="text-emerald flex-shrink-0" />
                <span className="text-xs font-medium">{feat}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center mt-3">
            Transmita mais profissionalismo.
          </p>
        </div>
      </section>

      {/* Section 6 – Benefícios */}
      <section className="px-6 py-6">
        <div className="max-w-md mx-auto">
          <h2 className="text-lg font-bold text-center mb-4">Por que usar o FinControl</h2>
          <div className="space-y-2">
            {benefitsList.map((b, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 glass rounded-xl">
                <b.icon size={16} className="text-emerald flex-shrink-0" />
                <span className="text-sm">{b.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 7 – CTA Final */}
      <section className="px-6 py-8 text-center">
        <div className="glass rounded-2xl p-8 max-w-md mx-auto">
          <p className="text-sm font-semibold mb-4 leading-relaxed">
            Organize seu dinheiro e seu trabalho com mais profissionalismo.
          </p>
          <Link to={signupUrl}>
            <Button size="lg" className="fab-glow text-base px-8 py-6 h-auto w-full font-bold">
              CRIAR CONTA GRÁTIS
              <ArrowRight className="ml-2" size={20} />
            </Button>
          </Link>
          <p className="text-[11px] text-muted-foreground mt-3">
            Seus dados permanecem privados e seguros.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-6 text-center border-t border-border">
        <p className="text-muted-foreground text-xs">
          © {new Date().getFullYear()} FinControl. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
}
