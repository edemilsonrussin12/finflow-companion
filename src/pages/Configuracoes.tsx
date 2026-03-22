import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Settings, Trash2, Receipt, TrendingUp, Target, Grid3X3, ClipboardList, History, ShieldCheck, User, Pencil, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useFinance } from '@/contexts/FinanceContext';
import { toast } from 'sonner';

interface DeleteOption {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  action: () => Promise<void>;
}

export default function Configuracoes() {
  const { user } = useAuth();
  const { transactions, sales } = useFinance();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<DeleteOption | null>(null);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Name editing
  const [displayName, setDisplayName] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [savingName, setSavingName] = useState(false);

  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;
    supabase.from('profiles').select('display_name').eq('id', userId).maybeSingle()
      .then(({ data }) => setDisplayName(data?.display_name || ''));
  }, [userId]);

  const handleSaveName = async () => {
    if (!userId || !displayName.trim()) return;
    setSavingName(true);
    const { error } = await supabase.from('profiles').update({ display_name: displayName.trim() }).eq('id', userId);
    if (error) {
      toast.error('Erro ao salvar nome');
    } else {
      toast.success('Nome atualizado com sucesso');
      setEditingName(false);
    }
    setSavingName(false);
  };

  const deleteOptions: DeleteOption[] = [
    {
      id: 'expenses',
      label: 'Apagar todos os gastos',
      description: 'Remove todas as transações de despesa registradas.',
      icon: Receipt,
      action: async () => {
        await supabase.from('transactions').delete().eq('user_id', userId!).eq('type', 'expense');
      },
    },
    {
      id: 'investments',
      label: 'Apagar investimentos',
      description: 'Remove todas as transações de investimento.',
      icon: TrendingUp,
      action: async () => {
        await supabase.from('transactions').delete().eq('user_id', userId!).eq('type', 'investment');
      },
    },
    {
      id: 'goals',
      label: 'Apagar metas financeiras',
      description: 'Remove todas as metas e contribuições.',
      icon: Target,
      action: async () => {
        const { data: goals } = await supabase.from('financial_goals').select('id').eq('user_id', userId!);
        if (goals && goals.length > 0) {
          const goalIds = goals.map(g => g.id);
          await supabase.from('goal_contributions').delete().in('goal_id', goalIds);
        }
        await supabase.from('financial_goals').delete().eq('user_id', userId!);
      },
    },
    {
      id: 'spreadsheets',
      label: 'Apagar planilhas',
      description: 'Remove os dados salvos da planilha rápida.',
      icon: Grid3X3,
      action: async () => {
        localStorage.removeItem('fincontrol_spreadsheet');
      },
    },
    {
      id: 'budgets',
      label: 'Apagar orçamentos',
      description: 'Remove todos os orçamentos profissionais e seus itens.',
      icon: ClipboardList,
      action: async () => {
        const { data: budgets } = await supabase.from('budgets').select('id').eq('user_id', userId!);
        if (budgets && budgets.length > 0) {
          const budgetIds = budgets.map(b => b.id);
          await supabase.from('budget_items').delete().in('budget_id', budgetIds);
        }
        await supabase.from('budgets').delete().eq('user_id', userId!);
      },
    },
    {
      id: 'history',
      label: 'Apagar histórico financeiro',
      description: 'Remove todas as transações, vendas e registros financeiros.',
      icon: History,
      action: async () => {
        await supabase.from('transactions').delete().eq('user_id', userId!);
        await supabase.from('sales').delete().eq('user_id', userId!);
      },
    },
  ];

  const handleDeleteClick = (option: DeleteOption) => {
    setSelectedOption(option);
    setConfirmText('');
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedOption || confirmText !== 'EXCLUIR') return;
    setDeleting(true);
    try {
      await selectedOption.action();
      toast.success('Seus dados foram removidos com sucesso.', {
        description: 'Agora você pode começar um novo controle financeiro.',
      });
      setConfirmOpen(false);
      // Reload to refresh contexts
      setTimeout(() => window.location.reload(), 1200);
    } catch {
      toast.error('Erro ao excluir dados. Tente novamente.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="page-container min-h-screen pb-24 pt-6 space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold text-foreground">Configurações</h1>
      </div>

      {/* Name editing section */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            Seu nome
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {editingName ? (
            <div className="flex gap-2">
              <Input
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Seu nome completo"
                className="flex-1"
              />
              <Button size="sm" onClick={handleSaveName} disabled={savingName || !displayName.trim()}>
                {savingName ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar'}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setEditingName(false)}>Cancelar</Button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-sm text-foreground">{displayName || user?.email?.split('@')[0] || '—'}</p>
              <Button size="sm" variant="ghost" onClick={() => setEditingName(true)} className="gap-1.5 text-xs">
                <Pencil className="h-3.5 w-3.5" />
                Editar
              </Button>
            </div>
          )}
          <p className="text-[10px] text-muted-foreground">{user?.email}</p>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-lg font-semibold text-foreground mb-1">Gerenciamento de dados</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Gerencie ou limpe partes específicas dos seus dados financeiros.
        </p>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex items-start gap-3 p-4">
          <ShieldCheck className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <p className="text-sm text-muted-foreground">
            Sua conta, assinatura premium, histórico de pagamentos, códigos de indicação e dados de autenticação estão protegidos e não serão afetados.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {deleteOptions.map((option) => (
          <Card key={option.id}>
            <CardContent className="flex items-center justify-between p-4 gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <option.icon className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium text-sm text-foreground">{option.label}</p>
                  <p className="text-xs text-muted-foreground">{option.description}</p>
                </div>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeleteClick(option)}
                className="shrink-0"
              >
                Excluir
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza que deseja excluir esses dados?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <span className="block">
                {selectedOption?.label}: {selectedOption?.description}
              </span>
              <span className="block font-medium text-destructive">
                Essa ação apagará permanentemente os dados selecionados e não poderá ser desfeita.
              </span>
              <span className="block text-sm">
                Digite <span className="font-bold">EXCLUIR</span> para confirmar:
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="EXCLUIR"
            className="font-mono"
          />
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={deleting}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={confirmText !== 'EXCLUIR' || deleting}
            >
              {deleting ? 'Excluindo...' : 'Confirmar exclusão'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
