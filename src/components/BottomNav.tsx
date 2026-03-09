import { useState } from 'react';
import { LayoutDashboard, Receipt, Target, FileText, MoreHorizontal, LineChart, TrendingUp, ShoppingBag, Sparkles, Users } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

const mainTabs = [
  { path: '/', icon: LayoutDashboard, label: 'Início' },
  { path: '/gastos', icon: Receipt, label: 'Gastos' },
  { path: '/metas', icon: Target, label: 'Metas' },
  { path: '/relatorios', icon: FileText, label: 'Relatórios' },
];

const moreTabs = [
  { path: '/patrimonio', icon: LineChart, label: 'Patrimônio' },
  { path: '/investimentos', icon: TrendingUp, label: 'Investimentos' },
  { path: '/vendas', icon: ShoppingBag, label: 'Vendas' },
  { path: '/engenharia', icon: Sparkles, label: 'Engenharia da Riqueza' },
  { path: '/minha-assinatura', icon: Crown, label: 'Minha Assinatura' },
  { path: '/convites', icon: Users, label: 'Convites' },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [moreOpen, setMoreOpen] = useState(false);

  const isMoreActive = moreTabs.some(t => t.path === location.pathname);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 glass border-t border-border/50">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
          {mainTabs.map(tab => {
            const active = location.pathname === tab.path;
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                  active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <tab.icon size={20} strokeWidth={active ? 2.5 : 1.5} />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            );
          })}
          <button
            onClick={() => setMoreOpen(true)}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
              isMoreActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <MoreHorizontal size={20} strokeWidth={isMoreActive ? 2.5 : 1.5} />
            <span className="text-[10px] font-medium">Mais</span>
          </button>
        </div>
      </nav>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl px-6 pb-8 pt-4">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-sm font-semibold text-center">Mais opções</SheetTitle>
          </SheetHeader>
          <div className="grid grid-cols-2 gap-3">
            {moreTabs.map(tab => {
              const active = location.pathname === tab.path;
              return (
                <button
                  key={tab.path}
                  onClick={() => { navigate(tab.path); setMoreOpen(false); }}
                  className={`flex items-center gap-3 p-4 rounded-xl transition-all ${
                    active
                      ? 'bg-primary/10 text-primary'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <tab.icon size={20} strokeWidth={active ? 2.5 : 1.5} />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
