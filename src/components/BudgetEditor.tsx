import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useFinance } from '@/contexts/FinanceContext';
import { ArrowLeft, Plus, Trash2, Download, MessageCircle, DollarSign, Save, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface BudgetItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  sort_order: number;
  isNew?: boolean;
}

interface BudgetData {
  client_name: string;
  client_contact: string;
  service_description: string;
  date: string;
  notes: string;
  status: string;
  total: number;
  quote_number: number;
}

interface BusinessProfileData {
  business_name: string;
  phone: string;
  email: string;
  address: string;
  logo_url: string;
  signature_url: string;
}

interface Props {
  budgetId: string;
  onClose: () => void;
}

const AUTO_SAVE_INTERVAL = 5000;

export default function BudgetEditor({ budgetId, onClose }: Props) {
  const { user } = useAuth();
  const { addTransaction } = useFinance();
  const { toast } = useToast();
  const [budget, setBudget] = useState<BudgetData>({
    client_name: '', client_contact: '', service_description: '',
    date: new Date().toISOString().slice(0, 10),
    notes: '', status: 'draft', total: 0, quote_number: 0,
  });
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [bizProfile, setBizProfile] = useState<BusinessProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const lastSavedRef = useRef<string>('');

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: bData }, { data: iData }] = await Promise.all([
      supabase.from('budgets').select('*').eq('id', budgetId).single(),
      supabase.from('budget_items').select('*').eq('budget_id', budgetId).order('sort_order'),
    ]);
    if (bData) {
      setBudget({
        client_name: bData.client_name ?? '',
        client_contact: (bData as any).client_contact ?? '',
        service_description: bData.service_description ?? '',
        date: bData.date ?? new Date().toISOString().slice(0, 10),
        notes: bData.notes ?? '',
        status: bData.status ?? 'draft',
        total: Number(bData.total) || 0,
        quote_number: (bData as any).quote_number ?? 0,
      });
    }
    setItems((iData as BudgetItem[]) ?? []);
    setLoading(false);
  }, [budgetId]);

  useEffect(() => { load(); }, [load]);

  // Auto-save
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!user) return;
      const snapshot = JSON.stringify({ budget, items });
      if (snapshot !== lastSavedRef.current && !loading) {
        setAutoSaveStatus('saving');
        await saveToDb();
        lastSavedRef.current = snapshot;
        setTimeout(() => setAutoSaveStatus('saved'), 300);
        setTimeout(() => setAutoSaveStatus('idle'), 2000);
      }
    }, AUTO_SAVE_INTERVAL);
    return () => clearInterval(interval);
  }, [budget, items, user, loading]);

  function updateField(field: keyof BudgetData, value: string) {
    setBudget(b => ({ ...b, [field]: value }));
  }

  function addItem() {
    const newItem: BudgetItem = {
      id: crypto.randomUUID(),
      description: '',
      quantity: 1,
      unit_price: 0,
      total: 0,
      sort_order: items.length,
      isNew: true,
    };
    setItems([...items, newItem]);
  }

  function updateItem(id: string, field: keyof BudgetItem, value: string | number) {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, [field]: value };
      if (field === 'quantity' || field === 'unit_price') {
        updated.total = Number(updated.quantity) * Number(updated.unit_price);
      }
      return updated;
    }));
  }

  function removeItem(id: string) {
    setItems(prev => prev.filter(i => i.id !== id));
  }

  const grandTotal = items.reduce((s, i) => s + (Number(i.quantity) * Number(i.unit_price)), 0);

  const quoteLabel = budget.quote_number
    ? String(budget.quote_number).padStart(5, '0')
    : '—';

  async function saveToDb() {
    if (!user) return;
    await supabase.from('budgets').update({
      client_name: budget.client_name,
      client_contact: budget.client_contact,
      service_description: budget.service_description,
      date: budget.date,
      notes: budget.notes,
      status: budget.status,
      total: grandTotal,
      updated_at: new Date().toISOString(),
    } as any).eq('id', budgetId);

    await supabase.from('budget_items').delete().eq('budget_id', budgetId);

    if (items.length > 0) {
      const rows = items.map((item, idx) => ({
        budget_id: budgetId,
        description: item.description,
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
        total: Number(item.quantity) * Number(item.unit_price),
        sort_order: idx,
      }));
      await supabase.from('budget_items').insert(rows);
    }
  }

  async function save() {
    setSaving(true);
    await saveToDb();
    lastSavedRef.current = JSON.stringify({ budget, items });
    setSaving(false);
    toast({ title: 'Orçamento salvo!' });
  }

  function fmtBRL(v: number): string {
    return `R$ ${v.toFixed(2).replace('.', ',')}`;
  }

  function generatePDF() {
    const doc = new jsPDF();
    const pw = doc.internal.pageSize.width;
    const ph = doc.internal.pageSize.height;

    // Colors
    const emerald: [number, number, number] = [16, 185, 129];
    const darkText: [number, number, number] = [30, 30, 30];
    const grayText: [number, number, number] = [100, 100, 100];
    const lightGray: [number, number, number] = [230, 230, 230];

    // ── Header ──
    // Top accent line
    doc.setDrawColor(emerald[0], emerald[1], emerald[2]);
    doc.setLineWidth(2.5);
    doc.line(0, 0, pw, 0);

    // Brand name
    doc.setFontSize(24);
    doc.setTextColor(emerald[0], emerald[1], emerald[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('FinControl', 14, 18);

    // Title
    doc.setFontSize(18);
    doc.setTextColor(darkText[0], darkText[1], darkText[2]);
    doc.text('ORÇAMENTO DE SERVIÇO', pw - 14, 18, { align: 'right' });

    // Separator
    doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.setLineWidth(0.5);
    doc.line(14, 25, pw - 14, 25);

    // ── Quote info section ──
    let y = 34;
    const lh = 6;

    const infoItems = [
      ['Orçamento #', quoteLabel],
      ['Data', budget.date ? new Date(budget.date + 'T12:00:00').toLocaleDateString('pt-BR') : '—'],
      ['Cliente', budget.client_name || '—'],
    ];
    if (budget.client_contact) {
      infoItems.push(['Contato', budget.client_contact]);
    }
    if (budget.service_description) {
      infoItems.push(['Serviço', budget.service_description]);
    }

    doc.setFontSize(10);
    for (const [label, value] of infoItems) {
      doc.setTextColor(grayText[0], grayText[1], grayText[2]);
      doc.setFont('helvetica', 'bold');
      doc.text(`${label}:`, 14, y);
      doc.setTextColor(darkText[0], darkText[1], darkText[2]);
      doc.setFont('helvetica', 'normal');
      doc.text(value, 50, y);
      y += lh;
    }

    if (budget.notes) {
      y += 2;
      doc.setTextColor(grayText[0], grayText[1], grayText[2]);
      doc.setFont('helvetica', 'bold');
      doc.text('Observações:', 14, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(darkText[0], darkText[1], darkText[2]);
      const splitNotes = doc.splitTextToSize(budget.notes, pw - 28);
      doc.text(splitNotes, 14, y + 5);
      y += 5 + (splitNotes.length * 4.5);
    }

    y += 6;

    // ── Items table ──
    const tableData = items.map(i => [
      i.description || '—',
      String(i.quantity),
      fmtBRL(Number(i.unit_price)),
      fmtBRL(Number(i.quantity) * Number(i.unit_price)),
    ]);

    autoTable(doc, {
      startY: y,
      head: [['Serviço', 'Qtd', 'Valor Unitário', 'Total']],
      body: tableData,
      foot: [['', '', 'TOTAL', fmtBRL(grandTotal)]],
      theme: 'plain',
      styles: {
        fontSize: 10,
        cellPadding: 4,
        textColor: darkText,
        lineColor: lightGray,
        lineWidth: 0.5,
      },
      headStyles: {
        fillColor: [245, 245, 245],
        textColor: darkText,
        fontStyle: 'bold',
        fontSize: 10,
        lineColor: [200, 200, 200],
        lineWidth: 0.5,
      },
      footStyles: {
        fillColor: [245, 245, 245],
        textColor: darkText,
        fontStyle: 'bold',
        fontSize: 11,
        lineColor: [200, 200, 200],
        lineWidth: 0.5,
      },
      bodyStyles: {
        fontSize: 10,
        textColor: [50, 50, 50],
      },
      alternateRowStyles: {
        fillColor: [252, 252, 252],
      },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 22, halign: 'center' },
        2: { cellWidth: 38, halign: 'right' },
        3: { cellWidth: 38, halign: 'right' },
      },
      margin: { left: 14, right: 14 },
    });

    // ── Footer ──
    doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.setLineWidth(0.5);
    doc.line(14, ph - 28, pw - 14, ph - 28);

    doc.setFontSize(10);
    doc.setTextColor(emerald[0], emerald[1], emerald[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('FinControl', pw / 2, ph - 20, { align: 'center' });

    doc.setFontSize(8);
    doc.setTextColor(grayText[0], grayText[1], grayText[2]);
    doc.setFont('helvetica', 'normal');
    doc.text('Controle inteligente do seu dinheiro', pw / 2, ph - 14, { align: 'center' });
    doc.text('fincontrolapp.com', pw / 2, ph - 9, { align: 'center' });

    return doc;
  }

  function downloadPDF() {
    const doc = generatePDF();
    doc.save(`orcamento-${quoteLabel}-${budget.client_name || 'sem-nome'}.pdf`);
    toast({ title: 'PDF baixado!' });
  }

  function shareWhatsApp() {
    const lines = items.map(i =>
      `• ${i.description || 'Item'} — ${i.quantity}x ${fmtBRL(Number(i.unit_price))} = ${fmtBRL(Number(i.quantity) * Number(i.unit_price))}`
    );
    const text = encodeURIComponent(
      `*Orçamento #${quoteLabel} — FinControl*\n\nCliente: ${budget.client_name || '—'}${budget.client_contact ? `\nContato: ${budget.client_contact}` : ''}\nServiço: ${budget.service_description || '—'}\nData: ${budget.date ? new Date(budget.date + 'T12:00:00').toLocaleDateString('pt-BR') : '—'}\n\n${lines.join('\n')}\n\n*Total: ${fmtBRL(grandTotal)}*\n\n${budget.notes ? `Obs: ${budget.notes}\n\n` : ''}Gerado com FinControl\nfincontrolapp.com`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  }

  function registerPayment() {
    if (!user) return;
    addTransaction({
      type: 'income',
      amount: grandTotal,
      category: 'servicos',
      description: `Pagamento: ${budget.client_name} — ${budget.service_description}`.slice(0, 100),
      date: new Date().toISOString().slice(0, 10),
      isRecurring: false,
    });

    supabase.from('budgets').update({ status: 'paid', updated_at: new Date().toISOString() }).eq('id', budgetId).then(() => {
      setBudget(b => ({ ...b, status: 'paid' }));
    });

    toast({ title: 'Pagamento registrado como receita!' });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-24 max-w-lg mx-auto space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <ArrowLeft size={20} />
        </Button>
        <div className="flex-1">
          <h1 className="text-lg font-bold">Editar Orçamento</h1>
          <p className="text-xs text-muted-foreground">#{quoteLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          {autoSaveStatus !== 'idle' && (
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              {autoSaveStatus === 'saving' && 'Salvando...'}
              {autoSaveStatus === 'saved' && <><Check size={10} className="text-income" /> Salvo</>}
            </span>
          )}
          <Button size="sm" onClick={save} disabled={saving} className="gap-1.5">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Salvar
          </Button>
        </div>
      </div>

      {/* Fields */}
      <div className="glass rounded-2xl p-4 space-y-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Nome do cliente</label>
          <Input value={budget.client_name} onChange={e => updateField('client_name', e.target.value)} placeholder="Ex: João Silva" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Contato do cliente (opcional)</label>
          <Input value={budget.client_contact} onChange={e => updateField('client_contact', e.target.value)} placeholder="Ex: (11) 99999-0000" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Descrição do serviço (opcional)</label>
          <Input value={budget.service_description} onChange={e => updateField('service_description', e.target.value)} placeholder="Ex: Manutenção automotiva" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Data</label>
          <Input type="date" value={budget.date} onChange={e => updateField('date', e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Observações</label>
          <Textarea value={budget.notes} onChange={e => updateField('notes', e.target.value)} placeholder="Notas adicionais..." rows={2} />
        </div>
      </div>

      {/* Items table */}
      <div className="glass rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">Itens do orçamento</p>
          <Button size="sm" variant="outline" onClick={addItem} className="gap-1.5 text-xs">
            <Plus size={14} /> Adicionar
          </Button>
        </div>

        {items.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">Nenhum item adicionado.</p>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-[1fr_50px_70px_70px_28px] gap-1.5 text-[10px] font-medium text-muted-foreground px-1">
              <span>Serviço</span><span>Qtd</span><span>Valor</span><span>Total</span><span />
            </div>

            {items.map(item => (
              <div key={item.id} className="grid grid-cols-[1fr_50px_70px_70px_28px] gap-1.5 items-center">
                <Input
                  className="h-8 text-xs"
                  value={item.description}
                  onChange={e => updateItem(item.id, 'description', e.target.value)}
                  placeholder="Serviço..."
                />
                <Input
                  className="h-8 text-xs text-center"
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={e => updateItem(item.id, 'quantity', Number(e.target.value))}
                />
                <Input
                  className="h-8 text-xs"
                  type="number"
                  min={0}
                  step={0.01}
                  value={item.unit_price}
                  onChange={e => updateItem(item.id, 'unit_price', Number(e.target.value))}
                />
                <div className="text-xs font-medium text-primary text-right pr-1">
                  {(Number(item.quantity) * Number(item.unit_price)).toFixed(2).replace('.', ',')}
                </div>
                <button onClick={() => removeItem(item.id)} className="text-destructive hover:text-destructive/80">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}

            <div className="flex justify-between items-center pt-3 border-t border-border/50">
              <span className="text-sm font-semibold">Total</span>
              <span className="text-lg font-bold text-primary">
                R$ {grandTotal.toFixed(2).replace('.', ',')}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <Button onClick={downloadPDF} variant="outline" className="w-full gap-2 justify-start">
          <Download size={16} /> Baixar PDF
        </Button>
        <Button onClick={shareWhatsApp} className="w-full gap-2 justify-start bg-income hover:bg-income/90 text-income-foreground">
          <MessageCircle size={16} /> Enviar no WhatsApp
        </Button>
        {budget.status !== 'paid' && (
          <Button onClick={registerPayment} variant="outline" className="w-full gap-2 justify-start">
            <DollarSign size={16} /> Registrar Pagamento
          </Button>
        )}
      </div>
    </div>
  );
}
