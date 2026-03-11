import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function usePremiumStatus() {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  const check = useCallback(async () => {
    if (!user) {
      setIsPremium(false);
      setLoading(false);
      return;
    }

    // Check if user is admin (admins get premium bypass)
    const { data: roleRow } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleRow) {
      setIsPremium(true);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('user_subscriptions')
      .select('is_premium, premium_expires_at')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data?.is_premium) {
      if (!data.premium_expires_at || new Date(data.premium_expires_at) > new Date()) {
        setIsPremium(true);
      } else {
        // Auto-expire: update DB to reflect expired status
        setIsPremium(false);
        await supabase
          .from('user_subscriptions')
          .update({ is_premium: false, updated_at: new Date().toISOString() })
          .eq('user_id', user.id);
      }
    } else {
      setIsPremium(false);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    check();
    const onFocus = () => check();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [check]);

  return { isPremium, loading, recheck: check };
}
