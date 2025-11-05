import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Materiais() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Controle de Materiais</h2>
        <p className="text-sm text-muted-foreground">
          Gestão de estoque e requisições
        </p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Módulo em Desenvolvimento</AlertTitle>
        <AlertDescription>
          Este módulo está sendo desenvolvido e estará disponível em breve.
          Funcionalidades previstas: controle de estoque, requisições, relatórios de consumo.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-purple-50">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <CardTitle>Funcionalidades Planejadas</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Controle de entrada e saída de materiais</li>
            <li>• Requisições de materiais por setor</li>
            <li>• Alertas de estoque mínimo</li>
            <li>• Relatórios de consumo por categoria</li>
            <li>• Histórico de movimentações</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
