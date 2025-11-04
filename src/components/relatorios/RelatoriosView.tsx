import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, Calendar } from "lucide-react";

const relatoriosTipos = [
  {
    titulo: "Fechamento Mensal de Alimentação",
    descricao: "Relatório consolidado de refeições e custos por fornecedor",
    icon: FileText,
    color: "text-primary"
  },
  {
    titulo: "Relatório de Frequência",
    descricao: "Horas trabalhadas, faltas e banco de horas por funcionário",
    icon: Calendar,
    color: "text-accent"
  },
  {
    titulo: "Consumo de Materiais",
    descricao: "Gastos com materiais por setor e categoria",
    icon: FileText,
    color: "text-success"
  },
  {
    titulo: "Controle de Combustível",
    descricao: "Litros consumidos e custos por equipamento",
    icon: FileText,
    color: "text-warning"
  },
  {
    titulo: "Documentação Pendente",
    descricao: "Lista de documentos aguardando assinatura",
    icon: FileText,
    color: "text-destructive"
  },
  {
    titulo: "Relatório Geral Operacional",
    descricao: "Consolidação de todos os indicadores do período",
    icon: FileText,
    color: "text-primary"
  }
];

export const RelatoriosView = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Relatórios</h2>
        <p className="text-sm text-muted-foreground">
          Gere e exporte relatórios consolidados do sistema
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {relatoriosTipos.map((relatorio) => {
          const Icon = relatorio.icon;
          return (
            <Card key={relatorio.titulo} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-lg bg-primary/10 ${relatorio.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
                <CardTitle className="text-lg mt-4">{relatorio.titulo}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {relatorio.descricao}
                </p>
                <Button className="w-full gap-2">
                  <Download className="w-4 h-4" />
                  Gerar Relatório
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros de Período</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Data Início</label>
              <input
                type="date"
                className="w-full mt-1 px-3 py-2 border rounded-lg"
                defaultValue="2025-01-01"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Data Fim</label>
              <input
                type="date"
                className="w-full mt-1 px-3 py-2 border rounded-lg"
                defaultValue="2025-01-31"
              />
            </div>
            <div className="flex items-end">
              <Button className="w-full">
                Aplicar Filtro
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
