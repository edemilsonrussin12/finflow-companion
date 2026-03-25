import { Loader2 } from 'lucide-react';

interface AuthLoadingScreenProps {
  message?: string;
}

export default function AuthLoadingScreen({ message = 'Carregando...' }: AuthLoadingScreenProps) {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-background px-4">
      <div className="flex flex-col items-center gap-3 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}