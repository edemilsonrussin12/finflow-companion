import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { DiscountType, CardType, PaymentMethod } from '@/types/finance';

interface PaymentState {
  hasDiscount: boolean;
  discountType: DiscountType;
  discountValue: number;
  discountReason: string;
  paymentMethod: PaymentMethod | '';
  cardType: CardType;
  installments: number;
  cardFee: number;
  paymentInterest: number;
}

interface Props {
  amount: number;
  state: PaymentState;
  onChange: (s: PaymentState) => void;
}

const PAYMENT_LABELS: Record<string, string> = {
  pix: 'PIX',
  cash: 'Dinheiro',
  debit: 'Cartão Débito',
  credit: 'Cartão Crédito',
  transfer: 'Transferência',
  boleto: 'Boleto',
};

export type { PaymentState };

export function calcNetAmount(amount: number, state: PaymentState): { discountAmount: number; netAmount: number } {
  let discountAmount = 0;
  if (state.hasDiscount && state.discountValue > 0) {
    discountAmount = state.discountType === 'percentage'
      ? amount * (state.discountValue / 100)
      : state.discountValue;
  }
  const afterDiscount = Math.max(0, amount - discountAmount);
  const feeAmount = state.cardFee > 0 ? afterDiscount * (state.cardFee / 100) : 0;
  const netAmount = Math.max(0, afterDiscount - feeAmount - state.paymentInterest);
  return { discountAmount, netAmount };
}

export function getDefaultPaymentState(): PaymentState {
  return {
    hasDiscount: false,
    discountType: 'percentage',
    discountValue: 0,
    discountReason: '',
    paymentMethod: '',
    cardType: 'credit',
    installments: 1,
    cardFee: 0,
    paymentInterest: 0,
  };
}

export default function PaymentDetails({ amount, state, onChange }: Props) {
  const update = (partial: Partial<PaymentState>) => onChange({ ...state, ...partial });
  const isCard = state.paymentMethod === 'credit' || state.paymentMethod === 'debit';
  const { discountAmount, netAmount } = calcNetAmount(amount, state);
  const hasAnyDeduction = state.hasDiscount || isCard;

  return (
    <div className="space-y-3 border-t border-border pt-3">
      {/* Discount */}
      <div className="flex items-center justify-between">
        <Label>Aplicar desconto?</Label>
        <Switch checked={state.hasDiscount} onCheckedChange={v => update({ hasDiscount: v, discountValue: v ? state.discountValue : 0 })} />
      </div>

      {state.hasDiscount && (
        <div className="space-y-2 pl-1">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Tipo</Label>
              <Select value={state.discountType} onValueChange={v => update({ discountType: v as DiscountType })}>
                <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentual (%)</SelectItem>
                  <SelectItem value="fixed">Valor fixo (R$)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Valor do desconto</Label>
              <Input
                type="number" step="0.01" min="0" className="mt-1 h-9"
                value={state.discountValue || ''} onChange={e => update({ discountValue: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
          <div>
            <Label className="text-xs">Motivo (opcional)</Label>
            <Input className="mt-1 h-9" placeholder="Ex: Cliente fiel" value={state.discountReason} onChange={e => update({ discountReason: e.target.value })} maxLength={100} />
          </div>
        </div>
      )}

      {/* Payment method */}
      <div>
        <Label>Forma de pagamento</Label>
        <Select value={state.paymentMethod} onValueChange={v => update({
          paymentMethod: v as PaymentMethod,
          cardType: (v === 'credit' || v === 'debit') ? (v as CardType) : state.cardType,
          cardFee: (v !== 'credit' && v !== 'debit') ? 0 : state.cardFee,
          paymentInterest: (v !== 'credit' && v !== 'debit') ? 0 : state.paymentInterest,
        })}>
          <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione (opcional)" /></SelectTrigger>
          <SelectContent>
            {Object.entries(PAYMENT_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Card details */}
      {isCard && (
        <div className="space-y-2 pl-1">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Parcelas</Label>
              <Input type="number" min="1" max="24" className="mt-1 h-9" value={state.installments} onChange={e => update({ installments: parseInt(e.target.value) || 1 })} />
            </div>
            <div>
              <Label className="text-xs">Taxa maquininha (%)</Label>
              <Input type="number" step="0.01" min="0" className="mt-1 h-9" value={state.cardFee || ''} onChange={e => update({ cardFee: parseFloat(e.target.value) || 0 })} />
            </div>
          </div>
          <div>
            <Label className="text-xs">Juros pagos (R$)</Label>
            <Input type="number" step="0.01" min="0" className="mt-1 h-9" value={state.paymentInterest || ''} onChange={e => update({ paymentInterest: parseFloat(e.target.value) || 0 })} />
          </div>
        </div>
      )}

      {/* Summary */}
      {hasAnyDeduction && amount > 0 && (
        <div className="bg-muted/50 rounded-lg p-3 space-y-1 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Valor bruto</span><span>R$ {amount.toFixed(2)}</span></div>
          {state.hasDiscount && discountAmount > 0 && (
            <div className="flex justify-between text-orange-500"><span>Desconto</span><span>- R$ {discountAmount.toFixed(2)}</span></div>
          )}
          {isCard && state.cardFee > 0 && (
            <div className="flex justify-between text-orange-500"><span>Taxa cartão ({state.cardFee}%)</span><span>- R$ {((amount - discountAmount) * state.cardFee / 100).toFixed(2)}</span></div>
          )}
          {isCard && state.paymentInterest > 0 && (
            <div className="flex justify-between text-orange-500"><span>Juros</span><span>- R$ {state.paymentInterest.toFixed(2)}</span></div>
          )}
          <div className="flex justify-between font-semibold border-t border-border pt-1"><span>Valor líquido</span><span className="text-primary">R$ {netAmount.toFixed(2)}</span></div>
        </div>
      )}
    </div>
  );
}
