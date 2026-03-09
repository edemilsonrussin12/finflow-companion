import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import logoFinControl from '@/assets/logo-fincontrol.png';

export default function Login() {
  const { isAuthenticated, loading, login } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) return null;
  if (isAuthenticated) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const result = await login(email, password);
    if (!result.success) {
      toast({ variant: 'destructive', title: 'Erro', description: result.error });
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-4 bg-gradient-to-br from-[#0B0F19] via-[#0F1629] to-[#1E293B]">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-4">
          <div className="mx-auto mb-6">
            <img src={logoFinControl} alt="FinControl" className="h-16 mx-auto" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white">Bem-vindo de volta</h1>
            <p className="text-slate-300">Controle inteligente do seu dinheiro</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-white text-sm font-medium">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="seu@email.com" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="mt-1.5 bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:bg-white/15 focus:border-primary" 
                required 
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-white text-sm font-medium">Senha</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className="mt-1.5 bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:bg-white/15 focus:border-primary" 
                required 
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-xl shadow-lg shadow-primary/25" 
            disabled={submitting}
          >
            {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Entrar'}
          </Button>
        </form>

        <div className="text-center space-y-4">
          <Link to="/cadastro" className="text-primary hover:text-primary/80 text-sm font-medium transition-colors">
            Criar conta
          </Link>
          <div>
            <Link to="/reset-senha" className="text-slate-400 hover:text-slate-300 text-sm transition-colors">
              Esqueci minha senha
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
