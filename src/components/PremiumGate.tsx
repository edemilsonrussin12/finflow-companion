import { useState } from 'react';
import { Lock, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PremiumPlansDialog from '@/components/PremiumPlansDialog';

interface PremiumGateProps {
  children: React.ReactNode;
  isPremium: boolean;
  label?: string;
  className?: string;
}

/**
 * Wraps content that requires Premium access.
 * If isPremium is false, shows a lock overlay instead of the children.
 */
export default function PremiumGate({ children, isPremium, label, className = '' }: PremiumGateProps) {
  const [showPlans, setShowPlans] = useState(false);

  if (isPremium) return <>{children}</>;

  return (
    <>
      <div className={`glass rounded-2xl p-6 text-center space-y-3 ${className}`}>
        <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Lock className="h-6 w-6 text-primary" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground flex items-center justify-center gap-1.5">
            <Crown className="h-4 w-4 text-primary" />
            Recurso Premium
          </p>
          {label && <p className="text-xs text-muted-foreground">{label}</p>}
        </div>
        <Button size="sm" onClick={() => setShowPlans(true)} className="gap-1.5">
          <Lock className="h-3.5 w-3.5" />
          Desbloquear Premium
        </Button>
      </div>
      <PremiumPlansDialog open={showPlans} onOpenChange={setShowPlans} />
    </>
  );
}
