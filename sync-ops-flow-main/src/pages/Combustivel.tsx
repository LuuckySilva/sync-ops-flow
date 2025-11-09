import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Fuel, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Combustivel() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Controle de Combustível</h2>
        <p className="text-sm text-muted-foreground">
          Gestão de abastecimentos e consumo
        </p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Módulo em Desenvolvimento</AlertTitle>
        <AlertDescription>
          Este módulo está sendo desenvolvido e estará disponível em breve.
          Funcionalidades previstas: registro de abastecimentos, controle de consumo por veículo.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-green-50">
              <Fuel className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <CardTitle>Funcionalidades Planejadas</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Registro de abastecimentos por veículo/equipamento</li>
            <li>• Controle de custos de combustível</li>
            <li>• Análise de consumo médio</li>
            <li>• Relatórios por período</li>
            <li>• Alertas de consumo anormal</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
