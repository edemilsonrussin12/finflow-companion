import { useState } from 'react';
import { Crown, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PremiumPlansDialog from '@/components/PremiumPlansDialog';
import type { TrialInfo } from '@/hooks/usePremiumStatus';

interface TrialBannerProps {
  trial: TrialInfo;
}

export default function TrialBanner({ trial }: TrialBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const [showPlans, setShowPlans] = useState(false);

  if (!trial.isOnTrial || dismissed) return null;

  const isExpiring = trial.daysRemaining <= 1;

  return (
    <>
      <div className={`mx-4 mt-2 rounded-xl p-3 flex items-center gap-3 text-sm border animate-fade-in ${
        isExpiring
          ? 'bg-destructive/10 border-destructive/30 text-destructive'
          : 'bg-primary/10 border-primary/30 text-primary'
      }`}>
        <div className="shrink-0">
          {isExpiring ? <Sparkles size={18} /> : <Crown size={18} />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-xs leading-tight">
            Você está usando o Premium em modo teste.
          </p>
          <p className="text-xs opacity-80">
            {trial.daysRemaining > 1
              ? `Restam ${trial.daysRemaining} dias.`
              : trial.daysRemaining === 1
                ? 'Expira amanhã!'
                : 'Expira hoje!'}
          </p>
        </div>
        {isExpiring && (
          <Button size="sm" variant="default" className="shrink-0 text-xs h-7 px-2" onClick={() => setShowPlans(true)}>
            Assinar
          </Button>
        )}
        <button onClick={() => setDismissed(true)} className="text-muted-foreground hover:text-foreground p-0.5 shrink-0">
          <X size={14} />
        </button>
      </div>
      <PremiumPlansDialog open={showPlans} onOpenChange={setShowPlans} />
    </>
  );
}
