import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Package, Loader2, Trash2, Edit2, Copy, Image as ImageIcon, Search } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import ConfirmDialog from '@/components/ConfirmDialog';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { usePremiumStatus } from '@/hooks/usePremiumStatus';
import PremiumGate from '@/components/PremiumGate';
import { AlertTriangle } from 'lucide-react';

const CATEGORIES = ['Serviços', 'Produtos', 'Peças', 'Materiais'] as const;
const FREE_CATALOG_LIMIT = 10;

interface CatalogItem {
  id: string;
  item_name: string;
  photo_url: string;
  description: string;
  default_price: number;
  default_quantity: number;
  category: string;
  created_at: string;
  updated_at: string;
}

const emptyCatalogItem: Omit<CatalogItem, 'id' | 'created_at' | 'updated_at'> = {
  item_name: '',
  photo_url: '',
  description: '',
  default_price: 0,
  default_quantity: 1,
  category: 'Serviços',
};

export default function Catalogo() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { isPremium } = usePremiumStatus();
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<Partial<CatalogItem> & typeof emptyCatalogItem>(emptyCatalogItem);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const reachedCatalogLimit = !isPremium && items.length >= FREE_CATALOG_LIMIT;

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('catalog_items')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setItems((data as CatalogItem[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  function openNew() {
    if (reachedCatalogLimit) {
      toast({ title: 'Limite atingido', description: `O plano gratuito permite até ${FREE_CATALOG_LIMIT} itens. Desbloqueie o Premium para itens ilimitados.` });
      return;
    }
    setEditItem({ ...emptyCatalogItem });
    setEditOpen(true);
  }

  function openEdit(item: CatalogItem) {
    setEditItem({ ...item });
    setEditOpen(true);
  }

  async function duplicateItem(item: CatalogItem) {
    if (!user) return;
    const { error } = await supabase.from('catalog_items').insert({
      user_id: user.id,
      item_name: `${item.item_name} (cópia)`,
      photo_url: item.photo_url,
      description: item.description,
      default_price: item.default_price,
      default_quantity: item.default_quantity,
      category: item.category,
    });
    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao duplicar' });
    } else {
      toast({ title: 'Item duplicado!' });
      load();
    }
  }

  async function handleSave() {
    if (!user || !editItem.item_name.trim()) {
      toast({ variant: 'destructive', title: 'Informe o nome do item' });
      return;
    }
    setSaving(true);
    const payload = {
      item_name: editItem.item_name,
      photo_url: editItem.photo_url || '',
      description: editItem.description || '',
      default_price: Number(editItem.default_price) || 0,
      default_quantity: Number(editItem.default_quantity) || 1,
      category: editItem.category || 'Serviços',
      updated_at: new Date().toISOString(),
    };

    if (editItem.id) {
      await supabase.from('catalog_items').update(payload).eq('id', editItem.id);
    } else {
      await supabase.from('catalog_items').insert({ ...payload, user_id: user.id });
    }
    setSaving(false);
    setEditOpen(false);
    toast({ title: editItem.id ? 'Item atualizado!' : 'Item criado!' });
    load();
  }

  async function confirmDelete() {
    if (!deletingId) return;
    await supabase.from('catalog_items').delete().eq('id', deletingId);
    setItems(prev => prev.filter(i => i.id !== deletingId));
    toast({ title: 'Item excluído' });
    setDeletingId(null);
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `${user.id}/catalog-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('business-assets').upload(path, file, { upsert: true });
    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao enviar foto' });
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from('business-assets').getPublicUrl(path);
    setEditItem(prev => ({ ...prev, photo_url: urlData.publicUrl }));
    setUploading(false);
  }

  const filtered = items.filter(i => {
    const matchesSearch = !searchQuery || i.item_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || i.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="px-4 pt-6 pb-24 max-w-lg mx-auto space-y-5 animate-fade-in">
      <div className="text-center space-y-2">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Package size={28} className="text-primary" />
        </div>
        <h1 className="text-xl font-bold">Catálogo de Itens</h1>
        <p className="text-sm text-muted-foreground">
          Salve produtos e serviços para reutilizar nos orçamentos.
        </p>
      </div>

      <Button onClick={openNew} className="w-full gap-2">
        <Plus size={16} /> Novo Item
      </Button>

      {/* Search & filter */}
      {items.length > 0 && (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-8 h-9 text-sm"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[120px] h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-primary" size={28} />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Crie seu catálogo"
          message="Adicione produtos e serviços para reutilizar em orçamentos."
          actionLabel="Adicionar item"
          onAction={openNew}
        />
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">Nenhum item encontrado.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map(item => (
            <div key={item.id} className="glass rounded-2xl overflow-hidden">
              {item.photo_url ? (
                <img src={item.photo_url} alt={item.item_name} className="w-full h-28 object-cover" />
              ) : (
                <div className="w-full h-28 bg-muted/50 flex items-center justify-center">
                  <ImageIcon size={28} className="text-muted-foreground/40" />
                </div>
              )}
              <div className="p-3 space-y-1.5">
                <p className="text-sm font-semibold truncate">{item.item_name || 'Sem nome'}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {item.category}
                  </span>
                  <span className="text-sm font-bold text-primary">
                    R$ {Number(item.default_price).toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <div className="flex gap-1 pt-1">
                  <Button size="sm" variant="ghost" className="flex-1 h-7 text-[10px]" onClick={() => openEdit(item)}>
                    <Edit2 size={12} />
                  </Button>
                  <Button size="sm" variant="ghost" className="flex-1 h-7 text-[10px]" onClick={() => duplicateItem(item)}>
                    <Copy size={12} />
                  </Button>
                  <Button size="sm" variant="ghost" className="flex-1 h-7 text-[10px] text-destructive" onClick={() => setDeletingId(item.id)}>
                    <Trash2 size={12} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit / Create Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editItem.id ? 'Editar Item' : 'Novo Item'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Nome do item *</label>
              <Input value={editItem.item_name} onChange={e => setEditItem(p => ({ ...p, item_name: e.target.value }))} placeholder="Ex: Troca de óleo" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Descrição</label>
              <Textarea value={editItem.description} onChange={e => setEditItem(p => ({ ...p, description: e.target.value }))} placeholder="Detalhes do item..." rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Preço padrão</label>
                <Input type="number" min={0} step={0.01} value={editItem.default_price} onChange={e => setEditItem(p => ({ ...p, default_price: Number(e.target.value) }))} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Quantidade padrão</label>
                <Input type="number" min={1} value={editItem.default_quantity} onChange={e => setEditItem(p => ({ ...p, default_quantity: Number(e.target.value) }))} />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Categoria</label>
              <Select value={editItem.category} onValueChange={v => setEditItem(p => ({ ...p, category: v }))}>
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Foto</label>
              <div className="flex items-center gap-3 mt-1">
                {editItem.photo_url ? (
                  <img src={editItem.photo_url} alt="" className="w-16 h-16 rounded-xl object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center">
                    <ImageIcon size={20} className="text-muted-foreground/40" />
                  </div>
                )}
                <label className="cursor-pointer">
                  <span className="text-xs text-primary font-medium">{uploading ? 'Enviando...' : 'Escolher foto'}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
                </label>
              </div>
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full gap-2">
              {saving ? <Loader2 size={14} className="animate-spin" /> : null}
              {editItem.id ? 'Salvar alterações' : 'Criar item'}
            </Button>
          </div>
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
