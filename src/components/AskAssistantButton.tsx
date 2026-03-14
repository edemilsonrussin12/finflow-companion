import { Bot } from 'lucide-react';

interface AskAssistantButtonProps {
  onClick: () => void;
}

export default function AskAssistantButton({ onClick }: AskAssistantButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-primary/10 text-primary hover:bg-primary/15 transition-colors text-sm font-medium"
    >
      <Bot size={16} />
      Perguntar ao Assistente
    </button>
  );
}
