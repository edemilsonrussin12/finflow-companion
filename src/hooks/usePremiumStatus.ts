import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const ADMIN_EMAILS = ['edemilso-cardoso2@hotmail.com'];

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

    if (user.email && ADMIN_EMAILS.includes(user.email.toLowerCase())) {
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
        setIsPremium(false);
      }
    } else {
      setIsPremium(false);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    check();

    // Re-check on window focus (useful for post-payment polling)
    const onFocus = () => check();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [check]);

  return { isPremium, loading, recheck: check };
}
