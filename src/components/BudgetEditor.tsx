import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useFinance } from '@/contexts/FinanceContext';
import { ArrowLeft, Plus, Trash2, Download, MessageCircle, DollarSign, Save, Loader2, Check, Package, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import CatalogPicker from '@/components/CatalogPicker';
import PaymentDetails, { getDefaultPaymentState, calcNetAmount, type PaymentState } from '@/components/PaymentDetails';
import BudgetPaymentMethods, { parsePaymentMethodsFromDb, serializePaymentMethods, formatPaymentMethods, type PaymentMethodEntry } from '@/components/BudgetPaymentMethods';

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
  client_id: string | null;
  service_description: string;
  date: string;
  notes: string;
  status: string;
  total: number;
  quote_number: number;
  validity_days: number;
  payment_method: string;
}

interface BusinessProfileData {
  business_name: string;
  cnpj: string;
  phone: string;
  email: string;
  address: string;
  logo_url: string;
  signature_url: string;
}

interface ClientOption {
  id: string;
  name: string;
  phone: string;
  email: string;
}

interface Props {
  budgetId: string;
  onClose: () => void;
}

const AUTO_SAVE_INTERVAL = 5000;
// Payment methods now handled by BudgetPaymentMethods component
const STATUSES = [
  { value: 'draft', label: 'Rascunho' },
  { value: 'sent', label: 'Enviado' },
  { value: 'waiting', label: 'Aguardando resposta' },
  { value: 'approved', label: 'Aprovado' },
  { value: 'rejected', label: 'Rejeitado' },
  { value: 'paid', label: 'Pago' },
];

export default function BudgetEditor({ budgetId, onClose }: Props) {
  const { user } = useAuth();
  const { addTransaction } = useFinance();
  const { toast } = useToast();
  const [budget, setBudget] = useState<BudgetData>({
    client_name: '', client_contact: '', client_id: null, service_description: '',
    date: new Date().toISOString().slice(0, 10),
    notes: '', status: 'draft', total: 0, quote_number: 0,
    validity_days: 30, payment_method: '',
  });
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [bizProfile, setBizProfile] = useState<BusinessProfileData | null>(null);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [payment, setPayment] = useState<PaymentState>(getDefaultPaymentState());
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodEntry[]>([]);
  const lastSavedRef = useRef<string>('');

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [{ data: bData }, { data: iData }, { data: bpData }, { data: cData }] = await Promise.all([
      supabase.from('budgets').select('*').eq('id', budgetId).single(),
      supabase.from('budget_items').select('*').eq('budget_id', budgetId).order('sort_order'),
      supabase.from('business_profile').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('clients').select('id, name, phone, email').eq('user_id', user.id).order('name'),
    ]);
    if (bData) {
      setBudget({
        client_name: bData.client_name ?? '',
        client_contact: (bData as any).client_contact ?? '',
        client_id: (bData as any).client_id ?? null,
        service_description: bData.service_description ?? '',
        date: bData.date ?? new Date().toISOString().slice(0, 10),
        notes: bData.notes ?? '',
        status: bData.status ?? 'draft',
        total: Number(bData.total) || 0,
        quote_number: (bData as any).quote_number ?? 0,
        validity_days: (bData as any).validity_days ?? 30,
        payment_method: (bData as any).payment_method ?? '',
      });
      setPaymentMethods(parsePaymentMethodsFromDb((bData as any).payment_method));
    }
    if (bpData) {
      const rawLogo = (bpData as any).logo_url ?? '';
      const rawSig = (bpData as any).signature_url ?? '';

      // Generate fresh signed URLs from stored paths
      const resolveUrl = async (val: string) => {
        if (!val) return '';
        const path = val.startsWith('http')
          ? val.match(/business-assets\/([^?]+)/)?.[1] || ''
          : val;
        if (!path) return '';
        const { data: s } = await supabase.storage.from('business-assets').createSignedUrl(path, 3600);
        return s?.signedUrl || '';
      };

      const [logoUrl, sigUrl] = await Promise.all([resolveUrl(rawLogo), resolveUrl(rawSig)]);

      setBizProfile({
        business_name: (bpData as any).business_name ?? '',
        cnpj: (bpData as any).cnpj ?? '',
        phone: (bpData as any).phone ?? '',
        email: (bpData as any).email ?? '',
        address: (bpData as any).address ?? '',
        logo_url: logoUrl,
        signature_url: sigUrl,
      });
    }
    setClients((cData as ClientOption[]) ?? []);
    setItems((iData as BudgetItem[]) ?? []);
    setLoading(false);
  }, [budgetId, user]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (!user) return;
      const snapshot = JSON.stringify({ budget, items, paymentMethods });
      if (snapshot !== lastSavedRef.current && !loading) {
        setAutoSaveStatus('saving');
        await saveToDb();
        lastSavedRef.current = snapshot;
        setTimeout(() => setAutoSaveStatus('saved'), 300);
        setTimeout(() => setAutoSaveStatus('idle'), 2000);
      }
    }, AUTO_SAVE_INTERVAL);
    return () => clearInterval(interval);
  }, [budget, items, paymentMethods, user, loading]);

  function updateField(field: keyof BudgetData, value: string | number | null) {
    setBudget(b => ({ ...b, [field]: value }));
  }

  function selectClient(clientId: string) {
    if (clientId === 'none') {
      updateField('client_id', null);
      return;
    }
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setBudget(b => ({
        ...b,
        client_id: client.id,
        client_name: client.name,
        client_contact: client.phone || client.email || '',
      }));
    }
  }

  function addItem() {
    setItems([...items, {
      id: crypto.randomUUID(), description: '', quantity: 1,
      unit_price: 0, total: 0, sort_order: items.length, isNew: true,
    }]);
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

  function addFromCatalog(catalogItem: { description: string; quantity: number; unit_price: number }) {
    setItems(prev => [...prev, {
      id: crypto.randomUUID(),
      description: catalogItem.description,
      quantity: catalogItem.quantity,
      unit_price: catalogItem.unit_price,
      total: catalogItem.quantity * catalogItem.unit_price,
      sort_order: prev.length, isNew: true,
    }]);
  }

  const grandTotal = items.reduce((s, i) => s + (Number(i.quantity) * Number(i.unit_price)), 0);
  const { discountAmount, netAmount: netTotal } = calcNetAmount(grandTotal, payment);
  const quoteLabel = budget.quote_number ? String(budget.quote_number).padStart(5, '0') : '—';

  async function saveToDb() {
    if (!user) return;
    await supabase.from('budgets').update({
      client_name: budget.client_name,
      client_contact: budget.client_contact,
      client_id: budget.client_id,
      service_description: budget.service_description,
      date: budget.date,
      notes: budget.notes,
      status: budget.status,
      total: grandTotal,
      validity_days: budget.validity_days,
      payment_method: serializePaymentMethods(paymentMethods),
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
    // Neutral professional colors (graphite/dark gray)
    const accentColor: [number, number, number] = [55, 55, 65];
    const darkText: [number, number, number] = [30, 30, 30];
    const grayText: [number, number, number] = [100, 100, 100];
    const lightGray: [number, number, number] = [220, 220, 220];
    const bp = bizProfile;

    // Header line - neutral dark black
    doc.setDrawColor(30, 30, 30);
    doc.setLineWidth(2);
    doc.line(0, 0, pw, 0);

    let headerY = 14;
    let logoEndX = 14;
    if (bp?.logo_url) {
      try { doc.addImage(bp.logo_url, 'PNG', 14, 6, 22, 22); logoEndX = 40; } catch {}
    }

    const headerName = bp?.business_name || 'FinControl';
    doc.setFontSize(bp?.business_name ? 16 : 20);
    doc.setTextColor(30, 30, 30);
    doc.setFont('helvetica', 'bold');
    doc.text(headerName, logoEndX, headerY + 4);

    if (bp && (bp.cnpj || bp.phone || bp.email || bp.address)) {
      doc.setFontSize(7);
      doc.setTextColor(grayText[0], grayText[1], grayText[2]);
      doc.setFont('helvetica', 'normal');
      let infoY = headerY + 9;
      if (bp.cnpj) { doc.text(`CNPJ: ${bp.cnpj}`, logoEndX, infoY); infoY += 4; }
      const parts: string[] = [];
      if (bp.phone) parts.push(bp.phone);
      if (bp.email) parts.push(bp.email);
      if (parts.length > 0) { doc.text(parts.join('  •  '), logoEndX, infoY); infoY += 4; }
      if (bp.address) doc.text(bp.address, logoEndX, infoY);
    }

    doc.setFontSize(16);
    doc.setTextColor(darkText[0], darkText[1], darkText[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('ORÇAMENTO', pw - 14, 18, { align: 'right' });

    const sepY = bp?.logo_url ? 32 : 25;
    doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.setLineWidth(0.5);
    doc.line(14, sepY, pw - 14, sepY);

    let y = sepY + 9;
    const lh = 6;
    const infoItems = [
      ['Orçamento #', quoteLabel],
      ['Data', budget.date ? new Date(budget.date + 'T12:00:00').toLocaleDateString('pt-BR') : '—'],
      ['Validade', `${budget.validity_days} dias`],
      ['Cliente', budget.client_name || '—'],
    ];
    if (budget.client_contact) infoItems.push(['Contato', budget.client_contact]);
    if (budget.service_description) infoItems.push(['Serviço', budget.service_description]);
    const paymentMethodsText = formatPaymentMethods(paymentMethods);
    if (paymentMethodsText) infoItems.push(['Pagamento', paymentMethodsText]);

    doc.setFontSize(10);
    for (const [label, value] of infoItems) {
      doc.setTextColor(grayText[0], grayText[1], grayText[2]);
      doc.setFont('helvetica', 'bold');
      doc.text(`${label}:`, 14, y);
      doc.setTextColor(darkText[0], darkText[1], darkText[2]);
      doc.setFont('helvetica', 'normal');
      doc.text(value, 55, y);
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

    const tableData = items.map(i => [
      i.description || '—',
      String(i.quantity),
      fmtBRL(Number(i.unit_price)),
      fmtBRL(Number(i.quantity) * Number(i.unit_price)),
    ]);

    autoTable(doc, {
      startY: y,
      head: [['Descrição', 'Qtd', 'Valor Unit.', 'Total']],
      body: tableData,
      foot: [['', '', 'SUBTOTAL', fmtBRL(grandTotal)]],
      theme: 'plain',
      styles: { fontSize: 10, cellPadding: 4, textColor: darkText, lineColor: lightGray, lineWidth: 0.5 },
      headStyles: { fillColor: [240, 240, 242], textColor: accentColor, fontStyle: 'bold', fontSize: 10, lineColor: [200, 200, 200], lineWidth: 0.5 },
      footStyles: { fillColor: [240, 240, 242], textColor: darkText, fontStyle: 'bold', fontSize: 11, lineColor: [200, 200, 200], lineWidth: 0.5 },
      bodyStyles: { fontSize: 10, textColor: [50, 50, 50] },
      alternateRowStyles: { fillColor: [250, 250, 252] },
      columnStyles: { 0: { cellWidth: 'auto' }, 1: { cellWidth: 22, halign: 'center' }, 2: { cellWidth: 38, halign: 'right' }, 3: { cellWidth: 38, halign: 'right' } },
      margin: { left: 14, right: 14 },
    });

    // Payment details (discount, fees, net) after table
    const hasPaymentDetails = payment.hasDiscount || payment.cardFee > 0 || payment.paymentInterest > 0;
    if (hasPaymentDetails) {
      const tableEndY = (doc as any).lastAutoTable?.finalY ?? y + 40;
      let py = tableEndY + 6;
      doc.setFontSize(10);
      doc.setTextColor(grayText[0], grayText[1], grayText[2]);

      if (payment.hasDiscount && discountAmount > 0) {
        const discLabel = payment.discountType === 'percentage' ? `Desconto (${payment.discountValue}%)` : 'Desconto';
        doc.setFont('helvetica', 'normal');
        doc.text(discLabel, pw - 14 - 50, py, { align: 'right' });
        doc.text(`- ${fmtBRL(discountAmount)}`, pw - 14, py, { align: 'right' });
        py += 5;
      }

      const isCard = payment.paymentMethod === 'credit' || payment.paymentMethod === 'debit';
      if (isCard && payment.cardFee > 0) {
        const feeAmount = (grandTotal - discountAmount) * (payment.cardFee / 100);
        doc.setFont('helvetica', 'normal');
        doc.text(`Taxa cartão (${payment.cardFee}%)`, pw - 14 - 50, py, { align: 'right' });
        doc.text(`- ${fmtBRL(feeAmount)}`, pw - 14, py, { align: 'right' });
        py += 5;
      }

      if (isCard && payment.paymentInterest > 0) {
        doc.setFont('helvetica', 'normal');
        doc.text('Juros', pw - 14 - 50, py, { align: 'right' });
        doc.text(`- ${fmtBRL(payment.paymentInterest)}`, pw - 14, py, { align: 'right' });
        py += 5;
      }

      py += 2;
      doc.setTextColor(darkText[0], darkText[1], darkText[2]);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('VALOR LÍQUIDO', pw - 14 - 50, py, { align: 'right' });
      doc.text(fmtBRL(netTotal), pw - 14, py, { align: 'right' });
    }

    // Footer
    const footerTop = ph - 48;
    if (bp?.signature_url) {
      try {
        doc.addImage(bp.signature_url, 'PNG', 14, footerTop - 10, 40, 20);
        doc.setFontSize(8);
        doc.setTextColor(darkText[0], darkText[1], darkText[2]);
        doc.setFont('helvetica', 'normal');
        doc.text(bp.business_name || '', 14, footerTop + 14);
      } catch {}
    }

    doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.setLineWidth(0.5);
    doc.line(14, ph - 28, pw - 14, ph - 28);

    doc.setFontSize(10);
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.text(bp?.business_name || 'FinControl', pw / 2, ph - 20, { align: 'center' });

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
    const pmText = formatPaymentMethods(paymentMethods);
    const paymentLine = pmText ? `\nForma de pagamento: ${pmText}` : '';
    const validityLine = `\nValidade: ${budget.validity_days} dias`;

    let totalSection = `\n*Subtotal: ${fmtBRL(grandTotal)}*`;
    const hasPaymentInfo = payment.hasDiscount || payment.cardFee > 0 || payment.paymentInterest > 0;
    if (hasPaymentInfo) {
      if (payment.hasDiscount && discountAmount > 0) {
        totalSection += `\nDesconto: - ${fmtBRL(discountAmount)}`;
      }
      const isCard = payment.paymentMethod === 'credit' || payment.paymentMethod === 'debit';
      if (isCard && payment.cardFee > 0) {
        const feeAmt = (grandTotal - discountAmount) * (payment.cardFee / 100);
        totalSection += `\nTaxa cartão: - ${fmtBRL(feeAmt)}`;
      }
      if (isCard && payment.paymentInterest > 0) {
        totalSection += `\nJuros: - ${fmtBRL(payment.paymentInterest)}`;
      }
      totalSection += `\n*Valor líquido: ${fmtBRL(netTotal)}*`;
    }

    const text = encodeURIComponent(
      `*Orçamento #${quoteLabel} — ${bizProfile?.business_name || 'FinControl'}*\n\nCliente: ${budget.client_name || '—'}${budget.client_contact ? `\nContato: ${budget.client_contact}` : ''}\nServiço: ${budget.service_description || '—'}\nData: ${budget.date ? new Date(budget.date + 'T12:00:00').toLocaleDateString('pt-BR') : '—'}${validityLine}${paymentLine}\n\n${lines.join('\n')}${totalSection}\n\n${budget.notes ? `Obs: ${budget.notes}\n\n` : ''}Gerado com FinControl\nfincontrolapp.com`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  }

  function registerPayment() {
    if (!user) return;
    const hasPaymentInfo = payment.hasDiscount || payment.cardFee > 0 || payment.paymentInterest > 0;
    addTransaction({
      type: 'income',
      amount: grandTotal,
      category: 'servicos',
      description: `Pagamento: ${budget.client_name} — ${budget.service_description}`.slice(0, 100),
      date: new Date().toISOString().slice(0, 10),
      isRecurring: false,
      discountType: payment.hasDiscount ? payment.discountType : null,
      discountValue: payment.hasDiscount ? payment.discountValue : 0,
      discountReason: payment.discountReason || null,
      paymentMethod: payment.paymentMethod || null,
      cardType: (payment.paymentMethod === 'credit' || payment.paymentMethod === 'debit') ? payment.cardType : null,
      installments: (payment.paymentMethod === 'credit' || payment.paymentMethod === 'debit') ? payment.installments : null,
      cardFee: payment.cardFee,
      paymentInterest: payment.paymentInterest,
      netAmount: hasPaymentInfo ? netTotal : null,
    });
    supabase.from('budgets').update({ status: 'paid', updated_at: new Date().toISOString() } as any).eq('id', budgetId).then(() => {
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
    <div className="page-container pt-6 pb-24 space-y-5 animate-fade-in">
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
        {/* Client selector */}
        {clients.length > 0 && (
          <div>
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Users size={12} /> Selecionar cliente
            </label>
            <Select value={budget.client_id || 'none'} onValueChange={selectClient}>
              <SelectTrigger><SelectValue placeholder="Selecionar cliente" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Digitar manualmente</SelectItem>
                {clients.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <div>
          <label className="text-xs font-medium text-muted-foreground">Nome do cliente</label>
          <Input value={budget.client_name} onChange={e => updateField('client_name', e.target.value)} placeholder="Ex: João Silva" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Contato do cliente</label>
          <Input value={budget.client_contact} onChange={e => updateField('client_contact', e.target.value)} placeholder="Ex: (11) 99999-0000" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Descrição do serviço</label>
          <Input value={budget.service_description} onChange={e => updateField('service_description', e.target.value)} placeholder="Ex: Manutenção automotiva" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Data</label>
            <Input type="date" value={budget.date} onChange={e => updateField('date', e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Validade (dias)</label>
            <Input type="number" min={1} value={budget.validity_days} onChange={e => updateField('validity_days', Number(e.target.value))} />
          </div>
        </div>
        <div>
            <label className="text-xs font-medium text-muted-foreground">Status</label>
            <Select value={budget.status} onValueChange={v => updateField('status', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUSES.map(s => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
        </div>
        <BudgetPaymentMethods methods={paymentMethods} onChange={setPaymentMethods} />
        <div>
          <label className="text-xs font-medium text-muted-foreground">Observações</label>
          <Textarea value={budget.notes} onChange={e => updateField('notes', e.target.value)} placeholder="Notas adicionais..." rows={2} />
        </div>
      </div>

      {/* Items */}
      <div className="glass rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">Itens do orçamento</p>
          <div className="flex gap-1.5">
            <Button size="sm" variant="outline" onClick={() => setCatalogOpen(true)} className="gap-1.5 text-xs">
              <Package size={14} /> Catálogo
            </Button>
            <Button size="sm" variant="outline" onClick={addItem} className="gap-1.5 text-xs">
              <Plus size={14} /> Manual
            </Button>
          </div>
        </div>

        {items.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">Nenhum item adicionado.</p>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-[1fr_50px_70px_70px_28px] gap-1.5 text-[10px] font-medium text-muted-foreground px-1">
              <span>Descrição</span><span>Qtd</span><span>Valor</span><span>Total</span><span />
            </div>
            {items.map(item => (
              <div key={item.id} className="grid grid-cols-[1fr_50px_70px_70px_28px] gap-1.5 items-center">
                <Input className="h-8 text-xs" value={item.description} onChange={e => updateItem(item.id, 'description', e.target.value)} placeholder="Descrição..." />
                <Input className="h-8 text-xs text-center" type="number" min={1} value={item.quantity} onChange={e => updateItem(item.id, 'quantity', Number(e.target.value))} />
                <Input className="h-8 text-xs" type="number" min={0} step={0.01} value={item.unit_price} onChange={e => updateItem(item.id, 'unit_price', Number(e.target.value))} />
                <div className="text-xs font-medium text-primary text-right pr-1">
                  {(Number(item.quantity) * Number(item.unit_price)).toFixed(2).replace('.', ',')}
                </div>
                <button onClick={() => removeItem(item.id)} className="text-destructive hover:text-destructive/80">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <div className="flex justify-between items-center pt-3 border-t border-border/50">
              <span className="text-sm font-semibold">Total bruto</span>
              <span className="text-lg font-bold text-primary">R$ {grandTotal.toFixed(2).replace('.', ',')}</span>
            </div>
          </div>
        )}

        {/* Desconto / Cartão / Valor líquido */}
        {grandTotal > 0 && (
          <PaymentDetails amount={grandTotal} state={payment} onChange={setPayment} />
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

      <CatalogPicker open={catalogOpen} onOpenChange={setCatalogOpen} onSelect={addFromCatalog} />
    </div>
  );
}
