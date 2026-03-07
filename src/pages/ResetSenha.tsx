import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KeyRound, CheckCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ResetSenha() {
  const { resetPassword } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const result = await resetPassword(email);
    if (result.success) {
      setSent(true);
    } else {
      toast({ variant: 'destructive', title: 'Erro', description: result.error });
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center">
            {sent ? <CheckCircle size={24} className="text-primary-foreground" /> : <KeyRound size={24} className="text-primary-foreground" />}
          </div>
          <h1 className="text-2xl font-bold">{sent ? 'Email enviado' : 'Redefinir senha'}</h1>
          <p className="text-sm text-muted-foreground">
            {sent ? 'Verifique sua caixa de entrada para redefinir a senha.' : 'Informe seu email para receber instruções'}
          </p>
        </div>

        {!sent && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} className="mt-1" required />
            </div>
            <Button type="submit" className="w-full gradient-primary text-primary-foreground font-semibold" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enviar redefinição'}
            </Button>
          </form>
        )}

        <p className="text-center text-sm text-muted-foreground">
          <Link to="/login" className="text-primary hover:underline">Voltar para login</Link>
        </p>
      </div>
    </div>
  );
}
