import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import logoFinControl from '@/assets/logo-fincontrol.png';

export default function Login() {
  const { isAuthenticated, loading, login } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="min-h-[100dvh] flex items-center justify-center px-4 bg-gradient-to-br from-background via-card to-muted">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-4">
          <div className="mx-auto mb-6">
            <img src={logoFinControl} alt="FinControl" className="h-16 mx-auto" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">Bem-vindo de volta</h1>
            <p className="text-muted-foreground">Controle inteligente do seu dinheiro</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-foreground text-sm font-medium">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="seu@email.com" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="mt-1.5 bg-muted/50 border-border text-foreground placeholder:text-muted-foreground focus:bg-muted focus:border-primary" 
                required 
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-foreground text-sm font-medium">Senha</Label>
              <div className="relative mt-1.5">
                <Input 
                  id="password" 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  className="pr-10 bg-muted/50 border-border text-foreground placeholder:text-muted-foreground focus:bg-muted focus:border-primary" 
                  required 
                />
                <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-xl shadow-lg shadow-primary/25" 
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
            <Link to="/reset-senha" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
              Esqueci minha senha
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
