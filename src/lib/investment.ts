import { InvestmentSimulation, InvestmentResult } from '@/types/finance';

export function calculateInvestment(sim: InvestmentSimulation): InvestmentResult {
  const { initialAmount, monthlyContribution, monthlyRate, months } = sim;
  const rate = monthlyRate / 100;
  
  const monthlyData: { month: number; value: number; invested: number }[] = [];
  let currentValue = initialAmount;
  let totalInvested = initialAmount;

  monthlyData.push({ month: 0, value: currentValue, invested: totalInvested });

  for (let i = 1; i <= months; i++) {
    currentValue = currentValue * (1 + rate) + monthlyContribution;
    totalInvested += monthlyContribution;
    monthlyData.push({ month: i, value: currentValue, invested: totalInvested });
  }

  return {
    finalValue: currentValue,
    totalInvested,
    totalInterest: currentValue - totalInvested,
    monthlyData,
  };
}
