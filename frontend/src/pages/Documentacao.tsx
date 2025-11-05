import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Documentacao() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Gestão de Documentação</h2>
        <p className="text-sm text-muted-foreground">
          Controle de documentos e assinaturas
        </p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Módulo em Desenvolvimento</AlertTitle>
        <AlertDescription>
          Este módulo está sendo desenvolvido e estará disponível em breve.
          Funcionalidades previstas: gestão de contratos, termos, documentos pendentes.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-blue-50">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <CardTitle>Funcionalidades Planejadas</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Gestão de contratos de trabalho</li>
            <li>• Termos de responsabilidade</li>
            <li>• Acordos de compensação de horas</li>
            <li>• Ordens de serviço</li>
            <li>• Controle de assinaturas digitais</li>
            <li>• Histórico de documentos por funcionário</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
