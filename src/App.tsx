import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FinanceProvider } from "@/contexts/FinanceContext";
import { GoalsProvider } from "@/contexts/GoalsContext";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Gastos from "@/pages/Gastos";
import Vendas from "@/pages/Vendas";
import Investimentos from "@/pages/Investimentos";
import Metas from "@/pages/Metas";
import Patrimonio from "@/pages/Patrimonio";
import Relatorios from "@/pages/Relatorios";
import EngenhariaRiqueza from "@/pages/EngenhariaRiqueza";
import Convites from "@/pages/Convites";
import Conquistas from "@/pages/Conquistas";
import Orcamentos from "@/pages/Orcamentos";
import Planilha from "@/pages/Planilha";
import Login from "@/pages/Login";
import Cadastro from "@/pages/Cadastro";
import ResetSenha from "@/pages/ResetSenha";
import ResetPassword from "@/pages/ResetPassword";
import Aterrissagem from "@/pages/Aterrissagem";
import PaymentSuccess from "@/pages/PaymentSuccess";
import PaymentPending from "@/pages/PaymentPending";
import PaymentFailure from "@/pages/PaymentFailure";
import MinhaAssinatura from "@/pages/MinhaAssinatura";
import Suporte from "@/pages/Suporte";
import Configuracoes from "@/pages/Configuracoes";
import PerfilProfissional from "@/pages/PerfilProfissional";
import Catalogo from "@/pages/Catalogo";
import Admin from "@/pages/Admin";
import AdminRoute from "@/components/AdminRoute";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <FinanceProvider>
        <GoalsProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/landing" element={<Aterrissagem />} />
              <Route path="/login" element={<Login />} />
              <Route path="/cadastro" element={<Cadastro />} />
              <Route path="/reset-senha" element={<ResetSenha />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/payment-pending" element={<PaymentPending />} />
              <Route path="/payment-failure" element={<PaymentFailure />} />

              {/* Protected routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/gastos" element={<Gastos />} />
                  <Route path="/vendas" element={<Vendas />} />
                  <Route path="/investimentos" element={<Investimentos />} />
                  <Route path="/metas" element={<Metas />} />
                  <Route path="/patrimonio" element={<Patrimonio />} />
                  <Route path="/relatorios" element={<Relatorios />} />
                  <Route path="/engenharia" element={<EngenhariaRiqueza />} />
                  <Route path="/convites" element={<Convites />} />
                  <Route path="/conquistas" element={<Conquistas />} />
                  <Route path="/orcamentos" element={<Orcamentos />} />
                  <Route path="/planilha" element={<Planilha />} />
                  <Route path="/minha-assinatura" element={<MinhaAssinatura />} />
                  <Route path="/suporte" element={<Suporte />} />
                  <Route path="/configuracoes" element={<Configuracoes />} />
                  <Route path="/perfil-profissional" element={<PerfilProfissional />} />
                  <Route path="/catalogo" element={<Catalogo />} />

                  {/* Admin routes */}
                  <Route element={<AdminRoute />}>
                    <Route path="/admin" element={<Admin />} />
                  </Route>
                </Route>
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </GoalsProvider>
        </FinanceProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
