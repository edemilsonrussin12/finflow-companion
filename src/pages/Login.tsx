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
    <div className="min-h-[100dvh] flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center">
            <LogIn size={24} className="text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">FinControl</h1>
          <p className="text-sm text-muted-foreground">Entre na sua conta</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} className="mt-1" required />
          </div>
          <div>
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" placeholder="••••••" value={password} onChange={e => setPassword(e.target.value)} className="mt-1" required />
          </div>
          <Button type="submit" className="w-full gradient-primary text-primary-foreground font-semibold" disabled={submitting}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Entrar'}
          </Button>
        </form>

        <div className="text-center space-y-2 text-sm">
          <Link to="/cadastro" className="text-primary hover:underline block">Criar conta</Link>
          <Link to="/reset-senha" className="text-muted-foreground hover:underline block">Esqueci minha senha</Link>
        </div>
      </div>
    </div>
  );
}
