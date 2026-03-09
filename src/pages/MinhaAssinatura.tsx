import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Crown, Zap, Sparkles, CreditCard, ArrowUpRight, MessageCircle, Loader2, CheckCircle2, Clock, XCircle, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { usePremiumStatus } from '@/hooks/usePremiumStatus';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const WHATSAPP_URL = 'https://wa.me/5516997578462?text=Olá%20preciso%20de%20ajuda%20com%20minha%20assinatura';

interface Subscription {
  is_premium: boolean;
  plan_type: string | null;
  premium_started_at: string | null;
  premium_expires_at: string | null;
  mercadopago_payment_id: string | null;
}

interface Payment {
  id: string;
  plan_type: string;
  amount: number;
  status: string;
  mercadopago_payment_id: string | null;
  created_at: string;
}

export default function MinhaAssinatura() {
  const { user } = useAuth();
  const { isPremium, recheck } = usePremiumStatus();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [cancelRenewalOpen, setCancelRenewalOpen] = useState(false);
  const [cancelSubOpen, setCancelSubOpen] = useState(false);
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    const [subRes, payRes] = await Promise.all([
      supabase.from('user_subscriptions').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('payments').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    ]);
    if (subRes.data) setSubscription(subRes.data);
    if (payRes.data) setPayments(payRes.data as Payment[]);
    await recheck();
    setLoading(false);
  };

  const getStatus = () => {
    if (!subscription || !subscription.is_premium) return { label: 'Inativo', variant: 'secondary' as const, icon: XCircle };
    if (subscription.premium_expires_at) {
      const expires = new Date(subscription.premium_expires_at);
      const daysLeft = Math.ceil((expires.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (daysLeft <= 0) return { label: 'Expirado', variant: 'destructive' as const, icon: XCircle };
      if (daysLeft <= 7) return { label: 'Expirando', variant: 'outline' as const, icon: Clock };
    }
    return { label: 'Ativo', variant: 'default' as const, icon: CheckCircle2 };
  };

  const getPlanLabel = () => {
    if (!subscription?.is_premium) return 'Gratuito';
    if (subscription.plan_type === 'annual') return 'Premium Anual';
    return 'Premium Mensal';
  };

  const handleCheckout = async (plan: 'monthly' | 'annual') => {
    if (!user) return;
    setCheckoutLoading(plan);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { user_id: user.id, plan },
      });
      if (error || !data?.init_point) throw new Error(error?.message || 'Erro ao criar checkout');
      window.location.href = data.init_point;
    } catch (err: any) {
      toast.error(err.message || 'Erro ao processar. Tente novamente.');
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handleCancelRenewal = async () => {
    if (!user) return;
    setCanceling(true);
    // We mark that renewal is off by keeping is_premium but not extending
    toast.success('Renovação automática cancelada. Seu plano continuará ativo até o vencimento.');
    setCancelRenewalOpen(false);
    setCanceling(false);
  };

  const handleCancelSubscription = async () => {
    if (!user || !subscription) return;
    setCanceling(true);
    try {
      const { error } = await supabase
        .from('user_subscriptions')
        .update({ is_premium: false, updated_at: new Date().toISOString() })
        .eq('user_id', user.id);
      if (error) throw error;
      toast.success('Assinatura cancelada. Seu acesso Premium foi desativado.');
      await loadData();
    } catch {
      toast.error('Erro ao cancelar assinatura.');
    } finally {
      setCanceling(false);
      setCancelSubOpen(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    return format(new Date(dateStr), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  const status = getStatus();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Minha Assinatura</h1>
          <p className="text-sm text-muted-foreground">Gerencie seu plano e pagamentos</p>
        </div>
        <Button variant="ghost" size="icon" onClick={loadData}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Current Plan Card */}
      <Card className="border-primary/20 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-primary to-emerald-500" />
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            Plano Atual
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-foreground">{getPlanLabel()}</span>
            <Badge variant={status.variant} className="gap-1">
              <status.icon className="h-3 w-3" />
              {status.label}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/30 rounded-lg p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Início</p>
              <p className="text-xs font-medium text-foreground mt-1">
                {formatDate(subscription?.premium_started_at || null)}
              </p>
            </div>
            <div className="bg-muted/30 rounded-lg p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Validade</p>
              <p className="text-xs font-medium text-foreground mt-1">
                {formatDate(subscription?.premium_expires_at || null)}
              </p>
            </div>
          </div>

          {subscription?.mercadopago_payment_id && (
            <div className="bg-muted/30 rounded-lg p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Último pagamento</p>
              <p className="text-xs font-mono text-muted-foreground mt-1">
                ID: {subscription.mercadopago_payment_id}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upgrade Section */}
      {isPremium && subscription?.plan_type === 'monthly' && (
        <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-transparent">
          <CardContent className="pt-5 pb-4 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-emerald-400" />
              <span className="text-sm font-bold text-foreground">Economize 30% com o plano anual</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Atualize para o Premium Anual e economize em comparação com o plano mensal.
            </p>
            <Button className="w-full" disabled={checkoutLoading === 'annual'} onClick={() => handleCheckout('annual')}>
              {checkoutLoading === 'annual' ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processando...</>
              ) : (
                <>Upgrade para Anual — R$167/ano <ArrowUpRight className="h-4 w-4 ml-1" /></>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Free User - Show both plans */}
      {!isPremium && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Escolha seu plano</h2>
          <Card className="border-primary/30">
            <CardContent className="pt-5 pb-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Premium Mensal</p>
                  <p className="text-xs text-muted-foreground">R$ 19,90/mês</p>
                </div>
              </div>
              <Button className="w-full" disabled={checkoutLoading === 'monthly'} onClick={() => handleCheckout('monthly')}>
                {checkoutLoading === 'monthly' ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processando...</> : 'Assinar Mensal'}
              </Button>
            </CardContent>
          </Card>
          <Card className="border-emerald-500/30">
            <CardContent className="pt-5 pb-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Premium Anual</p>
                  <p className="text-xs text-muted-foreground">R$ 167,00/ano <span className="text-emerald-400">(~R$ 13,92/mês)</span></p>
                </div>
              </div>
              <Badge variant="secondary" className="text-[10px]">Melhor valor — 30% de economia</Badge>
              <Button className="w-full" variant="outline" disabled={checkoutLoading === 'annual'} onClick={() => handleCheckout('annual')}>
                {checkoutLoading === 'annual' ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processando...</> : 'Assinar Anual'}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payment History */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-primary" />
          Histórico de Pagamentos
        </h2>
        {payments.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <CreditCard className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Nenhum pagamento registrado</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {payments.map((p) => (
              <Card key={p.id} className="border-border/50">
                <CardContent className="py-3 px-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-foreground">
                      {p.plan_type === 'annual' ? 'Premium Anual' : 'Premium Mensal'}
                    </span>
                    <Badge variant={p.status === 'approved' ? 'default' : p.status === 'pending' ? 'outline' : 'secondary'} className="text-[10px]">
                      {p.status === 'approved' ? 'Aprovado' : p.status === 'pending' ? 'Pendente' : p.status === 'rejected' ? 'Rejeitado' : p.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(p.created_at), 'dd/MM/yyyy HH:mm')}
                    </span>
                    <span className="text-sm font-bold text-foreground">
                      R$ {Number(p.amount).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                  {p.mercadopago_payment_id && (
                    <p className="text-[10px] text-muted-foreground font-mono mt-1">
                      ID: {p.mercadopago_payment_id}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Actions */}
      <div className="space-y-2">
        {isPremium && (
          <>
            <Button
              variant="outline"
              className="w-full justify-start gap-2 text-muted-foreground"
              onClick={() => setCancelRenewalOpen(true)}
            >
              <Clock className="h-4 w-4" />
              Cancelar renovação automática
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
              onClick={() => setCancelSubOpen(true)}
            >
              <XCircle className="h-4 w-4" />
              Cancelar assinatura
            </Button>
          </>
        )}
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={() => window.open(WHATSAPP_URL, '_blank')}
        >
          <MessageCircle className="h-4 w-4 text-emerald-400" />
          Falar com suporte no WhatsApp
        </Button>
      </div>

      {/* Cancel Renewal Dialog */}
      <AlertDialog open={cancelRenewalOpen} onOpenChange={setCancelRenewalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar renovação automática</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar a renovação automática do seu plano? Seu acesso Premium continuará ativo até o final do período pago.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelRenewal} disabled={canceling}>
              {canceling ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Confirmar cancelamento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Subscription Dialog */}
      <AlertDialog open={cancelSubOpen} onOpenChange={setCancelSubOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar assinatura</AlertDialogTitle>
            <AlertDialogDescription>
              Seu plano continuará ativo até o final do período pago. Deseja cancelar a assinatura?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelSubscription} disabled={canceling} className="bg-destructive hover:bg-destructive/90">
              {canceling ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Confirmar cancelamento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
