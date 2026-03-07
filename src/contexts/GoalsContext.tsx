import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { FinancialGoal, GoalContribution } from '@/types/goals';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface GoalsContextType {
  goals: FinancialGoal[];
  loading: boolean;
  addGoal: (g: Omit<FinancialGoal, 'id' | 'currentAmount' | 'createdAt'>) => Promise<void>;
  updateGoal: (g: FinancialGoal) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  addContribution: (goalId: string, amount: number) => Promise<void>;
  getContributions: (goalId: string) => Promise<GoalContribution[]>;
}

const GoalsContext = createContext<GoalsContextType | undefined>(undefined);

function mapGoal(row: any): FinancialGoal {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    targetAmount: Number(row.target_amount),
    currentAmount: Number(row.current_amount),
    deadline: row.deadline ?? undefined,
    status: row.status,
    createdAt: row.created_at,
  };
}

export function GoalsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setGoals([]); setLoading(false); return; }
    setLoading(true);
    supabase.from('financial_goals').select('*').order('created_at', { ascending: false })
      .then(({ data }) => {
        setGoals((data ?? []).map(mapGoal));
        setLoading(false);
      });
  }, [user]);

  const addGoal = useCallback(async (g: Omit<FinancialGoal, 'id' | 'currentAmount' | 'createdAt'>) => {
    if (!user) return;
    const { data, error } = await supabase.from('financial_goals').insert({
      user_id: user.id,
      title: g.title,
      description: g.description ?? null,
      target_amount: g.targetAmount,
      deadline: g.deadline ?? null,
      status: g.status,
    }).select().single();
    if (!error && data) setGoals(prev => [mapGoal(data), ...prev]);
  }, [user]);

  const updateGoal = useCallback(async (g: FinancialGoal) => {
    const { data, error } = await supabase.from('financial_goals').update({
      title: g.title,
      description: g.description ?? null,
      target_amount: g.targetAmount,
      current_amount: g.currentAmount,
      deadline: g.deadline ?? null,
      status: g.status,
      updated_at: new Date().toISOString(),
    }).eq('id', g.id).select().single();
    if (!error && data) setGoals(prev => prev.map(p => p.id === g.id ? mapGoal(data) : p));
  }, []);

  const deleteGoal = useCallback(async (id: string) => {
    const { error } = await supabase.from('financial_goals').delete().eq('id', id);
    if (!error) setGoals(prev => prev.filter(p => p.id !== id));
  }, []);

  const addContribution = useCallback(async (goalId: string, amount: number) => {
    if (!user) return;
    const { error } = await supabase.from('goal_contributions').insert({
      goal_id: goalId,
      user_id: user.id,
      amount,
    });
    if (error) return;
    // Update the goal's current_amount
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;
    const newAmount = goal.currentAmount + amount;
    const newStatus = newAmount >= goal.targetAmount ? 'completed' : 'active';
    const { data } = await supabase.from('financial_goals').update({
      current_amount: newAmount,
      status: newStatus,
      updated_at: new Date().toISOString(),
    }).eq('id', goalId).select().single();
    if (data) setGoals(prev => prev.map(p => p.id === goalId ? mapGoal(data) : p));
  }, [user, goals]);

  const getContributions = useCallback(async (goalId: string): Promise<GoalContribution[]> => {
    const { data } = await supabase.from('goal_contributions').select('*').eq('goal_id', goalId).order('date', { ascending: false });
    return (data ?? []).map(r => ({ id: r.id, goalId: r.goal_id, amount: Number(r.amount), date: r.date }));
  }, []);

  return (
    <GoalsContext.Provider value={{ goals, loading, addGoal, updateGoal, deleteGoal, addContribution, getContributions }}>
      {children}
    </GoalsContext.Provider>
  );
}

export function useGoals() {
  const ctx = useContext(GoalsContext);
  if (!ctx) throw new Error('useGoals must be used within GoalsProvider');
  return ctx;
}
