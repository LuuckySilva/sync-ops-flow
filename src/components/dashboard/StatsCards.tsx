import { Users, Clock, UtensilsCrossed, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const stats = [
  {
    title: "Funcionários Ativos",
    value: "24",
    change: "+2 este mês",
    icon: Users,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    title: "Horas Trabalhadas",
    value: "1.856",
    change: "Este mês",
    icon: Clock,
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    title: "Refeições Servidas",
    value: "486",
    change: "Este mês",
    icon: UtensilsCrossed,
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    title: "Custo Total",
    value: "R$ 48.5k",
    change: "+5% vs mês anterior",
    icon: TrendingUp,
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
];

export const StatsCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="relative overflow-hidden hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <h3 className="text-3xl font-bold mt-2 text-foreground">
                    {stat.value}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.change}
                  </p>
                </div>
                <div className={`${stat.bgColor} ${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
