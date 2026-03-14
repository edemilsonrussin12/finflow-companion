import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Users, Loader2, Trash2, Pencil, Phone, Mail, MapPin, FileText } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import ConfirmDialog from '@/components/ConfirmDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';

interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
  created_at: string;
}

const emptyClient = { name: '', phone: '', email: '', address: '', notes: '' };

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

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', user.id)
      .order('name');
    setClients((data as Client[]) ?? []);
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

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  return (
    <div className="px-4 pt-6 pb-24 max-w-lg mx-auto space-y-5 animate-fade-in">
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
          {filtered.map(c => (
            <div key={c.id} className="glass rounded-2xl p-4 space-y-2">
              <div className="flex items-start justify-between">
                <p className="text-sm font-semibold">{c.name}</p>
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
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 text-xs w-full"
                onClick={() => navigate('/orcamentos')}
              >
                <FileText size={14} /> Criar orçamento
              </Button>
            </div>
          ))}
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
