import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Wallet, TrendingUp, FileText, ArrowRight, Shield } from 'lucide-react';
import logoFinControl from '@/assets/logo-fincontrol.png';
import appPreview from '@/assets/tiktok-app-preview.png';

const benefits = [
  {
    icon: Wallet,
    title: 'Controle seus gastos em segundos',
    description: 'Registre e categorize todas as suas despesas rapidamente.',
  },
  {
    icon: TrendingUp,
    title: 'Acompanhe investimentos e patrimônio',
    description: 'Veja sua evolução financeira com gráficos claros.',
  },
  {
    icon: FileText,
    title: 'Crie orçamentos profissionais para seus clientes',
    description: 'Gere PDFs prontos com logo e assinatura digital.',
  },
];

export default function TikTokLanding() {
  useEffect(() => {
    document.title = 'FinControl — Controle inteligente do seu dinheiro';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Organize suas finanças, acompanhe investimentos e crie orçamentos profissionais com o FinControl.');
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="pt-8 pb-6 px-6 text-center">
        <img src={logoFinControl} alt="FinControl" className="h-10 mx-auto mb-6" />
        <h1 className="text-3xl font-extrabold leading-tight mb-3">
          Controle inteligente do seu{' '}
          <span className="text-emerald">dinheiro</span>
        </h1>
        <p className="text-muted-foreground text-base max-w-md mx-auto">
          Organize gastos, acompanhe investimentos e crie orçamentos profissionais em um único aplicativo.
        </p>
      </header>

      {/* App Preview */}
      <section className="px-6 flex justify-center py-4">
        <div className="relative max-w-[280px]">
          <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-3xl" />
          <img
            src={appPreview}
            alt="FinControl Dashboard - controle financeiro"
            className="relative z-10 w-full drop-shadow-2xl"
            loading="eager"
          />
        </div>
      </section>

      {/* Benefits */}
      <section className="px-6 py-8">
        <div className="max-w-md mx-auto space-y-4">
          {benefits.map((b, i) => (
            <div key={i} className="glass rounded-2xl p-5 flex gap-4 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-emerald flex items-center justify-center">
                <b.icon size={22} className="text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-1">{b.title}</h3>
                <p className="text-xs text-muted-foreground">{b.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-6 text-center">
        <Link to="/cadastro?utm_source=tiktok">
          <Button size="lg" className="fab-glow text-lg px-10 py-7 h-auto w-full max-w-md font-bold">
            COMEÇAR GRÁTIS
            <ArrowRight className="ml-2" size={22} />
          </Button>
        </Link>
      </section>

      {/* Social Proof */}
      <section className="px-6 py-8 text-center">
        <div className="glass rounded-2xl p-6 max-w-md mx-auto flex items-center gap-3 justify-center">
          <Shield size={20} className="text-emerald flex-shrink-0" />
          <p className="text-sm text-muted-foreground">
            Cada vez mais pessoas estão organizando suas finanças com o{' '}
            <span className="text-foreground font-semibold">FinControl</span>.
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
