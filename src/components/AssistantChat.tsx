import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, Bot, User, Loader2 } from 'lucide-react';
import { useFinance } from '@/contexts/FinanceContext';
import { useGoals } from '@/contexts/GoalsContext';
import { getCategoryById } from '@/lib/categories';
import { usePremiumStatus } from '@/hooks/usePremiumStatus';
import ReactMarkdown from 'react-markdown';

const FREE_DAILY_QUESTIONS = 5;

type Msg = { role: 'user' | 'assistant'; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fincontrol-chat`;

const QUICK_QUESTIONS = [
  'Como montar uma reserva de emergência?',
  'Analise meus gastos deste mês',
  'O que são juros compostos?',
];

interface AssistantChatProps {
  open: boolean;
  onClose: () => void;
}

export default function AssistantChat({ open, onClose }: AssistantChatProps) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { transactions, sales, selectedMonth } = useFinance();
  const { goals } = useGoals();
  const { isPremium } = usePremiumStatus();

  // Daily question limiter for free users
  const getDailyCount = useCallback(() => {
    const today = new Date().toISOString().slice(0, 10);
    const key = `fincontrol_chat_${today}`;
    return parseInt(localStorage.getItem(key) || '0', 10);
  }, []);

  const incrementDailyCount = useCallback(() => {
    const today = new Date().toISOString().slice(0, 10);
    const key = `fincontrol_chat_${today}`;
    const current = parseInt(localStorage.getItem(key) || '0', 10);
    localStorage.setItem(key, String(current + 1));
  }, []);

  const dailyCount = getDailyCount();
  const reachedDailyLimit = !isPremium && dailyCount >= FREE_DAILY_QUESTIONS;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  const getFinancialContext = useCallback(() => {
    const monthTx = transactions.filter(t => t.date.startsWith(selectedMonth));
    const income = monthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const investment = monthTx.filter(t => t.type === 'investment').reduce((s, t) => s + t.amount, 0);
    const revenue = sales.filter(s => s.date.startsWith(selectedMonth)).reduce((s, v) => s + v.totalValue, 0);

    // Top expense categories
    const catMap: Record<string, number> = {};
    monthTx.filter(t => t.type === 'expense').forEach(t => {
      const cat = getCategoryById(t.category);
      const name = cat?.name ?? t.category;
      catMap[name] = (catMap[name] || 0) + t.amount;
    });
    const topCategories = Object.entries(catMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value]) => ({ name, value }));

    const activeGoals = goals.filter(g => g.status === 'active').map(g => ({
      title: g.title,
      target: g.targetAmount,
      current: g.currentAmount,
      pct: Math.round((g.currentAmount / g.targetAmount) * 100),
    }));

    // Patrimony (all-time accumulation)
    const allIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const allExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const allInvestment = transactions.filter(t => t.type === 'investment').reduce((s, t) => s + t.amount, 0);
    const allRevenue = sales.reduce((s, v) => s + v.totalValue, 0);
    const patrimonio = allIncome + allRevenue - allExpense;

    // Course progress from localStorage
    let courseProgress: any = null;
    try {
      const raw = localStorage.getItem('fincontrol_lesson_progress');
      if (raw) courseProgress = JSON.parse(raw);
    } catch { /* ignore */ }

    return {
      mes: selectedMonth,
      receitas: income,
      vendasReceita: revenue,
      despesas: expense,
      investimentos: investment,
      saldoLivre: income + revenue - expense - investment,
      totalTransacoes: monthTx.length,
      topCategoriasDespesa: topCategories,
      metas: activeGoals,
      patrimonioEstimado: patrimonio,
      totalInvestidoHistorico: allInvestment,
      progressoCurso: courseProgress,
    };
  }, [transactions, sales, goals, selectedMonth]);

  const send = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || isLoading) return;

    const userMsg: Msg = { role: 'user', content: msg };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    let assistantSoFar = '';

    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          financialContext: getFinancialContext(),
        }),
      });

      if (!resp.ok || !resp.body) {
        const errData = resp.status === 429 || resp.status === 402
          ? await resp.json().catch(() => ({}))
          : {};
        throw new Error(errData.error || 'Erro ao conectar com o assistente.');
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let streamDone = false;

      const upsert = (chunk: string) => {
        assistantSoFar += chunk;
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === 'assistant') {
            return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
          }
          return [...prev, { role: 'assistant', content: assistantSoFar }];
        });
      };

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') { streamDone = true; break; }
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) upsert(content);
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      if (textBuffer.trim()) {
        for (let raw of textBuffer.split('\n')) {
          if (!raw) continue;
          if (raw.endsWith('\r')) raw = raw.slice(0, -1);
          if (raw.startsWith(':') || raw.trim() === '') continue;
          if (!raw.startsWith('data: ')) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) upsert(content);
          } catch { /* ignore */ }
        }
      }
    } catch (e: any) {
      console.error('[AssistantChat] fetch error:', e);
      const fallback = 'Não foi possível conectar ao assistente agora. Tente novamente em instantes.';
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: e.message || fallback },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background animate-fade-in sm:inset-auto sm:bottom-4 sm:right-4 sm:w-96 sm:h-[32rem] sm:rounded-2xl sm:shadow-2xl sm:border sm:border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-primary/20 to-cyan/10 border-b border-border shrink-0">
        <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
          <Bot size={20} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">Assistente FinControl</p>
          <p className="text-[10px] text-muted-foreground">Mentor financeiro digital</p>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-accent/10 transition-colors">
          <X size={18} className="text-muted-foreground" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-8 space-y-3">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Bot size={28} className="text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground">Olá! Sou seu mentor financeiro.</p>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-[260px] mx-auto">
              Posso ajudar com dúvidas sobre finanças, analisar seus dados e sugerir estratégias personalizadas.
            </p>
            <div className="flex flex-wrap justify-center gap-1.5 pt-2">
              {QUICK_QUESTIONS.map(q => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="text-[10px] px-2.5 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                <Bot size={14} className="text-primary" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                m.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-md'
                  : 'glass rounded-bl-md'
              }`}
            >
              {m.role === 'assistant' ? (
                <div className="prose prose-sm prose-invert max-w-none [&_p]:my-1 [&_li]:my-0.5 [&_ul]:my-1 [&_ol]:my-1 [&_h1]:text-sm [&_h2]:text-xs [&_h3]:text-xs [&_code]:text-[10px] [&_code]:bg-muted/50 [&_code]:px-1 [&_code]:rounded">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              ) : (
                m.content
              )}
            </div>
            {m.role === 'user' && (
              <div className="w-7 h-7 rounded-full bg-accent/15 flex items-center justify-center shrink-0 mt-0.5">
                <User size={14} className="text-accent" />
              </div>
            )}
          </div>
        ))}

        {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
          <div className="flex gap-2">
            <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
              <Bot size={14} className="text-primary" />
            </div>
            <div className="glass rounded-2xl rounded-bl-md px-3.5 py-2.5">
              <Loader2 size={14} className="animate-spin text-primary" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-3 py-2.5 border-t border-border shrink-0">
        <form
          onSubmit={e => { e.preventDefault(); send(); }}
          className="flex items-center gap-2"
        >
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Pergunte sobre finanças..."
            className="flex-1 bg-muted/50 rounded-xl px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 hover:bg-primary/90 transition-colors shrink-0"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
