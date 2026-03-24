import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { PortfolioAsset, PortfolioDividend } from '@/types/portfolio';
import { toast } from 'sonner';

export function usePortfolio() {
  const { user } = useAuth();
  const [assets, setAssets] = useState<PortfolioAsset[]>([]);
  const [dividends, setDividends] = useState<PortfolioDividend[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [aRes, dRes] = await Promise.all([
      supabase.from('portfolio_assets').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('portfolio_dividends').select('*').eq('user_id', user.id).order('received_date', { ascending: false }),
    ]);
    if (aRes.data) setAssets(aRes.data as unknown as PortfolioAsset[]);
    if (dRes.data) setDividends(dRes.data as unknown as PortfolioDividend[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const addAsset = async (data: Omit<PortfolioAsset, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;
    const { error } = await supabase.from('portfolio_assets').insert({ ...data, user_id: user.id } as any);
    if (error) { toast.error('Erro ao adicionar ativo'); return; }
    toast.success('Ativo adicionado');
    fetchData();
  };

  const updateAsset = async (id: string, data: Partial<PortfolioAsset>) => {
    if (!user) return;
    const { error } = await supabase.from('portfolio_assets').update({ ...data, updated_at: new Date().toISOString() } as any).eq('id', id).eq('user_id', user.id);
    if (error) { toast.error('Erro ao atualizar ativo'); return; }
    toast.success('Ativo atualizado');
    fetchData();
  };

  const deleteAsset = async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from('portfolio_assets').delete().eq('id', id).eq('user_id', user.id);
    if (error) { toast.error('Erro ao excluir ativo'); return; }
    toast.success('Ativo excluído');
    fetchData();
  };

  const addDividend = async (data: Omit<PortfolioDividend, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return;
    const { error } = await supabase.from('portfolio_dividends').insert({ ...data, user_id: user.id } as any);
    if (error) { toast.error('Erro ao adicionar rendimento'); return; }
    toast.success('Rendimento adicionado');
    fetchData();
  };

  const updateDividend = async (id: string, data: Partial<PortfolioDividend>) => {
    if (!user) return;
    const { error } = await supabase.from('portfolio_dividends').update(data as any).eq('id', id).eq('user_id', user.id);
    if (error) { toast.error('Erro ao atualizar rendimento'); return; }
    toast.success('Rendimento atualizado');
    fetchData();
  };

  const deleteDividend = async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from('portfolio_dividends').delete().eq('id', id).eq('user_id', user.id);
    if (error) { toast.error('Erro ao excluir rendimento'); return; }
    toast.success('Rendimento excluído');
    fetchData();
  };

  return { assets, dividends, loading, addAsset, updateAsset, deleteAsset, addDividend, updateDividend, deleteDividend, refetch: fetchData };
}
