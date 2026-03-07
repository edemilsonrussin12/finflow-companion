import { Transaction, Sale } from '@/types/finance';
import { formatCurrency } from '@/lib/format';
import { Goal } from '@/types/goals';

function escapeCSV(val: string): string {
  if (val.includes(',') || val.includes('"') || val.includes('\n')) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

function triggerDownload(content: string, filename: string, mimeType: string) {
  // Add BOM for Excel UTF-8 compatibility
  const bom = '\uFEFF';
  const blob = new Blob([bom + content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportTransactionsCSV(transactions: Transaction[], month: string) {
  const headers = ['Data', 'Tipo', 'Categoria', 'Descrição', 'Valor'];
  const rows = transactions.map(t => [
    t.date,
    t.type === 'income' ? 'Entrada' : 'Saída',
    t.category,
    escapeCSV(t.description),
    formatCurrency(t.amount),
  ]);
  const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
  triggerDownload(csv, `transacoes-${month}.csv`, 'text/csv');
}

export function exportSalesCSV(sales: Sale[], month: string) {
  const headers = ['Data', 'Produto', 'Quantidade', 'Valor Total'];
  const rows = sales.map(s => [
    s.date,
    escapeCSV(s.product),
    String(s.quantity),
    formatCurrency(s.totalValue),
  ]);
  const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
  triggerDownload(csv, `vendas-${month}.csv`, 'text/csv');
}

export function exportReportCSV(
  month: string,
  income: number,
  expense: number,
  balance: number,
  savingsRate: number,
  topCategory: string,
  categoryData: { name: string; value: number }[],
  goals: Goal[],
) {
  const lines: string[] = [];
  lines.push('Relatório Financeiro');
  lines.push(`Mês;${month}`);
  lines.push('');
  lines.push('Resumo');
  lines.push(`Receitas;${formatCurrency(income)}`);
  lines.push(`Despesas;${formatCurrency(expense)}`);
  lines.push(`Saldo;${formatCurrency(balance)}`);
  lines.push(`Taxa de economia;${savingsRate.toFixed(1)}%`);
  lines.push(`Maior categoria;${topCategory}`);
  lines.push('');
  lines.push('Despesas por Categoria');
  lines.push('Categoria;Valor;%');
  const totalExp = categoryData.reduce((s, c) => s + c.value, 0);
  categoryData.forEach(c => {
    const pct = totalExp > 0 ? ((c.value / totalExp) * 100).toFixed(1) : '0';
    lines.push(`${c.name};${formatCurrency(c.value)};${pct}%`);
  });

  if (goals.length > 0) {
    lines.push('');
    lines.push('Metas Financeiras');
    lines.push('Meta;Atual;Alvo;Progresso;Status');
    goals.forEach(g => {
      const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
      lines.push(`${escapeCSV(g.title)};${formatCurrency(g.currentAmount)};${formatCurrency(g.targetAmount)};${pct}%;${g.status}`);
    });
  }

  triggerDownload(lines.join('\n'), `relatorio-${month}.csv`, 'text/csv');
}

// Excel-compatible XML format (opens natively in Excel/LibreOffice)
export function exportReportExcel(
  month: string,
  income: number,
  expense: number,
  balance: number,
  savingsRate: number,
  topCategory: string,
  categoryData: { name: string; value: number }[],
  goals: Goal[],
  transactions: Transaction[],
) {
  const totalExp = categoryData.reduce((s, c) => s + c.value, 0);

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
<Styles>
  <Style ss:ID="header"><Font ss:Bold="1" ss:Size="11"/></Style>
  <Style ss:ID="currency"><NumberFormat ss:Format="#,##0.00"/></Style>
  <Style ss:ID="title"><Font ss:Bold="1" ss:Size="14"/></Style>
</Styles>
<Worksheet ss:Name="Resumo">
<Table>
  <Row><Cell ss:StyleID="title"><Data ss:Type="String">Relatório Financeiro - ${month}</Data></Cell></Row>
  <Row></Row>
  <Row><Cell ss:StyleID="header"><Data ss:Type="String">Métrica</Data></Cell><Cell ss:StyleID="header"><Data ss:Type="String">Valor</Data></Cell></Row>
  <Row><Cell><Data ss:Type="String">Receitas</Data></Cell><Cell ss:StyleID="currency"><Data ss:Type="Number">${income}</Data></Cell></Row>
  <Row><Cell><Data ss:Type="String">Despesas</Data></Cell><Cell ss:StyleID="currency"><Data ss:Type="Number">${expense}</Data></Cell></Row>
  <Row><Cell><Data ss:Type="String">Saldo</Data></Cell><Cell ss:StyleID="currency"><Data ss:Type="Number">${balance}</Data></Cell></Row>
  <Row><Cell><Data ss:Type="String">Taxa de economia</Data></Cell><Cell><Data ss:Type="String">${savingsRate.toFixed(1)}%</Data></Cell></Row>
  <Row><Cell><Data ss:Type="String">Maior categoria</Data></Cell><Cell><Data ss:Type="String">${topCategory}</Data></Cell></Row>
</Table>
</Worksheet>
<Worksheet ss:Name="Categorias">
<Table>
  <Row><Cell ss:StyleID="header"><Data ss:Type="String">Categoria</Data></Cell><Cell ss:StyleID="header"><Data ss:Type="String">Valor</Data></Cell><Cell ss:StyleID="header"><Data ss:Type="String">%</Data></Cell></Row>
  ${categoryData.map(c => `<Row><Cell><Data ss:Type="String">${c.name}</Data></Cell><Cell ss:StyleID="currency"><Data ss:Type="Number">${c.value}</Data></Cell><Cell><Data ss:Type="String">${totalExp > 0 ? ((c.value / totalExp) * 100).toFixed(1) : '0'}%</Data></Cell></Row>`).join('\n  ')}
</Table>
</Worksheet>
<Worksheet ss:Name="Transações">
<Table>
  <Row><Cell ss:StyleID="header"><Data ss:Type="String">Data</Data></Cell><Cell ss:StyleID="header"><Data ss:Type="String">Tipo</Data></Cell><Cell ss:StyleID="header"><Data ss:Type="String">Categoria</Data></Cell><Cell ss:StyleID="header"><Data ss:Type="String">Descrição</Data></Cell><Cell ss:StyleID="header"><Data ss:Type="String">Valor</Data></Cell></Row>
  ${transactions.map(t => `<Row><Cell><Data ss:Type="String">${t.date}</Data></Cell><Cell><Data ss:Type="String">${t.type === 'income' ? 'Entrada' : 'Saída'}</Data></Cell><Cell><Data ss:Type="String">${t.category}</Data></Cell><Cell><Data ss:Type="String">${t.description.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</Data></Cell><Cell ss:StyleID="currency"><Data ss:Type="Number">${t.amount}</Data></Cell></Row>`).join('\n  ')}
</Table>
</Worksheet>
${goals.length > 0 ? `<Worksheet ss:Name="Metas">
<Table>
  <Row><Cell ss:StyleID="header"><Data ss:Type="String">Meta</Data></Cell><Cell ss:StyleID="header"><Data ss:Type="String">Atual</Data></Cell><Cell ss:StyleID="header"><Data ss:Type="String">Alvo</Data></Cell><Cell ss:StyleID="header"><Data ss:Type="String">Progresso</Data></Cell><Cell ss:StyleID="header"><Data ss:Type="String">Status</Data></Cell></Row>
  ${goals.map(g => `<Row><Cell><Data ss:Type="String">${g.title.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</Data></Cell><Cell ss:StyleID="currency"><Data ss:Type="Number">${g.currentAmount}</Data></Cell><Cell ss:StyleID="currency"><Data ss:Type="Number">${g.targetAmount}</Data></Cell><Cell><Data ss:Type="String">${Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100))}%</Data></Cell><Cell><Data ss:Type="String">${g.status}</Data></Cell></Row>`).join('\n  ')}
</Table>
</Worksheet>` : ''}
</Workbook>`;

  triggerDownload(xml, `relatorio-${month}.xls`, 'application/vnd.ms-excel');
}
