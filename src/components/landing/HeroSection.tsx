import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play, Shield, TrendingUp, Users } from 'lucide-react';

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
      
      <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
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
              Começar agora
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
            Ver como funciona
          </Button>
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-wrap justify-center gap-6 pt-8 animate-fade-in" style={{ animationDelay: '450ms' }}>
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
