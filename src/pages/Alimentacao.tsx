import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UtensilsCrossed, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Alimentacao() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Controle de Alimentação</h2>
        <p className="text-sm text-muted-foreground">
          Gestão de refeições e custos
        </p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Módulo em Desenvolvimento</AlertTitle>
        <AlertDescription>
          Este módulo está sendo desenvolvido e estará disponível em breve.
          Funcionalidades previstas: registro de refeições, controle de custos, relatórios de alimentação.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-orange-50">
              <UtensilsCrossed className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <CardTitle>Funcionalidades Planejadas</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Registro de café da manhã e almoço</li>
            <li>• Controle de custos por funcionário</li>
            <li>• Gestão de fornecedores</li>
            <li>• Relatórios mensais de gastos</li>
            <li>• Histórico de refeições</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
