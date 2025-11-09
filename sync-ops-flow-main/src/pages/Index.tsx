import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DashboardHome } from "@/components/dashboard/DashboardHome";
import { FuncionariosTable } from "@/components/funcionarios/FuncionariosTable";
import { FrequenciaTable } from "@/components/frequencia/FrequenciaTable";
import { AlimentacaoTable } from "@/components/alimentacao/AlimentacaoTable";
import { MateriaisTable } from "@/components/materiais/MateriaisTable";
import { CombustivelTable } from "@/components/combustivel/CombustivelTable";
import { DocumentacaoList } from "@/components/documentacao/DocumentacaoList";
import { RelatoriosView } from "@/components/relatorios/RelatoriosView";
import { useLocation } from "react-router-dom";

const Index = () => {
  const location = useLocation();
  
  const renderContent = () => {
    switch (location.pathname) {
      case "/funcionarios":
        return <FuncionariosTable />;
      case "/frequencia":
        return <FrequenciaTable />;
      case "/alimentacao":
        return <AlimentacaoTable />;
      case "/materiais":
        return <MateriaisTable />;
      case "/combustivel":
        return <CombustivelTable />;
      case "/documentacao":
        return <DocumentacaoList />;
      case "/relatorios":
        return <RelatoriosView />;
      default:
        return <DashboardHome />;
    }
  };

  return (
    <DashboardLayout>
      {renderContent()}
    </DashboardLayout>
  );
};

export default Index;
