import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePremiumStatus } from '@/hooks/usePremiumStatus';
import { supabase } from '@/integrations/supabase/client';

export interface UsageLimits {
  orcamentos_criados_mes: number;
  metas_criadas_mes: number;
  pdfs_gerados_mes: number;
}

const FREE_LIMITS = {
  orcamentos: 3,
  metas: 3,
  pdfs: 1,
};

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
}

export function useUsageLimits() {
  const { user } = useAuth();
  const { isPremium } = usePremiumStatus();
  const [usage, setUsage] = useState<UsageLimits>({ orcamentos_criados_mes: 0, metas_criadas_mes: 0, pdfs_gerados_mes: 0 });
  const [loading, setLoading] = useState(true);

  const mesRef = getCurrentMonth();

  const loadUsage = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('user_usage_limits' as any)
      .select('orcamentos_criados_mes, metas_criadas_mes, pdfs_gerados_mes')
      .eq('user_id', user.id)
      .eq('mes_referencia', mesRef)
      .maybeSingle();

    if (data) {
      setUsage(data as any);
    } else {
      setUsage({ orcamentos_criados_mes: 0, metas_criadas_mes: 0, pdfs_gerados_mes: 0 });
    }
    setLoading(false);
  }, [user, mesRef]);

  useEffect(() => { loadUsage(); }, [loadUsage]);

  const increment = useCallback(async (field: 'orcamentos_criados_mes' | 'metas_criadas_mes' | 'pdfs_gerados_mes') => {
    if (!user) return;
    // Use SECURITY DEFINER RPC - server-side only increment
    await supabase.rpc('increment_usage_counter' as any, { _field: field });
    // Reload to get accurate server-side values
    await loadUsage();
  }, [user, loadUsage]);

  const canCreateOrcamento = isPremium || usage.orcamentos_criados_mes < FREE_LIMITS.orcamentos;
  const canCreateMeta = isPremium || usage.metas_criadas_mes < FREE_LIMITS.metas;
  const canGeneratePdf = isPremium || usage.pdfs_gerados_mes < FREE_LIMITS.pdfs;

  return {
    usage,
    loading,
    isPremium,
    canCreateOrcamento,
    canCreateMeta,
    canGeneratePdf,
    incrementOrcamento: () => increment('orcamentos_criados_mes'),
    incrementMeta: () => increment('metas_criadas_mes'),
    incrementPdf: () => increment('pdfs_gerados_mes'),
    reload: loadUsage,
    limits: FREE_LIMITS,
  };
}
