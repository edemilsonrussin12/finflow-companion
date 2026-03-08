import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function usePremiumStatus() {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsPremium(false);
      setLoading(false);
      return;
    }

    async function check() {
      const { data } = await supabase
        .from('user_subscriptions')
        .select('is_premium, premium_expires_at')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (data?.is_premium) {
        // If lifetime (no expiry) or not yet expired
        if (!data.premium_expires_at || new Date(data.premium_expires_at) > new Date()) {
          setIsPremium(true);
        } else {
          setIsPremium(false);
        }
      } else {
        setIsPremium(false);
      }
      setLoading(false);
    }

    check();
  }, [user]);

  return { isPremium, loading };
}
