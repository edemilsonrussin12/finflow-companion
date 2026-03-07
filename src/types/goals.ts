export interface FinancialGoal {
  id: string;
  title: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string; // ISO date
  status: 'active' | 'completed';
  createdAt: string;
}

export interface GoalContribution {
  id: string;
  goalId: string;
  amount: number;
  date: string;
}
