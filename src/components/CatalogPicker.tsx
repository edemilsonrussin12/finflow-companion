import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Package, Search, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

interface CatalogItem {
  id: string;
  item_name: string;
  photo_url: string;
  description: string;
  default_price: number;
  default_quantity: number;
  category: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (item: { description: string; quantity: number; unit_price: number }) => void;
}

export default function CatalogPicker({ open, onOpenChange, onSelect }: Props) {
  const { user } = useAuth();
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!open || !user) return;
    setLoading(true);
    supabase
      .from('catalog_items')
      .select('*')
      .eq('user_id', user.id)
      .order('item_name')
      .then(({ data }) => {
        setItems((data as CatalogItem[]) ?? []);
        setLoading(false);
      });
  }, [open, user]);

  const filtered = items.filter(i =>
    !search || i.item_name.toLowerCase().includes(search.toLowerCase())
  );

  function handleSelect(item: CatalogItem) {
    onSelect({
      description: item.item_name + (item.description ? ` - ${item.description}` : ''),
      quantity: item.default_quantity,
      unit_price: item.default_price,
    });
    onOpenChange(false);
    setSearch('');
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package size={18} /> Selecionar do Catálogo
          </DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-8 h-9 text-sm"
            placeholder="Buscar item..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-primary" size={24} />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {items.length === 0 ? 'Nenhum item no catálogo.' : 'Nenhum item encontrado.'}
            </p>
          ) : (
            filtered.map(item => (
              <button
                key={item.id}
                onClick={() => handleSelect(item)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/60 transition-colors text-left"
              >
                {item.photo_url ? (
                  <img src={item.photo_url} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <ImageIcon size={16} className="text-muted-foreground/40" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.item_name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {item.category}
                    </span>
                    <span className="text-xs font-semibold text-primary">
                      R$ {Number(item.default_price).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        <Button variant="outline" className="w-full" onClick={() => onOpenChange(false)}>
          Cancelar
        </Button>
      </DialogContent>
    </Dialog>
  );
}
