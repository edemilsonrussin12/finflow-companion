import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CreditCard } from 'lucide-react';

export interface PaymentMethodEntry {
  type: string;
  installments?: number;
}

const PAYMENT_OPTIONS = [
  { key: 'pix', label: 'PIX' },
  { key: 'cash', label: 'Dinheiro' },
  { key: 'debit', label: 'Cartão Débito' },
  { key: 'credit', label: 'Cartão Crédito' },
  { key: 'transfer', label: 'Transferência' },
  { key: 'boleto', label: 'Boleto' },
] as const;

const INSTALLMENT_OPTIONS = Array.from({ length: 12 }, (_, i) => i + 1);

interface Props {
  methods: PaymentMethodEntry[];
  onChange: (methods: PaymentMethodEntry[]) => void;
}

export function getPaymentLabel(key: string): string {
  return PAYMENT_OPTIONS.find(p => p.key === key)?.label ?? key;
}

export function formatPaymentMethods(methods: PaymentMethodEntry[]): string {
  if (!methods || methods.length === 0) return '';
  return methods.map(m => {
    const label = getPaymentLabel(m.type);
    if (m.type === 'credit' && m.installments && m.installments > 1) {
      return `${label} - ${m.installments}x`;
    }
    return label;
  }).join(', ');
}

export function parsePaymentMethodsFromDb(dbValue: string | null): PaymentMethodEntry[] {
  if (!dbValue) return [];
  // Try JSON first (new format)
  try {
    const parsed = JSON.parse(dbValue);
    if (Array.isArray(parsed)) return parsed;
  } catch {}
  // Legacy: single string value like "Pix" or "Cartão"
  const legacyMap: Record<string, string> = {
    'Pix': 'pix', 'Dinheiro': 'cash', 'Cartão': 'credit',
    'Transferência': 'transfer', 'Outros': 'boleto',
  };
  const key = legacyMap[dbValue] || dbValue;
  return [{ type: key }];
}

export function serializePaymentMethods(methods: PaymentMethodEntry[]): string {
  if (methods.length === 0) return '';
  return JSON.stringify(methods);
}

export default function BudgetPaymentMethods({ methods, onChange }: Props) {
  const selectedKeys = new Set(methods.map(m => m.type));
  const creditEntry = methods.find(m => m.type === 'credit');

  function toggleMethod(key: string) {
    if (selectedKeys.has(key)) {
      onChange(methods.filter(m => m.type !== key));
    } else {
      const entry: PaymentMethodEntry = { type: key };
      if (key === 'credit') entry.installments = 1;
      onChange([...methods, entry]);
    }
  }

  function setInstallments(value: number) {
    onChange(methods.map(m => m.type === 'credit' ? { ...m, installments: value } : m));
  }

  return (
    <div className="space-y-3">
      <Label className="text-xs font-medium text-muted-foreground">Formas de pagamento</Label>
      <div className="space-y-2">
        {PAYMENT_OPTIONS.map(opt => (
          <label key={opt.key} className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={selectedKeys.has(opt.key)}
              onCheckedChange={() => toggleMethod(opt.key)}
            />
            <span className="text-sm">{opt.label}</span>
          </label>
        ))}
      </div>

      {/* Credit card installments */}
      {selectedKeys.has('credit') && (
        <div className="pl-6 space-y-1.5">
          <Label className="text-xs text-muted-foreground flex items-center gap-1">
            <CreditCard size={12} /> Parcelas
          </Label>
          <Select
            value={String(creditEntry?.installments ?? 1)}
            onValueChange={v => setInstallments(Number(v))}
          >
            <SelectTrigger className="h-9 w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INSTALLMENT_OPTIONS.map(n => (
                <SelectItem key={n} value={String(n)}>{n}x</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Selected summary tags */}
      {methods.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {methods.map(m => (
            <Badge key={m.type} variant="secondary" className="text-[11px]">
              {getPaymentLabel(m.type)}
              {m.type === 'credit' && m.installments && m.installments > 1 && ` (${m.installments}x)`}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
