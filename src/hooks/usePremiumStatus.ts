import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface TrialInfo {
  isOnTrial: boolean;
  trialEndAt: Date | null;
  daysRemaining: number;
}

export function usePremiumStatus() {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [trial, setTrial] = useState<TrialInfo>({ isOnTrial: false, trialEndAt: null, daysRemaining: 0 });

  const check = useCallback(async () => {
    if (!user) {
      setIsPremium(false);
      setTrial({ isOnTrial: false, trialEndAt: null, daysRemaining: 0 });
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
      setTrial({ isOnTrial: false, trialEndAt: null, daysRemaining: 0 });
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('user_subscriptions')
      .select('is_premium, premium_expires_at, plan_type, trial_start_at, trial_end_at, trial_used')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!data) {
      setIsPremium(false);
      setTrial({ isOnTrial: false, trialEndAt: null, daysRemaining: 0 });
      setLoading(false);
      return;
    }

    const now = new Date();

    // Check paid premium first (paid always takes priority over trial)
    if (data.is_premium && data.plan_type && data.plan_type !== 'trial') {
      if (!data.premium_expires_at || new Date(data.premium_expires_at) > now) {
        setIsPremium(true);
        setTrial({ isOnTrial: false, trialEndAt: null, daysRemaining: 0 });
        setLoading(false);
        return;
      }
      // Paid premium expired
      setIsPremium(false);
      await supabase
        .from('user_subscriptions')
        .update({ is_premium: false, updated_at: now.toISOString() })
        .eq('user_id', user.id);
    }

    // Check trial
    if (data.trial_used && data.trial_end_at) {
      const trialEnd = new Date(data.trial_end_at);
      if (trialEnd > now) {
        const daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        setIsPremium(true);
        setTrial({ isOnTrial: true, trialEndAt: trialEnd, daysRemaining });
        setLoading(false);
        return;
      }
      // Trial expired — ensure is_premium is false if plan_type is trial
      if (data.plan_type === 'trial' && data.is_premium) {
        await supabase
          .from('user_subscriptions')
          .update({ is_premium: false, updated_at: now.toISOString() })
          .eq('user_id', user.id);
      }
    }

    // Fallback: check generic is_premium (backwards compat)
    if (data.is_premium) {
      if (!data.premium_expires_at || new Date(data.premium_expires_at) > now) {
        setIsPremium(true);
        setTrial({ isOnTrial: false, trialEndAt: null, daysRemaining: 0 });
        setLoading(false);
        return;
      }
      await supabase
        .from('user_subscriptions')
        .update({ is_premium: false, updated_at: now.toISOString() })
        .eq('user_id', user.id);
    }

    setIsPremium(false);
    setTrial({ isOnTrial: false, trialEndAt: null, daysRemaining: 0 });
    setLoading(false);
  }, [user]);

  useEffect(() => {
    check();
    const onFocus = () => check();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [check]);

  return { isPremium, loading, recheck: check, trial };
}
