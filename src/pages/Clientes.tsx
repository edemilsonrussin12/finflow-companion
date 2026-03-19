import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Users, Loader2, Trash2, Pencil, Phone, Mail, MapPin, FileText, Eye } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import ConfirmDialog from '@/components/ConfirmDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '@/lib/format';
import { format } from 'date-fns';

interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
  created_at: string;
}

interface ClientBudget {
  id: string;
  client_name: string;
  total: number;
  status: string;
  quote_number: number;
  created_at: string;
}

const emptyClient = { name: '', phone: '', email: '', address: '', notes: '' };

const statusLabel: Record<string, string> = {
  draft: 'Rascunho', sent: 'Enviado', approved: 'Aprovado',
  rejected: 'Rejeitado', paid: 'Pago', waiting: 'Aguardando',
};
const statusColor: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground', sent: 'bg-primary/10 text-primary',
  waiting: 'bg-gold/10 text-gold', approved: 'bg-emerald-500/10 text-emerald-400',
  rejected: 'bg-expense/10 text-expense', paid: 'bg-emerald-500/10 text-emerald-400',
};

export default function Clientes() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Partial<Client> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [expandedClient, setExpandedClient] = useState<string | null>(null);
  const [clientBudgets, setClientBudgets] = useState<Record<string, ClientBudget[]>>({});
  const [clientTotals, setClientTotals] = useState<Record<string, number>>({});

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [{ data: cData }, { data: bData }] = await Promise.all([
      supabase.from('clients').select('*').eq('user_id', user.id).order('name'),
      supabase.from('budgets').select('id, client_id, client_name, total, status, quote_number, created_at')
        .eq('user_id', user.id).order('created_at', { ascending: false }),
    ]);
    setClients((cData as Client[]) ?? []);

    // Map budgets to clients
    const budgetMap: Record<string, ClientBudget[]> = {};
    const totalMap: Record<string, number> = {};
    ((bData as any[]) ?? []).forEach(b => {
      if (b.client_id) {
        if (!budgetMap[b.client_id]) budgetMap[b.client_id] = [];
        budgetMap[b.client_id].push(b);
        totalMap[b.client_id] = (totalMap[b.client_id] || 0) + Number(b.total);
      }
    });
    setClientBudgets(budgetMap);
    setClientTotals(totalMap);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  function openNew() {
    setEditingClient(emptyClient);
    setIsNew(true);
    setEditOpen(true);
  }

  function openEdit(c: Client) {
    setEditingClient({ ...c });
    setIsNew(false);
    setEditOpen(true);
  }

  async function handleSave() {
    if (!user || !editingClient?.name?.trim()) return;
    setSaving(true);
    if (isNew) {
      await supabase.from('clients').insert({
        user_id: user.id,
        name: editingClient.name,
        phone: editingClient.phone || '',
        email: editingClient.email || '',
        address: editingClient.address || '',
        notes: editingClient.notes || '',
      });
    } else {
      await supabase.from('clients').update({
        name: editingClient.name,
        phone: editingClient.phone || '',
        email: editingClient.email || '',
        address: editingClient.address || '',
        notes: editingClient.notes || '',
        updated_at: new Date().toISOString(),
      }).eq('id', editingClient.id!);
    }
    setSaving(false);
    setEditOpen(false);
    toast({ title: isNew ? 'Cliente adicionado!' : 'Cliente atualizado!' });
    load();
  }

  async function confirmDelete() {
    if (!deletingId) return;
    await supabase.from('clients').delete().eq('id', deletingId);
    setClients(c => c.filter(x => x.id !== deletingId));
    toast({ title: 'Cliente excluído' });
    setDeletingId(null);
  }

  async function createBudgetForClient(client: Client) {
    if (!user) return;
    const { data, error } = await supabase
      .from('budgets')
      .insert({
        user_id: user.id,
        client_name: client.name,
        client_contact: client.phone || client.email || '',
        client_id: client.id,
        service_description: '',
        notes: '',
      } as any)
      .select('id')
      .single();
    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao criar orçamento' });
      return;
    }
    navigate('/orcamentos', { state: { editBudgetId: data.id } });
  }

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || '').includes(search)
  );

  return (
    <div className="page-container pt-6 pb-24 space-y-5 animate-fade-in">
      <div className="text-center space-y-2">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Users size={28} className="text-primary" />
        </div>
        <h1 className="text-xl font-bold">Clientes</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie seus clientes e histórico de orçamentos.
        </p>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Buscar cliente..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1"
        />
        <Button onClick={openNew} className="gap-2 shrink-0">
          <Plus size={16} /> Novo
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-primary" size={28} />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Nenhum cliente cadastrado"
          message="Adicione seus clientes para criar orçamentos mais rápido."
          actionLabel="Adicionar cliente"
          onAction={openNew}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map(c => {
            const budgets = clientBudgets[c.id] || [];
            const totalNegociado = clientTotals[c.id] || 0;
            const isExpanded = expandedClient === c.id;

            return (
              <div key={c.id} className="glass rounded-2xl p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{c.name}</p>
                    {totalNegociado > 0 && (
                      <p className="text-[10px] text-primary font-medium">
                        Total negociado: {formatCurrency(totalNegociado)}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEdit(c)}>
                      <Pencil size={14} />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => setDeletingId(c.id)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
                <div className="space-y-1">
                  {c.phone && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Phone size={12} /> {c.phone}
                    </div>
                  )}
                  {c.email && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Mail size={12} /> {c.email}
                    </div>
                  )}
                  {c.address && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin size={12} /> {c.address}
                    </div>
                  )}
                </div>

                {/* Budget history */}
                {budgets.length > 0 && (
                  <div className="pt-1">
                    <button
                      onClick={() => setExpandedClient(isExpanded ? null : c.id)}
                      className="text-[11px] text-primary hover:underline"
                    >
                      {isExpanded ? 'Ocultar' : `Ver ${budgets.length} orçamento${budgets.length > 1 ? 's' : ''}`}
                    </button>
                    {isExpanded && (
                      <div className="mt-2 space-y-1.5">
                        {budgets.slice(0, 5).map(b => (
                          <div key={b.id} className="flex items-center justify-between bg-muted/30 rounded-lg px-3 py-2">
                            <div className="min-w-0">
                              <p className="text-[11px] font-medium">#{String(b.quote_number).padStart(5, '0')}</p>
                              <p className="text-[10px] text-muted-foreground">
                                {b.created_at ? format(new Date(b.created_at), 'dd/MM/yyyy') : '—'}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${statusColor[b.status] || statusColor.draft}`}>
                                {statusLabel[b.status] || b.status}
                              </span>
                              <span className="text-[11px] font-bold text-primary">{formatCurrency(Number(b.total))}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 text-xs w-full"
                  onClick={() => createBudgetForClient(c)}
                >
                  <FileText size={14} /> Criar orçamento
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit/Create Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{isNew ? 'Novo Cliente' : 'Editar Cliente'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Nome *</label>
              <Input
                value={editingClient?.name || ''}
                onChange={e => setEditingClient(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nome do cliente"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Telefone</label>
              <Input
                value={editingClient?.phone || ''}
                onChange={e => setEditingClient(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="(00) 00000-0000"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Email</label>
              <Input
                type="email"
                value={editingClient?.email || ''}
                onChange={e => setEditingClient(prev => ({ ...prev, email: e.target.value }))}
                placeholder="email@exemplo.com"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Endereço</label>
              <Input
                value={editingClient?.address || ''}
                onChange={e => setEditingClient(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Rua, número, cidade"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Observações</label>
              <Textarea
                value={editingClient?.notes || ''}
                onChange={e => setEditingClient(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Notas sobre o cliente..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving || !editingClient?.name?.trim()}>
              {saving ? <Loader2 size={14} className="animate-spin" /> : isNew ? 'Adicionar' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deletingId}
        onOpenChange={open => { if (!open) setDeletingId(null); }}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
