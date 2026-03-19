import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  if (!deferredPrompt || dismissed) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-50 max-w-lg md:max-w-3xl mx-auto glass rounded-2xl p-4 flex items-center gap-3 border border-border/50 animate-fade-in">
      <div className="p-2 rounded-xl bg-primary/10">
        <Download size={20} className="text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">Instalar FinControl</p>
        <p className="text-xs text-muted-foreground">Acesse direto da tela inicial</p>
      </div>
      <Button size="sm" onClick={handleInstall} className="shrink-0">
        Instalar
      </Button>
      <button onClick={() => setDismissed(true)} className="text-muted-foreground hover:text-foreground p-1">
        <X size={16} />
      </button>
    </div>
  );
}
