import { useState, useEffect } from 'react';
import { Trophy, Lock } from 'lucide-react';
import { useFinance } from '@/contexts/FinanceContext';
import { useGoals } from '@/contexts/GoalsContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useAchievements } from '@/hooks/useAchievements';
import AchievementCard from '@/components/AchievementCard';

export default function Conquistas() {
  const { transactions, selectedMonth } = useFinance();
  const { goals } = useGoals();
  const { user } = useAuth();
  const [referralCode, setReferralCode] = useState('');

  useEffect(() => {
    if (!user) return;
    supabase
      .from('referral_codes')
      .select('code')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.code) setReferralCode(data.code);
      });
  }, [user]);

  const achievements = useAchievements({ transactions, goals, selectedMonth });
  const unlocked = achievements.filter(a => a.unlocked);
  const locked = achievements.filter(a => !a.unlocked);

  return (
    <div className="page-container pt-6 pb-24 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Trophy size={28} className="text-primary" />
        </div>
        <h1 className="text-xl font-bold">Suas Conquistas</h1>
        <p className="text-sm text-muted-foreground">
          Compartilhe seu progresso financeiro e inspire outras pessoas.
        </p>
      </div>

      {/* Stats */}
      <div className="glass rounded-2xl p-4 flex items-center justify-around">
        <div className="text-center">
          <p className="text-2xl font-bold text-primary">{unlocked.length}</p>
          <p className="text-[10px] text-muted-foreground">Desbloqueadas</p>
        </div>
        <div className="w-px h-10 bg-border/50" />
        <div className="text-center">
          <p className="text-2xl font-bold text-muted-foreground">{locked.length}</p>
          <p className="text-[10px] text-muted-foreground">Bloqueadas</p>
        </div>
        <div className="w-px h-10 bg-border/50" />
        <div className="text-center">
          <p className="text-2xl font-bold text-foreground">{achievements.length}</p>
          <p className="text-[10px] text-muted-foreground">Total</p>
        </div>
      </div>

      {/* Unlocked achievements */}
      {unlocked.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm font-semibold flex items-center gap-2">
            <Trophy size={16} className="text-primary" />
            Conquistas desbloqueadas
          </p>
          {unlocked.map(a => (
            <AchievementCard key={a.id} achievement={a} referralCode={referralCode} />
          ))}
        </div>
      )}

      {/* Locked achievements */}
      {locked.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold flex items-center gap-2">
            <Lock size={16} className="text-muted-foreground" />
            Próximos desafios
          </p>
          {locked.map(a => (
            <AchievementCard key={a.id} achievement={a} referralCode={referralCode} />
          ))}
        </div>
      )}
    </div>
  );
}
