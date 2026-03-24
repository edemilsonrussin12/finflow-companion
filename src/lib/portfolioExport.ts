import { formatCurrency } from '@/lib/format';
import { ASSET_TYPE_LABELS, DIVIDEND_TYPE_LABELS, type PortfolioAsset, type PortfolioDividend } from '@/types/portfolio';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function triggerDownload(content: string, filename: string, mimeType: string) {
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

export function exportPortfolioExcel(assets: PortfolioAsset[], dividends: PortfolioDividend[]) {
  const totalInvested = assets.reduce((s, a) => s + a.total_invested, 0);
  const totalDividends = dividends.reduce((s, d) => s + d.amount, 0);

  const assetMap = new Map(assets.map(a => [a.id, a]));

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
<Styles>
  <Style ss:ID="header"><Font ss:Bold="1" ss:Size="11"/></Style>
  <Style ss:ID="currency"><NumberFormat ss:Format="#,##0.00"/></Style>
  <Style ss:ID="title"><Font ss:Bold="1" ss:Size="14"/></Style>
</Styles>
<Worksheet ss:Name="Carteira">
<Table>
  <Row><Cell ss:StyleID="header"><Data ss:Type="String">Tipo</Data></Cell><Cell ss:StyleID="header"><Data ss:Type="String">Nome</Data></Cell><Cell ss:StyleID="header"><Data ss:Type="String">Ticker</Data></Cell><Cell ss:StyleID="header"><Data ss:Type="String">Quantidade</Data></Cell><Cell ss:StyleID="header"><Data ss:Type="String">Preço Médio</Data></Cell><Cell ss:StyleID="header"><Data ss:Type="String">Total Investido</Data></Cell><Cell ss:StyleID="header"><Data ss:Type="String">Data Compra</Data></Cell></Row>
  ${assets.map(a => `<Row><Cell><Data ss:Type="String">${ASSET_TYPE_LABELS[a.asset_type] || a.asset_type}</Data></Cell><Cell><Data ss:Type="String">${a.asset_name.replace(/&/g, '&amp;')}</Data></Cell><Cell><Data ss:Type="String">${a.ticker || '-'}</Data></Cell><Cell ss:StyleID="currency"><Data ss:Type="Number">${a.quantity}</Data></Cell><Cell ss:StyleID="currency"><Data ss:Type="Number">${a.average_price}</Data></Cell><Cell ss:StyleID="currency"><Data ss:Type="Number">${a.total_invested}</Data></Cell><Cell><Data ss:Type="String">${a.purchase_date || '-'}</Data></Cell></Row>`).join('\n  ')}
</Table>
</Worksheet>
<Worksheet ss:Name="Proventos">
<Table>
  <Row><Cell ss:StyleID="header"><Data ss:Type="String">Ativo</Data></Cell><Cell ss:StyleID="header"><Data ss:Type="String">Tipo</Data></Cell><Cell ss:StyleID="header"><Data ss:Type="String">Valor</Data></Cell><Cell ss:StyleID="header"><Data ss:Type="String">Data</Data></Cell></Row>
  ${dividends.map(d => {
    const asset = assetMap.get(d.asset_id);
    return `<Row><Cell><Data ss:Type="String">${(asset?.asset_name || 'Ativo removido').replace(/&/g, '&amp;')}</Data></Cell><Cell><Data ss:Type="String">${DIVIDEND_TYPE_LABELS[d.dividend_type] || d.dividend_type}</Data></Cell><Cell ss:StyleID="currency"><Data ss:Type="Number">${d.amount}</Data></Cell><Cell><Data ss:Type="String">${d.received_date}</Data></Cell></Row>`;
  }).join('\n  ')}
</Table>
</Worksheet>
<Worksheet ss:Name="Resumo">
<Table>
  <Row><Cell ss:StyleID="title"><Data ss:Type="String">Resumo da Carteira</Data></Cell></Row>
  <Row></Row>
  <Row><Cell ss:StyleID="header"><Data ss:Type="String">Métrica</Data></Cell><Cell ss:StyleID="header"><Data ss:Type="String">Valor</Data></Cell></Row>
  <Row><Cell><Data ss:Type="String">Total Investido</Data></Cell><Cell ss:StyleID="currency"><Data ss:Type="Number">${totalInvested}</Data></Cell></Row>
  <Row><Cell><Data ss:Type="String">Total Proventos</Data></Cell><Cell ss:StyleID="currency"><Data ss:Type="Number">${totalDividends}</Data></Cell></Row>
  <Row><Cell><Data ss:Type="String">Ativos Cadastrados</Data></Cell><Cell><Data ss:Type="Number">${assets.length}</Data></Cell></Row>
</Table>
</Worksheet>
</Workbook>`;

  triggerDownload(xml, `carteira-investimentos.xls`, 'application/vnd.ms-excel');
}

export function exportPortfolioPDF(assets: PortfolioAsset[], dividends: PortfolioDividend[]) {
  const doc = new jsPDF();
  const totalInvested = assets.reduce((s, a) => s + a.total_invested, 0);
  const totalDividends = dividends.reduce((s, d) => s + d.amount, 0);
  const assetMap = new Map(assets.map(a => [a.id, a]));

  // Header
  doc.setFontSize(18);
  doc.text('Carteira de Investimentos', 14, 20);
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')}`, 14, 27);
  doc.setTextColor(0);

  // Summary
  doc.setFontSize(12);
  doc.text('Resumo', 14, 38);
  doc.setFontSize(10);
  doc.text(`Total investido: ${formatCurrency(totalInvested)}`, 14, 45);
  doc.text(`Total proventos: ${formatCurrency(totalDividends)}`, 14, 51);
  doc.text(`Ativos cadastrados: ${assets.length}`, 14, 57);

  // Assets table
  if (assets.length > 0) {
    doc.setFontSize(12);
    doc.text('Ativos', 14, 68);
    autoTable(doc, {
      startY: 72,
      head: [['Tipo', 'Nome', 'Ticker', 'Qtd', 'Preço Médio', 'Total']],
      body: assets.map(a => [
        ASSET_TYPE_LABELS[a.asset_type] || a.asset_type,
        a.asset_name,
        a.ticker || '-',
        String(a.quantity),
        formatCurrency(a.average_price),
        formatCurrency(a.total_invested),
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [50, 50, 50] },
    });
  }

  // Dividends table
  if (dividends.length > 0) {
    const finalY = (doc as any).lastAutoTable?.finalY || 80;
    doc.setFontSize(12);
    doc.text('Proventos', 14, finalY + 12);
    autoTable(doc, {
      startY: finalY + 16,
      head: [['Ativo', 'Tipo', 'Valor', 'Data']],
      body: dividends.map(d => [
        assetMap.get(d.asset_id)?.asset_name || 'Removido',
        DIVIDEND_TYPE_LABELS[d.dividend_type] || d.dividend_type,
        formatCurrency(d.amount),
        new Date(d.received_date + 'T12:00:00').toLocaleDateString('pt-BR'),
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [50, 50, 50] },
    });
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('FinControl – Controle inteligente do seu dinheiro | fincontrolapp.com', 14, doc.internal.pageSize.height - 10);
  }

  doc.save('carteira-investimentos.pdf');
}
