import { useState, useEffect } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Cadastro() {
  const { signup, isAuthenticated, loading, user } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const refCode = searchParams.get('ref');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // After signup + auth, create referral record
  useEffect(() => {
    if (!user || !refCode) return;
    createReferralRecord(user.id, refCode);
  }, [user, refCode]);

  async function createReferralRecord(userId: string, code: string) {
    try {
      const { data: codeRow } = await supabase
        .from('referral_codes')
        .select('user_id')
        .eq('code', code)
        .maybeSingle();

      if (!codeRow) return;
      if (codeRow.user_id === userId) return;

      await supabase.from('referrals').insert({
        referrer_id: codeRow.user_id,
        referred_id: userId,
        status: 'signup_started',
      });
    } catch (err) {
      console.log('Referral record:', err);
    }
  }

  if (loading) return null;
  if (isAuthenticated && !refCode) return <Navigate to="/" replace />;
  if (isAuthenticated && refCode) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const result = await signup(email, password, confirm);
    if (!result.success) {
      toast({ variant: 'destructive', title: 'Erro', description: result.error });
    } else {
      toast({ title: 'Conta criada com sucesso!', description: 'Você já pode começar a usar o FinControl.' });
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center">
            <UserPlus size={24} className="text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Criar conta</h1>
          <p className="text-sm text-muted-foreground">
            {refCode ? 'Você foi convidado! Crie sua conta abaixo.' : 'Preencha os dados abaixo'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} className="mt-1" required />
          </div>
          <div>
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" placeholder="Mínimo 6 caracteres" value={password} onChange={e => setPassword(e.target.value)} className="mt-1" required />
          </div>
          <div>
            <Label htmlFor="confirm">Confirmar senha</Label>
            <Input id="confirm" type="password" placeholder="Repita a senha" value={confirm} onChange={e => setConfirm(e.target.value)} className="mt-1" required />
          </div>
          <Button type="submit" className="w-full gradient-primary text-primary-foreground font-semibold" disabled={submitting}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Criar conta'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Já tem conta? <Link to="/login" className="text-primary hover:underline">Entrar</Link>
        </p>
      </div>
    </div>
  );
}
