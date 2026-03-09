import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Crown, Users, CreditCard, AlertTriangle, Loader2, CheckCircle2, XCircle, Plus, Clock, RefreshCw, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Sub {
  user_id: string;
  is_premium: boolean;
  plan_type: string | null;
  mercadopago_payment_id: string | null;
  premium_started_at: string | null;
  premium_expires_at: string | null;
  created_at: string;
  updated_at: string;
}

interface Profile {
  id: string;
  email: string | null;
  display_name: string | null;
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

export default function AdminAssinaturas() {
  const [subs, setSubs] = useState<Sub[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [actionDialog, setActionDialog] = useState<{ type: string; sub: Sub } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [paymentMode, setPaymentMode] = useState<string>('unknown');

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke('admin-subscriptions', {
      body: { action: 'list' },
    });
    if (error) {
      toast.error('Erro ao carregar dados');
      console.error(error);
    } else {
      setSubs(data.subscriptions || []);
      setProfiles(data.profiles || []);
      setPayments(data.payments || []);
      setTotalUsers(data.totalUsers || 0);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const profileMap = useMemo(() => {
    const m: Record<string, Profile> = {};
    profiles.forEach(p => { m[p.id] = p; });
    return m;
  }, [profiles]);

  const filtered = useMemo(() => {
    return subs.filter(s => {
      const now = new Date();
      const expired = s.premium_expires_at ? new Date(s.premium_expires_at) < now : false;
      switch (filter) {
        case 'monthly': return s.plan_type === 'monthly';
        case 'annual': return s.plan_type === 'annual';
        case 'active': return s.is_premium && !expired;
        case 'expired': return expired || !s.is_premium;
        default: return true;
      }
    });
  }, [subs, filter]);

  // KPIs
  const kpis = useMemo(() => {
    const now = new Date();
    const totalPremium = subs.filter(s => s.is_premium).length;
    const monthly = subs.filter(s => s.is_premium && s.plan_type === 'monthly').length;
    const annual = subs.filter(s => s.is_premium && s.plan_type === 'annual').length;
    const expired = subs.filter(s => s.premium_expires_at && new Date(s.premium_expires_at) < now).length;
    const totalPayments = payments.length;
    return { totalPremium, monthly, annual, expired, totalPayments };
  }, [subs, payments]);

  const handleAction = async (action: string, userId: string, extra?: Record<string, any>) => {
    setActionLoading(true);
    const { data, error } = await supabase.functions.invoke('admin-subscriptions', {
      body: { action, user_id: userId, ...extra },
    });
    if (error || data?.error) {
      toast.error(data?.error || 'Erro ao executar ação');
    } else {
      toast.success('Ação executada com sucesso');
      setActionDialog(null);
      load();
    }
    setActionLoading(false);
  };

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
            Admin — Assinaturas
          </h1>
          <p className="text-sm text-muted-foreground">Gerencie assinaturas de todos os usuários</p>
        </div>
        <Button variant="ghost" size="icon" onClick={load}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { label: 'Premium Total', value: kpis.totalPremium, icon: Crown, color: 'text-primary' },
          { label: 'Mensal Ativo', value: kpis.monthly, icon: CreditCard, color: 'text-emerald-400' },
          { label: 'Anual Ativo', value: kpis.annual, icon: Crown, color: 'text-gold' },
          { label: 'Expirados', value: kpis.expired, icon: AlertTriangle, color: 'text-destructive' },
          { label: 'Pagamentos', value: kpis.totalPayments, icon: CreditCard, color: 'text-cyan-400' },
        ].map((k, i) => (
          <Card key={i} className="border-border/50">
            <CardContent className="pt-4 pb-3 px-4">
              <k.icon className={`h-4 w-4 ${k.color} mb-1`} />
              <p className="text-2xl font-bold text-foreground">{k.value}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{k.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="monthly">Premium Mensal</SelectItem>
            <SelectItem value="annual">Premium Anual</SelectItem>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="expired">Expirados</SelectItem>
          </SelectContent>
        </Select>
        <Badge variant="secondary">{filtered.length} resultado(s)</Badge>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expira</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Nenhuma assinatura encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((s) => {
                    const p = profileMap[s.user_id];
                    const expired = s.premium_expires_at ? new Date(s.premium_expires_at) < new Date() : false;
                    return (
                      <TableRow key={s.user_id}>
                        <TableCell>
                          <p className="text-xs font-medium text-foreground">{p?.email || '—'}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">{s.user_id.slice(0, 8)}...</p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px]">
                            {s.plan_type === 'annual' ? 'Anual' : s.plan_type === 'monthly' ? 'Mensal' : s.plan_type || '—'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {s.is_premium && !expired ? (
                            <Badge className="text-[10px] gap-1"><CheckCircle2 className="h-3 w-3" />Ativo</Badge>
                          ) : (
                            <Badge variant="destructive" className="text-[10px] gap-1"><XCircle className="h-3 w-3" />Inativo</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {s.premium_expires_at ? format(new Date(s.premium_expires_at), 'dd/MM/yyyy') : '—'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {(!s.is_premium || expired) && (
                              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setActionDialog({ type: 'activate', sub: s })}>
                                <Plus className="h-3 w-3 mr-1" />Ativar
                              </Button>
                            )}
                            {s.is_premium && !expired && (
                              <>
                                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setActionDialog({ type: 'extend', sub: s })}>
                                  <Clock className="h-3 w-3 mr-1" />Estender
                                </Button>
                                <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive" onClick={() => setActionDialog({ type: 'expire', sub: s })}>
                                  <XCircle className="h-3 w-3 mr-1" />Expirar
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Payments */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3">Pagamentos Recentes</h2>
        <div className="space-y-2">
          {payments.slice(0, 10).map((p) => {
            const profile = profileMap[p.user_id];
            return (
              <Card key={p.id} className="border-border/50">
                <CardContent className="py-3 px-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-foreground">{profile?.email || p.user_id.slice(0, 8)}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {p.plan_type === 'annual' ? 'Anual' : 'Mensal'} • {format(new Date(p.created_at), 'dd/MM/yyyy HH:mm')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-foreground">R$ {Number(p.amount).toFixed(2).replace('.', ',')}</p>
                      <Badge variant={p.status === 'approved' ? 'default' : 'secondary'} className="text-[10px]">
                        {p.status === 'approved' ? 'Aprovado' : p.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {payments.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhum pagamento registrado</p>
          )}
        </div>
      </div>

      {/* Action Dialog */}
      <Dialog open={!!actionDialog} onOpenChange={() => setActionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog?.type === 'activate' && 'Ativar Premium'}
              {actionDialog?.type === 'extend' && 'Estender Assinatura'}
              {actionDialog?.type === 'expire' && 'Expirar Assinatura'}
            </DialogTitle>
            <DialogDescription>
              Usuário: {actionDialog?.sub && profileMap[actionDialog.sub.user_id]?.email || actionDialog?.sub?.user_id}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {actionDialog?.type === 'activate' && (
              <>
                <Select value={extendDays} onValueChange={setExtendDays}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">Mensal (30 dias)</SelectItem>
                    <SelectItem value="365">Anual (365 dias)</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  className="w-full"
                  disabled={actionLoading}
                  onClick={() => handleAction('activate', actionDialog.sub.user_id, {
                    plan_type: extendDays === '365' ? 'annual' : 'monthly',
                    days: Number(extendDays),
                  })}
                >
                  {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirmar Ativação'}
                </Button>
              </>
            )}
            {actionDialog?.type === 'extend' && (
              <>
                <Input
                  type="number"
                  value={extendDays}
                  onChange={(e) => setExtendDays(e.target.value)}
                  placeholder="Dias para estender"
                />
                <Button
                  className="w-full"
                  disabled={actionLoading}
                  onClick={() => handleAction('extend', actionDialog.sub.user_id, { days: Number(extendDays) })}
                >
                  {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : `Estender ${extendDays} dias`}
                </Button>
              </>
            )}
            {actionDialog?.type === 'expire' && (
              <Button
                variant="destructive"
                className="w-full"
                disabled={actionLoading}
                onClick={() => handleAction('expire', actionDialog.sub.user_id)}
              >
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirmar Expiração'}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
