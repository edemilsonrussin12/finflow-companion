export type AssetType = 'acao' | 'fii' | 'cripto' | 'tesouro' | 'renda_fixa' | 'outro';
export type DividendType = 'dividendo' | 'jcp' | 'rendimento' | 'cupom' | 'outro';

export const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  acao: 'Ação',
  fii: 'FII',
  cripto: 'Cripto',
  tesouro: 'Tesouro',
  renda_fixa: 'Renda Fixa',
  outro: 'Outro',
};

export const DIVIDEND_TYPE_LABELS: Record<DividendType, string> = {
  dividendo: 'Dividendo',
  jcp: 'JCP',
  rendimento: 'Rendimento',
  cupom: 'Cupom',
  outro: 'Outro',
};

export interface PortfolioAsset {
  id: string;
  user_id: string;
  asset_type: AssetType;
  asset_name: string;
  ticker: string | null;
  quantity: number;
  average_price: number;
  total_invested: number;
  purchase_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PortfolioDividend {
  id: string;
  user_id: string;
  asset_id: string;
  dividend_type: DividendType;
  amount: number;
  received_date: string;
  notes: string | null;
  created_at: string;
}
