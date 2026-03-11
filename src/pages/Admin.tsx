import { useState, useEffect, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Shield, Users, Crown, DollarSign, TrendingUp, BarChart3, RefreshCw, Loader2,
  Search, ArrowUpRight, Clock, XCircle, CheckCircle2, Sparkles, AlertTriangle,
  CreditCard, ScrollText, Activity, Gift, UserCheck
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, AreaChart, Area
} from 'recharts';

// ─── Types ───
interface Sub {
  user_id: string;
  is_premium: boolean;
  plan_type: string | null;
  premium_started_at: string | null;
  premium_expires_at: string | null;
  mercadopago_payment_id: string | null;
  created_at: string;
  updated_at: string;
}

interface Profile {
  id: string;
  email: string | null;
  display_name: string | null;
  created_at: string;
}

interface PaymentRow {
  id: string;
  user_id: string;
  plan_type: string;
  amount: number;
  status: string;
  mercadopago_payment_id: string | null;
  created_at: string;
}

interface LogEntry {
  id: string;
  user_id: string | null;
  user_email: string | null;
  action: string;
  admin_email: string | null;
  notes: string | null;
  created_at: string;
}

interface ReferralRow {
  id: string;
  referrer_id: string;
  referred_id: string;
  status: string;
  email_confirmed: boolean;
  premium_converted: boolean;
  reward_granted: boolean;
  reward_granted_at: string | null;
  reward_type: string | null;
  created_at: string;
}

const COLORS = ['hsl(var(--primary))', 'hsl(153,60%,50%)', 'hsl(45,93%,58%)', 'hsl(200,70%,55%)'];
const CHART_STYLE = { background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 };

export default function Admin() {
  const [subs, setSubs] = useState<Sub[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [referrals, setReferrals] = useState<ReferralRow[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [paymentMode, setPaymentMode] = useState<'test' | 'production'>('test');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Filters
  const [userFilter, setUserFilter] = useState('all');
  const [userSearch, setUserSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [paymentSearch, setPaymentSearch] = useState('');

  // Dialog
  const [dialog, setDialog] = useState<{ type: string; userId: string; email: string } | null>(null);
  const [dialogDays, setDialogDays] = useState(30);

  const load = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const { data, error } = await supabase.functions.invoke('admin-subscriptions', {
        body: { action: 'list' },
      });
      if (error) {
        console.error('Admin load error:', error);
        setLoadError('Erro ao carregar dados. Verifique suas permissões de admin.');
        toast.error('Erro ao carregar dados admin');
      } else {
        setSubs(data.subscriptions || []);
        setProfiles(data.profiles || []);
        setPayments(data.payments || []);
        setLogs(data.logs || []);
        setReferrals(data.referrals || []);
        setTotalUsers(data.totalUsers || 0);
        setPaymentMode(data.paymentMode || 'test');
      }
    } catch (err: any) {
      console.error('Admin load exception:', err);
      setLoadError('Acesso negado ou erro de conexão.');
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAction = async (action: string, userId: string, extra?: Record<string, any>) => {
    setActionLoading(`${action}-${userId}`);
    const { error } = await supabase.functions.invoke('admin-subscriptions', {
      body: { action, user_id: userId, ...extra },
    });
    if (error) {
      toast.error('Erro na ação');
    } else {
      toast.success('Ação executada com sucesso');
      await load();
    }
    setActionLoading(null);
    setDialog(null);
  };

  const handleExpireOverdue = async () => {
    setActionLoading('expire_overdue');
    const { data, error } = await supabase.functions.invoke('admin-subscriptions', {
      body: { action: 'expire_overdue' },
    });
    if (error) {
      toast.error('Erro ao expirar assinaturas');
    } else {
      toast.success(`${data.expired_count} assinatura(s) expirada(s)`);
      await load();
    }
    setActionLoading(null);
  };

  const handleGrantReward = async (referralId: string, referrerId: string) => {
    setActionLoading(`reward-${referralId}`);
    const { error } = await supabase.functions.invoke('admin-subscriptions', {
      body: { action: 'grant_referral_reward', referral_id: referralId, referrer_id: referrerId, reward_days: 30 },
    });
    if (error) {
      toast.error('Erro ao conceder recompensa');
    } else {
      toast.success('Recompensa concedida com sucesso');
      await load();
    }
    setActionLoading(null);
  };

  const getEmail = (userId: string) => profiles.find(p => p.id === userId)?.email || '—';

  // ─── Metrics ───
  const metrics = useMemo(() => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const activeSubs = subs.filter(s => s.is_premium && (!s.premium_expires_at || new Date(s.premium_expires_at) > now));
    const monthly = activeSubs.filter(s => s.plan_type === 'monthly');
    const annual = activeSubs.filter(s => s.plan_type === 'annual');
    const expired = subs.filter(s => s.premium_expires_at && new Date(s.premium_expires_at) < now);
    const canceled = subs.filter(s => !s.is_premium && s.premium_started_at);
    const expiringSoon = subs.filter(s => {
      if (!s.premium_expires_at || !s.is_premium) return false;
      const d = new Date(s.premium_expires_at);
      return d > now && d.getTime() - now.getTime() < 7 * 24 * 60 * 60 * 1000;
    });

    const newUsers7d = profiles.filter(p => p.created_at && new Date(p.created_at) >= sevenDaysAgo).length;
    const newUsers30d = profiles.filter(p => p.created_at && new Date(p.created_at) >= thirtyDaysAgo).length;

    const mrr = (monthly.length * 19.90) + (annual.length * (167 / 12));
    const arr = mrr * 12;
    const approvedPayments = payments.filter(p => p.status === 'approved');
    const totalRevenue = approvedPayments.reduce((sum, p) => sum + Number(p.amount), 0);
    const conversionRate = totalUsers > 0 ? ((activeSubs.length / totalUsers) * 100) : 0;
    const freeUsers = totalUsers - activeSubs.length;

    const revenueByMonth: Record<string, number> = {};
    const newUsersByMonth: Record<string, number> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      revenueByMonth[key] = 0;
      newUsersByMonth[key] = 0;
    }
    approvedPayments.forEach(p => {
      const key = p.created_at?.slice(0, 7);
      if (key && key in revenueByMonth) revenueByMonth[key] += Number(p.amount);
    });
    profiles.forEach(p => {
      const key = p.created_at?.slice(0, 7);
      if (key && key in newUsersByMonth) newUsersByMonth[key]++;
    });

    const revenueChartData = Object.entries(revenueByMonth).map(([m, v]) => ({ month: m.slice(5), value: v }));
    const usersChartData = Object.entries(newUsersByMonth).map(([m, v]) => ({ month: m.slice(5), value: v }));
    const planBreakdown = [
      { name: 'Mensal', value: monthly.length },
      { name: 'Anual', value: annual.length },
      { name: 'Gratuito', value: freeUsers > 0 ? freeUsers : 0 },
    ].filter(d => d.value > 0);

    const insights: string[] = [];
    if (expiringSoon.length > 0) insights.push(`${expiringSoon.length} assinatura(s) vencendo nos próximos 7 dias`);
    if (annual.length > monthly.length) insights.push('Plano anual está convertendo melhor que o mensal');
    if (monthly.length > annual.length) insights.push('Considere promover mais o plano anual para aumentar retenção');

    // Referral metrics
    const totalReferrals = referrals.length;
    const confirmedReferrals = referrals.filter(r => r.email_confirmed).length;
    const premiumConversions = referrals.filter(r => r.premium_converted).length;
    const rewardsGranted = referrals.filter(r => r.reward_granted).length;
    const pendingRewards = referrals.filter(r => r.premium_converted && !r.reward_granted).length;

    return {
      activeSubs: activeSubs.length, monthly: monthly.length, annual: annual.length,
      expired: expired.length, canceled: canceled.length, expiringSoon: expiringSoon.length,
      freeUsers, totalUsers, newUsers7d, newUsers30d, mrr, arr, totalRevenue,
      conversionRate, revenueChartData, usersChartData, planBreakdown, insights,
      totalReferrals, confirmedReferrals, premiumConversions, rewardsGranted, pendingRewards,
    };
  }, [subs, payments, profiles, totalUsers, referrals]);

  // ─── Filtered users ───
  const filteredUsers = useMemo(() => {
    const now = new Date();
    return profiles.filter(p => {
      if (userSearch && !p.email?.toLowerCase().includes(userSearch.toLowerCase())) return false;
      const sub = subs.find(s => s.user_id === p.id);
      const isActive = sub?.is_premium && (!sub.premium_expires_at || new Date(sub.premium_expires_at) > now);
      switch (userFilter) {
        case 'free': return !isActive;
        case 'premium': return isActive;
        case 'monthly': return isActive && sub?.plan_type === 'monthly';
        case 'annual': return isActive && sub?.plan_type === 'annual';
        case 'expired': return sub?.premium_expires_at && new Date(sub.premium_expires_at) < now;
        case 'canceled': return sub && !sub.is_premium && sub.premium_started_at;
        default: return true;
      }
    });
  }, [profiles, subs, userFilter, userSearch]);

  // ─── Filtered payments ───
  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      if (paymentSearch) {
        const email = getEmail(p.user_id).toLowerCase();
        const mpId = (p.mercadopago_payment_id || '').toLowerCase();
        if (!email.includes(paymentSearch.toLowerCase()) && !mpId.includes(paymentSearch.toLowerCase())) return false;
      }
      switch (paymentFilter) {
        case 'approved': return p.status === 'approved';
        case 'pending': return p.status === 'pending';
        case 'failed': return p.status === 'rejected' || p.status === 'cancelled';
        case 'monthly': return p.plan_type === 'monthly';
        case 'annual': return p.plan_type === 'annual';
        default: return true;
      }
    });
  }, [payments, paymentFilter, paymentSearch, profiles]);

  if (loading) {
    return (
      <div className="space-y-4 pb-24">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Shield className="h-12 w-12 text-destructive" />
        <h2 className="text-lg font-bold text-foreground">Acesso Negado</h2>
        <p className="text-sm text-muted-foreground text-center max-w-xs">{loadError}</p>
        <Button variant="outline" onClick={load}>Tentar novamente</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Painel Admin
          </h1>
          <p className="text-sm text-muted-foreground">Gestão completa do FinControl</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={paymentMode === 'production' ? 'default' : 'outline'} className="text-[10px]">
            {paymentMode === 'production' ? '🟢 Produção' : '🟡 Teste'}
          </Badge>
          <Button variant="ghost" size="icon" onClick={load} disabled={!!actionLoading}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full grid grid-cols-6 h-auto">
          <TabsTrigger value="overview" className="text-[10px] px-1 py-2">Visão Geral</TabsTrigger>
          <TabsTrigger value="users" className="text-[10px] px-1 py-2">Usuários</TabsTrigger>
          <TabsTrigger value="payments" className="text-[10px] px-1 py-2">Pagamentos</TabsTrigger>
          <TabsTrigger value="subscriptions" className="text-[10px] px-1 py-2">Assinaturas</TabsTrigger>
          <TabsTrigger value="referrals" className="text-[10px] px-1 py-2">Convites</TabsTrigger>
          <TabsTrigger value="logs" className="text-[10px] px-1 py-2">Histórico</TabsTrigger>
        </TabsList>

        {/* ═══════ OVERVIEW TAB ═══════ */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: 'Total Usuários', value: metrics.totalUsers, icon: Users, color: 'text-muted-foreground' },
              { label: 'Usuários Free', value: metrics.freeUsers, icon: Users, color: 'text-muted-foreground' },
              { label: 'Premium Ativos', value: metrics.activeSubs, icon: Crown, color: 'text-primary' },
              { label: 'Novos (7d)', value: metrics.newUsers7d, icon: ArrowUpRight, color: 'text-emerald-400' },
              { label: 'Novos (30d)', value: metrics.newUsers30d, icon: ArrowUpRight, color: 'text-emerald-400' },
              { label: 'MRR', value: `R$ ${metrics.mrr.toFixed(2).replace('.', ',')}`, icon: DollarSign, color: 'text-emerald-400' },
              { label: 'ARR', value: `R$ ${metrics.arr.toFixed(2).replace('.', ',')}`, icon: TrendingUp, color: 'text-primary' },
              { label: 'Receita Total', value: `R$ ${metrics.totalRevenue.toFixed(2).replace('.', ',')}`, icon: DollarSign, color: 'text-gold' },
              { label: 'Conversão', value: `${metrics.conversionRate.toFixed(1)}%`, icon: ArrowUpRight, color: 'text-emerald-400' },
              { label: 'Mensal', value: metrics.monthly, icon: CreditCard, color: 'text-primary' },
              { label: 'Anual', value: metrics.annual, icon: CreditCard, color: 'text-emerald-400' },
              { label: 'Expirados', value: metrics.expired, icon: XCircle, color: 'text-destructive' },
            ].map((k, i) => (
              <Card key={i} className="border-border/50">
                <CardContent className="pt-4 pb-3 px-4">
                  <k.icon className={`h-4 w-4 ${k.color} mb-1`} />
                  <p className="text-lg font-bold text-foreground">{k.value}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{k.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Revenue Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                Receita por Mês
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics.revenueChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip contentStyle={CHART_STYLE} formatter={(v: number) => [`R$ ${v.toFixed(2)}`, 'Receita']} />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Users Growth */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4 text-emerald-400" />
                Novos Usuários por Mês
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metrics.usersChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} allowDecimals={false} />
                    <Tooltip contentStyle={CHART_STYLE} />
                    <Area type="monotone" dataKey="value" stroke="hsl(153,60%,50%)" fill="hsl(153,60%,50%,0.15)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Plan Distribution */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Distribuição de Planos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="h-40 w-40 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={metrics.planBreakdown} cx="50%" cy="50%" innerRadius={35} outerRadius={65} dataKey="value" stroke="none">
                        {metrics.planBreakdown.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2">
                  {metrics.planBreakdown.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-xs text-muted-foreground">{d.name}: <span className="font-bold text-foreground">{d.value}</span></span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Insights */}
          {metrics.insights.length > 0 && (
            <Card className="border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {metrics.insights.map((insight, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <AlertTriangle className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                    <span>{insight}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Button variant="outline" className="w-full" onClick={handleExpireOverdue} disabled={actionLoading === 'expire_overdue'}>
            {actionLoading === 'expire_overdue' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <XCircle className="h-4 w-4 mr-2" />}
            Expirar assinaturas vencidas
          </Button>
        </TabsContent>

        {/* ═══════ USERS TAB ═══════ */}
        <TabsContent value="users" className="space-y-4 mt-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por email..." value={userSearch} onChange={e => setUserSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="monthly">Mensal</SelectItem>
                <SelectItem value="annual">Anual</SelectItem>
                <SelectItem value="expired">Expirado</SelectItem>
                <SelectItem value="canceled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <p className="text-xs text-muted-foreground">{filteredUsers.length} usuário(s)</p>

          <div className="space-y-2">
            {filteredUsers.slice(0, 50).map(p => {
              const sub = subs.find(s => s.user_id === p.id);
              const now = new Date();
              const isActive = sub?.is_premium && (!sub.premium_expires_at || new Date(sub.premium_expires_at) > now);
              const planLabel = !sub || !sub.is_premium ? 'Free' : sub.plan_type === 'annual' ? 'Anual' : 'Mensal';
              const statusLabel = isActive ? 'Ativo' : sub?.premium_started_at ? 'Expirado' : 'Free';

              return (
                <Card key={p.id} className="border-border/50">
                  <CardContent className="py-3 px-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-foreground truncate">{p.email || '—'}</p>
                        <p className="text-[10px] text-muted-foreground font-mono truncate">{p.id.slice(0, 12)}...</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge variant={isActive ? 'default' : 'secondary'} className="text-[10px]">{planLabel}</Badge>
                        <Badge variant={statusLabel === 'Ativo' ? 'default' : statusLabel === 'Expirado' ? 'destructive' : 'secondary'} className="text-[10px]">{statusLabel}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-2">
                      <span>Cadastro: {p.created_at ? format(new Date(p.created_at), 'dd/MM/yy') : '—'}</span>
                      {sub?.premium_expires_at && <span>· Expira: {format(new Date(sub.premium_expires_at), 'dd/MM/yy')}</span>}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {!isActive && (
                        <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => setDialog({ type: 'activate', userId: p.id, email: p.email || '—' })}>
                          <Crown className="h-3 w-3 mr-1" /> Ativar Premium
                        </Button>
                      )}
                      {isActive && (
                        <>
                          <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => setDialog({ type: 'extend', userId: p.id, email: p.email || '—' })}>
                            <Clock className="h-3 w-3 mr-1" /> Estender
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 text-[10px] text-destructive" onClick={() => setDialog({ type: 'expire', userId: p.id, email: p.email || '—' })}>
                            <XCircle className="h-3 w-3 mr-1" /> Remover
                          </Button>
                          {sub?.plan_type === 'monthly' && (
                            <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => handleAction('convert_annual', p.id)}>
                              <ArrowUpRight className="h-3 w-3 mr-1" /> → Anual
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* ═══════ PAYMENTS TAB ═══════ */}
        <TabsContent value="payments" className="space-y-4 mt-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por email ou ID..." value={paymentSearch} onChange={e => setPaymentSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="approved">Aprovado</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="failed">Falhou</SelectItem>
                <SelectItem value="monthly">Mensal</SelectItem>
                <SelectItem value="annual">Anual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <p className="text-xs text-muted-foreground">{filteredPayments.length} pagamento(s)</p>

          <div className="space-y-2">
            {filteredPayments.slice(0, 50).map(p => (
              <Card key={p.id} className="border-border/50">
                <CardContent className="py-3 px-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-foreground">{getEmail(p.user_id)}</span>
                    <Badge variant={p.status === 'approved' ? 'default' : p.status === 'pending' ? 'outline' : 'destructive'} className="text-[10px]">
                      {p.status === 'approved' ? 'Aprovado' : p.status === 'pending' ? 'Pendente' : 'Falhou'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{format(new Date(p.created_at), 'dd/MM/yy HH:mm')}</span>
                    <span>{p.plan_type === 'annual' ? 'Anual' : 'Mensal'}</span>
                    <span className="font-bold text-foreground">R$ {Number(p.amount).toFixed(2).replace('.', ',')}</span>
                  </div>
                  {p.mercadopago_payment_id && (
                    <p className="text-[10px] text-muted-foreground font-mono mt-1">MP ID: {p.mercadopago_payment_id}</p>
                  )}
                </CardContent>
              </Card>
            ))}
            {filteredPayments.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-8">Nenhum pagamento encontrado</p>
            )}
          </div>
        </TabsContent>

        {/* ═══════ SUBSCRIPTIONS TAB ═══════ */}
        <TabsContent value="subscriptions" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: 'Mensal Ativo', value: metrics.monthly, color: 'text-primary' },
              { label: 'Anual Ativo', value: metrics.annual, color: 'text-emerald-400' },
              { label: 'Cancelados', value: metrics.canceled, color: 'text-muted-foreground' },
              { label: 'Expirados', value: metrics.expired, color: 'text-destructive' },
              { label: 'Vencendo 7d', value: metrics.expiringSoon, color: 'text-yellow-400' },
            ].map((k, i) => (
              <Card key={i} className="border-border/50">
                <CardContent className="pt-3 pb-2 px-3">
                  <p className={`text-lg font-bold ${k.color}`}>{k.value}</p>
                  <p className="text-[10px] text-muted-foreground uppercase">{k.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <h3 className="text-sm font-semibold text-foreground">Assinaturas Ativas</h3>
          <div className="space-y-2">
            {subs.filter(s => s.is_premium).map(s => (
              <Card key={s.user_id} className="border-border/50">
                <CardContent className="py-3 px-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-foreground truncate">{getEmail(s.user_id)}</span>
                    <Badge variant="default" className="text-[10px]">{s.plan_type === 'annual' ? 'Anual' : 'Mensal'}</Badge>
                  </div>
                  <div className="text-[10px] text-muted-foreground flex gap-3">
                    {s.premium_started_at && <span>Início: {format(new Date(s.premium_started_at), 'dd/MM/yy')}</span>}
                    {s.premium_expires_at && <span>Expira: {format(new Date(s.premium_expires_at), 'dd/MM/yy')}</span>}
                  </div>
                  <div className="flex gap-1 mt-2">
                    <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => setDialog({ type: 'extend', userId: s.user_id, email: getEmail(s.user_id) })}>
                      Estender
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-[10px] text-destructive" onClick={() => setDialog({ type: 'expire', userId: s.user_id, email: getEmail(s.user_id) })}>
                      Cancelar
                    </Button>
                    {s.plan_type === 'monthly' && (
                      <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => handleAction('convert_annual', s.user_id)}>
                        → Anual
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ═══════ REFERRALS TAB ═══════ */}
        <TabsContent value="referrals" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: 'Total Convites', value: metrics.totalReferrals, icon: Gift, color: 'text-primary' },
              { label: 'Email Confirmado', value: metrics.confirmedReferrals, icon: CheckCircle2, color: 'text-emerald-400' },
              { label: 'Conversões Premium', value: metrics.premiumConversions, icon: Crown, color: 'text-yellow-400' },
              { label: 'Recompensas', value: metrics.rewardsGranted, icon: UserCheck, color: 'text-primary' },
              { label: 'Pendentes', value: metrics.pendingRewards, icon: Clock, color: 'text-muted-foreground' },
            ].map((k, i) => (
              <Card key={i} className="border-border/50">
                <CardContent className="pt-3 pb-2 px-3">
                  <k.icon className={`h-4 w-4 ${k.color} mb-1`} />
                  <p className={`text-lg font-bold ${k.color}`}>{k.value}</p>
                  <p className="text-[10px] text-muted-foreground uppercase">{k.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <h3 className="text-sm font-semibold text-foreground">Todos os Convites</h3>
          <div className="space-y-2">
            {referrals.map(r => {
              const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
                signup_started: { label: 'Cadastro', variant: 'outline' },
                email_confirmed: { label: 'Email OK', variant: 'secondary' },
                premium_paid: { label: 'Premium Pago', variant: 'default' },
                reward_granted: { label: 'Recompensado', variant: 'default' },
                rejected: { label: 'Rejeitado', variant: 'destructive' },
              };
              const st = statusMap[r.status] || { label: r.status, variant: 'outline' as const };

              return (
                <Card key={r.id} className="border-border/50">
                  <CardContent className="py-3 px-4">
                    <div className="flex items-center justify-between mb-1">
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] text-muted-foreground">Convidou: <span className="text-foreground font-medium">{getEmail(r.referrer_id)}</span></p>
                        <p className="text-[10px] text-muted-foreground">Convidado: <span className="text-foreground font-medium">{getEmail(r.referred_id)}</span></p>
                      </div>
                      <Badge variant={st.variant} className="text-[10px]">{st.label}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span>{format(new Date(r.created_at), 'dd/MM/yy')}</span>
                      {r.email_confirmed && <Badge variant="outline" className="text-[8px] px-1">✉️ Confirmado</Badge>}
                      {r.premium_converted && <Badge variant="outline" className="text-[8px] px-1">💎 Premium</Badge>}
                      {r.reward_granted && <Badge variant="default" className="text-[8px] px-1">🎁 Recompensado</Badge>}
                    </div>
                    {r.premium_converted && !r.reward_granted && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-[10px] mt-2"
                        disabled={actionLoading === `reward-${r.id}`}
                        onClick={() => handleGrantReward(r.id, r.referrer_id)}
                      >
                        {actionLoading === `reward-${r.id}` ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Gift className="h-3 w-3 mr-1" />}
                        Conceder recompensa (+30 dias)
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
            {referrals.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-8">Nenhum convite registrado</p>
            )}
          </div>
        </TabsContent>

        {/* ═══════ LOGS TAB ═══════ */}
        <TabsContent value="logs" className="space-y-4 mt-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <ScrollText className="h-4 w-4 text-primary" />
            Histórico de Ações ({logs.length})
          </h3>
          <div className="space-y-2">
            {logs.map(log => (
              <Card key={log.id} className="border-border/50">
                <CardContent className="py-3 px-4">
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant="outline" className="text-[10px]">{log.action.replace(/_/g, ' ')}</Badge>
                    <span className="text-[10px] text-muted-foreground">{format(new Date(log.created_at), 'dd/MM/yy HH:mm')}</span>
                  </div>
                  {log.user_email && <p className="text-[10px] text-muted-foreground">Usuário: {log.user_email}</p>}
                  {log.admin_email && <p className="text-[10px] text-muted-foreground">Admin: {log.admin_email}</p>}
                  {log.notes && <p className="text-[10px] text-muted-foreground italic mt-1">{log.notes}</p>}
                </CardContent>
              </Card>
            ))}
            {logs.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-8">Nenhum registro encontrado</p>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* ─── Action Dialog ─── */}
      <Dialog open={!!dialog} onOpenChange={() => setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialog?.type === 'activate' && 'Ativar Premium'}
              {dialog?.type === 'extend' && 'Estender Assinatura'}
              {dialog?.type === 'expire' && 'Remover Premium'}
            </DialogTitle>
            <DialogDescription>
              Usuário: {dialog?.email}
            </DialogDescription>
          </DialogHeader>

          {(dialog?.type === 'activate' || dialog?.type === 'extend') && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Dias para {dialog?.type === 'activate' ? 'ativar' : 'estender'}:</p>
              <div className="flex gap-2">
                {[30, 90, 180, 365].map(d => (
                  <Button key={d} size="sm" variant={dialogDays === d ? 'default' : 'outline'} onClick={() => setDialogDays(d)}>
                    {d}d
                  </Button>
                ))}
              </div>
            </div>
          )}

          {dialog?.type === 'expire' && (
            <p className="text-sm text-muted-foreground">Tem certeza que deseja remover o acesso Premium deste usuário?</p>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>Cancelar</Button>
            <Button
              disabled={!!actionLoading}
              onClick={() => {
                if (!dialog) return;
                if (dialog.type === 'activate') handleAction('activate', dialog.userId, { plan_type: dialogDays >= 365 ? 'annual' : 'monthly', days: dialogDays });
                if (dialog.type === 'extend') handleAction('extend', dialog.userId, { days: dialogDays });
                if (dialog.type === 'expire') handleAction('expire', dialog.userId);
              }}
            >
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
