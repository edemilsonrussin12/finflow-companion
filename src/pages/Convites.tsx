import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Copy, Share2, MessageCircle, Users, Gift, Crown, CheckCircle2, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ReferralData {
  code: string;
  isPremium: boolean;
  successfulReferrals: number;
}

function generateSecureCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const array = new Uint8Array(8);
  crypto.getRandomValues(array);
  return Array.from(array, b => chars[b % chars.length]).join('');
}

export default function Convites() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const referralLink = useMemo(() => {
    if (!data?.code) return '';
    return `${baseUrl}/cadastro?ref=${data.code}`;
  }, [data?.code, baseUrl]);

  useEffect(() => {
    if (!user) return;
    loadReferralData();
  }, [user]);

  async function loadReferralData() {
    if (!user) return;
    setLoading(true);

    try {
      let { data: codeRow } = await supabase
        .from('referral_codes')
        .select('code')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!codeRow) {
        const code = generateSecureCode();
        const { data: inserted } = await supabase
          .from('referral_codes')
          .insert({ user_id: user.id, code })
          .select('code')
          .single();
        codeRow = inserted;
      }

      let { data: subRow } = await supabase
        .from('user_subscriptions')
        .select('is_premium')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!subRow) {
        await supabase
          .from('user_subscriptions')
          .insert({ user_id: user.id, is_premium: false });
        subRow = { is_premium: false };
      }

      const { count } = await supabase
        .from('referrals')
        .select('*', { count: 'exact', head: true })
        .eq('referrer_id', user.id)
        .eq('status', 'reward_granted');

      setData({
        code: codeRow?.code ?? '',
        isPremium: subRow?.is_premium ?? false,
        successfulReferrals: count ?? 0,
      });
    } catch (err) {
      console.error('Error loading referral data:', err);
    } finally {
      setLoading(false);
    }
  }

  const target = data?.isPremium ? 3 : 5;
  const current = data?.successfulReferrals ?? 0;
  const progress = Math.min(100, Math.round((current / target) * 100));
  const rewardUnlocked = current >= target;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(referralLink);
      toast({ title: 'Link copiado!', description: 'Compartilhe com seus amigos.' });
    } catch {
      toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível copiar.' });
    }
  }

  function shareWhatsApp() {
    const text = encodeURIComponent(
      `Estou usando o FinControl para organizar minhas finanças e está me ajudando muito.\n\nControle seus gastos, acompanhe metas e tenha mais clareza sobre seu dinheiro.\n\nCrie sua conta gratuita:\n${referralLink}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  }

  async function shareNative() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'FinControl - Gestão Financeira Inteligente',
          text: 'Conheça o FinControl, seu parceiro financeiro pessoal. Organize seus gastos, acompanhe metas e tenha mais controle do seu dinheiro.',
          url: referralLink,
        });
      } catch { /* user cancelled */ }
    } else {
      copyLink();
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="page-container pt-6 pb-24 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Users size={28} className="text-primary" />
        </div>
        <h1 className="text-xl font-bold">Convide amigos e evoluam juntos</h1>
        <p className="text-sm text-muted-foreground">
          Ajude outras pessoas a organizar suas finanças e construa patrimônio juntos.
        </p>
      </div>

      {/* Tier badge */}
      <div className="glass rounded-2xl p-4 flex items-center gap-3">
        <div className={`p-2.5 rounded-xl ${data?.isPremium ? 'bg-yellow-500/10' : 'bg-primary/10'}`}>
          {data?.isPremium ? <Crown size={20} className="text-yellow-500" /> : <Gift size={20} className="text-primary" />}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold">{data?.isPremium ? 'Usuário Premium' : 'Usuário Gratuito'}</p>
          <p className="text-xs text-muted-foreground">
            {data?.isPremium
              ? 'Convide 3 amigos premium e ganhe +1 mês'
              : 'Convide 5 amigos premium e desbloqueie 1 mês'}
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="glass rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-primary" />
          <p className="text-sm font-medium">Seu progresso de convites</p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">{current} / {target} amigos convertidos</span>
            <span className="font-medium text-primary">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2.5" />
        </div>

        {rewardUnlocked && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/10 border border-primary/20">
            <CheckCircle2 size={16} className="text-primary shrink-0" />
            <p className="text-xs font-medium text-primary">
              Parabéns! Você desbloqueou sua recompensa! 🎉
            </p>
          </div>
        )}

        {/* Referral milestones */}
        <div className="flex items-center justify-between pt-2">
          {Array.from({ length: target }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                i < current
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}>
                {i < current ? '✓' : i + 1}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How reward works */}
      <div className="glass rounded-2xl p-5 space-y-3">
        <p className="text-sm font-medium">Como a recompensa funciona</p>
        <div className="space-y-3">
          {[
            { step: '1', text: 'Compartilhe seu link de convite com amigos' },
            { step: '2', text: 'Seu amigo se cadastra e confirma o email' },
            { step: '3', text: 'Seu amigo assina o plano Premium e paga' },
            { step: '4', text: `Ao atingir ${target} amigos premium, você ganha 1 mês grátis` },
          ].map(item => (
            <div key={item.step} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-primary">{item.step}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Share actions */}
      <div className="glass rounded-2xl p-5 space-y-3">
        <p className="text-sm font-medium">Compartilhe seu convite</p>

        <div className="p-3 rounded-xl bg-muted/50 border border-border/50">
          <p className="text-xs text-muted-foreground mb-1">Seu link de convite</p>
          <p className="text-sm font-mono break-all text-foreground">{referralLink}</p>
        </div>

        <div className="grid grid-cols-1 gap-2">
          <Button onClick={copyLink} variant="outline" className="w-full justify-start gap-3">
            <Copy size={16} />
            Copiar link de convite
          </Button>
          <Button onClick={shareWhatsApp} className="w-full justify-start gap-3 bg-income hover:bg-income/90 text-income-foreground">
            <MessageCircle size={16} />
            Compartilhar via WhatsApp
          </Button>
          <Button onClick={shareNative} variant="outline" className="w-full justify-start gap-3">
            <Share2 size={16} />
            Compartilhar
          </Button>
        </div>
      </div>
    </div>
  );
}
