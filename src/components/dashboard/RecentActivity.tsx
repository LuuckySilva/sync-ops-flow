import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, User, FileText, AlertCircle } from "lucide-react";

const activities = [
  {
    type: "user",
    icon: User,
    message: "Novo funcionário cadastrado: Rafael Amaro Nogueira",
    time: "Há 2 horas",
    badge: "Funcionários",
    variant: "default" as const,
  },
  {
    type: "time",
    icon: Clock,
    message: "Ponto registrado sem saída para 3 funcionários",
    time: "Há 4 horas",
    badge: "Alerta",
    variant: "destructive" as const,
  },
  {
    type: "document",
    icon: FileText,
    message: "5 documentos gerados e aguardando assinatura",
    time: "Há 5 horas",
    badge: "Documentação",
    variant: "secondary" as const,
  },
  {
    type: "upload",
    icon: AlertCircle,
    message: "Planilha de alimentação de outubro importada",
    time: "Há 1 dia",
    badge: "Alimentação",
    variant: "outline" as const,
  },
];

export const RecentActivity = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividades Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => {
            const Icon = activity.icon;
            return (
              <div
                key={index}
                className="flex items-start gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="p-2 rounded-lg bg-primary/10">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    {activity.message}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant={activity.variant} className="text-xs">
                      {activity.badge}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {activity.time}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
