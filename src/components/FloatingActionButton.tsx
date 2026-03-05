import { Plus } from 'lucide-react';

interface Props {
  onClick: () => void;
}

export default function FloatingActionButton({ onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-20 right-4 z-50 w-14 h-14 rounded-full gradient-primary flex items-center justify-center fab-shadow transition-transform hover:scale-105 active:scale-95"
      aria-label="Adicionar transação"
    >
      <Plus size={24} className="text-primary-foreground" />
    </button>
  );
}
