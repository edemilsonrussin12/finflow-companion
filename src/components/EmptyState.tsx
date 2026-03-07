import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ icon: Icon, title, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="glass rounded-2xl p-8 text-center space-y-4 animate-fade-in">
      <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
        <Icon size={28} className="text-primary" />
      </div>
      <div className="space-y-1.5">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">{message}</p>
      </div>
      {actionLabel && onAction && (
        <Button size="sm" onClick={onAction} className="gradient-primary text-primary-foreground">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
