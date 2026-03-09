import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowRight, Mail, User, CheckCircle } from 'lucide-react';
import { useInView } from '@/hooks/useInView';

export default function LeadCapture() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { ref, inView } = useInView();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setLoading(true);
    try {
      // Type cast needed until DB types are regenerated
      const { error } = await (supabase as any).from('leads').insert({
        name: name.trim(),
        email: email.trim(),
      });

      if (error) throw error;
      setSubmitted(true);
    } catch (err: any) {
      console.error('Lead capture error:', err);
      toast.error('Erro ao salvar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 px-6 bg-gradient-to-r from-primary/10 via-transparent to-emerald/10">
      <div ref={ref} className={`max-w-2xl mx-auto text-center transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="space-y-4 mb-8">
          <h2 className="text-3xl md:text-4xl font-bold">
            Receba acesso antecipado e{' '}
            <span className="text-emerald">transforme sua vida financeira</span>
          </h2>
          <p className="text-muted-foreground">
            Junte-se à lista de pessoas que estão transformando suas finanças. Sem spam, só conteúdo valioso.
          </p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="glass rounded-2xl p-8 space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                placeholder="Seu nome"
                value={name}
                onChange={e => setName(e.target.value)}
                className="pl-10"
                required
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                type="email"
                placeholder="Seu melhor e-mail"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>

            <Button type="submit" size="lg" className="w-full fab-glow" disabled={loading}>
              {loading ? 'Salvando...' : (
                <>
                  Quero acesso antecipado
                  <ArrowRight className="ml-2" size={18} />
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground">
              Sem spam. Cancele quando quiser.
            </p>
          </form>
        ) : (
          <div className="glass rounded-2xl p-8 text-center space-y-4 animate-fade-in">
            <div className="w-16 h-16 bg-emerald/20 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="text-emerald" size={32} />
            </div>
            <h3 className="text-2xl font-bold">Você está na lista! 🎉</h3>
            <p className="text-muted-foreground">
              Entraremos em contato em breve com seu acesso antecipado.
            </p>
            <Link to="/cadastro">
              <Button className="fab-glow">
                Criar conta agora
                <ArrowRight className="ml-2" size={18} />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}