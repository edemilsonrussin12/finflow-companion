export type CategoryType = 'income' | 'expense' | 'investment';

export interface CategoryDefinition {
  id: string;
  name: string;
  type: CategoryType;
  parentId?: string;
  emoji?: string;
}

// ── INCOME ──
const INCOME_CATEGORIES: CategoryDefinition[] = [
  { id: 'salary', name: 'Salário', type: 'income', emoji: '💰' },
  { id: 'business-income', name: 'Renda Empresarial', type: 'income', emoji: '🏢' },
  { id: 'freelance', name: 'Freelance', type: 'income', emoji: '💻' },
  { id: 'extra-income', name: 'Renda Extra', type: 'income', emoji: '✨' },
  { id: 'sales-income', name: 'Vendas', type: 'income', emoji: '🛒' },
  { id: 'dividends', name: 'Dividendos', type: 'income', emoji: '📈' },
  { id: 'cashback', name: 'Cashback', type: 'income', emoji: '💸' },
  { id: 'refund', name: 'Reembolso', type: 'income', emoji: '🔄' },
  { id: 'interest-income', name: 'Juros', type: 'income', emoji: '🏦' },
];

// ── EXPENSE ──
const EXPENSE_CATEGORIES: CategoryDefinition[] = [
  // Housing
  { id: 'housing', name: 'Moradia', type: 'expense', emoji: '🏠' },
  { id: 'housing-rent', name: 'Aluguel', type: 'expense', parentId: 'housing', emoji: '🏠' },
  { id: 'housing-maintenance', name: 'Manutenção', type: 'expense', parentId: 'housing', emoji: '🔧' },
  // Food
  { id: 'food', name: 'Alimentação', type: 'expense', emoji: '🍔' },
  { id: 'food-groceries', name: 'Supermercado', type: 'expense', parentId: 'food', emoji: '🛒' },
  { id: 'food-restaurants', name: 'Restaurantes', type: 'expense', parentId: 'food', emoji: '🍽️' },
  { id: 'food-delivery', name: 'Delivery', type: 'expense', parentId: 'food', emoji: '📦' },
  // Transport
  { id: 'transport', name: 'Transporte', type: 'expense', emoji: '🚗' },
  { id: 'transport-fuel', name: 'Combustível', type: 'expense', parentId: 'transport', emoji: '⛽' },
  { id: 'transport-public', name: 'Transporte Público', type: 'expense', parentId: 'transport', emoji: '🚌' },
  { id: 'transport-ride', name: 'Apps de Corrida', type: 'expense', parentId: 'transport', emoji: '🚕' },
  // Health
  { id: 'health', name: 'Saúde', type: 'expense', emoji: '💊' },
  { id: 'health-pharmacy', name: 'Farmácia', type: 'expense', parentId: 'health', emoji: '💊' },
  { id: 'health-medical', name: 'Consultas', type: 'expense', parentId: 'health', emoji: '🏥' },
  // Leisure
  { id: 'leisure', name: 'Lazer', type: 'expense', emoji: '🎮' },
  { id: 'leisure-entertainment', name: 'Entretenimento', type: 'expense', parentId: 'leisure', emoji: '🎬' },
  { id: 'leisure-travel', name: 'Viagens', type: 'expense', parentId: 'leisure', emoji: '✈️' },
  // Subscriptions
  { id: 'subscriptions', name: 'Assinaturas', type: 'expense', emoji: '📱' },
  { id: 'subscriptions-streaming', name: 'Streaming', type: 'expense', parentId: 'subscriptions', emoji: '📺' },
  { id: 'subscriptions-apps', name: 'Apps', type: 'expense', parentId: 'subscriptions', emoji: '📲' },
  // Others
  { id: 'taxes', name: 'Impostos', type: 'expense', emoji: '🧾' },
  { id: 'debt', name: 'Dívidas / Empréstimos', type: 'expense', emoji: '💳' },
  { id: 'shopping', name: 'Compras', type: 'expense', emoji: '🛍️' },
  { id: 'education', name: 'Educação', type: 'expense', emoji: '📚' },
  { id: 'others-expense', name: 'Outros', type: 'expense', emoji: '📦' },
];

// ── INVESTMENT ──
const INVESTMENT_CATEGORIES: CategoryDefinition[] = [
  { id: 'stocks', name: 'Ações', type: 'investment', emoji: '📊' },
  { id: 'crypto', name: 'Criptomoedas', type: 'investment', emoji: '🪙' },
  { id: 'real-estate', name: 'Imóveis', type: 'investment', emoji: '🏗️' },
  { id: 'fixed-income', name: 'Renda Fixa', type: 'investment', emoji: '🏦' },
  { id: 'emergency-fund', name: 'Reserva de Emergência', type: 'investment', emoji: '🛡️' },
  { id: 'retirement', name: 'Aposentadoria', type: 'investment', emoji: '🏖️' },
  { id: 'business-investment', name: 'Investimento Empresarial', type: 'investment', emoji: '🏢' },
];

export const ALL_CATEGORIES: CategoryDefinition[] = [
  ...INCOME_CATEGORIES,
  ...EXPENSE_CATEGORIES,
  ...INVESTMENT_CATEGORIES,
];

/** Get only top-level categories for a given type */
export function getMainCategories(type: CategoryType): CategoryDefinition[] {
  return ALL_CATEGORIES.filter(c => c.type === type && !c.parentId);
}

/** Get subcategories for a given parent category id */
export function getSubCategories(parentId: string): CategoryDefinition[] {
  return ALL_CATEGORIES.filter(c => c.parentId === parentId);
}

/** Find a category by its id */
export function getCategoryById(id: string): CategoryDefinition | undefined {
  return ALL_CATEGORIES.find(c => c.id === id);
}

/** Get the parent category for a subcategory */
export function getParentCategory(categoryId: string): CategoryDefinition | undefined {
  const cat = getCategoryById(categoryId);
  if (cat?.parentId) return getCategoryById(cat.parentId);
  return undefined;
}

/** Get display label for a category (with parent if subcategory) */
export function getCategoryDisplayLabel(categoryId: string, subCategoryId?: string | null): string {
  const main = getCategoryById(categoryId);
  if (!main) return categoryId; // fallback for legacy
  if (subCategoryId) {
    const sub = getCategoryById(subCategoryId);
    if (sub) return `${main.name} → ${sub.name}`;
  }
  return main.name;
}

/** Get emoji for a category */
export function getCategoryEmoji(categoryId: string, subCategoryId?: string | null): string {
  if (subCategoryId) {
    const sub = getCategoryById(subCategoryId);
    if (sub?.emoji) return sub.emoji;
  }
  const cat = getCategoryById(categoryId);
  return cat?.emoji ?? '📦';
}

/**
 * Map legacy category names (from old system) to new category IDs.
 * All legacy categories are treated as expense type.
 */
const LEGACY_MAP: Record<string, string> = {
  'Alimentação': 'food',
  'Transporte': 'transport',
  'Moradia': 'housing',
  'Lazer': 'leisure',
  'Saúde': 'health',
  'Educação': 'education',
  'Outros': 'others-expense',
};

export function migrateLegacyCategory(oldCategory: string): { category: string; type: CategoryType } {
  const mapped = LEGACY_MAP[oldCategory];
  if (mapped) {
    return { category: mapped, type: 'expense' };
  }
  // If it's already a valid category ID, keep it
  const existing = getCategoryById(oldCategory);
  if (existing) return { category: existing.id, type: existing.type };
  // Fallback
  return { category: 'others-expense', type: 'expense' };
}
