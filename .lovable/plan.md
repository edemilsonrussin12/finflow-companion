

## Plano de Estabilidade e Autenticação (Mock)

### 1. Corrigir build error em Login.tsx
- Arquivo tem uma `}` extra na linha 10 causando o erro TS1128. Reescrever o arquivo corretamente.

### 2. Corrigir problema de overlay/tela escurecendo

**TransactionForm.tsx e SaleForm.tsx** usam overlays manuais (`fixed inset-0 z-50`) em vez dos componentes Radix (Dialog/Sheet) que gerenciam cleanup automaticamente.

- Converter `TransactionForm` e `SaleForm` para usar o componente `Sheet` (bottom sheet) ou `Dialog`, que automaticamente remove overlay e restaura `overflow` do body ao fechar.
- Adicionar um efeito de cleanup global em `AppLayout` que, ao trocar de rota, fecha qualquer estado de formulário aberto.
- Em `index.css`, substituir `backdrop-blur-xl` no utilitário `.glass` por uma alternativa mais segura para Android (opacidade sólida como fallback via `@supports`).
- Usar `100dvh` em vez de `100vh` para altura em containers mobile.

### 3. Páginas de autenticação (mock com localStorage)

Criar um `AuthContext` simples que:
- Armazena estado `isAuthenticated` e `user` (email) em `localStorage`
- Fornece `login(email, password)`, `signup(email, password)`, `logout()`, `resetPassword(email)`
- Login/signup apenas validam campos e salvam no localStorage (sem backend)

**Páginas:**
- **`src/pages/Login.tsx`** — campos email/senha, botão Entrar, links para Cadastro e Esqueci senha
- **`src/pages/Cadastro.tsx`** — email, senha, confirmar senha, validação de match, botão Criar conta
- **`src/pages/ResetSenha.tsx`** — campo email, botão enviar, mensagem de confirmação

**Estilo:** mesmo design dark/glass do app, mobile-first, consistente com o resto.

### 4. Rotas e proteção

- Criar componente `ProtectedRoute` que verifica `isAuthenticated` do `AuthContext` e redireciona para `/login`
- Atualizar `App.tsx`:
  - Rotas públicas: `/login`, `/cadastro`, `/reset-senha`
  - Rotas protegidas: `/`, `/gastos`, `/vendas`, `/investimentos`
  - Redirecionar `/login` → `/` se já autenticado
- Adicionar botão de logout no Dashboard (header)

### 5. Consistência financeira e UX mobile

- Verificar que `formatCurrency` já usa `pt-BR` com `BRL` (já está correto)
- Garantir `max-w-full overflow-x-hidden` no container principal
- Nos gráficos Recharts, usar `ResponsiveContainer width="100%"` (já feito) e limitar `outerRadius` proporcionalmente
- Adicionar validação visual (toast de erro) quando campos obrigatórios estão vazios no `TransactionForm` e `SaleForm`

### Estrutura de arquivos

```text
src/
├── contexts/
│   ├── FinanceContext.tsx  (sem alteração)
│   └── AuthContext.tsx     (novo - mock auth)
├── components/
│   ├── AppLayout.tsx       (editar - cleanup de rota)
│   ├── ProtectedRoute.tsx  (novo)
│   ├── TransactionForm.tsx (editar - usar Dialog/Sheet)
│   └── SaleForm.tsx        (editar - usar Dialog/Sheet)
├── pages/
│   ├── Login.tsx           (reescrever)
│   ├── Cadastro.tsx        (novo)
│   ├── ResetSenha.tsx      (novo)
│   └── Dashboard.tsx       (editar - botão logout)
├── App.tsx                 (editar - rotas)
└── index.css               (editar - dvh, fallback backdrop)
```

