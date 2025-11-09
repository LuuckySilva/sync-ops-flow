import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, FileUp, FileText, Download } from "lucide-react";

const actions = [
  {
    icon: UserPlus,
    label: "Novo Funcionário",
    description: "Cadastrar funcionário",
    variant: "default" as const,
  },
  {
    icon: FileUp,
    label: "Upload de Planilha",
    description: "Importar dados",
    variant: "outline" as const,
  },
  {
    icon: FileText,
    label: "Gerar Documento",
    description: "Templates padrão",
    variant: "outline" as const,
  },
  {
    icon: Download,
    label: "Exportar Relatório",
    description: "Fechamento mensal",
    variant: "outline" as const,
  },
];

export const QuickActions = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ações Rápidas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.label}
              variant={action.variant}
              className="w-full justify-start gap-3 h-auto py-4"
            >
              <div className="flex items-center gap-3 flex-1 text-left">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium">{action.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {action.description}
                  </div>
                </div>
              </div>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
};
