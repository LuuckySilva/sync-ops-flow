import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, FileText, Calendar, Loader2, BarChart3, TrendingUp } from "lucide-react";
import { api } from "@/services/api";
import { toast } from "sonner";

const relatoriosTipos = [
  {
    titulo: "Relatório de Frequência",
    descricao: "Horas trabalhadas e presenças por funcionário",
    icon: Calendar,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    tipo: "frequencia"
  },
  {
    titulo: "Relatório Geral",
    descricao: "Consolidação de todos os indicadores do período",
    icon: BarChart3,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    tipo: "geral"
  },
  {
    titulo: "Análise de Desempenho",
    descricao: "Métricas de produtividade e eficiência",
    icon: TrendingUp,
    color: "text-green-600",
    bgColor: "bg-green-50",
    tipo: "desempenho"
  }
];

export const RelatoriosView = () => {
  const [dataInicio, setDataInicio] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  );
  const [dataFim, setDataFim] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState<string | null>(null);

  const gerarRelatorio = async (tipo: string, titulo: string) => {
    setLoading(tipo);
    try {
      const response = await api.relatorios.gerar({
        tipo: tipo as any,
        data_inicio: dataInicio,
        data_fim: dataFim,
      });

      console.log(`Relatório ${titulo}:`, response);
      
      // Criar um blob e fazer download
      const dataStr = JSON.stringify(response, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `relatorio-${tipo}-${dataInicio}-a-${dataFim}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Relatório "${titulo}" gerado com sucesso!`);
    } catch (error: any) {
      console.error('Erro ao gerar relatório:', error);
      if (error.status === 501) {
        toast.warning(`Relatório "${titulo}" em desenvolvimento`);
      } else {
        toast.error(`Erro ao gerar relatório: ${error.detail || 'Erro desconhecido'}`);
      }
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Relatórios</h2>
        <p className="text-sm text-muted-foreground">
          Gere e exporte relatórios consolidados do sistema
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros de Período</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Data Início</label>
              <Input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Data Fim</label>
              <Input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {relatoriosTipos.map((relatorio) => {
          const Icon = relatorio.icon;
          const isLoading = loading === relatorio.tipo;
          
          return (
            <Card key={relatorio.titulo} className="hover:shadow-lg transition-shadow border-l-4 border-l-primary">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-lg ${relatorio.bgColor}`}>
                    <Icon className={`w-6 h-6 ${relatorio.color}`} />
                  </div>
                </div>
                <CardTitle className="text-lg mt-4">{relatorio.titulo}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {relatorio.descricao}
                </p>
                <Button 
                  className="w-full gap-2"
                  onClick={() => gerarRelatorio(relatorio.tipo, relatorio.titulo)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Gerar Relatório
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
