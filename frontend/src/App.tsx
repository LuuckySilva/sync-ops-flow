import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Alimentacao from "./pages/Alimentacao";
import Materiais from "./pages/Materiais";
import Combustivel from "./pages/Combustivel";
import Documentacao from "./pages/Documentacao";
import Configuracoes from "./pages/Configuracoes";
import NotFound from "./pages/NotFound";
import { DashboardLayout } from "./components/layout/DashboardLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/funcionarios" element={<Index />} />
          <Route path="/frequencia" element={<Index />} />
          <Route path="/relatorios" element={<Index />} />
          <Route path="/alimentacao" element={<DashboardLayout><Alimentacao /></DashboardLayout>} />
          <Route path="/materiais" element={<DashboardLayout><Materiais /></DashboardLayout>} />
          <Route path="/combustivel" element={<DashboardLayout><Combustivel /></DashboardLayout>} />
          <Route path="/documentacao" element={<DashboardLayout><Documentacao /></DashboardLayout>} />
          <Route path="/configuracoes" element={<DashboardLayout><Configuracoes /></DashboardLayout>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
