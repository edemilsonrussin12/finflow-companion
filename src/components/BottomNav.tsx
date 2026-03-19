import { LayoutDashboard, Wallet, ClipboardList, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const mainTabs = [
  { path: '/', icon: LayoutDashboard, label: 'Início' },
  { path: '/financas', icon: Wallet, label: 'Finanças' },
  { path: '/orcamentos', icon: ClipboardList, label: 'Orçamentos' },
  { path: '/perfil-profissional', icon: User, label: 'Perfil' },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const financePaths = ['/financas', '/gastos', '/investimentos', '/patrimonio', '/vendas', '/metas', '/relatorios', '/planilha'];
  const budgetPaths = ['/orcamentos', '/clientes', '/catalogo'];
  const profilePaths = ['/perfil-profissional', '/conquistas', '/convites', '/minha-assinatura', '/configuracoes', '/admin'];

  const isFinanceActive = financePaths.some(p => location.pathname === p || location.pathname.startsWith(p + '/'));
  const isBudgetActive = budgetPaths.some(p => location.pathname === p || location.pathname.startsWith(p + '/'));
  const isProfileActive = profilePaths.some(p => location.pathname === p || location.pathname.startsWith(p + '/'));

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass border-t border-border/50">
      <div className="flex items-center justify-around h-16 max-w-lg md:max-w-3xl lg:max-w-5xl mx-auto">
        {mainTabs.map(tab => {
          const active = tab.path === '/financas'
            ? isFinanceActive
            : tab.path === '/orcamentos'
              ? isBudgetActive
              : tab.path === '/perfil-profissional'
                ? isProfileActive
                : location.pathname === tab.path;
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
      </div>
    </nav>
  );
}
