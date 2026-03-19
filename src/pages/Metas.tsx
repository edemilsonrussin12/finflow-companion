import { useState } from 'react';
import { useGoals } from '@/contexts/GoalsContext';
import { formatCurrency, formatDate } from '@/lib/format';
import { Progress } from '@/components/ui/progress';
import { Target, Plus, Pencil, Trash2, PlusCircle } from 'lucide-react';
import GoalForm from '@/components/GoalForm';
import ContributionForm from '@/components/ContributionForm';
import ConfirmDialog from '@/components/ConfirmDialog';
import { FinancialGoal } from '@/types/goals';
import { usePremiumStatus } from '@/hooks/usePremiumStatus';
import PremiumGate from '@/components/PremiumGate';
import { toast } from 'sonner';

const FREE_GOAL_LIMIT = 1;

export default function Metas() {
  const { goals, loading, addGoal, updateGoal, deleteGoal, addContribution } = useGoals();
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<FinancialGoal | null>(null);
  const [contributingGoal, setContributingGoal] = useState<FinancialGoal | null>(null);
  const [deletingGoalId, setDeletingGoalId] = useState<string | null>(null);
  const { isPremium } = usePremiumStatus();

  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');
  const canAddGoal = isPremium || goals.length < FREE_GOAL_LIMIT;

  const handleNewGoal = () => {
    if (!canAddGoal) {
      toast.info('Limite de 1 meta no plano gratuito. Desbloqueie o Premium para metas ilimitadas.');
      return;
    }
    setShowForm(true);
  };

  const handleConfirmDelete = () => {
    if (deletingGoalId) {
      deleteGoal(deletingGoalId);
      setDeletingGoalId(null);
    }
  };

  return (
    <div className="page-container pt-6 pb-24 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Financeiro</p>
          <h1 className="text-xl font-bold">Metas</h1>
        </div>
        <button
          onClick={handleNewGoal}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-primary hover:bg-accent transition-colors"
        >
          <Plus size={16} />
          <span>Nova Meta</span>
        </button>
      </div>

      {loading && <p className="text-sm text-muted-foreground text-center py-12">Carregando...</p>}

      {!loading && goals.length === 0 && (
        <div className="glass rounded-2xl p-8 text-center space-y-3">
          <Target size={40} className="mx-auto text-muted-foreground" />
          <p className="text-muted-foreground text-sm">Você ainda não tem metas financeiras.</p>
          <button onClick={handleNewGoal} className="text-primary text-sm font-medium hover:underline">
            Criar sua primeira meta
          </button>
        </div>
      )}

      {activeGoals.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium">Metas ativas ({activeGoals.length})</p>
          {activeGoals.map(g => {
            const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
            return (
              <div key={g.id} className="glass rounded-2xl p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-sm">{g.title}</p>
                    {g.description && <p className="text-xs text-muted-foreground">{g.description}</p>}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => setContributingGoal(g)} className="p-1.5 rounded-lg hover:bg-accent transition-colors" title="Contribuir">
                      <PlusCircle size={16} className="text-primary" />
                    </button>
                    <button onClick={() => setEditingGoal(g)} className="p-1.5 rounded-lg hover:bg-accent transition-colors" title="Editar">
                      <Pencil size={14} className="text-muted-foreground" />
                    </button>
                    <button onClick={() => setDeletingGoalId(g.id)} className="p-1.5 rounded-lg hover:bg-accent transition-colors" title="Excluir">
                      <Trash2 size={14} className="text-destructive" />
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{formatCurrency(g.currentAmount)}</span>
                    <span>{formatCurrency(g.targetAmount)}</span>
                  </div>
                  <Progress value={pct} className="h-2" />
                  <div className="flex justify-between text-xs">
                    <span className="text-primary font-medium">{pct}%</span>
                    {g.deadline && <span className="text-muted-foreground">Prazo: {formatDate(g.deadline)}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!isPremium && goals.length >= FREE_GOAL_LIMIT && (
        <PremiumGate isPremium={false} label="No plano gratuito você pode ter apenas 1 meta. Desbloqueie o Premium para metas ilimitadas." />
      )}

      {completedGoals.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium">Concluídas ({completedGoals.length})</p>
          {completedGoals.map(g => (
            <div key={g.id} className="glass rounded-2xl p-4 opacity-70 space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-sm">{g.title}</p>
                <button onClick={() => setDeletingGoalId(g.id)} className="p-1.5 rounded-lg hover:bg-accent transition-colors">
                  <Trash2 size={14} className="text-muted-foreground" />
                </button>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatCurrency(g.currentAmount)} / {formatCurrency(g.targetAmount)}</span>
                <span className="text-income font-medium">✓ Concluída</span>
              </div>
              <Progress value={100} className="h-2" />
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <GoalForm onSubmit={addGoal} onClose={() => setShowForm(false)} />
      )}

      {editingGoal && (
        <GoalForm
          initial={editingGoal}
          onSubmit={g => updateGoal({ ...editingGoal, ...g, currentAmount: editingGoal.currentAmount })}
          onClose={() => setEditingGoal(null)}
        />
      )}

      {contributingGoal && (
        <ContributionForm
          goalTitle={contributingGoal.title}
          onSubmit={amount => addContribution(contributingGoal.id, amount)}
          onClose={() => setContributingGoal(null)}
        />
      )}

      <ConfirmDialog
        open={!!deletingGoalId}
        onOpenChange={open => { if (!open) setDeletingGoalId(null); }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
