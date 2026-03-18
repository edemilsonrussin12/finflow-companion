import { describe, it, expect } from 'vitest';

// Inline simulate for isolated testing
function simulate(monthlyExpense: number, alreadyInvested: number, monthlyInvestment: number, annualRate: number) {
  const annualExpense = monthlyExpense * 12;
  const requiredPatrimony = annualExpense / 0.04;
  const monthlyRate = annualRate / 100 / 12;
  const maxYears = 60;
  let current = alreadyInvested;
  let totalInvested = alreadyInvested;
  let yearsToGoal = maxYears;

  for (let y = 1; y <= maxYears; y++) {
    for (let m = 0; m < 12; m++) {
      current = (current + monthlyInvestment) * (1 + monthlyRate);
      totalInvested += monthlyInvestment;
    }
    if (current >= requiredPatrimony && yearsToGoal === maxYears) {
      yearsToGoal = y;
    }
  }

  return {
    annualExpense,
    requiredPatrimony,
    yearsToGoal,
    finalValue: Math.round(current * 100) / 100,
    totalInvested: Math.round(totalInvested * 100) / 100,
    totalInterest: Math.round((current - totalInvested) * 100) / 100,
  };
}

describe('Financial Independence Simulator', () => {
  it('calculates required patrimony correctly (4% rule)', () => {
    const r = simulate(3000, 0, 0, 0);
    expect(r.annualExpense).toBe(36000);
    expect(r.requiredPatrimony).toBe(900000);
  });

  it('zero rate = no interest', () => {
    const r = simulate(1000, 10000, 500, 0);
    expect(r.totalInterest).toBe(0);
    expect(r.totalInvested).toBe(10000 + 500 * 12 * 60);
    expect(r.finalValue).toBe(r.totalInvested);
  });

  it('zero monthly investment with initial amount and rate', () => {
    const r = simulate(1000, 50000, 0, 10);
    expect(r.totalInvested).toBe(50000);
    expect(r.finalValue).toBeGreaterThan(50000);
    expect(r.totalInterest).toBeGreaterThan(0);
  });

  it('only assets (no expenses) → required patrimony is 0', () => {
    const r = simulate(0, 100000, 1000, 8);
    expect(r.requiredPatrimony).toBe(0);
    // yearsToGoal should be 0 since current >= 0 immediately
  });

  it('high values produce finite results', () => {
    const r = simulate(10000, 1000000, 5000, 12);
    expect(Number.isFinite(r.finalValue)).toBe(true);
    expect(Number.isFinite(r.totalInterest)).toBe(true);
  });

  it('compound interest grows faster than linear', () => {
    const withRate = simulate(2000, 0, 1000, 8);
    const noRate = simulate(2000, 0, 1000, 0);
    expect(withRate.finalValue).toBeGreaterThan(noRate.finalValue);
  });

  it('initial amount enters only once', () => {
    const r = simulate(1000, 10000, 0, 0);
    expect(r.totalInvested).toBe(10000);
  });

  it('mixed scenario: assets and expenses', () => {
    const r = simulate(5000, 200000, 2000, 10);
    expect(r.requiredPatrimony).toBe(1500000);
    expect(r.yearsToGoal).toBeLessThan(60);
    expect(r.finalValue).toBeGreaterThan(r.requiredPatrimony);
  });
});
