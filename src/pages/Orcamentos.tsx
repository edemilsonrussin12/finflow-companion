import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Plus, FileText, Loader2, Trash2, Eye } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import BudgetEditor from '@/components/BudgetEditor';
import ConfirmDialog from '@/components/ConfirmDialog';
import { format } from 'date-fns';

export interface Budget {
  id: string;
  client_name: string;
  client_contact: string;
  service_description: string;
  date: string;
  notes: string;
  status: string;
  total: number;
  quote_number: number;
  created_at: string;
}

export default function Orcamentos() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setBudgets((data as Budget[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  async function createBudget() {
    if (!user) return;
    const { data, error } = await supabase
      .from('budgets')
      .insert({ user_id: user.id, client_name: '', service_description: '', notes: '' })
      .select('id')
      .single();
    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao criar orçamento' });
      return;
    }
    setEditingId(data.id);
    setCreating(true);
  }

  async function confirmDeleteBudget() {
    if (!deletingId) return;
    await supabase.from('budgets').delete().eq('id', deletingId);
    setBudgets(b => b.filter(x => x.id !== deletingId));
    toast({ title: 'Orçamento excluído' });
    setDeletingId(null);
  }

  function handleClose() {
    setEditingId(null);
    setCreating(false);
    load();
  }

  const statusLabel: Record<string, string> = {
    draft: 'Rascunho',
    sent: 'Enviado',
    paid: 'Pago',
  };

  const statusColor: Record<string, string> = {
    draft: 'bg-muted text-muted-foreground',
    sent: 'bg-primary/10 text-primary',
    paid: 'bg-emerald-500/10 text-emerald-400',
  };

  if (editingId) {
    return <BudgetEditor budgetId={editingId} onClose={handleClose} />;
  }

  return (
    <div className="px-4 pt-6 pb-24 max-w-lg mx-auto space-y-5 animate-fade-in">
      <div className="text-center space-y-2">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
          <FileText size={28} className="text-primary" />
        </div>
        <h1 className="text-xl font-bold">Orçamentos</h1>
        <p className="text-sm text-muted-foreground">
          Crie orçamentos profissionais para seus serviços.
        </p>
      </div>

      <Button onClick={createBudget} className="w-full gap-2">
        <Plus size={16} /> Novo Orçamento
      </Button>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-primary" size={28} />
        </div>
      ) : budgets.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Crie seu primeiro orçamento profissional"
          message="Organize seus serviços, gere PDFs e envie para clientes pelo WhatsApp."
          actionLabel="Criar orçamento"
          onAction={createBudget}
        />
      ) : (
        <div className="space-y-3">
          {budgets.map(b => (
            <div key={b.id} className="glass rounded-2xl p-4 space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {b.client_name || 'Sem cliente'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {b.service_description || 'Sem descrição'}
                  </p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColor[b.status] || statusColor.draft}`}>
                  {statusLabel[b.status] || b.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                  {b.date ? format(new Date(b.date + 'T12:00:00'), 'dd/MM/yyyy') : '—'}
                </div>
                <p className="text-sm font-bold text-primary">
                  R$ {Number(b.total).toFixed(2).replace('.', ',')}
                </p>
              </div>
              <div className="flex gap-2 pt-1">
                <Button size="sm" variant="outline" className="flex-1 gap-1.5 text-xs" onClick={() => setEditingId(b.id)}>
                  <Eye size={14} /> Abrir
                </Button>
                <Button size="sm" variant="outline" className="gap-1.5 text-xs text-destructive hover:text-destructive" onClick={() => setDeletingId(b.id)}>
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deletingId}
        onOpenChange={open => { if (!open) setDeletingId(null); }}
        onConfirm={confirmDeleteBudget}
      />
    </div>
  );
}
