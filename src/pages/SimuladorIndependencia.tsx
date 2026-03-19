import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/format';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Calculator, Target, TrendingUp, Clock, DollarSign, Rocket, ArrowLeft, ArrowRight, Lightbulb, BarChart3, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/* ── helpers ─────────────────────────────────────────── */

function safeNum(v: string): number {
  const n = parseFloat(v);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : 0;
}

interface ProjectionPoint {
  year: number;
  patrimonio: number;
  invested: number;
  interest: number;
  meta: number;
}

interface SimResult {
  annualExpense: number;
  requiredPatrimony: number;
  yearsToGoal: number;
  finalValue: number;
  totalInvested: number;
  totalInterest: number;
  chartData: ProjectionPoint[];
}

function simulate(
  monthlyExpense: number,
  alreadyInvested: number,
  monthlyInvestment: number,
  annualRate: number,
): SimResult {
  const annualExpense = monthlyExpense * 12;
  const requiredPatrimony = annualExpense / 0.04;
  const monthlyRate = annualRate / 100 / 12;

  const maxYears = 60;
  const chartData: ProjectionPoint[] = [];
  let current = alreadyInvested;
  let totalInvested = alreadyInvested;
  let yearsToGoal = maxYears;

  chartData.push({ year: 0, patrimonio: current, invested: totalInvested, interest: 0, meta: requiredPatrimony });

  for (let y = 1; y <= maxYears; y++) {
    for (let m = 0; m < 12; m++) {
      current = (current + monthlyInvestment) * (1 + monthlyRate);
      totalInvested += monthlyInvestment;
    }
    const interest = current - totalInvested;
    chartData.push({ year: y, patrimonio: Math.round(current * 100) / 100, invested: Math.round(totalInvested * 100) / 100, interest: Math.round(interest * 100) / 100, meta: requiredPatrimony });

    if (current >= requiredPatrimony && yearsToGoal === maxYears) {
      yearsToGoal = y;
    }
  }

  // Use values at yearsToGoal for final display (not at year 60)
  const goalIdx = Math.min(yearsToGoal, chartData.length - 1);
  const finalValue = Math.round(chartData[goalIdx].patrimonio * 100) / 100;
  const finalInvested = Math.round(chartData[goalIdx].invested * 100) / 100;
  const finalInterest = Math.round((finalValue - finalInvested) * 100) / 100;

  const trimTo = Math.min(yearsToGoal + 5, maxYears);
  const trimmedData = chartData.filter(d => d.year <= trimTo);

  return {
    annualExpense,
    requiredPatrimony,
    yearsToGoal,
    finalValue,
    totalInvested: finalInvested,
    totalInterest: finalInterest,
    chartData: trimmedData,
  };
}

function getMessages(result: SimResult, monthlyInvestment: number, patrimonyNeg: boolean): string[] {
  const msgs: string[] = [];

  if (patrimonyNeg) {
    msgs.push('⚠️ Seu patrimônio está comprometido por dívidas. Priorize quitar os passivos antes de investir.');
  }

  if (result.yearsToGoal <= 10) {
    msgs.push(`🚀 Você está mais perto do que imagina! Mantendo esse ritmo, sua independência financeira pode chegar em ${result.yearsToGoal} anos.`);
  } else if (result.yearsToGoal <= 20) {
    msgs.push('💪 Você já começou sua jornada. Pequenos ajustes no aporte mensal podem acelerar muito sua independência financeira.');
  } else if (monthlyInvestment < 500) {
    msgs.push('📈 Aumentar seus aportes mensais pode reduzir bastante o tempo até sua liberdade financeira.');
  } else {
    msgs.push('🎯 Continue firme! Consistência é a chave. Cada real investido hoje acelera seu caminho.');
  }

  if (result.totalInterest > result.totalInvested) {
    msgs.push('✨ Os juros compostos já superaram o total investido — o tempo está trabalhando a seu favor!');
  }

  msgs.push('📊 A consistência é o principal fator de crescimento patrimonial. Continue investindo regularmente.');

  return msgs;
}

/* ── component ───────────────────────────────────────── */

export default function SimuladorIndependencia() {
  const navigate = useNavigate();
  const [income, setIncome] = useState('');
  const [expense, setExpense] = useState('');
  const [invested, setInvested] = useState('');
  const [monthly, setMonthly] = useState('');
  const [rate, setRate] = useState('8');
  const [calculated, setCalculated] = useState(false);

  const monthlyVal = safeNum(monthly);
  const investedVal = safeNum(invested);
  const expenseVal = safeNum(expense);
  const rateVal = safeNum(rate);

  const result = useMemo<SimResult | null>(() => {
    if (!calculated || expenseVal <= 0) return null;
    return simulate(expenseVal, investedVal, monthlyVal, rateVal);
  }, [calculated, expenseVal, investedVal, monthlyVal, rateVal]);

  // Scenario comparison: +R$100/mês
  const improvedResult = useMemo<SimResult | null>(() => {
    if (!result) return null;
    return simulate(expenseVal, investedVal, monthlyVal + 100, rateVal);
  }, [result, expenseVal, investedVal, monthlyVal, rateVal]);

  const patrimonyNeg = investedVal < 0;

  const messages = useMemo(() => {
    if (!result) return [];
    return getMessages(result, monthlyVal, patrimonyNeg);
  }, [result, monthlyVal, patrimonyNeg]);

  const resetCalc = () => setCalculated(false);

  return (
    <div className="page-container pb-24 pt-6 space-y-5">
      {/* Header */}
      <div>
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-3">
          <ArrowLeft className="h-4 w-4" /><span className="text-sm">Voltar</span>
        </button>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10"><Rocket size={22} className="text-primary" /></div>
          <div>
            <h1 className="text-xl font-bold">Simulador de Independência</h1>
            <p className="text-xs text-muted-foreground">Descubra quando você pode viver de renda</p>
          </div>
        </div>
      </div>

      {/* Explanation */}
      <Card className="border-accent/20 bg-accent/5">
        <CardContent className="pt-4 pb-4 flex items-start gap-3">
          <Lightbulb size={18} className="text-accent shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs leading-relaxed"><strong>Patrimônio</strong> é tudo o que você tem, menos o que você deve.</p>
            <p className="text-xs leading-relaxed text-muted-foreground">Esse valor cresce com aportes e juros compostos ao longo do tempo.</p>
          </div>
        </CardContent>
      </Card>

      {/* Form */}
      <form onSubmit={e => { e.preventDefault(); setCalculated(true); }}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calculator size={16} className="text-primary" />
              Seus dados financeiros
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="fi-income">Renda mensal (R$)</Label>
              <Input id="fi-income" type="number" min="0" step="0.01" placeholder="5.000" inputMode="decimal" value={income} onChange={e => { setIncome(e.target.value); resetCalc(); }} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="fi-expense">Gasto mensal (R$)</Label>
              <Input id="fi-expense" type="number" min="0" step="0.01" placeholder="3.000" inputMode="decimal" value={expense} onChange={e => { setExpense(e.target.value); resetCalc(); }} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="fi-invested">Valor já investido (R$)</Label>
              <Input id="fi-invested" type="number" min="0" step="0.01" placeholder="10.000" inputMode="decimal" value={invested} onChange={e => { setInvested(e.target.value); resetCalc(); }} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="fi-monthly">Valor investido por mês (R$)</Label>
              <Input id="fi-monthly" type="number" min="0" step="0.01" placeholder="1.000" inputMode="decimal" value={monthly} onChange={e => { setMonthly(e.target.value); resetCalc(); }} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="fi-rate">Taxa de rendimento anual (%)</Label>
              <Input id="fi-rate" type="number" min="0" step="0.1" placeholder="8" inputMode="decimal" value={rate} onChange={e => { setRate(e.target.value); resetCalc(); }} className="mt-1" />
            </div>
            <Button type="submit" className="w-full gradient-primary text-primary-foreground font-semibold gap-2">
              <Target size={16} />
              Calcular minha independência
            </Button>
          </CardContent>
        </Card>
      </form>

      {/* Results */}
      {result && (
        <div className="space-y-4 animate-fade-in">
          {/* Key metrics */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="border-primary/20">
              <CardContent className="pt-4 pb-4 text-center space-y-1">
                <Target size={18} className="text-primary mx-auto" />
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Patrimônio necessário</p>
                <p className="text-sm font-bold text-primary tabular-nums">{formatCurrency(result.requiredPatrimony)}</p>
              </CardContent>
            </Card>
            <Card className="border-primary/20">
              <CardContent className="pt-4 pb-4 text-center space-y-1">
                <Clock size={18} className="text-primary mx-auto" />
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Tempo estimado</p>
                <p className="text-sm font-bold text-primary tabular-nums">
                  {result.yearsToGoal >= 60 ? '60+ anos' : `${result.yearsToGoal} anos`}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Financial breakdown */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 size={14} className="text-primary" />
                Resumo financeiro
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Gasto anual estimado</span>
                <span className="text-sm font-semibold tabular-nums">{formatCurrency(result.annualExpense)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Total investido</span>
                <span className="text-sm font-semibold tabular-nums text-primary">{formatCurrency(result.totalInvested)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Total em rendimentos</span>
                <span className={`text-sm font-semibold tabular-nums ${result.totalInterest >= 0 ? 'text-income' : 'text-destructive'}`}>
                  {formatCurrency(result.totalInterest)}
                </span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between items-center">
                <span className="text-xs font-medium">Patrimônio acumulado</span>
                <span className={`text-sm font-bold tabular-nums ${result.finalValue >= 0 ? 'text-income' : 'text-destructive'}`}>
                  {formatCurrency(result.finalValue)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp size={14} className="text-primary" />
                Evolução do patrimônio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={result.chartData}>
                    <defs>
                      <linearGradient id="gradFI" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradInvested" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.15} />
                        <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="year" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={v => `${v}a`} />
                    <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={v => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        formatCurrency(value),
                        name === 'patrimonio' ? 'Patrimônio' : name === 'invested' ? 'Investido' : 'Meta',
                      ]}
                      contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))', fontSize: '12px' }}
                      labelFormatter={l => `Ano ${l}`}
                    />
                    <Area type="monotone" dataKey="invested" stroke="hsl(var(--accent))" fill="url(#gradInvested)" strokeWidth={1.5} />
                    <Area type="monotone" dataKey="patrimonio" stroke="hsl(var(--primary))" fill="url(#gradFI)" strokeWidth={2} />
                    <Area type="monotone" dataKey="meta" stroke="hsl(var(--destructive))" fill="none" strokeWidth={1.5} strokeDasharray="6 3" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-4 mt-2 flex-wrap">
                <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-primary" /><span className="text-[10px] text-muted-foreground">Patrimônio</span></div>
                <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-accent" /><span className="text-[10px] text-muted-foreground">Investido</span></div>
                <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-destructive" /><span className="text-[10px] text-muted-foreground">Meta</span></div>
              </div>
            </CardContent>
          </Card>

          {/* Scenario Comparison */}
          {improvedResult && (
            <Card className="border-income/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <ArrowRight size={14} className="text-income" />
                  E se você investisse +R$100 por mês?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-secondary/50 rounded-lg p-3 text-center space-y-1">
                    <p className="text-[10px] text-muted-foreground uppercase">Cenário atual</p>
                    <p className="text-xs font-bold tabular-nums">{result.yearsToGoal >= 60 ? '60+' : result.yearsToGoal} anos</p>
                    <p className="text-[10px] text-muted-foreground tabular-nums">{formatCurrency(result.finalValue)}</p>
                  </div>
                  <div className="bg-income/10 rounded-lg p-3 text-center space-y-1">
                    <p className="text-[10px] text-income uppercase font-medium">Cenário melhorado</p>
                    <p className="text-xs font-bold text-income tabular-nums">{improvedResult.yearsToGoal >= 60 ? '60+' : improvedResult.yearsToGoal} anos</p>
                    <p className="text-[10px] text-muted-foreground tabular-nums">{formatCurrency(improvedResult.finalValue)}</p>
                  </div>
                </div>
                {improvedResult.yearsToGoal < result.yearsToGoal && (
                  <p className="text-xs text-center text-income font-medium">
                    Aumentar R$100 por mês pode antecipar sua independência financeira em {result.yearsToGoal - improvedResult.yearsToGoal} ano{result.yearsToGoal - improvedResult.yearsToGoal !== 1 ? 's' : ''}.
                  </p>
                )}
                {improvedResult.finalValue > result.finalValue && (
                  <p className="text-[11px] text-center text-muted-foreground">
                    Diferença de patrimônio: <span className="text-income font-semibold">{formatCurrency(improvedResult.finalValue - result.finalValue)}</span> a mais
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Smart messages */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-4 pb-4 space-y-2">
              {messages.map((msg, i) => (
                <p key={i} className="text-xs leading-relaxed">{msg}</p>
              ))}
            </CardContent>
          </Card>

          {/* Action buttons */}
          <div className="grid grid-cols-1 gap-2">
            <Button variant="outline" className="w-full gap-2 text-sm" onClick={() => navigate('/metas')}>
              <Target size={15} />
              Salvar meta
            </Button>
            <Button variant="outline" className="w-full gap-2 text-sm" onClick={() => navigate('/')}>
              <DollarSign size={15} />
              Voltar ao dashboard
            </Button>
            <Button variant="outline" className="w-full gap-2 text-sm" onClick={() => navigate('/engenharia')}>
              <BookOpen size={15} />
              Continuar aprendendo
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
