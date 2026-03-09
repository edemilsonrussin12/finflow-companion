import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Users, DollarSign, BarChart3, Loader2, RefreshCw, Shield, AlertTriangle, Sparkles, ArrowUpRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface Sub {
  user_id: string;
  is_premium: boolean;
  plan_type: string | null;
  premium_started_at: string | null;
  premium_expires_at: string | null;
  created_at: string;
}

interface PaymentRow {
  id: string;
  user_id: string;
  plan_type: string;
  amount: number;
  status: string;
  created_at: string;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--emerald))', 'hsl(var(--gold))', 'hsl(var(--cyan))'];

export default function AdminMetricas() {
  const [subs, setSubs] = useState<Sub[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke('admin-subscriptions', {
      body: { action: 'list' },
    });
    if (error) {
      toast.error('Erro ao carregar métricas');
    } else {
      setSubs(data.subscriptions || []);
      setPayments(data.payments || []);
      setTotalUsers(data.totalUsers || 0);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const metrics = useMemo(() => {
    const now = new Date();
    const activeSubs = subs.filter(s => s.is_premium && (!s.premium_expires_at || new Date(s.premium_expires_at) > now));
    const monthly = activeSubs.filter(s => s.plan_type === 'monthly');
    const annual = activeSubs.filter(s => s.plan_type === 'annual');
    const expired = subs.filter(s => s.premium_expires_at && new Date(s.premium_expires_at) < now);

    const mrr = (monthly.length * 19.90) + (annual.length * (167 / 12));
    const arr = mrr * 12;
    const approvedPayments = payments.filter(p => p.status === 'approved');
    const totalRevenue = approvedPayments.reduce((sum, p) => sum + Number(p.amount), 0);

    const conversionRate = totalUsers > 0 ? ((activeSubs.length / totalUsers) * 100) : 0;
    const freeUsers = totalUsers - activeSubs.length;

    // Monthly revenue chart data (last 6 months)
    const revenueByMonth: Record<string, number> = {};
    const newSubsByMonth: Record<string, number> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      revenueByMonth[key] = 0;
      newSubsByMonth[key] = 0;
    }

    approvedPayments.forEach(p => {
      const key = p.created_at.slice(0, 7);
      if (key in revenueByMonth) revenueByMonth[key] += Number(p.amount);
    });

    subs.forEach(s => {
      const key = s.created_at.slice(0, 7);
      if (key in newSubsByMonth) newSubsByMonth[key]++;
    });

    const revenueChartData = Object.entries(revenueByMonth).map(([month, value]) => ({
      month: month.slice(5),
      value,
    }));

    const subsChartData = Object.entries(newSubsByMonth).map(([month, value]) => ({
      month: month.slice(5),
      value,
    }));

    const planBreakdown = [
      { name: 'Mensal', value: monthly.length },
      { name: 'Anual', value: annual.length },
      { name: 'Gratuito', value: freeUsers > 0 ? freeUsers : 0 },
    ].filter(d => d.value > 0);

    // Insights
    const insights: string[] = [];
    if (annual.length > monthly.length) insights.push('Plano anual está convertendo melhor que o mensal');
    if (monthly.length > annual.length) insights.push('Considere promover mais o plano anual para aumentar retenção');
    const expiringSoon = subs.filter(s => {
      if (!s.premium_expires_at || !s.is_premium) return false;
      const diff = new Date(s.premium_expires_at).getTime() - now.getTime();
      return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000;
    }).length;
    if (expiringSoon > 0) insights.push(`${expiringSoon} assinatura(s) vencendo esta semana`);
    if (conversionRate > 10) insights.push(`Taxa de conversão de ${conversionRate.toFixed(1)}% — acima da média`);

    return {
      mrr, arr, totalRevenue, activeSubs: activeSubs.length, monthly: monthly.length,
      annual: annual.length, expired: expired.length, conversionRate, freeUsers,
      revenueChartData, subsChartData, planBreakdown, insights, totalUsers,
    };
  }, [subs, payments, totalUsers]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Admin — Métricas SaaS
          </h1>
          <p className="text-sm text-muted-foreground">Visão geral de receita e crescimento</p>
        </div>
        <Button variant="ghost" size="icon" onClick={load}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Revenue KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: 'MRR', value: `R$ ${metrics.mrr.toFixed(2).replace('.', ',')}`, icon: DollarSign, color: 'text-emerald-400' },
          { label: 'ARR', value: `R$ ${metrics.arr.toFixed(2).replace('.', ',')}`, icon: TrendingUp, color: 'text-primary' },
          { label: 'Receita Total', value: `R$ ${metrics.totalRevenue.toFixed(2).replace('.', ',')}`, icon: DollarSign, color: 'text-gold' },
          { label: 'Assinantes Ativos', value: metrics.activeSubs, icon: Users, color: 'text-cyan-400' },
          { label: 'Usuários Total', value: metrics.totalUsers, icon: Users, color: 'text-muted-foreground' },
          { label: 'Conversão', value: `${metrics.conversionRate.toFixed(1)}%`, icon: ArrowUpRight, color: 'text-emerald-400' },
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
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
                  formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Receita']}
                />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
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
                  <Pie
                    data={metrics.planBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={65}
                    dataKey="value"
                    stroke="none"
                  >
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

      {/* New Subs Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="h-4 w-4 text-emerald-400" />
            Novos Assinantes por Mês
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.subsChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
                />
                <Bar dataKey="value" fill="hsl(var(--emerald))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
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
    </div>
  );
}
